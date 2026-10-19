"""
VEDA News Intelligence Terminal - RSS Fetcher Engine
Mengambil berita dari daftar sumber RSS secara mandiri, aman terhadap kegagalan,
dengan timeout 10 detik, auto-retry 2x, pembersihan ringkasan, dan deduplikasi.
Dukungan ganda: feedparser + requests, atau fallback standar urllib + ElementTree.
"""

import os
import sys
import re
import json
import time
import logging
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, Any, List

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Cek ketersediaan library pihak ketiga
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

try:
    import feedparser
    HAS_FEEDPARSER = True
except ImportError:
    HAS_FEEDPARSER = False

try:
    from database import (
        init_db,
        get_connection,
        insert_article,
        upsert_source,
        update_source_status,
        record_fetch_log,
        DB_PATH
    )
except ImportError:
    from .database import (
        init_db,
        get_connection,
        insert_article,
        upsert_source,
        update_source_status,
        record_fetch_log,
        DB_PATH
    )

# Setup Logging
LOG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "logs"))
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "fetch.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [VEDA] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler()
    ]
)

SOURCES_FILE = os.path.join(os.path.dirname(__file__), "sources.json")
TIMEOUT_SECONDS = 10
MAX_RETRIES = 2
MAX_CONCURRENT_WORKERS = 5

USER_AGENT = "VEDA-Intelligence-System/1.0 (+https://veda-intelligence.org; news-aggregator)"


def clean_html(raw_html: str) -> str:
    """Membersihkan tag HTML dan entitas karakter dari ringkasan."""
    if not raw_html:
        return ""
    clean = re.sub(r"<[^>]+>", "", raw_html)
    clean = (
        clean.replace("&nbsp;", " ")
        .replace("&amp;", "&")
        .replace("&quot;", '"')
        .replace("&#39;", "'")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
    )
    return " ".join(clean.split())[:450]


