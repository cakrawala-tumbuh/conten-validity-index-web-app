/**
 * API route proxy untuk endpoint restore database dari backup.
 *
 * Meneruskan request POST berisi data backup JSON dari browser ke backend
 * FastAPI dengan access token dari sesi NextAuth.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Menangani POST /api/backup/restore — memulihkan database dari backup (admin only).
 *
 * @param request - HTTP request dari client berisi body data backup JSON.
 * @returns Ringkasan hasil restore atau pesan error.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Tidak terautentikasi." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (payload === null) {
    return NextResponse.json({ detail: "Body request bukan JSON yang valid." }, { status: 400 });
  }

  const backendUrl = process.env.BACKEND_API_INTERNAL_URL ?? "http://localhost:8000";

  const backendResp = await fetch(`${backendUrl}/api/v1/backup/restore`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await backendResp.json().catch(() => ({}));

  return NextResponse.json(data, { status: backendResp.status });
}
