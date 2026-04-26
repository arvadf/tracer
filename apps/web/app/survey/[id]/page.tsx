"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import FormSection from "@/components/form/FormSection";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import RadioGroup from "@/components/form/RadioGroup";
import TextArea from "@/components/form/TextArea";
import { api, ApiError } from "@/lib/api";
import type {
  Alumni,
  Survey,
  SurveyInput,
  ApiSuccessResponse,
} from "@/lib/types";
import { STATUS_PEKERJAAN_LABELS, StatusPekerjaan } from "@/lib/types";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// --- Status pekerjaan options ---
const STATUS_OPTIONS = Object.entries(STATUS_PEKERJAAN_LABELS).map(
  ([value, label]) => ({ value, label })
);

// --- Tahun options ---
const currentYear = new Date().getFullYear();
const TAHUN_OPTIONS = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => {
  const year = currentYear - i;
  return { value: String(year), label: String(year) };
});

// --- Form state type ---
interface FormData {
  tahun_lulus_konfirmasi: string;
  status_pekerjaan: string;
  nama_instansi: string;
  nomor_hp: string;
  lanjut_s2s3: boolean | null;
  jurusan_s2s3: string;
  universitas_s2s3: string;
  lanjut_ppg: boolean | null;
  tahun_ppg: string;
  universitas_ppg: string;
  pesan_saran: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const INITIAL_FORM: FormData = {
  tahun_lulus_konfirmasi: "",
  status_pekerjaan: "",
  nama_instansi: "",
  nomor_hp: "",
  lanjut_s2s3: null,
  jurusan_s2s3: "",
  universitas_s2s3: "",
  lanjut_ppg: null,
  tahun_ppg: "",
  universitas_ppg: "",
  pesan_saran: "",
};

export default function SurveyPage() {
  const params = useParams();
  const router = useRouter();
  const alumniId = params.id as string;

  // Page state
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [alumni, setAlumni] = useState<Alumni | null>(null);

  // Form state
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Update a single form field
  const setField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      // Clear field error on change
      setErrors((prev) => {
        if (prev[key]) {
          const next = { ...prev };
          delete next[key];
          return next;
        }
        return prev;
      });
      setUpdateSuccess(false);
    },
    []
  );

  // --- Load alumni status & existing survey ---
  useEffect(() => {
    async function loadSurveyStatus() {
      setPageLoading(true);
      setPageError(null);

      try {
        // Step 1: Check survey status
        const statusRes = await api.get<
          ApiSuccessResponse<{ survey_exists: boolean; alumni: Alumni }>
        >(`/alumni/${alumniId}/status`);

        setAlumni(statusRes.data.alumni);

        if (statusRes.data.survey_exists) {
          // EDIT mode — fetch existing survey data
          setMode("edit");
          try {
            const surveyRes = await api.get<ApiSuccessResponse<Survey>>(
              `/alumni/${alumniId}/survey`
            );
            const s = surveyRes.data;
            setForm({
              tahun_lulus_konfirmasi: String(s.tahun_lulus_konfirmasi),
              status_pekerjaan: s.status_pekerjaan,
              nama_instansi: s.nama_instansi,
              nomor_hp: s.nomor_hp,
              lanjut_s2s3: s.lanjut_s2s3,
              jurusan_s2s3: s.jurusan_s2s3 || "",
              universitas_s2s3: s.universitas_s2s3 || "",
              lanjut_ppg: s.lanjut_ppg,
              tahun_ppg: s.tahun_ppg ? String(s.tahun_ppg) : "",
              universitas_ppg: s.universitas_ppg || "",
              pesan_saran: s.pesan_saran || "",
            });
          } catch {
            setPageError("Gagal memuat data survey. Silakan coba lagi.");
          }
        } else {
          // CREATE mode
          setMode("create");
          // Pre-fill tahun_lulus from alumni data
          if (statusRes.data.alumni) {
            setForm((prev) => ({
              ...prev,
              tahun_lulus_konfirmasi: String(statusRes.data.alumni.tahun_lulus),
            }));
          }
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setPageError("Data alumni tidak ditemukan.");
        } else {
          setPageError("Gagal memuat status survey. Silakan coba lagi.");
        }
      } finally {
        setPageLoading(false);
      }
    }

    if (alumniId) {
      loadSurveyStatus();
    }
  }, [alumniId]);

  // --- Frontend validation (mirrors backend schema) ---
  const validate = (): FormErrors => {
    const e: FormErrors = {};

    if (!form.tahun_lulus_konfirmasi) {
      e.tahun_lulus_konfirmasi = "Tahun lulus wajib diisi";
    }

    if (!form.status_pekerjaan) {
      e.status_pekerjaan = "Status pekerjaan wajib dipilih";
    }

    if (!form.nama_instansi.trim()) {
      e.nama_instansi = "Nama instansi wajib diisi";
    }

    if (!form.nomor_hp.trim()) {
      e.nomor_hp = "Nomor HP wajib diisi";
    } else if (!/^[0-9]{10,15}$/.test(form.nomor_hp.trim())) {
      e.nomor_hp = "Nomor HP harus 10-15 digit angka";
    }

    // S2/S3 conditional
    if (form.lanjut_s2s3 === null) {
      e.lanjut_s2s3 = "Pilihan studi lanjut S2/S3 wajib diisi";
    } else if (form.lanjut_s2s3) {
      if (!form.jurusan_s2s3.trim()) {
        e.jurusan_s2s3 = "Jurusan S2/S3 wajib diisi jika lanjut S2/S3";
      }
      if (!form.universitas_s2s3.trim()) {
        e.universitas_s2s3 = "Universitas S2/S3 wajib diisi jika lanjut S2/S3";
      }
    }

    // PPG conditional
    if (form.lanjut_ppg === null) {
      e.lanjut_ppg = "Pilihan PPG wajib diisi";
    } else if (form.lanjut_ppg) {
      if (!form.tahun_ppg) {
        e.tahun_ppg = "Tahun PPG wajib diisi jika mengikuti PPG";
      }
      if (!form.universitas_ppg.trim()) {
        e.universitas_ppg =
          "Universitas PPG wajib diisi jika mengikuti PPG";
      }
    }

    return e;
  };

  // --- Build API body ---
  const buildBody = (): SurveyInput => {
    return {
      tahun_lulus_konfirmasi: parseInt(form.tahun_lulus_konfirmasi, 10),
      status_pekerjaan: form.status_pekerjaan as StatusPekerjaan,
      nama_instansi: form.nama_instansi.trim(),
      nomor_hp: form.nomor_hp.trim(),
      lanjut_s2s3: form.lanjut_s2s3!,
      jurusan_s2s3: form.lanjut_s2s3 ? form.jurusan_s2s3.trim() : null,
      universitas_s2s3: form.lanjut_s2s3
        ? form.universitas_s2s3.trim()
        : null,
      lanjut_ppg: form.lanjut_ppg!,
      tahun_ppg: form.lanjut_ppg ? parseInt(form.tahun_ppg, 10) : null,
      universitas_ppg: form.lanjut_ppg
        ? form.universitas_ppg.trim()
        : null,
      pesan_saran: form.pesan_saran.trim() || null,
    };
  };

  // --- Submit handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setUpdateSuccess(false);

    // Validate
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
      const firstErrorKey = Object.keys(validationErrors)[0];
      document.getElementById(firstErrorKey)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const body = buildBody();

      if (mode === "create") {
        // POST — create new survey
        await api.post(`/alumni/${alumniId}/survey`, body);
        router.push("/survey/selesai");
      } else {
        // PUT — update existing survey
        await api.put(`/alumni/${alumniId}/survey`, body);
        setUpdateSuccess(true);
        // Scroll to top to show success
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setSubmitError("Survey sudah pernah diisi sebelumnya.");
        } else if (err.status === 404) {
          setSubmitError("Data alumni tidak ditemukan.");
        } else if (err.status === 422) {
          // Validation errors from backend
          const apiData = err.data as {
            errors?: Array<{ field?: string; message: string }>;
          };
          if (apiData?.errors) {
            const backendErrors: FormErrors = {};
            apiData.errors.forEach((e) => {
              if (e.field) {
                backendErrors[e.field as keyof FormData] = e.message;
              }
            });
            setErrors(backendErrors);
          }
          setSubmitError("Terdapat kesalahan pada data yang diisi.");
        } else {
          setSubmitError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
        }
      } else {
        setSubmitError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // === RENDER ===

  // Loading state
  if (pageLoading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-sm text-neutral-500">
              Memuat data survey...
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Error state
  if (pageError) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center max-w-sm">
            <ExclamationTriangleIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-base font-semibold text-neutral-700 mb-2">
              {pageError}
            </p>
            <Link
              href="/"
              className="text-sm text-primary-500 hover:underline"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-neutral-50 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Page header */}
          <div className="mb-6">
            <Link
              href="/"
              className="text-xs text-primary-500 hover:underline mb-2 inline-block"
            >
              ← Kembali ke Pencarian
            </Link>

            <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">
              {mode === "create"
                ? "Pengisian Survey Tracer Study"
                : "Edit Jawaban Survey"}
            </h1>

            {alumni && (
              <div className="mt-2 bg-white border border-neutral-200 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary-600">
                    {alumni.nama_lengkap.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">
                    {alumni.nama_lengkap}
                  </p>
                  <p className="text-xs text-neutral-500">
                    NIM: {alumni.nim} • Lulus: {alumni.tahun_lulus}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Update success message */}
          {updateSuccess && (
            <div className="mb-6 bg-secondary-50 border border-secondary-200 rounded-xl p-4 flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-secondary-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-secondary-700">
                  Data berhasil diperbarui
                </p>
                <p className="text-xs text-secondary-600 mt-0.5">
                  Jawaban survey Anda telah disimpan.
                </p>
              </div>
            </div>
          )}

          {/* Submit error */}
          {submitError && (
            <div className="mb-6 bg-danger-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-danger-500 mt-0.5 shrink-0" />
              <p className="text-sm text-danger-500">{submitError}</p>
            </div>
          )}

          {/* === FORM === */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Group 1: Data Dasar */}
            <FormSection
              title="A. Identitas Dasar"
              description="Konfirmasi data dan isi informasi pekerjaan Anda saat ini."
            >
              <SelectField
                id="tahun_lulus_konfirmasi"
                label="Tahun Lulus dari UMS"
                value={form.tahun_lulus_konfirmasi}
                onChange={(v) => setField("tahun_lulus_konfirmasi", v)}
                options={TAHUN_OPTIONS}
                placeholder="Pilih tahun lulus"
                error={errors.tahun_lulus_konfirmasi}
                required
              />

              <SelectField
                id="status_pekerjaan"
                label="Status Pekerjaan Saat Ini"
                value={form.status_pekerjaan}
                onChange={(v) => setField("status_pekerjaan", v)}
                options={STATUS_OPTIONS}
                placeholder="Pilih status pekerjaan"
                error={errors.status_pekerjaan}
                required
              />

              <InputField
                id="nama_instansi"
                label="Nama Instansi / Tempat Mengajar"
                value={form.nama_instansi}
                onChange={(v) => setField("nama_instansi", v)}
                placeholder="Contoh: SDN 01 Surakarta"
                error={errors.nama_instansi}
                required
              />

              <InputField
                id="nomor_hp"
                label="Nomor HP Aktif"
                type="tel"
                value={form.nomor_hp}
                onChange={(v) => setField("nomor_hp", v)}
                placeholder="Contoh: 081234567890"
                hint="10-15 digit angka tanpa spasi atau tanda hubung"
                error={errors.nomor_hp}
                required
              />
            </FormSection>

            {/* Group 2: Studi Lanjut S2/S3 */}
            <FormSection
              title="B. Studi Lanjut S2/S3"
              description="Apakah Anda melanjutkan studi ke jenjang S2 atau S3?"
            >
              <RadioGroup
                id="lanjut_s2s3"
                label="Apakah melanjutkan studi ke S2/S3?"
                value={form.lanjut_s2s3}
                onChange={(v) => {
                  setField("lanjut_s2s3", v);
                  if (!v) {
                    setField("jurusan_s2s3", "");
                    setField("universitas_s2s3", "");
                  }
                }}
                error={errors.lanjut_s2s3}
                required
              />

              {form.lanjut_s2s3 === true && (
                <div className="space-y-4 pl-0 sm:pl-2 border-l-2 border-primary-200 ml-1 sm:ml-2 mt-2">
                  <div className="pl-3 sm:pl-4">
                    <InputField
                      id="jurusan_s2s3"
                      label="Jurusan / Program Studi S2/S3"
                      value={form.jurusan_s2s3}
                      onChange={(v) => setField("jurusan_s2s3", v)}
                      placeholder="Contoh: Pendidikan Teknologi Informasi"
                      error={errors.jurusan_s2s3}
                      required
                    />
                  </div>
                  <div className="pl-3 sm:pl-4">
                    <InputField
                      id="universitas_s2s3"
                      label="Universitas Tempat S2/S3"
                      value={form.universitas_s2s3}
                      onChange={(v) => setField("universitas_s2s3", v)}
                      placeholder="Contoh: Universitas Negeri Yogyakarta"
                      error={errors.universitas_s2s3}
                      required
                    />
                  </div>
                </div>
              )}
            </FormSection>

            {/* Group 3: Program PPG */}
            <FormSection
              title="C. Program PPG"
              description="Apakah Anda mengikuti program Pendidikan Profesi Guru?"
            >
              <RadioGroup
                id="lanjut_ppg"
                label="Apakah mengikuti program PPG?"
                value={form.lanjut_ppg}
                onChange={(v) => {
                  setField("lanjut_ppg", v);
                  if (!v) {
                    setField("tahun_ppg", "");
                    setField("universitas_ppg", "");
                  }
                }}
                error={errors.lanjut_ppg}
                required
              />

              {form.lanjut_ppg === true && (
                <div className="space-y-4 pl-0 sm:pl-2 border-l-2 border-primary-200 ml-1 sm:ml-2 mt-2">
                  <div className="pl-3 sm:pl-4">
                    <SelectField
                      id="tahun_ppg"
                      label="Tahun Mengikuti PPG"
                      value={form.tahun_ppg}
                      onChange={(v) => setField("tahun_ppg", v)}
                      options={TAHUN_OPTIONS}
                      placeholder="Pilih tahun PPG"
                      error={errors.tahun_ppg}
                      required
                    />
                  </div>
                  <div className="pl-3 sm:pl-4">
                    <InputField
                      id="universitas_ppg"
                      label="Universitas Penyelenggara PPG"
                      value={form.universitas_ppg}
                      onChange={(v) => setField("universitas_ppg", v)}
                      placeholder="Contoh: Universitas Muhammadiyah Surakarta"
                      error={errors.universitas_ppg}
                      required
                    />
                  </div>
                </div>
              )}
            </FormSection>

            {/* Group 4: Pesan & Saran */}
            <FormSection
              title="D. Pesan & Saran"
              description="Berikan pesan atau saran untuk Program Studi PTI UMS."
            >
              <TextArea
                id="pesan_saran"
                label="Pesan/Saran untuk Prodi PTI UMS"
                value={form.pesan_saran}
                onChange={(v) => setField("pesan_saran", v)}
                placeholder="Tuliskan pesan, masukan, atau saran Anda untuk pengembangan Prodi PTI UMS..."
                hint="Opsional"
                rows={4}
              />
            </FormSection>

            {/* Submit button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-secondary-500 text-white text-sm font-semibold rounded-lg
                         hover:bg-secondary-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>
                      {mode === "create"
                        ? "Mengirim..."
                        : "Menyimpan..."}
                    </span>
                  </>
                ) : mode === "create" ? (
                  "Kirim Survey"
                ) : (
                  "Simpan Perubahan"
                )}
              </button>

              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-neutral-300 text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Batal
              </Link>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}
