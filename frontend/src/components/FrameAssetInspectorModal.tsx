'use client';

import React, { useState } from 'react';
import { RenderLog } from '@/types';
import { 
  X, 
  Eye, 
  Sparkles, 
  Database, 
  Cpu, 
  ShieldAlert, 
  Layers, 
  Maximize2,
  CheckCircle2,
  Zap,
  Activity
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface FrameAssetInspectorModalProps {
  log: RenderLog | null;
  onClose: () => void;
}

export const FrameAssetInspectorModal: React.FC<FrameAssetInspectorModalProps> = ({ log, onClose }) => {
  const [activeSubTab, setActiveSubTab] = useState<'vision' | 'json' | 'gpu'>('vision');
  const [isReRendering, setIsReRendering] = useState(false);
  const [reRenderNotice, setReRenderNotice] = useState<string | null>(null);

  if (!log) return null;

  const frameId = log.frame_id || 'FR-0000';
  const sceneName = log.scene_name || 'Ep3_Sc04_DragonFlight';
  const isHighLatency = (log.render_time_ms || 0) > 25000 || log.status === 'HIGH_LATENCY';
  const vramGb = log.vram_allocated_gb || 72.4;

  const handleReRender = () => {
    setIsReRendering(true);
    setTimeout(() => {
      setIsReRendering(false);
      setReRenderNotice(`RE-RENDER DISPATCHED: Adaptive tile denoiser applied to ${frameId}`);
      setTimeout(() => setReRenderNotice(null), 4000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans">
      <div className="bg-[#121418] border border-[#242830] rounded-none max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 bg-[#0B0C0E] border-b border-[#242830] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-none flex items-center justify-center text-black font-black font-mono">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white font-mono">
                  ASSET INSPECTOR // {frameId}
                </h3>
                <StatusBadge status={log.status} />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {sceneName} • {log.episode || 'EPISODE 3'} • {log.worker_node || 'node-gpu-a100-04'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-[#16181D] hover:bg-[#1A1D24] text-slate-400 hover:text-white border border-[#242830] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split Frame Visualizer & Multimodal Tabs */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Visual Frame Renderer Mockup (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative aspect-video bg-[#050608] border border-[#242830] overflow-hidden flex flex-col justify-between p-3">
              
              {/* Scene Visual Backdrop Simulation (VFX Frame Representation) */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/30 via-slate-900/50 to-black" />
              
              {/* Wireframe grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#242830_1px,transparent_1px),linear-gradient(to_bottom,#242830_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

              {/* Anomaly Bounding Box if High Latency */}
              {isHighLatency && (
                <div className="absolute inset-x-8 inset-y-6 border border-dashed border-red-500 bg-red-950/20 flex flex-col justify-between p-1.5 z-10">
                  <span className="text-[10px] font-mono font-bold text-red-400 bg-black/80 px-1 py-0.2 self-start border border-red-800">
                    [ ANOMALY: VRAM SATURATION REGION ]
                  </span>
                  <span className="text-[9px] font-mono text-red-300 bg-black/80 px-1 self-end">
                    RAY DEPTH: 14 BOUNCES
                  </span>
                </div>
              )}

              {/* Top Frame Overlay Info */}
              <div className="relative z-20 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="bg-black/80 px-2 py-0.5 border border-[#242830] text-slate-200">
                  RES: 3840 x 2160 (4K UHD)
                </span>
                <span className="bg-black/80 px-2 py-0.5 border border-[#242830] text-amber-400">
                  {log.render_time_ms ? `${(log.render_time_ms / 1000).toFixed(1)}s` : '24.2s'}
                </span>
              </div>

              {/* Center Scene Title Watermark */}
              <div className="relative z-20 text-center my-auto">
                <p className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
                  {sceneName}
                </p>
                <p className="text-[10px] font-mono text-slate-500">
                  RENDER PASS: VOLUMETRIC PYRO &amp; LIGHTING
                </p>
              </div>

              {/* Bottom Frame Overlay Info */}
              <div className="relative z-20 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-slate-300">GPU: {log.gpu_util_pct || 94}%</span>
                <span className="text-amber-400">VRAM: {vramGb} GB</span>
              </div>
            </div>

            {/* Quick Summary Strip */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0B0C0E] border border-[#242830]">
                <span className="text-slate-500 block text-[10px]">RENDER COST</span>
                <span className="text-sm font-bold text-amber-400">${(log.cost_usd || 0.024).toFixed(4)} USD</span>
              </div>
              <div className="p-2.5 bg-[#0B0C0E] border border-[#242830]">
                <span className="text-slate-500 block text-[10px]">MEMORY PEAK</span>
                <span className="text-sm font-bold text-slate-200">{vramGb} GB / 80GB</span>
              </div>
            </div>

            {/* Re-render Action Button */}
            {reRenderNotice ? (
              <div className="p-2.5 bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-mono text-center font-bold">
                {reRenderNotice}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleReRender}
                disabled={isReRendering}
                className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-sans uppercase tracking-wider rounded-none transition-colors flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isReRendering ? 'DISPATCHING RE-RENDER...' : 'DISPATCH GEMINI VISION RE-RENDER'}</span>
              </button>
            )}
          </div>

          {/* Right Column: Multimodal Diagnostics & JSON Logs (7 Cols) */}
          <div className="lg:col-span-7 space-y-3 flex flex-col justify-between">
            
            {/* Sub-Tabs Switcher */}
            <div className="flex items-center gap-2 border-b border-[#242830] pb-2 text-xs font-sans">
              <button
                type="button"
                onClick={() => setActiveSubTab('vision')}
                className={`px-3 py-1.5 font-bold transition-colors min-h-[38px] flex items-center gap-1.5 ${
                  activeSubTab === 'vision'
                    ? 'bg-amber-500 text-black'
                    : 'bg-[#0B0C0E] text-slate-300 hover:text-white border border-[#242830]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gemini Multimodal Analysis</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('json')}
                className={`px-3 py-1.5 font-bold transition-colors min-h-[38px] flex items-center gap-1.5 ${
                  activeSubTab === 'json'
                    ? 'bg-amber-500 text-black'
                    : 'bg-[#0B0C0E] text-slate-300 hover:text-white border border-[#242830]'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Raw ClickHouse Record</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('gpu')}
                className={`px-3 py-1.5 font-bold transition-colors min-h-[38px] flex items-center gap-1.5 ${
                  activeSubTab === 'gpu'
                    ? 'bg-amber-500 text-black'
                    : 'bg-[#0B0C0E] text-slate-300 hover:text-white border border-[#242830]'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>GPU Compute</span>
              </button>
            </div>

            {/* Sub-Tab 1: Gemini Multimodal Vision Analysis */}
            {activeSubTab === 'vision' && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-[#0B0C0E] border border-[#242830] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Visual Anomaly &amp; Shader Diagnostics
                    </span>
                    <span className="font-mono text-xs text-amber-400 font-bold">CONFIDENCE: 98.4%</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-sm">
                    Gemini Vision identified high-density volumetric fog micro-stepping in the central frustum. 
                    Ray bounces peaked at 14 iterations, causing a {((log.render_time_ms || 28000) / 1000).toFixed(1)}s stall 
                    on worker <code className="text-amber-400 font-mono">{log.worker_node || 'node-04'}</code>.
                  </p>
                </div>

                {/* Detected Artifact Breakdown */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Detected Shader &amp; Pipeline Anomalies:
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                    <div className="p-2.5 bg-[#0B0C0E] border border-[#242830] flex items-start gap-2">
                      <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-200 block">VRAM Saturation Spike</strong>
                        <span className="text-slate-400 text-[11px]">{vramGb}GB allocated of 80GB node pool</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-[#0B0C0E] border border-[#242830] flex items-start gap-2">
                      <Activity className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-200 block">Noise Variance &gt; 0.04</strong>
                        <span className="text-slate-400 text-[11px]">Requires adaptive tile clamping</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Multimodal Tags */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    ClickHouse Semantic Asset Tags:
                  </span>
                  <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                    {Array.isArray(log.tags) && log.tags.map((t, idx) => (
                      <span key={`tag-${idx}-${t}`} className="px-2 py-0.5 bg-[#0B0C0E] text-amber-400 border border-amber-500/60">
                        {t}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 bg-[#16181D] text-slate-300 border border-[#242830]">
                      AUTO_TAGGED_GEMINI
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Raw ClickHouse JSON */}
            {activeSubTab === 'json' && (
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400">Columnar Record Schema: `default.render_logs`</span>
                <pre className="p-3 bg-[#0B0C0E] border border-[#242830] font-mono text-xs text-amber-300/90 overflow-x-auto max-h-[300px]">
                  {JSON.stringify(log, null, 2)}
                </pre>
              </div>
            )}

            {/* Sub-Tab 3: GPU Compute Telemetry */}
            {activeSubTab === 'gpu' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 bg-[#0B0C0E] border border-[#242830] space-y-2">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>GPU KERNEL UTILIZATION</span>
                    <span className="text-amber-400 font-bold">{log.gpu_util_pct || 92}%</span>
                  </div>
                  <div className="w-full bg-[#16181D] h-2 border border-[#242830]">
                    <div className="bg-amber-500 h-full" style={{ width: `${log.gpu_util_pct || 92}%` }} />
                  </div>
                </div>

                <div className="p-3.5 bg-[#0B0C0E] border border-[#242830] space-y-2">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>VRAM ALLOCATION HEADROOM</span>
                    <span className="text-amber-400 font-bold">{vramGb} GB / 80 GB</span>
                  </div>
                  <div className="w-full bg-[#16181D] h-2 border border-[#242830]">
                    <div className="bg-red-500 h-full" style={{ width: `${(vramGb / 80) * 100}%` }} />
                  </div>
                </div>

                <div className="p-2.5 bg-[#0B0C0E] border border-[#242830] text-slate-400">
                  <span>HOST WORKER NODE: <strong className="text-white">{log.worker_node || 'worker-01'}</strong></span>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
