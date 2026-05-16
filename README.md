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

## Live chat (Tawk.to)

The floating chat button is implemented in `src/components/TawkTo.jsx` and only loads when **both** are set:

- `NEXT_PUBLIC_TAWK_PROPERTY_ID`
- `NEXT_PUBLIC_TAWK_WIDGET_ID`

Copy them from your Tawk embed URL: `https://embed.tawk.to/PROPERTY_ID/WIDGET_ID` (same workflow as on other sites such as [Cloud Crust CE](https://ce.cloudcrustllc.com/) if you use the **same** Tawk property). Put the values in `.env.local` locally and in **Vercel → Project → Settings → Environment Variables** for production, then **redeploy** (public env vars are embedded at build time).

If the widget does not appear, open the browser dev console: in development you will see a warning when these variables are missing.

**Messages to a phone:** Incoming chats are delivered through the **Tawk.to mobile app** and notification settings in the Tawk dashboard for each agent—not through this codebase. Install the tawk.to app, sign in as an agent, and turn on push notifications for new conversations.

## Development

```bash
npm install
npm run dev
```
