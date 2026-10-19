import React, { useState } from 'react';
import { SourceItem } from '../types';
import { Search, Plus, Download, Power, ExternalLink } from 'lucide-react';

interface SourceMatrixProps {
  sources: SourceItem[];
  onToggleActive: (id: string) => Promise<void>;
  onOpenAddModal: () => void;
  onRefresh: () => void;
}

export const SourceMatrix: React.FC<SourceMatrixProps> = ({
  sources,
  onToggleActive,
  onOpenAddModal,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ONLINE' | 'ERROR'>('all');

  const categories = ['all', 'indonesia', 'world', 'technology', 'economy', 'science', 'defense', 'cyber'];

  const filtered = sources.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.url.toLowerCase().includes(search.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || s.category.toLowerCase() === selectedCategory;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'ONLINE' && s.lastStatus === 'ONLINE') ||
      (statusFilter === 'ERROR' && s.lastStatus === 'ERROR');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalActive = sources.filter((s) => s.active).length;
  const totalOnline = sources.filter((s) => s.active && s.lastStatus === 'ONLINE').length;

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Controls Bar */}
      <div className="bg-black border border-white/20 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="FILTER NODES OR RSS URLS..."
            className="w-full bg-neutral-950 border border-white/20 focus:border-white pl-9 pr-3 py-2 text-white placeholder-white/40 focus:outline-none transition-colors font-mono"
          />
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={onOpenAddModal}
            className="px-3 py-2 bg-white hover:bg-neutral-200 text-black font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>[ + REGISTER RSS NODE ]</span>
          </button>

          <a
            href="/api/opml/export"
            download="veda_feeds.opml"
            className="px-3 py-2 bg-black border border-white/30 hover:border-white text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export all feeds as standard OPML XML"
          >
            <Download className="w-3.5 h-3.5" />
            <span>[ EXPORT OPML ]</span>
          </a>
        </div>
      </div>

      {/* Category & Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Category Segmented Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1.5 transition-colors whitespace-nowrap uppercase cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-white text-black font-bold border-white'
                  : 'text-white/60 hover:text-white bg-black border-white/20 hover:border-white/50'
              }`}
            >
              [ {cat === 'all' ? 'ALL SECTORS' : cat} ]
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-white/50 text-[10px]">FILTER:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2 py-1 text-[11px] border cursor-pointer ${
              statusFilter === 'all' ? 'bg-white text-black font-bold border-white' : 'border-white/20 text-white/60'
            }`}
          >
            ALL ({sources.length})
          </button>
          <button
            onClick={() => setStatusFilter('ONLINE')}
            className={`px-2 py-1 text-[11px] border cursor-pointer ${
              statusFilter === 'ONLINE' ? 'bg-white text-black font-bold border-white' : 'border-white/20 text-white/60'
            }`}
          >
            ONLINE ({totalOnline})
          </button>
          <button
            onClick={() => setStatusFilter('ERROR')}
            className={`px-2 py-1 text-[11px] border cursor-pointer ${
              statusFilter === 'ERROR' ? 'bg-white text-black font-bold border-white' : 'border-white/20 text-white/60'
            }`}
          >
            ERR ({sources.filter((s) => s.lastStatus === 'ERROR').length})
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-black border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-950 border-b border-white/20 text-white/60 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-4">Node / Source</th>
                <th className="py-2.5 px-4">Sector</th>
                <th className="py-2.5 px-4">Lang</th>
                <th className="py-2.5 px-4">Telemetry</th>
                <th className="py-2.5 px-4">Articles</th>
                <th className="py-2.5 px-4 text-center">Power</th>
                <th className="py-2.5 px-4 text-right">Endpoint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-white/50">
                    NO MATCHING INTEL NODES FOUND.
                  </td>
                </tr>
              ) : (
                filtered.map((src) => (
                  <tr
                    key={src.id}
                    className={`hover:bg-neutral-950 transition-colors ${
                      !src.active ? 'opacity-30 bg-neutral-950/50' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-white font-sans text-sm">{src.name}</div>
                      <div className="text-[10px] text-white/40 truncate max-w-[260px]">
                        {src.description || src.id}
                      </div>
                    </td>

                    <td className="py-3 px-4 uppercase text-white/80 font-bold">
                      {src.category}
                    </td>

                    <td className="py-3 px-4 uppercase text-white/60">
                      {src.language}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {src.lastStatus === 'ONLINE' ? (
                          <>
                            <span className="font-bold text-white">[ ONLINE ]</span>
                            {src.latencyMs ? (
                              <span className="text-white/40 tabular-nums">({src.latencyMs}ms)</span>
                            ) : null}
                          </>
                        ) : src.lastStatus === 'ERROR' ? (
                          <span className="font-bold text-white/80 border border-white/40 px-1 text-[10px]">
                            [ ERROR ]
                          </span>
                        ) : (
                          <span className="text-white/40">[ STANDBY ]</span>
                        )}
                      </div>
                      {src.lastError && (
                        <div className="text-[10px] text-white/40 truncate max-w-[180px]" title={src.lastError}>
                          {src.lastError}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 tabular-nums text-white">
                      {src.articleCount ? src.articleCount.toLocaleString() : '0'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onToggleActive(src.id)}
                        className={`p-1.5 border transition-colors cursor-pointer ${
                          src.active
                            ? 'bg-white text-black border-white'
                            : 'border-white/20 text-white/40 hover:text-white hover:border-white'
                        }`}
                        title={src.active ? 'Disable Feed' : 'Enable Feed'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-white/80 hover:text-white hover:underline"
                        title={src.url}
                      >
                        <span className="truncate max-w-[130px]">{src.url.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
