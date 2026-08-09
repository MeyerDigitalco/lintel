"use client";

import Script from "next/script";

/**
 * Google Analytics 4 with Consent Mode v2.
 *
 * UK PECR / ICO guidance requires prior consent before non-essential (analytics)
 * cookies are set. Rather than conditionally injecting the tag, we load gtag
 * with consent DENIED by default, then flip it to granted only when the visitor
 * accepts in the cookie banner. Until then GA runs in cookieless "consent
 * denied" mode and stores nothing on the device.
 *
 * No-ops entirely if NEXT_PUBLIC_GA_ID is unset, so preview and local builds
 * never phone home.
 */
export function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id) return null;

  return (
    <>
      <Script
        id="ga-consent-default"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            // Default everything to denied until the visitor accepts.
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              wait_for_update: 500
            });
            // If the visitor already accepted on a previous visit, honour it now.
            try {
              if (localStorage.getItem('lintel_cookie_consent') === 'accepted') {
                gtag('consent', 'update', { analytics_storage: 'granted' });
              }
            } catch (e) {}
            gtag('js', new Date());
            gtag('config', '${id}', { anonymize_ip: true });
          `,
        }}
      />
      <Script
        id="ga-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
      />
    </>
  );
}
