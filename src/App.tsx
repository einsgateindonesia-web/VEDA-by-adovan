/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TopBar } from './components/TopBar';
import { TacticalStats } from './components/TacticalStats';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { SourceMatrix } from './components/SourceMatrix';
import { ExecutionLogs } from './components/ExecutionLogs';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import { AddSourceModal } from './components/AddSourceModal';
import { ArticleItem, SourceItem, SystemStats, FetchLog, ViewTab, DisplayMode } from './types';
import { 
  Search, 
  LayoutGrid, 
  ListFilter, 
  Bookmark, 
  RefreshCw, 
  Terminal,
  Activity
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('feed');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');

  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [logs, setLogs] = useState<FetchLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(1800); // 30 minutes in seconds

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState<boolean>(false);

  // Modals & Inspection
  const [inspectedArticle, setInspectedArticle] = useState<ArticleItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Bookmarks in LocalStorage
  const [bookmarks, setBookmarks] = useState<Record<string, ArticleItem>>(() => {
    try {
      const saved = localStorage.getItem('veda_saved_articles');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleBookmark = useCallback((article: ArticleItem) => {
    setBookmarks((prev) => {
      const next = { ...prev };
      if (next[article.hashId]) {
        delete next[article.hashId];
      } else {
        next[article.hashId] = article;
      }
      try {
        localStorage.setItem('veda_saved_articles', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save bookmark:', e);
      }
      return next;
    });
  }, []);

  // Fetch articles from API
  const fetchArticles = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedSourceId !== 'all') params.set('source', selectedSourceId);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      params.set('limit', '80');

      const res = await fetch(`/api/articles?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch (err) {
      console.error('[VEDA] Gagal mengambil artikel:', err);
    }
  }, [selectedCategory, selectedSourceId, searchQuery]);

  // Fetch sources
  const fetchSources = useCallback(async () => {
    try {
      const res = await fetch('/api/sources');
      if (res.ok) {
        const data = await res.json();
        setSources(data.sources || []);
      }
    } catch (err) {
      console.error('[VEDA] Gagal mengambil sumber:', err);
    }
  }, []);

  // Fetch stats & logs
  const fetchTelemetry = useCallback(async () => {
    try {
      const [resStats, resLogs] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/logs'),
      ]);

      if (resStats.ok) {
        const s = await resStats.json();
        setStats(s);
        setIsSyncing(s.isSyncing || false);
      }

      if (resLogs.ok) {
        const l = await resLogs.json();
        setLogs(l.logs || []);
      }
    } catch (err) {
      console.error('[VEDA] Gagal mengambil telemetri:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([fetchArticles(), fetchSources(), fetchTelemetry()]);
      setLoading(false);
    }
    init();
  }, [fetchArticles, fetchSources, fetchTelemetry]);

  // Polling every 15s
  useEffect(() => {
    const timer = setInterval(() => {
      fetchTelemetry();
      fetchArticles();
    }, 15000);
    return () => clearInterval(timer);
  }, [fetchTelemetry, fetchArticles]);

  // 30-min countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          triggerSync();
          return 1800;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerSync = async () => {
    try {
      setIsSyncing(true);
      setCountdownSeconds(1800);
      await fetch('/api/sync', { method: 'POST' });
      setTimeout(async () => {
        await Promise.all([fetchArticles(), fetchSources(), fetchTelemetry()]);
      }, 3000);
    } catch (err) {
      console.error('[VEDA] Gagal trigger sync:', err);
    }
  };

  const handleToggleSourceActive = async (id: string) => {
    try {
      await fetch(`/api/sources/${id}/toggle`, { method: 'PATCH' });
      await fetchSources();
      await fetchTelemetry();
    } catch (err) {
      console.error('[VEDA] Gagal toggle sumber:', err);
    }
  };

  const displayedArticles = useMemo(() => {
    if (showBookmarksOnly) {
      const bookmarkedList = Object.values(bookmarks);
      if (selectedCategory !== 'all') {
        return bookmarkedList.filter((a) => a.category.toLowerCase() === selectedCategory.toLowerCase());
      }
      return bookmarkedList;
    }
    return articles;
  }, [articles, bookmarks, showBookmarksOnly, selectedCategory]);

  const categoryList = [
    { id: 'all', label: 'ALL DISPATCHES' },
    { id: 'indonesia', label: 'INDONESIA' },
    { id: 'world', label: 'WORLD AFFAIRS' },
    { id: 'technology', label: 'TECHNOLOGY & AI' },
    { id: 'economy', label: 'ECONOMY & MARKETS' },
    { id: 'science', label: 'SCIENCE & SPACE' },
    { id: 'defense', label: 'DEFENSE & TACTICAL' },
    { id: 'cyber', label: 'CYBER SECURITY' },
  ];

  return (
    <div className="min-h-screen bg-black text-[#e5e5e5] font-sans bg-veda-bw-grid pb-16 selection:bg-white selection:text-black">
      {/* Top Navigation Bar in Anime Monochrome Style */}
      <TopBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isSyncing={isSyncing}
        onTriggerSync={triggerSync}
        countdownSeconds={countdownSeconds}
      />

      {/* Main Viewport Container */}
      <main className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Tactical Telemetry Strip in Black & White */}
        <TacticalStats stats={stats} onRefresh={fetchTelemetry} />

        {/* VIEW 1: Intelligence Feed */}
        {currentTab === 'feed' && (
          <div className="space-y-6">
            
            {/* Filter and Control HUD Bar */}
            <div className="bg-black border border-white/20 p-4 relative font-mono">
              <div className="absolute top-1 left-1 text-[8px] text-white/30">+</div>
              <div className="absolute top-1 right-1 text-[8px] text-white/30">+</div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Search Input */}
                <div className="relative flex-1 max-w-lg">
                  <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="QUERY DISPATCH HEADLINES OR MEDIA NODES..."
                    className="w-full bg-neutral-950 border border-white/20 focus:border-white pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none transition-colors font-mono"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/50 hover:text-white"
                    >
                      [ CLEAR ]
                    </button>
                  )}
                </div>

                {/* Secondary Filters & View Controls */}
                <div className="flex items-center gap-3 shrink-0 flex-wrap text-xs">
                  
                  {/* Source selector dropdown */}
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-white/50 text-[11px] hidden sm:inline">NODE:</span>
                    <select
                      value={selectedSourceId}
                      onChange={(e) => setSelectedSourceId(e.target.value)}
                      className="bg-neutral-950 border border-white/20 text-xs text-white px-2.5 py-1.5 focus:border-white focus:outline-none font-mono max-w-[170px] truncate"
                    >
                      <option value="all">ALL 100+ FEEDS</option>
                      {sources.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bookmark Filter Toggle */}
                  <button
                    onClick={() => setShowBookmarksOnly((prev) => !prev)}
                    className={`px-3 py-1.5 text-xs font-mono font-bold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      showBookmarksOnly
                        ? 'bg-white text-black border-white'
                        : 'bg-black border-white/20 text-white/70 hover:text-white hover:border-white'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${showBookmarksOnly ? 'fill-current' : ''}`} />
                    <span>SAVED ({Object.keys(bookmarks).length})</span>
                  </button>

                  {/* View Mode Toggle (Grid vs Stream) */}
                  <div className="flex items-center bg-black border border-white/20 p-0.5">
                    <button
                      onClick={() => setDisplayMode('grid')}
                      className={`p-1.5 transition-colors cursor-pointer ${
                        displayMode === 'grid' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
                      }`}
                      title="Tactical Grid View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDisplayMode('stream')}
                      className={`p-1.5 transition-colors cursor-pointer ${
                        displayMode === 'stream' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
                      }`}
                      title="Dense Intel Stream"
                    >
                      <ListFilter className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>

              {/* Category Inverted High-Contrast Buttons */}
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
                {categoryList.map((cat) => {
                  const count = cat.id === 'all' 
                    ? stats?.totalArticles 
                    : stats?.categoryCounts?.[cat.id] || 0;
                  const isActive = selectedCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 text-xs transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                        isActive
                          ? 'bg-white text-black font-bold border-white'
                          : 'bg-black text-white/70 hover:text-white border-white/20 hover:border-white/60'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {count !== undefined && (
                        <span className={`text-[10px] tabular-nums ${isActive ? 'text-black/70' : 'text-white/40'}`}>
                          [{count}]
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            {loading ? (
              <div className="p-16 text-center bg-black border border-white/20 flex flex-col items-center justify-center space-y-3 font-mono">
                <RefreshCw className="w-6 h-6 text-white animate-spin" />
                <div className="text-sm font-bold text-white tracking-widest">[ INTERCEPTING RSS WIRE BROADCASTS... ]</div>
                <div className="text-xs text-white/50">PARSING FEED SIGNALS · SANITIZING TELEMETRY · VERIFYING SHA256 HASHES</div>
              </div>
            ) : displayedArticles.length === 0 ? (
              <div className="p-16 text-center bg-black border border-white/20 space-y-3 font-mono">
                <div className="text-sm font-bold text-white tracking-widest">[ NO MATCHING DISPATCHES DETECTED ]</div>
                <p className="text-xs text-white/50 max-w-md mx-auto font-sans">
                  {showBookmarksOnly
                    ? 'Belum ada dispatch yang tersimpan di memori lokal. Klik ikon bookmark pada kartu artikel untuk menyimpannya.'
                    : 'Coba ubah kueri pencarian atau pilih sektor lain. Tekan tombol "SCAN NOW" untuk memicu sinkronisasi manual.'}
                </p>
                <button
                  onClick={triggerSync}
                  className="mt-3 px-4 py-2 bg-white text-black font-bold hover:bg-neutral-200 cursor-pointer font-mono inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>[ COMMENCE SCAN NOW ]</span>
                </button>
              </div>
            ) : displayMode === 'grid' ? (
              /* Grid Mode in Black & White */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    mode="grid"
                    onSelect={setInspectedArticle}
                    isBookmarked={Boolean(bookmarks[article.hashId])}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
              </div>
            ) : (
              /* Stream Mode in Black & White */
              <div className="bg-black border border-white/20 divide-y divide-white/10">
                {displayedArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    mode="stream"
                    onSelect={setInspectedArticle}
                    isBookmarked={Boolean(bookmarks[article.hashId])}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
              </div>
            )}

            {/* Quick Status Ticker Footer */}
            <div className="pt-4 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-white/50 gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-white animate-pulse"></span>
                <span className="text-white/80">[ VEDA CORE STATUS: ONLINE ]</span>
                <span aria-hidden="true" className="text-white/30">/</span>
                <span>AUTO-POLL CADENCE: 30 MINUTES</span>
              </div>
              <div>
                DISPLAYING <span className="text-white font-bold">{displayedArticles.length}</span> DISPATCHES
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: Source Health Matrix */}
        {currentTab === 'sources' && (
          <SourceMatrix
            sources={sources}
            onToggleActive={handleToggleSourceActive}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onRefresh={fetchSources}
          />
        )}

        {/* VIEW 3: Execution Logs */}
        {currentTab === 'logs' && (
          <ExecutionLogs logs={logs} onRefresh={fetchTelemetry} />
        )}

        {/* VIEW 4: Architecture & CLI Docs */}
        {currentTab === 'architecture' && <ArchitectureDocs />}

      </main>

      {/* Article Detail Inspection Modal */}
      <ArticleDetailModal
        article={inspectedArticle}
        onClose={() => setInspectedArticle(null)}
        isBookmarked={Boolean(inspectedArticle && bookmarks[inspectedArticle.hashId])}
        onToggleBookmark={toggleBookmark}
      />

      {/* Add New Source Modal */}
      <AddSourceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSourceAdded={async () => {
          await fetchSources();
          await fetchTelemetry();
        }}
      />
    </div>
  );
}
