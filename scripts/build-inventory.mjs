import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tsvPath = join(__dirname, "inventory-source.tsv");
const tsv = readFileSync(tsvPath, "utf8");

/**
 * When a spreadsheet line omits the spirit type ("Vodka", "Tequila", …),
 * substring-match known brand families to a category before keyword rules.
 * Sorted by pattern length (longest first) so "new amsterdam" beats shorter noise.
 */
const BRAND_CATEGORY_RULES_RAW = [
  ["new amsterdam", "vodka"],
  ["smirnoff", "vodka"],
  ["svedka", "vodka"],
  ["three olives", "vodka"],
  ["deep eddy", "vodka"],
  ["stoli", "vodka"],
  ["ketel one", "vodka"], // redundant with keyword "ketel" but explicit
  ["grey goose", "vodka"],
  ["taaka", "vodka"],
  ["burnett", "vodka"],
  ["absolut", "vodka"],
];

const BRAND_CATEGORY_RULES = [...BRAND_CATEGORY_RULES_RAW].sort(
  (a, b) => b[0].length - a[0].length,
);

function categoryFromBrandCatalog(n) {
  for (const [needle, cat] of BRAND_CATEGORY_RULES) {
    if (n.includes(needle)) return cat;
  }
  return null;
}

/** Category sort: spirits → modifiers → wine last (largest). Matches picker / shelves. */
const CATEGORY_SORT_ORDER = [
  "vodka",
  "gin",
  "rum",
  "tequila",
  "whiskey",
  "brandy",
  "cognac",
  "liqueurs",
  "margarita",
  "champagne",
  "wine",
];

const CATEGORY_LABELS = {
  vodka: "Vodka",
  gin: "Gin",
  rum: "Rum",
  tequila: "Tequila",
  whiskey: "Whiskey",
  brandy: "Brandy",
  cognac: "Cognac",
  liqueurs: "Liqueurs",
  margarita: "Margarita",
  champagne: "Champagne & sparkling",
  wine: "Wine",
};

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
  let out = str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bTitos\b/gi, "Tito's")
    .replace(/\bMaker S\b/gi, "Maker's")
    .replace(/\bBurnett S\b/gi, "Burnett's")
    .replace(/\bSeagram S\b/gi, "Seagram's")
    .replace(/\bDusse\b/gi, "D'Ussé")
    .replace(/\bRemy Martin\b/gi, "Rémy Martin");
  out = out.replace(/rémy martin/gi, "Rémy Martin");
  out = out.replace(/\bVsop\b/g, "VSOP");
  out = out.replace(/\bSaphire\b/gi, "Sapphire");
  out = out.replace(/\bCriag\b/gi, "Craig");
  out = out.replace(/Cook'S/g, "Cook's");
  return out;
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
  /** Lowercase ASCII-ish fold for reliable substring matches (accents, apostrophes). */
  const fold = n
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['\u2019]/g, "");

  const brandCat = categoryFromBrandCatalog(n);
  if (brandCat) return brandCat;

  if (n.includes("margarita") && !n.match(/tequila\s+\d/)) return "margarita";
  if (n.includes("99 brand")) return "liqueurs";
  if (
    (n.includes("gin") && !n.includes("origin")) ||
    n.includes("aviation") ||
    n.includes("bombay") ||
    n.includes("tanqueray")
  )
    return "gin";
  if (
    n.includes("rum") ||
    n.includes("malibu") ||
    n.includes("bacardi") ||
    n.includes("kraken") ||
    n.includes("bumbu") ||
    fold.includes("rumchata")
  )
    return "rum";
  if (
    n.includes("tequila") ||
    n.includes("cuervo") ||
    n.includes("teremana") ||
    n.includes("casamigos") ||
    n.includes("camarena") ||
    n.includes("montezuma") ||
    n.includes("two fingers") ||
    n.includes("2 fingers") ||
    (n.includes("aristocrat") && n.includes("tequila")) ||
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
  if (
    n.includes("vodka") ||
    n.includes("titos") ||
    n.includes("ketel") ||
    n.includes("skyy")
  )
    return "vodka";
  if (
    n.includes("korbel") ||
    n.includes("cook's") ||
    n.includes("lamarca") ||
    n.includes("la marca") ||
    n.includes("prosecco") ||
    n.includes("cava") ||
    n.includes("spumante") ||
    (n.includes("andre") &&
      (n.includes("champagne") ||
        n.includes("brut") ||
        n.includes("strawberry"))) ||
    (n.includes("champagne") && !fold.includes("hennessy"))
  )
    return "champagne";
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
    n.includes("carlo rossi") ||
    n.includes("castello del poggio") ||
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
    fold.includes("cognac") ||
    fold.includes("hennessy") ||
    fold.includes("dusse") ||
    fold.includes("remy martin")
  )
    return "cognac";
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
    n.includes("quality house") ||
    n.includes("bulleit") ||
    n.includes("four roses") ||
    n.includes("woodford") ||
    n.includes("elijah") ||
    n.includes("traveller") ||
    n.includes("traveler")
  )
    return "whiskey";
  if (
    n.includes("brandy") ||
    n.includes("paul masson") ||
    /\be\s*&\s*j\b/i.test(n)
  )
    return "brandy";
  return "whiskey";
}

