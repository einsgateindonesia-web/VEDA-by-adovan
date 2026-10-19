import React from 'react';
import { ArticleItem, DisplayMode } from '../types';
import { ExternalLink, Bookmark, Clock, ArrowUpRight } from 'lucide-react';

interface ArticleCardProps {
  article: ArticleItem;
  mode: DisplayMode;
  onSelect: (article: ArticleItem) => void;
  isBookmarked: boolean;
  onToggleBookmark: (article: ArticleItem) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  mode,
  onSelect,
  isBookmarked,
  onToggleBookmark,
}) => {
  const formatRelativeTime = (iso: string) => {
    try {
      const diff = Math.max(0, Date.now() - new Date(iso).getTime());
      const mins = Math.floor(diff / (1000 * 60));
      if (mins < 60) return `${mins}M AGO`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}H AGO`;
      const days = Math.floor(hours / 24);
      return `${days}D AGO`;
    } catch {
      return 'RECENT';
    }
  };

  if (mode === 'stream') {
    return (
      <div className="group border-b border-white/10 hover:bg-neutral-950 transition-colors py-3 px-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex-1 min-w-0 pr-4">
          {/* Unboxed metadata line with typographic separators */}
          <div className="flex items-center gap-2 text-[11px] text-white/50 mb-1">
            <span className="text-white font-bold">{article.sourceName}</span>
            <span aria-hidden="true" className="text-white/30">/</span>
            <span className="uppercase tracking-wider text-white/80">
              {article.category}
            </span>
            <span aria-hidden="true" className="text-white/30">/</span>
            <span className="tabular-nums flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-white/40" />
              {formatRelativeTime(article.publishedAt)}
            </span>
          </div>

          <button
            onClick={() => onSelect(article)}
            className="text-left font-sans font-medium text-white group-hover:text-white group-hover:underline transition-colors line-clamp-1 cursor-pointer focus:outline-none text-sm"
          >
            {article.title}
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(article);
            }}
            className={`p-1.5 border transition-colors cursor-pointer ${
              isBookmarked
                ? 'bg-white text-black border-white'
                : 'border-white/20 text-white/50 hover:text-white hover:border-white'
            }`}
            title={isBookmarked ? 'Saved to memory' : 'Save to memory'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 border border-white/20 hover:border-white text-white/50 hover:text-white transition-colors cursor-pointer"
            title="Open original dispatch"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // Grid Mode Card - Black and White Anime Terminal style
  return (
    <div className="bg-black border border-white/20 hover:border-white transition-all duration-150 p-4 flex flex-col justify-between group relative shadow-[0_0_15px_rgba(255,255,255,0.03)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
      {/* Anime corner crosshairs */}
      <div className="absolute top-1 left-1 text-[8px] text-white/30 font-mono">+</div>
      <div className="absolute top-1 right-1 text-[8px] text-white/30 font-mono">+</div>
      <div className="absolute bottom-1 left-1 text-[8px] text-white/30 font-mono">+</div>
      <div className="absolute bottom-1 right-1 text-[8px] text-white/30 font-mono">+</div>

      <div>
        {/* Unboxed Metadata Strip */}
        <div className="flex items-center justify-between text-[11px] text-white/50 mb-2 font-mono">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-white font-bold truncate max-w-[140px]">
              {article.sourceName}
            </span>
            <span aria-hidden="true" className="text-white/30">/</span>
            <span className="uppercase text-white/80 tracking-wider">
              {article.category}
            </span>
          </div>
          <span className="tabular-nums text-white/40 shrink-0">
            {formatRelativeTime(article.publishedAt)}
          </span>
        </div>

        {/* Primary Headline */}
        <button
          onClick={() => onSelect(article)}
          className="text-left font-sans font-bold text-white group-hover:underline transition-colors line-clamp-2 text-base leading-snug cursor-pointer focus:outline-none mb-2"
        >
          {article.title}
        </button>

        {/* Excerpt Summary */}
        <p className="text-xs text-white/60 line-clamp-3 leading-relaxed mb-4 font-sans">
          {article.summary || 'Summary unavailable from RSS transmission. Click dispatch to inspect full telemetry and external link.'}
        </p>
      </div>

      {/* Card Action Footer */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
        <button
          onClick={() => onSelect(article)}
          className="text-white hover:bg-white hover:text-black px-2 py-1 border border-white/30 transition-colors flex items-center gap-1 text-[10px] tracking-wider cursor-pointer font-bold"
        >
          <span>INSPECT INTEL</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleBookmark(article)}
            className={`p-1.5 border transition-colors cursor-pointer ${
              isBookmarked
                ? 'bg-white text-black border-white'
                : 'border-white/20 text-white/50 hover:text-white hover:border-white'
            }`}
            title={isBookmarked ? 'Remove from saved' : 'Save dispatch'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 border border-white/20 hover:border-white text-white/50 hover:text-white transition-colors cursor-pointer"
            title="Read at original source"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
