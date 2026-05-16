/**
 * Remove public assets not referenced by generated libs.
 * Run: node scripts/prune-unused-public.mjs
 */
import { readFileSync, readdirSync, unlinkSync, rmSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function readGenerated(path) {
  const text = readFileSync(join(ROOT, path), "utf8");
  const paths = new Set();
  for (const m of text.matchAll(/["'](\/(?:cocktails|placeholders|brands|products|photos|uploads|ingredients|hero)[^"']+)["']/g)) {
    paths.add(m[1]);
  }
  return paths;
}

const referenced = new Set([
  ...readGenerated("src/lib/cocktailPlaceholders.generated.js"),
  ...readGenerated("src/lib/brandImages.generated.js"),
  ...readGenerated("src/lib/productImages.generated.js"),
  ...readGenerated("src/lib/galleryPhotos.generated.js"),
  ...readGenerated("src/lib/curatedImages.js"),
  "/logo.png",
  "/hero/hero.png",
  "/uploads/1770264812568-logo.png",
  "/uploads/1770696342937-hero-banner-1.png",
]);

function pruneDir(dir, prefix) {
  if (!existsSync(dir)) return 0;
  let n = 0;
  for (const file of readdirSync(dir)) {
    const rel = `${prefix}/${file}`;
    if (referenced.has(rel)) continue;
    unlinkSync(join(dir, file));
    n++;
    console.log("removed", rel);
  }
  return n;
}

let removed = 0;
removed += pruneDir(join(ROOT, "public/cocktails"), "/cocktails");

for (const file of ["crownrusse.png"]) {
  const rel = `/brands/${file}`;
  if (!referenced.has(rel)) {
    const p = join(ROOT, "public/brands", file);
    if (existsSync(p)) {
      unlinkSync(p);
      removed++;
      console.log("removed", rel);
    }
  }
}

for (const file of [
  "1769963161534-gallery-2.jpg",
  "1769987554439-gallery-7.jpg",
]) {
  const p = join(ROOT, "public/uploads", file);
  if (existsSync(p)) {
    unlinkSync(p);
    removed++;
    console.log("removed", `/uploads/${file}`);
  }
}

console.log(`Pruned ${removed} unused public files.`);
