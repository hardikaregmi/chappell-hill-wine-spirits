import Link from "next/link";
import { notFound } from "next/navigation";
import ProductShelf from "../../components/ProductShelf";
import {
  CATEGORIES,
  getCategoryBySlug,
  getCategoryLabel,
  getProductsByCategory,
  isValidCategory,
} from "../../lib/productCatalog";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export default async function CategoryPage({ params }) {
  const { category } = await params;

  if (!isValidCategory(category)) {
    notFound();
  }

  const meta = getCategoryBySlug(category);
  const count = getProductsByCategory(category).length;
  const label = getCategoryLabel(category);

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--bg)]/90">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--accent)]/70">
              Chappell Hill Wine & Spirits
            </p>
            <h1 className="text-2xl font-semibold text-[color:var(--text)]">
              {meta?.label || label}
            </h1>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              {count} {count === 1 ? "selection" : "selections"} — tap a bottle to view
            </p>
          </div>
          <Link
            className="rounded-full border border-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)] hover:bg-[color:var(--accent)]/10"
            href="/"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <ProductShelf category={category} basePath={`/${category}`} />
      </main>
    </div>
  );
}
