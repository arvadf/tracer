--
-- PostgreSQL database dump
--

\restrict Spd2fUtywlSOJm89ZU5EUeeyJZZEvT9UpCs2G3WKKcpTy3wiouAor33tC8SOtfj

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: status_pekerjaan_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_pekerjaan_enum AS ENUM (
    'BELUM_BEKERJA',
    'GURU',
    'NON_PENDIDIKAN',
    'MAHASISWA_S2_S3',
    'LAINNYA'
);


ALTER TYPE public.status_pekerjaan_enum OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    nama character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_admins_nama_not_empty CHECK ((TRIM(BOTH FROM nama) <> ''::text)),
    CONSTRAINT chk_admins_password_hash_not_empty CHECK ((TRIM(BOTH FROM password_hash) <> ''::text)),
    CONSTRAINT chk_admins_username_not_empty CHECK ((TRIM(BOTH FROM username) <> ''::text))
);


ALTER TABLE public.admins OWNER TO postgres;

--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admins_id_seq OWNER TO postgres;

--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: alumni; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alumni (
    id integer NOT NULL,
    nama_lengkap character varying(255) NOT NULL,
    nim character varying(50) NOT NULL,
    tahun_lulus integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tanggal_lahir date,
    email character varying(255),
    CONSTRAINT chk_alumni_nama_lengkap_not_empty CHECK ((TRIM(BOTH FROM nama_lengkap) <> ''::text)),
    CONSTRAINT chk_alumni_nim_not_empty CHECK ((TRIM(BOTH FROM nim) <> ''::text)),
    CONSTRAINT chk_alumni_tahun_lulus CHECK (((tahun_lulus >= 1950) AND (tahun_lulus <= 2100)))
);


ALTER TABLE public.alumni OWNER TO postgres;

--
-- Name: alumni_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alumni_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alumni_id_seq OWNER TO postgres;

--
-- Name: alumni_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alumni_id_seq OWNED BY public.alumni.id;


--
-- Name: surveys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.surveys (
    id integer NOT NULL,
    alumni_id integer NOT NULL,
    tahun_lulus_konfirmasi integer NOT NULL,
    status_pekerjaan public.status_pekerjaan_enum NOT NULL,
    nama_instansi character varying(255) NOT NULL,
    nomor_hp character varying(20) NOT NULL,
    lanjut_s2s3 boolean NOT NULL,
    jurusan_s2s3 character varying(255),
    universitas_s2s3 character varying(255),
    lanjut_ppg boolean NOT NULL,
    tahun_ppg integer,
    universitas_ppg character varying(255),
    pesan_saran text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_surveys_nama_instansi_not_empty CHECK ((TRIM(BOTH FROM nama_instansi) <> ''::text)),
    CONSTRAINT chk_surveys_nomor_hp_format CHECK (((nomor_hp)::text ~ '^[0-9]{10,15}$'::text)),
    CONSTRAINT chk_surveys_strict_ppg CHECK ((((lanjut_ppg = true) AND (tahun_ppg IS NOT NULL) AND (universitas_ppg IS NOT NULL) AND (TRIM(BOTH FROM universitas_ppg) <> ''::text)) OR ((lanjut_ppg = false) AND (tahun_ppg IS NULL) AND (universitas_ppg IS NULL)))),
    CONSTRAINT chk_surveys_strict_s2s3 CHECK ((((lanjut_s2s3 = true) AND (jurusan_s2s3 IS NOT NULL) AND (TRIM(BOTH FROM jurusan_s2s3) <> ''::text) AND (universitas_s2s3 IS NOT NULL) AND (TRIM(BOTH FROM universitas_s2s3) <> ''::text)) OR ((lanjut_s2s3 = false) AND (jurusan_s2s3 IS NULL) AND (universitas_s2s3 IS NULL)))),
    CONSTRAINT chk_surveys_tahun_lulus CHECK (((tahun_lulus_konfirmasi >= 1950) AND (tahun_lulus_konfirmasi <= 2100))),
    CONSTRAINT chk_surveys_tahun_ppg_range CHECK (((tahun_ppg IS NULL) OR ((tahun_ppg >= 1950) AND (tahun_ppg <= 2100))))
);


ALTER TABLE public.surveys OWNER TO postgres;

--
-- Name: surveys_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.surveys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.surveys_id_seq OWNER TO postgres;

--
-- Name: surveys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.surveys_id_seq OWNED BY public.surveys.id;


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: alumni id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alumni ALTER COLUMN id SET DEFAULT nextval('public.alumni_id_seq'::regclass);


--
-- Name: surveys id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.surveys ALTER COLUMN id SET DEFAULT nextval('public.surveys_id_seq'::regclass);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: alumni alumni_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alumni
    ADD CONSTRAINT alumni_email_key UNIQUE (email);


--
-- Name: alumni alumni_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alumni
    ADD CONSTRAINT alumni_pkey PRIMARY KEY (id);


--
-- Name: surveys surveys_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.surveys
    ADD CONSTRAINT surveys_pkey PRIMARY KEY (id);


--
-- Name: admins uq_admins_username; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT uq_admins_username UNIQUE (username);


--
-- Name: alumni uq_alumni_nim; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alumni
    ADD CONSTRAINT uq_alumni_nim UNIQUE (nim);


--
-- Name: surveys uq_surveys_alumni_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.surveys
    ADD CONSTRAINT uq_surveys_alumni_id UNIQUE (alumni_id);


--
-- Name: idx_alumni_nama_lengkap; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alumni_nama_lengkap ON public.alumni USING btree (nama_lengkap);


--
-- Name: idx_alumni_tahun_lulus_not_null; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alumni_tahun_lulus_not_null ON public.alumni USING btree (tahun_lulus) WHERE (tahun_lulus IS NOT NULL);


--
-- Name: idx_alumni_tahun_nama; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alumni_tahun_nama ON public.alumni USING btree (tahun_lulus, nama_lengkap) WHERE (tahun_lulus IS NOT NULL);


--
-- Name: idx_jurusan_s2s3_filtered; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jurusan_s2s3_filtered ON public.surveys USING btree (jurusan_s2s3) WHERE ((lanjut_s2s3 = true) AND (jurusan_s2s3 IS NOT NULL));


--
-- Name: idx_surveys_alumni_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_surveys_alumni_id ON public.surveys USING btree (alumni_id);


--
-- Name: idx_surveys_status_pekerjaan; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_surveys_status_pekerjaan ON public.surveys USING btree (status_pekerjaan);


--
-- Name: idx_universitas_ppg_filtered; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_universitas_ppg_filtered ON public.surveys USING btree (universitas_ppg) WHERE ((lanjut_ppg = true) AND (universitas_ppg IS NOT NULL));


--
-- Name: alumni trg_alumni_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_alumni_updated_at BEFORE UPDATE ON public.alumni FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: surveys trg_surveys_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_surveys_updated_at BEFORE UPDATE ON public.surveys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: surveys fk_surveys_alumni; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.surveys
    ADD CONSTRAINT fk_surveys_alumni FOREIGN KEY (alumni_id) REFERENCES public.alumni(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Spd2fUtywlSOJm89ZU5EUeeyJZZEvT9UpCs2G3WKKcpTy3wiouAor33tC8SOtfj

