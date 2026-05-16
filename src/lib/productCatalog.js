/**
 * Store catalog — sourced from inventory spreadsheet (no prices on site).
 * Regenerate: node scripts/build-inventory.mjs
 * Product images: node scripts/fetch-off-barcodes.mjs
 */

import {
  INVENTORY_CATEGORIES,
  INVENTORY_PRODUCTS,
  INVENTORY_SUBCATEGORY_LABELS,
} from "./inventory.generated.js";

export const CATEGORIES = INVENTORY_CATEGORIES;
export const SUBCATEGORY_LABELS = INVENTORY_SUBCATEGORY_LABELS;
export const PRODUCTS = INVENTORY_PRODUCTS;

const VALID_CATEGORY_SLUGS = new Set(CATEGORIES.map((c) => c.slug));

export function isValidCategory(slug) {
  return VALID_CATEGORY_SLUGS.has(slug);
}

export function getCategoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}

export function getCategoryLabel(category) {
  return getCategoryBySlug(category)?.label || category;
}

export function getSubcategoryLabel(subcategory) {
  if (!subcategory) return "";
  return SUBCATEGORY_LABELS[subcategory] || subcategory;
}

export function getProductBySlug(slug) {
  return PRODUCTS.find((p) => p.slug === slug) || null;
}

export function getProductsByCategory(category) {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getProductsGroupedByShelf(category) {
  const products = getProductsByCategory(category);
  const groups = new Map();

  for (const product of products) {
    const key = product.brand || product.name;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(product);
  }

  return Array.from(groups.entries()).map(([group, items]) => ({
    group,
    items,
  }));
}

/** @deprecated use getProductsByCategory */
export function getProductsByDepartment(department) {
  return getProductsByCategory(department);
}

/** @deprecated use getCategoryLabel */
export function getDepartmentLabel(department) {
  return getCategoryLabel(department);
}
