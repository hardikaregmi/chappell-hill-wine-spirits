import {
  getCategoryLabel,
  getProductBySlug,
  getSubcategoryLabel,
  PRODUCTS,
} from "./productCatalog";
import { BRAND_IMAGES } from "./brandImages.generated.js";
import {
  getCuratedBrandImage,
  getCuratedProductImage,
} from "./curatedImages.js";
import { PRODUCT_IMAGES } from "./productImages.generated.js";
import { resolveBrandKey } from "./brandAliases.js";
import { cocktailPlaceholderForProduct } from "./cocktailPlaceholders.js";
import { canUseFetchedImage } from "./verifiedBrands.js";

function resolveImage(catalogProduct) {
  if (catalogProduct.image) {
    return { image: catalogProduct.image, isVector: false, source: "catalog" };
  }

  const curated = getCuratedProductImage(catalogProduct.slug);
  if (curated) {
    return { image: curated, isVector: false, source: "curated" };
  }

  const photo = PRODUCT_IMAGES[catalogProduct.slug];
  if (
    photo &&
    (photo.startsWith("/products/") || canUseFetchedImage(catalogProduct))
  ) {
    let source = "photo";
    if (photo.startsWith("/products/")) source = "local";
    else if (photo.includes("openfoodfacts.org")) source = "openfoodfacts";
    else if (
      photo.includes("wikimedia.org") ||
      photo.includes("wikipedia.org")
    ) {
      source = /logo/i.test(photo) ? "wikipedia-logo" : "wikipedia-photo";
    }
    return { image: photo, isVector: false, source };
  }

  const brandKey = resolveBrandKey(catalogProduct.brand);
  const brandImage =
    getCuratedBrandImage(brandKey) ||
    (brandKey ? BRAND_IMAGES[brandKey] : null);
  if (brandImage) {
    return {
      image: brandImage,
      isVector: false,
      source: /logo/i.test(brandImage) ? "brand-logo" : "brand-image",
    };
  }

  const { image: cocktail, kind } =
    cocktailPlaceholderForProduct(catalogProduct);
  return {
    image: cocktail || "/ingredients/wine.png",
    isVector: false,
    source: cocktail ? `placeholder-${kind}` : "thecocktaildb-ingredient",
  };
}

export function getInstantPreview(catalogProduct) {
  const { image, isVector, source } = resolveImage(catalogProduct);

  return {
    slug: catalogProduct.slug,
    name: catalogProduct.name,
    brand: catalogProduct.brand,
    category: catalogProduct.category,
    subcategory: catalogProduct.subcategory,
    categoryLabel: getCategoryLabel(catalogProduct.category),
    subcategoryLabel: getSubcategoryLabel(catalogProduct.subcategory),
    image,
    isVector,
    source,
  };
}

export function getAllInstantPreviews() {
  return PRODUCTS.map(getInstantPreview);
}

function mapStaticFallback(catalogProduct) {
  const { image, isVector, source } = resolveImage(catalogProduct);
  return {
    id: `fallback-${catalogProduct.slug}`,
    name: catalogProduct.name,
    image,
    isVector,
    productSlug: catalogProduct.slug,
    category: catalogProduct.category,
    subcategory: catalogProduct.subcategory,
    source,
  };
}

export async function fetchFastProductImage(catalogProduct) {
  return getInstantPreview(catalogProduct);
}

export async function fetchHomepageGallery() {
  return PRODUCTS.map(getInstantPreview);
}

export async function fetchProductGallery(productSlug) {
  const catalogProduct = getProductBySlug(productSlug);
  if (!catalogProduct) return [];
  return [getInstantPreview(catalogProduct)];
}

export function getFallbackImages(product) {
  if (!product) return [];
  return [mapStaticFallback(product)];
}
