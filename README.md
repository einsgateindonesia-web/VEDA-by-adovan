# VEDA Terminal

**Tactical Intelligence News Aggregator**  
Inspired by *Mobile Suit Gundam 00* — Celestial Being Quantum Core aesthetic.

Black & white monochrome terminal UI that monitors **100+ RSS feeds** across Indonesia, World, Technology, Economy, Science, Defense, and Cyber categories.

![VEDA Terminal](src/assets/images/veda_tactical_banner_1792375967657.jpg)

---

## Features

- **Real-time RSS aggregation** with concurrent fetching (pool of 5)
- **SHA-256 deduplication** — no duplicate articles
- **Automatic sync every 30 minutes** + manual trigger
- **Source health matrix** — latency, status, error tracking
- **Category & source filtering** + full-text search
- **Bookmark system** (stored in browser localStorage)
- **Execution logs** of every ingestion cycle
- **OPML export** of all feeds
- **Responsive** tactical UI (desktop + mobile)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript + Tailwind CSS v4 |
| Backend | Node.js + Express + `rss-parser` |
| Storage | Local JSON file (`data/veda_store.json`) |
| Runtime | `tsx` (no build step needed for development) |
| Package Manager | Bun / npm / pnpm |

> There is also an experimental Python backend under `veda-news/` (Flask + SQLite).  
> The main production path is the Node.js server.

---

## Quick Start

### 1. Install dependencies

```bash
# Using Bun (recommended)
bun install

# or npm
npm install
```

### 2. Run development server

```bash
bun run dev
# or
npm run dev
```

Open → [http://localhost:3000](http://localhost:3000)

The server will:
- Load default sources from `src/data/sources.json`
- Perform an initial RSS fetch if the store is empty
- Start the 30-minute auto-sync scheduler

### 3. Production build

```bash
npm run build
NODE_ENV=production npm start
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/articles` | List articles (`?category=&source=&search=&limit=&offset=`) |
| `GET` | `/api/sources` | List all sources + categories |
| `GET` | `/api/stats` | System statistics & health |
| `GET` | `/api/logs` | Ingestion execution logs |
| `POST` | `/api/sync` | Trigger manual sync |
| `POST` | `/api/sources` | Add a new source |
| `PATCH` | `/api/sources/:id` | Toggle active / update source |
| `GET` | `/api/opml/export` | Download OPML of all feeds |

---

## Project Structure

```
VEDA/
├── server.ts                 # Express API + RSS ingestion engine
├── src/
│   ├── App.tsx               # Main application
│   ├── components/           # UI components
│   ├── data/sources.json     # Default 103 RSS sources
│   ├── types.ts
│   └── index.css
├── data/
│   └── veda_store.json       # Runtime database (auto-created)
├── veda-news/                # Experimental Python backend (optional)
├── index.html
├── package.json
└── README.md
```

---

## Default Categories

- `indonesia` — Berita nasional
- `world` — Internasional & geopolitik
- `technology` — Tech & startup
- `economy` — Ekonomi & pasar
- `science` — Sains & antariksa
- `defense` — Pertahanan
- `cyber` — Keamanan siber

---

## Environment Variables

Copy `.env.example` → `.env` if needed:

```env
PORT=3000
NODE_ENV=development
```

---

## License

MIT © 2026 Eins Gate Indonesia
