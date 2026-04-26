"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { api } from "@/lib/api";
import type { Alumni, ApiSuccessResponse, ApiPaginatedData } from "@/lib/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const MIN_QUERY_LENGTH = 2;

interface SearchBoxProps {
  onSelectAlumni: (alumni: Alumni) => void;
  initialQuery?: string;
}

export default function SearchBox({ onSelectAlumni, initialQuery = "" }: SearchBoxProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Alumni[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch search results
  const searchAlumni = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setError(null);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await api.get<ApiSuccessResponse<ApiPaginatedData<Alumni>>>(
        `/alumni/search?query=${encodeURIComponent(searchQuery.trim())}&limit=10`
      );

      const items = response.data.items;
      setResults(items);
    } catch (err) {
      console.error("Search error:", err);
      setError("Gagal memuat data. Silakan coba lagi.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial search if a query is present from the URL
  useEffect(() => {
    if (initialQuery && initialQuery.length >= MIN_QUERY_LENGTH) {
      searchAlumni(initialQuery);
    }
  }, [initialQuery, searchAlumni]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchAlumni(query);
  };

  // Select an alumni
  const handleSelect = (alumni: Alumni) => {
    setQuery(alumni.nama_lengkap);
    // Hide results upon selection
    setHasSearched(false);
    setResults([]);
    onSelectAlumni(alumni);
  };

  // Clear input
  const handleClear = () => {
    setQuery("");
    setResults([]);
    setError(null);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // Optionally, reset search state if they clear the text completely
            if (e.target.value.trim().length === 0) {
              setHasSearched(false);
              setResults([]);
            }
          }}
          placeholder="Cari nama alumni..."
          className="w-full pl-12 pr-32 py-3.5 text-base bg-white border-2 border-neutral-200 rounded-xl
                     placeholder:text-neutral-400
                     focus:border-[#155d9b] focus:ring-0 focus:outline-none focus:shadow-md
                     transition-all"
          autoComplete="off"
        />

        {/* Clear icon if user typed something but not yet searching */}
        {query.length > 0 && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-[88px] top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-1"
            aria-label="Hapus pencarian"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || query.trim().length < MIN_QUERY_LENGTH}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-[#155d9b] text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading && <LoadingSpinner size="sm" />}
          Cari
        </button>
      </form>

      {/* Hint: minimum characters */}
      {query.length > 0 && query.trim().length < MIN_QUERY_LENGTH && (
        <p className="mt-2 text-xs text-neutral-400 text-center">
          Ketik minimal {MIN_QUERY_LENGTH} karakter untuk mencari
        </p>
      )}

      {/* Results Box */}
      {hasSearched && (
        <div className="mt-6 w-full bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          
          {/* Error state */}
          {error && (
            <div className="px-4 py-8 text-center text-red-500">
              <p className="text-sm">{error}</p>
              <button
                onClick={() => searchAlumni(query)}
                className="mt-3 text-xs font-medium border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* Empty state — "Nama tidak terdaftar. Hubungi admin PTI UMS." */}
          {!error && !isLoading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-neutral-800 mb-2">Nama Anda Tidak Ditemukan</h3>
              <p className="text-sm text-neutral-500 max-w-sm">
                Nama tidak terdaftar. Hubungi admin PTI UMS.
              </p>
            </div>
          )}

          {/* Results list */}
          {!error && !isLoading && results.length > 0 && (
            <div>
              <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100 flex justify-between items-center">
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Hasil Pencarian ({results.length})
                </h4>
              </div>
              <ul className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
                {results.map((alumni) => (
                  <li key={alumni.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(alumni)}
                      className="w-full px-5 py-4 flex flex-col items-start text-left transition-colors hover:bg-blue-50/50 group"
                    >
                      <span className="font-semibold text-neutral-800 group-hover:text-[#155d9b] transition-colors">
                        {alumni.nama_lengkap}
                      </span>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                          NIM: {alumni.nim}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Lulus: {alumni.tahun_lulus}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
