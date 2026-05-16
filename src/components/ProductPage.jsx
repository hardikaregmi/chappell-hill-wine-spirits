import Link from "next/link";
import { notFound } from "next/navigation";
import InventoryGrid from "./InventoryGrid";
import {
  getCategoryLabel,
  getProductBySlug,
  getSubcategoryLabel,
  PRODUCTS,
} from "../lib/productCatalog";

export function generateStaticParamsForCategory() {
  return PRODUCTS.map((product) => ({
    category: product.category,
    product: product.slug,
  }));
}

export default function ProductPage({ category, basePath, productSlug }) {
  const catalogProduct = getProductBySlug(productSlug);

  if (!catalogProduct || catalogProduct.category !== category) {
    notFound();
  }

  const categoryLabel = getCategoryLabel(category);
  const subcategoryLabel = getSubcategoryLabel(catalogProduct.subcategory);

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--bg)]/90">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--accent)]/70">
              {categoryLabel}
            </p>
            <h1 className="text-2xl font-semibold text-[color:var(--text)]">
              {catalogProduct.name}
            </h1>
            {subcategoryLabel && (
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                {subcategoryLabel}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              className="rounded-full border border-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)] hover:bg-[color:var(--accent)]/10"
              href={basePath}
            >
              All {categoryLabel}
            </Link>
            <Link
              className="rounded-full border border-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)] hover:bg-[color:var(--accent)]/10"
              href="/"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <InventoryGrid
          productSlug={catalogProduct.slug}
          productName={catalogProduct.name}
          productGroup={subcategoryLabel || categoryLabel}
        />
      </main>
    </div>
  );
}
