'use client';

import React, { useState } from 'react';
import { Sliders, DollarSign, Clock, ArrowRight, Server } from 'lucide-react';
import { TelemetryStats } from '@/types';

interface NodeScaleSimulatorProps {
  stats: TelemetryStats | null;
  onApplyConfig?: (nodes: number, gpu: string) => void;
}

const GPU_PROFILES = [
  { id: 'h100', name: 'NVIDIA H100 (80GB)', speedMultiplier: 1.85, hourlyRateUsd: 3.67, vram: '80 GB' },
  { id: 'a100', name: 'NVIDIA A100 (80GB)', speedMultiplier: 1.00, hourlyRateUsd: 2.93, vram: '80 GB' },
  { id: 'l4',   name: 'NVIDIA L4 (24GB)',    speedMultiplier: 0.55, hourlyRateUsd: 1.15, vram: '24 GB' },
];

export const NodeScaleSimulator: React.FC<NodeScaleSimulatorProps> = ({ stats, onApplyConfig }) => {
  const [nodeCount, setNodeCount] = useState<number>(16);
  const [selectedGpuId, setSelectedGpuId] = useState<string>('h100');
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const selectedGpu = GPU_PROFILES.find((g) => g.id === selectedGpuId) || GPU_PROFILES[0];
  
  const totalFrames = stats?.total_frames || 1080;
  const avgFrameSec = (stats?.avg_render_time_sec && stats.avg_render_time_sec > 0) ? stats.avg_render_time_sec : 24.5;
  
  const totalWorkloadSeconds = totalFrames * avgFrameSec;
  const parallelEfficiency = Math.max(0.82, 1 - (nodeCount * 0.003));
  const effectiveSpeed = nodeCount * selectedGpu.speedMultiplier * parallelEfficiency;
  
  const estimatedTotalSeconds = totalWorkloadSeconds / effectiveSpeed;
  const estimatedHours = estimatedTotalSeconds / 3600;
  const estimatedMinutes = Math.round((estimatedTotalSeconds % 3600) / 60);
  
  const totalCostUsd = estimatedHours * nodeCount * selectedGpu.hourlyRateUsd;

  const singleNodeSeconds = totalWorkloadSeconds / 1.0;
  const singleNodeHours = singleNodeSeconds / 3600;

  const speedupFactor = Math.max(1, Math.round(singleNodeSeconds / estimatedTotalSeconds));

  const handleApply = () => {
    setAppliedNotice(`DISPATCHED: Set active render cluster to ${nodeCount}x ${selectedGpu.name}`);
    if (onApplyConfig) {
      onApplyConfig(nodeCount, selectedGpu.id);
    }
    setTimeout(() => setAppliedNotice(null), 4000);
  };

  return (
    <div className="p-3.5 sm:p-4 bg-[#121418] border border-[#242830] rounded-none space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b border-[#242830]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white font-sans flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            Interactive Farm Node Scale &amp; Cost Simulator
          </h3>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Real-time &quot;What-If&quot; capacity planner calculated against {totalFrames} ClickHouse telemetry frames
          </p>
        </div>
        <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-[#0B0C0E] text-amber-400 border border-[#242830] rounded-none uppercase">
          LIVE PREDICTOR
        </span>
      </div>

      {/* Simulator Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        
        {/* Left Column: Sliders & Selectors (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* Node Count Slider */}
          <div className="space-y-1.5 bg-[#0B0C0E] p-3 border border-[#242830]">
            <div className="flex items-center justify-between font-sans">
              <label className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-amber-500" />
                Allocated GPU Worker Nodes:
              </label>
              <span className="text-sm sm:text-base font-black font-mono text-amber-400 bg-[#16181D] px-2.5 py-0.5 border border-[#242830]">
                {nodeCount} NODES
              </span>
            </div>
            
            <input
              type="range"
              min={1}
              max={64}
              value={nodeCount}
              onChange={(e) => setNodeCount(Number(e.target.value))}
              className="w-full accent-amber-500 bg-[#16181D] h-2 rounded-none cursor-pointer"
            />
            
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>1 Node (Min)</span>
              <span className="text-amber-500/80">16 Nodes (Optimal)</span>
              <span>64 Nodes (Max)</span>
            </div>
          </div>

          {/* GPU Hardware Tier Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 font-sans uppercase tracking-wider">
              Select GPU Accelerator Architecture:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {GPU_PROFILES.map((gpu) => {
                const isSelected = gpu.id === selectedGpuId;
                return (
                  <button
                    key={gpu.id}
                    type="button"
                    onClick={() => setSelectedGpuId(gpu.id)}
                    className={`p-2.5 text-left border transition-all rounded-none min-h-[38px] flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#1A1D24] border-amber-500 text-white'
                        : 'bg-[#0B0C0E] border-[#242830] hover:border-slate-500 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold font-sans">{gpu.name}</span>
                        <span className="text-[10px] font-mono font-bold text-amber-400">${gpu.hourlyRateUsd}/hr</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">{gpu.vram} • {gpu.speedMultiplier}x speed</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Dynamic Simulation Readout (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0B0C0E] border border-[#242830] p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#242830] pb-1.5">
            <span className="text-xs font-bold font-sans uppercase tracking-wider text-slate-300">
              PROJECTED DISPATCH IMPACT
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {speedupFactor}x SPEEDUP
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Projected Time */}
            <div className="p-2.5 bg-[#121418] border border-[#242830]">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans mb-0.5">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>Wall-Clock Time</span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-white">
                {estimatedHours < 1 ? `${estimatedMinutes}m` : `${estimatedHours.toFixed(1)}h`}
              </div>
              <span className="text-[10px] font-mono text-emerald-400 mt-0.5 block">
                vs {singleNodeHours.toFixed(1)}h baseline
              </span>
            </div>

            {/* Projected Cost */}
            <div className="p-2.5 bg-[#121418] border border-[#242830]">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans mb-0.5">
                <DollarSign className="w-3 h-3 text-amber-500" />
                <span>Total Cost</span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">
                ${totalCostUsd.toFixed(2)}
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                ${selectedGpu.hourlyRateUsd}/hr/node
              </span>
            </div>
          </div>

          {/* Action Button */}
          {appliedNotice ? (
            <div className="p-2 bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-mono text-center font-bold">
              {appliedNotice}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleApply}
              className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-sans uppercase tracking-wider rounded-none transition-colors flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer"
            >
              <span>APPLY {nodeCount}x {selectedGpu.id.toUpperCase()} CONFIG TO CLUSTER</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
