import * as XLSX from 'xlsx';
import { EXCEL_HEADERS, YEAR_RANGE } from '../constants';
import { ImportPreviewRow } from '../types';
import { SurveyInput } from '../types';

interface ParsedAlumniExcelResult {
  valid_rows: Array<{ nama_lengkap: string; nim: string; tahun_lulus: number | null; tanggal_lahir: string | null }>;
  invalid_rows: ImportPreviewRow[];
  total_valid: number;
  total_invalid: number;
}

/**
 * Parse an uploaded Excel buffer into validated alumni rows.
 * Expects columns: "Nama Lengkap" or "Nama", "NIM", "Tahun Lulus" (optional).
 */
export function parseAlumniExcel(buffer: Buffer): ParsedAlumniExcelResult {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { valid_rows: [], invalid_rows: [], total_valid: 0, total_invalid: 0 };
  }

  const sheet = workbook.Sheets[sheetName]!;
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  const valid_rows: ParsedAlumniExcelResult['valid_rows'] = [];
  const invalid_rows: ImportPreviewRow[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // row 1 is header
    const errors: string[] = [];

    // Map "Nama Lengkap" or fallback to "Nama"
    const rawNama = row[EXCEL_HEADERS.NAMA_LENGKAP] ?? row['Nama'] ?? '';
    const namaLengkap = String(rawNama).trim();
    
    // Ensure nim is always string
    const nim = String(row[EXCEL_HEADERS.NIM] || '').trim();
    
    const tahunLulusRaw = String(row[EXCEL_HEADERS.TAHUN_LULUS] || '').trim();
    let tahunLulus: number | null = null;

    if (!namaLengkap) errors.push('Nama (Lengkap) wajib diisi');
    if (!nim) errors.push('NIM wajib diisi');

    if (tahunLulusRaw !== '') {
      if (!/^\d{4}$/.test(tahunLulusRaw)) {
        errors.push('Tahun Lulus opsional, tetapi jika diisi harus berupa 4 digit angka (contoh: 2024)');
      } else {
        tahunLulus = Number(tahunLulusRaw);
        if (Number.isNaN(tahunLulus) || tahunLulus < YEAR_RANGE.MIN || tahunLulus > YEAR_RANGE.MAX) {
          errors.push(`Tahun Lulus out of range (${YEAR_RANGE.MIN}-${YEAR_RANGE.MAX})`);
        }
      }
    }

    // Parse tanggal_lahir (optional, format: DD-MM-YYYY or Excel date serial)
    const tglLahirRaw = row[EXCEL_HEADERS.TANGGAL_LAHIR];
    let tanggalLahir: string | null = null;
    if (tglLahirRaw !== undefined && tglLahirRaw !== null && String(tglLahirRaw).trim() !== '') {
      if (typeof tglLahirRaw === 'number') {
        // Excel date serial number → convert to ISO date string
        const excelEpoch = new Date(1899, 11, 30);
        const jsDate = new Date(excelEpoch.getTime() + tglLahirRaw * 86400000);
        tanggalLahir = jsDate.toISOString().split('T')[0]; // YYYY-MM-DD
      } else {
        const raw = String(tglLahirRaw).trim();
        // Try DD-MM-YYYY or DD/MM/YYYY
        const match = raw.match(/^(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{4})$/);
        if (match) {
          const [, dd, mm, yyyy] = match;
          tanggalLahir = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
          // Already ISO format
          tanggalLahir = raw;
        }
        // If format unrecognized, leave as null (don't block import)
      }
    }

    if (errors.length === 0) {
      valid_rows.push({ nama_lengkap: namaLengkap, nim, tahun_lulus: tahunLulus, tanggal_lahir: tanggalLahir });
    }

    // Always add to preview for transparency
    const previewRow: ImportPreviewRow = {
      row_number: rowNumber,
      nama_lengkap: namaLengkap,
      nim,
      tahun_lulus: tahunLulus, // Will be null if missing/invalid
      is_valid: errors.length === 0,
      errors,
    };

    if (errors.length > 0) {
      invalid_rows.push(previewRow);
    }
  });

  return {
    valid_rows,
    invalid_rows,
    total_valid: valid_rows.length,
    total_invalid: invalid_rows.length,
  };
}

