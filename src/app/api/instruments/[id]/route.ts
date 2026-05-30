/**
 * API route proxy untuk endpoint detail instrumen backend.
 *
 * Meneruskan request GET, PATCH, DELETE dari browser ke backend FastAPI
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
 * Menangani GET /api/instruments/[id] — mengambil detail satu instrumen.
 *
 * @param _request - HTTP request dari client (tidak digunakan).
 * @param params - Params route dinamis berisi `id` instrumen.
 * @returns Data instrumen atau pesan error.
 */
export async function GET(_request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id } = await params;
  const backendUrl = process.env.BACKEND_API_INTERNAL_URL ?? "http://localhost:8000";

  const backendResp = await fetch(`${backendUrl}/api/v1/instruments/${id}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  const data = await backendResp.json().catch(() => ({}));

  return NextResponse.json(data, { status: backendResp.status });
}

/**
 * Menangani PATCH /api/instruments/[id] — memperbarui instrumen.
 *
 * @param request - HTTP request berisi body update instrumen.
 * @param params - Params route dinamis berisi `id` instrumen.
 * @returns Data instrumen yang sudah diperbarui atau pesan error.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const backendUrl = process.env.BACKEND_API_INTERNAL_URL ?? "http://localhost:8000";

  const backendResp = await fetch(`${backendUrl}/api/v1/instruments/${id}`, {
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

/**
 * Menangani DELETE /api/instruments/[id] — menghapus instrumen beserta item dan assignment-nya.
 *
 * @param _request - HTTP request dari client (tidak digunakan).
 * @param params - Params route dinamis berisi `id` instrumen.
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

  const { id } = await params;
  const backendUrl = process.env.BACKEND_API_INTERNAL_URL ?? "http://localhost:8000";

  const backendResp = await fetch(`${backendUrl}/api/v1/instruments/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  const data = await backendResp.json().catch(() => ({}));

  return NextResponse.json(data, { status: backendResp.status });
}
