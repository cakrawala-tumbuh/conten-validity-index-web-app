/**
 * Unit test untuk `src/lib/api.ts`.
 *
 * Menguji ApiError class dan fungsi `apiRequest` dengan mock fetch.
 */
import { ApiError } from "@/lib/api";

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("ApiError", () => {
  it("harus membuat instance dengan status dan message yang benar", () => {
    const error = new ApiError(404, "Not Found");
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(404);
    expect(error.message).toBe("Not Found");
    expect(error.name).toBe("ApiError");
  });

  it("harus menyertakan detail jika diberikan", () => {
    const error = new ApiError(422, "Validation Error", "field required");
    expect(error.detail).toBe("field required");
  });
});

describe("apiRequest()", () => {
  it("harus mengirim request dengan Authorization header jika token diberikan", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: "1", name: "Test" }),
    });

    const { apiRequest } = await import("@/lib/api");
    await apiRequest("/api/v1/test", { token: "test-token" });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/test"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      }),
    );
  });

  it("harus tidak menambahkan Authorization header jika token tidak diberikan", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    const { apiRequest } = await import("@/lib/api");
    await apiRequest("/api/v1/test");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.not.objectContaining({ Authorization: expect.any(String) }),
      }),
    );
  });

  it("harus melempar ApiError jika response tidak ok dengan detail string", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: async () => ({ detail: "Item not found" }),
    });

    const { apiRequest } = await import("@/lib/api");
    const error = await apiRequest("/api/v1/missing").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(404);
    expect((error as ApiError).message).toBe("Item not found");
  });

  it("harus menggunakan pesan default jika detail bukan string", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({ detail: [{ msg: "value error" }] }),
    });

    const { apiRequest } = await import("@/lib/api");
    const error = await apiRequest("/api/v1/bad").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).message).toBe("Error 400: Bad Request");
  });

  it("harus melempar ApiError dengan pesan default jika body bukan JSON", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => {
        throw new Error("not json");
      },
    });

    const { apiRequest } = await import("@/lib/api");
    const error = await apiRequest("/api/v1/error").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(500);
  });

  it("harus melempar ApiError jika terjadi network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network failure"));

    const { apiRequest } = await import("@/lib/api");
    const error = await apiRequest("/api/v1/test").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(0);
  });

  it("harus mengembalikan null untuk response 204 No Content", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const { apiRequest } = await import("@/lib/api");
    const result = await apiRequest("/api/v1/delete");
    expect(result).toBeNull();
  });
});

describe("apiDownload()", () => {
  const mockCreateObjectURL = jest.fn(() => "blob:http://localhost/test");
  const mockRevokeObjectURL = jest.fn();
  let mockClick: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    mockCreateObjectURL.mockClear();
    mockRevokeObjectURL.mockClear();

    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Pakai anchor jsdom asli (punya `style` & dapat di-append ke DOM); hanya
    // klik yang di-stub agar tidak memicu navigasi sungguhan.
    mockClick = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("harus men-download file dengan sukses", async () => {
    const mockBlob = new Blob(["data"], { type: "application/octet-stream" });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      blob: async () => mockBlob,
    });

    const { apiDownload } = await import("@/lib/api");
    await apiDownload("/api/v1/export", "test-token", "export.xlsx");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/export"),
      expect.objectContaining({
        headers: { Authorization: "Bearer test-token" },
      }),
    );
    expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(mockClick).toHaveBeenCalled();
    // revokeObjectURL ditunda agar unduhan sempat dimulai; flush timer dulu.
    expect(mockRevokeObjectURL).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/test");
  });

  it("harus melempar ApiError jika response tidak ok", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: "Forbidden",
    });

    const { apiDownload } = await import("@/lib/api");
    const error = await apiDownload("/api/v1/export", "bad-token", "export.xlsx").catch(
      (e: unknown) => e,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(403);
  });
});
