/**
 * Store branding & links — aligned with Facebook page assets in /public.
 */
export const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=61587108969437";

export const STORE = {
  name: "Chappell Hill Wine & Spirits",
  tagline: "Your go-to place for fine spirits and wines",
  address: "101 Chappell Hill Road, Petal, MS 39465",
  phone: "(386) 292-9878",
  phoneHref: "tel:3862929878",
  email: "winespirits30@gmail.com",
  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=101%20Chappell%20Hill%20Road%2C%20Petal%2C%20MS%2039465",
};

export const STORE_HOURS = {
  weekday: { label: "Mon–Sat", time: "10 AM – 10 PM" },
  sunday: { label: "Sunday", time: "Closed", closed: true },
};

/** Brand assets (from Facebook / store uploads). */
export const BRANDING = {
  logo: "/uploads/1770264812568-logo.png",
  logoFallback: "/logo.png",
  heroBanner: "/uploads/1770696342937-hero-banner-1.png",
  heroFallback: "/hero/hero.png",
  heroIntro: "/photos/intro.jpeg",
  storePhoto: "/photos/store.jpg",
};
