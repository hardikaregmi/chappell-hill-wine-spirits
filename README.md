# Chappell Hill Wine & Spirits

Website for **Chappell Hill Wine & Spirits** in Petal, Mississippi.

## Inventory

Product list lives in `scripts/inventory-source.tsv` — **one row per bottle, name only** (no sizes, no prices).

```bash
npm run inventory:build   # dedupe, strip sizes, regenerate catalog
npm run inventory:images  # fetch Wikipedia / Open Food Facts photos
```

## Images & Vercel

**No image APIs run on Vercel.** The homepage reads paths from `src/lib/productImages.generated.js` and `src/lib/brandImages.generated.js`.

Before deploy, run locally (then commit `public/` + the generated files):

```bash
npm run inventory:images      # Wikipedia / Open Food Facts → public/brands/, public/products/
npm run ingredients:cache     # category placeholders → public/ingredients/
```

`npm run inventory:images` calls Wikipedia and Open Food Facts **on your machine only**, downloads files into `public/`, and writes `/brands/...` and `/products/...` paths into the generated JS. Vercel just serves those static files.

For each bottle, `npm run inventory:images` tries in order (for **verified brands only** — see `src/lib/verifiedBrands.js`):

1. Your file in `public/products/{slug}.jpg` (best)
2. [Open Food Facts](https://world.openfoodfacts.org) bottle photo
3. Wikipedia product / bottle photo
4. Wikipedia **brand logo** (same logo shared across flavors)
5. **Brand logo** from Wikipedia for that brand (shared across all bottles from the same label)
6. Last resort — `public/ingredients/{category}.png` (cached from TheCocktailDB)

Verified bottle photos: Absolut, Seagram's, Maker's Mark, Grey Goose, Canadian Club, Canadian Mist, Crown Royal, Evan Williams (regular only), Fireball, Jack Daniel's, Jim Beam, Franzia (boxed wine image), Yellow Tail, 1800, Lunazul, Malibu, Smirnoff.

To add your own bottle photos, place files in `public/products/{slug}.jpg` and reference them in the catalog (or re-run the image script after wiring local paths).

## Development

```bash
npm install
npm run dev
```