export interface SurveyImportPreviewRow extends ImportPreviewRow {
  data?: SurveyInput & { nim: string; nama_lengkap: string; tahun_lulus: number };
}

export interface ParsedSurveyExcelResult {
  valid_rows: Array<SurveyInput & { nim: string; nama_lengkap: string; tahun_lulus: number }>;
  invalid_rows: SurveyImportPreviewRow[];
  total_valid: number;
  total_invalid: number;
}

export function parseSurveyExcel(buffer: Buffer): ParsedSurveyExcelResult {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { valid_rows: [], invalid_rows: [], total_valid: 0, total_invalid: 0 };
  }

  const sheet = workbook.Sheets[sheetName]!;
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  const valid_rows: ParsedSurveyExcelResult['valid_rows'] = [];
  const invalid_rows: SurveyImportPreviewRow[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const errors: string[] = [];

    const namaLengkap = String(row['Nama Lengkap'] || '').trim();
    const nim = String(row['NIM'] || '').trim();
    const tLulusValidRaw = row['Tahun Lulus Konfirmasi'];
    const tLulusKonf = parseInt(String(tLulusValidRaw), 10);
    const statusPekerjaan = String(row['Status Pekerjaan'] || '').trim();
    const namaInstansi = String(row['Nama Instansi'] || '').trim();
    const nomorHp = String(row['Nomor HP'] || '').trim();
    
    const lanjutS2S3 = String(row['Lanjut S2/S3']).toLowerCase() === 'ya';
    const jurusanS2S3 = String(row['Jurusan S2/S3'] || '').trim();
    const universitasS2S3 = String(row['Universitas S2/S3'] || '').trim();
    
    const lanjutPpg = String(row['Lanjut PPG']).toLowerCase() === 'ya';
    const tPpgRaw = row['Tahun PPG'];
    const tahunPpg = parseInt(String(tPpgRaw), 10);
    const universitasPpg = String(row['Universitas PPG'] || '').trim();
    
    const pesanSaran = String(row['Pesan & Saran'] || '').trim();

    if (!namaLengkap) errors.push('Nama Lengkap wajib diisi');
    if (!nim) errors.push('NIM wajib diisi');
    if (isNaN(tLulusKonf)) errors.push('Tahun Lulus Konfirmasi harus angka');
    if (!statusPekerjaan) errors.push('Status Pekerjaan wajib diisi');
    if (!namaInstansi) errors.push('Nama Instansi wajib diisi');

    const surveyData = {
      nim,
      nama_lengkap: namaLengkap,
      tahun_lulus: tLulusKonf,
      tahun_lulus_konfirmasi: tLulusKonf,
      status_pekerjaan: statusPekerjaan as SurveyInput['status_pekerjaan'],
      nama_instansi: namaInstansi,
      nomor_hp: nomorHp,
      lanjut_s2s3: lanjutS2S3,
      jurusan_s2s3: jurusanS2S3 || null,
      universitas_s2s3: universitasS2S3 || null,
      lanjut_ppg: lanjutPpg,
      tahun_ppg: isNaN(tahunPpg) ? null : tahunPpg,
      universitas_ppg: universitasPpg || null,
      pesan_saran: pesanSaran || null,
    };

    if (errors.length === 0) {
      valid_rows.push(surveyData);
    }

    const previewRow: SurveyImportPreviewRow = {
      row_number: rowNumber,
      nama_lengkap: namaLengkap,
      nim,
      tahun_lulus: isNaN(tLulusKonf) ? 0 : tLulusKonf,
      is_valid: errors.length === 0,
      errors,
      data: surveyData
    };

    if (errors.length > 0) {
      invalid_rows.push(previewRow);
    }
  });

  return {
    valid_rows,
    invalid_rows,
    total_valid: valid_rows.length,
    total_invalid: invalid_rows.length,
  };
}
