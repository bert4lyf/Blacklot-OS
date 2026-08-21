import React from 'react';
import { TelemetryStats } from '@/types';
import { Cpu, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface LatencyDistributionProps {
  stats: TelemetryStats | null;
}

export const LatencyDistribution: React.FC<LatencyDistributionProps> = ({ stats }) => {
  const total = stats?.total_frames || 1;
  const highLatency = stats?.high_latency_frames || 0;
  const failed = stats?.failed_frames || 0;
  const optimal = Math.max(0, total - highLatency - failed);

  const optimalPct = Math.round((optimal / total) * 100);
  const highLatencyPct = Math.round((highLatency / total) * 100);
  const failedPct = Math.round((failed / total) * 100);

  return (
    <div className="p-3.5 sm:p-4 bg-[#121418] border border-[#242830] rounded-none flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#242830]">
          <div>
            <h4 className="text-xs sm:text-sm font-bold font-sans uppercase tracking-wider text-white flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Cluster Health &amp; Latency Spread
            </h4>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-[#0B0C0E] text-slate-300 border border-[#242830] rounded-none">
            {stats?.active_worker_nodes || 12} WORKER NODES
          </span>
        </div>

        {/* Multi-segment Squared Progress Bar */}
        <div className="w-full bg-[#0B0C0E] h-3.5 flex gap-1 overflow-hidden my-3 border border-[#242830] p-0.5 rounded-none">
          <div
            style={{ width: `${optimalPct}%` }}
            className="bg-emerald-500 rounded-none transition-all duration-300"
            title={`Optimal: ${optimal} (${optimalPct}%)`}
          />
          <div
            style={{ width: `${highLatencyPct}%` }}
            className="bg-amber-500 rounded-none transition-all duration-300"
            title={`Bottlenecks: ${highLatency} (${highLatencyPct}%)`}
          />
          <div
            style={{ width: `${failedPct}%` }}
            className="bg-red-500 rounded-none transition-all duration-300"
            title={`Failed: ${failed} (${failedPct}%)`}
          />
        </div>

        {/* Legend Boxes */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="p-2.5 bg-[#0B0C0E] border border-[#242830] rounded-none text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-400 font-bold uppercase mb-0.5 font-sans">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Optimal</span>
            </div>
            <p className="text-lg sm:text-xl font-black font-mono text-white">{optimalPct}%</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{optimal} FRAMES</p>
          </div>

          <div className="p-2.5 bg-[#0B0C0E] border border-[#242830] rounded-none text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-amber-400 font-bold uppercase mb-0.5 font-sans">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Anomaly</span>
            </div>
            <p className="text-lg sm:text-xl font-black font-mono text-white">{highLatencyPct}%</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{highLatency} FRAMES</p>
          </div>

          <div className="p-2.5 bg-[#0B0C0E] border border-[#242830] rounded-none text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-red-400 font-bold uppercase mb-0.5 font-sans">
              <Cpu className="w-3.5 h-3.5" />
              <span>Failed</span>
            </div>
            <p className="text-lg sm:text-xl font-black font-mono text-white">{failedPct}%</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{failed} FRAMES</p>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#242830] flex items-center justify-between text-xs font-sans text-slate-300">
        <span>ClickHouse Column Engine:</span>
        <span className="text-slate-100 font-mono text-xs">
          {stats?.query_metadata?.engine || 'ClickHouse Native'} ({stats?.query_metadata?.latency_ms || 4.2}ms)
        </span>
      </div>
    </div>
  );
};
