/**
 * Konfigurasi NextAuth.js v4 dengan Authentik sebagai OIDC provider.
 *
 * Alur autentikasi:
 * 1. Pengguna klik tombol "Login" → redirect ke Authentik authorization endpoint.
 * 2. Authentik mengautentikasi pengguna dan redirect kembali dengan auth code.
 * 3. NextAuth menukar code dengan tokens (access_token, id_token).
 * 4. Callback `signIn` memanggil backend untuk sync user ke database.
 * 5. Callback `jwt` menyimpan access_token dan role ke JWT.
 * 6. Callback `session` mengekspos data yang diperlukan ke client.
 *
 * Role dipetakan dari Authentik group membership:
 * - Group `cvi-admin` → role "admin"
 * - Group `cvi-expert` → role "expert"
 */
import NextAuth, { type NextAuthOptions } from "next-auth";
import type { UserRole } from "@/types/user";

/** Nama Authentik group yang dipetakan ke role admin. */
const ADMIN_GROUP = process.env.AUTHENTIK_ADMIN_GROUP ?? "cvi-admin";
/** Nama Authentik group yang dipetakan ke role expert. */
const EXPERT_GROUP = process.env.AUTHENTIK_EXPERT_GROUP ?? "cvi-expert";

/**
 * Mengekstrak role pengguna dari Authentik JWT claims.
 *
 * Authentik menyertakan daftar group dalam claim `groups` pada access token.
 * Jika pengguna ada di group admin, role-nya "admin". Jika di group expert,
 * role-nya "expert". Default ke "expert" jika tidak ada group yang cocok.
 *
 * @param groups - Array nama group dari Authentik JWT claims.
 * @returns Role pengguna: "admin" atau "expert".
 */
function extractRole(groups: string[]): UserRole {
  if (groups.includes(ADMIN_GROUP)) return "admin";
  if (groups.includes(EXPERT_GROUP)) return "expert";
  return "expert";
}

/**
 * Konfigurasi NextAuth.js.
 *
 * Diekspor agar dapat digunakan oleh helper `getServerSession(authOptions)`
 * di server components dan API routes.
 */
/**
 * Mengekstrak base URL Authentik dari issuer URL.
 *
 * Misal: `http://authentik-server:9000/application/o/cvi/` → `http://authentik-server:9000`
 *
 * @param issuerUrl - URL issuer Authentik.
 * @returns Base URL Authentik (tanpa path).
 */
function getAuthentikBase(issuerUrl: string): string {
  return issuerUrl.replace(/\/application\/o\/[^/]+\/?$/, "");
}

/** Base URL Authentik yang dapat dijangkau oleh browser pengguna. */
const authentikExternalBase =
  process.env.AUTHENTIK_EXTERNAL_URL ??
  getAuthentikBase(process.env.AUTHENTIK_ISSUER_URL ?? "");

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "authentik",
      name: "Authentik",
      type: "oauth",
      wellKnown: `${process.env.AUTHENTIK_ISSUER_URL}.well-known/openid-configuration`,
      clientId: process.env.AUTHENTIK_CLIENT_ID,
      clientSecret: process.env.AUTHENTIK_CLIENT_SECRET,
      authorization: {
        url: `${authentikExternalBase}/application/o/authorize/`,
        params: {
          scope: "openid email profile groups",
        },
      },
      idToken: true,
      checks: ["pkce", "state"],
      profile(profile) {
        return {
          id: profile.sub as string,
          name: profile.name as string,
          email: profile.email as string,
          image: profile.picture as string | undefined,
        };
      },
    },
  ],

  callbacks: {
    /**
     * Callback yang dipanggil setelah pengguna berhasil login di Authentik.
     *
     * Memanggil backend untuk sync data pengguna ke database lokal.
     * Jika sync gagal, login tetap diizinkan (user masih bisa menggunakan app).
     *
     * @param params.account - Data account dari Authentik (berisi access_token).
     * @returns `true` untuk mengizinkan login.
     */
    async signIn({ account }) {
      if (account?.access_token) {
        try {
          const baseUrl =
            process.env.BACKEND_API_INTERNAL_URL ?? "http://backend:8000";
          await fetch(`${baseUrl}/api/v1/auth/sync`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${account.access_token}`,
              "Content-Type": "application/json",
            },
          });
        } catch {
          // Sync gagal tidak menghalangi login
        }
      }
      return true;
    },

    /**
     * Callback untuk mengisi JWT dengan data tambahan dari Authentik.
     *
     * Dipanggil saat token dibuat (login) dan setiap kali session diakses.
     * Menyimpan access_token dan role ke dalam JWT.
     *
     * @param params.token - JWT yang sedang diproses.
     * @param params.account - Data account (hanya ada saat login pertama).
     * @param params.profile - Profile dari Authentik (hanya ada saat login pertama).
     * @returns JWT yang sudah diperbarui.
     */
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token as string;
        token.userId = profile.sub as string;
        const groups = (profile as Record<string, unknown>).groups;
        token.role = extractRole(Array.isArray(groups) ? (groups as string[]) : []);
      }
      return token;
    },

    /**
     * Callback untuk mengisi Session object yang dikembalikan ke client.
     *
     * Mengekspos `accessToken`, `role`, dan `userId` agar dapat digunakan
     * oleh komponen dan service.
     *
     * @param params.session - Session yang akan dikembalikan ke client.
     * @param params.token - JWT yang sudah diproses oleh callback `jwt`.
     * @returns Session yang sudah diperbarui.
     */
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.id = token.userId;
      session.user.role = token.role;
      if (token.error) {
        session.error = token.error;
      }
      return session;
    },
  },

  pages: {
    /** Halaman login custom — hanya tombol "Masuk dengan Authentik". */
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 jam
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
