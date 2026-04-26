"use client";

import { useState, useEffect } from "react";
import { adminApi, ApiError } from "@/lib/admin-api";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({ nama: "", username: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    adminApi
      .me()
      .then((res) => {
        setProfileForm({ nama: res.data.nama, username: res.data.username });
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          router.push("/admin/login");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);

    try {
      await adminApi.updateProfile({
        nama: profileForm.nama,
        username: profileForm.username,
      });
      setProfileMessage({ type: "success", text: "Profil berhasil diperbarui!" });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Terjadi kesalahan";
      setProfileMessage({ type: "error", text: message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Konfirmasi password baru tidak cocok" });
      setPasswordLoading(false);
      return;
    }

    try {
      await adminApi.updatePassword({
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword,
      });
      setPasswordMessage({ type: "success", text: "Password berhasil diperbarui!" });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Terjadi kesalahan";
      setPasswordMessage({ type: "error", text: message });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">Pengaturan Akun</h1>
        <p className="text-sm text-neutral-500 mt-1">Ubah profil dan kata sandi admin Anda di sini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Profil Admin</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {profileMessage && (
              <div
                className={`p-3 rounded-lg text-sm font-medium ${
                  profileMessage.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {profileMessage.text}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-neutral-50 focus:bg-white"
                value={profileForm.nama}
                onChange={(e) => setProfileForm({ ...profileForm, nama: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-neutral-50 focus:bg-white"
                value={profileForm.username}
                onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={profileLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {profileLoading ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </form>
        </div>

        {/* Password Card */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Ubah Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordMessage && (
              <div
                className={`p-3 rounded-lg text-sm font-medium ${
                  passwordMessage.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {passwordMessage.text}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Password Lama</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-neutral-50 focus:bg-white"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Password Baru</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-neutral-50 focus:bg-white"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Konfirmasi Password Baru</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-neutral-50 focus:bg-white"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-900 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {passwordLoading ? "Memperbarui..." : "Perbarui Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
