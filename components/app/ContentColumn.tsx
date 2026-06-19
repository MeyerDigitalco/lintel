"use client";

import React from "react";

// Regional landscape behind the content column on every dashboard page.
export function ContentColumn({
  region,
  dir,
  children,
}: {
  region: string;
  dir: "ltr" | "rtl";
  children: React.ReactNode;
}) {
  const style: React.CSSProperties = {
    backgroundImage:
      `linear-gradient(to bottom, rgba(246,248,251,0.28) 0px, rgba(246,248,251,0.62) 110px, #F6F8FB 230px), ` +
      `url(/regions/${region}.jpg), url(/regions/${region}.svg)`,
    backgroundRepeat: "no-repeat, no-repeat, no-repeat",
    backgroundSize: "cover, cover, cover",
    backgroundPosition: "center top, center top, center top",
    backgroundAttachment: "scroll, scroll, scroll",
  };
  return (
    <div className="flex min-w-0 flex-1 flex-col" style={style} dir={dir}>
      {children}
    </div>
  );
}
