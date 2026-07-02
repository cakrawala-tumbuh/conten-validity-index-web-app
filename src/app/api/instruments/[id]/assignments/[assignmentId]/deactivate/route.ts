/**
 * API route proxy untuk endpoint nonaktifkan penilaian assignment instrumen.
 *
 * Meneruskan request POST dari browser ke backend FastAPI
 * dengan access token dari sesi NextAuth.
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
 * Menangani POST /api/instruments/[id]/assignments/[assignmentId]/deactivate.
 *
 * Menonaktifkan penilaian assignment sehingga dieksklusi dari kalkulasi CVI,
 * tanpa menghapus data penilaian yang sudah ada.
 *
 * @param _request - HTTP request dari client (tidak digunakan, tanpa request body).
 * @param params - Params route dinamis berisi `id` instrumen dan `assignmentId`.
 * @returns AssignmentResponse dengan `is_active: false`, atau pesan error.
 */
export async function POST(_request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id, assignmentId } = await params;
  const backendUrl = process.env.BACKEND_API_INTERNAL_URL ?? "http://localhost:8000";

  const backendResp = await fetch(
    `${backendUrl}/api/v1/instruments/${id}/assignments/${assignmentId}/deactivate`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${session.accessToken}` },
    },
  );

  const data = await backendResp.json().catch(() => ({}));

  return NextResponse.json(data, { status: backendResp.status });
}
