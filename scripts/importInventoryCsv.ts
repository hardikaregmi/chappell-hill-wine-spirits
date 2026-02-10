/**
 * Import script: reads /src/data/Inventory.csv → upserts Category + Product rows.
 *
 * Run with:  npm run import:inventory
 * (which calls:  tsx scripts/importInventoryCsv.ts)
 *
 * Safe to re-run — uses upsert so no duplicates are created.
 */

import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// ── Path to CSV ──────────────────────────────────────────────────────────────
const CSV_PATH = path.resolve(__dirname, "../src/data/Inventory.csv");

// ── Category-inference rules ─────────────────────────────────────────────────
// Order matters: first match wins. Patterns are tested against the UPPER-CASED
// product name.

interface CategoryRule {
  patterns: (string | RegExp)[];
  category: string;
}

const CATEGORY_RULES: CategoryRule[] = [
  // ── Tequila / Margarita (check before generic liquor) ──
  {
    patterns: ["MARGARITA"],
    category: "Margarita",
  },
  {
    patterns: [
      "TEQUILA",
      "JOSE CUERVO ESPECIAL",
      "1800 BLANCO",
      "1800 REPOSADO",
      "1800 COCONUT",
      "ESPOLON",
      "LUNAZUL",
      "PATRON",
    ],
    category: "Tequila",
  },

  // ── Vodka ──
  {
    patterns: [
      "VODKA",
      "GREY GOOSE",
      "KETEL ONE",
      "TITOS",
      "TITO'S",
      "ABSOLUT",
      "PLATINUM 7X",
      "PLATINUM 10X",
      "NEW AMSTERDAM",
      "TAAKA",
      "BURNETT",
      "CROWN RUSSE",
    ],
    category: "Vodka",
  },

  // ── Rum ──
  {
    patterns: ["RUM", "BACARDI", "MALIBU"],
    category: "Rum",
  },

  // ── Gin ──
  {
    patterns: ["GIN", "SEAGRAM"],
    category: "Gin",
  },

  // ── Brandy / Cognac ──
  {
    patterns: ["BRANDY", "COGNAC", "PAUL MASSON"],
    category: "Brandy",
  },

  // ── Liqueur / Schnapps / Flavored shots ──
  {
    patterns: ["99 BRAND", "SCHNAPPS", "LIQUEUR"],
    category: "Liqueur",
  },

  // ── Whiskey / Bourbon (broad catch — checked AFTER vodka/tequila/rum) ──
  {
    patterns: [
      "WHISKEY",
      "WHISKY",
      "BOURBON",
      "CROWN ROYAL",
      "MAKER'S MARK",
      "MAKERS MARK",
      "JACK DANIEL",
      "EVAN WILLIAMS",
      "JIM BEAM",
      "FIREBALL",
      "R & R",
      "QUALITY HOUSE",
      "CANADIAN",
    ],
    category: "Whiskey",
  },

  // ── Wine (red varietals) ──
  {
    patterns: [
      "CABERNET",
      "CAB SAUV",
      "MERLOT",
      "PINOT NOIR",
      "RED BLEND",
      "SWEET RED",
      "BIG BOLD RED",
      "DEEP & DARK",
      "JAMMY RED",
    ],
    category: "Red Wine",
  },

  // ── Wine (rosé / blush) ──
  {
    patterns: [
      "ROSE ",
      "ROSÉ",
      "BLUSH",
      "WHITE ZINFANDEL",
      "WH ZINFANDEL",
      "PINK MOSCATO",
      "SUNSET BLUSH",
    ],
    category: "Rosé Wine",
  },

  // ── Wine (sweet / moscato / sangria) ──
  {
    patterns: ["MOSCATO", "RED MOSCATO", "SANGRIA", "RIESLING"],
    category: "Sweet Wine",
  },

  // ── Wine (white varietals — broad catch last) ──
  {
    patterns: [
      "CHARDONNAY",
      "SAUVIGNON BLANC",
      "PINOT GRIGIO",
      "COLOMBARD",
      "REFRESHING WHITE",
      "TREE-FREE",
      "SAUVIGNON",      // catches typos like "SAUVIGNON BLACN"
      "GRIGIO",         // catches abbreviations like "PNT GRIGIO"
    ],
    category: "White Wine",
  },
];

function inferCategory(productName: string): string {
  const upper = productName.toUpperCase();
  for (const rule of CATEGORY_RULES) {
    for (const pat of rule.patterns) {
      if (typeof pat === "string") {
        if (upper.includes(pat)) return rule.category;
      } else {
        if (pat.test(upper)) return rule.category;
      }
    }
  }
  return "Other";
}

// ── Slug helper ──────────────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents (é → e)
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ── Extract size from product name ───────────────────────────────────────────
const SIZE_REGEX =
  /\b(\d+(?:\.\d+)?\s*(?:ml|litre|liter|l)\b)/i;

