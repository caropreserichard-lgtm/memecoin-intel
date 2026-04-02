-- Run this in Supabase SQL Editor to create the upcoming_events table
CREATE TABLE IF NOT EXISTS upcoming_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('space', 'tech', 'politics', 'sports', 'culture', 'crypto', 'other')),
  ticker_potential TEXT, -- e.g. "$ARTEMIS"
  source_url TEXT,
  memecoin_angle TEXT, -- why this could spawn a token
  conviction_level INTEGER DEFAULT 5 CHECK (conviction_level >= 1 AND conviction_level <= 10),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'passed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE upcoming_events ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read" ON upcoming_events FOR SELECT USING (true);

-- Allow service key to insert/update/delete
CREATE POLICY "Allow service insert" ON upcoming_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service update" ON upcoming_events FOR UPDATE USING (true);
CREATE POLICY "Allow service delete" ON upcoming_events FOR DELETE USING (true);

-- Index for upcoming events
CREATE INDEX idx_upcoming_events_date ON upcoming_events (event_date);
CREATE INDEX idx_upcoming_events_status ON upcoming_events (status);
