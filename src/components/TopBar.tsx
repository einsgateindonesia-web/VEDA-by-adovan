import React from 'react';
import { ViewTab } from '../types';
import { RefreshCw } from 'lucide-react';

interface TopBarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  isSyncing: boolean;
  onTriggerSync: () => void;
  countdownSeconds: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onTabChange,
  isSyncing,
  onTriggerSync,
  countdownSeconds,
}) => {
  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/20">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: VEDA Anime Wordmark */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-none border border-white flex items-center justify-center bg-black text-white font-mono font-bold text-sm tracking-wider shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            V
          </div>
          <button
            onClick={() => onTabChange('feed')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <div className="text-base sm:text-lg font-bold tracking-widest text-white font-mono uppercase">
              VEDA <span className="text-white/40">//</span> TERMINAL
            </div>
            <div className="text-[10px] font-mono tracking-widest text-white/60 flex items-center gap-1.5 -mt-0.5">
              <span>CB-MAINFRAME-2307</span>
              <span className="inline-block w-1.5 h-2.5 bg-white animate-cursor-blink"></span>
              <span className="hidden sm:inline text-white/40">[LVL.7]</span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4 clean single-line navigation links in pure monochrome */}
        <nav className="hidden md:flex items-center gap-2 text-xs font-mono tracking-wider">
          <button
            onClick={() => onTabChange('feed')}
            className={`whitespace-nowrap shrink-0 transition-all py-1.5 px-3 border cursor-pointer ${
              currentTab === 'feed'
                ? 'bg-white text-black font-bold border-white'
                : 'text-white/70 hover:text-white border-transparent hover:border-white/30'
            }`}
          >
            [ INTELLIGENCE FEED ]
          </button>
          <button
            onClick={() => onTabChange('sources')}
            className={`whitespace-nowrap shrink-0 transition-all py-1.5 px-3 border cursor-pointer ${
              currentTab === 'sources'
                ? 'bg-white text-black font-bold border-white'
                : 'text-white/70 hover:text-white border-transparent hover:border-white/30'
            }`}
          >
            [ SOURCE MATRIX ]
          </button>
          <button
            onClick={() => onTabChange('logs')}
            className={`whitespace-nowrap shrink-0 transition-all py-1.5 px-3 border cursor-pointer ${
              currentTab === 'logs'
                ? 'bg-white text-black font-bold border-white'
                : 'text-white/70 hover:text-white border-transparent hover:border-white/30'
            }`}
          >
            [ EXECUTION LOGS ]
          </button>
          <button
            onClick={() => onTabChange('architecture')}
            className={`whitespace-nowrap shrink-0 transition-all py-1.5 px-3 border cursor-pointer ${
              currentTab === 'architecture'
                ? 'bg-white text-black font-bold border-white'
                : 'text-white/70 hover:text-white border-transparent hover:border-white/30'
            }`}
          >
            [ SPECS & CLI ]
          </button>
        </nav>

        {/* Zone 3: 1 primary action button with tactical countdown telemetry */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col text-right font-mono text-[10px] leading-tight">
            <span className="text-white/50">NEXT REFRESH</span>
            <span className="text-white font-bold tabular-nums tracking-widest">
              {formatCountdown(countdownSeconds)}
            </span>
          </div>

          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className={`px-3 py-1.5 text-xs font-mono font-bold border transition-all whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${
              isSyncing
                ? 'bg-neutral-800 text-white border-white/50 animate-pulse'
                : 'bg-white hover:bg-neutral-200 text-black border-white active:scale-95 shadow-[0_0_12px_rgba(255,255,255,0.25)]'
            }`}
            title="Trigger immediate feed scan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'SCANNING...' : 'SCAN NOW'}</span>
          </button>
        </div>

      </div>

      {/* Mobile nav drawer */}
      <div className="md:hidden flex items-center justify-around border-t border-white/10 bg-black px-2 py-1.5 text-xs font-mono">
        <button
          onClick={() => onTabChange('feed')}
          className={`px-2 py-1 ${currentTab === 'feed' ? 'bg-white text-black font-bold' : 'text-white/70'}`}
        >
          FEED
        </button>
        <button
          onClick={() => onTabChange('sources')}
          className={`px-2 py-1 ${currentTab === 'sources' ? 'bg-white text-black font-bold' : 'text-white/70'}`}
        >
          SOURCES
        </button>
        <button
          onClick={() => onTabChange('logs')}
          className={`px-2 py-1 ${currentTab === 'logs' ? 'bg-white text-black font-bold' : 'text-white/70'}`}
        >
          LOGS
        </button>
        <button
          onClick={() => onTabChange('architecture')}
          className={`px-2 py-1 ${currentTab === 'architecture' ? 'bg-white text-black font-bold' : 'text-white/70'}`}
        >
          DOCS
        </button>
      </div>
    </header>
  );
};
