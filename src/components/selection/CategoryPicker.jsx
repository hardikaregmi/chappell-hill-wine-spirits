"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import {
  getCategoryPickerVisual,
  isRemoteImageSrc,
} from "../../lib/categoryPickerVisuals";
import { CATEGORIES } from "../../lib/productCatalog";
import { SHELF_BY_SLUG } from "./categoryShelfRegistry";

function countByCategory(items) {
  const map = new Map();
  for (const c of CATEGORIES) map.set(c.slug, 0);
  for (const it of items) {
    if (map.has(it.category)) map.set(it.category, map.get(it.category) + 1);
  }
  return map;
}

const ALL_SLUG = "__all__";

/**
 * Location-picker style category chooser (see Cloud Crust CE pattern),
 * then the matching category shelf component.
 */
export default function CategoryPicker({ items }) {
  const [active, setActive] = useState(/** @type {string | null} */ (null));
  const counts = useMemo(() => countByCategory(items), [items]);

  const Shelf = active && active !== ALL_SLUG ? SHELF_BY_SLUG[active] : null;

  return (
    <div>
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl font-semibold text-[color:var(--text)] md:text-4xl">
          Our selection
        </h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {items.length} items in the catalog — visit in store for availability
          and sizes in stock.
        </p>
      </div>

      {!active && (
        <>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const n = counts.get(cat.slug) ?? 0;
              const visual = getCategoryPickerVisual(cat.slug, cat.label);
              return (
                <li key={cat.slug}>
                  <button
                    type="button"
                    onClick={() => setActive(cat.slug)}
                    disabled={n === 0}
                    className="flex w-full items-center gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-4 text-left shadow-[0_6px_24px_rgba(61,43,31,0.05)] hover:border-[color:var(--accent)]/35 hover:shadow-[0_12px_32px_rgba(61,43,31,0.1)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span
                      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-[color:var(--border)] ${
                        visual.kind === "photo"
                          ? "bg-[#efe8dc]"
                          : "flex items-center justify-center bg-[color:var(--bg)]"
                      }`}
                    >
                      {visual.kind === "photo" ? (
                        <Image
                          src={visual.src}
                          alt={visual.alt}
                          fill
                          className="object-cover"
                          sizes="64px"
                          unoptimized={isRemoteImageSrc(visual.src)}
                        />
                      ) : (
                        <Image
                          src={visual.src}
                          alt={visual.alt}
                          width={40}
                          height={40}
                          unoptimized
                          className="h-10 w-10 object-contain"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-lg font-semibold text-[color:var(--text)]">
                        {cat.label}
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-[color:var(--muted)]">
                        {n} {n === 1 ? "item" : "items"}
                      </span>
                    </span>
                    <span
                      className="text-[color:var(--accent)]"
                      aria-hidden
                    >
                      →
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setActive(ALL_SLUG)}
              className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-6 py-2.5 text-sm font-semibold text-[color:var(--text)] shadow-sm hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)]"
            >
              View entire catalog
            </button>
          </div>
        </>
      )}

      {active && (
        <div className="mt-10">
          <button
            type="button"
            onClick={() => setActive(null)}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--muted)] hover:border-[color:var(--accent)]/40 hover:text-[color:var(--text)]"
          >
            ← All categories
          </button>

          {active === ALL_SLUG ? (
            <div className="space-y-16">
              {CATEGORIES.map((c) => {
                const Comp = SHELF_BY_SLUG[c.slug];
                return Comp ? <Comp key={c.slug} items={items} /> : null;
              })}
            </div>
          ) : Shelf ? (
            <Shelf items={items} />
          ) : null}

          <p className="mt-12 text-center text-xs text-[color:var(--muted)]">
            Must be 21+ to purchase alcohol. Stock varies — call
            or visit for what&apos;s on the shelf today.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setActive(ALL_SLUG)}
              className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-6 py-2.5 text-sm font-semibold text-[color:var(--text)] shadow-sm hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)]"
            >
              View entire catalog
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
