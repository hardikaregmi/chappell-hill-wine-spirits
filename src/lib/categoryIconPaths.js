/** Static icons under /public/icons/categories — one per inventory category slug */

export const CATEGORY_ICON_PATH = {
  vodka: "/icons/categories/vodka.svg",
  whiskey: "/icons/categories/whiskey.svg",
  wine: "/icons/categories/wine.svg",
  champagne: "/icons/categories/champagne.svg",
  tequila: "/icons/categories/tequila.svg",
  margarita: "/icons/categories/margarita.svg",
  rum: "/icons/categories/rum.svg",
  gin: "/icons/categories/gin.svg",
  liqueurs: "/icons/categories/liqueurs.svg",
  brandy: "/icons/categories/brandy.svg",
  cognac: "/icons/categories/brandy.svg",
};

export function categoryIconPath(slug) {
  return CATEGORY_ICON_PATH[slug] ?? "/icons/categories/wine.svg";
}
