# Blueprint Desain API - Tracer Study PTI UMS (Refined Final)

Dokumen ini adalah rancangan REST API *production-ready* untuk sistem backend Tracer Study Alumni PTI UMS. Fokus struktur dipertahankan dengan penyempurnaan teknis ekstrem (*rate-limiting*, *idempotency*, filter/query params, respons data yang tersentralisasi).

---

## 1. API Architecture Overview & Standard

*   **Paradigma**: RESTful API
*   **Format Tukar Data**: JSON (`application/json`)
*   **Versi**: Terpusat pada prefix `/api/v1`

### 1.1. Pagination Standard (Strict List Response)
Seluruh endpoints bentuk *List* WAJIB membungkus *array* di dalam `data.items` dan menyediakan `data.meta`:

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "items": [
      { "id": 1, "nama_lengkap": "Budi", "nim": "A7101" }
    ],
    "meta": {
      "current_page": 1,
      "limit": 10,
      "total_items": 150,
      "total_pages": 15,
      "has_next_page": true,
      "has_prev_page": false
    }
  }
}
```

### 1.2 Query Params: Sorting & Filtering Standard 
Untuk semua API *listing* (Pencarian Publik maupun Daftar Admin), gunakan parameter standar:
*   **`sort_by`** : Field yang diurutkan (`nama_lengkap`, `tahun_lulus`, dll)
*   **`sort_order`** : `asc` (ascending) atau `desc` (descending)

### 1.3 HTTP Status Codes Standard
*   **200 OK** | **201 Created** | **400 Bad Request** | **401 Unauthorized** | **403 Forbidden** | **404 Not Found**
*   **409 Conflict**: Duplikasi Data.
*   **422 Unprocessable Entity**: Validasi gagal (format tidak pas).
*   **429 Too Many Requests**: Dihadang Rate Limit.

---

## 2. Auth, Middleware, & Idempotency Rules

### 2.1. Rate Limiting Request
Secara eksplisit menjaga public route `/api/v1/alumni/*`:
*   **General Public Limits**: 60 requests / menit per IP.
*   **Stricter Public Limits**: Endpoint kritis pencarian data (Search) dan penambahan data (*Submit Survey*) dijaga ketat di maks. **10 requests / menit** per IP. Melanggar batas akan mereturn `429 Too Many Requests`.

### 2.2. Validasi & Idempotency
*   **No Complex Keys Needed**: API diformat spesifik tidak menggunakan sistem UUID *Idempotency-Key* yang overkill. Proteksi anti double-klik pengguna dijamin murni dari validasi `UNIQUE` Constraint bawaan Database (PostgreSQL) yang akan otomatis me-lempar *Error 409 Conflict* saat menolak duplikat.

---

## 3. PUBLIC ALUMNI API `/api/v1/alumni`

### 3.1. Autocomplete / Pencarian Nama Alumni
`GET /api/v1/alumni/search`
*   **Aturan Endpoint**: *Case-Insensitive search*.
*   **Query Params**: 
    *   `query` (wajib, min: 3 karakter). Kurang dari 3 akan Return `400`.
    *   `limit` (opsional, default: 10, max: 50).
    *   `sort_by` (opsional, default: `relevance`, fallback `nama_lengkap`).
    *   `sort_order` (opsional, `asc` atau `desc`).
*   **Response (200)**: Mengikuti *Pagination Standard* di atas (dibungkus `data.items`).

### 3.2. Cek Status Survey Alumni & Pengambilan Survey Lolos
*   `GET /api/v1/alumni/:alumni_id/status` (Kembalikan `survey_exists: boolean` guna memandu form ke mode update).
*   `GET /api/v1/alumni/:alumni_id/survey` (Return `404` jika tidak ada raw formulir).

### 3.3. Survey Transaction (POST vs PUT)
Tiga perbedaan logika antara inisiasi Submit VS Pembaruan Data yang ditujukan pada endpoint survei agar flow tidak tergabung (no ambiguity):

*   **`POST /api/v1/alumni/:alumni_id/survey` (Create)**:
    Untuk insert baru saja. Jika sudah ada, wajib ditolak dengan **`409 Conflict`**.
*   **`PUT /api/v1/alumni/:alumni_id/survey` (Update)**:
    Hanya perbaruan *full document*. Jika belum punya survey, silakan tolak pelapor  dengan **`404 Not Found`**.
*   Request format (Keduanya identikal wajib validasi PostgreSQL constraints yang telah ada dan conditional rule if `lanjut_ppg`/`lanjut_s2s3 = true` dsb).

---

## 4. ADMIN API `/api/v1/admin`

Wajib session login, kecuali di `/admin/auth/login`.

### 4.1. Dashboard Charts Response Clarity
`GET /api/v1/admin/dashboard/charts`
*   *Semua item dataset chart (Pekerjaan, Universitas, dst)* **WAJIB** terstruktur persis pada schema `label` dan `value` numerik tunggal:
    ```json
    "data": {
       "status_pekerjaan": [
          { "label": "GURU", "value": 150 },
          { "label": "BELUM_BEKERJA", "value": 30 }
       ],
       "universitas_ppg": [
          { "label": "Universitas Muhammadiyah Surakarta", "value": 90 }
       ]
    }
    ```

### 4.2. Excel Import Lifecycle Mechanism
`POST /api/v1/admin/alumni/import` dan `POST .../import/confirm` berjalan pada konsep integrasi memori:
1.  **Drafting (Upload)**: File Excel diubah menjadi temp data yang disimpan via *Redis/Memory*. Controller membuat `import_id` dan memberikannya ke klien bersama review data.
2.  **TTL & Cleanup Constraints**: `import_id` ini *expired* dalam limit waktu yang baku (misalnya **10–15 menit** TTL). Jika lewat waktu, Garbage collector langsung membuang temp data.
3.  **Confirm**: Jika dalam batas TTL Admin hit `.../import/confirm` via ID tadi, Cache ditarik dan dibatch INSERT ke db persisten PostgreSQL.

### 4.3. Manage Export Survey Enhancement
`GET /api/v1/admin/surveys/export`
*   **Query Formats Tambahan**: 
    File yang diexport ke `.xlsx` kini bisa disort/difilter ketat lewat parameter.
    (`?tahun_lulus=...&status_pekerjaan=...&lanjut_ppg=true|false`).
*   *Men-trigger file-streams direct download tanpa envelope API format*.

### 4.4. List Endpoints Management (CRUD)
*   **Surveys List**: `GET /api/v1/admin/surveys`
*   **Alumni List**: `GET /api/v1/admin/alumni`
*   Keduanya patuh mengimplementasikan `data.items`, `data.meta` (Pagination Standard Config), bersama dengan skema Query `sort_by` dan `sort_order` secara *global availability*.
