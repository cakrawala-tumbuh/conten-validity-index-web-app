/**
 * API route proxy untuk endpoint export CVI instrumen ke PDF.
 *
 * Meneruskan request GET dari browser ke backend FastAPI dan
 * meneruskan response binary (pdf) ke client.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Params route dinamis.
 */
interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Menangani GET /api/instruments/[id]/cvi/export/pdf — download hasil CVI sebagai file PDF.
 *
 * @param _request - HTTP request dari client (tidak digunakan).
 * @param params - Params route dinamis berisi `id` instrumen.
 * @returns File PDF atau pesan error.
 */
export async function GET(_request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id } = await params;
  const backendUrl = process.env.BACKEND_API_INTERNAL_URL ?? "http://localhost:8000";

  let backendResp: Response;
  try {
    backendResp = await fetch(`${backendUrl}/api/v1/instruments/${id}/cvi/export/pdf`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
  } catch {
    return NextResponse.json(
      { detail: "Tidak dapat terhubung ke server backend untuk mengekspor PDF." },
      { status: 502 },
    );
  }

  if (!backendResp.ok) {
    const data = await backendResp.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendResp.status });
  }

  const blob = await backendResp.arrayBuffer();
  const contentDisposition =
    backendResp.headers.get("content-disposition") ?? `attachment; filename="cvi-${id}.pdf"`;

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition,
    },
  });
}
