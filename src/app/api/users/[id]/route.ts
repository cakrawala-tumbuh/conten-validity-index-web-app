/**
 * API route proxy untuk endpoint detail pengguna backend.
 *
 * Meneruskan request PATCH dan DELETE (update, deactivate) dari browser
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
 * Menangani PATCH /api/users/[id] — memperbarui data pengguna (admin only).
 *
 * @param request - HTTP request berisi body update pengguna.
 * @param params - Params route dinamis berisi `id` pengguna.
 * @returns Data pengguna yang sudah diperbarui atau pesan error.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ detail: "Tidak terautentikasi." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const backendUrl = process.env.BACKEND_API_INTERNAL_URL ?? "http://localhost:8000";

  const backendResp = await fetch(`${backendUrl}/api/v1/users/${id}`, {
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
 * Menangani DELETE /api/users/[id] — menonaktifkan pengguna (soft delete, admin only).
 *
 * @param _request - HTTP request dari client (tidak digunakan).
 * @param params - Params route dinamis berisi `id` pengguna.
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

  const backendResp = await fetch(`${backendUrl}/api/v1/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  const data = await backendResp.json().catch(() => ({}));

  return NextResponse.json(data, { status: backendResp.status });
}
