/**
 * API route proxy untuk endpoint bulk submit rating assignment backend.
 *
 * Meneruskan request POST (bulk submit) dari browser ke backend FastAPI
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
 * Menangani POST /api/assignments/[id]/ratings/bulk — submit semua rating sekaligus.
 *
 * @param request - HTTP request berisi body bulk rating.
 * @param params - Params route dinamis berisi `id` assignment.
 * @returns Array data rating yang baru dibuat atau pesan error.
 */
export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const backendUrl = process.env.BACKEND_API_INTERNAL_URL ?? "http://localhost:8000";

  const backendResp = await fetch(`${backendUrl}/api/v1/assignments/${id}/ratings/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await backendResp.json().catch(() => ({}));

  return NextResponse.json(data, { status: backendResp.status });
}
