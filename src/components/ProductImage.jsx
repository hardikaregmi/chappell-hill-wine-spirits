/** Product photo, brand logo, or category ingredient placeholder. */
export default function ProductImage({
  src,
  alt,
  isVector = false,
  isLogo = false,
  className = "",
  ...props
}) {
  if (isVector) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden
        className={`mx-auto h-[52%] w-[52%] max-w-[140px] object-contain opacity-90 ${className}`}
        {...props}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`h-full w-full object-contain ${isLogo ? "p-6 md:p-8" : "p-4"} ${className}`}
      {...props}
    />
  );
}
