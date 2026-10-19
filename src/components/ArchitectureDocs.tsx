import React from 'react';
import { Terminal, Database, Shield, Cpu, CheckCircle } from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Anime Interface Banner */}
      <div className="bg-black border border-white/20 p-6 relative overflow-hidden flex flex-col lg:flex-row items-center gap-6">
        <div className="flex-1 max-w-2xl relative z-10">
          <div className="flex items-center gap-2 text-[11px] text-white/60 mb-2">
            <Cpu className="w-4 h-4 text-white" />
            <span>VEDA MAINFRAME // CELESTIAL BEING QUANTUM OPERATING SYSTEM</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-widest uppercase">
            [ MONOCHROME ANIME INTERFACE ARCHITECTURE ]
          </h2>
          <p className="text-xs text-white/70 mt-2 leading-relaxed font-sans">
            Antarmuka VEDA ini dirancang dengan gaya visual <strong>monokrom hitam-putih murni</strong> seperti yang terlihat di dalam anime <em>Mobile Suit Gundam 00</em> ketika Tieria Erde, Ribbons Almark, dan Innovades mengakses mainframe orbital Celestial Being: latar hitam pekat (#000000), aksen garis putih tegas, tipografi data monospace tabular, dan blok pemilih terbalik (inverted high-contrast blocks).
          </p>
        </div>

        <div className="w-full lg:w-72 shrink-0 border border-white/30 overflow-hidden bg-black p-1 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <img
            src="/src/assets/images/veda_monochrome_anime_1792376712910.jpg"
            alt="VEDA Monochrome Quantum State Monitor"
            className="w-full h-auto object-cover grayscale contrast-125"
            referrerPolicy="no-referrer"
          />
          <div className="p-1.5 text-center text-[9px] text-white/50 border-t border-white/10 mt-1">
            [ VEDA QUANTUM STATE MONITOR // GUNDAM 00 ]
          </div>
        </div>
      </div>

      {/* Fase Roadmap Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-black border border-white/40 p-4">
          <div className="flex items-center gap-2 text-xs text-white font-bold">
            <CheckCircle className="w-4 h-4" />
            <span>[ FASE 1: FONDASI ]</span>
          </div>
          <p className="text-[11px] text-white/70 mt-2 font-sans">
            Konfigurasi sumber <code className="text-white">sources.json</code>, skema SQLite <code className="text-white">database.py</code>, dan engine fetcher <code className="text-white">fetcher.py</code> dengan timeout 10s dan auto-retry 2x.
          </p>
        </div>

        <div className="bg-black border border-white/40 p-4">
          <div className="flex items-center gap-2 text-xs text-white font-bold">
            <CheckCircle className="w-4 h-4" />
            <span>[ FASE 2: OTOMATISASI ]</span>
          </div>
          <p className="text-[11px] text-white/70 mt-2 font-sans">
            Penjadwalan 30 menit via interval server & APScheduler, REST API (<code className="text-white">/api/articles</code>, <code className="text-white">/api/sources</code>, <code className="text-white">/api/stats</code>, <code className="text-white">/api/sync</code>).
          </p>
        </div>

        <div className="bg-black border border-white/40 p-4">
          <div className="flex items-center gap-2 text-xs text-white font-bold">
            <CheckCircle className="w-4 h-4" />
            <span>[ FASE 3: ANIME B&W VEDA ]</span>
          </div>
          <p className="text-[11px] text-white/70 mt-2 font-sans">
            Tampilan monokrom hitam-putih anime Gundam 00 (pitch black, stark white vector, monospace brackets, scanline telemetry, dan AJAX auto-refresh 30 menit).
          </p>
        </div>

        <div className="bg-black border border-white/40 p-4">
          <div className="flex items-center gap-2 text-xs text-white font-bold">
            <CheckCircle className="w-4 h-4" />
            <span>[ FASE 4: 100+ RSS SKALA ]</span>
          </div>
          <p className="text-[11px] text-white/70 mt-2 font-sans">
            103 sumber RSS aktif (Nasional, Dunia, Tech, Economy, Science, Defense, Cyber), pencarian instan, filter kategori, export OPML, dan drawer log.
          </p>
        </div>
      </div>

      {/* Python Quickstart Commands */}
      <div className="bg-black border border-white/20 p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Terminal className="w-4 h-4" />
          <span>[ MENJALANKAN STANDALONE PYTHON BACKEND SECARA MANDIRI ]</span>
        </h3>

        <div className="space-y-4 text-xs font-mono">
          <div>
            <div className="text-white/60 mb-1">1. Masuk ke direktori dan install paket:</div>
            <div className="bg-neutral-950 border border-white/20 p-3 text-white overflow-x-auto">
              <code>cd veda-news/backend<br />pip install -r requirements.txt</code>
            </div>
          </div>

          <div>
            <div className="text-white/60 mb-1">2. Jalankan pengambilan berita manual (Fase 1):</div>
            <div className="bg-neutral-950 border border-white/20 p-3 text-white overflow-x-auto">
              <code>python fetcher.py</code>
            </div>
            <div className="text-white/40 mt-1 text-[11px]">
              Skrip akan mengeksekusi feed secara paralel, membuat database SQLite <code className="text-white">veda-news/data/veda.db</code>, dan mencatat riwayat ke <code className="text-white">veda-news/logs/fetch.log</code>.
            </div>
          </div>

          <div>
            <div className="text-white/60 mb-1">3. Jalankan server Flask & scheduler 30 menit (Fase 2):</div>
            <div className="bg-neutral-950 border border-white/20 p-3 text-white overflow-x-auto">
              <code>python api.py</code>
            </div>
          </div>
        </div>
      </div>

      {/* Database Schema & Deduplication Logic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-black border border-white/20 p-5 text-xs font-mono">
          <h4 className="text-white font-bold flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-white" />
            <span>[ SKEMA DATABASE (SQLITE) ]</span>
          </h4>
          <p className="text-white/60 mb-3">Tiga tabel relasional terstruktur:</p>
          <ul className="space-y-2 text-white/80">
            <li>
              <strong className="text-white">articles:</strong> id, hash_id (UNIQUE SHA-256), title, summary, link, source_id, category, language, published_at, fetched_at.
            </li>
            <li>
              <strong className="text-white">sources:</strong> id, name, url, category, language, active, last_fetched_at, last_status, error_count.
            </li>
            <li>
              <strong className="text-white">fetch_logs:</strong> id, timestamp, total_sources, successful_sources, failed_sources, new_articles, duration_seconds, status, details.
            </li>
          </ul>
        </div>

        <div className="bg-black border border-white/20 p-5 text-xs font-mono">
          <h4 className="text-white font-bold flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-white" />
            <span>[ PRINSIP SISTEM OPERASI VEDA ]</span>
          </h4>
          <ul className="space-y-2 text-white/80">
            <li>
              <strong>Deduplikasi SHA-256:</strong> Setiap artikel menghasilkan hash unik berdasarkan link dan judul, mencegah duplikasi artikel berulang.
            </li>
            <li>
              <strong>Isolasi Kegagalan:</strong> Timeout 10 detik per sumber dan retry maksimal 2x. Kegagalan satu feed tidak pernah memblokir sumber lain.
            </li>
            <li>
              <strong>Concurrency Pool 5:</strong> Pengambilan paralel terkontrol agar tidak membebani koneksi jaringan atau memicu rate limiting provider.
            </li>
            <li>
              <strong>Pembersihan HTML:</strong> Ringkasan RSS dibersihkan dari tag HTML dan entitas berbahaya demi keamanan dan estetika.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
