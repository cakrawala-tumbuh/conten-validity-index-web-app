/**
 * Unit test untuk `src/lib/auth-token.ts`.
 *
 * Menguji fungsi `isTokenExpired` dan `refreshAccessToken` secara terisolasi
 * tanpa dependensi eksternal menggunakan mock global fetch.
 */
import { isTokenExpired, refreshAccessToken, TOKEN_EXPIRY_BUFFER_SECONDS } from "@/lib/auth-token";

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// ─────────────────────────────────────────────
//  isTokenExpired
// ─────────────────────────────────────────────

describe("isTokenExpired()", () => {
  it("harus mengembalikan false jika token masih jauh dari expiry", () => {
    jest.setSystemTime(new Date("2026-06-01T00:00:00Z"));
    const nowSeconds = Math.floor(Date.now() / 1000);
    // Token expired 10 menit lagi — masih valid
    const expiry = nowSeconds + 600;
    expect(isTokenExpired(expiry)).toBe(false);
  });

  it("harus mengembalikan true jika token expired persis pada batas buffer", () => {
    jest.setSystemTime(new Date("2026-06-01T00:00:00Z"));
    const nowSeconds = Math.floor(Date.now() / 1000);
    // Token expired tepat dalam buffer (29 detik lagi < 30 detik buffer)
    const expiry = nowSeconds + TOKEN_EXPIRY_BUFFER_SECONDS - 1;
    expect(isTokenExpired(expiry)).toBe(true);
  });

  it("harus mengembalikan true jika token sudah expired", () => {
    jest.setSystemTime(new Date("2026-06-01T00:00:00Z"));
    const nowSeconds = Math.floor(Date.now() / 1000);
    // Token expired 5 menit yang lalu
    const expiry = nowSeconds - 300;
    expect(isTokenExpired(expiry)).toBe(true);
  });

  it("harus mengembalikan false jika token akan expired tepat setelah buffer", () => {
    jest.setSystemTime(new Date("2026-06-01T00:00:00Z"));
    const nowSeconds = Math.floor(Date.now() / 1000);
    // Token expired tepat di luar buffer (31 detik lagi > 30 detik buffer)
    const expiry = nowSeconds + TOKEN_EXPIRY_BUFFER_SECONDS + 1;
    expect(isTokenExpired(expiry)).toBe(false);
  });
});

// ─────────────────────────────────────────────
//  refreshAccessToken
// ─────────────────────────────────────────────

describe("refreshAccessToken()", () => {
  const defaultParams = {
    tokenEndpoint: "https://auth.example.com/application/o/token/",
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    refreshToken: "old-refresh-token",
  };

  it("harus mengembalikan token baru jika refresh berhasil", async () => {
    jest.setSystemTime(new Date("2026-06-01T00:00:00Z"));
    const nowSeconds = Math.floor(Date.now() / 1000);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
        expires_in: 3600,
        token_type: "Bearer",
      }),
    });

    const result = await refreshAccessToken(defaultParams);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.accessToken).toBe("new-access-token");
      expect(result.refreshToken).toBe("new-refresh-token");
      expect(result.accessTokenExpiry).toBe(nowSeconds + 3600);
    }
  });

  it("harus mempertahankan refresh token lama jika server tidak mengembalikan refresh_token baru", async () => {
    jest.setSystemTime(new Date("2026-06-01T00:00:00Z"));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: "new-access-token",
        expires_in: 3600,
        token_type: "Bearer",
        // refresh_token tidak dikembalikan
      }),
    });

    const result = await refreshAccessToken(defaultParams);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.refreshToken).toBe("old-refresh-token");
    }
  });

  it("harus mengirim request ke token endpoint dengan body yang benar", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: "new-access-token",
        expires_in: 3600,
        token_type: "Bearer",
      }),
    });

    await refreshAccessToken(defaultParams);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://auth.example.com/application/o/token/");
    expect(options.method).toBe("POST");
    expect((options.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/x-www-form-urlencoded",
    );

    const body = new URLSearchParams(options.body as string);
    expect(body.get("grant_type")).toBe("refresh_token");
    expect(body.get("refresh_token")).toBe("old-refresh-token");
    expect(body.get("client_id")).toBe("test-client-id");
    expect(body.get("client_secret")).toBe("test-client-secret");
  });

  it("harus mengembalikan error jika response HTTP tidak ok (4xx/5xx)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
    });

    const result = await refreshAccessToken(defaultParams);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("RefreshAccessTokenHttpError");
    }
  });

  it("harus mengembalikan error jika fetch melempar exception (network error)", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await refreshAccessToken(defaultParams);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("RefreshAccessTokenFetchError");
    }
  });

  it("harus mengembalikan error jika response body bukan JSON valid", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error("Invalid JSON");
      },
    });

    const result = await refreshAccessToken(defaultParams);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("RefreshAccessTokenParseError");
    }
  });

  it("harus menghitung accessTokenExpiry berdasarkan waktu sekarang + expires_in", async () => {
    jest.setSystemTime(new Date("2026-06-01T12:00:00Z"));
    const nowSeconds = Math.floor(Date.now() / 1000);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: "new-token",
        expires_in: 1800, // 30 menit
        token_type: "Bearer",
      }),
    });

    const result = await refreshAccessToken(defaultParams);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.accessTokenExpiry).toBe(nowSeconds + 1800);
    }
  });
});
