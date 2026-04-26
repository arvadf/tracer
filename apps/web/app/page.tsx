"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import {
  AcademicCapIcon,
  ChartBarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export default function HomePage() {
  const router = useRouter(); 
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      router.push(`/pencarian?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/pencarian`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ══════════════════════════════════════════════════════
          HERO + SEARCH — Blue gradient like tracer.ums.ac.id
          ══════════════════════════════════════════════════════ */}
      <section
        id="beranda"
        className="relative flex-shrink-0"
        style={{
          background: "linear-gradient(175deg, #155d9b 0%, #1a72b8 45%, #1e80c8 100%)",
          minHeight: "420px",
        }}
      >
        {/* Decorative dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.08]">
          <div className="absolute top-8 right-[15%] w-3 h-3 bg-white rounded-full" />
          <div className="absolute top-16 right-[25%] w-2 h-2 bg-white rounded-full" />
          <div className="absolute top-24 right-[10%] w-1.5 h-1.5 bg-white rounded-full" />
          <div className="absolute top-12 left-[12%] w-2.5 h-2.5 bg-white rounded-full" />
          <div className="absolute top-32 left-[20%] w-2 h-2 bg-white rounded-full" />
          <div className="absolute bottom-20 right-[30%] w-2 h-2 bg-white rounded-full" />
          <div className="absolute bottom-12 left-[18%] w-3 h-3 bg-white rounded-full" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-16 sm:pb-24 text-center">
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Tracer Study PPG dan Studi Lanjut PTI UMS
          </h1>
          <p className="text-lg sm:text-xl font-light text-white/70 mb-1">
            Pendidikan Teknik Informatika — FKIP UMS
          </p>
          <p className="text-sm text-white/50 mb-10 max-w-md mx-auto">
            Sistem penelusuran lulusan untuk memantau perkembangan karir
            pada jalur PPG dan Studi Lanjut S2/S3
          </p>

          {/* Simple Search Input Form that routes to /pencarian */}
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-white rounded-full p-1 max-w-lg mx-auto shadow-lg">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="nim atau nama"
                className="flex-1 bg-transparent !border-0 !outline-none !ring-0 !shadow-none focus:!border-0 focus:!outline-none focus:!ring-0 focus:!shadow-none pl-6 pr-4 py-2 text-base text-neutral-700 placeholder-neutral-400"
                autoComplete="off"
              />
              <button
                type="submit"
                className="px-8 py-2.5 bg-[#de366d] text-white text-base font-medium rounded-full hover:bg-[#c2185b] transition-colors"
              >
                Cari
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — Identitas PTI UMS (3 cards)
          ══════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 bg-[#f4f7fb]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Card 1: Tentang Prodi */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 sm:p-8 text-center hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                  <AcademicCapIcon className="w-7 h-7 text-[#155d9b]" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Prodi PTI UMS
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Program Studi Pendidikan Teknik Informatika FKIP UMS
                mencetak lulusan unggul di bidang pendidikan dan teknologi informasi.
              </p>
            </div>

            {/* Card 2: Tujuan Tracer Study */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 sm:p-8 text-center hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                  <ChartBarIcon className="w-7 h-7 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Tujuan Tracer Study
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Mendata perkembangan karir lulusan, khususnya pada
                jalur Profesi Guru (PPG) dan Studi Lanjut S2/S3.
              </p>
            </div>

            {/* Card 3: Manfaat bagi Alumni */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 sm:p-8 text-center hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
                  <UserGroupIcon className="w-7 h-7 text-amber-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Manfaat bagi Alumni
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Mendukung peningkatan kualitas pendidikan, proses akreditasi,
                dan pengembangan kurikulum yang relevan dengan kebutuhan industri.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
