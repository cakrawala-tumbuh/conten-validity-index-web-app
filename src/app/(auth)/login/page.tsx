/**
 * Halaman login untuk CVI Web App.
 *
 * Hanya menampilkan tombol "Masuk dengan Authentik" yang men-trigger OAuth
 * redirect ke Authentik. Tidak ada form input username/password.
 *
 * Jika pengguna sudah login, redirect ke halaman utama.
 */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { LoginButton } from "@/components/features/auth/LoginButton";
import { APP_NAME } from "@/constants";

/**
 * Halaman login — Server Component.
 *
 * @returns Halaman dengan tombol login Authentik atau redirect jika sudah login.
 */
export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session && !session.error) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-10 shadow-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{APP_NAME}</h1>
          <p className="mt-2 text-sm text-gray-500">Aplikasi pengelolaan Content Validity Index</p>
        </div>

        <LoginButton />

        <p className="mt-6 text-center text-xs text-gray-400">
          Login dikelola oleh Authentik SSO.
          <br />
          Hubungi administrator jika tidak memiliki akses.
        </p>
      </div>
    </main>
  );
}
