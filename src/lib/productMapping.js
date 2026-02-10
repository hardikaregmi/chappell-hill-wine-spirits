/**
 * Maps new Product + Category data to the flat category/subcategory format
 * the existing UI expects, and vice-versa for queries.
 *
 * Old UI format:
 *   { category: "liquor"|"wine"|"margaritas"|"champagne", subcategory: "vodka"|"chardonnay"|… }
 *
 * New DB format:
 *   Product.categoryId → Category.slug ("whiskey", "vodka", "red-wine", …)
 */

// ── Category slug → parent group ─────────────────────────────────────────────
const LIQUOR_SLUGS = new Set([
  "whiskey",
  "vodka",
  "rum",
  "tequila",
  "gin",
  "brandy",
  "liqueur",
]);

const WINE_SLUGS = new Set([
  "red-wine",
  "white-wine",
  "rose-wine",
  "sweet-wine",
]);

// ── Wine varietal extraction (from product name) ─────────────────────────────
// Order matters: more-specific patterns first
const WINE_VARIETAL_RULES = [
  {
    keywords: ["CABERNET SAUVIGNON", "CAB SAUV", "CABERNET"],
    subcategory: "cabernet-sauvignon",
  },
  { keywords: ["PINOT NOIR"], subcategory: "pinot-noir" },
  {
    keywords: ["PINOT GRIGIO", "PNT GRIGIO", "GRIGIO"],
    subcategory: "pinot-grigio",
  },
  {
    keywords: ["SAUVIGNON BLANC", "SAUVIGNON BLACN"],
    subcategory: "sauvignon-blanc",
  },
  {
    keywords: [
      "PINK MOSCATO",
      "RED MOSCATO",
      "MOSCATO",
    ],
    subcategory: "moscato",
  },
  { keywords: ["CHARDONNAY"], subcategory: "chardonnay" },
  { keywords: ["MERLOT"], subcategory: "merlot" },
  { keywords: ["RIESLING"], subcategory: "riesling" },
  {
    keywords: ["WHITE ZINFANDEL", "WH ZINFANDEL"],
    subcategory: "zinfandel",
  },
  { keywords: ["SANGRIA"], subcategory: "sangria" },
  {
    keywords: [
      "RED BLEND",
      "SWEET RED",
      "RICH RED",
      "BIG BOLD RED",
      "DEEP & DARK",
      "JAMMY RED",
    ],
    subcategory: "red-blend",
  },
  {
    keywords: ["COLOMBARD", "REFRESHING WHITE", "TREE-FREE"],
    subcategory: "white-blend",
  },
  {
    keywords: ["ROSE", "ROSÉ", "BLUSH", "SUNSET BLUSH"],
    subcategory: "rose",
  },
];

function deriveWineSubcategory(productName) {
  const upper = productName.toUpperCase();
  for (const rule of WINE_VARIETAL_RULES) {
    for (const kw of rule.keywords) {
      if (upper.includes(kw)) return rule.subcategory;
    }
  }
  return "other";
}

// ── Map a Product row (with .category relation) to UI-compatible object ──────
export function mapProductToItem(product) {
  const slug = product.category?.slug || "";

  let category, subcategory;

  if (LIQUOR_SLUGS.has(slug)) {
    category = "liquor";
    subcategory = slug; // "vodka", "whiskey", "tequila", etc.
  } else if (WINE_SLUGS.has(slug)) {
    category = "wine";
    subcategory = deriveWineSubcategory(product.name);
  } else if (slug === "margarita") {
    category = "margaritas";
    subcategory = "margarita";
  } else {
    // Fallback
    category = slug;
    subcategory = slug;
  }

  return {
    id: product.id,
    name: product.name,
    category,
    subcategory,
    inStock: product.isActive,
    image: product.imageUrl || null,
    price: product.price ? product.price.toString() : null,
    brand: product.brand || null,
    size: product.size || null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

// ── Reverse: convert UI category/subcategory → Prisma where clause ───────────
// Used when the frontend sends ?category=liquor&subcategory=vodka
export function buildProductWhere(uiCategory, uiSubcategory) {
  const where = {};

  if (uiCategory === "liquor") {
    if (uiSubcategory) {
      // e.g. subcategory=vodka → Category.slug = "vodka"
      where.category = { slug: uiSubcategory };
    } else {
      // All liquor → Category.slug in LIQUOR_SLUGS
      where.category = { slug: { in: [...LIQUOR_SLUGS] } };
    }
  } else if (uiCategory === "wine") {
    // Wine subcategories are derived from product name, not Category slug.
    // So we fetch all wine categories and post-filter.
    where.category = { slug: { in: [...WINE_SLUGS] } };
  } else if (uiCategory === "margaritas") {
    where.category = { slug: "margarita" };
  } else if (uiCategory === "champagne") {
    // Currently no champagne products in the CSV,
    // but support the route anyway
    where.category = { slug: "champagne" };
  } else if (uiCategory) {
    // Generic fallback
    where.category = { slug: uiCategory };
  }

  return where;
}

// Whether post-filtering by wine subcategory is needed
export function needsWineSubFilter(uiCategory, uiSubcategory) {
  return uiCategory === "wine" && !!uiSubcategory;
}
