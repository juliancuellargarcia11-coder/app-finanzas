// Injects PWA-critical <head> tags at runtime. Needed because Expo Router's
// +html.tsx only takes effect on the exported build, not on the dev server.
// No-op on native.

import { useEffect } from "react";
import { Platform } from "react-native";

function upsertMeta(attrs: Record<string, string>) {
  const key = attrs.name || attrs.property || attrs["http-equiv"] || attrs.rel;
  if (!key) return;
  const selector = attrs.name
    ? `meta[name="${attrs.name}"]`
    : attrs.property
      ? `meta[property="${attrs.property}"]`
      : `meta[http-equiv="${attrs["http-equiv"]}"]`;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

function upsertLink(rel: string, href: string, extra: Record<string, string> = {}) {
  const sizes = extra.sizes ? `[sizes="${extra.sizes}"]` : "";
  const selector = `link[rel="${rel}"]${sizes}`;
  let el = document.head.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  Object.entries(extra).forEach(([k, v]) => el!.setAttribute(k, v));
}

export function WebHead() {
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof document === "undefined") return;

    try {
      document.title = "PinkBudget 💗";
      document.documentElement.setAttribute("lang", "es");

      // Viewport with safe-area support
      upsertMeta({
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no",
      });

      upsertMeta({
        name: "description",
        content: "Tus finanzas personales en pesos colombianos, con estilo 💗",
      });

      // PWA manifest + theme
      upsertLink("manifest", "/manifest.webmanifest");
      upsertMeta({ name: "theme-color", content: "#D81B60" });

      // iOS install-to-home-screen
      upsertMeta({ name: "apple-mobile-web-app-capable", content: "yes" });
      upsertMeta({ name: "mobile-web-app-capable", content: "yes" });
      upsertMeta({
        name: "apple-mobile-web-app-status-bar-style",
        content: "black-translucent",
      });
      upsertMeta({ name: "apple-mobile-web-app-title", content: "PinkBudget" });
      upsertLink("apple-touch-icon", "/apple-touch-icon.png");
      upsertLink("apple-touch-icon", "/icon-192.png", { sizes: "192x192" });
      upsertLink("apple-touch-icon", "/icon-512.png", { sizes: "512x512" });

      // Body safe-area padding + background so the notch/dynamic-island area
      // is filled with the app color when installed.
      const bg = getComputedStyle(document.documentElement).getPropertyValue("--pb-bg") || "#FFF9FA";
      document.documentElement.style.backgroundColor = bg;
      document.body.style.overscrollBehaviorY = "none";

      // Register service worker (only in HTTPS or localhost)
      if ("serviceWorker" in navigator) {
        const canRegister =
          window.location.protocol === "https:" ||
          window.location.hostname === "localhost";
        if (canRegister) {
          navigator.serviceWorker.register("/sw.js").catch(() => {});
        }
      }
    } catch {
      // ignore
    }
  }, []);

  return null;
}
