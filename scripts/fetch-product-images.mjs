/**
 * Resolve an image for every bottle in inventory:
 * 1. Local file in public/products/{slug}.*
 * 2. Open Food Facts (barcode, then name search) — bottle photo
 * 3. Wikipedia — product / brand article (bottle photo)
 * 4. Wikipedia — brand logo (when no bottle photo exists)
 * 5. All other brands → brand logo map (brandImages.generated.js)
 * 6. Last resort → TheCocktailDB category ingredient (remote URL only)
 *
 * Remote URLs are downloaded into public/brands/ and public/products/
 * so Vercel serves static files — no image APIs at runtime.
 *
 * Run: npm run inventory:images
 */
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { INVENTORY_PRODUCTS } = await import(
  `file://${join(__dirname, "../src/lib/inventory.generated.js")}`
);
const { canUseFetchedImage } = await import(
  `file://${join(__dirname, "../src/lib/verifiedBrands.js")}`
);
const {
  CURATED_BRAND_IMAGES,
  CURATED_PRODUCT_IMAGES,
} = await import(`file://${join(__dirname, "../src/lib/curatedImages.js")}`);

const WIKI_SUMMARY = "https://en.wikipedia.org/api/rest_v1/page/summary";
const OFF_PRODUCT = "https://world.openfoodfacts.org/api/v2/product";
const OFF_SEARCH = "https://world.openfoodfacts.org/api/v2/search";

const SLUG_BARCODES = {
  "absolut-vodka": "7312040017683",
  "grey-goose-vodka": "80480280017",
  "titos-vodka": "619947000042",
  "ketel-one-vodka": "85186400100",
  "crown-royal": "0087000007246",
  "maker-s-mark": "852465002044",
  "jack-daniels-black-label": "5099873008336",
  "jim-beam": "80686001017",
  fireball: "88076117725",
  "patron-silver-tequila": "721059001550",
  "lunazul-blanco-tequila": "73854001001",
  "jose-cuervo-especial-silver": "7501035010093",
  "1800-blanco-tequila": "811538010110",
  "bacardi-white-rum": "8048001800",
  "new-amsterdam-vodka": "8500002336",
  "barefoot-cabernet": "8500000085",
  "franzia-crisp-white": "8312001304",
};

/** Wikipedia article titles per brand (tried before auto-generated titles). */
const WIKI_BRAND_TITLES = {
  "1800": ["1800_Tequila", "1800_(tequila)"],
  "99 BRAND": ["99_Brand"],
  Absolut: ["Absolut_vodka"],
  BAREFOOT: ["Barefoot_Wine"],
  "BLACK BOX": ["Black_Box_(wine)"],
  Bacardi: ["Bacardi"],
  "Burnett's": ["Burnett's_Gin"],
  "Canadian Club": ["Canadian_Club"],
  "Canadian Hunter": ["Canadian_Hunter"],
  "Canadian Mist": ["Canadian_Mist"],
  "Crown Royal": ["Crown_Royal"],
  "Crown Russe": ["Crown_Russe"],
  "DARK HORSE": ["Dark_Horse_Wine", "Dark_Horse_(wine)"],
  ESPOLON: ["Espolón", "Espolon"],
  "Evan Williams": ["Evan_Williams_(bourbon)"],
  FRANZIA: ["Franzia"],
  Fireball: ["Fireball_Cinnamon_Whisky"],
  "Grey Goose": ["Grey_Goose_(vodka)"],
  "JOSE CUERVO": ["Jose_Cuervo"],
  "JOSH CELLARS": ["Josh_Cellars"],
  "Jack Daniels": ["Jack_Daniel's"],
  "Jim Beam": ["Jim_Beam"],
  "Ketel One": ["Ketel_One"],
  LUNAZUL: ["Lunazul"],
  "Maker's Mark": ["Maker's_Mark"],
  Malibu: ["Malibu_(rum)"],
  "New Amsterdam": ["New_Amsterdam_Vodka"],
  PATRON: ["Patrón_Tequila", "Patron_Tequila"],
  Platinum: ["Platinum_Vodka_(Canada)"],
  "SUTTER HOME": ["Sutter_Home_Winery"],
  "Seagram's": ["Seagram"],
  TISDALE: ["Tisdale_(wine)"],
  Taaka: ["Taaka"],
  "Tito'S Vodka": ["Tito's_Vodka"],
  WOODBRIDGE: ["Woodbridge_Wine"],
  "YELLOW TAIL": ["Yellow_Tail_(wine)"],
  Moet: ["Moët_&_Chandon", "Moet_%26_Chandon"],
};

