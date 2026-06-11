export const gbp = (n: number, opts: { decimals?: boolean } = {}) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  }).format(isFinite(n) ? n : 0);

export const pct = (n: number) =>
  `${(Math.round(n * 100) / 100).toLocaleString("en-GB")}%`;
