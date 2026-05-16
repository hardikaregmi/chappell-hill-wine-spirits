/**
 * One-time: cache TheCocktailDB category placeholders into public/ingredients/.
 * Run: node scripts/cache-category-ingredients.mjs
 */
import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../public/ingredients");

const INGREDIENTS = [
  "vodka",
  "whiskey",
  "wine",
  "tequila",
  "rum",
  "gin",
  "schnapps",
  "brandy",
  "champagne",
];

const BASE = "https://www.thecocktaildb.com/images/ingredients";

mkdirSync(OUT, { recursive: true });

for (const name of INGREDIENTS) {
  const url = `${BASE}/${name}-medium.png`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`skip ${name}`);
    continue;
  }
  const file = join(OUT, `${name}.png`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log(`wrote ${name}.png`);
}

console.log("Done — update categoryImages.js to use /ingredients/*.png");
