import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  accentColor?: 'amber' | 'emerald' | 'crimson' | 'slate';
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  accentColor = 'amber',
}) => {
  return (
    <div className="p-3.5 sm:p-4 bg-[#121418] border border-[#242830] rounded-none flex flex-col justify-between hover:border-amber-500/50 transition-colors">
      <div className="flex items-center justify-between pb-2 border-b border-[#242830]">
        <span className="text-[11px] sm:text-xs font-sans uppercase tracking-wider text-slate-300 font-bold">
          {title}
        </span>
        <div className="w-7 h-7 bg-[#0B0C0E] border border-[#242830] rounded-none flex items-center justify-center text-amber-500">
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="my-2.5">
        <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white truncate">
          {value}
        </div>
        {subtitle && (
          <p className="text-[11px] sm:text-xs font-sans text-slate-300 mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {trend && (
        <div className="pt-2 border-t border-[#242830] flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400 uppercase font-sans text-[10px]">STATUS</span>
          <span
            className={`font-bold px-1.5 py-0.5 rounded-none border text-[10px] ${
              trendPositive
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                : 'bg-amber-950/80 text-amber-400 border-amber-800'
            }`}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};
