/**
 * API route proxy untuk endpoint hapus assignment instrumen backend.
 *
 * Meneruskan request DELETE dari browser ke backend FastAPI
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
 * Menangani DELETE /api/instruments/[id]/assignments/[assignmentId] — menghapus assignment.
 *
 * @param _request - HTTP request dari client (tidak digunakan).
 * @param params - Params route dinamis berisi `id` instrumen dan `assignmentId`.
 * @returns Pesan konfirmasi atau pesan error.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id, assignmentId } = await params;
  const backendUrl = process.env.BACKEND_API_INTERNAL_URL ?? "http://localhost:8000";

  const backendResp = await fetch(
    `${backendUrl}/api/v1/instruments/${id}/assignments/${assignmentId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.accessToken}` },
    },
  );

  const data = await backendResp.json().catch(() => ({}));

  return NextResponse.json(data, { status: backendResp.status });
}
