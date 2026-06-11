import {
  HMRC_AUTHORIZE_URL,
  HMRC_TOKEN_URL,
  HMRC_SCOPES,
  HMRC_CLIENT_ID,
  HMRC_CLIENT_SECRET,
  HMRC_REDIRECT_URI,
} from "./config";

/**
 * HMRC OAuth 2.0 (authorization code grant) for user-restricted endpoints.
 * The landlord grants Lintel access once; we then store and refresh tokens.
 */

export interface HmrcTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  scope: string;
}

/** Build the consent URL the landlord is redirected to. */
export function authorizeUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: HMRC_CLIENT_ID,
    scope: HMRC_SCOPES.join(" "),
    redirect_uri: HMRC_REDIRECT_URI,
    state,
  });
  return `${HMRC_AUTHORIZE_URL}?${params.toString()}`;
}

async function tokenRequest(body: Record<string, string>): Promise<HmrcTokens> {
  const res = await fetch(HMRC_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: HMRC_CLIENT_ID,
      client_secret: HMRC_CLIENT_SECRET,
      redirect_uri: HMRC_REDIRECT_URI,
      ...body,
    }).toString(),
  });
  if (!res.ok) {
    throw new Error(`HMRC token error ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in,
    scope: json.scope,
  };
}

/** Exchange an authorization code for tokens. */
export function exchangeCode(code: string): Promise<HmrcTokens> {
  return tokenRequest({ grant_type: "authorization_code", code });
}

/** Refresh an expired access token. */
export function refreshTokens(refreshToken: string): Promise<HmrcTokens> {
  return tokenRequest({ grant_type: "refresh_token", refresh_token: refreshToken });
}
