"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps, type SelectedAddress } from "@/lib/google-maps";

/**
 * Google Places address search using the new PlaceAutocompleteElement.
 * UK-restricted. On selection it parses the address components and calls
 * onSelect with line1/city/postcode. Renders nothing if no key is configured
 * (the form falls back to manual entry).
 */
export function AddressAutocomplete({
  onSelect,
}: {
  onSelect: (address: SelectedAddress) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const google = await loadGoogleMaps();
      if (!google || cancelled || !containerRef.current) return;

      let places: any;
      try {
        places = await google.maps.importLibrary("places");
      } catch {
        return;
      }
      if (cancelled || !places?.PlaceAutocompleteElement) return;

      let el: any;
      try {
        el = new places.PlaceAutocompleteElement({ includedRegionCodes: ["gb"] });
      } catch {
        // Older signature fallback.
        try {
          el = new places.PlaceAutocompleteElement();
        } catch {
          return;
        }
      }

      el.style.width = "100%";
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(el);
      setAvailable(true);

      el.addEventListener("gmp-select", async (event: any) => {
        try {
          const prediction = event?.placePrediction;
          if (!prediction) return;
          const place = prediction.toPlace();
          await place.fetchFields({
            fields: ["addressComponents", "formattedAddress"],
          });
          const comps: any[] = place.addressComponents ?? [];
          const find = (type: string) =>
            comps.find((c) => (c.types ?? []).includes(type));
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
        } catch {
          // ignore — user can fill manually
        }
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [onSelect]);

  return (
    <div>
      <div
        ref={containerRef}
        className="rounded-lintel border border-hairline bg-surface [&_*]:font-sans"
      />
      {available && (
        <span className="mt-1 block text-xs text-slate">
          Search for the address, then check the fields below.
        </span>
      )}
    </div>
  );
}
