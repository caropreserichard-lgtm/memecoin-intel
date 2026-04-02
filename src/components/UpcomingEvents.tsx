'use client';

import { useState, useEffect } from 'react';

interface UpcomingEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  category: string;
  ticker_potential: string | null;
  source_url: string | null;
  memecoin_angle: string | null;
  conviction_level: number;
  status: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  space: '#6366f1',
  tech: '#06b6d4',
  politics: '#f59e0b',
  sports: '#10b981',
  culture: '#ec4899',
  crypto: '#f97316',
  other: '#6b7280',
};

function timeUntil(dateStr: string): string {
  const now = new Date();
  const eventDate = new Date(dateStr);
  const diff = eventDate.getTime() - now.getTime();

  if (diff < 0) return 'LIVE NOW';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return 'Soon';
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    category: 'tech',
    ticker_potential: '',
    memecoin_angle: '',
    conviction_level: 7,
  });

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      const newEvent = await res.json();
      setEvents((prev) => [...prev, newEvent].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()));
      setShowAddForm(false);
      setFormData({ title: '', description: '', event_date: '', category: 'tech', ticker_potential: '', memecoin_angle: '', conviction_level: 7 });
    }
  };

  if (loading) return null;

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#e2e8f0' }}>
          Upcoming Events (Artemis Rule)
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '6px 16px',
            background: showAddForm ? '#374151' : '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          {showAddForm ? 'Cancel' : '+ Add Event'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} style={{ background: '#1e293b', borderRadius: '8px', padding: '16px', marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input
            placeholder="Event title (e.g. Artemis II Launch)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            style={{ gridColumn: '1 / -1', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: 'white' }}
          />
          <input
            type="datetime-local"
            value={formData.event_date}
            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
            required
            style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: 'white' }}
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: 'white' }}
          >
            <option value="space">Space</option>
            <option value="tech">Tech</option>
            <option value="politics">Politics</option>
            <option value="sports">Sports</option>
            <option value="culture">Culture</option>
            <option value="crypto">Crypto</option>
            <option value="other">Other</option>
          </select>
          <input
            placeholder="Ticker potential (e.g. $ARTEMIS)"
            value={formData.ticker_potential}
            onChange={(e) => setFormData({ ...formData, ticker_potential: e.target.value })}
            style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: 'white' }}
          />
          <input
            placeholder="Memecoin angle (why this could be a token)"
            value={formData.memecoin_angle}
            onChange={(e) => setFormData({ ...formData, memecoin_angle: e.target.value })}
            style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: 'white' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ color: '#94a3b8', fontSize: '13px' }}>Conviction:</label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.conviction_level}
              onChange={(e) => setFormData({ ...formData, conviction_level: parseInt(e.target.value) })}
              style={{ flex: 1 }}
            />
            <span style={{ color: '#e2e8f0', fontWeight: 'bold' }}>{formData.conviction_level}/10</span>
          </div>
          <button type="submit" style={{ gridColumn: '1 / -1', padding: '8px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Add Event
          </button>
        </form>
      )}

      {events.length === 0 ? (
        <div style={{ background: '#1e293b', borderRadius: '8px', padding: '20px', textAlign: 'center', color: '#64748b' }}>
          No upcoming events. Add events to track launches, releases, and major moments.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {events.map((event) => {
            const countdown = timeUntil(event.event_date);
            const isLive = countdown === 'LIVE NOW';
            return (
              <div
                key={event.id}
                style={{
                  background: '#1e293b',
                  borderRadius: '8px',
                  padding: '14px',
                  border: isLive ? '2px solid #ef4444' : '1px solid #334155',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: 'white',
                    background: CATEGORY_COLORS[event.category] || '#6b7280',
                  }}>
                    {event.category.toUpperCase()}
                  </span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: isLive ? '#ef4444' : '#f59e0b',
                    animation: isLive ? 'pulse 1s infinite' : undefined,
                  }}>
                    {countdown}
                  </span>
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '6px' }}>
                  {event.title}
                </h3>
                {event.ticker_potential && (
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    background: '#065f46',
                    color: '#34d399',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '6px',
                  }}>
                    {event.ticker_potential}
                  </span>
                )}
                {event.memecoin_angle && (
                  <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', margin: '4px 0' }}>
                    {event.memecoin_angle}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: '6px',
                          height: '10px',
                          borderRadius: '1px',
                          background: i < event.conviction_level
                            ? event.conviction_level >= 8 ? '#22c55e' : event.conviction_level >= 5 ? '#f59e0b' : '#6b7280'
                            : '#1e293b',
                          border: '1px solid #334155',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
