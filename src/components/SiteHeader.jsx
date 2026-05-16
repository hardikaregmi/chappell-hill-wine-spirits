import MapsLink from "./MapsLink";
import BrandLogo from "./BrandLogo";
import FacebookLink from "./FacebookLink";
import PhoneLink from "./PhoneLink";
import { STORE_HOURS } from "../lib/storeConfig";

const navLinkClass =
  "rounded-full px-4 py-2 text-sm font-medium text-[color:var(--text)] hover:bg-[color:var(--surface)]";

function HeaderHours({ className = "" }) {
  return (
    <div
      className={`border-l border-[color:var(--border)] pl-3 text-xs leading-snug text-[color:var(--text)] sm:pl-4 sm:text-sm ${className}`}
      aria-label="Store hours"
    >
      <p>
        <span className="text-[color:var(--muted)]">{STORE_HOURS.weekday.label}</span>{" "}
        <span className="font-semibold">{STORE_HOURS.weekday.time}</span>
      </p>
      <p>
        <span className="text-[color:var(--muted)]">{STORE_HOURS.sunday.label}</span>{" "}
        <span className="font-semibold text-[color:var(--accent)]">
          {STORE_HOURS.sunday.time}
        </span>
      </p>
    </div>
  );
}

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--header-bg)]">
      <nav className="mx-auto max-w-7xl px-5 py-3 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5">
            <a href="#" className="shrink-0">
              <BrandLogo className="h-12 w-auto max-w-[200px] object-contain min-[400px]:max-w-[260px] sm:h-14 sm:max-w-[280px] md:h-[4.25rem] md:max-w-[320px]" />
            </a>
            <HeaderHours />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
            <a href="#selection" className={`${navLinkClass} inline-flex items-center gap-2`}>
              Browse selection
            </a>
            <a href="#photos" className={navLinkClass}>
              Gallery
            </a>
            <PhoneLink />
            <FacebookLink size="sm" className="mx-1" />
            <MapsLink
              variant="filled"
              aria-label="Visit our store — opens directions in Google Maps"
            >
              Visit
            </MapsLink>
          </div>
        </div>
      </nav>
    </header>
  );
}
