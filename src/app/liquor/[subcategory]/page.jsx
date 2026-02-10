"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";

const labels = {
  vodka: "Vodka",
  tequila: "Tequila",
  gin: "Gin",
  whiskey: "Whiskey",
  rum: "Rum",
  brandy: "Brandy",
  liqueur: "Liqueur",
  margarita: "Margarita",
};

const formatSubcategory = (value) => {
  if (!value) return "";
  if (value === "rose") return "Rosé";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function LiquorSubcategoryPage({ params }) {
  // ✅ Next.js 16: params can be a Promise, unwrap with use()
  const { subcategory: subcategoryParam } = use(params);

  const subcategory = useMemo(
    () => (subcategoryParam || "").toLowerCase(),
    [subcategoryParam],
  );

  const label = labels[subcategory] || subcategoryParam;

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!subcategory) return; // ✅ prevents /subcategory= (blank)

    let cancelled = false;

    const loadItems = async () => {
      try {
        setStatus("loading");

        const response = await fetch(
          `/api/items?category=liquor&subcategory=${encodeURIComponent(
            subcategory,
          )}`,
          { cache: "no-store" },
        );

        const data = await response.json();
        if (cancelled) return;

        setItems(Array.isArray(data) ? data : []);
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
      }
    };

    loadItems();
    return () => {
      cancelled = true;
    };
  }, [subcategory]);

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--bg)]/90">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--accent)]/70">
              Liquor
            </p>
            <h1 className="text-2xl font-semibold text-[color:var(--text)]">
              {label}
            </h1>
          </div>

          <div className="flex gap-3">
            <Link
              className="rounded-full border border-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)] transition hover:bg-[color:var(--accent)]/10"
              href="/liquor"
            >
              All Liquor
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
        {status === "loading" && (
          <p className="text-sm text-[color:var(--muted)]">Loading items...</p>
        )}

        {status === "error" && (
          <p className="text-sm text-rose-200">
            Could not load items. Please try again.
          </p>
        )}

        {status === "ready" && items.length === 0 && (
          <p className="text-sm text-[color:var(--muted)]">
            No items available in this category yet.
          </p>
        )}

        {status === "ready" && items.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-40 w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
                    No image
                  </div>
                )}

                <div className="mt-4">
                  <p className="font-semibold">{item.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    {item.price && (
                      <span className="text-sm font-medium text-[color:var(--accent)]">
                        ${parseFloat(item.price).toFixed(2)}
                      </span>
                    )}
                    {item.subcategory && (
                      <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                        {formatSubcategory(item.subcategory)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
