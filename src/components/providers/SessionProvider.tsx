/**
 * Provider wrapper untuk NextAuth.js SessionProvider.
 *
 * Dibutuhkan karena SessionProvider menggunakan React Context yang hanya
 * tersedia di Client Components. Wrapper ini ditandai "use client" agar
 * dapat digunakan di dalam root layout (Server Component).
 */
"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/**
 * Props untuk SessionProvider.
 */
interface SessionProviderProps {
  children: ReactNode;
}

/**
 * Membungkus aplikasi dengan NextAuth SessionProvider.
 *
 * @param props.children - Child components yang memerlukan akses session.
 * @returns Children yang dibungkus dengan SessionProvider.
 */
export const SessionProvider = ({ children }: SessionProviderProps) => {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
};
