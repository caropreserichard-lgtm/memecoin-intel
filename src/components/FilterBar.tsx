'use client';

interface Filters {
  category: string;
  verdict: string;
  minScore: number;
  maxScore: number;
  starred: boolean;
  showRejected: boolean;
  date: string;
  days: string;
  sortBy: string;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const set = (key: keyof Filters, value: string | number | boolean) => {
    onChange({ ...filters, [key]: value });
  };

  const handleRangeChange = (value: string) => {
    if (value === 'custom') return; // let user pick date manually
    if (value === 'date') return;
    // Clear specific date when picking a rolling window
    onChange({ ...filters, days: value, date: '' });
  };

  const handleDateChange = (value: string) => {
    // Picking a specific date clears the rolling window
    onChange({ ...filters, date: value, days: '' });
  };

  // Determine what the range selector shows
  const rangeValue = filters.date ? 'custom' : (filters.days || '7');

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 flex flex-wrap items-center gap-3">
      {/* Sort By */}
      <select
        value={filters.sortBy}
        onChange={(e) => set('sortBy', e.target.value)}
        className="bg-gray-800 text-gray-300 text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:border-emerald-600 focus:outline-none"
      >
        <option value="score">Sort: Score</option>
        <option value="newest">Sort: Newest</option>
      </select>

      {/* Category */}
      <select
        value={filters.category}
        onChange={(e) => set('category', e.target.value)}
        className="bg-gray-800 text-gray-300 text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:border-emerald-600 focus:outline-none"
      >
        <option value="all">All Categories</option>
        <option value="viral">Viral</option>
        <option value="heroic">Heroic</option>
        <option value="crime">Crime</option>
        <option value="weird">Weird</option>
        <option value="animals">Animals</option>
        <option value="politics">Politics</option>
        <option value="science">Science</option>
        <option value="tech">Tech</option>
        <option value="environment">Environment</option>
      </select>

      {/* Verdict */}
      <select
        value={filters.verdict}
        onChange={(e) => set('verdict', e.target.value)}
        className="bg-gray-800 text-gray-300 text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:border-emerald-600 focus:outline-none"
      >
        <option value="all">All Verdicts</option>
        <option value="top">Top Candidates</option>
        <option value="strong">Strong</option>
        <option value="watchlist">Watchlist</option>
        <option value="weak">Weak</option>
        <option value="ignore">Ignore</option>
      </select>

      {/* Score Range */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-xs">Score:</span>
        <input
          type="range"
          min={0}
          max={100}
          value={filters.minScore}
          onChange={(e) => set('minScore', parseInt(e.target.value))}
          className="w-24 accent-emerald-500"
        />
        <span className="text-gray-400 text-xs font-mono">{filters.minScore}-{filters.maxScore}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={filters.maxScore}
          onChange={(e) => set('maxScore', parseInt(e.target.value))}
          className="w-24 accent-emerald-500"
        />
      </div>

      {/* Date Range Selector */}
      <select
        value={rangeValue}
        onChange={(e) => handleRangeChange(e.target.value)}
        className="bg-gray-800 text-gray-300 text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:border-emerald-600 focus:outline-none"
      >
        <option value="1">Today</option>
        <option value="3">Last 3 days</option>
        <option value="7">Last 7 days</option>
        <option value="14">Last 14 days</option>
        <option value="30">Last 30 days</option>
        <option value="">All time</option>
        <option value="custom">Custom date...</option>
      </select>

      {/* Custom Date Picker — only shown when "custom date" is selected */}
      {rangeValue === 'custom' && (
        <input
          type="date"
          value={filters.date}
          onChange={(e) => handleDateChange(e.target.value)}
          className="bg-gray-800 text-gray-300 text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:border-emerald-600 focus:outline-none"
        />
      )}

      {/* Starred Toggle */}
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.starred}
          onChange={(e) => set('starred', e.target.checked)}
          className="accent-yellow-500"
        />
        <span className="text-gray-400 text-xs">Starred</span>
      </label>

      {/* Show Rejected */}
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.showRejected}
          onChange={(e) => set('showRejected', e.target.checked)}
          className="accent-red-500"
        />
        <span className="text-gray-400 text-xs">Rejected</span>
      </label>
    </div>
  );
}
