/**
 * Unit test untuk dimension-service.
 *
 * Menguji pemanggilan API untuk CRUD dimensi.
 */
import {
  listDimensions,
  createDimension,
  bulkCreateDimensions,
  updateDimension,
  deleteDimension,
} from "@/services/dimension-service";
import { apiRequest } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  apiRequest: jest.fn(),
}));

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe("dimension-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("harus memanggil listDimensions dengan benar", async () => {
    mockApiRequest.mockResolvedValueOnce([
      { id: "dim-1", instrument_id: "inst-1", name: "A", description: null, created_at: "", updated_at: "" },
    ]);
    const result = await listDimensions("token123", "inst-1");
    expect(mockApiRequest).toHaveBeenCalledWith("/api/v1/instruments/inst-1/dimensions", { token: "token123" });
    expect(result).toHaveLength(1);
  });

  it("harus memanggil createDimension dengan benar", async () => {
    mockApiRequest.mockResolvedValueOnce({
      id: "dim-1", instrument_id: "inst-1", name: "New", description: null, created_at: "", updated_at: "",
    });
    const result = await createDimension("token123", "inst-1", { name: "New" });
    expect(mockApiRequest).toHaveBeenCalledWith("/api/v1/instruments/inst-1/dimensions", {
      method: "POST",
      body: JSON.stringify({ name: "New" }),
      token: "token123",
    });
    expect(result.name).toBe("New");
  });

  it("harus memanggil bulkCreateDimensions dengan benar", async () => {
    mockApiRequest.mockResolvedValueOnce([{ id: "d1" }, { id: "d2" }]);
    const result = await bulkCreateDimensions("token123", "inst-1", {
      dimensions: [{ name: "A" }, { name: "B" }],
    });
    expect(mockApiRequest).toHaveBeenCalledWith("/api/v1/instruments/inst-1/dimensions/bulk", {
      method: "POST",
      body: JSON.stringify({ dimensions: [{ name: "A" }, { name: "B" }] }),
      token: "token123",
    });
    expect(result).toHaveLength(2);
  });

  it("harus memanggil updateDimension dengan benar", async () => {
    mockApiRequest.mockResolvedValueOnce({ id: "dim-1", name: "Updated" });
    await updateDimension("token123", "inst-1", "dim-1", { name: "Updated" });
    expect(mockApiRequest).toHaveBeenCalledWith("/api/v1/instruments/inst-1/dimensions/dim-1", {
      method: "PATCH",
      body: JSON.stringify({ name: "Updated" }),
      token: "token123",
    });
  });

  it("harus memanggil deleteDimension dengan benar", async () => {
    mockApiRequest.mockResolvedValueOnce({ message: "deleted" });
    await deleteDimension("token123", "inst-1", "dim-1");
    expect(mockApiRequest).toHaveBeenCalledWith("/api/v1/instruments/inst-1/dimensions/dim-1", {
      method: "DELETE",
      token: "token123",
    });
  });
});