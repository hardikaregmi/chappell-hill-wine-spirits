"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

const subcategoriesByCategory = {
  liquor: [
    "vodka",
    "tequila",
    "gin",
    "whiskey",
    "rum",
    "brandy",
    "liqueur",
    "margarita",
  ],
  wine: [
    "cabernet-sauvignon",
    "merlot",
    "pinot-noir",
    "pinot-grigio",
    "moscato",
    "chardonnay",
    "sauvignon-blanc",
    "riesling",
    "zinfandel",
    "sangria",
    "red-blend",
    "rose",
  ],
};

const subcategoryLabels = {
  vodka: "Vodka",
  tequila: "Tequila",
  gin: "Gin",
  whiskey: "Whiskey",
  rum: "Rum",
  brandy: "Brandy",
  liqueur: "Liqueur",
  margarita: "Margarita",
  "cabernet-sauvignon": "Cabernet Sauvignon",
  merlot: "Merlot",
  "pinot-noir": "Pinot Noir",
  "pinot-grigio": "Pinot Grigio",
  moscato: "Moscato",
  chardonnay: "Chardonnay",
  "sauvignon-blanc": "Sauvignon Blanc",
  riesling: "Riesling",
  zinfandel: "Zinfandel",
  sangria: "Sangria",
  "red-blend": "Red Blend",
  rose: "Rosé",
};

const defaultForm = {
  name: "",
  category: "liquor",
  subcategory: "vodka",
  inStock: true,
  image: "",
};

