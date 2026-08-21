'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  TelemetryStats, 
  SceneTelemetry, 
  RenderLog, 
  AgentRunResponse, 
  SystemHealth 
} from '@/types';
import { 
  fetchHealth, 
  fetchTelemetryStats, 
  fetchSceneTelemetry, 
  fetchRenderLogs, 
  runAgentWorkflow 
} from '@/lib/api';

import { Header } from '@/components/Header';
import { TelemetryGrid } from '@/components/TelemetryGrid';
import { AgentCommandStudio } from '@/components/AgentCommandStudio';
import { RenderLogsTable } from '@/components/RenderLogsTable';
import { 
  BarChart3, 
  Terminal, 
  Database, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';

type DashboardTab = 'overview' | 'agent-studio' | 'logs-inspector';

export default function Home() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [stats, setStats] = useState<TelemetryStats | null>(null);
  const [scenes, setScenes] = useState<SceneTelemetry[]>([]);
  const [logs, setLogs] = useState<RenderLog[]>([]);
  
  const [isTelemetryLoading, setIsTelemetryLoading] = useState<boolean>(true);
  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAgentRunning, setIsAgentRunning] = useState<boolean>(false);
  const [agentTrace, setAgentTrace] = useState<AgentRunResponse | null>(null);
  
  const [selectedSceneFilter, setSelectedSceneFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Load telemetry stats & health
  const loadTelemetry = useCallback(async () => {
    try {
      setIsTelemetryLoading(true);
      const [healthData, statsData, sceneData] = await Promise.all([
        fetchHealth().catch(() => null),
        fetchTelemetryStats().catch(() => null),
        fetchSceneTelemetry().catch(() => ({ scenes: [], query_metadata: {} })),
      ]);

      if (healthData) setHealth(healthData);
      if (statsData) setStats(statsData);
      if (sceneData?.scenes) setScenes(sceneData.scenes);
    } catch (err) {
      console.error('Failed to load telemetry', err);
    } finally {
      setIsTelemetryLoading(false);
    }
  }, []);

  // Load logs
  const loadLogs = useCallback(async () => {
    try {
      setIsLogsLoading(true);
      const logsData = await fetchRenderLogs({
        limit: 150,
        scene: selectedSceneFilter,
        status: selectedStatusFilter,
      });
      if (logsData?.logs) setLogs(logsData.logs);
    } catch (err) {
      console.error('Failed to load logs', err);
    } finally {
      setIsLogsLoading(false);
    }
  }, [selectedSceneFilter, selectedStatusFilter]);

  // Refresh all
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([loadTelemetry(), loadLogs()]);
    setIsRefreshing(false);
  };

  // Initial load
  useEffect(() => {
    loadTelemetry();
    loadLogs();
  }, [loadTelemetry, loadLogs]);

  // Handle agent run
  const handleRunAgent = async (prompt: string, sceneFilter?: string, episodeFilter?: string) => {
    try {
      setIsAgentRunning(true);
      setErrorNotice(null);
      setSuccessNotice(null);

      const response = await runAgentWorkflow(prompt, sceneFilter, episodeFilter);
      setAgentTrace(response);
      
      const mutatedCount = response?.affected_frames?.length || response?.summary?.frames_tagged || 0;
      setSuccessNotice(`DIRECTIVE EXECUTED: ${mutatedCount} ClickHouse render records mutated and tagged.`);
      setTimeout(() => setSuccessNotice(null), 5000);

      // Re-fetch telemetry & logs to reflect ClickHouse writeback mutations!
      await Promise.all([loadTelemetry(), loadLogs()]);
    } catch (err: any) {
      console.error('Agent workflow error:', err);
      setErrorNotice(err?.message || 'Agent directive dispatch failed');
    } finally {
      setIsAgentRunning(false);
    }
  };

  // Handle automated remediation success
  const handleRemediationSuccess = (message: string) => {
    setSuccessNotice(message);
    setTimeout(() => setSuccessNotice(null), 6000);
    // Refresh telemetry to reflect cleared bottlenecks
    handleRefreshAll();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090A0C] text-slate-100 selection:bg-amber-500 selection:text-black font-sans">
      {/* Industrial Header & System Status */}
      <Header 
        health={health} 
        onRefreshData={handleRefreshAll}
        isRefreshing={isRefreshing}
      />

      {/* Main Studio View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4">
        
        {/* System Alert Toasts */}
        {errorNotice && (
          <div className="p-3 bg-red-950/90 border border-red-800 text-red-200 flex items-center justify-between gap-3 text-xs sm:text-sm font-sans rounded-none">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="font-semibold">{errorNotice}</span>
            </div>
            <button
              onClick={() => setErrorNotice(null)}
              className="text-slate-300 hover:text-white font-bold uppercase text-[10px] font-mono px-2 py-0.5 bg-red-900/60 border border-red-700 cursor-pointer"
            >
              [ DISMISS ]
            </button>
          </div>
        )}

        {successNotice && (
          <div className="p-3 bg-emerald-950/90 border border-emerald-700 text-emerald-200 flex items-center justify-between gap-3 text-xs sm:text-sm font-sans rounded-none">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="font-semibold">{successNotice}</span>
            </div>
            <button
              onClick={() => setSuccessNotice(null)}
              className="text-slate-300 hover:text-white font-bold uppercase text-[10px] font-mono px-2 py-0.5 bg-emerald-900/60 border border-emerald-700 cursor-pointer"
            >
              [ DISMISS ]
            </button>
          </div>
        )}

        {/* Technical Sharp Tab Switcher with Mobile Responsive Scroll */}
        <div className="flex items-center gap-2 border-b border-[#242830] overflow-x-auto pb-px scrollbar-none">
          
          {/* TAB 1: System Overview */}
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-sans font-bold tracking-wider transition-colors whitespace-nowrap rounded-none border border-b-0 min-h-[38px] cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#242830] border-t-2 border-t-amber-500 bg-[#1A1D24] text-amber-400'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-[#121418]'
            }`}
          >
            <BarChart3 className={`w-3.5 h-3.5 ${activeTab === 'overview' ? 'text-amber-500' : 'text-slate-400'}`} />
            <span>[ 01 // SYSTEM OVERVIEW ]</span>
          </button>

          {/* TAB 2: Agent Dispatch Studio */}
          <button
            type="button"
            onClick={() => setActiveTab('agent-studio')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-sans font-bold tracking-wider transition-colors whitespace-nowrap rounded-none border border-b-0 min-h-[38px] cursor-pointer relative ${
              activeTab === 'agent-studio'
                ? 'border-[#242830] border-t-2 border-t-amber-500 bg-[#1A1D24] text-amber-400'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-[#121418]'
            }`}
          >
            <Terminal className={`w-3.5 h-3.5 ${activeTab === 'agent-studio' ? 'text-amber-500' : 'text-slate-400'}`} />
            <span>[ 02 // AGENT DISPATCH STUDIO ]</span>
            {agentTrace && (
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-none ml-1 animate-pulse" />
            )}
          </button>

          {/* TAB 3: Live Log Inspector */}
          <button
            type="button"
            onClick={() => setActiveTab('logs-inspector')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-sans font-bold tracking-wider transition-colors whitespace-nowrap rounded-none border border-b-0 min-h-[38px] cursor-pointer ${
              activeTab === 'logs-inspector'
                ? 'border-[#242830] border-t-2 border-t-amber-500 bg-[#1A1D24] text-amber-400'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-[#121418]'
            }`}
          >
            <Database className={`w-3.5 h-3.5 ${activeTab === 'logs-inspector' ? 'text-amber-500' : 'text-slate-400'}`} />
            <span>[ 03 // LIVE LOG INSPECTOR ]</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#0B0C0E] text-slate-300 border border-[#242830] ml-1">
              {logs.length}
            </span>
          </button>

        </div>

        {/* Tab View Display */}
        <div className="pt-1">
          
          {/* TAB 1: System Overview */}
          {activeTab === 'overview' && (
            <TelemetryGrid
              stats={stats}
              scenes={scenes}
              isLoading={isTelemetryLoading}
              onNavigateToAgentStudio={() => setActiveTab('agent-studio')}
            />
          )}

          {/* TAB 2: Agent Dispatch Studio */}
          {activeTab === 'agent-studio' && (
            <AgentCommandStudio
              onRunAgent={handleRunAgent}
              isRunning={isAgentRunning}
              modelName={health?.gemini?.model || 'GEMINI-3.6-FLASH'}
              trace={agentTrace}
              onRemediationSuccess={handleRemediationSuccess}
            />
          )}

          {/* TAB 3: Live Log Inspector */}
          {activeTab === 'logs-inspector' && (
            <RenderLogsTable
              logs={logs}
              isLoading={isLogsLoading}
              onRefresh={loadLogs}
              selectedScene={selectedSceneFilter}
              onSelectScene={setSelectedSceneFilter}
              selectedStatus={selectedStatusFilter}
              onSelectStatus={setSelectedStatusFilter}
            />
          )}

        </div>

      </main>

      {/* Industrial Footer */}
      <footer className="border-t border-[#242830] bg-[#090A0C] mt-auto py-3 text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-white tracking-widest">BACKLOT OS</span>
            <span>•</span>
            <span className="font-sans text-slate-300">Enterprise Studio Render Infrastructure</span>
          </div>
          <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
            <span>CLICKHOUSE CLOUD NATIVE</span>
            <span>•</span>
            <span>GOOGLE GEMINI MULTIMODAL</span>
            <span>•</span>
            <span>FASTAPI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
