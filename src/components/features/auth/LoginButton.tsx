/**
 * Tombol Login untuk CVI Web App.
 *
 * Client Component yang men-trigger OAuth redirect ke Authentik
 * saat diklik. Tidak ada form input — login sepenuhnya ditangani oleh Authentik.
 */
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

/**
 * Menampilkan tombol "Masuk dengan Authentik" dengan loading state.
 *
 * Saat diklik, pengguna di-redirect ke halaman login Authentik.
 * Setelah autentikasi berhasil, Authentik redirect kembali ke aplikasi.
 *
 * @returns Tombol login dengan indikator loading.
 */
export const LoginButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Menangani klik tombol login.
   *
   * Memanggil `signIn("authentik")` untuk memulai alur OAuth.
   * Mengatur loading state untuk feedback visual.
   */
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("authentik", { callbackUrl: "/" });
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-3 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Mengalihkan...
        </>
      ) : (
        "Masuk dengan Authentik"
      )}
    </button>
  );
};
