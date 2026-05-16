import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tsvPath = join(__dirname, "inventory-source.tsv");
const tsv = readFileSync(tsvPath, "utf8");

/** Remove bottle sizes from display names. */
export function stripSize(name) {
  return name
    .replace(
      /\b\d+(\.\d+)?\s*(ml|milliliters?|l|litre?s?|liters?|pf)\b/gi,
      "",
    )
    .replace(/\b\d+\s*ml\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+$/g, "")
    .trim();
}

function titleCase(str) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bTitos\b/gi, "Tito's")
    .replace(/\bMaker S\b/gi, "Maker's")
    .replace(/\bBurnett S\b/gi, "Burnett's")
    .replace(/\bSeagram S\b/gi, "Seagram's");
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function detectCategory(name) {
  const n = name.toLowerCase();
  if (n.includes("margarita") && !n.match(/tequila\s+\d/)) return "margarita";
  if (n.includes("99 brand")) return "liqueurs";
  if (n.includes("gin") && !n.includes("origin")) return "gin";
  if (n.includes("rum") || n.includes("malibu") || n.includes("bacardi"))
    return "rum";
  if (
    n.includes("tequila") ||
    n.includes("cuervo especial") ||
    n.includes("patron") ||
    n.includes("lunazul") ||
    n.includes("espolon") ||
    (n.includes("1800") &&
      (n.includes("blanco") ||
        n.includes("reposado") ||
        n.includes("coconut")))
  )
    return "tequila";
  if (n.includes("vodka") || n.includes("titos") || n.includes("ketel"))
    return "vodka";
  if (
    n.includes("wine") ||
    n.includes("barefoot") ||
    n.includes("yellow tail") ||
    n.includes("black box") ||
    n.includes("franzia") ||
    n.includes("sutter home") ||
    n.includes("tisdale") ||
    n.includes("woodbridge") ||
    n.includes("josh cellars") ||
    n.includes("dark horse") ||
    n.includes("cabernet") ||
    n.includes("merlot") ||
    n.includes("chardonnay") ||
    n.includes("moscato") ||
    n.includes("pinot") ||
    n.includes("sauvignon") ||
    n.includes("riesling") ||
    n.includes("sangria") ||
    n.includes("zinfandel") ||
    n.includes("blush")
  )
    return "wine";
  if (
    n.includes("whiskey") ||
    n.includes("whisky") ||
    n.includes("bourbon") ||
    n.includes("crown royal") ||
    n.includes("maker") ||
    n.includes("jack daniel") ||
    n.includes("evan williams") ||
    n.includes("jim beam") ||
    n.includes("fireball") ||
    n.includes("canadian") ||
    n.includes("r & r") ||
    n.includes("quality house")
  )
    return "whiskey";
  if (n.includes("brandy") || n.includes("paul masson")) return "brandy";
  return "whiskey";
}

function detectBrand(name) {
  const brands = [
    "Crown Royal",
    "Maker's Mark",
    "Jack Daniels",
    "Evan Williams",
    "Paul Masson",
    "Seagram's",
    "Fireball",
    "Jim Beam",
    "R & R",
    "Quality House",
    "Canadian Hunter",
    "Canadian Mist",
    "Canadian Club",
    "Grey Goose",
    "Ketel One",
    "Titos",
    "Absolut",
    "Platinum",
    "Malibu",
    "Bacardi",
    "New Amsterdam",
    "Taaka",
    "Burnett's",
    "Crown Russe",
    "JOSE CUERVO",
    "1800",
    "99 BRAND",
    "ESPOLON",
    "LUNAZUL",
    "PATRON",
    "BAREFOOT",
    "BLACK BOX",
    "FRANZIA",
    "YELLOW TAIL",
    "SUTTER HOME",
    "TISDALE",
    "WOODBRIDGE",
    "JOSH CELLARS",
    "DARK HORSE",
  ];
  const upper = name.toUpperCase();
  for (const b of brands) {
    if (upper.startsWith(b.toUpperCase())) return b;
  }
  return name.split(/\d/)[0].trim();
}

function detectSubcategory(name, category) {
  const n = name.toLowerCase();
  if (category !== "wine") return undefined;
  if (n.includes("cabernet") || n.includes("cab sauv")) return "cabernet";
  if (n.includes("pinot noir")) return "pinot-noir";
  if (n.includes("pinot grigio") || n.includes("pnt grigio"))
    return "pinot-grigio";
  if (n.includes("chardonnay")) return "chardonnay";
  if (n.includes("moscato")) return "moscato";
  if (n.includes("merlot")) return "merlot";
  if (n.includes("sauvignon")) return "sauvignon-blanc";
  return undefined;
}

const lines = tsv.trim().split("\n");
const dataLines = lines[0]?.toLowerCase().includes("name") ? lines.slice(1) : lines;

const seen = new Map();
const usedSlugs = new Set();

for (const line of dataLines) {
  const rawName = line.split("\t")[0]?.trim();
  if (!rawName) continue;

  const baseName = titleCase(stripSize(rawName));
  const key = baseName.toLowerCase();
  if (!key || seen.has(key)) continue;

  const category = detectCategory(baseName);
  const brand = detectBrand(baseName);
  const subcategory = detectSubcategory(baseName, category);

  let slug = slugify(baseName);
  let n = 2;
  while (usedSlugs.has(slug)) {
    slug = `${slugify(baseName)}-${n++}`;
  }
  usedSlugs.add(slug);

  const entry = {
    slug,
    name: baseName,
    category,
    brand,
    searchTerms: baseName,
  };
  if (subcategory) entry.subcategory = subcategory;
  seen.set(key, entry);
}

const products = Array.from(seen.values()).sort((a, b) =>
  a.name.localeCompare(b.name),
);

const dedupedTsv = ["Name", ...products.map((p) => p.name)].join("\n");
writeFileSync(tsvPath, `${dedupedTsv}\n`);

const categories = [
  { slug: "vodka", label: "Vodka" },
  { slug: "whiskey", label: "Whiskey" },
  { slug: "wine", label: "Wine" },
  { slug: "tequila", label: "Tequila" },
  { slug: "margarita", label: "Margarita" },
  { slug: "rum", label: "Rum" },
  { slug: "gin", label: "Gin" },
  { slug: "liqueurs", label: "Liqueurs" },
  { slug: "brandy", label: "Brandy" },
];

const subLabels = {
  cabernet: "Cabernet",
  "pinot-noir": "Pinot Noir",
  "pinot-grigio": "Pinot Grigio",
  chardonnay: "Chardonnay",
  moscato: "Moscato",
  merlot: "Merlot",
  "sauvignon-blanc": "Sauvignon Blanc",
};

const out = `/** Auto-generated from scripts/inventory-source.tsv — do not edit by hand. */
export const INVENTORY_CATEGORIES = ${JSON.stringify(categories, null, 2)};

export const INVENTORY_SUBCATEGORY_LABELS = ${JSON.stringify(subLabels, null, 2)};

export const INVENTORY_PRODUCTS = ${JSON.stringify(products, null, 2)};
`;

writeFileSync(join(__dirname, "../src/lib/inventory.generated.js"), out);
console.log(`Wrote ${products.length} unique bottles (no sizes, no prices)`);
