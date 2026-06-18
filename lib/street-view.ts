// Google Street View Static image for a property address. Uses the same key as
// the Maps JS API (Street View Static API must be enabled on it).
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export const streetViewEnabled = Boolean(KEY);

export function streetViewUrl(
  parts: { address_line1?: string | null; city?: string | null; postcode?: string | null },
  size = "640x320"
): string | null {
  if (!KEY) return null;
  const loc = [parts.address_line1, parts.city, parts.postcode].filter(Boolean).join(", ");
  if (!loc) return null;
  return (
    `https://maps.googleapis.com/maps/api/streetview?size=${size}` +
    `&location=${encodeURIComponent(loc)}&fov=80&pitch=8&source=outdoor&key=${KEY}`
  );
}
