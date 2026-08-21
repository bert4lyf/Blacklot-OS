import React from 'react';

interface StatusBadgeProps {
  status?: string | null;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = (status || 'UNKNOWN').toUpperCase();

  switch (normalized) {
    case 'COMPLETED':
    case 'SUCCESS':
    case 'HEALTHY':
    case 'OPTIMAL':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 rounded-none ${className}`}
        >
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-none" />
          {status || 'OPTIMAL'}
        </span>
      );

    case 'HIGH_LATENCY':
    case 'BOTTLENECK':
    case 'WARNING':
    case 'HIGH':
    case 'RUNNING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-950/80 text-amber-400 border border-amber-800/80 rounded-none ${className}`}
        >
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-none" />
          {status || 'BOTTLENECK'}
        </span>
      );

    case 'FAILED':
    case 'ERROR':
    case 'CRITICAL':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-800/80 rounded-none ${className}`}
        >
          <span className="w-1.5 h-1.5 bg-red-400 rounded-none" />
          {status || 'CRITICAL'}
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#16181D] text-slate-300 border border-[#242830] rounded-none ${className}`}
        >
          <span className="w-1.5 h-1.5 bg-slate-500 rounded-none" />
          {status || 'STANDBY'}
        </span>
      );
  }
};