/** Wikipedia title matches a person, not a brand — skip auto-fetch. */
const SKIP_WIKI_BRAND_KEYS = new Set(["paulmasson"]);

const ALCOHOL_WORDS = [
  "vodka",
  "whiskey",
  "whisky",
  "wine",
  "tequila",
  "rum",
  "gin",
  "brandy",
  "liqueur",
  "spirit",
  "bourbon",
  "champagne",
  "cocktail",
  "distill",
  "brewery",
  "winery",
  "schnapps",
];

const BAD_TEXT = [
  "painting",
  "jacques-louis",
  "historic city",
  "museum",
  "colony",
  "view of new amsterdam",
  "platinum is a",
  "chemical element",
  "noble metal",
  "year 1800",
  "french empire",
  "mardi gras",
  "parade",
  "paraders",
  "american businessman",
  "french-born",
  "pioneer of california",
];

const BAD_URL = [
  "jacques-louis",
  "david_007",
  "view_of_new_amsterdam",
  "amh-6831",
  "platinum_is_a",
  "parader",
  "mardi_gras",
];

function toWikiTitle(text) {
  return text
    .trim()
    .replace(/['']/g, "'")
    .replace(/\s+/g, "_")
    .replace(/[^\w\s\-_'().&]/g, "");
}

function normalizeBrand(brand) {
  return (brand || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function brandInTitle(product, title) {
  const brand = normalizeBrand(product.brand);
  const t = (title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (brand.length < 3) return false;
  return t.includes(brand) || brand.includes(t.slice(0, Math.min(brand.length, 8)));
}

function pageText(data) {
  return `${data.title || ""} ${data.description || ""} ${data.extract || ""}`.toLowerCase();
}

function isBadText(text) {
  return BAD_TEXT.some((b) => text.includes(b));
}

function isBadUrl(url) {
  const u = (url || "").toLowerCase();
  return BAD_URL.some((b) => u.includes(b));
}

function hasAlcoholContext(text) {
  return ALCOHOL_WORDS.some((w) => text.includes(w));
}

function isLikelyLogoUrl(url) {
  return /logo/i.test(url || "");
}

function wikiBrandTitles(product) {
  const brandKey = normalizeBrand(product.brand);
  if (SKIP_WIKI_BRAND_KEYS.has(brandKey)) return [];

  const set = new Set();
  if (product.brand && WIKI_BRAND_TITLES[product.brand]) {
    for (const t of WIKI_BRAND_TITLES[product.brand]) set.add(t);
  }
  if (product.brand) {
    const b = toWikiTitle(product.brand);
    set.add(b);
    const cat = product.category;
    if (cat === "vodka") set.add(`${b}_(vodka)`);
    if (cat === "tequila") set.add(`${b}_(tequila)`);
    if (cat === "whiskey") set.add(`${b}_(whiskey)`);
    if (cat === "wine") set.add(`${b}_(wine)`);
    if (cat === "rum") set.add(`${b}_(rum)`);
    if (cat === "gin") set.add(`${b}_(gin)`);
  }
  return [...set].filter(Boolean);
}

function wikiProductTitles(product) {
  const set = new Set(wikiBrandTitles(product));
  set.add(toWikiTitle(product.name));
  return [...set];
}

function isRelevantProductPhoto(data, product, url) {
  const text = pageText(data);
  if (isBadText(text) || isBadUrl(url)) return false;
  if (!brandInTitle(product, data.title)) return false;
  if (hasAlcoholContext(text)) return true;
  const nameWords = product.name
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);
  return nameWords.filter((w) => text.includes(w)).length >= 2;
}

function isBiographyPage(data) {
  const desc = (data.description || "").toLowerCase();
  const text = pageText(data);
  if (hasAlcoholContext(text) && /logo|brand|distill|winery|beverage|spirit/.test(text)) {
    return false;
  }
  if (/\b(18|19|20)\d{2}\s*[-–—]\s*\d{2,4}\b/.test(desc)) return true;
  if (
    /\b(businessman|businesswoman|politician|actor|actress|author|singer|footballer|inventor|physician)\b/.test(
      desc,
    )
  ) {
    return true;
  }
  return false;
}

function isAcceptableBrandLogo(data, product, url) {
  const text = pageText(data);
  if (isBiographyPage(data) || isBadText(text) || isBadUrl(url)) return false;
  if (!brandInTitle(product, data.title) && !isLikelyLogoUrl(url)) return false;
  if (isLikelyLogoUrl(url) && brandInTitle(product, data.title)) return true;
  if (hasAlcoholContext(text) && brandInTitle(product, data.title)) return true;
  if (isLikelyLogoUrl(url) && hasAlcoholContext(text)) return true;
  return false;
}

async function fetchWikiSummary(title) {
  try {
    const res = await fetch(
      `${WIKI_SUMMARY}/${encodeURIComponent(title)}`,
      { headers: { "User-Agent": "ChappellHillWineSpirits/1.0" } },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchWikipediaProductPhoto(product) {
  for (const title of wikiProductTitles(product)) {
    const data = await fetchWikiSummary(title);
    const url = data?.thumbnail?.source?.replace(/^http:/, "https:");
    if (!url || isLikelyLogoUrl(url)) continue;
    if (isRelevantProductPhoto(data, product, url)) return url;
  }
  return null;
}

const brandLogoCache = new Map();

async function fetchWikipediaBrandLogo(product) {
  if (!product.brand) return null;
  const cacheKey = normalizeBrand(product.brand);
  if (brandLogoCache.has(cacheKey)) return brandLogoCache.get(cacheKey);

  let found = null;
  for (const title of wikiBrandTitles(product)) {
    const data = await fetchWikiSummary(title);
    const url = data?.thumbnail?.source?.replace(/^http:/, "https:");
    if (!url) continue;
    if (isAcceptableBrandLogo(data, product, url)) {
      found = url;
      break;
    }
  }

  brandLogoCache.set(cacheKey, found);
  return found;
}

async function fetchOffBarcode(barcode) {
  try {
    const res = await fetch(`${OFF_PRODUCT}/${barcode}?fields=image_front_url`, {
      headers: { "User-Agent": "ChappellHillWineSpirits/1.0" },
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (text.startsWith("<")) return null;
    const data = JSON.parse(text);
    const url = data?.product?.image_front_url;
    return url ? url.replace(/^http:/, "https:") : null;
  } catch {
    return null;
  }
}

async function fetchOffSearch(name) {
  try {
    const params = new URLSearchParams({
      search_terms: name,
      page_size: "5",
      fields: "product_name,image_front_url",
    });
    const res = await fetch(`${OFF_SEARCH}?${params}`, {
      headers: { "User-Agent": "ChappellHillWineSpirits/1.0" },
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (text.startsWith("<")) return null;
    const data = JSON.parse(text);
    const words = name.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

    for (const p of data.products || []) {
      const pname = (p.product_name || "").toLowerCase();
      const hits = words.filter((w) => pname.includes(w)).length;
      if (hits >= Math.min(2, words.length) && p.image_front_url) {
        return p.image_front_url.replace(/^http:/, "https:");
      }
    }
  } catch {
    return null;
  }
  return null;
}

const PUBLIC_DIR = join(__dirname, "../public");
const BRANDS_DIR = join(PUBLIC_DIR, "brands");
const PRODUCTS_DIR = join(PUBLIC_DIR, "products");

function localImagePath(slug) {
  const base = join(PRODUCTS_DIR, slug);
  for (const ext of [".jpg", ".jpeg", ".png", ".webp", ".svg"]) {
    if (existsSync(base + ext)) return `/products/${slug}${ext}`;
  }
  return null;
}

function extensionFrom(remoteUrl, contentType = "") {
  const type = contentType.toLowerCase();
  if (type.includes("svg")) return ".svg";
  if (type.includes("png")) return ".png";
  if (type.includes("webp")) return ".webp";
  const path = remoteUrl.split("?")[0].toLowerCase();
  if (path.endsWith(".svg")) return ".svg";
  if (path.endsWith(".png")) return ".png";
  if (path.endsWith(".webp")) return ".webp";
  return ".jpg";
}

function existingPublicPath(folder, baseName) {
  for (const ext of [".jpg", ".jpeg", ".png", ".webp", ".svg"]) {
    const file = join(PUBLIC_DIR, folder, `${baseName}${ext}`);
    if (existsSync(file)) return `/${folder}/${baseName}${ext}`;
  }
  return null;
}

/** Download remote image into public/; return site path or original URL on failure. */
async function cacheToPublic(remoteUrl, folder, baseName) {
  if (!remoteUrl || remoteUrl.startsWith("/")) return remoteUrl;

  const existing = existingPublicPath(folder, baseName);
  if (existing) return existing;

  try {
    const res = await fetch(remoteUrl, {
      headers: { "User-Agent": "ChappellHillWineSpirits/1.0" },
    });
    if (!res.ok) return remoteUrl;
    const ext = extensionFrom(remoteUrl, res.headers.get("content-type") || "");
    const dir = join(PUBLIC_DIR, folder);
    mkdirSync(dir, { recursive: true });
    const rel = `/${folder}/${baseName}${ext}`;
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(join(dir, `${baseName}${ext}`), buf);
    return rel;
  } catch {
    return remoteUrl;
  }
}

async function localizeImageMap(map, folder) {
  const out = {};
  for (const [key, url] of Object.entries(map)) {
    out[key] = await cacheToPublic(url, folder, key);
    await new Promise((r) => setTimeout(r, 80));
  }
  return out;
}

function isMisassignedCorporateLogo(product, url) {
  const u = (url || "").toLowerCase();
  const key = normalizeBrand(product.brand);
  if (u.includes("sazerac") && key !== "sazerac") return true;
  return false;
}

async function resolveProductImage(product) {
  const local = localImagePath(product.slug);
  if (local) return { url: local, kind: "local" };

  if (CURATED_PRODUCT_IMAGES[product.slug]) {
    return { url: CURATED_PRODUCT_IMAGES[product.slug], kind: "curated" };
  }

  if (!canUseFetchedImage(product)) return null;

  const barcode = SLUG_BARCODES[product.slug];
  if (barcode) {
    const off = await fetchOffBarcode(barcode);
    if (off) return { url: off, kind: "openfoodfacts" };
  }

  const offSearch = await fetchOffSearch(product.searchTerms || product.name);
  if (offSearch) return { url: offSearch, kind: "openfoodfacts" };

  const wikiPhoto = await fetchWikipediaProductPhoto(product);
  if (wikiPhoto) return { url: wikiPhoto, kind: "wikipedia-photo" };

  const logo = await fetchWikipediaBrandLogo(product);
  if (logo) return { url: logo, kind: "wikipedia-logo" };

  return null;
}

function representativeByBrand(products) {
  const map = new Map();
  for (const p of products) {
    if (!p.brand) continue;
    const key = normalizeBrand(p.brand);
    if (!map.has(key)) map.set(key, p);
  }
  return map;
}

async function main() {
  const images = {};
  const brandImages = {};
  const stats = {
    local: 0,
    openfoodfacts: 0,
    photo: 0,
    logo: 0,
    brandLogos: 0,
    productsMissing: 0,
  };

  const byBrand = representativeByBrand(INVENTORY_PRODUCTS);
  console.log(`Fetching brand logos for ${byBrand.size} brands…`);

  let brandIndex = 0;
  for (const [brandKey, product] of byBrand) {
    if (CURATED_BRAND_IMAGES[brandKey]) {
      brandImages[brandKey] = CURATED_BRAND_IMAGES[brandKey];
      stats.brandLogos++;
      process.stdout.write("C");
      brandIndex++;
      if (brandIndex % 2 === 0) await new Promise((r) => setTimeout(r, 200));
      continue;
    }

    const logo = await fetchWikipediaBrandLogo(product);
    if (logo && !isMisassignedCorporateLogo(product, logo)) {
      brandImages[brandKey] = logo;
      stats.brandLogos++;
      process.stdout.write("L");
    } else {
      process.stdout.write("x");
    }
    brandIndex++;
    if (brandIndex % 2 === 0) await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\nFetching verified bottle photos…`);

  for (let i = 0; i < INVENTORY_PRODUCTS.length; i++) {
    const p = INVENTORY_PRODUCTS[i];
    const result = await resolveProductImage(p);

    if (
      result &&
      (result.kind === "local" ||
        result.kind === "curated" ||
        canUseFetchedImage(p))
    ) {
      images[p.slug] = result.url;
      if (result.kind === "local") stats.local++;
      else if (result.kind === "openfoodfacts") stats.openfoodfacts++;
      else if (result.kind === "wikipedia-photo") stats.photo++;
      else if (result.kind === "wikipedia-logo") stats.logo++;

      const key = normalizeBrand(p.brand);
      if (key && !brandImages[key]) brandImages[key] = result.url;
    } else {
      stats.productsMissing++;
    }

    if (i % 3 === 2) await new Promise((r) => setTimeout(r, 180));
  }

  for (const p of INVENTORY_PRODUCTS) {
    const key = normalizeBrand(p.brand);
    const url = images[p.slug];
    if (!key || !url || brandImages[key]) continue;
    brandImages[key] = url;
  }

  const productTotal = Object.keys(images).length;
  const brandTotal = Object.keys(brandImages).length;
  console.log(
    `\n${productTotal}/${INVENTORY_PRODUCTS.length} verified bottle photos — local: ${stats.local}, Open Food Facts: ${stats.openfoodfacts}, Wikipedia photo: ${stats.photo}, logo: ${stats.logo}`,
  );
  console.log(
    `${brandTotal}/${byBrand.size} brand logos/images for everything else.`,
  );
  console.log(
    `${stats.productsMissing} bottles without verified photo use brand logo; category icon only if brand has no image.`,
  );

  console.log("Downloading images into public/brands/ and public/products/…");
  const localizedBrands = await localizeImageMap(brandImages, "brands");
  const localizedProducts = await localizeImageMap(images, "products");

  writeFileSync(
    join(__dirname, "../src/lib/productImages.generated.js"),
    `/** Auto-generated — run: npm run inventory:images */
export const PRODUCT_IMAGES = ${JSON.stringify(localizedProducts, null, 2)};
`,
  );

  writeFileSync(
    join(__dirname, "../src/lib/brandImages.generated.js"),
    `/** Auto-generated — run: npm run inventory:images */
export const BRAND_IMAGES = ${JSON.stringify(localizedBrands, null, 2)};
`,
  );

  const localBrand = Object.values(localizedBrands).filter((u) =>
    u.startsWith("/"),
  ).length;
  const localProduct = Object.values(localizedProducts).filter((u) =>
    u.startsWith("/"),
  ).length;
  console.log(
    `Saved ${localBrand} brand + ${localProduct} product files under public/ (paths in *.generated.js).`,
  );
}

main().catch(console.error);
