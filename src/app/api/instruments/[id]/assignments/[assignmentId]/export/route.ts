/**
 * API route proxy untuk endpoint export penilaian satu expert ke Excel.
 *
 * Meneruskan request GET dari browser ke backend FastAPI dan meneruskan
 * response binary (xlsx) ke client.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Params route dinamis.
 */
interface RouteParams {
  params: Promise<{ id: string; assignmentId: string }>;
}

/**
 * Menangani GET /api/instruments/[id]/assignments/[assignmentId]/export — download
 * penilaian satu expert sebagai file Excel.
 *
 * @param _request - HTTP request dari client (tidak digunakan).
 * @param params - Params route dinamis berisi `id` instrumen dan `assignmentId`.
 * @returns File Excel penilaian expert atau pesan error.
 */
export async function GET(_request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id, assignmentId } = await params;
  const backendUrl = process.env.BACKEND_API_INTERNAL_URL ?? "http://localhost:8000";

  let backendResp: Response;
  try {
    backendResp = await fetch(
      `${backendUrl}/api/v1/instruments/${id}/assignments/${assignmentId}/export`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } },
    );
  } catch {
    return NextResponse.json(
      { detail: "Tidak dapat terhubung ke server backend untuk mengekspor penilaian." },
      { status: 502 },
    );
  }

  if (!backendResp.ok) {
    const data = await backendResp.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendResp.status });
  }

  const blob = await backendResp.arrayBuffer();
  const contentDisposition =
    backendResp.headers.get("content-disposition") ??
    `attachment; filename="rating-${assignmentId}.xlsx"`;

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": contentDisposition,
    },
  });
}
