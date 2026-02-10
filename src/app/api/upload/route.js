import { promises as fs } from "fs";
import path from "path";
import { requireAdmin } from "../../../lib/requireAdmin";

const uploadsDir = path.join(process.cwd(), "public/uploads");

const sanitizeFilename = (name) =>
  name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");

export async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file.arrayBuffer !== "function") {
    return Response.json({ error: "Missing file." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const safeName = sanitizeFilename(file.name || "upload");
  const filename = `${Date.now()}-${safeName}`;

  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, filename), buffer);

  return Response.json({ path: `/uploads/${filename}` });
}
