"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { GALLERY_IMAGES } from "../lib/galleryPhotos.generated";

export default function PhotoGallery() {
  const galleryImages = GALLERY_IMAGES;

  const [index, setIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const scrollerRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const swipeRef = useRef(
    /** @type {null | { x: number; pointerId: number }} */ (null),
  );
  const scrollSyncTimerRef = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null));

  const len = galleryImages.length;
  const current = galleryImages[index];

  const syncIndexFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w <= 0) return;
    const next = Math.min(len - 1, Math.max(0, Math.round(el.scrollLeft / w)));
    setIndex((p) => (p === next ? p : next));
  }, [len]);

  const scrollToSlide = useCallback(
    (i) => {
      const el = scrollerRef.current;
      if (!el || len < 1) return;
      const clamped = ((i % len) + len) % len;
      const w = el.clientWidth;
      setIndex(clamped);
      el.scrollTo({
        left: clamped * w,
        behavior: "instant",
      });
    },
    [len],
  );

  /** Keep ResizeObserver callbacks reading latest slide index without effect churn */
  const indexRef = useRef(index);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    const El = ResizeObserver;
    const el = scrollerRef.current;
    if (!el || typeof El !== "function") return;
    const obs = new El(() => {
      const w = el.clientWidth;
      if (w <= 0) return;
      el.scrollTo({
        left: indexRef.current * w,
        behavior: "instant",
      });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /** Sync index after user swipe / scroll settles (debounced — no scrollend dependency) */
  const onScrollerScroll = useCallback(() => {
    if (scrollSyncTimerRef.current) clearTimeout(scrollSyncTimerRef.current);
    scrollSyncTimerRef.current = setTimeout(syncIndexFromScroll, 96);
  }, [syncIndexFromScroll]);

  useEffect(
    () => () => {
      if (scrollSyncTimerRef.current) clearTimeout(scrollSyncTimerRef.current);
    },
    [],
  );

  const goPrev = useCallback(() => {
    scrollToSlide(index - 1);
  }, [index, scrollToSlide]);

  const goNext = useCallback(() => {
    scrollToSlide(index + 1);
  }, [index, scrollToSlide]);

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    swipeRef.current = { x: e.clientX, pointerId: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerUpOrCancel = (e) => {
    const s = swipeRef.current;
    swipeRef.current = null;
    if (!s || s.pointerId !== e.pointerId) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    const dx = e.clientX - s.x;
    if (dx > 48) goPrev();
    else if (dx < -48) goNext();
  };

  useEffect(() => {
    if (!isLightboxOpen) return;
    const prevO = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevO;
      window.removeEventListener("keydown", onKey);
    };
  }, [isLightboxOpen, goNext, goPrev]);

  if (!len || !current) {
    return <p className="mt-4 text-sm text-(--muted)">No photos.</p>;
  }

  return (
    <>

      <div className="mt-6 mx-auto w-full max-w-5xl px-3 sm:px-0">
        <article
          className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface) shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)] ring-1 ring-black/8"
          aria-roledescription="carousel"
          aria-label="Store photos"
        >
          <div role="presentation" className="relative">
            <div
              ref={scrollerRef}
              className="gallery-carousel-viewport touch-pan-y flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden rounded-t-2xl bg-black [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUpOrCancel}
              onPointerCancel={onPointerUpOrCancel}
              onScroll={onScrollerScroll}
            >
              {galleryImages.map((img, i) => (
                <figure
                  key={img.src}
                  className="relative min-w-[100%] shrink-0 grow-0 snap-start snap-always"
                >
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="relative block aspect-[16/11] max-h-[min(58vh,520px)] w-full cursor-zoom-in border-0 bg-black/85 p-0 outline-none md:aspect-[21/10]"
                    aria-label={`Open ${img.alt}`}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="size-full object-contain"
                      decoding="async"
                      loading={i === index ? "eager" : "lazy"}
                    />
                    <span className="pointer-events-none absolute inset-0 rounded-t-2xl ring-1 ring-inset ring-white/8" />
                  </button>
                </figure>
              ))}
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-between px-2 md:px-3">
              <NavBtn onClick={() => goPrev()} label="Previous image">
                <Chevron dir="left" />
              </NavBtn>
              <NavBtn onClick={() => goNext()} label="Next image">
                <Chevron dir="right" />
              </NavBtn>
            </div>
          </div>

          <figcaption className="border-t border-(--border) px-4 py-3 md:px-6 md:py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-w-0 text-sm leading-snug text-(--text) md:text-[15px]">
                {current.alt}
              </p>
              <div
                className="flex shrink-0 items-center justify-center gap-2 sm:justify-end"
                aria-label="Go to slide"
              >
                {galleryImages.map((_, i) => (
                  <button
                    key={galleryImages[i].src}
                    type="button"
                    aria-label={`Slide ${i + 1}`}
                    aria-current={i === index ? "true" : undefined}
                    onClick={() => scrollToSlide(i)}
                    className={`h-2 rounded-full ${
                      i === index
                        ? "w-7 bg-(--accent)"
                        : "w-2 bg-(--muted) opacity-40 hover:opacity-80"
                    }`}
                  />
                ))}
              </div>
            </div>
          </figcaption>
        </article>

        <div
          role="toolbar"
          aria-label="Gallery thumbnails"
          className="mt-4 flex snap-x gap-2 overflow-x-auto pb-2 md:mt-6 md:gap-3 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-(--border)"
        >
          {galleryImages.map((image, i) => (
            <button
              key={image.src}
              type="button"
              onClick={() => scrollToSlide(i)}
              className={`relative aspect-[5/4] h-14 w-[4.5rem] shrink-0 snap-start overflow-hidden rounded-xl border md:h-[4.75rem] md:w-28 ${
                i === index
                  ? "border-(--accent) ring-2 ring-(--accent)/25"
                  : "border-(--border) opacity-72 hover:opacity-100"
              }`}
              aria-label={`Thumbnail ${i + 1}: ${image.alt}`}
              aria-current={i === index}
            >
              <img
                src={image.src}
                alt=""
                decoding="async"
                loading="lazy"
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          Showing image {index + 1} of {len}. {current.alt}
        </p>
      </div>

      {isLightboxOpen && current && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/93 p-3 md:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Full screen gallery"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-[70] rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-white/18 md:right-6 md:top-6"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
          >
            Close
          </button>

          <div
            className="relative mx-auto flex w-full max-h-[calc(100dvh-88px)] max-w-6xl flex-col items-center md:max-h-[calc(100dvh-120px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex flex-1 flex-col items-center justify-center">
              <div className="relative flex w-full items-center justify-center">
                <LightboxArrow
                  side="prev"
                  onClick={() => goPrev()}
                  label="Previous"
                />
                <img
                  key={current.src}
                  src={current.src}
                  alt={current.alt}
                  decoding="async"
                  className="max-h-[calc(100dvh-140px)] w-auto max-w-full rounded-xl object-contain shadow-2xl md:max-h-[calc(100dvh-180px)]"
                />
                <LightboxArrow
                  side="next"
                  onClick={() => goNext()}
                  label="Next"
                />
              </div>
              <div className="mt-3 flex items-center justify-center gap-8 md:hidden">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  className="text-sm font-medium text-white/88"
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  className="text-sm font-medium text-white/88"
                >
                  Next →
                </button>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-center text-sm text-white/82">
              <span className="tabular-nums text-white/50">
                {index + 1} / {len}
              </span>
              {" · "}
              {current.alt}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

/** @param {{ onClick?: () => void; label: string; children?: React.ReactNode }} p */
function NavBtn({ onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      aria-label={label}
      className="pointer-events-auto flex size-11 items-center justify-center rounded-full border border-white/15 bg-[rgb(22_21_19/0.76)] text-white hover:bg-[rgb(35_34_31/0.92)] hover:border-white/26 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent) md:size-12"
    >
      {children}
    </button>
  );
}

/** @param {{ side: "prev" | "next"; onClick: () => void; label: string }} p */
function LightboxArrow({ side, onClick, label }) {
  const isPrev = side === "prev";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      className={`absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-[rgb(38_37_36/0.75)] text-white hover:bg-[rgb(55_53_51/0.88)] md:flex md:size-12 ${isPrev ? "-left-1 xl:-left-8" : "-right-1 xl:-right-8"}`}
    >
      <Chevron dir={isPrev ? "left" : "right"} />
    </button>
  );
}

/** @param {{ dir: "left" | "right" }} p */
function Chevron({ dir }) {
  return (
    <svg
      className="size-6 md:size-[26px]"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      {dir === "left" ? (
        <path
          d="M12.5 5L7.5 10L12.5 15"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M7.5 5L12.5 10L7.5 15"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