function extractSize(name: string): string | null {
  const m = name.match(SIZE_REGEX);
  if (!m) return null;
  let size = m[1].trim();
  // normalise: "1.75 ml" that should be "1.75 L" (common typo in CSV)
  const num = parseFloat(size);
  if (num >= 1 && /ml$/i.test(size) && num !== 100 && num !== 200 && num !== 375 && num !== 750 && num !== 50 && num !== 500) {
    size = size.replace(/ml$/i, "L");
  }
  return size;
}

// ── Extract brand (heuristic: first 1-3 words before size/descriptor) ────────
const KNOWN_BRANDS: Record<string, string> = {
  "CROWN ROYAL": "Crown Royal",
  "MAKER'S MARK": "Maker's Mark",
  "MAKERS MARK": "Maker's Mark",
  "JACK DANIELS": "Jack Daniels",
  "JACK DANIEL": "Jack Daniels",
  "EVAN WILLIAMS": "Evan Williams",
  "PAUL MASSON": "Paul Masson",
  "SEAGRAM'S": "Seagram's",
  "SEAGRAMS": "Seagram's",
  "JIM BEAM": "Jim Beam",
  "R & R": "R & R",
  "QUALITY HOUSE": "Quality House",
  "CANADIAN HUNTER": "Canadian Hunter",
  "CANADIAN MIST": "Canadian Mist",
  "CANADIAN CLUB": "Canadian Club",
  "GREY GOOSE": "Grey Goose",
  "KETEL ONE": "Ketel One",
  TITOS: "Tito's",
  "TITO'S": "Tito's",
  ABSOLUT: "Absolut",
  "PLATINUM 7X": "Platinum 7X",
  "PLATINUM 10X": "Platinum 10X",
  MALIBU: "Malibu",
  BACARDI: "Bacardi",
  "NEW AMSTERDAM": "New Amsterdam",
  TAAKA: "Taaka",
  "BURNETT'S": "Burnett's",
  BURNETTS: "Burnett's",
  "CROWN RUSSE": "Crown Russe",
  "JOSE CUERVO": "Jose Cuervo",
  "1800": "1800",
  ESPOLON: "Espolon",
  LUNAZUL: "Lunazul",
  PATRON: "Patron",
  "99 BRAND": "99 Brand",
  FIREBALL: "Fireball",
  BAREFOOT: "Barefoot",
  "BLACK BOX": "Black Box",
  FRANZIA: "Franzia",
  FRANZA: "Franzia",
  "YELLOW TAIL": "Yellow Tail",
  "SUTTER HOME": "Sutter Home",
  TISDALE: "Tisdale",
  WOODBRIDGE: "Woodbridge",
  "DARK HORSE": "Dark Horse",
  "JOSH CELLARS": "Josh Cellars",
};

function extractBrand(name: string): string | null {
  const upper = name.toUpperCase();
  // check longest keys first so "CROWN ROYAL" beats "CROWN"
  const sorted = Object.keys(KNOWN_BRANDS).sort(
    (a, b) => b.length - a.length
  );
  for (const key of sorted) {
    if (upper.includes(key)) return KNOWN_BRANDS[key];
  }
  return null;
}

// ── Price parser ─────────────────────────────────────────────────────────────
function parsePrice(raw: string | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[$,]/g, "").trim();
  if (!cleaned || cleaned === "#VALUE!") return null;
  const n = parseFloat(cleaned);
  if (isNaN(n) || n <= 0) return null;
  return n.toFixed(2);
}

function parseOptionalDecimal(raw: string | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[$,]/g, "").trim();
  if (!cleaned || cleaned === "#VALUE!") return null;
  const n = parseFloat(cleaned);
  if (isNaN(n)) return null;
  return n.toFixed(2);
}

function parseOptionalInt(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.trim();
  if (!cleaned) return null;
  const n = parseInt(cleaned, 10);
  if (isNaN(n)) return null;
  return n;
}

// ── Flexible header mapping ──────────────────────────────────────────────────
// The CSV has: Name, Case Cost, Total Units in Case, Cost Price Per Unit,
//              Retail Price Per Unit
// We map these to our fields case-insensitively.

interface MappedRow {
  name: string | undefined;
  caseCost: string | undefined;
  unitsPerCase: string | undefined;
  costPrice: string | undefined;
  retailPrice: string | undefined;
}

