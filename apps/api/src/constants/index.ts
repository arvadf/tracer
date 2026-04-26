export const STATUS_PEKERJAAN = [
  'BELUM_BEKERJA',
  'GURU',
  'NON_PENDIDIKAN',
  'MAHASISWA_S2_S3',
  'LAINNYA',
] as const;

export type StatusPekerjaan = (typeof STATUS_PEKERJAAN)[number];

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const SEARCH_DEFAULTS = {
  MIN_QUERY_LENGTH: 2,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
} as const;

export const YEAR_RANGE = {
  MIN: 1950,
  MAX: 2100,
} as const;

export const EXCEL_HEADERS = {
  NAMA_LENGKAP: 'Nama Lengkap',
  NIM: 'NIM',
  TAHUN_LULUS: 'Tahun Lulus',
  TANGGAL_LAHIR: 'Tanggal Lahir',
} as const;
