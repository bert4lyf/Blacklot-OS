'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Database, 
  Cpu, 
  Bot, 
  ChevronDown, 
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Play,
  CheckCircle
} from 'lucide-react';
import { AgentRunResponse } from '@/types';
import { executeRemediation } from '@/lib/api';

interface ExecutionTraceProps {
  trace: AgentRunResponse | null;
  isRunning: boolean;
  onRemediationSuccess?: (message: string) => void;
}

export const ExecutionTrace: React.FC<ExecutionTraceProps> = ({ 
  trace, 
  isRunning,
  onRemediationSuccess 
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({ 0: true, 1: true, 2: true });
  const [remediatingKey, setRemediatingKey] = useState<string | null>(null);
  const [remediatedDirectives, setRemediatedDirectives] = useState<Record<string, boolean>>({});

  const toggleStep = (idx: number) => {
    setExpandedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleExecuteRemediation = async (rec: any, idx: number) => {
    const key = `rec-${idx}-${rec.title}`;
    try {
      setRemediatingKey(key);
      const res = await executeRemediation({
        title: rec.title || 'Remediate Cluster Bottlenecks',
        action: rec.action || 'Re-allocate worker nodes',
        scene_name: rec.target_scene || 'Ep3_Sc04_DragonFlight',
        severity: rec.severity || 'HIGH',
      });

      setRemediatedDirectives((prev) => ({ ...prev, [key]: true }));
      if (onRemediationSuccess) {
        onRemediationSuccess(res.message || `Dispatched remediation for ${rec.title}`);
      }
    } catch (err: any) {
      console.error('Failed to execute remediation:', err);
    } finally {
      setRemediatingKey(null);
    }
  };

  if (isRunning) {
    return (
      <div className="p-5 sm:p-6 bg-[#121418] border border-[#242830] rounded-none flex flex-col items-center justify-center min-h-[380px] space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-amber-500/20 rounded-none" />
          <div className="absolute inset-0 border-2 border-amber-500 border-t-transparent animate-spin rounded-none" />
          <Bot className="w-6 h-6 text-amber-500 absolute inset-0 m-auto" />
        </div>
        <div className="text-center font-sans space-y-1">
          <p className="text-xs sm:text-sm font-black font-mono tracking-widest text-white uppercase">
            ORCHESTRATING MULTI-STEP AGENT PIPELINE
          </p>
          <p className="text-xs text-slate-300">
            Querying ClickHouse columnar store • Synthesizing Gemini diagnostics • Generating write-back tags
          </p>
        </div>
      </div>
    );
  }

  if (!trace) {
    return (
      <div className="p-5 sm:p-6 bg-[#121418] border border-[#242830] rounded-none flex flex-col items-center justify-center min-h-[380px] text-center font-sans space-y-3">
        <Bot className="w-10 h-10 text-slate-500" />
        <div>
          <h4 className="text-xs sm:text-sm font-bold font-mono text-slate-200 uppercase tracking-wider">
            STANDBY FOR AGENT DISPATCH
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Select a preset directive on the left or enter a custom studio command to inspect live ClickHouse execution traces and automated write-back mutations.
          </p>
        </div>
      </div>
    );
  }

  const steps = Array.isArray(trace?.execution_trace) 
    ? trace.execution_trace 
    : Array.isArray(trace?.steps) 
    ? trace.steps 
    : [];
  const recommendations = Array.isArray(trace?.recommendations) ? trace.recommendations : [];
  const affectedFrames = Array.isArray(trace?.affected_frames) ? trace.affected_frames : [];

  return (
    <div className="space-y-3.5 font-sans">
      {/* Top Execution Summary Bar */}
      <div className="p-3.5 bg-[#121418] border border-[#242830] rounded-none space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-[#242830]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-black font-mono text-xs sm:text-sm text-white uppercase tracking-wider">
              PIPELINE EXECUTED (200 OK)
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {trace?.execution_time_sec || '0.85'}s WALL-CLOCK
            </span>
            <span>•</span>
            <span className="text-amber-400 font-bold">{trace?.model_used || 'GEMINI-3.6-FLASH'}</span>
          </div>
        </div>

        {/* 3 Metrics KPI Strip */}
        <div className="grid grid-cols-3 gap-2 text-center font-sans">
          <div className="p-2 bg-[#0B0C0E] border border-[#242830]">
            <span className="text-[10px] uppercase text-slate-400 block font-semibold">Frames Analyzed</span>
            <span className="text-lg sm:text-xl font-black font-mono text-white">
              {trace?.summary?.frames_analyzed || trace?.summary?.total_frames_analyzed || affectedFrames.length || 0}
            </span>
          </div>
          <div className="p-2 bg-[#0B0C0E] border border-[#242830]">
            <span className="text-[10px] uppercase text-slate-400 block font-semibold">Bottlenecks Identified</span>
            <span className="text-lg sm:text-xl font-black font-mono text-amber-400">
              {trace?.summary?.bottlenecks_identified || trace?.summary?.bottlenecks_detected || affectedFrames.length || 0}
            </span>
          </div>
          <div className="p-2 bg-[#0B0C0E] border border-[#242830]">
            <span className="text-[10px] uppercase text-slate-400 block font-semibold">ClickHouse Mutated</span>
            <span className="text-lg sm:text-xl font-black font-mono text-emerald-400">
              {trace?.summary?.frames_tagged || affectedFrames.length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Accordion Steps */}
      <div className="space-y-2">
        {steps.map((step, idx) => {
          const isExpanded = expandedSteps[idx] ?? true;
          const stepNum = String(idx + 1).padStart(2, '0');
          const stepName = step.step_name || step.title || `Phase ${stepNum}`;

          return (
            <div
              key={`step-${idx}-${stepName}`}
              className="bg-[#121418] border border-[#242830] rounded-none overflow-hidden"
            >
              {/* Step Header Accordion */}
              <button
                type="button"
                onClick={() => toggleStep(idx)}
                className="w-full p-2.5 sm:p-3 flex items-center justify-between text-left hover:bg-[#16181D] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-500 bg-[#0B0C0E] px-1.5 py-0.5 border border-[#242830]">
                    STEP {stepNum}
                  </span>
                  <span className="text-xs sm:text-sm font-bold font-sans text-white">
                    {stepName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {step.tool && (
                    <span className="text-[10px] font-mono text-slate-400 bg-[#0B0C0E] px-1.5 py-0.5 border border-[#242830] hidden sm:inline">
                      {step.tool}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Step Content */}
              {isExpanded && (
                <div className="p-3 bg-[#0B0C0E] border-t border-[#242830] space-y-2.5 text-xs font-mono">
                  {/* Reasoning */}
                  {step.reasoning && (
                    <div className="space-y-1">
                      <span className="text-slate-400 uppercase font-sans text-[10px] font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Agent Reasoning &amp; Strategy:
                      </span>
                      <p className="text-slate-200 font-sans leading-relaxed text-xs pl-2 border-l-2 border-amber-500/80">
                        {step.reasoning}
                      </p>
                    </div>
                  )}

                  {/* Generated SQL or Tool Query */}
                  {step.query && (
                    <div className="space-y-1">
                      <span className="text-slate-400 uppercase font-sans text-[10px] font-semibold flex items-center gap-1">
                        <Database className="w-3 h-3 text-amber-500" />
                        Executed ClickHouse SQL:
                      </span>
                      <pre className="p-2.5 bg-[#121418] border border-[#242830] text-amber-400 overflow-x-auto whitespace-pre text-xs rounded-none">
                        {step.query}
                      </pre>
                    </div>
                  )}

                  {/* Result Findings */}
                  {step.findings && (
                    <div className="space-y-1">
                      <span className="text-slate-400 uppercase font-sans text-[10px] font-semibold flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-emerald-400" />
                        Execution Telemetry &amp; Findings:
                      </span>
                      <p className="text-slate-300 font-sans text-xs bg-[#121418] p-2 border border-[#242830]">
                        {step.findings}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Feature A: Recommendations & One-Click Automated Remediation */}
      {recommendations.length > 0 && (
        <div className="p-3.5 bg-[#121418] border border-[#242830] rounded-none space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#242830]">
            <h4 className="text-xs sm:text-sm font-bold font-sans uppercase tracking-wider text-white flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Recommended Production Directives
            </h4>
            <span className="text-[10px] font-mono font-bold text-amber-400 bg-[#0B0C0E] px-2 py-0.5 border border-[#242830]">
              FEATURE A: ONE-CLICK DISPATCH
            </span>
          </div>

          <div className="space-y-2">
            {recommendations.map((rec, rIdx) => {
              const recKey = `rec-${rIdx}-${rec.title}`;
              const isRemediated = remediatedDirectives[recKey];
              const isCurrentRemediating = remediatingKey === recKey;

              return (
                <div
                  key={recKey}
                  className={`p-3 border rounded-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isRemediated
                      ? 'bg-[#0B1510] border-emerald-700/80'
                      : 'bg-[#0B0C0E] border-[#242830]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border uppercase ${
                        rec.severity === 'CRITICAL'
                          ? 'bg-red-950/80 text-red-400 border-red-800'
                          : 'bg-amber-950/80 text-amber-400 border-amber-800'
                      }`}>
                        {rec.severity || 'HIGH'}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-white font-sans">
                        {rec.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-sans">
                      {rec.action}
                    </p>
                  </div>

                  {/* Feature A Action Button */}
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    {isRemediated ? (
                      <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 border border-emerald-700 rounded-none font-bold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>REMEDIATED &amp; CLEARED</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleExecuteRemediation(rec, rIdx)}
                        disabled={isCurrentRemediating}
                        className="w-full sm:w-auto px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-sans uppercase tracking-wider rounded-none transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 min-h-[38px] cursor-pointer"
                      >
                        {isCurrentRemediating ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent animate-spin" />
                            <span>DISPATCHING...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>[ EXECUTE REMEDIATION ]</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
