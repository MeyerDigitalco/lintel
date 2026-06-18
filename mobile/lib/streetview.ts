// Google Street View Static image. Reuses the Places key (Street View Static
// API must be enabled on it). Returns null when unavailable.
const KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY ?? "";

export function streetViewUrl(
  p: { address_line1?: string | null; city?: string | null; postcode?: string | null },
  size = "640x320"
): string | null {
  if (!KEY) return null;
  const loc = [p.address_line1, p.city, p.postcode].filter(Boolean).join(", ");
  if (!loc) return null;
  return `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${encodeURIComponent(loc)}&fov=80&pitch=8&source=outdoor&key=${KEY}`;
}
