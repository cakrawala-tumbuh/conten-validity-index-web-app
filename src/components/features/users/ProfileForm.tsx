/**
 * Komponen form edit identitas pribadi pengguna yang sedang login.
 *
 * Mengizinkan pengguna memperbarui nama lengkap, institusi, dan bidang
 * keahlian. Email dan role bersifat read-only karena berasal dari Authentik.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { USER_ROLE_LABELS } from "@/constants";
import type { UserResponse, UserSelfUpdate } from "@/types/user";
import type { ExpertiseAreaResponse } from "@/types/expertise-area";
import { ExpertiseAreaSelect } from "@/components/features/expertise-areas/ExpertiseAreaSelect";

/**
 * Props untuk ProfileForm.
 */
interface ProfileFormProps {
  /** Data profil awal pengguna yang sedang login. */
  user: UserResponse;
  /** Daftar master bidang keahlian yang dapat dipilih. */
  expertiseAreaOptions: ExpertiseAreaResponse[];
}

/**
 * Form edit identitas pribadi pengguna.
 *
 * Menampilkan field yang dapat diedit (nama lengkap, institusi, bidang
 * keahlian) serta informasi read-only (email, role). Submit mengirim
 * perubahan ke endpoint proxy `PATCH /api/users/me`.
 *
 * @param props.user - Data profil awal pengguna.
 * @param props.expertiseAreaOptions - Daftar master bidang keahlian.
 * @returns Form edit identitas pribadi interaktif.
 */
export const ProfileForm = ({ user, expertiseAreaOptions }: ProfileFormProps) => {
  const router = useRouter();
  const [fullName, setFullName] = useState(user.full_name);
  const [institution, setInstitution] = useState(user.institution ?? "");
  const [expertiseIds, setExpertiseIds] = useState<string[]>(
    user.expertise_areas.map((area) => area.id),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Menangani submit perubahan identitas pribadi.
   *
   * Memvalidasi nama lengkap tidak kosong, lalu mengirim perubahan ke API.
   *
   * @param e - Event form submission.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Nama lengkap tidak boleh kosong.");
      return;
    }

    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const payload: UserSelfUpdate = {
        full_name: fullName.trim(),
        institution: institution.trim() || undefined,
        expertise_area_ids: expertiseIds,
      };

      const resp = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail ?? `Gagal menyimpan perubahan (${resp.status})`);
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-5 rounded-lg border border-gray-200 bg-white p-6"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
          Identitas pribadi berhasil diperbarui.
        </div>
      )}

      {/* Email — read-only (dari Authentik) */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={user.email}
          readOnly
          disabled
          className="mt-1 w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
        />
        <p className="mt-1 text-xs text-gray-400">
          Email dikelola oleh penyedia login (Authentik).
        </p>
      </div>

      {/* Role — read-only */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Role</label>
        <input
          type="text"
          value={USER_ROLE_LABELS[user.role] ?? user.role}
          readOnly
          disabled
          className="mt-1 w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
        />
      </div>

      {/* Nama lengkap */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
          Nama Lengkap <span className="text-red-500">*</span>
        </label>
        <input
          id="full_name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nama lengkap Anda"
          className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {/* Institusi */}
      <div>
        <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
          Institusi
        </label>
        <input
          id="institution"
          type="text"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          placeholder="Mis. Universitas Gadjah Mada"
          className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {/* Bidang keahlian (pilih dari daftar master) */}
      <div>
        <span className="block text-sm font-medium text-gray-700">Bidang Keahlian</span>
        <p className="mt-0.5 text-xs text-gray-400">
          Pilih satu atau lebih bidang keahlian dari daftar yang dikelola admin.
        </p>
        <div className="mt-2">
          <ExpertiseAreaSelect
            options={expertiseAreaOptions}
            selectedIds={expertiseIds}
            onChange={setExpertiseIds}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
};
