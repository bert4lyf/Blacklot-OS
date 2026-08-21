import React from 'react';
import { SceneTelemetry } from '@/types';
import { Film, DollarSign, Clock } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface SceneCostChartProps {
  scenes?: SceneTelemetry[];
}

export const SceneCostChart: React.FC<SceneCostChartProps> = ({ scenes = [] }) => {
  const safeScenes = Array.isArray(scenes) ? scenes : [];
  const maxCost = Math.max(...safeScenes.map((s) => s?.total_cost_usd || 0), 10);

  return (
    <div className="p-3.5 sm:p-4 bg-[#121418] border border-[#242830] rounded-none flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#242830]">
        <div>
          <h4 className="text-xs sm:text-sm font-bold font-sans uppercase tracking-wider text-white flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-amber-500" />
            Sequence Cost &amp; Latency Telemetry
          </h4>
        </div>
        <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-[#0B0C0E] text-slate-300 border border-[#242830] rounded-none">
          {safeScenes.length} SEQUENCES
        </span>
      </div>

      <div className="space-y-2.5">
        {safeScenes.length === 0 ? (
          <div className="text-center py-6 text-slate-400 font-sans text-xs">
            No active telemetry. Click [ Seed Test Data ] to initialize.
          </div>
        ) : (
          safeScenes.map((scene, index) => {
            const cost = scene?.total_cost_usd || 0;
            const costPct = Math.min(100, Math.round((cost / maxCost) * 100));
            const sceneName = scene?.scene_name || `Scene-${index}`;
            const avgSec = scene?.avg_render_time_sec ?? 0;
            const totalFrames = scene?.total_frames ?? 0;
            const highLatencyCount = scene?.high_latency_count ?? 0;
            const isAnomaly = highLatencyCount > 10;

            return (
              <div 
                key={`scene-${sceneName}-${index}`} 
                className="p-2.5 bg-[#0B0C0E] border border-[#242830] rounded-none hover:border-slate-500 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5 font-sans">
                  <div className="flex items-center gap-2 font-bold text-slate-100">
                    <Film className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span className="font-mono text-xs">{sceneName}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-300 flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {avgSec}s avg
                    </span>
                    <span className="font-bold text-amber-400 font-mono text-xs">
                      ${cost.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Industrial Squared Bar */}
                <div className="w-full bg-[#16181D] h-2 rounded-none overflow-hidden flex border border-[#242830]">
                  <div
                    className={`h-full rounded-none transition-all duration-300 ${
                      isAnomaly ? 'bg-amber-500' : 'bg-slate-400'
                    }`}
                    style={{ width: `${costPct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-sans text-slate-400 mt-1.5">
                  <span className="font-mono">{totalFrames} FRAMES ({highLatencyCount} HIGH-LATENCY)</span>
                  <StatusBadge status={scene?.status} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
