'use client';

import { Article } from '@/lib/types';
import { ScoreBadge, VerdictTag } from './ScoreBadge';

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface ArticleCardProps {
  article: Article;
  onStar: (id: string, starred: boolean) => void;
  onReject: (id: string, rejected: boolean) => void;
  onClick: (article: Article) => void;
}

export function ArticleCard({ article, onStar, onReject, onClick }: ArticleCardProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sourceName = (article as Record<string, any>).sources?.name || 'Unknown';

  return (
    <div
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-all cursor-pointer group"
      onClick={() => onClick(article)}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <ScoreBadge score={article.memecoin_score} />
          <VerdictTag verdict={article.verdict} />
        </div>
        <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onStar(article.id, !article.is_starred)}
            className={`p-1.5 rounded-lg transition-colors ${
              article.is_starred
                ? 'text-yellow-400 bg-yellow-900/30'
                : 'text-gray-600 hover:text-yellow-400 hover:bg-gray-800'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
          <button
            onClick={() => onReject(article.id, !article.is_rejected)}
            className={`p-1.5 rounded-lg transition-colors ${
              article.is_rejected
                ? 'text-red-400 bg-red-900/30'
                : 'text-gray-600 hover:text-red-400 hover:bg-gray-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <h3 className="text-white font-semibold text-sm leading-tight mb-1 group-hover:text-emerald-400 transition-colors">
        {article.title}
      </h3>

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        <span>{sourceName}</span>
        <span>·</span>
        <span>{timeAgo(article.created_at)}</span>
      </div>

      {article.concise_summary && (
        <p className="text-gray-400 text-xs mb-3 line-clamp-2">{article.concise_summary}</p>
      )}

      {article.suggested_tickers && article.suggested_tickers.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-2">
          {article.suggested_tickers.slice(0, 3).map((ticker, i) => (
            <span
              key={i}
              className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-400 border border-emerald-800/50"
            >
              {ticker}
            </span>
          ))}
        </div>
      )}

      {article.suggested_pitch && (
        <p className="text-gray-500 text-xs italic">{article.suggested_pitch}</p>
      )}
    </div>
  );
}
