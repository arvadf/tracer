"use client";

import { useState, useEffect } from "react";
import { adminApi, type DashboardData } from "@/lib/admin-api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Bar, Doughnut } from "react-chartjs-2";
import { STATUS_PEKERJAAN_LABELS, type StatusPekerjaan } from "@/lib/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const CHART_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

import * as XLSX from "xlsx";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getDashboard()
      .then((res) => setData(res.data))
      .catch(() => setError("Gagal memuat data dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const exportAllToExcel = () => {
    if (!data) return;

    // ── Helpers ──
    // Place a table at a specific position in a sparse grid
    const placeTable = (
      grid: Record<string, any>,
      startRow: number,
      startCol: number,
      title: string,
      headers: string[],
      items: { label: string; value: number }[]
    ): number => {
      // Title row
      grid[XLSX.utils.encode_cell({ r: startRow, c: startCol })] = { v: title, t: "s" };
      // Header row: No, Label, Jumlah
      grid[XLSX.utils.encode_cell({ r: startRow + 1, c: startCol })] = { v: "No", t: "s" };
      grid[XLSX.utils.encode_cell({ r: startRow + 1, c: startCol + 1 })] = { v: headers[0], t: "s" };
      grid[XLSX.utils.encode_cell({ r: startRow + 1, c: startCol + 2 })] = { v: headers[1], t: "s" };
      // Data rows
      items.forEach((item, i) => {
        grid[XLSX.utils.encode_cell({ r: startRow + 2 + i, c: startCol })] = { v: i + 1, t: "n" };
        grid[XLSX.utils.encode_cell({ r: startRow + 2 + i, c: startCol + 1 })] = { v: String(item.label), t: "s" };
        grid[XLSX.utils.encode_cell({ r: startRow + 2 + i, c: startCol + 2 })] = { v: item.value, t: "n" };
      });
      // Return the next available row after this table (title + header + data rows + 1 blank)
      return startRow + 2 + items.length + 1;
    };

    const cells: Record<string, any> = {};

    // ── Row 0: Title ──
    cells[XLSX.utils.encode_cell({ r: 0, c: 0 })] = { v: "LAPORAN DASHBOARD TRACER STUDY", t: "s" };

    // ── Row 2-6: Ringkasan ──
    cells[XLSX.utils.encode_cell({ r: 2, c: 0 })] = { v: "RINGKASAN", t: "s" };
    cells[XLSX.utils.encode_cell({ r: 3, c: 0 })] = { v: "No", t: "s" };
    cells[XLSX.utils.encode_cell({ r: 3, c: 1 })] = { v: "Keterangan", t: "s" };
    cells[XLSX.utils.encode_cell({ r: 3, c: 2 })] = { v: "Nilai", t: "s" };
    const summaryRows: [string, string | number][] = [
      ["Total Alumni", data.summary.total_alumni],
      ["Sudah Mengisi Survei", data.summary.total_surveys],
      ["Belum Mengisi Survei", data.summary.belum_mengisi],
      ["Respons Rate", `${data.summary.response_rate}%`],
    ];
    summaryRows.forEach(([label, value], i) => {
      cells[XLSX.utils.encode_cell({ r: 4 + i, c: 0 })] = { v: i + 1, t: "n" };
      cells[XLSX.utils.encode_cell({ r: 4 + i, c: 1 })] = { v: label, t: "s" };
      cells[XLSX.utils.encode_cell({ r: 4 + i, c: 2 })] = { v: value, t: typeof value === "number" ? "n" : "s" };
    });

    // ── Row 9+: Distribusi PPG (col A-C) & Distribusi S2/S3 (col E-G) side-by-side ──
    const sideBySideStartRow = 9;
    const nextAfterPpg = placeTable(cells, sideBySideStartRow, 0, "DISTRIBUSI MELANJUTKAN PPG", ["Status PPG", "Jumlah"], data.ppg_distribution);
    const nextAfterS2s3 = placeTable(cells, sideBySideStartRow, 4, "DISTRIBUSI MELANJUTKAN S2/S3", ["Status S2/S3", "Jumlah"], data.s2s3_distribution);

    // ── Next section: Status Pekerjaan (col A-C) & Persebaran Tahun Lulus (col E-G) side-by-side ──
    const section2StartRow = Math.max(nextAfterPpg, nextAfterS2s3);
    const statusPekerjaanMapped = data.status_pekerjaan.map(d => ({
      label: STATUS_PEKERJAAN_LABELS[d.label as StatusPekerjaan] || d.label,
      value: d.value
    }));
    const nextAfterStatus = placeTable(cells, section2StartRow, 0, "STATUS PEKERJAAN ALUMNI", ["Status Pekerjaan", "Jumlah"], statusPekerjaanMapped);
    const nextAfterTahun = placeTable(cells, section2StartRow, 4, "PERSEBARAN TAHUN KELULUSAN", ["Tahun Lulus", "Jumlah"], data.tahun_lulus);

    // ── Next section: Universitas PPG (col A-C) & Jurusan S2/S3 (col E-G) side-by-side ──
    const section3StartRow = Math.max(nextAfterStatus, nextAfterTahun);
    const nextAfterUniv = placeTable(cells, section3StartRow, 0, "UNIVERSITAS PENYELENGGARA PPG", ["Universitas", "Jumlah"], data.universitas_ppg);
    const nextAfterJurusan = placeTable(cells, section3StartRow, 4, "JURUSAN S2/S3 PALING BANYAK DIPILIH", ["Jurusan", "Jumlah"], data.jurusan_s2s3);

    // ── Build worksheet from cells ──
    const maxRow = Math.max(nextAfterUniv, nextAfterJurusan);
    const ws: XLSX.WorkSheet = {};
    ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxRow, c: 6 } });
    Object.assign(ws, cells);

    // Column widths: A=No(5), B=Label(40), C=Jumlah(12), D=gap(3), E=No(5), F=Label(40), G=Jumlah(12)
    ws["!cols"] = [
      { wch: 5 },  // A - No
      { wch: 40 }, // B - Label
      { wch: 12 }, // C - Jumlah
      { wch: 3 },  // D - gap
      { wch: 5 },  // E - No
      { wch: 40 }, // F - Label
      { wch: 12 }, // G - Jumlah
    ];

    // Merge title cell across all columns
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dashboard");
    XLSX.writeFile(wb, "Laporan_Dashboard_Tracer_Study.xlsx");
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

  if (error || !data) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-medium">{error || "Data tidak tersedia"}</p>
      </div>
    );
  }

  const { summary } = data;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">Ringkasan statistik dan grafik analitik</p>
        </div>
        <button
          onClick={exportAllToExcel}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Excel
        </button>
      </div>

      {/* === Stat Cards === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Alumni"
          value={summary.total_alumni}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          label="Sudah Mengisi"
          value={summary.total_surveys}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
        />
        <StatCard
          label="Belum Mengisi"
          value={summary.belum_mengisi}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="amber"
        />
        <StatCard
          label="Respons Rate"
          value={`${summary.response_rate}%`}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          }
          color="purple"
        />
      </div>

      {/* === Charts Grid === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. PPG Distribution */}
        <ChartCard title="Distribusi Alumni Melanjutkan PPG">
          {data.ppg_distribution.length > 0 ? (
            <div className="relative h-[200px] w-[200px] mx-auto flex items-center justify-center bg-white">
              <Doughnut
                data={{
                  labels: data.ppg_distribution.map((d) => d.label),
                  datasets: [
                    {
                      data: data.ppg_distribution.map((d) => d.value),
                      backgroundColor: ["#3b82f6", "#e5e7eb"],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } }, cutout: "60%" }}
              />
            </div>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        {/* 2. S2/S3 Distribution */}
        <ChartCard title="Distribusi Alumni Melanjutkan S2/S3">
          {data.s2s3_distribution.length > 0 ? (
            <div className="relative h-[200px] w-[200px] mx-auto flex items-center justify-center bg-white">
              <Doughnut
                data={{
                  labels: data.s2s3_distribution.map((d) => d.label),
                  datasets: [
                    {
                      data: data.s2s3_distribution.map((d) => d.value),
                      backgroundColor: ["#10b981", "#e5e7eb"],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } }, cutout: "60%" }}
              />
            </div>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        {/* 3. Tahun Kelulusan Bar */}
        <ChartCard title="Persebaran Tahun Kelulusan">
          {data.tahun_lulus.length > 0 ? (
            <div className="relative h-[220px] w-full bg-white">
              <Bar
                data={{
                  labels: data.tahun_lulus.map((d) => d.label),
                  datasets: [
                    {
                      label: "Jumlah Alumni",
                      data: data.tahun_lulus.map((d) => d.value),
                      backgroundColor: "#3b82f6",
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                  },
                }}
              />
            </div>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        {/* 4. Status Pekerjaan Pie */}
        <ChartCard title="Status Pekerjaan Alumni">
          {data.status_pekerjaan.length > 0 ? (
            <div className="relative h-[200px] w-[200px] mx-auto flex items-center justify-center bg-white">
              <Pie
                data={{
                  labels: data.status_pekerjaan.map((d) =>
                    STATUS_PEKERJAAN_LABELS[d.label as StatusPekerjaan] || d.label
                  ),
                  datasets: [
                    {
                      data: data.status_pekerjaan.map((d) => d.value),
                      backgroundColor: CHART_COLORS.slice(0, data.status_pekerjaan.length),
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }}
              />
            </div>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        {/* 5. Universitas PPG Horizontal Bar */}
        <ChartCard title="Universitas Penyelenggara PPG Terbanyak">
          {data.universitas_ppg.length > 0 ? (
            <div className="relative h-[220px] w-full bg-white">
              <Bar
                data={{
                  labels: data.universitas_ppg.slice(0, 10).map((d) => d.label),
                  datasets: [
                    {
                      label: "Jumlah",
                      data: data.universitas_ppg.slice(0, 10).map((d) => d.value),
                      backgroundColor: "#f59e0b",
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
                }}
              />
            </div>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        {/* 6. Jurusan S2/S3 Horizontal Bar */}
        <ChartCard title="Jurusan S2/S3 Paling Banyak Dipilih">
          {data.jurusan_s2s3.length > 0 ? (
            <div className="relative h-[220px] w-full bg-white">
              <Bar
                data={{
                  labels: data.jurusan_s2s3.slice(0, 10).map((d) => d.label),
                  datasets: [
                    {
                      label: "Jumlah",
                      data: data.jurusan_s2s3.slice(0, 10).map((d) => d.value),
                      backgroundColor: "#8b5cf6",
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
                }}
              />
            </div>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>
      </div>
    </div>
  );
}

// --- Sub Components ---

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "green" | "amber" | "purple";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-neutral-800 mt-1.5">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-neutral-700 mb-4">{title}</h3>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-neutral-300">
      <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
      <p className="text-xs">Belum ada data</p>
    </div>
  );
}
