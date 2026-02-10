import { promises as fs } from "fs";
import path from "path";
import prisma from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/requireAdmin";
import { mapProductToItem } from "../../../../lib/productMapping";

const uploadsDir = path.join(process.cwd(), "public/uploads");

const sanitizeFilename = (name) =>
  name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");

const getId = async (params) => {
  const { id } = await params;
  return typeof id === "string" ? id : String(id ?? "");
};

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const id = await getId(params);
  if (!id) {
    return Response.json({ error: "Invalid id." }, { status: 400 });
  }

  const contentType = request.headers.get("content-type") || "";
  const isMultipart = contentType.includes("multipart/form-data");
  let payload = {};
  let uploadedImagePath;

  if (isMultipart) {
    const formData = await request.formData();
    payload = {
      name: formData.get("name"),
      category: formData.get("category"),
      subcategory: formData.get("subcategory"),
      inStock: formData.get("inStock"),
    };

    const file = formData.get("image");
    if (file && typeof file.arrayBuffer === "function" && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const safeName = sanitizeFilename(file.name || "upload");
      const filename = `${Date.now()}-${safeName}`;
      await fs.mkdir(uploadsDir, { recursive: true });
      await fs.writeFile(path.join(uploadsDir, filename), buffer);
      uploadedImagePath = `/uploads/${filename}`;
    }
  } else {
    payload = await request.json();
  }

  const existing = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!existing) {
    return Response.json({ error: "Item not found." }, { status: 404 });
  }

  // Build update data
  const data = {};

  if (typeof payload.name !== "undefined" && payload.name !== null) {
    data.name = payload.name;
  }

  // Handle inStock → isActive mapping
  if (typeof payload.inStock === "boolean") {
    data.isActive = payload.inStock;
  } else if (payload.inStock === "true") {
    data.isActive = true;
  } else if (payload.inStock === "false") {
    data.isActive = false;
  }

  // Handle image
  if (typeof uploadedImagePath !== "undefined") {
    data.imageUrl = uploadedImagePath;
  } else if (typeof payload.image !== "undefined") {
    data.imageUrl = payload.image;
  }

  // Handle category change via subcategory slug
  if (typeof payload.subcategory !== "undefined" && payload.subcategory) {
    const newSlug = payload.subcategory
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    if (newSlug !== existing.category.slug) {
      let cat = await prisma.category.findUnique({
        where: { slug: newSlug },
      });
      if (!cat) {
        cat = await prisma.category.create({
          data: { name: payload.subcategory, slug: newSlug },
        });
      }
      data.categoryId = cat.id;
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data,
    include: { category: true },
  });

  return Response.json(mapProductToItem(product));
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const id = await getId(params);
  if (!id) {
    return Response.json({ error: "Invalid id." }, { status: 400 });
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
