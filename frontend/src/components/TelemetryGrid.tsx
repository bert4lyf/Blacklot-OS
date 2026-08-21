import React from 'react';
import { TelemetryStats, SceneTelemetry } from '@/types';
import { Film, Clock, DollarSign, AlertOctagon, Cpu, ArrowRight } from 'lucide-react';
import { MetricsCard } from './MetricsCard';
import { SceneCostChart } from './SceneCostChart';
import { LatencyDistribution } from './LatencyDistribution';
import { NodeScaleSimulator } from './NodeScaleSimulator';

interface TelemetryGridProps {
  stats: TelemetryStats | null;
  scenes: SceneTelemetry[];
  isLoading: boolean;
  onNavigateToAgentStudio?: () => void;
}

export const TelemetryGrid: React.FC<TelemetryGridProps> = ({ 
  stats, 
  scenes = [], 
  isLoading,
  onNavigateToAgentStudio 
}) => {
  return (
    <div className="space-y-3.5 sm:space-y-4 font-sans">
      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricsCard
          title="Frames Ingested"
          value={isLoading ? '---' : (stats?.total_frames?.toLocaleString() || '0')}
          subtitle="ClickHouse Columnar Storage"
          icon={Film}
          trend="+360 SYNCED"
          trendPositive={true}
          accentColor="amber"
        />
        <MetricsCard
          title="Avg Render Latency"
          value={isLoading ? '---' : `${stats?.avg_render_time_sec || '0.00'}s`}
          subtitle={`Latency: ${stats?.avg_render_time_ms || 0} ms/frame`}
          icon={Clock}
          trend="BASELINE: 18.5s"
          trendPositive={false}
          accentColor="slate"
        />
        <MetricsCard
          title="GPU Compute Cost"
          value={isLoading ? '---' : `$${stats?.total_cost_usd?.toFixed(2) || '0.00'}`}
          subtitle="Cloud GPU Resource Burn"
          icon={DollarSign}
          trend="EST. SAVINGS: -$142"
          trendPositive={true}
          accentColor="amber"
        />
        <MetricsCard
          title="Anomaly / Failure Rate"
          value={isLoading ? '---' : `${stats?.anomaly_rate_pct || 0}%`}
          subtitle={`${stats?.high_latency_frames || 0} Bottlenecks / ${stats?.failed_frames || 0} Failed`}
          icon={AlertOctagon}
          trend={stats && stats.high_latency_frames > 20 ? 'ACTION REQ' : 'NOMINAL'}
          trendPositive={Boolean(stats && stats.high_latency_frames <= 10)}
          accentColor={stats && stats.high_latency_frames > 20 ? 'crimson' : 'emerald'}
        />
      </div>

      {/* Feature C: Interactive What-If Simulator Widget */}
      <NodeScaleSimulator stats={stats} />

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
        <SceneCostChart scenes={scenes} />
        <LatencyDistribution stats={stats} />
      </div>

      {/* Active Autonomous Policies & Directives Card */}
      <div className="p-3.5 sm:p-4 bg-[#121418] border border-[#242830] rounded-none flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0B0C0E] border border-[#242830] rounded-none flex items-center justify-center text-amber-500 flex-shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white font-sans">
              Active Autonomous Directives &amp; Cloud GPU Policies
            </h4>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              Latency threshold: &gt;22,000ms • VRAM paging trigger: 65GB • Automatic ClickHouse mutation write-back enabled
            </p>
          </div>
        </div>

        {onNavigateToAgentStudio && (
          <button
            type="button"
            onClick={onNavigateToAgentStudio}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0B0C0E] hover:bg-[#1A1D24] border border-[#242830] hover:border-amber-500 text-amber-400 text-xs font-bold uppercase tracking-wider rounded-none transition-colors flex-shrink-0 min-h-[38px] cursor-pointer"
          >
            <span>[ OPEN DISPATCH STUDIO ]</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
