'use client';

export function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null;

  let bg = 'bg-gray-700 text-gray-300';
  if (score >= 90) bg = 'bg-red-600 text-white';
  else if (score >= 80) bg = 'bg-orange-500 text-white';
  else if (score >= 70) bg = 'bg-yellow-500 text-black';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold ${bg}`}>
      {score}
    </span>
  );
}

export function VerdictTag({ verdict }: { verdict: string | null }) {
  if (!verdict) return null;

  const colors: Record<string, string> = {
    'top memecoin candidate': 'bg-red-900/50 text-red-400 border-red-700',
    'strong candidate': 'bg-orange-900/50 text-orange-400 border-orange-700',
    'watchlist': 'bg-yellow-900/50 text-yellow-400 border-yellow-700',
    'weak candidate': 'bg-gray-800 text-gray-400 border-gray-600',
    'ignore': 'bg-gray-900 text-gray-500 border-gray-700',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded border ${colors[verdict] || colors['ignore']}`}>
      {verdict}
    </span>
  );
}
