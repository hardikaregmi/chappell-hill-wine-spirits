/**
 * Category-aware placeholders:
 * - brown cocktails → whiskey / dark spirits
 * - white cocktails → vodka, tequila, gin
 * - wine glass SVGs + wine-forward cocktail photos
 *
 * Run: npm run cocktails:cache
 */
import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COCKTAIL_DIR = join(__dirname, "../public/cocktails");
const GENERATED = join(__dirname, "../src/lib/cocktailPlaceholders.generated.js");

const WINE_RED_SVG = "/placeholders/wine-red.svg";
const WINE_WHITE_SVG = "/placeholders/wine-white.svg";

const BROWN_INGREDIENTS = [
  "Whiskey",
  "Bourbon",
  "Scotch",
  "Brandy",
  "Cognac",
];
const BROWN_SEARCH = [
  "whiskey",
  "bourbon",
  "manhattan",
  "old fashioned",
  "rusty nail",
  "scotch",
];

const WHITE_INGREDIENTS = ["Vodka", "Tequila", "Gin"];
const WHITE_SEARCH = [
  "vodka",
  "martini",
  "margarita",
  "mojito",
  "gimlet",
  "tequila sunrise",
];

const WINE_RED_SEARCH = [
  "sangria",
  "wine punch",
  "mulled wine",
  "kir",
  "port wine",
];
const WINE_WHITE_SEARCH = [
  "bellini",
  "mimosa",
  "champagne",
  "spritz",
  "white wine sangria",
  "wine cooler",
];

const BROWN_NAME =
  /whiskey|whisky|bourbon|scotch|brandy|cognac|manhattan|old fashioned|irish coffee|rusty|rob roy|sazerac|black russian|godfather|boilermaker|allegheny|amaretto|whisky|rye|dark and stormy|rusty nail|mint julep/i;
const WHITE_NAME =
  /vodka|martini|gin |tequila|margarita|mojito|gimlet|collins|fizz|daiquiri|paloma|kamikaze|screwdriver|cosmopolitan|absolut|moscow mule|bay breeze|sea breeze|pina colada|white russian|tom collins|greyhound|harvey wallbanger/i;
const WINE_RED_NAME =
  /sangria|wine punch|mulled wine|port wine|red wine|kir(?! royale)|claret|bordeaux|artillery punch/i;
const WINE_WHITE_NAME =
  /white wine|bellini|mimosa|champagne|spritz|prosecco|wine cooler|kir royale|sauvignon|chardonnay/i;

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchByIngredient(ingredient) {
  const url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.drinks || [];
}

async function fetchSearch(term) {
  const url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(term)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.drinks || [];
}

async function downloadImage(url, dest) {
  const res = await fetch(url);
  if (!res.ok) return false;
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  return true;
}

async function collectDrinks(ingredients, searches, nameFilter) {
  const byId = new Map();
  for (const ing of ingredients) {
    for (const d of await fetchByIngredient(ing)) {
      if (!d?.idDrink || !d?.strDrinkThumb) continue;
      if (nameFilter && !nameFilter(d.strDrink)) continue;
      byId.set(d.idDrink, d);
    }
    await new Promise((r) => setTimeout(r, 90));
  }
  for (const term of searches) {
    for (const d of await fetchSearch(term)) {
      if (!d?.idDrink || !d?.strDrinkThumb) continue;
      if (nameFilter && !nameFilter(d.strDrink)) continue;
      byId.set(d.idDrink, d);
    }
    await new Promise((r) => setTimeout(r, 90));
  }
  return [...byId.values()];
}

async function cachePool(drinks, poolKey, max = 20) {
  for (let i = drinks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [drinks[i], drinks[j]] = [drinks[j], drinks[i]];
  }

  const paths = [];
  for (const drink of drinks.slice(0, max)) {
    const file = `${poolKey}-${slugify(drink.strDrink)}-${drink.idDrink}.jpg`;
    const dest = join(COCKTAIL_DIR, file);
    try {
      if (await downloadImage(drink.strDrinkThumb, dest)) {
        paths.push(`/cocktails/${file}`);
        process.stdout.write(".");
      }
    } catch {
      /* skip */
    }
    await new Promise((r) => setTimeout(r, 60));
  }
  return paths;
}

mkdirSync(COCKTAIL_DIR, { recursive: true });

console.log("Brown cocktails…");
const brownDrinks = await collectDrinks(
  BROWN_INGREDIENTS,
  BROWN_SEARCH,
  (n) => BROWN_NAME.test(n),
);
const brown = await cachePool(brownDrinks, "brown", 24);

console.log("\nWhite/clear cocktails…");
const whiteDrinks = await collectDrinks(
  WHITE_INGREDIENTS,
  WHITE_SEARCH,
  (n) => WHITE_NAME.test(n) && !BROWN_NAME.test(n),
);
const white = await cachePool(whiteDrinks, "white", 24);

console.log("\nRed wine…");
const wineRedDrinks = await collectDrinks(
  ["Red wine", "Port"],
  WINE_RED_SEARCH,
  (n) => WINE_RED_NAME.test(n) && !WINE_WHITE_NAME.test(n),
);
const wineRedPhotos = await cachePool(wineRedDrinks, "wine-red", 12);
const wineRed = [WINE_RED_SVG, ...wineRedPhotos];

console.log("\nWhite wine…");
const wineWhiteDrinks = await collectDrinks(
  ["White wine", "Champagne", "Prosecco"],
  WINE_WHITE_SEARCH,
  (n) => WINE_WHITE_NAME.test(n),
);
const wineWhitePhotos = await cachePool(wineWhiteDrinks, "wine-white", 12);
const wineWhite = [WINE_WHITE_SVG, ...wineWhitePhotos];

const output = { brown, white, wineRed, wineWhite };

writeFileSync(
  GENERATED,
  `/** Generated by npm run cocktails:cache — do not edit */\nexport const COCKTAIL_PLACEHOLDERS = ${JSON.stringify(output, null, 2)};\n`,
);

console.log(
  `\nDone: ${brown.length} brown, ${white.length} white, ${wineRed.length} red wine, ${wineWhite.length} white wine.`,
);
