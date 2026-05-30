/**
 * Augmentasi tipe NextAuth.js untuk menambahkan field custom.
 *
 * Menambahkan `accessToken`, `role`, dan `userId` ke dalam
 * `Session` dan `JWT` agar dapat digunakan di seluruh aplikasi.
 */
import type { DefaultSession } from "next-auth";
import type { UserRole } from "./user";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    error?: string;
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    role: UserRole;
    userId: string;
    error?: string;
  }
}
