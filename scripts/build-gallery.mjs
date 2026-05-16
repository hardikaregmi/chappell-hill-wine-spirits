/**
 * Scan public/photos and write gallery manifest.
 * Run: npm run gallery:build
 */
import { readdirSync, writeFileSync } from "fs";
import { join } from "path";

const photosDir = join(process.cwd(), "public/photos");

function sortKey(filename) {
  if (filename === "store.jpg") return "0";
  const g = filename.match(/^gallery-(\d+)/i);
  if (g) return `1-${String(g[1]).padStart(3, "0")}`;
  return `2-${filename}`;
}

function altFromFilename(filename) {
  if (filename === "store.jpg") return "Inside Chappell Hill Wine & Spirits";
  const g = filename.match(/^gallery-(\d+)/i);
  if (g) return `Store photo ${g[1]}`;
  return "Chappell Hill Wine & Spirits";
}

const files = readdirSync(photosDir)
  .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
  .sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

const images = files.map((file) => ({
  src: `/photos/${file}`,
  alt: altFromFilename(file),
}));

writeFileSync(
  join(process.cwd(), "src/lib/galleryPhotos.generated.js"),
  `/** Auto-generated — run: npm run gallery:build */\nexport const GALLERY_IMAGES = ${JSON.stringify(images, null, 2)};\n`,
);

console.log(`Gallery: ${images.length} photos from public/photos/`);
