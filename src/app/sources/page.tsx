'use client';

import { useState, useEffect } from 'react';
import type { Source } from '@/lib/types';

interface SourceWithCount extends Source {
  article_count: number;
}

export default function SourcesPage() {
  const [sources, setSources] = useState<SourceWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    url: '',
    rss_url: '',
    category: 'science',
    trust_level: 3,
    use_scraping: false,
  });

  const fetchSources = async () => {
    const res = await fetch('/api/sources');
    const data = await res.json();
    setSources(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleToggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/sources/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, active } : s)));
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ name: '', url: '', rss_url: '', category: 'science', trust_level: 3, use_scraping: false });
    setShowForm(false);
    fetchSources();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">News Sources</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Source'}
        </button>
      </div>

      {/* Add Source Form */}
      {showForm && (
        <form onSubmit={handleAddSource} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Source Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:border-emerald-600 focus:outline-none"
            />
            <input
              type="url"
              placeholder="Website URL"
              required
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:border-emerald-600 focus:outline-none"
            />
            <input
              type="url"
              placeholder="RSS URL (optional)"
              value={form.rss_url}
              onChange={(e) => setForm({ ...form, rss_url: e.target.value })}
              className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:border-emerald-600 focus:outline-none"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="bg-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2 border border-gray-700 focus:border-emerald-600 focus:outline-none"
            >
              <option value="animals">Animals</option>
              <option value="weird">Weird</option>
              <option value="science">Science</option>
              <option value="tech">Tech</option>
              <option value="environment">Environment</option>
            </select>
            <div className="flex items-center gap-3">
              <label className="text-gray-400 text-sm">Trust Level:</label>
              <input
                type="range"
                min={1}
                max={5}
                value={form.trust_level}
                onChange={(e) => setForm({ ...form, trust_level: parseInt(e.target.value) })}
                className="accent-emerald-500"
              />
              <span className="text-white text-sm font-mono">{form.trust_level}</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.use_scraping}
                onChange={(e) => setForm({ ...form, use_scraping: e.target.checked })}
                className="accent-emerald-500"
              />
              <span className="text-gray-400 text-sm">Use scraping (no RSS)</span>
            </label>
          </div>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Add Source
          </button>
        </form>
      )}

      {/* Sources Table */}
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 font-medium px-4 py-3">Name</th>
                <th className="text-left text-gray-400 font-medium px-4 py-3">Category</th>
                <th className="text-center text-gray-400 font-medium px-4 py-3">Trust</th>
                <th className="text-center text-gray-400 font-medium px-4 py-3">Type</th>
                <th className="text-center text-gray-400 font-medium px-4 py-3">Articles</th>
                <th className="text-center text-gray-400 font-medium px-4 py-3">Active</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => (
                <tr key={source.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{source.name}</div>
                    <div className="text-gray-500 text-xs truncate max-w-xs">{source.url}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700 capitalize">
                      {source.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            i < source.trust_level ? 'bg-emerald-500' : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      source.use_scraping
                        ? 'bg-purple-900/40 text-purple-400 border border-purple-800/50'
                        : 'bg-blue-900/40 text-blue-400 border border-blue-800/50'
                    }`}>
                      {source.use_scraping ? 'Scraping' : 'RSS'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300 font-mono">
                    {source.article_count}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(source.id, !source.active)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        source.active ? 'bg-emerald-600' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          source.active ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
