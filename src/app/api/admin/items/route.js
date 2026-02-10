import prisma from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/requireAdmin";
import { mapProductToItem } from "../../../../lib/productMapping";

export async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const payload = await request.json();

  if (!payload.name || typeof payload.name !== "string") {
    return Response.json({ error: "Name is required." }, { status: 400 });
  }

  // Resolve category slug
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
      isActive: Boolean(payload.inStock),
      imageUrl: payload.image ?? null,
      categoryId: cat.id,
    },
    include: { category: true },
  });

  return Response.json(mapProductToItem(product), { status: 201 });
}

export async function DELETE(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Missing id." }, { status: 400 });
  }

  try {
    await prisma.product.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (error) {
    if (error?.code === "P2025") {
      return Response.json({ error: "Item not found." }, { status: 404 });
    }
    return Response.json(
      { error: "Failed to delete item." },
      { status: 500 }
    );
  }
}
