import Link from "next/link";
import { getProductsGroupedByShelf } from "../lib/productCatalog";

const pillClass =
  "rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-medium text-[color:var(--text)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40";

export default function ProductShelf({ category, basePath }) {
  const shelves = getProductsGroupedByShelf(category);

  return (
    <div className="space-y-10">
      {shelves.map(({ group, items }) => (
        <section key={group}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--accent)]/80">
            {group}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {items.map((product) => (
              <li key={product.slug}>
                <Link href={`${basePath}/${product.slug}`} className={pillClass}>
                  {product.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
