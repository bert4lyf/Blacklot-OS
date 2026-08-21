'use client';

import React, { useState } from 'react';
import { SystemHealth } from '@/types';
import { 
  RefreshCw, 
  Database, 
  Cpu, 
  Server
} from 'lucide-react';
import { seedDatabase } from '@/lib/api';

interface HeaderProps {
  health: SystemHealth | null;
  onRefreshData: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({ health, onRefreshData, isRefreshing }) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  const isClickHouseConnected = health?.clickhouse?.is_connected_to_remote ?? true;
  const geminiModel = (health?.gemini?.model || 'GEMINI-3.6-FLASH').toUpperCase();

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      const res = await seedDatabase();
      setSeedNotice(`SEEDED: ${res?.records_count || 360} FRAMES IN CLICKHOUSE`);
      setTimeout(() => setSeedNotice(null), 4000);
      onRefreshData();
    } catch (err: any) {
      setSeedNotice('SEED ERROR');
      setTimeout(() => setSeedNotice(null), 4000);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <header className="border-b border-[#242830] bg-[#090A0C] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Industrial Title & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-500 rounded-none flex items-center justify-center font-black font-mono text-black text-base sm:text-lg border border-amber-400 flex-shrink-0">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-widest font-mono text-white">
                BACKLOT
              </h1>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#16181D] text-amber-400 border border-[#242830] rounded-none uppercase">
                v2.5-PROD
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-sans uppercase tracking-wider text-slate-400 mt-0.5">
              Studio Render Infrastructure &amp; Agentic Dispatch
            </p>
          </div>
        </div>

        {/* Center: Sharp Functional Status Indicators */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
          
          {/* ClickHouse Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#121418] border border-[#242830] rounded-none">
            <span className={`w-2 h-2 rounded-none ${isClickHouseConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-slate-400 text-[10px] font-semibold uppercase">ClickHouse:</span>
            <span className={`font-bold font-mono text-xs ${isClickHouseConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isClickHouseConnected ? 'LIVE CLOUD' : 'SIMULATION'}
            </span>
          </div>

          {/* Gemini Model Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#121418] border border-[#242830] rounded-none">
            <Cpu className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-slate-400 text-[10px] font-semibold uppercase">Engine:</span>
            <span className="font-bold font-mono text-slate-200 text-xs">
              {geminiModel}
            </span>
          </div>

          {/* GCP Region */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#121418] border border-[#242830] rounded-none">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[10px] font-semibold uppercase">Region:</span>
            <span className="font-bold font-mono text-slate-300 text-xs">
              us-central1
            </span>
          </div>
        </div>

        {/* Right: Squared Action Buttons */}
        <div className="flex items-center gap-2">
          {seedNotice && (
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950/80 px-2 py-1 border border-amber-800 rounded-none animate-pulse font-bold">
              {seedNotice}
            </span>
          )}

          <button
            type="button"
            onClick={handleSeed}
            disabled={isSeeding}
            className="px-3 py-1.5 bg-[#121418] hover:bg-[#1A1D24] border border-[#242830] hover:border-slate-500 text-slate-200 text-xs font-sans font-bold uppercase tracking-wider rounded-none transition-colors flex items-center gap-1.5 disabled:opacity-50 min-h-[38px] cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-amber-500" />
            <span>{isSeeding ? 'SEEDING...' : 'SEED TEST DATA'}</span>
          </button>

          <button
            type="button"
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-[#121418] hover:bg-[#1A1D24] border border-[#242830] hover:border-slate-500 text-slate-200 text-xs font-sans font-bold uppercase tracking-wider rounded-none transition-colors flex items-center gap-1.5 disabled:opacity-50 min-h-[38px] cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'REFRESHING...' : 'REFRESH'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
