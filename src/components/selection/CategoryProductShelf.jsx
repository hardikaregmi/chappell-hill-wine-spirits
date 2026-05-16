"use client";

import { getSubcategoryLabel } from "../../lib/productCatalog";
import ProductImage from "../ProductImage";

/**
 * Product grid for a single category (used inside picker flow).
 */
export default function CategoryProductShelf({ slug, label, items }) {
  return (
    <section id={slug} className="scroll-mt-28">
      <div className="mb-6 flex items-center gap-4">
        <h3 className="font-display text-2xl font-semibold text-[color:var(--text)]">
          {label}
        </h3>
        <span className="h-px flex-1 bg-[color:var(--border)]" />
        <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
          {items.length}
        </span>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((product, index) => (
          <li key={product.slug}>
            <article className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:border-[color:var(--accent)]/50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-[#f0ebe3]">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  isVector={product.isVector}
                  isLogo={
                    product.source === "wikipedia-logo" ||
                    product.source === "brand-logo"
                  }
                  loading={index < 8 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={index < 4 ? "high" : "auto"}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[color:var(--surface)] to-transparent" />
              </div>
              <div className="p-4">
                <p className="font-semibold leading-snug text-[color:var(--text)]">
                  {product.name}
                </p>
                {product.subcategory && (
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--accent)]">
                    {getSubcategoryLabel(product.subcategory)}
                  </p>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
