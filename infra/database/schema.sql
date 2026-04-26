-- ---------------------------------------------------------
-- 0. TIPE DATA CUSTOM (ENUM) & FUNGSI TRIGGER
-- ---------------------------------------------------------

CREATE TYPE status_pekerjaan_enum AS ENUM (
    'BELUM_BEKERJA',
    'GURU',
    'NON_PENDIDIKAN',
    'MAHASISWA_S2_S3',
    'LAINNYA'
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';


-- ---------------------------------------------------------
-- 1. TABEL: alumni
-- ---------------------------------------------------------
CREATE TABLE alumni (
    id SERIAL PRIMARY KEY,
    nama_lengkap VARCHAR(255) NOT NULL,
    nim VARCHAR(50) NOT NULL,
    tahun_lulus INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Unique Identification
    CONSTRAINT uq_alumni_nim UNIQUE (nim),

    -- Trimming & Content Validation (Mencegah isi string hanya blank spaces)
    CONSTRAINT chk_alumni_nama_lengkap_not_empty CHECK (TRIM(nama_lengkap) <> ''),
    CONSTRAINT chk_alumni_nim_not_empty CHECK (TRIM(nim) <> ''),

    -- Year Scope Validation
    CONSTRAINT chk_alumni_tahun_lulus CHECK (tahun_lulus >= 1950 AND tahun_lulus <= 2100)
);

CREATE TRIGGER trg_alumni_updated_at
BEFORE UPDATE ON alumni
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ---------------------------------------------------------
-- 2. TABEL: surveys
-- ---------------------------------------------------------
CREATE TABLE surveys (
    id SERIAL PRIMARY KEY,
    alumni_id INTEGER NOT NULL,
    tahun_lulus_konfirmasi INTEGER NOT NULL,
    status_pekerjaan status_pekerjaan_enum NOT NULL,
    nama_instansi VARCHAR(255) NOT NULL,
    nomor_hp VARCHAR(20) NOT NULL,
    lanjut_s2s3 BOOLEAN NOT NULL,
    jurusan_s2s3 VARCHAR(255),
    universitas_s2s3 VARCHAR(255),
    lanjut_ppg BOOLEAN NOT NULL,
    tahun_ppg INTEGER,
    universitas_ppg VARCHAR(255),
    pesan_saran TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- Table Relation & Indexing
    CONSTRAINT fk_surveys_alumni FOREIGN KEY (alumni_id) REFERENCES alumni (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_surveys_alumni_id UNIQUE (alumni_id),

    -- Trimming & Content Validation
    CONSTRAINT chk_surveys_nama_instansi_not_empty CHECK (TRIM(nama_instansi) <> ''),
    
    -- Format Validation (No. HP: Pure Numeric, Range Length 10-15)
    CONSTRAINT chk_surveys_nomor_hp_format CHECK (nomor_hp ~ '^[0-9]{10,15}$'),

    -- Year Scope Validation
    CONSTRAINT chk_surveys_tahun_lulus CHECK (tahun_lulus_konfirmasi >= 1950 AND tahun_lulus_konfirmasi <= 2100),

    -- CONDITIONAL CONSTRAINT: Data Perkuliahan S2/S3
    CONSTRAINT chk_surveys_strict_s2s3 CHECK (
        (lanjut_s2s3 = true AND jurusan_s2s3 IS NOT NULL AND TRIM(jurusan_s2s3) <> '' AND universitas_s2s3 IS NOT NULL AND TRIM(universitas_s2s3) <> '') OR
        (lanjut_s2s3 = false AND jurusan_s2s3 IS NULL AND universitas_s2s3 IS NULL)
    ),

    -- CONDITIONAL CONSTRAINT: Data Profesi Guru (PPG)
    CONSTRAINT chk_surveys_strict_ppg CHECK (
        (lanjut_ppg = true AND tahun_ppg IS NOT NULL AND universitas_ppg IS NOT NULL AND TRIM(universitas_ppg) <> '') OR
        (lanjut_ppg = false AND tahun_ppg IS NULL AND universitas_ppg IS NULL)
    ),

    -- PPG Year Validity Scope (if not null)
    CONSTRAINT chk_surveys_tahun_ppg_range CHECK (
        tahun_ppg IS NULL OR (tahun_ppg >= 1950 AND tahun_ppg <= 2100)
    )
);

CREATE TRIGGER trg_surveys_updated_at
BEFORE UPDATE ON surveys
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ---------------------------------------------------------
-- 3. TABEL: admins
-- ---------------------------------------------------------
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT uq_admins_username UNIQUE (username),
    
    -- Trimming & Content Validation
    CONSTRAINT chk_admins_username_not_empty CHECK (TRIM(username) <> ''),
    CONSTRAINT chk_admins_password_hash_not_empty CHECK (TRIM(password_hash) <> ''),
    CONSTRAINT chk_admins_nama_not_empty CHECK (TRIM(nama) <> '')
);


-- ---------------------------------------------------------
-- 4. DATABASE INDEXING (Query Performance)
-- ---------------------------------------------------------
-- Indeks umum untuk pencarian manual string nama alumni (B-Tree Defaults)
CREATE INDEX idx_alumni_nama_lengkap ON alumni (nama_lengkap);

-- Indeks optimasi filter dashboard pelaporan (Status pekerjaan filter)
CREATE INDEX idx_surveys_status_pekerjaan ON surveys (status_pekerjaan);

-- Relasi Index untuk validasi Query Join tabel surveypanel ke root panel
CREATE INDEX idx_surveys_alumni_id ON surveys (alumni_id);
