"use client";

import Script from "next/script";
import { useEffect } from "react";
import { STORE } from "../lib/storeConfig";

/**
 * Tawk.to — requires NEXT_PUBLIC_TAWK_PROPERTY_ID and NEXT_PUBLIC_TAWK_WIDGET_ID
 * from the embed URL: https://embed.tawk.to/PROPERTY_ID/WIDGET_ID
 * Add to .env.local and restart `npm run dev`. For Vercel, add the same env vars to the project.
 */
export default function TawkTo() {
  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID?.trim();
  const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID?.trim();

  useEffect(() => {
    if (propertyId && widgetId) return;
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[TawkTo] Widget disabled: set NEXT_PUBLIC_TAWK_PROPERTY_ID and NEXT_PUBLIC_TAWK_WIDGET_ID in .env.local (from embed URL embed.tawk.to/…/…). Restart the dev server after saving.",
      );
    }
  }, [propertyId, widgetId]);

  if (!propertyId || !widgetId) return null;

  const embedSrc = `https://embed.tawk.to/${propertyId}/${widgetId}`;
  const phoneJson = JSON.stringify(STORE.phone);

  return (
    <Script
      id="tawk-bootstrap"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(){
if(document.getElementById("tawk-embed-script"))return;
var Tawk_API=Tawk_API||{},Tawk_LoadStart=new Date();
Tawk_API.onLoad=function(){
try{Tawk_API.setAttributes({Phone:${phoneJson}},function(){});}catch(e){}
};
var s1=document.createElement("script");
s1.id="tawk-embed-script";
s1.async=true;
s1.src=${JSON.stringify(embedSrc)};
s1.charset="UTF-8";
s1.setAttribute("crossorigin","*");
var s0=document.getElementsByTagName("script")[0];
if(s0&&s0.parentNode)s0.parentNode.insertBefore(s1,s0);
else document.head.appendChild(s1);
})();`,
      }}
    />
  );
}
