import React from 'react';
import { FetchLog } from '../types';
import { Terminal, Clock } from 'lucide-react';

interface ExecutionLogsProps {
  logs: FetchLog[];
  onRefresh: () => void;
}

export const ExecutionLogs: React.FC<ExecutionLogsProps> = ({ logs }) => {
  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="bg-black border border-white/20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-white flex items-center justify-center text-white bg-black">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-widest">[ VEDA // SWEEP TELEMETRY LOGS ]</h3>
            <p className="text-[11px] text-white/50">Historical feed intake cycles, article ingestion count, and node diagnostics.</p>
          </div>
        </div>

        <div className="text-[11px] text-white/70">
          LOG ENTRIES: <span className="text-white font-bold">{logs.length}</span>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-2.5">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-white/40 bg-black border border-white/20">
            NO TELEMETRY LOGS RECORDED. TRIGGER "SCAN NOW" TO COMMENCE FIRST SWEEP CYCLE.
          </div>
        ) : (
          logs.map((log) => {
            const date = new Date(log.timestamp);
            const isSuccess = log.status === 'SUCCESS';

            return (
              <div
                key={log.id}
                className="bg-black border border-white/20 hover:border-white transition-colors p-3.5 relative"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold tracking-wider px-1.5 py-0.5 text-[10px] ${
                        isSuccess ? 'bg-white text-black' : 'border border-white text-white'
                      }`}
                    >
                      [ {log.status} ]
                    </span>
                    <span className="text-white/30">/</span>
                    <span className="text-white/60 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-white/40" />
                      {date.toLocaleDateString()} {date.toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-white/60">
                    <span>
                      DURATION: <span className="text-white font-bold">{((log.durationMs || 0) / 1000).toFixed(1)}S</span>
                    </span>
                    <span>/</span>
                    <span>
                      NEW: <span className="text-white font-bold">+{log.newArticles} ITEMS</span>
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-white/40">NODES POLLED: </span>
                    <span className="text-white font-bold">{log.totalSources}</span>
                  </div>
                  <div>
                    <span className="text-white/40">NOMINAL: </span>
                    <span className="text-white font-bold">{log.successfulSources}</span>
                  </div>
                  <div>
                    <span className="text-white/40">DEGRADED: </span>
                    <span className="text-white/70 font-bold">{log.failedSources}</span>
                  </div>
                  <div>
                    <span className="text-white/40">RATIO: </span>
                    <span className="text-white font-bold">
                      {log.totalSources > 0 ? Math.round((log.successfulSources / log.totalSources) * 100) : 0}%
                    </span>
                  </div>
                </div>

                {log.details && (
                  <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-white/50 bg-neutral-950 p-2 truncate">
                    <span className="text-white/30">[ DIAGNOSTIC ]: </span>
                    {log.details}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
