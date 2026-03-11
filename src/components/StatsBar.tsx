'use client';

interface Stats {
  totalToday: number;
  topCandidates: number;
  strongCandidates: number;
  watchlist: number;
}

interface StatsBarProps {
  stats: Stats;
  lastScan: string | null;
  scanning: boolean;
  onTriggerScan: () => void;
}

export function StatsBar({ stats, lastScan, scanning, onTriggerScan }: StatsBarProps) {
  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-6">
          <StatItem label="Last 24h" value={stats.totalToday} color="text-gray-300" />
          <StatItem label="Top (90+)" value={stats.topCandidates} color="text-red-400" />
          <StatItem label="Strong (80-89)" value={stats.strongCandidates} color="text-orange-400" />
          <StatItem label="Watchlist (70-79)" value={stats.watchlist} color="text-yellow-400" />
        </div>
        <div className="flex items-center gap-3">
          {lastScan && (
            <span className="text-gray-500 text-xs">
              Last scan: {new Date(lastScan).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={onTriggerScan}
            disabled={scanning}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
          >
            {scanning ? 'Scanning...' : 'Scan Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-gray-500 text-xs">{label}</div>
    </div>
  );
}