def parse_with_xml_fallback(xml_bytes: bytes, source: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Parser cadangan menggunakan pustaka bawaan Python xml.etree.ElementTree."""
    root = ET.fromstring(xml_bytes)
    articles = []

    # Format RSS 2.0: <rss><channel><item>
    items = root.findall(".//item")
    if not items:
        # Format Atom: <feed><entry>
        # Tangani namespace jika ada
        items = root.findall(".//{http://www.w3.org/2005/Atom}entry") or root.findall(".//entry")

    for item in items:
        title_el = item.find("title") or item.find("{http://www.w3.org/2005/Atom}title")
        link_el = item.find("link") or item.find("{http://www.w3.org/2005/Atom}link")
        desc_el = (
            item.find("description")
            or item.find("summary")
            or item.find("{http://www.w3.org/2005/Atom}summary")
            or item.find("{http://www.w3.org/2005/Atom}content")
        )
        date_el = (
            item.find("pubDate")
            or item.find("published")
            or item.find("{http://www.w3.org/2005/Atom}published")
            or item.find("date")
        )

        title = title_el.text.strip() if title_el is not None and title_el.text else ""
        link = ""
        if link_el is not None:
            link = link_el.get("href") or (link_el.text.strip() if link_el.text else "")

        if not title or not link:
            continue

        raw_desc = desc_el.text if desc_el is not None and desc_el.text else ""
        summary = clean_html(raw_desc)

        pub_date = date_el.text.strip() if date_el is not None and date_el.text else datetime.utcnow().isoformat()

        articles.append({
            "title": title,
            "summary": summary,
            "link": link,
            "source_id": source["id"],
            "source_name": source["name"],
            "category": source.get("category", "world"),
            "language": source.get("language", "en"),
            "published_at": pub_date
        })

    return articles


def fetch_single_feed(source: Dict[str, Any]) -> Dict[str, Any]:
    """
    Mengambil 1 sumber RSS dengan toleransi error, timeout 10 detik,
    dan retry maksimal 2x.
    """
    source_id = source["id"]
    source_name = source["name"]
    url = source["url"]
    category = source.get("category", "world")
    language = source.get("language", "en")

    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/rss+xml, application/rdf+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8"
    }

    last_error = None
    for attempt in range(1, MAX_RETRIES + 2):
        try:
            start_time = time.time()
            content_bytes = b""

            if HAS_REQUESTS:
                response = requests.get(url, headers=headers, timeout=TIMEOUT_SECONDS)
                response.raise_for_status()
                content_bytes = response.content
            else:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
                    content_bytes = resp.read()

            articles = []
            if HAS_FEEDPARSER:
                parsed = feedparser.parse(content_bytes)
                for entry in parsed.entries:
                    title = getattr(entry, "title", "").strip()
                    link = getattr(entry, "link", "").strip()
                    if not title or not link:
                        continue

                    summary_raw = getattr(entry, "summary", "") or getattr(entry, "description", "")
                    summary = clean_html(summary_raw)

                    pub_date = None
                    if hasattr(entry, "published_parsed") and entry.published_parsed:
                        pub_date = datetime(*entry.published_parsed[:6]).isoformat()
                    elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
                        pub_date = datetime(*entry.updated_parsed[:6]).isoformat()
                    else:
                        pub_date = datetime.utcnow().isoformat()

                    articles.append({
                        "title": title,
                        "summary": summary,
                        "link": link,
                        "source_id": source_id,
                        "source_name": source_name,
                        "category": category,
                        "language": language,
                        "published_at": pub_date
                    })
            else:
                # Fallback ke built-in ElementTree
                articles = parse_with_xml_fallback(content_bytes, source)

            duration = round(time.time() - start_time, 2)
            return {
                "source_id": source_id,
                "success": True,
                "articles": articles,
                "duration": duration,
                "error": None
            }

        except Exception as e:
            last_error = str(e)
            if attempt <= MAX_RETRIES:
                time.sleep(1.0 * attempt)

    return {
        "source_id": source_id,
        "success": False,
        "articles": [],
        "duration": 0,
        "error": last_error
    }


def load_sources_from_file() -> List[Dict[str, Any]]:
    """Membaca daftar sumber dari sources.json."""
    if not os.path.exists(SOURCES_FILE):
        logging.error(f"File sumber tidak ditemukan di {SOURCES_FILE}")
        return []
    with open(SOURCES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def run_ingestion_cycle(sources_list: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Menjalankan 1 siklus penuh pengambilan berita dari semua sumber aktif.
    Menyimpan ke database dengan deduplikasi otomatis.
    """
    init_db()

    if sources_list is None:
        sources_list = load_sources_from_file()

    active_sources = [s for s in sources_list if s.get("active", True)]
    total_sources = len(active_sources)

    logging.info(f"== [VEDA INGESTION] Memulai siklus pengambilan {total_sources} sumber aktif ==")
    cycle_start = time.time()

    # Pastikan konfigurasi sumber tercatat di DB
    for s in active_sources:
        upsert_source(s)

    successful_count = 0
    failed_count = 0
    total_new_articles = 0
    errors_detail = []

    conn = get_connection()
    cursor = conn.cursor()

    # Eksekusi paralel dengan ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=MAX_CONCURRENT_WORKERS) as executor:
        future_to_source = {executor.submit(fetch_single_feed, s): s for s in active_sources}

        for future in as_completed(future_to_source):
            src_info = future_to_source[future]
            try:
                result = future.result()
                if result["success"]:
                    successful_count += 1
                    update_source_status(src_info["id"], "ONLINE", is_error=False)

                    new_for_source = 0
                    for article in result["articles"]:
                        if insert_article(cursor, article):
                            new_for_source += 1
                    conn.commit()

                    total_new_articles += new_for_source
                    logging.info(f"✓ [{src_info['name']}] Berhasil ({len(result['articles'])} item, +{new_for_source} baru) dlm {result['duration']}s")
                else:
                    failed_count += 1
                    err_msg = f"Gagal fetch {src_info['name']}: {result['error']}"
                    logging.warning(f"✗ [{src_info['name']}] Gagal: {result['error']}")
                    update_source_status(src_info["id"], "ERROR", is_error=True)
                    errors_detail.append(err_msg)

            except Exception as exc:
                failed_count += 1
                logging.error(f"✗ [{src_info['name']}] Eksepsi tidak tertangani: {exc}")
                update_source_status(src_info["id"], "CRITICAL_ERROR", is_error=True)
                errors_detail.append(str(exc))

    conn.close()

    total_duration = round(time.time() - cycle_start, 2)
    cycle_status = "SUCCESS" if failed_count == 0 else ("PARTIAL" if successful_count > 0 else "FAILED")

    details_str = f"Siklus selesai. Baru: {total_new_articles}. Error: {len(errors_detail)}"
    if errors_detail:
        details_str += " | " + "; ".join(errors_detail[:5])

    record_fetch_log(
        total_sources=total_sources,
        success=successful_count,
        failed=failed_count,
        new_articles=total_new_articles,
        duration=total_duration,
        status=cycle_status,
        details=details_str
    )

    logging.info(f"== [VEDA INGESTION SELESAI] Durasi: {total_duration}s | Sukses: {successful_count}/{total_sources} | Artikel baru: +{total_new_articles} ==")

    return {
        "status": cycle_status,
        "total_sources": total_sources,
        "successful_sources": successful_count,
        "failed_sources": failed_count,
        "new_articles": total_new_articles,
        "duration_seconds": total_duration,
        "timestamp": datetime.utcnow().isoformat()
    }


if __name__ == "__main__":
    print("==================================================")
    print("   VEDA INTELLIGENCE SYSTEM - RSS FETCHER ENGINE  ")
    print("==================================================")
    result = run_ingestion_cycle()
    print("\nHasil Eksekusi:")
    print(json.dumps(result, indent=2))
