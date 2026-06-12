/**
 * API route proxy untuk endpoint unduh backup database.
 *
 * Meneruskan request GET dari browser ke backend FastAPI dengan access token
 * dari sesi NextAuth, lalu meneruskan berkas JSON backup ke client.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Menangani GET /api/backup — mengunduh backup seluruh database (admin only).
 *
 * @returns Berkas JSON backup atau pesan error.
 */
export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Tidak terautentikasi." }, { status: 401 });
  }

  const backendUrl = process.env.BACKEND_API_INTERNAL_URL ?? "http://localhost:8000";

  const backendResp = await fetch(`${backendUrl}/api/v1/backup/`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  if (!backendResp.ok) {
    const data = await backendResp.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendResp.status });
  }

  const body = await backendResp.text();
  const contentDisposition =
    backendResp.headers.get("content-disposition") ?? 'attachment; filename="cvi-backup.json"';

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": contentDisposition,
    },
  });
}
