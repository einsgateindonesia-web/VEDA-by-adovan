"""
VEDA News Intelligence Terminal - Flask API Backend & Scheduler
Menyediakan REST API untuk artikel, sumber, statistik, serta menjalankan
penjadwalan background fetching otomatis setiap 30 menit via APScheduler.
"""

import os
import sys
import json

# Pastikan path direktori skrip ini ada dalam sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler

from database import init_db, get_articles, get_all_sources, get_system_stats
from fetcher import run_ingestion_cycle, load_sources_from_file

app = Flask(__name__)
CORS(app)

# Inisialisasi Database
init_db()


@app.route("/api/health", methods=["GET"])
def health_check():
    """Status kesehatan server VEDA."""
    return jsonify({
        "status": "ONLINE",
        "system": "VEDA Core Tactical News Aggregator",
        "version": "1.0.0"
    })


@app.route("/api/articles", methods=["GET"])
def api_articles():
    """
    Endpoint daftar artikel:
    Query params:
      - category: filter kategori (indonesia, world, technology, economy, science, defense, cyber)
      - source: filter ID sumber
      - search: kata kunci pencarian
      - limit: batas artikel per halaman (default: 50, max: 200)
      - offset: pagination offset
    """
    category = request.args.get("category", None)
    source_id = request.args.get("source", None)
    search = request.args.get("search", None)
    limit = min(int(request.args.get("limit", 50)), 200)
    offset = int(request.args.get("offset", 0))

    articles = get_articles(
        category=category,
        source_id=source_id,
        search=search,
        limit=limit,
        offset=offset
    )
    return jsonify({
        "count": len(articles),
        "articles": articles
    })


@app.route("/api/sources", methods=["GET"])
def api_sources():
    """Mengambil daftar semua sumber berita RSS yang terdaftar beserta statusnya."""
    sources = get_all_sources()
    if not sources:
        # Fallback jika belum pernah di-sync ke DB
        sources = load_sources_from_file()
    return jsonify({
        "count": len(sources),
        "sources": sources
    })


@app.route("/api/stats", methods=["GET"])
def api_stats():
    """Mengambil ringkasan statistik artikel, sumber aktif, dan log fetch terakhir."""
    stats = get_system_stats()
    return jsonify(stats)


@app.route("/api/sync", methods=["POST"])
def api_trigger_sync():
    """Memicu siklus fetch baru secara manual (on-demand)."""
    try:
        result = run_ingestion_cycle()
        return jsonify({
            "message": "Siklus pengambilan selesai.",
            "result": result
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Inisialisasi Penjadwalan Otomatis Setiap 30 Menit
scheduler = BackgroundScheduler()
scheduler.add_job(
    func=run_ingestion_cycle,
    trigger="interval",
    minutes=30,
    id="veda_30m_news_sync",
    replace_existing=True
)
scheduler.start()

if __name__ == "__main__":
    # Jalankan fetcher sekali saat startup jika database masih kosong
    stats = get_system_stats()
    if stats["total_articles"] == 0:
        print("[VEDA Startup] Menjalankan fetch perdana...")
        run_ingestion_cycle()

    print("[VEDA API] Server berjalan di http://0.0.0.0:5000")
    print("[VEDA API] Scheduler aktif: Auto-fetch setiap 30 menit.")
    app.run(host="0.0.0.0", port=5000, debug=False)
