import { FacebookIcon, FB_BLUE } from "./FacebookLink";
import { MapPinIcon } from "./MapsLink";
import { FACEBOOK_URL, STORE, STORE_HOURS } from "../lib/storeConfig";

const cards = [
  { label: "Phone", href: STORE.phoneHref, value: STORE.phone },
  { label: "Email", href: `mailto:${STORE.email}`, value: STORE.email },
  {
    label: "Address",
    href: STORE.googleMapsUrl,
    value: STORE.address,
    external: true,
  },
];

const cardClass =
  "relative overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[0_8px_28px_rgba(61,43,31,0.06)]";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="border-t border-[color:var(--border)] bg-[linear-gradient(180deg,var(--bg)_0%,color-mix(in_srgb,var(--surface)_85%,var(--bg))_100%)] py-20"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div>
        
          <h2 className="mt-2 font-display text-3xl font-semibold text-[color:var(--accent)] md:text-4xl">
            VISIT US TODAY !
          </h2>
         
          
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Visit us on Facebook"
            className={`${cardClass} flex flex-col items-center justify-center text-center`}
          >
            <span
              className="inline-flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-md"
              style={{ backgroundColor: FB_BLUE }}
            >
              <FacebookIcon className="h-8 w-8" />
            </span>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">
              Social
            </p>
            <p className="mt-2 font-semibold text-[color:var(--text)]">
              Follow for updates
            </p>
          </a>

          {cards.map((card) => {
            const inner = (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                  {card.label}
                </p>
                <p className="mt-3 flex items-start gap-2 font-semibold leading-snug text-[color:var(--text)]">
                  {card.label === "Address" ? (
                    <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--accent)]" />
                  ) : null}
                  {card.value}
                </p>
              </>
            );

            if (card.label === "Address") {
              return (
                <a
                  key={card.label}
                  href={card.href}
                  target="_blank"
                  rel="noreferrer"
                  className={cardClass}
                >
                  {inner}
                </a>
              );
            }

            return (
              <a
                key={card.label}
                href={card.href}
                target={card.external ? "_blank" : undefined}
                rel={card.external ? "noreferrer" : undefined}
                className={cardClass}
              >
                {inner}
              </a>
            );
          })}

          <div
            id="hours"
            className={`${cardClass} sm:col-span-2 lg:col-span-1`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--muted)]">
              Hours
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between border-b border-[color:var(--border)] pb-2">
                <span className="text-[color:var(--muted)]">
                  {STORE_HOURS.weekday.label}
                </span>
                <span className="font-semibold text-[color:var(--text)]">
                  {STORE_HOURS.weekday.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[color:var(--muted)]">
                  {STORE_HOURS.sunday.label}
                </span>
                <span className="font-semibold text-[color:var(--accent)]">
                  {STORE_HOURS.sunday.time}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
