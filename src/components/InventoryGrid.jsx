import { getProductBySlug } from "../lib/productCatalog";
import { getInstantPreview } from "../lib/categoryImages";
import ProductImage from "./ProductImage";

export default function InventoryGrid({ productSlug, productName, productGroup }) {
  const catalogProduct = productSlug ? getProductBySlug(productSlug) : null;
  const item = catalogProduct ? getInstantPreview(catalogProduct) : null;

  if (!catalogProduct || !item) {
    return (
      <p className="text-sm text-[color:var(--muted)]">Product not found.</p>
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-[color:var(--muted)]">
        {productName
          ? `Representative ${productName} at our Petal, Mississippi shop.`
          : "Representative bottle at our Petal, Mississippi shop."}{" "}
        Visit in store for availability!
      </p>

      <article className="mx-auto max-w-sm overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <div className="flex aspect-[4/5] w-full items-center justify-center rounded-2xl bg-[#f0ebe3]">
          <ProductImage
            src={item.image}
            alt={item.name}
            isVector={item.isVector}
            isLogo={
              item.source === "wikipedia-logo" ||
              item.source === "brand-logo"
            }
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="mt-4 text-center">
          <p className="font-semibold">{item.name || productName}</p>
          {productGroup && (
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              {productGroup}
            </p>
          )}
        </div>
      </article>

      <p className="mt-8 text-center text-xs text-[color:var(--muted)]">
        Must be 21+ to purchase alcohol in Mississippi.
      </p>
    </>
  );
}
