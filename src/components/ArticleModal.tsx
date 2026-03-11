'use client';

import { Article } from '@/lib/types';
import { ScoreBadge, VerdictTag } from './ScoreBadge';

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
}

function ScoreBar({ label, value }: { label: string; value: number | null }) {
  const v = value || 0;
  let barColor = 'bg-gray-600';
  if (v >= 90) barColor = 'bg-red-500';
  else if (v >= 80) barColor = 'bg-orange-500';
  else if (v >= 70) barColor = 'bg-yellow-500';
  else if (v >= 50) barColor = 'bg-emerald-600';

  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 text-xs w-28 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-800 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${barColor}`} style={{ width: `${v}%` }} />
      </div>
      <span className="text-gray-300 text-xs font-mono w-8 text-right">{v}</span>
    </div>
  );
}

export function ArticleModal({ article, onClose }: ArticleModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScoreBadge score={article.memecoin_score} />
            <VerdictTag verdict={article.verdict} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          <h2 className="text-white text-lg font-bold leading-tight">{article.title}</h2>

          {/* Score Bars */}
          <div className="space-y-2">
            <h3 className="text-gray-300 text-sm font-semibold mb-2">Score Breakdown</h3>
            <ScoreBar label="Memecoin" value={article.memecoin_score} />
            <ScoreBar label="Virality" value={article.virality_score} />
            <ScoreBar label="Visual" value={article.visual_score} />
            <ScoreBar label="Lore" value={article.lore_score} />
            <ScoreBar label="Shillability" value={article.shillability_score} />
            <ScoreBar label="Simplicity" value={article.simplicity_score} />
            <ScoreBar label="Controversy" value={article.controversy_score} />
          </div>

          {/* Emotional Profile */}
          {article.emotional_profile && article.emotional_profile.length > 0 && (
            <div>
              <h3 className="text-gray-300 text-sm font-semibold mb-2">Emotional Profile</h3>
              <div className="flex flex-wrap gap-1.5">
                {article.emotional_profile.map((e, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded bg-purple-900/40 text-purple-400 border border-purple-800/50">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Entities */}
          {article.key_entities && article.key_entities.length > 0 && (
            <div>
              <h3 className="text-gray-300 text-sm font-semibold mb-2">Key Entities</h3>
              <div className="flex flex-wrap gap-1.5">
                {article.key_entities.map((e, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded bg-blue-900/40 text-blue-400 border border-blue-800/50">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mascot Potential */}
          {article.mascot_potential && (
            <div>
              <h3 className="text-gray-300 text-sm font-semibold mb-1">Mascot Potential</h3>
              <p className="text-gray-400 text-sm">{article.mascot_potential}</p>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-2 gap-4">
            {article.strengths && article.strengths.length > 0 && (
              <div>
                <h3 className="text-green-400 text-sm font-semibold mb-1">Strengths</h3>
                <ul className="space-y-1">
                  {article.strengths.map((s, i) => (
                    <li key={i} className="text-gray-400 text-xs flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">+</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {article.weaknesses && article.weaknesses.length > 0 && (
              <div>
                <h3 className="text-red-400 text-sm font-semibold mb-1">Weaknesses</h3>
                <ul className="space-y-1">
                  {article.weaknesses.map((w, i) => (
                    <li key={i} className="text-gray-400 text-xs flex items-start gap-1">
                      <span className="text-red-500 mt-0.5">-</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* CT Shill Angle */}
          {article.ct_shill_angle && (
            <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-lg p-3">
              <h3 className="text-emerald-400 text-sm font-semibold mb-1">CT Shill Angle</h3>
              <p className="text-emerald-300 text-sm">{article.ct_shill_angle}</p>
            </div>
          )}

          {/* Suggested Names & Tickers */}
          {article.suggested_names && article.suggested_names.length > 0 && (
            <div>
              <h3 className="text-gray-300 text-sm font-semibold mb-2">Suggested Names</h3>
              <div className="flex flex-wrap gap-1.5">
                {article.suggested_names.map((n, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          {article.suggested_tickers && article.suggested_tickers.length > 0 && (
            <div>
              <h3 className="text-gray-300 text-sm font-semibold mb-2">Suggested Tickers</h3>
              <div className="flex flex-wrap gap-1.5">
                {article.suggested_tickers.map((t, i) => (
                  <span key={i} className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-400 border border-emerald-800/50">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pitch */}
          {article.suggested_pitch && (
            <div>
              <h3 className="text-gray-300 text-sm font-semibold mb-1">Pitch</h3>
              <p className="text-white text-sm italic">&ldquo;{article.suggested_pitch}&rdquo;</p>
            </div>
          )}

          {/* Why Interesting */}
          {article.why_interesting && (
            <div>
              <h3 className="text-gray-300 text-sm font-semibold mb-1">Why Interesting</h3>
              <p className="text-gray-400 text-sm">{article.why_interesting}</p>
            </div>
          )}

          {/* Original Article Link */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-gray-800 hover:bg-gray-700 text-emerald-400 py-2 rounded-lg text-sm transition-colors"
          >
            Read Original Article &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
