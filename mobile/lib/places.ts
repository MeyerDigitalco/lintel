// Google Places (new) autocomplete + details. No-ops gracefully without a key.
const KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY ?? "";
export const placesEnabled = Boolean(KEY);

export type Suggestion = { placeId: string; text: string };

export async function autocomplete(input: string): Promise<Suggestion[]> {
  if (!KEY || input.trim().length < 3) return [];
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": KEY },
      body: JSON.stringify({ input, includedRegionCodes: ["gb"] }),
    });
    const data = await res.json();
    return (data.suggestions ?? [])
      .filter((s: any) => s.placePrediction)
      .map((s: any) => ({ placeId: s.placePrediction.placeId, text: s.placePrediction.text?.text ?? "" }));
  } catch {
    return [];
  }
}

export type ParsedAddress = { line1: string; city: string; postcode: string };

export async function placeDetails(placeId: string): Promise<ParsedAddress | null> {
  if (!KEY) return null;
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: { "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": "addressComponents,formattedAddress" },
    });
    const data = await res.json();
    const comps: any[] = data.addressComponents ?? [];
    const get = (type: string) => comps.find((c) => (c.types ?? []).includes(type))?.longText ?? "";
    const streetNo = get("street_number");
    const route = get("route");
    const line1 = [streetNo, route].filter(Boolean).join(" ") || (data.formattedAddress ?? "").split(",")[0];
    const city = get("postal_town") || get("locality") || get("administrative_area_level_2");
    const postcode = get("postal_code");
    return { line1, city, postcode };
  } catch {
    return null;
  }
}
