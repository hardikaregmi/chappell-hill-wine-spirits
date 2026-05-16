import FacebookLink from "./FacebookLink";
import { MapPinIcon } from "./MapsLink";
import { STORE } from "../lib/storeConfig";

export default function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface)]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-12 text-sm text-[color:var(--muted)] md:flex-row md:px-8">
        <span className="font-display text-center text-lg text-[color:var(--text)] md:text-left">
          {STORE.name}
        </span>
        <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end">
          <a
            href={STORE.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 text-[color:var(--muted)] hover:text-[color:var(--accent)] md:justify-end"
          >
            <MapPinIcon className="h-4 w-4 shrink-0 text-[color:var(--accent)]" />
            {STORE.address}
          </a>
          <FacebookLink size="md" />
        </div>
      </div>
    </footer>
  );
}
