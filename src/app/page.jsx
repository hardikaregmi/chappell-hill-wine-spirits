"use client";

import { useEffect, useMemo, useState } from "react";

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1514361892635-6d3cddd36f24?auto=format&fit=crop&w=1600&q=80",
    alt: "Warm backlit bottles arranged on a bar shelf",
  },
  {
    src: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1600&q=80",
    alt: "Rows of wine bottles with glowing labels",
  },
  {
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80",
    alt: "Rustic bar scene with glassware and bottles",
  },
  {
    src: "https://images.unsplash.com/photo-1527169402691-feff5539e52c?auto=format&fit=crop&w=1600&q=80",
    alt: "Whiskey bottles lined up on a wooden shelf",
  },
  {
    src: "https://images.unsplash.com/photo-1510626176961-4b37d6af6b25?auto=format&fit=crop&w=1600&q=80",
    alt: "Close-up of premium liquor bottles and glass",
  },
  {
    src: "https://images.unsplash.com/photo-1457518919282-b199744eefd6?auto=format&fit=crop&w=1600&q=80",
    alt: "Wine bottles stacked in a dimly lit cellar",
  },
  {
    src: "https://images.unsplash.com/photo-1519972064555-542444e71b0f?auto=format&fit=crop&w=1600&q=80",
    alt: "Colorful cocktail bottles with neon highlights",
  },
  {
    src: "https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=1600&q=80",
    alt: "Shelves of spirits with warm pendant lighting",
  },
  {
    src: "https://images.unsplash.com/photo-1471933311424-646960669fbc?auto=format&fit=crop&w=1600&q=80",
    alt: "Bar cart with premium spirits and garnishes",
  },
];

