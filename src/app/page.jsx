"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const galleryImages = [
  { src: "/photos/gallery-1.jpg", alt: "Gallery image 1" },
  { src: "/photos/gallery-2.jpg", alt: "Gallery image 2" },
  { src: "/photos/gallery-3.jpg", alt: "Gallery image 3" },
  { src: "/photos/gallery-4.jpg", alt: "Gallery image 4" },
  { src: "/photos/gallery-5.jpg", alt: "Gallery image 5" },
  { src: "/photos/gallery-6.jpg", alt: "Gallery image 6" },
  { src: "/photos/gallery-7.jpg", alt: "Gallery image 7" },
  { src: "/photos/gallery-8.jpg", alt: "Gallery image 8" },
  { src: "/photos/gallery-9.jpg", alt: "Gallery image 9" },
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
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--bg)]/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Chappell Hill Wine & Spirits"
              className="h-10 w-10 rounded-full object-cover shadow-sm transition animate-pulse"
            />
            <div>
              <p className="text-lg font-semibold">
                Chappell Hill Wine & Spirits
              </p>
              <p className="mb-2 text-xs uppercase tracking-[0.15em] text-[color:var(--accent-hover)]">
                Community Liquor Store
              </p>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end gap-5 text-sm font-semibold tracking-[0.02em] text-[color:var(--text)]">
            <a className="border-b border-transparent transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]" href="#hours">
              Hours
            </a>
            <a className="border-b border-transparent transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]" href="#contact">
              Contact
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section className="bg-[color:var(--bg)] py-16">
          <div className="mx-auto max-w-6xl px-6 lg:px-10">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
              <div className="w-full max-w-2xl lg:max-w-[640px]">
                <p className="mb-4 text-sm uppercase tracking-[0.15em] text-amber-700/60">
                  PETAL, MISSISSIPPI
                </p>
                <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-800 md:text-6xl">
                  <span className="block">Local favorites</span>
                  <span className="block">Premium bottles</span>
                </h1>
                <p className="mt-5 max-w-[58ch] text-lg font-medium leading-relaxed text-slate-600 md:leading-[1.7] lg:leading-[1.8]">
                  Your neighborhood wine & spirits shop in Petal. From weeknight favorites to weekend picks, we’ll help you find the right bottle.
                </p>
                <p className="mt-5 max-w-[58ch] text-base font-medium leading-relaxed text-slate-600 md:leading-[1.7] lg:leading-[1.8]">
                  We’re a locally owned shop focused on quality bottles, fair prices, and friendly recommendations. Whether you’re picking up something easy for the week or a special bottle to celebrate, we’re here to help you choose with confidence. Stop by anytime — good wine shouldn’t feel complicated.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    className="rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[color:var(--accent-hover)]"
                    href="#selection"
                  >
                    Browse Selection
                  </a>
                  <a
                    className="rounded-full border border-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-[color:var(--accent)] transition hover:bg-[color:var(--accent)]/10"
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
              <div className="mt-10 flex justify-center lg:mt-0 lg:w-[420px] lg:justify-self-end lg:pr-2 lg:pt-2 xl:w-[480px] xl:pr-6">
                <Image
                  src="/hero/hero.png"
                  alt=""
                  aria-hidden="true"
                  width={520}
                  height={520}
                  sizes="(min-width: 1024px) 520px, 85vw"
                  className="h-auto w-full max-w-[360px] object-contain mix-blend-multiply opacity-90 lg:max-w-none"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="selection" className="bg-[color:var(--bg)] py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.15em] text-[color:var(--accent-hover)]">
                  Browse Selection
                </p>
                <h2 className="mt-2 text-3xl font-bold text-[color:var(--text)]"></h2>
              </div>
              <p className="max-w-lg text-sm text-[color:var(--muted)]"></p>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="group relative rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]">
                <Link
                  href="/liquor"
                  className="absolute inset-0 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
                  aria-label="View all liquor"
                />
                <h3 className="relative z-10 text-2xl font-bold text-[color:var(--accent)]">
                  Liquor
                </h3>
                <div className="relative z-10 mt-5 flex flex-wrap gap-2 text-[13px] text-[color:var(--muted)]">
                  <Link
                    href="/liquor/vodka"
                    className="rounded-full bg-[color:var(--border)]/40 px-2.5 py-1 transition hover:bg-[color:var(--border)]/70 hover:text-[color:var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
                  >
                    Vodka
                  </Link>
                  <Link
                    href="/liquor/whiskey"
                    className="rounded-full bg-[color:var(--border)]/40 px-2.5 py-1 transition hover:bg-[color:var(--border)]/70 hover:text-[color:var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
                  >
                    Whiskey
                  </Link>
                  <Link
                    href="/liquor/tequila"
                    className="rounded-full bg-[color:var(--border)]/40 px-2.5 py-1 transition hover:bg-[color:var(--border)]/70 hover:text-[color:var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
                  >
                    Tequila
                  </Link>
                  <Link
                    href="/liquor/rum"
                    className="rounded-full bg-[color:var(--border)]/40 px-2.5 py-1 transition hover:bg-[color:var(--border)]/70 hover:text-[color:var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
                  >
                    Rum
                  </Link>
                  <Link
                    href="/liquor/gin"
                    className="rounded-full bg-[color:var(--border)]/40 px-2.5 py-1 transition hover:bg-[color:var(--border)]/70 hover:text-[color:var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
                  >
                    Gin
                  </Link>
                  <Link
                    href="/liquor/brandy"
                    className="rounded-full bg-[color:var(--border)]/40 px-2.5 py-1 transition hover:bg-[color:var(--border)]/70 hover:text-[color:var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
                  >
                    Brandy
                  </Link>
                </div>
              </div>

              <div className="group relative rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]">
                <Link
                  href="/wine"
                  className="absolute inset-0 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
                  aria-label="View all wine"
                />
                <h3 className="relative z-10 text-2xl font-bold text-[color:var(--accent)]">
                  Wine
                </h3>
                <div className="relative z-10 mt-5 flex flex-wrap gap-2 text-[13px] text-[color:var(--muted)]">
                  <Link
                    href="/wine/cabernet-sauvignon"
                    className="rounded-full bg-[color:var(--border)]/40 px-2.5 py-1 transition hover:bg-[color:var(--border)]/70 hover:text-[color:var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
                  >
                    Cabernet Sauvignon
                  </Link>
                  <Link
                    href="/wine/merlot"
                    className="rounded-full bg-[color:var(--border)]/40 px-2.5 py-1 transition hover:bg-[color:var(--border)]/70 hover:text-[color:var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
                  >
                    Merlot
                  </Link>
                  <Link
                    href="/wine/pinot-noir"
                    className="rounded-full bg-[color:var(--border)]/40 px-2.5 py-1 transition hover:bg-[color:var(--border)]/70 hover:text-[color:var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
                  >
                    Pinot Noir
                  </Link>
                  <Link
                    href="/wine/pinot-grigio"
                    className="rounded-full bg-[color:var(--border)]/40 px-2.5 py-1 transition hover:bg-[color:var(--border)]/70 hover:text-[color:var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
                  >
                    Pinot Grigio
                  </Link>
                  <Link
                    href="/wine/moscato"
                    className="rounded-full bg-[color:var(--border)]/40 px-2.5 py-1 transition hover:bg-[color:var(--border)]/70 hover:text-[color:var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
                  >
                    Moscato
                  </Link>
                  <Link
                    href="/wine/chardonnay"
                    className="rounded-full bg-[color:var(--border)]/40 px-2.5 py-1 transition hover:bg-[color:var(--border)]/70 hover:text-[color:var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
                  >
                    Chardonnay
                  </Link>
                  <Link
                    href="/wine/sauvignon-blanc"
                    className="rounded-full bg-[color:var(--border)]/40 px-2.5 py-1 transition hover:bg-[color:var(--border)]/70 hover:text-[color:var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
                  >
                    Sauvignon Blanc
                  </Link>
                  <Link
                    href="/wine/riesling"
                    className="rounded-full bg-[color:var(--border)]/40 px-2.5 py-1 transition hover:bg-[color:var(--border)]/70 hover:text-[color:var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
                  >
                    Riesling
                  </Link>
                </div>
              </div>

              <Link
                href="/champagne"
                className="group rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
              >
                <h3 className="text-2xl font-bold text-[color:var(--accent)]">
                  Champagne
                </h3>
                <p className="mt-5 text-sm text-[color:var(--muted)]">
                  Sparkling wines for celebrations and special moments.
                </p>
              </Link>

              <Link
                href="/margaritas"
                className="group rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
              >
                <h3 className="text-2xl font-bold text-[color:var(--accent)]">
                  Margaritas
                </h3>
                <p className="mt-5 text-sm text-[color:var(--muted)]">
                  Ready-to-drink margaritas and tequila-based favorites.
                </p>
              </Link>
            </div>
          </div>
        </section>

        <section id="photos" className="bg-[color:var(--bg)] py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.15em] text-[color:var(--accent-hover)]">
                  Photo Gallery
                </p>
                <h2 className="mt-2 text-3xl font-bold text-[color:var(--text)]"></h2>
              </div>
              <p className="max-w-lg text-sm text-[color:var(--muted)]"></p>
            </div>

            <div className="mt-6 space-y-6">
              <div className="relative overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                <button
                  type="button"
                  className="group relative block w-full"
                  onClick={() => setIsLightboxOpen(true)}
                  aria-label="Open the current photo in a lightbox"
                >
                  <img
                    src={activeImage.src}
                    alt={activeImage.alt}
                    className="h-[420px] w-full object-contain transition duration-500 group-hover:scale-[1.02] md:h-[520px]"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                </button>
                <div className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs text-white/90 backdrop-blur">
                  {activeIndex + 1} / {galleryImages.length}
                </div>
                <div className="absolute inset-y-0 left-3 flex items-center">
                <button
                  type="button"
                  onClick={goPrev}
                    className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)]/80 p-2 text-[color:var(--text)] transition hover:border-[color:var(--accent)]/40 hover:bg-[color:var(--surface)]"
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
                    className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)]/80 p-2 text-[color:var(--text)] transition hover:border-[color:var(--accent)]/40 hover:bg-[color:var(--surface)]"
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
                        ? "border-[color:var(--accent)] ring-2 ring-[color:var(--accent)]/40"
                        : "border-[color:var(--border)] opacity-70 hover:opacity-100"
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

        <section id="contact" className="bg-[color:var(--bg)] py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col gap-4">
              <p className="mb-2 text-sm uppercase tracking-[0.15em] text-[color:var(--accent-hover)]"></p>
              <h2 className="mt-2 text-3xl font-bold text-[color:var(--accent)]">
                Contact
              </h2>
              <p className="text-sm text-[color:var(--muted)]"></p>
            </div>

            <div className="mt-4 grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition hover:border-[color:var(--accent)]/40">
                <p className="text-sm text-[color:var(--muted)]">Phone</p>
                <a
                  className="mt-2 inline-flex text-lg font-semibold text-[color:var(--text)] transition hover:text-[color:var(--accent)]"
                  href="tel:3862929878"
                >
                  3862929878
                </a>
              </div>
              <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition hover:border-[color:var(--accent)]/40">
                <p className="text-sm text-[color:var(--muted)]">Email</p>
                <a
                  className="mt-2 inline-flex text-lg font-semibold text-[color:var(--text)] transition hover:text-[color:var(--accent)]"
                  href="mailto:winespirits30@gmail.com"
                >
                  winespirits30@gmail.com
                </a>
              </div>
              <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition hover:border-[color:var(--accent)]/40">
                <p className="text-sm text-[color:var(--muted)]">Address</p>
                <a
                  className="mt-2 inline-flex text-lg font-semibold text-[color:var(--text)] transition hover:text-[color:var(--accent)]"
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  101 Chappell Hill Road, Petal, MS 39465
                </a>
              </div>
              <div
                id="hours"
                className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition hover:border-[color:var(--accent)]/40"
              >
                <p className="text-sm text-[color:var(--muted)]">Hours</p>
                <div className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
                  <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-2">
                    <span>Mon–Sat</span>
                    <span className="font-semibold text-[color:var(--text)]">
                      10:00 AM – 10:00 PM
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sunday</span>
                    <span className="font-semibold text-[color:var(--accent)]">
                      Closed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[color:var(--border)] bg-[color:var(--bg)] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-[color:var(--muted)] md:flex-row">
          <span>Chappell Hill Wine & Spirits</span>
          <span>Serving Petal with premium bottles and warm hospitality.</span>
        </div>
        <div className="mx-auto mt-3 flex max-w-6xl justify-center px-6 md:justify-end">
          <a
            href="/admin/login"
            className="text-xs text-[color:var(--muted)] transition hover:text-[color:var(--accent)]"
          >
            Admin
          </a>
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
              className="absolute -top-5 right-0 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[color:var(--text)] transition hover:border-[color:var(--accent)]/40"
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
