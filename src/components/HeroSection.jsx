import Image from "next/image";
import { BRANDING, STORE } from "../lib/storeConfig";

export default function HeroSection() {
  return (
    <section className="relative min-h-[min(85vh,740px)] overflow-hidden border-b border-[color:var(--border)]">
      <Image
        src={BRANDING.heroIntro}
        alt="Chappell Hill Wine and Spirits storefront in Petal, Mississippi"
        fill
        priority
        quality={92}
        className="object-cover object-[center_48%]"
        sizes="100vw"
      />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-52 bg-gradient-to-b from-[#f9f7f2]/90 via-[#f9f7f2]/45 to-transparent sm:h-56 md:h-60"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-14 pt-12 sm:px-8 sm:pb-16 sm:pt-14 md:pt-16 lg:pt-20">
        <div className="max-w-xl lg:max-w-2xl">
          <h1 className="font-display text-[2rem] font-semibold leading-[1.12] tracking-tight text-[color:var(--text)] drop-shadow-[0_1px_0_rgba(249,247,242,0.8)] sm:text-4xl lg:text-[2.65rem]">
            {STORE.name}
          </h1>
          <p className="mt-4 text-lg font-medium leading-snug text-[color:var(--text)] sm:text-xl">
            Your go-to place in Petal, Mississippi.
          </p>
        </div>
      </div>
    </section>
  );
}