const googleMapsUrl =
  "https://www.google.com/maps/search/?api=1&query=101%20Chappell%20Hill%20Road%2C%20Petal%2C%20MS%2039465";

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const activeImage = useMemo(
    () => galleryImages[activeIndex],
    [activeIndex],
  );

  const goPrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1,
    );
  };

  const goNext = () => {
    setActiveIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1,
    );
  };

  useEffect(() => {
    if (!isLightboxOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isLightboxOpen]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-rose-500 to-fuchsia-600 text-sm font-bold text-slate-900 shadow-lg">
              CH
            </div>
            <div>
              <p className="text-lg font-semibold">
                Chappell Hill Wine & Spirits
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                Community Liquor Store
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/80">
            <a className="transition hover:text-white" href="#photos">
              Photos
            </a>
            <a className="transition hover:text-white" href="#location">
              Location
            </a>
            <a className="transition hover:text-white" href="#hours">
              Hours
            </a>
            <a className="transition hover:text-white" href="#contact">
              Contact
            </a>
          </div>
          <a
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/10"
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            Get Directions
          </a>
        </nav>
      </header>

      <main>
        <section className="relative min-h-[70vh] overflow-hidden">
          <img
            src="/hero/hero-banner.png"
            alt="Chappell Hill Wine & Spirits hero banner"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/10" />
          <div className="relative mx-auto max-w-6xl px-6 lg:px-10">
            <div className="flex min-h-[78vh] items-center pt-24 lg:pt-28">
              <div className="max-w-xl">
                <p className="mb-4 text-sm uppercase tracking-[0.5em] text-amber-400/70">
                Petal, Mississippi
                </p>
                <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-yellow-200 md:text-6xl">
                  Local picks. Premium pours.
                </h1>
                <p className="mt-5 text-lg leading-relaxed text-yellow-200/80">
                  Your neighborhood wine & spirits shop in Petal—friendly help,
                  great bottles, and weekend favorites.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-yellow-200 shadow-lg transition hover:bg-amber-300"
                    href="#photos"
                  >
                    View Photos
                  </a>
                  <a
                    className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-yellow-200 transition hover:border-white/60 hover:bg-white/10"
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="photos" className="bg-slate-900/60 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                  Photo Gallery
                </p>
                <h2 className="mt-3 text-3xl font-semibold">
                  A vibrant look inside the aisles.
                </h2>
              </div>
              <p className="max-w-lg text-sm text-white/70">
                Scroll through the bottles, tap the arrows to browse, and click
                any image to open a full-screen view.
              </p>
            </div>

            <div className="mt-10 space-y-6">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-2xl">
                <button
                  type="button"
                  className="group relative block w-full"
                  onClick={() => setIsLightboxOpen(true)}
                  aria-label="Open the current photo in a lightbox"
                >
                  <img
                    src={activeImage.src}
                    alt={activeImage.alt}
                    className="h-[420px] w-full object-cover transition duration-500 group-hover:scale-[1.02] md:h-[520px]"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                </button>
                <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs text-white/80 backdrop-blur">
                  {activeIndex + 1} / {galleryImages.length}
                </div>
                <div className="absolute inset-y-0 left-3 flex items-center">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="rounded-full border border-white/20 bg-slate-950/60 p-2 text-white transition hover:border-white/60 hover:bg-slate-950"
                    aria-label="Previous photo"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M12.5 5L7.5 10L12.5 15"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <button
                    type="button"
                    onClick={goNext}
                    className="rounded-full border border-white/20 bg-slate-950/60 p-2 text-white transition hover:border-white/60 hover:bg-slate-950"
                    aria-label="Next photo"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M7.5 5L12.5 10L7.5 15"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-2xl border transition md:h-24 md:w-36 ${
                      index === activeIndex
                        ? "border-amber-400 ring-2 ring-amber-400/60"
                        : "border-white/10 opacity-70 hover:opacity-100"
                    }`}
                    aria-label={`View photo ${index + 1}`}
                    aria-current={index === activeIndex ? "true" : "false"}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="location" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col gap-4">
              <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                Location + Hours
              </p>
              <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-3xl font-semibold">
                  Visit Chappell Hill Wine & Spirits.
                </h2>
                <a
                  className="inline-flex self-center rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow transition hover:bg-amber-300 md:ml-auto md:self-auto"
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Get Directions
                </a>
              </div>
              <p className="max-w-2xl text-sm text-white/70">
                Drop by our Petal shop for a friendly recommendation, seasonal
                picks, and the essentials you rely on every week.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-lg">
                <h3 className="text-xl font-semibold">Storefront</h3>
                <a
                  className="mt-4 inline-flex text-sm text-white/70 transition hover:text-amber-300"
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  101 Chappell Hill Road
                  <br />
                  Petal, MS 39465
                </a>
              </div>

              <div
                id="hours"
                className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-lg"
              >
                <h3 className="text-xl font-semibold">Hours</h3>
                <div className="mt-4 space-y-3 text-sm text-white/70">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span>Mon–Sat</span>
                    <span className="font-semibold text-white">
                      10:00 AM – 10:00 PM
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sunday</span>
                    <span className="font-semibold text-amber-300">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="bg-slate-900/70 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col gap-4">
              <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                Contact
              </p>
              <h2 className="text-3xl font-semibold">
                Let us help you plan the perfect pour.
              </h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
                <p className="text-sm text-white/60">Phone</p>
                <a
                  className="mt-2 inline-flex text-lg font-semibold text-white transition hover:text-amber-300"
                  href="tel:3862929878"
                >
                  3862929878
                </a>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
                <p className="text-sm text-white/60">Email</p>
                <a
                  className="mt-2 inline-flex text-lg font-semibold text-white transition hover:text-amber-300"
                  href="mailto:winespirits30@gmail.com"
                >
                  winespirits30@gmail.com
                </a>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
                <p className="text-sm text-white/60">Address</p>
                <a
                  className="mt-2 inline-flex text-lg font-semibold text-white transition hover:text-amber-300"
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  101 Chappell Hill Road, Petal, MS 39465
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-white/60 md:flex-row">
          <span>Chappell Hill Wine & Spirits</span>
          <span>Serving Petal with premium bottles and warm hospitality.</span>
        </div>
      </footer>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Expanded photo view"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={activeImage.src}
              alt={activeImage.alt}
              className="max-h-[80vh] w-full rounded-3xl object-contain"
            />
            <button
              type="button"
              className="absolute -top-5 right-0 rounded-full border border-white/30 bg-black/70 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:border-white/70"
              onClick={() => setIsLightboxOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
