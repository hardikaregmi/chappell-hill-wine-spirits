import { FACEBOOK_URL } from "../lib/storeConfig";

/** Official Facebook brand blue */
const FB_BLUE = "#1877F2";

function FacebookIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const sizeClasses = {
  sm: { button: "h-9 w-9", icon: "h-4 w-4" },
  md: { button: "h-11 w-11", icon: "h-5 w-5" },
  lg: { button: "h-14 w-14", icon: "h-7 w-7" },
  xl: { button: "h-16 w-16", icon: "h-8 w-8" },
};

/**
 * Facebook page link — blue icon button (no "Facebook" text).
 * @param {"icon" | "pill"} variant — circle icon or pill with optional label
 */
export default function FacebookLink({
  size = "md",
  variant = "icon",
  className = "",
  label,
}) {
  const s = sizeClasses[size] ?? sizeClasses.md;

  if (variant === "pill") {
    return (
      <a
        href={FACEBOOK_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Visit us on Facebook"
        className={`inline-flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-md ${className}`}
        style={{ backgroundColor: FB_BLUE }}
      >
        <span
          className={`inline-flex shrink-0 items-center justify-center rounded-full bg-white/20 ${s.button}`}
        >
          <FacebookIcon className={`${s.icon} text-white`} />
        </span>
        {label ? <span>{label}</span> : null}
      </a>
    );
  }

  return (
    <a
      href={FACEBOOK_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Visit us on Facebook"
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-white shadow-md ${s.button} ${className}`}
      style={{ backgroundColor: FB_BLUE }}
    >
      <FacebookIcon className={s.icon} />
    </a>
  );
}

export { FacebookIcon, FB_BLUE };
