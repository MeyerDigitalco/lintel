/**
 * HMRC MTD ITSA configuration.
 *
 * Recognition gate: no submission feature is exposed in the UI until HMRC
 * recognition is granted. `MTD_HMRC_RECOGNISED=true` flips the provider's
 * canSubmit() on; until then the local provider's "filing not available" message
 * stands. `MTD_HMRC_ENV` chooses the sandbox or production base URL.
 */

export const HMRC_ENV = (process.env.MTD_HMRC_ENV ?? "sandbox") as "sandbox" | "production";

export const HMRC_BASE_URL =
  HMRC_ENV === "production"
    ? "https://api.service.hmrc.gov.uk"
    : "https://test-api.service.hmrc.gov.uk";

export const HMRC_AUTHORIZE_URL = `${HMRC_BASE_URL}/oauth/authorize`;
export const HMRC_TOKEN_URL = `${HMRC_BASE_URL}/oauth/token`;

/** Scopes required for the ITSA + UK property business endpoints. */
export const HMRC_SCOPES = ["read:self-assessment", "write:self-assessment"];

export const HMRC_CLIENT_ID = process.env.MTD_HMRC_CLIENT_ID ?? "";
export const HMRC_CLIENT_SECRET = process.env.MTD_HMRC_CLIENT_SECRET ?? "";
export const HMRC_REDIRECT_URI =
  process.env.MTD_HMRC_REDIRECT_URI ??
  `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/hmrc/callback`;

/** Master switch: which MTD provider is active. */
export const MTD_PROVIDER = (process.env.MTD_PROVIDER ?? "local") as "local" | "hmrc";

/** True only once HMRC recognition has been granted. */
export const MTD_HMRC_RECOGNISED = process.env.MTD_HMRC_RECOGNISED === "true";

export const VENDOR_PRODUCT_NAME = "Lintel";
export const VENDOR_VERSION = "0.1.0";
