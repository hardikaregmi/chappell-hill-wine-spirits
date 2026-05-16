/**
 * One unique Open Food Facts image per product (no shared wrong duplicates).
 * Run: node scripts/fetch-off-barcodes.mjs
 */
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { INVENTORY_PRODUCTS } = await import(
  `file://${join(__dirname, "../src/lib/inventory.generated.js")}`
);

const OFF_SEARCH = "https://world.openfoodfacts.org/api/v2/search";
const OFF_PRODUCT = "https://world.openfoodfacts.org/api/v2/product";

/** Product slug → barcode (verified US bottles where possible). */
const SLUG_BARCODES = {
  "absolut-vodka": "7312040017683",
  "grey-goose-vodka": "80480280017",
  "titos-vodka": "619947000042",
  "crown-royal": "0087000007246",
  "maker-s-mark": "852465002044",
  "jack-daniels-black-label": "5099873008336",
  "jim-beam": "80686001017",
  "fireball": "88076117725",
  "patron-silver-tequila": "721059001550",
  "lunazul-blanco-tequila": "73854001001",
  "jose-cuervo-especial-silver": "7501035010093",
  "1800-blanco-tequila": "811538010110",
  "bacardi-white-rum": "8048001800",
  "seagram-s-gin": "087000007246",
};

const BAD_IMAGE_IDS = new Set(["6111246721261"]);

function isBadImage(url) {
  if (!url) return true;
  const digits = url.replace(/\D/g, "");
  for (const bad of BAD_IMAGE_IDS) {
    if (digits.includes(bad)) return true;
  }
  return false;
}

async function fetchProductByBarcode(barcode) {
  const res = await fetch(`${OFF_PRODUCT}/${barcode}?fields=image_front_url,product_name`, {
    headers: { "User-Agent": "ChappellHillWineSpirits/1.0" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const url = data?.product?.image_front_url;
  if (!url || isBadImage(url)) return null;
  return url.replace(/^http:/, "https:");
}

async function searchProductImage(name) {
  const params = new URLSearchParams({
    search_terms: name,
    page_size: "3",
    fields: "product_name,image_front_url",
  });
  const res = await fetch(`${OFF_SEARCH}?${params}`, {
    headers: { "User-Agent": "ChappellHillWineSpirits/1.0" },
  });
  if (!res.ok) return null;

  const data = await res.json();
  const term = name.toLowerCase().split(" ")[0];

  for (const p of data?.products || []) {
    const url = p?.image_front_url?.replace(/^http:/, "https:");
    if (!url || isBadImage(url)) continue;
    const pname = (p.product_name || "").toLowerCase();
    if (pname.includes(term)) return url;
  }
  return null;
}

async function main() {
  const images = {};
  const usedUrls = new Map();

  for (let i = 0; i < INVENTORY_PRODUCTS.length; i += 3) {
    const batch = INVENTORY_PRODUCTS.slice(i, i + 3);
    await Promise.all(
      batch.map(async (p) => {
        let url = null;
        const barcode = SLUG_BARCODES[p.slug];
        if (barcode) url = await fetchProductByBarcode(barcode);
        if (!url) url = await searchProductImage(p.searchTerms || p.name);
        if (!url) return;

        const owner = usedUrls.get(url);
        if (owner && owner !== p.slug) return;

        images[p.slug] = url;
        usedUrls.set(url, p.slug);
        process.stdout.write(".");
      }),
    );
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log(`\n${Object.keys(images).length}/${INVENTORY_PRODUCTS.length} unique images`);

  const out = `/** Auto-generated — run: node scripts/fetch-off-barcodes.mjs */
export const PRODUCT_IMAGES = ${JSON.stringify(images, null, 2)};
`;
  writeFileSync(join(__dirname, "../src/lib/productImages.generated.js"), out);
}

main().catch(console.error);
