/**
 * Only these brands may use per-bottle Wikipedia / Open Food Facts photos.
 * All other products use a brand logo from brandImages.generated.js.
 */
export const VERIFIED_BRAND_KEYS = new Set([
  "absolut",
  "seagrams",
  "makersmark",
  "greygoose",
  "canadianclub",
  "canadianmist",
  "crownroyal",
  "evanwilliams",
  "fireball",
  "jackdaniels",
  "jimbeam",
  "franzia",
  "yellowtail",
  "1800",
  "lunazul",
  "malibu",
  "smirnoff",
]);

/** Evan Williams — regular bourbon only (not flavored). */
export const EVAN_WILLIAMS_VERIFIED_SLUGS = new Set([
  "evan-williams-black-label",
  "evan-williams-1783",
]);

export function normalizeBrandKey(brand) {
  return (brand || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function isVerifiedBrand(brand) {
  return VERIFIED_BRAND_KEYS.has(normalizeBrandKey(brand));
}

export function canUseFetchedImage(catalogProduct) {
  if (!catalogProduct?.brand) return false;

  const key = normalizeBrandKey(catalogProduct.brand);
  if (!VERIFIED_BRAND_KEYS.has(key)) return false;

  if (key === "evanwilliams") {
    return EVAN_WILLIAMS_VERIFIED_SLUGS.has(catalogProduct.slug);
  }

  return true;
}
