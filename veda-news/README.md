# VEDA News Dashboard // Tactical Intelligence Aggregator

Sistem agregator intelijen berita terinspirasi dari VEDA (Mobile Suit Gundam 00).
Memantau 100+ sumber RSS (Nasional Indonesia, Internasional, Teknologi, Ekonomi & Pasar, Sains & Antariksa, Pertahanan & Geopolitik, Keamanan Siber) secara independen, tahan error, dengan deduplikasi hash SHA-256 dan sinkronisasi otomatis setiap 30 menit.

---

## 📁 Struktur Direktori

```
veda-news/
├── backend/
│   ├── fetcher.py          # Skrip pengambilan RSS (timeout 10s, retry 2x, multi-thread)
│   ├── database.py         # Skema SQLite (articles, sources, fetch_logs) & query
│   ├── api.py              # Flask REST API + APScheduler (30 menit)
│   ├── sources.json        # Konfigurasi sumber awal (10 sumber uji Fase 1)
│   └── requirements.txt    # Dependensi Python
├── data/
│   └── veda.db             # Database SQLite lokal (dibuat otomatis)
├── logs/
│   └── fetch.log           # Log aktivitas pengambilan feed
└── README.md
```

---

## 🚀 Panduan Fase 1: Uji Coba Manual Python

### 1. Persiapan Lingkungan
```bash
cd veda-news/backend
python3 -m venv venv
source venv/bin/activate    # Di Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Jalankan Pengambilan Berita (Fase 1)
```bash
python fetcher.py
```
- Sistem akan membuat tabel di `data/veda.db` secara otomatis.
- Mengambil 10 sumber awal secara paralel (maksimal 5 worker).
- Menampilkan status keberhasilan, durasi, dan artikel baru yang tersimpan.

### 3. Verifikasi Database
```bash
sqlite3 ../data/veda.db "SELECT source_name, count(*) FROM articles GROUP BY source_name;"
sqlite3 ../data/veda.db "SELECT * FROM fetch_logs ORDER BY id DESC LIMIT 1;"
```

---

## 🌐 Panduan Fase 2: Menjalankan REST API & Scheduler 30 Menit

```bash
python api.py
```
Server akan aktif di `http://localhost:5000`:
- `GET /api/articles?category=technology&limit=20`
- `GET /api/sources`
- `GET /api/stats`
- `POST /api/sync` (Trigger sync manual)
- Scheduler otomatis berjalan di background setiap 30 menit.

---

## 🖥️ Live Web Applet (AI Studio)

Aplikasi web terintegrasi langsung aktif di preview AI Studio dengan antarmuka terminal taktis VEDA, didukung backend Node/Express (`server.ts`) dan React + Tailwind CSS v4.
