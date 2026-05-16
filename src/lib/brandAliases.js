import { normalizeBrandKey } from "./verifiedBrands.js";

/** Messy inventory brand strings → canonical key for shared logos. */
const BRAND_CANONICAL = {
  blancbarefootsauvignonblacn: "barefoot",
  californiabarefootriesling: "barefoot",
  franzahousewinefavsunsetblush: "franzia",
};

export function resolveBrandKey(brand) {
  const key = normalizeBrandKey(brand);
  return BRAND_CANONICAL[key] || key;
}
