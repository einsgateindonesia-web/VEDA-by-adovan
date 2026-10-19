"""
VEDA News Intelligence Terminal - SQLite Database Manager
Menangani inisialisasi tabel, penyimpanan artikel (dengan deduplikasi),
manajemen sumber, dan pencatatan riwayat eksekusi (fetch logs).
"""

import os
import sqlite3
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
DB_PATH = os.path.join(DB_DIR, "veda.db")


def get_connection() -> sqlite3.Connection:
    """Membuka koneksi ke database SQLite dan memastikan direktori ada."""
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Inisialisasi skema tabel SQLite: articles, sources, dan fetch_logs."""
    conn = get_connection()
    cursor = conn.cursor()

    # Tabel Sumber Berita (Sources)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sources (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        language TEXT DEFAULT 'en',
        active INTEGER DEFAULT 1,
        last_fetched_at TEXT,
        last_status TEXT DEFAULT 'PENDING',
        error_count INTEGER DEFAULT 0,
        description TEXT
    );
    """)

    # Tabel Artikel (Articles) dengan indeks hash_id untuk deduplikasi cepat
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hash_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        summary TEXT,
        link TEXT NOT NULL,
        source_id TEXT NOT NULL,
        source_name TEXT NOT NULL,
        category TEXT NOT NULL,
        language TEXT DEFAULT 'en',
        published_at TEXT,
        fetched_at TEXT NOT NULL,
        FOREIGN KEY(source_id) REFERENCES sources(id)
    );
    """)

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source_id);")

    # Tabel Log Pengambilan (Fetch Logs)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS fetch_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        total_sources INTEGER NOT NULL,
        successful_sources INTEGER NOT NULL,
        failed_sources INTEGER NOT NULL,
        new_articles INTEGER NOT NULL,
        duration_seconds REAL NOT NULL,
        status TEXT NOT NULL,
        details TEXT
    );
    """)

    conn.commit()
    conn.close()
    print(f"[VEDA DB] Database initialized at: {DB_PATH}")


def generate_article_hash(link: str, title: str) -> str:
    """Menghasilkan hash SHA-256 unik untuk deduplikasi artikel."""
    payload = f"{link.strip()}_{title.strip()}".encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def insert_article(cursor: sqlite3.Cursor, article: Dict[str, Any]) -> bool:
    """
    Menyimpan artikel ke database jika belum ada (berdasarkan hash_id).
    Mengembalikan True jika artikel baru, False jika duplikat.
    """
    hash_id = generate_article_hash(article["link"], article["title"])
    try:
        cursor.execute("""
        INSERT INTO articles (
            hash_id, title, summary, link, source_id, 
            source_name, category, language, published_at, fetched_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            hash_id,
            article["title"],
            article.get("summary", ""),
            article["link"],
            article["source_id"],
            article["source_name"],
            article["category"],
            article.get("language", "en"),
            article.get("published_at", datetime.utcnow().isoformat()),
            datetime.utcnow().isoformat()
        ))
        return True
    except sqlite3.IntegrityError:
        # Sudah ada (duplikat), lewati
        return False


def upsert_source(source: Dict[str, Any]):
    """Menambahkan atau memperbarui konfigurasi sumber berita."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO sources (id, name, url, category, language, active, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        name=excluded.name,
        url=excluded.url,
        category=excluded.category,
        language=excluded.language,
        active=excluded.active,
        description=excluded.description;
    """, (
        source["id"],
        source["name"],
        source["url"],
        source["category"],
        source.get("language", "en"),
        1 if source.get("active", True) else 0,
        source.get("description", "")
    ))
    conn.commit()
    conn.close()


def update_source_status(source_id: str, status: str, is_error: bool = False):
    """Memperbarui status kesehatan sumber setelah fetch."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    if is_error:
        cursor.execute("""
        UPDATE sources 
        SET last_fetched_at = ?, last_status = ?, error_count = error_count + 1
        WHERE id = ?
        """, (now, status, source_id))
    else:
        cursor.execute("""
        UPDATE sources 
        SET last_fetched_at = ?, last_status = ?, error_count = 0
        WHERE id = ?
        """, (now, status, source_id))
    conn.commit()
    conn.close()


def record_fetch_log(total_sources: int, success: int, failed: int, new_articles: int, duration: float, status: str, details: str = ""):
    """Mencatat hasil siklus pengambilan ke fetch_logs."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO fetch_logs (timestamp, total_sources, successful_sources, failed_sources, new_articles, duration_seconds, status, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        datetime.utcnow().isoformat(),
        total_sources,
        success,
        failed,
        new_articles,
        duration,
        status,
        details
    ))
    conn.commit()
    conn.close()


def get_articles(category: Optional[str] = None, source_id: Optional[str] = None, search: Optional[str] = None, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """Query daftar artikel dengan filter dan pagination."""
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM articles WHERE 1=1"
    params = []

    if category and category != "all":
        query += " AND category = ?"
        params.append(category)

    if source_id:
        query += " AND source_id = ?"
        params.append(source_id)

    if search:
        query += " AND (title LIKE ? OR summary LIKE ?)"
        wildcard = f"%{search}%"
        params.extend([wildcard, wildcard])

    query += " ORDER BY published_at DESC, id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    articles = [dict(row) for row in rows]
    conn.close()
    return articles


def get_all_sources() -> List[Dict[str, Any]]:
    """Mengambil semua daftar sumber berita beserta status kesehatannya."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sources ORDER BY category, name ASC")
    rows = cursor.fetchall()
    sources = [dict(row) for row in rows]
    conn.close()
    return sources


def get_system_stats() -> Dict[str, Any]:
    """Mengambil statistik agregasi sistem VEDA."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as count FROM articles")
    total_articles = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM sources WHERE active = 1")
    active_sources = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM sources")
    total_sources = cursor.fetchone()["count"]

    cursor.execute("SELECT * FROM fetch_logs ORDER BY id DESC LIMIT 1")
    last_log_row = cursor.fetchone()
    last_log = dict(last_log_row) if last_log_row else None

    # Hitung jumlah artikel per kategori
    cursor.execute("SELECT category, COUNT(*) as count FROM articles GROUP BY category")
    category_counts = {row["category"]: row["count"] for row in cursor.fetchall()}

    conn.close()

    return {
        "total_articles": total_articles,
        "active_sources": active_sources,
        "total_sources": total_sources,
        "last_log": last_log,
        "category_counts": category_counts
    }
