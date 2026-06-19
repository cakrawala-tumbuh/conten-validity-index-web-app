/**
 * API route proxy untuk endpoint reopen assignment backend.
 *
 * Meneruskan request POST (reopen) dari browser ke backend FastAPI
 * dengan access token dari sesi NextAuth.
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
 * Menangani POST /api/assignments/[id]/reopen — membuka kembali assignment yang selesai.
 *
 * @param request - HTTP request.
 * @param params - Params route dinamis berisi `id` assignment.
 * @returns Data assignment yang sudah diperbarui atau pesan error.
 */
export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id } = await params;
  const backendUrl = process.env.BACKEND_API_INTERNAL_URL ?? "http://localhost:8000";

  const backendResp = await fetch(`${backendUrl}/api/v1/assignments/${id}/reopen`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  const data = await backendResp.json().catch(() => ({}));

  return NextResponse.json(data, { status: backendResp.status });
}
