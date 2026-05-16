"use client";

import { useState } from "react";
import { BRANDING } from "../lib/storeConfig";

export default function BrandLogo({ className = "h-12 w-auto max-w-[280px] object-contain" }) {
  const [src, setSrc] = useState(BRANDING.logo);

  return (
    <img
      src={src}
      alt="Chappell Hill Wine & Spirits"
      className={className}
      onError={() => {
        if (src !== BRANDING.logoFallback) setSrc(BRANDING.logoFallback);
      }}
    />
  );
}
