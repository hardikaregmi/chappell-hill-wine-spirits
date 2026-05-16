import { STORE } from "../lib/storeConfig";

/**
 * Map pin icon.
 * @param {"brand" | "light"} tone — red Google-style pin, or white for coral/accent buttons
 */
export function MapPinIcon({ className = "h-5 w-5", tone = "brand" }) {
  const onAccent = tone === "light";

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill={onAccent ? "currentColor" : "#EA4335"}
      />
      <circle
        cx="12"
        cy="9"
        r="2.5"
        fill={onAccent ? "var(--bg)" : "white"}
      />
    </svg>
  );
}

/**
 * Link to store on Google Maps with map pin icon.
 * @param {"filled" | "outline"} variant
 */
export default function MapsLink({
  children = "Get directions",
  variant = "outline",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center gap-2 rounded-full text-sm font-semibold";

  const styles =
    variant === "filled"
      ? "bg-[color:var(--accent)] px-5 py-2 text-[color:var(--on-accent)] shadow-md hover:bg-[color:var(--accent-hover)]"
      : "border border-[color:var(--border)] bg-[color:var(--surface)] px-7 py-3.5 text-[color:var(--text)] hover:border-[color:var(--accent)]/40";

  return (
    <a
      href={STORE.googleMapsUrl}
      target="_blank"
      rel="noreferrer"
      className={`${base} ${styles} ${className}`}
      {...props}
    >
      <MapPinIcon
        className={variant === "filled" ? "h-4 w-4" : "h-5 w-5"}
        tone={variant === "filled" ? "light" : "brand"}
      />
      {children}
    </a>
  );
}
