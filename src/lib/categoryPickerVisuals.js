import { categoryIconPath } from "./categoryIconPaths.js";

/**
 * Hero art for category cards — real product / brand shots where available
 * (Tito’s, Jack Daniel’s, Yellow Tail, 1800, Malibu, etc.), ingredients or
 * cocktails as fallback.
 */
const PICKER_PHOTOS = {
  vodka: {
    src: "/products/tito-s-vodka.jpg",
    alt: "Tito’s Handmade Vodka",
  },
  whiskey: {
    src: "/products/jack-daniels-black-label.png",
    alt: "Jack Daniel’s",
  },
  wine: {
    src: "/products/yellow-tail-jammy-red-roo-1-5.png",
    alt: "Yellow Tail Jammy Red Roo",
  },
  champagne: {
    src: "/ingredients/champagne.png",
    alt: "Champagne & sparkling",
  },
  tequila: {
    src: "/brands/1800.png",
    alt: "1800 Tequila",
  },
  rum: {
    src: "/brands/malibu.png",
    alt: "Malibu",
  },
  gin: {
    src: "/ingredients/gin.png",
    alt: "Gin",
  },
  margarita: {
    src: "/cocktails/white-strawberry-margarita-12322.jpg",
    alt: "Strawberry margarita",
  },
  liqueurs: {
    src: "/ingredients/schnapps.png",
    alt: "Liqueurs & cordials",
  },
  brandy: {
    src: "/ingredients/brandy.png",
    alt: "Brandy",
  },
  cognac: {
    src: "/ingredients/brandy.png",
    alt: "Cognac",
  },
};

/**
 * @returns {{ kind: "photo"; src: string; alt: string } | { kind: "icon"; src: string; alt: string }}
 */
export function getCategoryPickerVisual(categorySlug, categoryLabel) {
  const preset = PICKER_PHOTOS[categorySlug];
  if (preset?.src) {
    return {
      kind: "photo",
      src: preset.src,
      alt: preset.alt ? `${categoryLabel} — ${preset.alt}` : categoryLabel,
    };
  }
  return {
    kind: "icon",
    src: categoryIconPath(categorySlug),
    alt: categoryLabel,
  };
}

export function isRemoteImageSrc(src) {
  return typeof src === "string" && /^https?:\/\//i.test(src);
}
