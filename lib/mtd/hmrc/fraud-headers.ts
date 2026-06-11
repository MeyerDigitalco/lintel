import { VENDOR_PRODUCT_NAME, VENDOR_VERSION } from "./config";

/**
 * HMRC fraud-prevention headers (Gov-Client-* / Gov-Vendor-*).
 *
 * HMRC requires these on every MTD API call. For a server-rendered web app the
 * connection method is WEB_APP_VIA_SERVER, and the originating client details
 * must be forwarded from the user's request. This builder assembles the headers
 * from a request context; the caller is responsible for collecting that context
 * (IP, user-agent, screen/timezone via a client beacon) on the originating
 * request. Values are URL-encoded per HMRC's spec.
 *
 * See: https://developer.service.hmrc.gov.uk/guides/fraud-prevention/
 */
export interface ClientContext {
  publicIp?: string;
  publicPort?: string;
  userAgent?: string;
  /** device id persisted in a first-party cookie */
  deviceId?: string;
  /** e.g. "UTC+00:00" */
  timezone?: string;
  /** "width=1920&height=1080&scaling-factor=1&colour-depth=24" */
  screens?: string;
  /** comma-separated window size, e.g. "width=1280&height=720" */
  windowSize?: string;
  /** the Lintel auth user id (pseudonymised), for Gov-Client-User-IDs */
  userId?: string;
  /** server's own outbound/local IPs */
  serverIps?: string[];
}

const enc = (v: string) => encodeURIComponent(v);

export function buildFraudHeaders(ctx: ClientContext): Record<string, string> {
  const headers: Record<string, string> = {
    "Gov-Client-Connection-Method": "WEB_APP_VIA_SERVER",
    "Gov-Vendor-Product-Name": enc(VENDOR_PRODUCT_NAME),
    "Gov-Vendor-Version": enc(`${VENDOR_PRODUCT_NAME}=${VENDOR_VERSION}`),
  };

  if (ctx.deviceId) headers["Gov-Client-Device-ID"] = ctx.deviceId;
  if (ctx.publicIp) headers["Gov-Client-Public-IP"] = ctx.publicIp;
  if (ctx.publicPort) headers["Gov-Client-Public-Port"] = ctx.publicPort;
  if (ctx.userId) headers["Gov-Client-User-IDs"] = `os=${enc(ctx.userId)}`;
  if (ctx.timezone) headers["Gov-Client-Timezone"] = ctx.timezone;
  if (ctx.userAgent) headers["Gov-Client-User-Agent"] = enc(ctx.userAgent);
  if (ctx.screens) headers["Gov-Client-Screens"] = ctx.screens;
  if (ctx.windowSize) headers["Gov-Client-Window-Size"] = ctx.windowSize;
  if (ctx.serverIps?.length)
    headers["Gov-Vendor-Public-IP"] = ctx.serverIps[0];

  return headers;
}
