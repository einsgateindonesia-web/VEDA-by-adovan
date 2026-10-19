import React from 'react';
import { SystemStats } from '../types';
import { ShieldCheck, Activity, Database, Clock } from 'lucide-react';

interface TacticalStatsProps {
  stats: SystemStats | null;
  onRefresh: () => void;
}

export const TacticalStats: React.FC<TacticalStatsProps> = ({ stats }) => {
  const formatTime = (iso?: string | null) => {
    if (!iso) return 'INITIALIZING';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 font-mono">
      {/* Metric 1: Ingested Articles */}
      <div className="bg-black border border-white/20 hover:border-white/60 transition-colors p-3.5 flex items-center justify-between relative group">
        <div className="absolute top-1 left-1 text-[8px] text-white/30">+</div>
        <div className="absolute top-1 right-1 text-[8px] text-white/30">+</div>
        <div>
          <div className="text-[10px] text-white/50 uppercase tracking-widest">
            [ INGESTED INTEL ]
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tabular-nums mt-1 tracking-tight">
            {stats ? stats.totalArticles.toLocaleString() : '---'}
          </div>
          <div className="text-[10px] text-white/40 mt-0.5">
            DEDUPLICATED DISPATCHES
          </div>
        </div>
        <div className="w-9 h-9 border border-white/30 flex items-center justify-center text-white shrink-0 group-hover:bg-white group-hover:text-black transition-colors">
          <Database className="w-4 h-4" />
        </div>
      </div>

      {/* Metric 2: Active Feeds */}
      <div className="bg-black border border-white/20 hover:border-white/60 transition-colors p-3.5 flex items-center justify-between relative group">
        <div className="absolute top-1 left-1 text-[8px] text-white/30">+</div>
        <div className="absolute top-1 right-1 text-[8px] text-white/30">+</div>
        <div>
          <div className="text-[10px] text-white/50 uppercase tracking-widest">
            [ MONITORED NODES ]
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tabular-nums mt-1 tracking-tight">
            {stats ? `${stats.activeSources} / ${stats.totalSources}` : '---'}
          </div>
          <div className="text-[10px] text-white/40 mt-0.5">
            SECTORS: GLOBAL RSS
          </div>
        </div>
        <div className="w-9 h-9 border border-white/30 flex items-center justify-center text-white shrink-0 group-hover:bg-white group-hover:text-black transition-colors">
          <Activity className="w-4 h-4" />
        </div>
      </div>

      {/* Metric 3: Integrity */}
      <div className="bg-black border border-white/20 hover:border-white/60 transition-colors p-3.5 flex items-center justify-between relative group">
        <div className="absolute top-1 left-1 text-[8px] text-white/30">+</div>
        <div className="absolute top-1 right-1 text-[8px] text-white/30">+</div>
        <div>
          <div className="text-[10px] text-white/50 uppercase tracking-widest">
            [ UPLINK INTEGRITY ]
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tabular-nums mt-1 tracking-tight">
            {stats ? `${stats.healthRate}%` : '---'}
          </div>
          <div className="text-[10px] text-white/40 mt-0.5">
            {stats && stats.onlineSources ? `${stats.onlineSources} NODES ONLINE` : 'NOMINAL STATUS'}
          </div>
        </div>
        <div className="w-9 h-9 border border-white/30 flex items-center justify-center text-white shrink-0 group-hover:bg-white group-hover:text-black transition-colors">
          <ShieldCheck className="w-4 h-4" />
        </div>
      </div>

      {/* Metric 4: Last Sync */}
      <div className="bg-black border border-white/20 hover:border-white/60 transition-colors p-3.5 flex items-center justify-between relative group">
        <div className="absolute top-1 left-1 text-[8px] text-white/30">+</div>
        <div className="absolute top-1 right-1 text-[8px] text-white/30">+</div>
        <div>
          <div className="text-[10px] text-white/50 uppercase tracking-widest">
            [ LAST SCAN CYCLE ]
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tabular-nums mt-1 tracking-tight">
            {formatTime(stats?.lastSyncAt)}
          </div>
          <div className="text-[10px] text-white/40 mt-0.5">
            {stats?.isSyncing ? 'SCANNING ACTIVE...' : '30-MIN INTERVAL'}
          </div>
        </div>
        <div className="w-9 h-9 border border-white/30 flex items-center justify-center text-white shrink-0 group-hover:bg-white group-hover:text-black transition-colors">
          <Clock className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
