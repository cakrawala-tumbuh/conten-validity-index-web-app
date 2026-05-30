/**
 * Halaman root aplikasi — redirect berdasarkan status autentikasi dan role.
 *
 * Pengguna yang sudah login diarahkan ke halaman yang sesuai dengan role.
 * Pengguna yang belum login diarahkan ke halaman login.
 */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Halaman root.
 *
 * @returns Redirect ke halaman login atau dashboard sesuai role.
 */
export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "admin") {
    redirect("/instruments");
  } else {
    redirect("/my-assignments");
  }
}
