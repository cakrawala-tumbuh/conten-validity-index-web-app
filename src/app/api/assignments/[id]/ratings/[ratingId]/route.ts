/**
 * API route proxy untuk endpoint update satu rating assignment backend.
 *
 * Meneruskan request PATCH dari browser ke backend FastAPI
 * dengan access token dari sesi NextAuth.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Params route dinamis.
 */
interface RouteParams {
  params: Promise<{ id: string; ratingId: string }>;
}

/**
 * Menangani PATCH /api/assignments/[id]/ratings/[ratingId] — memperbarui satu rating.
 *
 * @param request - HTTP request berisi body update rating.
 * @param params - Params route dinamis berisi `id` assignment dan `ratingId`.
 * @returns Data rating yang sudah diperbarui atau pesan error.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id, ratingId } = await params;
  const body = await request.json();
  const backendUrl = process.env.BACKEND_API_INTERNAL_URL ?? "http://localhost:8000";

  const backendResp = await fetch(`${backendUrl}/api/v1/assignments/${id}/ratings/${ratingId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await backendResp.json().catch(() => ({}));

  return NextResponse.json(data, { status: backendResp.status });
}
