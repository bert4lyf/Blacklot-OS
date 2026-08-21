'use client';

import React, { useState, useMemo } from 'react';
import { RenderLog } from '@/types';
import { 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Eye
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { FrameAssetInspectorModal } from './FrameAssetInspectorModal';

interface RenderLogsTableProps {
  logs: RenderLog[];
  isLoading: boolean;
  onRefresh: () => void;
  selectedScene: string;
  onSelectScene: (scene: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}

export const RenderLogsTable: React.FC<RenderLogsTableProps> = ({
  logs = [],
  isLoading,
  onRefresh,
  selectedScene,
  onSelectScene,
  selectedStatus,
  onSelectStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEpisode, setSelectedEpisode] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [inspectingLog, setInspectingLog] = useState<RenderLog | null>(null);

  const safeLogs = Array.isArray(logs) ? logs : [];

  // Filter logs
  const filteredLogs = useMemo(() => {
    return safeLogs.filter((log) => {
      if (!log) return false;
      
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const frameId = (log.frame_id || '').toLowerCase();
        const workerNode = (log.worker_node || '').toLowerCase();
        const sceneName = (log.scene_name || '').toLowerCase();
        const errorType = (log.error_type || '').toLowerCase();
        if (!frameId.includes(s) && !workerNode.includes(s) && !sceneName.includes(s) && !errorType.includes(s)) {
          return false;
        }
      }

      if (selectedEpisode !== 'ALL') {
        if (log.episode !== selectedEpisode) return false;
      }

      return true;
    });
  }, [safeLogs, searchTerm, selectedEpisode]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Control Bar: Search & Filters */}
      <div className="p-3 bg-[#121418] border border-[#242830] rounded-none flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Search Field */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="SEARCH FRAME ID, SCENE, NODE..."
            className="w-full pl-8 pr-2.5 py-1.5 bg-[#0B0C0E] border border-[#242830] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 rounded-none uppercase font-mono min-h-[36px]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Scene Filter */}
          <div className="flex items-center gap-1.5 bg-[#0B0C0E] px-2.5 py-1.5 border border-[#242830] rounded-none min-h-[36px]">
            <span className="text-slate-400 text-[10px] font-semibold">SCENE:</span>
            <select
              value={selectedScene}
              onChange={(e) => { onSelectScene(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-slate-200 focus:outline-none text-xs font-mono cursor-pointer"
            >
              <option value="ALL" className="bg-[#121418]">ALL SCENES</option>
              <option value="Ep3_Sc04_DragonFlight" className="bg-[#121418]">DragonFlight</option>
              <option value="Ep3_Sc12_DeepSpaceBattle" className="bg-[#121418]">DeepSpaceBattle</option>
              <option value="Ep4_Sc01_CyberpunkCity" className="bg-[#121418]">CyberpunkCity</option>
              <option value="Ep4_Sc07_ExplosionFX" className="bg-[#121418]">ExplosionFX</option>
              <option value="Ep2_Sc02_InteriorDialogue" className="bg-[#121418]">InteriorDialogue</option>
            </select>
          </div>

          {/* Episode Filter */}
          <div className="flex items-center gap-1.5 bg-[#0B0C0E] px-2.5 py-1.5 border border-[#242830] rounded-none min-h-[36px]">
            <span className="text-slate-400 text-[10px] font-semibold">EPISODE:</span>
            <select
              value={selectedEpisode}
              onChange={(e) => { setSelectedEpisode(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-slate-200 focus:outline-none text-xs font-mono cursor-pointer"
            >
              <option value="ALL" className="bg-[#121418]">ALL EPISODES</option>
              <option value="Ep 3" className="bg-[#121418]">EPISODE 3</option>
              <option value="Ep 4" className="bg-[#121418]">EPISODE 4</option>
              <option value="Ep 2" className="bg-[#121418]">EPISODE 2</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#0B0C0E] px-2.5 py-1.5 border border-[#242830] rounded-none min-h-[36px]">
            <span className="text-slate-400 text-[10px] font-semibold">STATUS:</span>
            <select
              value={selectedStatus}
              onChange={(e) => { onSelectStatus(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-slate-200 focus:outline-none text-xs font-mono cursor-pointer"
            >
              <option value="ALL" className="bg-[#121418]">ALL STATUSES</option>
              <option value="COMPLETED" className="bg-[#121418]">COMPLETED (OPTIMAL)</option>
              <option value="HIGH_LATENCY" className="bg-[#121418]">HIGH LATENCY</option>
              <option value="FAILED" className="bg-[#121418]">FAILED</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 bg-[#0B0C0E] hover:bg-[#1A1D24] border border-[#242830] text-slate-300 rounded-none transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
            title="Refresh logs from ClickHouse"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>

      </div>

      {/* Full-width Touch Scroll Data Table with Sticky Left Column */}
      <div className="border border-[#242830] bg-[#121418] rounded-none overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0C0E] text-slate-300 uppercase text-[11px] font-semibold border-b border-[#242830]">
              <tr>
                <th className="px-3.5 py-2.5 sticky left-0 bg-[#0B0C0E] z-10 font-mono shadow-[2px_0_5px_rgba(0,0,0,0.5)]">
                  FRAME ID
                </th>
                <th className="px-3.5 py-2.5 font-sans">SCENE / EP</th>
                <th className="px-3.5 py-2.5 font-sans">RENDER LATENCY</th>
                <th className="px-3.5 py-2.5 font-sans">COST (USD)</th>
                <th className="px-3.5 py-2.5 font-sans">STATUS</th>
                <th className="px-3.5 py-2.5 font-sans">ENRICHED TAGS</th>
                <th className="px-3.5 py-2.5 font-sans">GPU / VRAM</th>
                <th className="px-3.5 py-2.5 font-sans">WORKER NODE</th>
                <th className="px-3.5 py-2.5 font-sans text-right">VISUAL ASSET</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242830]">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400 text-xs font-sans">
                    No ClickHouse render records found matching current query filters.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log, index) => {
                  const frameId = log?.frame_id || `FR-${index}`;
                  const tagsList = Array.isArray(log?.tags)
                    ? log.tags
                    : typeof log?.tags === 'string'
                    ? [log.tags]
                    : [];

                  const renderMs = log?.render_time_ms ?? 0;
                  const latencySec = (renderMs / 1000).toFixed(1);
                  const isHigh = renderMs > 25000 || log?.status === 'HIGH_LATENCY';
                  const isEven = index % 2 === 0;

                  return (
                    <tr
                      key={`log-${frameId}-${index}`}
                      className={`transition-colors hover:bg-[#1A1D24] ${isEven ? 'bg-[#121418]' : 'bg-[#16181D]'}`}
                    >
                      {/* Sticky Frame ID */}
                      <td className={`px-3.5 py-2 font-bold font-mono text-white sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.4)] ${isEven ? 'bg-[#121418]' : 'bg-[#16181D]'}`}>
                        {frameId}
                      </td>

                      {/* Scene / Episode */}
                      <td className="px-3.5 py-2 text-slate-200">
                        <span className="font-mono text-xs font-bold block">{log?.scene_name || 'Unknown'}</span>
                        <span className="text-[10px] text-slate-400">{log?.episode || 'Ep 3'}</span>
                      </td>

                      {/* Render Latency */}
                      <td className="px-3.5 py-2">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className={`font-bold ${isHigh ? 'text-amber-400' : 'text-slate-100'}`}>
                            {latencySec}s
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({renderMs}ms)
                          </span>
                        </div>
                      </td>

                      {/* Cost USD */}
                      <td className="px-3.5 py-2 text-amber-400 font-mono font-bold text-xs">
                        ${(log?.cost_usd ?? 0).toFixed(4)}
                      </td>

                      {/* Status */}
                      <td className="px-3.5 py-2">
                        <StatusBadge status={log?.status} />
                      </td>

                      {/* Enriched Tags */}
                      <td className="px-3.5 py-2">
                        <div className="flex flex-wrap items-center gap-1 max-w-[240px]">
                          {tagsList.map((t, tIdx) => {
                            const tagStr = String(t || '');
                            const isAiTag = tagStr.includes('AUTO') || tagStr.includes('AI') || tagStr.includes('FLAG') || tagStr.includes('REMEDIATED');
                            return (
                              <span
                                key={`tag-${frameId}-${tIdx}-${tagStr}`}
                                className={`text-[10px] px-1.5 py-0.5 rounded-none font-mono border ${
                                  isAiTag
                                    ? 'bg-[#1A1D24] text-amber-400 border-amber-500/80 font-bold'
                                    : 'bg-[#0B0C0E] text-slate-300 border-[#242830]'
                                }`}
                              >
                                {tagStr}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* GPU / VRAM */}
                      <td className="px-3.5 py-2 text-slate-200 text-xs font-mono">
                        <div>
                          <span>{log?.gpu_util_pct ?? 0}% GPU</span>
                          <span className="block text-[10px] text-slate-400">
                            {log?.vram_allocated_gb ?? 0} GB VRAM
                          </span>
                        </div>
                      </td>

                      {/* Worker Node */}
                      <td className="px-3.5 py-2 text-slate-300 text-xs font-mono">
                        {log?.worker_node || 'worker-01'}
                      </td>

                      {/* Visual Asset Inspect Button (Feature B) */}
                      <td className="px-3.5 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setInspectingLog(log)}
                          className="px-2.5 py-1 bg-[#0B0C0E] hover:bg-amber-500 hover:text-black border border-[#242830] hover:border-amber-500 text-slate-300 text-[11px] font-bold font-sans uppercase tracking-wider transition-colors inline-flex items-center gap-1 rounded-none min-h-[30px] cursor-pointer"
                          title="Open Visual Multimodal Asset Inspector"
                        >
                          <Eye className="w-3 h-3 text-amber-500" />
                          <span>INSPECT</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-[#0B0C0E] border-t border-[#242830] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-300 font-sans">
          <div className="flex items-center gap-2">
            <span className="text-[11px]">ROWS PER PAGE:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-[#121418] border border-[#242830] px-2 py-0.5 text-slate-200 focus:outline-none rounded-none font-mono text-xs"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[11px]">
              PAGE {currentPage} OF {totalPages} ({filteredLogs.length} RECORDS)
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1.5 bg-[#121418] border border-[#242830] text-slate-200 disabled:opacity-30 hover:bg-[#1A1D24] transition-colors rounded-none min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-1.5 bg-[#121418] border border-[#242830] text-slate-200 disabled:opacity-30 hover:bg-[#1A1D24] transition-colors rounded-none min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature B: Visual Multimodal Asset Inspector Modal */}
      {inspectingLog && (
        <FrameAssetInspectorModal 
          log={inspectingLog} 
          onClose={() => setInspectingLog(null)} 
        />
      )}
    </div>
  );
};
