"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi, ApiError } from "@/lib/admin-api";

export default function TambahAlumniPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nama_lengkap: "", nim: "", tahun_lulus: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => currentYear - i);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nama_lengkap.trim()) e.nama_lengkap = "Nama lengkap wajib diisi";
    if (!form.nim.trim()) e.nim = "NIM wajib diisi";
    if (!form.tahun_lulus) e.tahun_lulus = "Tahun lulus wajib dipilih";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await adminApi.createAlumni({
        nama_lengkap: form.nama_lengkap.trim(),
        nim: form.nim.trim(),
        tahun_lulus: parseInt(form.tahun_lulus, 10),
      });
      router.push("/admin/alumni");
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/alumni"
          className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mb-3"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Kembali ke Daftar Alumni
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">Tambah Alumni Baru</h1>
        <p className="text-sm text-neutral-500 mt-1">Tambahkan data alumni satu per satu secara manual.</p>
      </div>

      {/* Error */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-start gap-2">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {submitError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm space-y-5">
        {/* Nama Lengkap */}
        <div>
          <label htmlFor="nama_lengkap" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            id="nama_lengkap"
            type="text"
            value={form.nama_lengkap}
            onChange={(e) => { setForm({ ...form, nama_lengkap: e.target.value }); setErrors({ ...errors, nama_lengkap: "" }); }}
            placeholder="Contoh: Ahmad Budi Santoso"
            className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${errors.nama_lengkap ? "border-red-300 bg-red-50/30" : "border-neutral-200"}`}
          />
          {errors.nama_lengkap && <p className="text-xs text-red-500 mt-1">{errors.nama_lengkap}</p>}
        </div>

        {/* NIM */}
        <div>
          <label htmlFor="nim" className="block text-sm font-medium text-neutral-700 mb-1.5">
            NIM <span className="text-red-500">*</span>
          </label>
          <input
            id="nim"
            type="text"
            value={form.nim}
            onChange={(e) => { setForm({ ...form, nim: e.target.value }); setErrors({ ...errors, nim: "" }); }}
            placeholder="Contoh: A71010001"
            className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${errors.nim ? "border-red-300 bg-red-50/30" : "border-neutral-200"}`}
          />
          {errors.nim && <p className="text-xs text-red-500 mt-1">{errors.nim}</p>}
        </div>

        {/* Tahun Lulus */}
        <div>
          <label htmlFor="tahun_lulus" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Tahun Lulus <span className="text-red-500">*</span>
          </label>
          <select
            id="tahun_lulus"
            value={form.tahun_lulus}
            onChange={(e) => { setForm({ ...form, tahun_lulus: e.target.value }); setErrors({ ...errors, tahun_lulus: "" }); }}
            className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${errors.tahun_lulus ? "border-red-300 bg-red-50/30" : "border-neutral-200"}`}
          >
            <option value="">Pilih tahun lulus</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {errors.tahun_lulus && <p className="text-xs text-red-500 mt-1">{errors.tahun_lulus}</p>}
        </div>


        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menyimpan...
              </>
            ) : (
              "Simpan Alumni"
            )}
          </button>
          <Link
            href="/admin/alumni"
            className="px-6 py-2.5 border border-neutral-200 text-neutral-600 text-sm font-medium rounded-xl hover:bg-neutral-50 transition text-center"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
