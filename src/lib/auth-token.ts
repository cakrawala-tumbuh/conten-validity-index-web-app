/**
 * Utilitas untuk refresh access token Authentik via OAuth2 refresh token grant.
 *
 * Modul ini dipisahkan dari konfigurasi NextAuth agar dapat diuji secara unit
 * tanpa dependensi ke NextAuth runtime.
 */

/** Jumlah detik buffer sebelum token dianggap expired. */
export const TOKEN_EXPIRY_BUFFER_SECONDS = 30;

/**
 * Hasil refresh token yang berhasil dari Authentik token endpoint.
 */
export interface RefreshTokenSuccess {
  ok: true;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: number;
}

/**
 * Hasil refresh token yang gagal.
 */
export interface RefreshTokenError {
  ok: false;
  error: string;
}

/**
 * Hasil dari operasi refresh token.
 */
export type RefreshTokenResult = RefreshTokenSuccess | RefreshTokenError;

/**
 * Respons dari token endpoint Authentik saat refresh berhasil.
 */
interface TokenEndpointResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

/**
 * Memeriksa apakah access token sudah mendekati kedaluwarsa atau telah melewati waktu expiry.
 *
 * @param accessTokenExpiry - Unix timestamp (detik) saat access token kedaluwarsa.
 * @returns `true` jika token perlu di-refresh, `false` jika masih valid.
 *
 * @example
 * ```ts
 * const expiry = Math.floor(Date.now() / 1000) + 20; // 20 detik lagi
 * isTokenExpired(expiry); // true (kurang dari buffer 30 detik)
 * ```
 */
export function isTokenExpired(accessTokenExpiry: number): boolean {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return accessTokenExpiry - nowSeconds < TOKEN_EXPIRY_BUFFER_SECONDS;
}

/**
 * Melakukan refresh access token menggunakan refresh token grant ke Authentik token endpoint.
 *
 * Jika refresh berhasil, mengembalikan token baru. Jika gagal (misalnya refresh token
 * sudah expired atau dicabut), mengembalikan error string.
 *
 * @param params - Parameter untuk refresh token.
 * @param params.tokenEndpoint - URL token endpoint Authentik.
 * @param params.clientId - OAuth2 client ID aplikasi.
 * @param params.clientSecret - OAuth2 client secret aplikasi.
 * @param params.refreshToken - Refresh token yang akan digunakan.
 * @returns Hasil refresh token: success dengan token baru, atau error.
 *
 * @example
 * ```ts
 * const result = await refreshAccessToken({
 *   tokenEndpoint: "https://auth.example.com/application/o/token/",
 *   clientId: "my-client-id",
 *   clientSecret: "my-client-secret",
 *   refreshToken: "stored-refresh-token",
 * });
 *
 * if (result.ok) {
 *   console.log(result.accessToken);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export async function refreshAccessToken(params: {
  tokenEndpoint: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<RefreshTokenResult> {
  const { tokenEndpoint, clientId, clientSecret, refreshToken } = params;

  let response: Response;
  try {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });

    response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
  } catch {
    return { ok: false, error: "RefreshAccessTokenFetchError" };
  }

  if (!response.ok) {
    return { ok: false, error: "RefreshAccessTokenHttpError" };
  }

  let data: TokenEndpointResponse;
  try {
    data = (await response.json()) as TokenEndpointResponse;
  } catch {
    return { ok: false, error: "RefreshAccessTokenParseError" };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);

  return {
    ok: true,
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    accessTokenExpiry: nowSeconds + data.expires_in,
  };
}
