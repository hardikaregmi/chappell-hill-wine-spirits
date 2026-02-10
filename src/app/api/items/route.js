import prisma from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/requireAdmin";
import {
  mapProductToItem,
  buildProductWhere,
  needsWineSubFilter,
} from "../../../lib/productMapping";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uiCategory = searchParams.get("category");
  const uiSubcategory = searchParams.get("subcategory");

  const where = buildProductWhere(uiCategory, uiSubcategory);

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { name: "asc" },
  });

  let items = products.map(mapProductToItem);

  // Wine subcategory filtering happens post-query (derived from product name)
  if (needsWineSubFilter(uiCategory, uiSubcategory)) {
    items = items.filter((item) => item.subcategory === uiSubcategory);
  }

  return Response.json(items);
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const payload = await request.json();

  // Find or create category
  const categorySlug = (payload.subcategory || payload.category || "other")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  let cat = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });
  if (!cat) {
    cat = await prisma.category.create({
      data: {
        name: payload.subcategory || payload.category || "Other",
        slug: categorySlug,
      },
    });
  }

  const product = await prisma.product.create({
    data: {
      name: payload.name,
      price: payload.price || "0.00",
      isActive: payload.inStock !== false,
      imageUrl: payload.image ?? null,
      categoryId: cat.id,
    },
    include: { category: true },
  });

  return Response.json(mapProductToItem(product), { status: 201 });
}
