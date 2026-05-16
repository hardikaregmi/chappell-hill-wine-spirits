import { COCKTAIL_PLACEHOLDERS } from "./cocktailPlaceholders.generated.js";

const RED_WINE_SUBS = new Set(["cabernet", "merlot", "pinot-noir"]);
const WHITE_WINE_SUBS = new Set([
  "chardonnay",
  "pinot-grigio",
  "sauvignon-blanc",
  "moscato",
]);

const RED_WINE_TEXT =
  /cabernet|cab sauv|merlot|pinot noir|malbec|shiraz|syrah|zinfandel|red blend|jammy red|big bold red/i;
const WHITE_WINE_TEXT =
  /chardonnay|pinot grigio|pnt grigio|sauvignon|moscato|riesling|pinot gris|white wine|crisp white|tree free/i;

/** Stable index from product slug. */
function slugIndex(slug, length) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (Math.imul(31, h) + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % length;
}

function pickFromPool(pool, slug) {
  if (!pool?.length) return null;
  return pool[slugIndex(slug, pool.length)];
}

/** @returns {"brown" | "white" | "wineRed" | "wineWhite"} */
export function placeholderKindForProduct(product) {
  const { category, subcategory, slug, name } = product;
  const text = `${slug} ${name || ""}`;

  if (category === "wine") {
    if (subcategory && RED_WINE_SUBS.has(subcategory)) return "wineRed";
    if (subcategory && WHITE_WINE_SUBS.has(subcategory)) return "wineWhite";
    if (RED_WINE_TEXT.test(text)) return "wineRed";
    if (WHITE_WINE_TEXT.test(text)) return "wineWhite";
    return "wineRed";
  }

  if (category === "whiskey" || category === "brandy") return "brown";
  if (
    category === "vodka" ||
    category === "tequila" ||
    category === "gin" ||
    category === "margarita"
  ) {
    return "white";
  }

  if (category === "rum" || category === "liqueurs") return "brown";
  return "brown";
}

/** Category-aware placeholder when no brand logo exists. */
export function cocktailPlaceholderForProduct(product) {
  const kind = placeholderKindForProduct(product);
  const pools = COCKTAIL_PLACEHOLDERS;

  if (typeof pools === "object" && !Array.isArray(pools)) {
    const pool = pools[kind] || pools.brown || [];
    const image = pickFromPool(pool, product.slug);
    if (image) return { image, kind };
  }

  // Legacy flat array fallback
  if (Array.isArray(pools) && pools.length) {
    return { image: pickFromPool(pools, product.slug), kind: "brown" };
  }

  return { image: null, kind };
}
