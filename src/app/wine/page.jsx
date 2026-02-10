import Link from "next/link";
import InventoryGrid from "../../components/InventoryGrid";

const labels = {
  red: "Red",
  white: "White",
  rose: "Rosé",
  sparkling: "Sparkling",
  champagne: "Champagne",
  dessert: "Dessert",
};

export default async function WineSubcategoryPage({ params }) {
  // ✅ Next.js 16: params can be a Promise in dynamic routes
  const { subcategory } = await params;

  const label = labels[subcategory] || subcategory;

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--bg)]/80">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--accent)]/70">
              Wine
            </p>
            <h1 className="text-2xl font-semibold text-[color:var(--accent)]">
              {label}
            </h1>
          </div>

          <div className="flex gap-3">
            <Link
              className="rounded-full border border-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)] transition hover:bg-[color:var(--accent)]/10"
              href="/wine"
            >
              All Wine
            </Link>
            <Link
              className="rounded-full border border-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)] transition hover:bg-[color:var(--accent)]/10"
              href="/"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <InventoryGrid category="wine" subcategory={subcategory} />
      </main>
    </div>
  );
}
