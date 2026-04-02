'use client';

import { useState, useEffect, useCallback } from 'react';
import { Article } from '@/lib/types';
import { ArticleCard } from '@/components/ArticleCard';
import { ArticleModal } from '@/components/ArticleModal';
import { FilterBar } from '@/components/FilterBar';
import { StatsBar } from '@/components/StatsBar';
import UpcomingEvents from '@/components/UpcomingEvents';

interface Filters {
  category: string;
  verdict: string;
  minScore: number;
  maxScore: number;
  starred: boolean;
  showRejected: boolean;
  date: string;
  sortBy: string;
}

export default function DashboardPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState({ totalToday: 0, topCandidates: 0, strongCandidates: 0, watchlist: 0 });
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    verdict: 'all',
    minScore: 75,
    maxScore: 100,
    starred: false,
    showRejected: false,
    date: '',
    sortBy: 'score',
  });

  const fetchArticles = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.category !== 'all') params.set('category', filters.category);
    if (filters.verdict !== 'all') params.set('verdict', filters.verdict);
    if (filters.minScore > 0) params.set('minScore', String(filters.minScore));
    if (filters.maxScore < 100) params.set('maxScore', String(filters.maxScore));
    if (filters.starred) params.set('starred', 'true');
    if (filters.showRejected) params.set('showRejected', 'true');
    if (filters.date) params.set('date', filters.date);
    if (filters.sortBy !== 'score') params.set('sortBy', filters.sortBy);

    const res = await fetch(`/api/articles?${params}`);
    const data = await res.json();
    setArticles(data);
    setLoading(false);
  }, [filters]);

  const fetchStats = async () => {
    const res = await fetch('/api/articles/stats');
    const data = await res.json();
    setStats(data);
  };

  useEffect(() => {
    fetchArticles();
    fetchStats();
  }, [fetchArticles]);

  const handleStar = async (id: string, starred: boolean) => {
    await fetch(`/api/articles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_starred: starred }),
    });
    setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, is_starred: starred } : a)));
  };

  const handleReject = async (id: string, rejected: boolean) => {
    await fetch(`/api/articles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_rejected: rejected }),
    });
    setArticles((prev) =>
      filters.showRejected
        ? prev.map((a) => (a.id === id ? { ...a, is_rejected: rejected } : a))
        : prev.filter((a) => a.id !== id)
    );
  };

  const handleTriggerScan = async () => {
    setScanning(true);
    try {
      await fetch('/api/trigger-scan');
      setLastScan(new Date().toISOString());
      await fetchArticles();
      await fetchStats();
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-4">
      <StatsBar stats={stats} lastScan={lastScan} scanning={scanning} onTriggerScan={handleTriggerScan} />
      <UpcomingEvents />
      <FilterBar filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 mt-3 text-sm">Loading articles...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No articles found</p>
          <p className="text-gray-600 text-sm mt-1">Try adjusting your filters or run a scan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onStar={handleStar}
              onReject={handleReject}
              onClick={setSelectedArticle}
            />
          ))}
        </div>
      )}

      {selectedArticle && (
        <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </div>
  );
}
