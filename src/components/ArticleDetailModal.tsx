import React, { useEffect } from 'react';
import { ArticleItem } from '../types';
import { X, ExternalLink, Bookmark, Copy, Check, Clock } from 'lucide-react';

interface ArticleDetailModalProps {
  article: ArticleItem | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (article: ArticleItem) => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  onClose,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!article) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(article.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatUtcDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toUTCString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm font-mono animate-fade-in">
      <div 
        className="bg-black border border-white rounded-none max-w-2xl w-full p-6 shadow-[0_0_40px_rgba(255,255,255,0.15)] relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header telemetry */}
        <div className="flex items-center justify-between pb-3 border-b border-white/20 text-xs font-mono">
          <div className="flex items-center gap-2 text-white">
            <span className="font-bold tracking-widest">[ VEDA // DISPATCH INSPECTION ]</span>
            <span className="inline-block w-1.5 h-2.5 bg-white animate-cursor-blink"></span>
          </div>

          <button
            onClick={onClose}
            className="p-1 border border-transparent hover:border-white text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Close [Esc]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unboxed Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-white/60 font-mono mt-4">
          <span className="text-white font-bold">{article.sourceName}</span>
          <span aria-hidden="true" className="text-white/30">/</span>
          <span className="uppercase text-white/80">{article.category}</span>
          <span aria-hidden="true" className="text-white/30">/</span>
          <span className="flex items-center gap-1 tabular-nums text-white/50">
            <Clock className="w-3 h-3 text-white/40" />
            {formatUtcDate(article.publishedAt)}
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-xl sm:text-2xl font-bold text-white mt-3 leading-snug font-sans">
          {article.title}
        </h2>

        {/* Summary Body */}
        <div className="mt-5 p-4 bg-neutral-950 border border-white/20 text-sm text-neutral-300 leading-relaxed font-sans">
          {article.summary ? (
            <p className="whitespace-pre-line">{article.summary}</p>
          ) : (
            <p className="italic text-white/40">
              Ringkasan artikel tidak disertakan dalam sinyal RSS. Silakan buka tautan sumber resmi di bawah untuk membaca artikel lengkap.
            </p>
          )}
        </div>

        {/* Telemetry hash */}
        <div className="mt-4 p-2.5 bg-neutral-950 border border-white/10 text-[10px] font-mono text-white/40 truncate">
          <span className="text-white/70 font-semibold">[ SHA256 HASH ]: </span>
          <span className="text-white/90">{article.hashId}</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(article)}
              className={`px-3 py-1.5 border flex items-center gap-1.5 transition-colors cursor-pointer font-bold ${
                isBookmarked
                  ? 'bg-white text-black border-white'
                  : 'bg-black border-white/30 text-white/70 hover:text-white hover:border-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>{isBookmarked ? '[ SAVED ]' : '[ SAVE DISPATCH ]'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 border bg-black border-white/30 text-white/70 hover:text-white hover:border-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '[ COPIED ]' : '[ COPY LINK ]'}</span>
            </button>
          </div>

          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white hover:bg-neutral-200 text-black font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] cursor-pointer"
          >
            <span>OPEN ORIGINAL SOURCE</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