function detectBrand(name) {
  const brands = [
    "Rémy Martin",
    "Hennessy",
    "D'Ussé",
    "André",
    "Crown Royal",
    "Maker's Mark",
    "Jack Daniels",
    "Evan Williams",
    "E & J",
    "Paul Masson",
    "Four Roses",
    "Woodford Reserve",
    "Elijah Craig",
    "Bulleit",
    "Casamigos",
    "Aristocrat",
    "Teremana",
    "Camarena",
    "Montezuma",
    "Traveller",
    "Carlo Rossi",
    "Castello del Poggio",
    "Korbel",
    "La Marca",
    "Cook's",
    "Bombay Sapphire",
    "Aviation",
    "Seagram's",
    "Fireball",
    "Jim Beam",
    "R & R",
    "Quality House",
    "Canadian Hunter",
    "Canadian Mist",
    "Canadian Club",
    "Grey Goose",
    "Skyy",
    "Ketel One",
    "Titos",
    "Absolut",
    "Platinum",
    "Malibu",
    "The Kraken",
    "Bumbu",
    "RumChata",
    "Bacardi",
    "New Amsterdam",
    "Tanqueray",
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
  if (category !== "wine" && category !== "champagne") return undefined;
  if (n.includes("cabernet") || n.includes("cab sauv")) return "cabernet";
  if (n.includes("pinot noir")) return "pinot-noir";
  if (n.includes("pinot grigio") || n.includes("pnt grigio"))
    return "pinot-grigio";
  if (n.includes("chardonnay")) return "chardonnay";
  if (n.includes("moscato")) return "moscato";
  if (n.includes("merlot")) return "merlot";
  if (n.includes("sauvignon")) return "sauvignon-blanc";
  if (n.includes("rosé") || /\brose\b/.test(n)) return "rose";
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

function categoryRank(slug) {
  const i = CATEGORY_SORT_ORDER.indexOf(slug);
  return i === -1 ? CATEGORY_SORT_ORDER.length : i;
}

const products = Array.from(seen.values()).sort((a, b) => {
  const ca = categoryRank(a.category);
  const cb = categoryRank(b.category);
  if (ca !== cb) return ca - cb;
  return a.name.localeCompare(b.name);
});

const dedupedTsv = ["Name", ...products.map((p) => p.name)].join("\n");
writeFileSync(tsvPath, `${dedupedTsv}\n`);

const categories = CATEGORY_SORT_ORDER.map((slug) => ({
  slug,
  label: CATEGORY_LABELS[slug],
}));

const subLabels = {
  cabernet: "Cabernet",
  "pinot-noir": "Pinot Noir",
  "pinot-grigio": "Pinot Grigio",
  chardonnay: "Chardonnay",
  moscato: "Moscato",
  merlot: "Merlot",
  "sauvignon-blanc": "Sauvignon Blanc",
  rose: "Rosé",
};

const out = `/** Auto-generated from scripts/inventory-source.tsv — do not edit by hand. */
export const INVENTORY_CATEGORIES = ${JSON.stringify(categories, null, 2)};

export const INVENTORY_SUBCATEGORY_LABELS = ${JSON.stringify(subLabels, null, 2)};

export const INVENTORY_PRODUCTS = ${JSON.stringify(products, null, 2)};
`;

writeFileSync(join(__dirname, "../src/lib/inventory.generated.js"), out);
console.log(`Wrote ${products.length} unique bottles (no sizes, no prices)`);
