/**
 * Halaman utama dashboard — redirect berdasarkan role.
 *
 * Admin diarahkan ke halaman daftar instrumen.
 * Expert diarahkan ke halaman daftar assignment mereka.
 */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Halaman root dashboard.
 *
 * @returns Redirect ke halaman yang sesuai berdasarkan role pengguna.
 */
export default async function DashboardPage() {
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