export default function AdminPanel() {
  const { data: session, status: sessionStatus } = useSession();
  const isAuthed = sessionStatus === "authenticated" && session?.user?.role === "admin";
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(defaultForm);
  const [editImageFile, setEditImageFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadItems = async () => {
    const response = await fetch("/api/inventory", { cache: "no-store" });
    const data = await response.json();
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data?.error || "Image upload failed.");
    }

    const data = await response.json();
    return data.path;
  };

  const handleAddItem = async (event) => {
    event.preventDefault();
    setStatus(null);
    setIsLoading(true);
    try {
      let imagePath = "";
      if (imageFile) {
        imagePath = await uploadImage(imageFile);
      }
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          image: imagePath,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setStatus(data?.error || "Could not add item.");
        return;
      }

      setForm(defaultForm);
      setImageFile(null);
      await loadItems();
    } catch (error) {
      setStatus(error.message || "Could not add item.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setStatus(null);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setStatus(data?.error || "Could not delete item.");
        return;
      }

      await loadItems();
    } catch (error) {
      setStatus("Could not delete item.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStock = async (item) => {
    const nextValue = !item.inStock;
    setStatus(null);
    setItems((prev) =>
      prev.map((entry) =>
        entry.id === item.id ? { ...entry, inStock: nextValue } : entry,
      ),
    );
    try {
      const response = await fetch(`/api/inventory/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: nextValue }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Could not update stock.");
      }
    } catch (error) {
      setItems((prev) =>
        prev.map((entry) =>
          entry.id === item.id ? { ...entry, inStock: item.inStock } : entry,
        ),
      );
      setStatus(error.message || "Could not update stock.");
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      category: item.category,
      subcategory: item.subcategory,
      inStock: item.inStock,
      image: item.image,
    });
    setEditImageFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(defaultForm);
    setEditImageFile(null);
  };

  const handleSaveEdit = async (id) => {
    setStatus(null);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("category", editForm.category);
      formData.append("subcategory", editForm.subcategory);
      formData.append("inStock", String(editForm.inStock));
      if (editImageFile && editImageFile.size > 0) {
        formData.append("image", editImageFile);
      }

      const response = await fetch(`/api/inventory/${id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        setStatus(data?.error || "Could not update item.");
        return;
      }

      await loadItems();
      cancelEdit();
    } catch (error) {
      setStatus(error.message || "Could not update item.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--bg)]/90">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--accent)]/70">
              Admin Panel
            </p>
            <h1 className="text-2xl font-semibold text-[color:var(--text)]">
              Chappell Hill Wine & Spirits
            </h1>
          </div>
          <a
            className="rounded-full border border-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)] transition hover:bg-[color:var(--accent)]/10"
            href="/"
          >
            Back to Home
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {!isAuthed ? (
          <section className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            <h2 className="text-2xl font-semibold text-[color:var(--text)]">
              Admin access only
            </h2>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Please log in to manage the inventory.
            </p>
          </section>
        ) : (
          <div className="space-y-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-[color:var(--text)]">
                  Inventory Manager
                </h2>
                <p className="text-sm text-[color:var(--muted)]">
                  Add or remove items shown on the Liquor and Wine pages.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)] transition hover:bg-[color:var(--accent)]/10"
              >
                Log out
              </button>
            </div>

            <section className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            <h3 className="text-xl font-semibold text-[color:var(--text)]">
              Add item
            </h3>
            <form
              onSubmit={handleAddItem}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[color:var(--text)] outline-none focus:border-[color:var(--accent)] md:col-span-2"
                placeholder="Item name"
                required
              />

              <label className="text-sm text-[color:var(--muted)]">
                Category
                <select
                  value={form.category}
                  onChange={(event) => {
                    const category = event.target.value;
                    setForm((prev) => ({
                      ...prev,
                      category,
                      subcategory: subcategoriesByCategory[category][0],
                    }));
                  }}
                  className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]"
                >
                  <option value="liquor">Liquor</option>
                  <option value="wine">Wine</option>
                </select>
              </label>

              <label className="text-sm text-[color:var(--muted)]">
                Subcategory
                <select
                  value={form.subcategory}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      subcategory: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]"
                >
                  {subcategoriesByCategory[form.category].map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategoryLabels[subcategory] ?? subcategory}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-[color:var(--muted)]">
                Image upload (optional)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                  className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[color:var(--text)] file:mr-4 file:rounded-full file:border-0 file:bg-[color:var(--accent)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[color:var(--accent-hover)]"
                />
              </label>

              <label className="flex items-center gap-3 text-sm text-[color:var(--muted)]">
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, inStock: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-[color:var(--border)] bg-white text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
                />
                In stock
              </label>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Saving..." : "Add item"}
                </button>
                {status && (
                  <p className="mt-3 text-sm text-[color:var(--muted)]">{status}</p>
                )}
              </div>
            </form>
          </section>

            <section className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            <h3 className="text-xl font-semibold text-[color:var(--text)]">
              Current items
            </h3>
            <div className="mt-6 space-y-4">
              {items.length === 0 && (
                <p className="text-sm text-[color:var(--muted)]">
                  No items added yet.
                </p>
              )}
              {items.map((item) => (
                <div key={item.id} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-14 w-14 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[color:var(--border)] text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted)]">
                          No image
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-[color:var(--text)]">
                          {item.name}
                        </p>
                        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                          {item.category} ·{" "}
                          {subcategoryLabels[item.subcategory] ||
                            item.subcategory}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleStock(item)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition hover:opacity-90 ${
                          item.inStock
                            ? "bg-emerald-500/15 text-emerald-700"
                            : "bg-rose-500/15 text-rose-700"
                        }`}
                      >
                        {item.inStock ? "In stock" : "Out of stock"}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="rounded-full border border-[color:var(--accent)] px-4 py-2 text-xs font-semibold text-[color:var(--accent)] transition hover:bg-[color:var(--accent)]/10"
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="rounded-full border border-[color:var(--border)] px-4 py-2 text-xs font-semibold text-[color:var(--text)] transition hover:border-[color:var(--accent)]/40 hover:bg-[color:var(--accent)]/10"
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {editingId === item.id && (
                    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                      <div className="grid gap-4 md:grid-cols-2">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                          className="rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[color:var(--text)] outline-none focus:border-[color:var(--accent)] md:col-span-2"
                      placeholder="Item name"
                      required
                    />

                    <label className="text-sm text-[color:var(--muted)]">
                      Category
                      <select
                        value={editForm.category}
                        onChange={(event) => {
                          const category = event.target.value;
                          setEditForm((prev) => ({
                            ...prev,
                            category,
                            subcategory: subcategoriesByCategory[category][0],
                          }));
                        }}
                        className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]"
                      >
                        <option value="liquor">Liquor</option>
                        <option value="wine">Wine</option>
                      </select>
                    </label>

                    <label className="text-sm text-[color:var(--muted)]">
                      Subcategory
                      <select
                        value={editForm.subcategory}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            subcategory: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]"
                      >
                        {subcategoriesByCategory[editForm.category].map(
                          (subcategory) => (
                            <option key={subcategory} value={subcategory}>
                              {subcategoryLabels[subcategory] ?? subcategory}
                            </option>
                          ),
                        )}
                      </select>
                    </label>

                    <label className="text-sm text-[color:var(--muted)]">
                      Replace image (optional)
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          setEditImageFile(event.target.files?.[0] || null)
                        }
                        className="mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[color:var(--text)] file:mr-4 file:rounded-full file:border-0 file:bg-[color:var(--accent)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[color:var(--accent-hover)]"
                      />
                    </label>

                    <label className="flex items-center gap-3 text-sm text-[color:var(--muted)]">
                      <input
                        type="checkbox"
                        checked={editForm.inStock}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            inStock: event.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-[color:var(--border)] bg-white text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
                      />
                      In stock
                    </label>
                  </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(item.id)}
                          className="rounded-full bg-[color:var(--accent)] px-6 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isLoading}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-full border border-[color:var(--accent)] px-6 py-2 text-xs font-semibold text-[color:var(--accent)] transition hover:bg-[color:var(--accent)]/10"
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
      </main>
    </div>
  );
}
