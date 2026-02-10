import prisma from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/requireAdmin";
import { mapProductToItem } from "../../../lib/productMapping";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uiCategory = searchParams.get("category");

  const where = {};
  if (uiCategory) {
    // Simple filter for admin panel
    where.category = {
      slug: { contains: uiCategory, mode: "insensitive" },
    };
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { name: "asc" },
  });

  return Response.json(products.map(mapProductToItem));
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const payload = await request.json();

  if (!payload.name || typeof payload.name !== "string") {
    return Response.json({ error: "Name is required." }, { status: 400 });
  }

  // Resolve category: use subcategory slug as the DB Category slug
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
      name: payload.name.trim(),
      price: payload.price || "0.00",
      isActive: typeof payload.inStock === "boolean" ? payload.inStock : true,
      imageUrl: payload.image ?? null,
      categoryId: cat.id,
    },
    include: { category: true },
  });

  return Response.json(mapProductToItem(product), { status: 201 });
}
