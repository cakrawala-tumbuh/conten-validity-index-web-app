/**
 * Wrapper HTTP client untuk berkomunikasi dengan backend CVI API.
 *
 * Menangani:
 * - Pemilihan base URL: `BACKEND_API_INTERNAL_URL` di server-side,
 *   `NEXT_PUBLIC_API_URL` di client-side.
 * - Auto-inject header `Authorization: Bearer <token>`.
 * - Normalisasi error menjadi `ApiError` dengan status dan pesan yang konsisten.
 */
import { API_TIMEOUT_MS } from "@/constants";

/**
 * Error yang dilempar saat API mengembalikan response error.
 */
export class ApiError extends Error {
  /** HTTP status code dari response. */
  public readonly status: number;
  /** Detail error dari response body, jika ada. */
  public readonly detail?: unknown;

  /**
   * @param status - HTTP status code.
   * @param message - Pesan error.
   * @param detail - Detail error opsional dari response body.
   */
  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Opsi tambahan untuk request API.
 */
export interface ApiRequestOptions extends RequestInit {
  /** Bearer token untuk autentikasi. Jika diisi, ditambahkan ke header Authorization. */
  token?: string;
}

/**
 * Mendapatkan base URL API yang sesuai dengan context (server atau client).
 *
 * @returns Base URL API tanpa trailing slash.
 */
function getBaseUrl(): string {
  if (typeof window === "undefined") {
    // Server-side: gunakan URL internal Docker (lebih cepat, tidak melewati load balancer)
    return process.env.BACKEND_API_INTERNAL_URL ?? "http://backend:8000";
  }
  // Client-side: gunakan URL publik
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}

/**
 * Melakukan HTTP request ke backend API.
 *
 * Otomatis menambahkan header `Content-Type: application/json` dan
 * `Authorization: Bearer <token>` jika token disediakan.
 * Melempar `ApiError` jika response tidak OK (status >= 400).
 *
 * @param path - Path endpoint, misalnya `/api/v1/instruments`.
 * @param options - Opsi request termasuk token opsional.
 * @returns Data response yang sudah di-parse sebagai JSON.
 * @throws {ApiError} Jika response memiliki status >= 400.
 *
 * @example
 * ```ts
 * const instruments = await apiRequest<InstrumentResponse[]>("/api/v1/instruments", {
 *   token: session.accessToken,
 * });
 * ```
 */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { token, headers, ...restOptions } = options;
  const url = `${getBaseUrl()}${path}`;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(
        408,
        "Request timeout: server tidak merespons dalam waktu yang ditentukan.",
      );
    }
    throw new ApiError(0, "Gagal terhubung ke server. Periksa koneksi internet Anda.");
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let errorDetail: unknown;
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    try {
      const body = await response.json();
      if (body?.detail) {
        errorMessage = typeof body.detail === "string" ? body.detail : errorMessage;
        errorDetail = body.detail;
      }
    } catch {
      // Body bukan JSON — gunakan pesan default
    }
    throw new ApiError(response.status, errorMessage, errorDetail);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Melakukan request untuk men-download file biner (misal: Excel export).
 *
 * @param path - Path endpoint download.
 * @param token - Bearer token untuk autentikasi.
 * @param filename - Nama file yang akan didownload.
 * @throws {ApiError} Jika response memiliki status >= 400.
 */
export async function apiDownload(path: string, token: string, filename: string): Promise<void> {
  const url = `${getBaseUrl()}${path}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `Gagal mendownload file: ${response.statusText}`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}
