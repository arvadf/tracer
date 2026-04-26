"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { adminApi, type SurveyWithAlumni } from "@/lib/admin-api";
import type { PaginationMeta } from "@/lib/types";
import { STATUS_PEKERJAAN_LABELS, type StatusPekerjaan } from "@/lib/types";

export default function AdminSurveyPage() {
  const [surveys, setSurveys] = useState<SurveyWithAlumni[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [tahunFilter, setTahunFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const fetchSurveys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listSurveys({
        page,
        limit: 15,
        search: search || undefined,
        tahun_lulus: tahunFilter ? parseInt(tahunFilter) : undefined,
        status_pengisian: statusFilter || undefined,
        sort_by: "created_at",
        sort_order: "desc",
      });
      setSurveys(res.data.items);
      setMeta(res.data.meta);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, search, tahunFilter, statusFilter]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await adminApi.exportSurveys({
        tahun_lulus: tahunFilter ? parseInt(tahunFilter) : undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `survey-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch {
      alert("Gagal mengunduh file export");
    } finally {
      setExporting(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">Data Survey</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Monitoring pengisian survey alumni
            {meta && <span className="text-neutral-400"> — {meta.total_items} respons</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/survey/import"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Import Excel
          </Link>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 rounded-xl text-sm font-medium text-white hover:bg-green-700 transition shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {exporting ? "Mengunduh..." : "Export Excel"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama alumni..."
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          <select
            value={tahunFilter}
            onChange={(e) => {
              setTahunFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 border border-neutral-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="">Semua Tahun</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 border border-neutral-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="">Semua Status</option>
            <option value="sudah">Sudah Mengisi</option>
            <option value="belum">Belum Mengisi</option>
          </select>
          <button
            type="submit"
            className="px-5 py-2.5 bg-neutral-800 text-white text-sm font-medium rounded-xl hover:bg-neutral-900 transition"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="text-left px-5 py-3 font-semibold text-neutral-600">No</th>
                <th className="text-left px-5 py-3 font-semibold text-neutral-600">Nama Alumni</th>
                <th className="text-left px-5 py-3 font-semibold text-neutral-600">NIM</th>
                <th className="text-left px-5 py-3 font-semibold text-neutral-600">Status Pekerjaan</th>
                <th className="text-left px-5 py-3 font-semibold text-neutral-600">PPG</th>
                <th className="text-left px-5 py-3 font-semibold text-neutral-600">S2/S3</th>
                <th className="text-left px-5 py-3 font-semibold text-neutral-600">Tanggal Isi</th>
                <th className="text-right px-5 py-3 font-semibold text-neutral-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <svg className="w-6 h-6 animate-spin text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </td>
                </tr>
              ) : surveys.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-neutral-400">
                    Belum ada data survey
                  </td>
                </tr>
              ) : (
                surveys.map((s, idx) => (
                  <tr
                    key={s.id || s.nim}
                    className="border-b border-neutral-50 hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-5 py-3 text-neutral-400">{(page - 1) * 15 + idx + 1}</td>
                    <td className="px-5 py-3 font-medium text-neutral-800">{s.nama_lengkap}</td>
                    <td className="px-5 py-3 text-neutral-600 font-mono text-xs">{s.nim}</td>
                    <td className="px-5 py-3">
                      {s.id ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                          {STATUS_PEKERJAAN_LABELS[s.status_pekerjaan as StatusPekerjaan] || s.status_pekerjaan}
                        </span>
                      ) : (
                        <span className="text-neutral-400 italic text-xs">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {s.id ? (
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            s.lanjut_ppg
                              ? "bg-green-50 text-green-700"
                              : "bg-neutral-100 text-neutral-400"
                          }`}
                        >
                          {s.lanjut_ppg ? "Ya" : "Tidak"}
                        </span>
                      ) : (
                        <span className="text-neutral-400 italic text-xs">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {s.id ? (
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            s.lanjut_s2s3
                              ? "bg-blue-50 text-blue-700"
                              : "bg-neutral-100 text-neutral-400"
                          }`}
                        >
                          {s.lanjut_s2s3 ? "Ya" : "Tidak"}
                        </span>
                      ) : (
                        <span className="text-neutral-400 italic text-xs">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-neutral-500">
                      {s.id ? new Date(s.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }) : <span className="text-red-400">Belum Mengisi</span>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {s.id ? (
                        <Link
                          href={`/admin/survey/${s.id}`}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Detail
                        </Link>
                      ) : (
                        <span className="text-neutral-300 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.total_pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100 bg-neutral-50/50">
            <p className="text-xs text-neutral-400">
              Halaman {meta.current_page} dari {meta.total_pages}
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!meta.has_prev_page}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← Sebelumnya
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!meta.has_next_page}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
