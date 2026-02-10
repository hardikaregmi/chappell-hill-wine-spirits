"use client";

import { useEffect, useState } from "react";

export default function InventoryGrid({ category, subcategory }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;

    const fetchItems = async () => {
      try {
        const response = await fetch("/api/items", { cache: "no-store" });
        const data = await response.json();
        if (!isMounted) return;
        setItems(Array.isArray(data) ? data : []);
        setStatus("ready");
      } catch (error) {
        if (!isMounted) return;
        setStatus("error");
      }
    };

    fetchItems();
    return () => {
      isMounted = false;
    };
  }, [category, subcategory]);

  const filtered = items.filter((item) => {
    if (category && item.category !== category) return false;
    if (subcategory && item.subcategory !== subcategory) return false;
    return true;
  });

  if (status === "loading") {
    return <p className="text-sm text-[color:var(--muted)]">Loading items...</p>;
  }

  if (status === "error") {
    return (
      <p className="text-sm text-rose-200">
        Could not load items. Please try again.
      </p>
    );
  }

  if (filtered.length === 0) {
    return <p className="text-sm text-[color:var(--muted)]">No items added yet.</p>;
  }

  const formatSubcategory = (value) => {
    if (!value) return "";
    const labels = {
      "cabernet-sauvignon": "Cabernet Sauvignon",
      "pinot-noir": "Pinot Noir",
      "pinot-grigio": "Pinot Grigio",
      "sauvignon-blanc": "Sauvignon Blanc",
      "red-blend": "Red Blend",
      "white-blend": "White Blend",
      rose: "Rosé",
    };
    if (labels[value]) return labels[value];
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((item) => (
        <div
          key={item.id}
          className={`rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)]${item.inStock === false ? " opacity-60" : ""}`}
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
            <div className="mt-1 flex flex-wrap items-center gap-2">
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
              <span
                className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  item.inStock === false
                    ? "bg-rose-500/10 text-rose-600"
                    : "bg-emerald-500/10 text-emerald-600"
                }`}
              >
                {item.inStock === false ? "Out of stock" : "In stock"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
