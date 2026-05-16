"use client";

import { CATEGORIES } from "../../lib/productCatalog";
import CategoryProductShelf from "./CategoryProductShelf";

/**
 * Builds one client component per inventory category (vodka, whiskey, …)
 * so each route can be styled or extended independently later.
 */
function createCategoryShelf(category) {
  function CategoryShelf({ items }) {
    const list = items.filter((p) => p.category === category.slug);
    if (list.length === 0) {
      return (
        <p className="text-sm text-[color:var(--muted)]">
          No preview items in {category.label} yet — visit the store for
          updates.
        </p>
      );
    }
    return (
      <CategoryProductShelf
        slug={category.slug}
        label={category.label}
        items={list}
      />
    );
  }

  CategoryShelf.displayName = `${category.label.replace(/\s+/g, "")}Shelf`;
  return CategoryShelf;
}

export const SHELF_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, createCategoryShelf(c)]),
);
