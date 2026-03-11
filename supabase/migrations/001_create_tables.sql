-- Create sources table
CREATE TABLE IF NOT EXISTS sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  rss_url text,
  category text NOT NULL CHECK (category IN ('animals', 'weird', 'science', 'tech', 'environment')),
  trust_level integer NOT NULL CHECK (trust_level BETWEEN 1 AND 5),
  active boolean DEFAULT true,
  use_scraping boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text UNIQUE NOT NULL,
  source_id uuid REFERENCES sources(id) ON DELETE CASCADE,
  category text,
  published_at timestamptz,
  body_text text,
  memecoin_score integer,
  virality_score integer,
  visual_score integer,
  lore_score integer,
  shillability_score integer,
  simplicity_score integer,
  controversy_score integer,
  verdict text,
  suggested_tickers jsonb,
  suggested_names jsonb,
  suggested_pitch text,
  ct_shill_angle text,
  key_entities jsonb,
  emotional_profile jsonb,
  mascot_potential text,
  strengths jsonb,
  weaknesses jsonb,
  concise_summary text,
  why_interesting text,
  is_starred boolean DEFAULT false,
  is_rejected boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create clusters table
CREATE TABLE IF NOT EXISTS clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  related_article_ids jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_articles_source_id ON articles(source_id);
CREATE INDEX idx_articles_memecoin_score ON articles(memecoin_score DESC);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_articles_url ON articles(url);
CREATE INDEX idx_articles_verdict ON articles(verdict);
CREATE INDEX idx_sources_active ON sources(active);
