/**
 * API route proxy untuk endpoint item instrumen backend.
 *
 * Meneruskan request GET (list) dan POST (bulk create) item dari browser
 * ke backend FastAPI dengan access token dari sesi NextAuth.
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
 * Menangani GET /api/instruments/[id]/items — mengambil daftar item instrumen.
 *
 * @param _request - HTTP request dari client (tidak digunakan).
 * @param params - Params route dinamis berisi `id` instrumen.
 * @returns Array item instrumen atau pesan error.
 */
export async function GET(_request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id } = await params;
  const backendUrl = process.env.BACKEND_API_INTERNAL_URL ?? "http://localhost:8000";

  const backendResp = await fetch(`${backendUrl}/api/v1/instruments/${id}/items`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  const data = await backendResp.json().catch(() => ({}));

  return NextResponse.json(data, { status: backendResp.status });
}

/**
 * Menangani POST /api/instruments/[id]/items — bulk create item instrumen.
 *
 * Mengambil access token dari sesi NextAuth dan meneruskan request
 * ke backend FastAPI via jaringan internal Docker.
 *
 * @param request - HTTP request dari client.
 * @param params - Params route dinamis berisi `id` instrumen.
 * @returns Response dari backend atau pesan error.
 */
export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const backendUrl = process.env.BACKEND_API_INTERNAL_URL ?? "http://localhost:8000";

  const backendResp = await fetch(`${backendUrl}/api/v1/instruments/${id}/items/bulk`, {
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
