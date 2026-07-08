/**
 * API route proxy untuk endpoint export penilaian satu expert ke PDF.
 *
 * Meneruskan request GET dari browser ke backend FastAPI dan meneruskan
 * response binary (pdf) ke client.
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
 * Menangani GET /api/instruments/[id]/assignments/[assignmentId]/export/pdf — download
 * penilaian satu expert sebagai file PDF.
 *
 * @param _request - HTTP request dari client (tidak digunakan).
 * @param params - Params route dinamis berisi `id` instrumen dan `assignmentId`.
 * @returns File PDF penilaian expert atau pesan error.
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
      `${backendUrl}/api/v1/instruments/${id}/assignments/${assignmentId}/export/pdf`,
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
    `attachment; filename="rating-${assignmentId}.pdf"`;

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition,
    },
  });
}
