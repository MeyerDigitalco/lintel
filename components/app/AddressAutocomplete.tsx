"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps, hasGoogleMapsKey, type SelectedAddress } from "@/lib/google-maps";

const inputCls =
  "h-11 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";

/**
 * UK address search using Google Places Autocomplete (new AutocompleteSuggestion API).
 * The input always renders when a key is configured; Places is initialised lazily on
 * the first keystroke so a slow/async script load can never hide the field.
 */
export function AddressAutocomplete({
  onSelect,
}: {
  onSelect: (address: SelectedAddress) => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const placesRef = useRef<any>(null);
  const tokenRef = useRef<any>(null);
  const debounceRef = useRef<any>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const initRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Lazily load Maps + the Places library. Cached after the first call.
  function ensurePlaces(): Promise<any> {
    if (placesRef.current) return Promise.resolve(placesRef.current);
    if (initRef.current) return initRef.current;
    initRef.current = (async () => {
      const google = await loadGoogleMaps();
      if (!google) return null;
      try {
        const places = await google.maps.importLibrary("places");
        if (!places?.AutocompleteSuggestion) return null;
        placesRef.current = places;
        tokenRef.current = new places.AutocompleteSessionToken();
        return places;
      } catch {
        initRef.current = null;
        return null;
      }
    })();
    return initRef.current;
  }

  function handleChange(v: string) {
    setQuery(v);
    if (!v.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const places = await ensurePlaces();
      if (!places) return;
      try {
        const res = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: v,
          sessionToken: tokenRef.current,
          includedRegionCodes: ["gb"],
        });
        const list = res?.suggestions ?? [];
        setSuggestions(list);
        setOpen(list.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, 250);
  }

  async function choose(s: any) {
    try {
      const place = s.placePrediction.toPlace();
      await place.fetchFields({ fields: ["addressComponents", "formattedAddress"] });
      const comps: any[] = place.addressComponents ?? [];
      const find = (t: string) => comps.find((c) => (c.types ?? []).includes(t));
      const txt = (c: any) => (c ? c.longText ?? c.shortText ?? "" : "");
      const num = txt(find("street_number"));
      const route = txt(find("route"));
      const city = txt(find("postal_town")) || txt(find("locality"));
      const postcode = txt(find("postal_code"));
      onSelect({
        line1: [num, route].filter(Boolean).join(" "),
        city,
        postcode,
        formatted: place.formattedAddress ?? "",
      });
      setQuery(place.formattedAddress ?? s.placePrediction?.text?.text ?? "");
    } catch {
      // ignore — fields can be filled manually
    }
    setOpen(false);
    setSuggestions([]);
    if (placesRef.current) tokenRef.current = new placesRef.current.AutocompleteSessionToken();
  }

  // No key at build time → manual entry only (hide the search box).
  if (!hasGoogleMapsKey()) return null;

  return (
    <div ref={boxRef} className="relative">
      <span className="mb-1 block text-sm text-ink">Find your address (search)</span>
      <input
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="Start typing an address…"
        className={inputCls}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lintel border border-hairline bg-surface shadow-card">
          {suggestions.map((s, i) => {
            const pred = s.placePrediction;
            const main = pred?.mainText?.text ?? pred?.text?.text ?? "";
            const secondary = pred?.secondaryText?.text ?? "";
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => choose(s)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-ink/5"
                >
                  <span className="text-ink">{main}</span>
                  {secondary && <span className="ml-1 text-slate">{secondary}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <span className="mt-1 block text-xs text-slate">
        Powered by Google. Pick a result to fill the fields below.
      </span>
    </div>
  );
}
