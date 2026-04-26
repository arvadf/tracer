"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { adminApi, ApiError, type SurveyWithAlumni } from "@/lib/admin-api";
import { STATUS_PEKERJAAN, STATUS_PEKERJAAN_LABELS, type StatusPekerjaan } from "@/lib/types";

export default function SurveyDetailPage() {
  const params = useParams();
  const surveyId = params.id as string;

  const [survey, setSurvey] = useState<SurveyWithAlumni | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!surveyId) return;
    adminApi
      .getSurveyDetail(parseInt(surveyId))
      .then((res) => setSurvey(res.data))
      .catch(() => setError("Gagal memuat detail survey"))
      .finally(() => setLoading(false));
  }, [surveyId]);

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

  if (error || !survey) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-medium mb-4">{error || "Data tidak ditemukan"}</p>
        <Link href="/admin/survey" className="text-sm text-blue-600 hover:underline">
          ← Kembali ke Data Survey
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/survey"
          className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mb-3"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Kembali ke Data Survey
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">Detail Survey Alumni</h1>
      </div>
      
      {/* Edit Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 rounded-xl text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Edit Survey
        </button>
      </div>

      {editing && (
        <EditSurveyModal
          survey={survey}
          onClose={() => setEditing(false)}
          onSaved={(updatedSurvey) => {
            setSurvey(updatedSurvey);
            setEditing(false);
          }}
        />
      )}

      {/* Alumni Info Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold shrink-0">
            {survey.nama_lengkap.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold">{survey.nama_lengkap}</h2>
            <p className="text-blue-100 text-sm">
              NIM: {survey.nim} • Tahun Lulus: {survey.tahun_lulus}
            </p>
            <p className="text-blue-200/60 text-xs mt-0.5">
              Diisi: {new Date(survey.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Section A: Identitas Dasar */}
      <DetailSection title="A. Identitas Dasar">
        <DetailRow label="Tahun Lulus Konfirmasi" value={String(survey.tahun_lulus_konfirmasi)} />
        <DetailRow
          label="Status Pekerjaan"
          value={STATUS_PEKERJAAN_LABELS[survey.status_pekerjaan as StatusPekerjaan] || survey.status_pekerjaan}
          badge
        />
        <DetailRow label="Nama Instansi / Tempat Mengajar" value={survey.nama_instansi} />
        <DetailRow label="Nomor HP" value={survey.nomor_hp} />
      </DetailSection>

      {/* Section B: Studi Lanjut S2/S3 */}
      <DetailSection title="B. Studi Lanjut S2/S3">
        <DetailRow
          label="Melanjutkan S2/S3?"
          value={survey.lanjut_s2s3 ? "Ya" : "Tidak"}
          badgeColor={survey.lanjut_s2s3 ? "green" : "neutral"}
          badge
        />
        {survey.lanjut_s2s3 && (
          <>
            <DetailRow label="Jurusan / Program Studi" value={survey.jurusan_s2s3 || "-"} />
            <DetailRow label="Universitas" value={survey.universitas_s2s3 || "-"} />
          </>
        )}
      </DetailSection>

      {/* Section C: Program PPG */}
      <DetailSection title="C. Program PPG">
        <DetailRow
          label="Mengikuti PPG?"
          value={survey.lanjut_ppg ? "Ya" : "Tidak"}
          badgeColor={survey.lanjut_ppg ? "green" : "neutral"}
          badge
        />
        {survey.lanjut_ppg && (
          <>
            <DetailRow label="Tahun PPG" value={survey.tahun_ppg ? String(survey.tahun_ppg) : "-"} />
            <DetailRow label="Universitas Penyelenggara" value={survey.universitas_ppg || "-"} />
          </>
        )}
      </DetailSection>

      {/* Section D: Pesan & Saran */}
      <DetailSection title="D. Pesan & Saran">
        <div className="px-5 py-4">
          <p className="text-sm text-neutral-700 whitespace-pre-wrap">
            {survey.pesan_saran || <span className="text-neutral-300 italic">Tidak ada pesan/saran</span>}
          </p>
        </div>
      </DetailSection>

      {/* Timestamps */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm text-xs text-neutral-400">
        <div className="flex flex-wrap gap-6">
          <div>
            <span className="font-medium text-neutral-500">Dibuat:</span>{" "}
            {new Date(survey.created_at).toLocaleString("id-ID")}
          </div>
          <div>
            <span className="font-medium text-neutral-500">Terakhir diubah:</span>{" "}
            {new Date(survey.updated_at).toLocaleString("id-ID")}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub Components ---

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-100">
        <h3 className="text-sm font-bold text-neutral-700">{title}</h3>
      </div>
      <div className="divide-y divide-neutral-50">{children}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  badge,
  badgeColor = "blue",
}: {
  label: string;
  value: string;
  badge?: boolean;
  badgeColor?: "blue" | "green" | "neutral";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    neutral: "bg-neutral-100 text-neutral-500",
  };
  return (
    <div className="flex flex-col sm:flex-row sm:items-center px-5 py-3 gap-1 sm:gap-4">
      <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider sm:w-44 shrink-0">
        {label}
      </span>
      {badge ? (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[badgeColor]}`}>
          {value}
        </span>
      ) : (
        <span className="text-sm font-medium text-neutral-800">{value}</span>
      )}
    </div>
  );
}

function EditSurveyModal({
  survey,
  onClose,
  onSaved,
}: {
  survey: SurveyWithAlumni;
  onClose: () => void;
  onSaved: (s: SurveyWithAlumni) => void;
}) {
  const [form, setForm] = useState({
    tahun_lulus_konfirmasi: String(survey.tahun_lulus_konfirmasi || survey.tahun_lulus || ""),
    status_pekerjaan: survey.status_pekerjaan,
    nama_instansi: survey.nama_instansi || "",
    nomor_hp: survey.nomor_hp || "",
    lanjut_s2s3: survey.lanjut_s2s3,
    jurusan_s2s3: survey.jurusan_s2s3 || "",
    universitas_s2s3: survey.universitas_s2s3 || "",
    lanjut_ppg: survey.lanjut_ppg,
    tahun_ppg: survey.tahun_ppg ? String(survey.tahun_ppg) : "",
    universitas_ppg: survey.universitas_ppg || "",
    pesan_saran: survey.pesan_saran || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => currentYear - i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const data = {
        tahun_lulus_konfirmasi: parseInt(form.tahun_lulus_konfirmasi),
        status_pekerjaan: form.status_pekerjaan,
        nama_instansi: form.nama_instansi,
        nomor_hp: form.nomor_hp,
        lanjut_s2s3: form.lanjut_s2s3,
        jurusan_s2s3: form.lanjut_s2s3 ? form.jurusan_s2s3 : null,
        universitas_s2s3: form.lanjut_s2s3 ? form.universitas_s2s3 : null,
        lanjut_ppg: form.lanjut_ppg,
        tahun_ppg: form.lanjut_ppg && form.tahun_ppg ? parseInt(form.tahun_ppg) : null,
        universitas_ppg: form.lanjut_ppg ? form.universitas_ppg : null,
        pesan_saran: form.pesan_saran || null,
      };

      const res = await adminApi.updateSurvey(survey.id, data);
      onSaved(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan survey");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-neutral-800">Edit Survey</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Tahun Lulus Konfirmasi</label>
              <select
                value={form.tahun_lulus_konfirmasi}
                onChange={(e) => setForm({ ...form, tahun_lulus_konfirmasi: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm"
              >
                <option value="">Pilih Tahun</option>
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Status Pekerjaan</label>
              <select
                value={form.status_pekerjaan}
                onChange={(e) => setForm({ ...form, status_pekerjaan: e.target.value as StatusPekerjaan })}
                className="w-full px-3 py-2 border rounded-xl text-sm"
              >
                {STATUS_PEKERJAAN.map(s => (
                  <option key={s} value={s}>{STATUS_PEKERJAAN_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Nama Instansi</label>
              <input
                type="text"
                value={form.nama_instansi}
                onChange={(e) => setForm({ ...form, nama_instansi: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Nomor HP</label>
              <input
                type="text"
                value={form.nomor_hp}
                onChange={(e) => setForm({ ...form, nomor_hp: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="p-4 border rounded-xl space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.lanjut_s2s3}
                onChange={(e) => setForm({ ...form, lanjut_s2s3: e.target.checked })}
                className="rounded text-blue-600"
              />
              Melanjutkan S2/S3
            </label>
            {form.lanjut_s2s3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-600 mb-1">Jurusan S2/S3</label>
                  <input
                    type="text"
                    value={form.jurusan_s2s3}
                    onChange={(e) => setForm({ ...form, jurusan_s2s3: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-600 mb-1">Universitas</label>
                  <input
                    type="text"
                    value={form.universitas_s2s3}
                    onChange={(e) => setForm({ ...form, universitas_s2s3: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border rounded-xl space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.lanjut_ppg}
                onChange={(e) => setForm({ ...form, lanjut_ppg: e.target.checked })}
                className="rounded text-blue-600"
              />
              Melanjutkan PPG
            </label>
            {form.lanjut_ppg && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-600 mb-1">Tahun PPG</label>
                  <select
                    value={form.tahun_ppg}
                    onChange={(e) => setForm({ ...form, tahun_ppg: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  >
                    <option value="">Pilih Tahun</option>
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-neutral-600 mb-1">Universitas PPG</label>
                  <input
                    type="text"
                    value={form.universitas_ppg}
                    onChange={(e) => setForm({ ...form, universitas_ppg: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Pesan & Saran</label>
            <textarea
              value={form.pesan_saran}
              onChange={(e) => setForm({ ...form, pesan_saran: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-sm min-h-[100px]"
            />
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

          <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-white border-t mt-4 py-4 z-10">
            <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 bg-neutral-100 rounded-xl text-sm">Batal</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium flex items-center gap-2">
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
