"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { adminApi, ApiError, type ImportPreviewResult, type ImportConfirmResult } from "@/lib/admin-api";

type Step = "upload" | "preview" | "done";

export default function ImportSurveyPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [result, setResult] = useState<ImportConfirmResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (f: File | null) => {
    setError(null);
    if (!f) return;
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowed.includes(f.type) && !f.name.match(/\.xlsx?$/i)) {
      setError("Hanya file Excel (.xlsx, .xls) yang diperbolehkan");
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await adminApi.importSurveys(file);
      setPreview(res.data);
      setStep("preview");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mengupload file");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setConfirming(true);
    setError(null);
    try {
      const res = await adminApi.confirmImportSurveys(preview.import_id);
      setResult(res.data);
      setStep("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mengkonfirmasi import");
    } finally {
      setConfirming(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">Import Data Survey</h1>
        <p className="text-sm text-neutral-500 mt-1">Upload file Excel berisi data survey yang sudah diisi secara luring atau manual untuk diimport ke database.</p>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center gap-2 text-xs">
        {["Upload File", "Preview & Konfirmasi", "Selesai"].map((label, idx) => {
          const stepIdx = idx;
          const currentIdx = step === "upload" ? 0 : step === "preview" ? 1 : 2;
          return (
            <div key={label} className="flex items-center gap-2">
              {idx > 0 && <div className={`w-8 h-px ${stepIdx <= currentIdx ? "bg-blue-400" : "bg-neutral-200"}`} />}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${
                  stepIdx <= currentIdx
                    ? "bg-blue-50 text-blue-700"
                    : "bg-neutral-100 text-neutral-400"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  stepIdx < currentIdx ? "bg-blue-500 text-white" : stepIdx === currentIdx ? "bg-blue-500 text-white" : "bg-neutral-300 text-white"
                }`}>
                  {stepIdx < currentIdx ? "✓" : idx + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm space-y-5">
          {/* Format Info */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-semibold mb-1">Format Excel yang diterima:</p>
            <p>Kolom wajib ada: <strong>Nama Lengkap</strong>, <strong>NIM</strong>, <strong>Tahun Lulus Konfirmasi</strong>, <strong>Status Pekerjaan</strong>, <strong>Nama Instansi</strong>, dst.</p>
            <p className="text-xs mt-1 text-blue-500">NIM yang dimasukkan WAJIB sudah terdaftar pada master Data Alumni, bila tidak maka data survey akan diabaikan.</p>
          </div>

          {/* Drag & Drop */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFileChange(f);
            }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-blue-400 bg-blue-50"
                : file
                ? "border-green-300 bg-green-50/30"
                : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-neutral-700">{file.name}</p>
                <p className="text-xs text-neutral-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-10 h-10 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm text-neutral-500">Klik atau drag file Excel ke sini</p>
                <p className="text-xs text-neutral-400">.xlsx atau .xls, maks 5MB</p>
              </div>
            )}
          </div>

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Mengupload...
              </>
            ) : (
              "Upload & Preview"
            )}
          </button>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === "preview" && preview && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-green-700">{preview.total_valid}</p>
                <p className="text-xs text-green-600 font-medium mt-0.5">Data Valid</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-red-700">{preview.total_invalid}</p>
                <p className="text-xs text-red-600 font-medium mt-0.5">Data Tidak Valid</p>
              </div>
            </div>
            <p className="text-xs text-neutral-500 text-center mt-3">
              Data akan ditambahkan atau dioverwrite berdasarkan NIM. Pastikan NIM yang diimport sudah menjadi Alumni yang valid.
            </p>
          </div>

          {/* Invalid Rows */}
          {preview.invalid_rows.length > 0 && (
           <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-red-600 mb-3">Baris Bermasalah</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-red-50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-red-700">Baris</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-red-700">Nama</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-red-700">NIM</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-red-700">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.invalid_rows.map((row) => (
                      <tr key={row.row_number} className="border-b border-red-50">
                        <td className="px-3 py-2 text-red-400">{row.row_number}</td>
                        <td className="px-3 py-2">{row.nama_lengkap || "-"}</td>
                        <td className="px-3 py-2 font-mono text-xs">{row.nim || "-"}</td>
                        <td className="px-3 py-2 text-xs text-red-500">{row.errors.join("; ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={confirming || preview.total_valid === 0}
              className="flex-1 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {confirming ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Mengimport...
                </>
              ) : (
                `Konfirmasi Import (${preview.total_valid} data)`
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 border border-neutral-200 text-neutral-600 text-sm font-medium rounded-xl hover:bg-neutral-50 transition"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Done */}
      {step === "done" && result && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-8 shadow-sm text-center space-y-4">
          <div className="inline-flex w-16 h-16 rounded-full bg-green-100 items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-neutral-800">Import Berhasil!</h2>
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xl font-bold text-green-700">{result.inserted}</p>
              <p className="text-xs text-green-600">Berhasil Disimpan</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3">
              <p className="text-xl font-bold text-amber-700">{result.skipped}</p>
              <p className="text-xs text-amber-600">Dilewati (NIM Tidak Ditemukan)</p>
            </div>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Link
              href="/admin/survey"
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              Lihat Data Survey
            </Link>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 border border-neutral-200 text-neutral-600 text-sm font-medium rounded-xl hover:bg-neutral-50 transition"
            >
              Import Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
