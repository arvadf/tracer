"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { api } from "@/lib/api";
import type { Alumni, ApiSuccessResponse, ApiPaginatedData } from "@/lib/types";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";


/* ──────────────────────────────────────────────
   Main Search Content
   ────────────────────────────────────────────── */
function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState<(Alumni & { survey_exists?: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);


  /* ── Search ── */
  const doSearch = async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await api.get<ApiSuccessResponse<ApiPaginatedData<Alumni & { survey_exists: boolean }>>>(
        `/alumni/search?query=${encodeURIComponent(trimmed)}&limit=50`
      );
      setResults(res.data.items);
    } catch {
      setError("Gagal memuat data. Silakan coba lagi.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  // Run initial search from URL query
  useEffect(() => {
    if (defaultQuery.length >= 2) doSearch(defaultQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSurveyClick = (alumniId: number) => {
    router.push(`/survey/${alumniId}`);
  };

  /* ── Render ── */
  return (
    <>
      {/* Search Header */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-[#2e7d32]">
            Penelusuran Alumni
          </h1>
          <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="nim atau nama"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-neutral-300 rounded-lg focus:border-[#155d9b] focus:ring-0 focus:outline-none"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || query.trim().length < 2}
              className="px-5 py-2.5 bg-[#e91e63] text-white text-sm font-semibold rounded-lg hover:bg-[#c2185b] transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Cari
            </button>
          </form>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="md" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-600 text-sm mb-4">
          {error}
        </div>
      )}

      {/* No results */}
      {hasSearched && !isLoading && !error && results.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-12 text-center">
          <p className="text-neutral-500 text-base">
            Nama atau NIM tidak ditemukan. Hubungi admin PTI UMS.
          </p>
        </div>
      )}

      {/* Results Table */}
      {!isLoading && results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#2e7d32] text-white text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Nama</th>
                  <th className="text-left px-4 py-3 font-semibold">NIM</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Program Studi</th>
                  <th className="text-center px-4 py-3 font-semibold min-w-[180px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {results.map((alumni, idx) => {
                  const surveyDone = alumni.survey_exists;
                  const rowBg = idx % 2 === 0 ? "bg-white" : "bg-neutral-50/50";

                  return (
                    <tr key={alumni.id} className={`${rowBg} hover:bg-blue-50/30 transition-colors`}>
                      {/* NAMA */}
                      <td className="px-4 py-3 font-medium text-neutral-800 whitespace-nowrap">
                        {alumni.nama_lengkap}
                      </td>

                      {/* NIM */}
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap text-xs">
                        {alumni.nim}
                      </td>

                      {/* PROGRAM STUDI */}
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap hidden md:table-cell">
                        Pend. Teknik Informatika
                      </td>


                      {/* STATUS — Verifikasi button + badge */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleSurveyClick(alumni.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#4caf50] rounded hover:bg-[#388e3c] transition whitespace-nowrap"
                          >
                            Isi Survey
                          </button>
                          {surveyDone === true && (
                            <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-[#2f6ce6] rounded">
                              Sudah
                            </span>
                          )}
                          {surveyDone === false && (
                            <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-[#e91e63] rounded">
                              Belum
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

/* ──────────────────────────────────────────────
   Page Wrapper
   ────────────────────────────────────────────── */
export default function PencarianPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fb]">
      <Navbar />

      <main className="flex-grow py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={<div className="py-20 text-center"><LoadingSpinner size="md" /></div>}>
            <SearchContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
