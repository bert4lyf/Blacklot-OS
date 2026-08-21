'use client';

import React, { useState } from 'react';
import { Terminal, Send, Play } from 'lucide-react';
import { AgentRunResponse } from '@/types';
import { ExecutionTrace } from './ExecutionTrace';

interface AgentCommandStudioProps {
  onRunAgent: (prompt: string, sceneFilter?: string, episodeFilter?: string) => Promise<void>;
  isRunning: boolean;
  modelName?: string;
  trace: AgentRunResponse | null;
  onRemediationSuccess?: (message: string) => void;
}

const PRESET_DIRECTIVES = [
  {
    title: 'Analyze Ep 3 Latency & Auto-Tag',
    prompt: 'Analyze scene render logs for Ep 3 and auto-tag high-latency frames in ClickHouse',
    badge: 'EP3 • VOLUMETRIC PYRO PASS',
    scene: 'Ep3_Sc04_DragonFlight',
    episode: 'Ep 3',
  },
  {
    title: 'Diagnose DeepSpace VRAM Thrashing',
    prompt: 'Detect GPU VRAM saturation & nebula raytracing bottlenecks in DeepSpaceBattle and recommend node reallocation',
    badge: 'EP3 • 80GB VRAM LIMIT HOTSPOT',
    scene: 'Ep3_Sc12_DeepSpaceBattle',
    episode: 'Ep 3',
  },
  {
    title: 'Optimize ExplosionFX Farm Node Costs',
    prompt: 'Analyze high-latency frames and compute GPU cost optimization for Ep4_Sc07_ExplosionFX scene',
    badge: 'EP4 • GPU CLUSTER BURN',
    scene: 'Ep4_Sc07_ExplosionFX',
    episode: 'Ep 4',
  },
  {
    title: 'Studio-Wide Telemetry Audit & Remediation',
    prompt: 'Perform comprehensive telemetry audit across all episodes, tag anomalous frames, and generate executive remediation plan',
    badge: 'ALL EPISODES • FULL AUDIT',
    scene: 'ALL',
    episode: 'ALL',
  },
];

export const AgentCommandStudio: React.FC<AgentCommandStudioProps> = ({
  onRunAgent,
  isRunning,
  modelName = 'GEMINI-3.6-FLASH',
  trace,
  onRemediationSuccess,
}) => {
  const [prompt, setPrompt] = useState(PRESET_DIRECTIVES[0].prompt);
  const [selectedScene, setSelectedScene] = useState<string>('ALL');
  const [selectedEpisode, setSelectedEpisode] = useState<string>('ALL');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isRunning) return;
    await onRunAgent(prompt, selectedScene, selectedEpisode);
  };

  const handleSelectPreset = (preset: typeof PRESET_DIRECTIVES[0]) => {
    setPrompt(preset.prompt);
    setSelectedScene(preset.scene);
    setSelectedEpisode(preset.episode);
  };

  return (
    <div className="space-y-3.5 sm:space-y-4 font-sans">
      {/* Studio Header Strip */}
      <div className="p-3 sm:p-3.5 bg-[#121418] border border-[#242830] rounded-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-amber-500" />
            Autonomous Directive Dispatch Studio
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Real-time multi-step agent orchestration with ClickHouse SQL generation and automated write-back
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 uppercase font-sans text-[11px]">AGENT CORE:</span>
          <span className="font-bold font-mono text-amber-400 text-xs px-2 py-0.5 bg-[#0B0C0E] border border-[#242830] rounded-none">
            {modelName.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Split-View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT COLUMN: Directive Console (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-3.5 sm:p-4 bg-[#121418] border border-[#242830] rounded-none space-y-3">
            
            <div className="flex items-center justify-between pb-2 border-b border-[#242830]">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Preset Dispatch Directives
              </span>
              <span className="text-[10px] font-mono text-slate-400">4 PRESETS</span>
            </div>

            {/* Quick Action Presets */}
            <div className="space-y-1.5">
              {PRESET_DIRECTIVES.map((preset, pIdx) => {
                const isSelected = prompt === preset.prompt;
                return (
                  <button
                    key={`preset-${pIdx}-${preset.title.replace(/\s+/g, '-')}`}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full p-2.5 text-left border rounded-none transition-colors min-h-[38px] flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-[#1A1D24] border-amber-500 text-white'
                        : 'bg-[#0B0C0E] border-[#242830] hover:border-slate-500 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-white">
                        {preset.title}
                      </span>
                      <Play className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-300">
                      {preset.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Prompt Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-[#242830]">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Directive Instruction:
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isRunning}
                  rows={3}
                  placeholder="Enter autonomous directive for Backlot..."
                  className="w-full p-2.5 bg-[#0B0C0E] border border-[#242830] focus:border-amber-500 text-xs text-white placeholder-slate-500 resize-none rounded-none focus:outline-none disabled:opacity-50 font-mono"
                />
              </div>

              {/* Target Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                    TARGET SCENE:
                  </label>
                  <select
                    value={selectedScene}
                    onChange={(e) => setSelectedScene(e.target.value)}
                    className="w-full p-2 bg-[#0B0C0E] border border-[#242830] text-xs text-slate-200 rounded-none focus:outline-none focus:border-amber-500 min-h-[38px] font-mono"
                  >
                    <option value="ALL">ALL SCENES</option>
                    <option value="Ep3_Sc04_DragonFlight">Ep3_DragonFlight</option>
                    <option value="Ep3_Sc12_DeepSpaceBattle">Ep3_DeepSpaceBattle</option>
                    <option value="Ep4_Sc01_CyberpunkCity">Ep4_CyberpunkCity</option>
                    <option value="Ep4_Sc07_ExplosionFX">Ep4_ExplosionFX</option>
                    <option value="Ep2_Sc02_InteriorDialogue">Ep2_InteriorDialogue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                    TARGET EPISODE:
                  </label>
                  <select
                    value={selectedEpisode}
                    onChange={(e) => setSelectedEpisode(e.target.value)}
                    className="w-full p-2 bg-[#0B0C0E] border border-[#242830] text-xs text-slate-200 rounded-none focus:outline-none focus:border-amber-500 min-h-[38px] font-mono"
                  >
                    <option value="ALL">ALL EPISODES</option>
                    <option value="Ep 3">EPISODE 3</option>
                    <option value="Ep 4">EPISODE 4</option>
                    <option value="Ep 2">EPISODE 2</option>
                  </select>
                </div>
              </div>

              {/* Dispatch Button */}
              <button
                type="submit"
                disabled={isRunning || !prompt.trim()}
                className="w-full py-2.5 px-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-none transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none mt-1 min-h-[40px] cursor-pointer"
              >
                {isRunning ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent animate-spin" />
                    <span>DISPATCHING PIPELINE...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>[ DISPATCH AGENT DIRECTIVE ]</span>
                  </>
                )}
              </button>
            </form>

          </div>
        </div>

        {/* RIGHT COLUMN: Execution Pipeline (7 Cols) */}
        <div className="lg:col-span-7">
          <ExecutionTrace 
            trace={trace} 
            isRunning={isRunning} 
            onRemediationSuccess={onRemediationSuccess}
          />
        </div>

      </div>
    </div>
  );
};
