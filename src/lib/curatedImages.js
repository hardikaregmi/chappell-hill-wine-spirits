/**
 * Hand-picked images that Wikipedia fetch filters removed or never matched.
 * Committed paths/URLs used by the site and inventory:images script.
 */

/** Franzia box — kept intentionally (user-approved). Cached at public/brands/franzia.jpg */
export const FRANZIA_BOX_IMAGE = "/brands/franzia.jpg";

const FRANZIA_SLUGS = [
  "franzia-chardonnay",
  "franzia-pinot-grigio-colombard",
  "franzia-refreshing-white-box",
  "franzia-sauvignon-blanc",
  "franzia-vintner-select-wh-zinfandel",
];

export const CURATED_PRODUCT_IMAGES = Object.fromEntries(
  FRANZIA_SLUGS.map((slug) => [slug, FRANZIA_BOX_IMAGE]),
);

/** Sutter Home winery entrance sign (user-approved). */
export const SUTTER_HOME_IMAGE = "/brands/sutterhome.jpg";

export const CURATED_BRAND_IMAGES = {
  franzia: FRANZIA_BOX_IMAGE,
  sutterhome: SUTTER_HOME_IMAGE,
};

export function getCuratedProductImage(slug) {
  return CURATED_PRODUCT_IMAGES[slug] ?? null;
}

export function getCuratedBrandImage(brandKey) {
  return CURATED_BRAND_IMAGES[brandKey] ?? null;
}
