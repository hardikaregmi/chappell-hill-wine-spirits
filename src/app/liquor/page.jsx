import Link from "next/link";
import InventoryGrid from "../../components/InventoryGrid";

export default function LiquorPage() {
  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--bg)]/90">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--accent)]/70">
              Liquor
            </p>
            <h1 className="text-2xl font-semibold text-[color:var(--text)]">
              Liquor selections
            </h1>
          </div>
          <Link
            className="rounded-full border border-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)] transition hover:bg-[color:var(--accent)]/10"
            href="/"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <InventoryGrid category="liquor" />
      </main>
    </div>
  );
}