function buildHeaderMap(
  headers: string[]
): (row: Record<string, string>) => MappedRow {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

  // map normalised header → column key
  const idx: Record<string, string> = {};
  for (const h of headers) {
    idx[norm(h)] = h;
  }

  const find = (...candidates: string[]): string | undefined => {
    for (const c of candidates) {
      const key = norm(c);
      if (idx[key]) return idx[key];
    }
    // partial match
    for (const c of candidates) {
      const partial = norm(c);
      for (const [k, v] of Object.entries(idx)) {
        if (k.includes(partial) || partial.includes(k)) return v;
      }
    }
    return undefined;
  };

  const nameCol = find("Name", "name", "Product Name", "product");
  const caseCostCol = find("Case Cost", "casecost");
  const unitsCol = find(
    "Total Units in Case",
    "Units in Case",
    "unitspercase",
    "totalunits"
  );
  const costCol = find("Cost Price Per Unit", "costprice", "costperunit");
  const retailCol = find(
    "Retail Price Per Unit",
    "retailprice",
    "retailpriceperunit",
    "price"
  );

  console.log("\n📋 Header mapping:");
  console.log(`   Name column       → ${nameCol ?? "NOT FOUND"}`);
  console.log(`   Case Cost column  → ${caseCostCol ?? "NOT FOUND"}`);
  console.log(`   Units column      → ${unitsCol ?? "NOT FOUND"}`);
  console.log(`   Cost Price column → ${costCol ?? "NOT FOUND"}`);
  console.log(`   Retail Price col  → ${retailCol ?? "NOT FOUND"}`);

  if (!nameCol) {
    throw new Error(
      'Could not find a "Name" column in the CSV. Headers: ' +
        headers.join(", ")
    );
  }

  return (row: Record<string, string>): MappedRow => ({
    name: row[nameCol!],
    caseCost: caseCostCol ? row[caseCostCol] : undefined,
    unitsPerCase: unitsCol ? row[unitsCol] : undefined,
    costPrice: costCol ? row[costCol] : undefined,
    retailPrice: retailCol ? row[retailCol] : undefined,
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Starting inventory import…");
  console.log(`   CSV: ${CSV_PATH}\n`);

  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ CSV file not found at ${CSV_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(CSV_PATH, "utf-8");

  const records: Record<string, string>[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  console.log(`   Total raw rows parsed: ${records.length}`);

  // Build header map from the first record's keys
  if (records.length === 0) {
    console.log("⚠️  No rows found in CSV.");
    return;
  }

  const headers = Object.keys(records[0]);
  console.log(`   CSV headers: ${headers.join(" | ")}`);
  const mapRow = buildHeaderMap(headers);

  // Category cache: slug → Category record
  const categoryCache = new Map<string, { id: string; name: string }>();

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let totalProcessed = 0;

  for (let i = 0; i < records.length; i++) {
    const mapped = mapRow(records[i]);
    totalProcessed++;

    // ── Validate required fields ──
    const name = mapped.name?.trim();
    if (!name) {
      skipped++;
      continue; // empty name row — junk row
    }

    const retailPrice = parsePrice(mapped.retailPrice);
    if (!retailPrice) {
      // No valid retail price — skip but log if name was present
      console.log(
        `   ⏭  Row ${i + 2}: skipped (no valid price) — "${name}"`
      );
      skipped++;
      continue;
    }

    // ── Derive fields ──
    const categoryName = inferCategory(name);
    const slug = slugify(categoryName);
    const brand = extractBrand(name);
    const size = extractSize(name);
    const costPrice = parseOptionalDecimal(mapped.costPrice);
    const caseCost = parseOptionalDecimal(mapped.caseCost);
    const unitsPerCase = parseOptionalInt(mapped.unitsPerCase);

    // ── Upsert Category ──
    if (!categoryCache.has(slug)) {
      const cat = await prisma.category.upsert({
        where: { slug },
        update: { name: categoryName },
        create: { name: categoryName, slug },
      });
      categoryCache.set(slug, { id: cat.id, name: cat.name });
    }
    const categoryId = categoryCache.get(slug)!.id;

    // ── Upsert Product by unique name ──
    const existing = await prisma.product.findUnique({ where: { name } });

    const data = {
      price: new Prisma.Decimal(retailPrice),
      costPrice: costPrice ? new Prisma.Decimal(costPrice) : null,
      caseCost: caseCost ? new Prisma.Decimal(caseCost) : null,
      unitsPerCase,
      size,
      brand,
      isActive: true,
      categoryId,
    };

    if (existing) {
      await prisma.product.update({
        where: { name },
        data,
      });
      updated++;
    } else {
      await prisma.product.create({
        data: { name, ...data },
      });
      inserted++;
    }
  }

  // ── Summary ──
  console.log("\n✅ Import complete!");
  console.log(`   Total rows processed : ${totalProcessed}`);
  console.log(`   Products inserted    : ${inserted}`);
  console.log(`   Products updated     : ${updated}`);
  console.log(`   Rows skipped         : ${skipped}`);

  const catCount = await prisma.category.count();
  const prodCount = await prisma.product.count();
  console.log(`\n   Categories in DB     : ${catCount}`);
  console.log(`   Products in DB       : ${prodCount}`);
}

main()
  .catch((err) => {
    console.error("❌ Import failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
