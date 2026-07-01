/**
 * Lazily loads the Google Maps JavaScript API (Places library) once.
 * Resolves to the `google` global, or null if no key is configured or the
 * script fails to load, callers must degrade gracefully to manual entry.
 */
let loader: Promise<any> | null = null;

export function loadGoogleMaps(): Promise<any> {
  if (typeof window === "undefined") return Promise.resolve(null);

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return Promise.resolve(null);

  const w = window as any;
  if (w.google?.maps) return Promise.resolve(w.google);
  if (loader) return loader;

  loader = new Promise((resolve) => {
    const existing = document.getElementById("google-maps-js") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(w.google ?? null));
      existing.addEventListener("error", () => resolve(null));
      return;
    }
    const script = document.createElement("script");
    script.id = "google-maps-js";
    script.async = true;
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}` +
      `&libraries=places&loading=async&v=weekly`;
    script.onload = () => resolve(w.google ?? null);
    script.onerror = () => {
      loader = null;
      resolve(null);
    };
    document.head.appendChild(script);
  });

  return loader;
}

export const hasGoogleMapsKey = () =>
  typeof process !== "undefined" && Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

export interface SelectedAddress {
  line1: string;
  city: string;
  postcode: string;
  formatted: string;
}
