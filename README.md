# Memecoin Intel

AI-powered memecoin news intelligence dashboard. Scans 11 news sources every 5 minutes, scores articles for memecoin potential using Claude AI, and sends Telegram alerts for high-scoring stories.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (PostgreSQL database)
- **Anthropic Claude API** (claude-sonnet-4-20250514)
- **Tailwind CSS** (dark crypto theme)
- **Telegram Bot API** (alerts)
- **Cheerio** (article scraping)
- **rss-parser** (RSS feeds)

## Run Locally

```bash
# Install dependencies
npm install

# Copy env template and fill in your values
cp .env.local.example .env.local

# Run development server
npm run dev
```

Open http://localhost:3000 — you'll be redirected to the dashboard.

## Set Up Supabase Tables

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the following migration SQL:

```sql
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

-- Indexes
CREATE INDEX idx_articles_source_id ON articles(source_id);
CREATE INDEX idx_articles_memecoin_score ON articles(memecoin_score DESC);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_articles_url ON articles(url);
CREATE INDEX idx_articles_verdict ON articles(verdict);
CREATE INDEX idx_sources_active ON sources(active);
```

4. Then seed the sources:

```sql
INSERT INTO sources (name, url, rss_url, category, trust_level, use_scraping) VALUES
  ('Wired', 'https://www.wired.com', 'https://www.wired.com/feed/rss', 'tech', 5, false),
  ('NY Post Science', 'https://nypost.com', 'https://nypost.com/feed/', 'weird', 4, false),
  ('Phys.org', 'https://phys.org', 'https://phys.org/rss-feed/', 'science', 5, false),
  ('Daily Mail Sci', 'https://www.dailymail.co.uk/sciencetech', 'https://www.dailymail.co.uk/sciencetech/index.rss', 'science', 3, false),
  ('Techmeme', 'https://techmeme.com', 'https://www.techmeme.com/feed.xml', 'tech', 4, false),
  ('LiveScience', 'https://www.livescience.com', 'https://www.livescience.com/feeds/all', 'science', 4, false),
  ('ScienceDaily', 'https://www.sciencedaily.com', 'https://www.sciencedaily.com/rss/all.xml', 'science', 5, false),
  ('IFLScience', 'https://www.iflscience.com', NULL, 'science', 4, true),
  ('Oddity Central', 'https://www.odditycentral.com', 'https://www.odditycentral.com/feed', 'weird', 4, false),
  ('ZooBorns', 'https://www.zooborns.com', 'https://www.zooborns.com/zooborns/rss.xml', 'animals', 5, false),
  ('ScienceAlert', 'https://www.sciencealert.com', 'https://www.sciencealert.com/feed', 'science', 5, false);
```

## Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` and follow the prompts to name your bot
3. Copy the **bot token** you receive
4. Create a group or channel and add your bot
5. To get the **chat ID**, send a message in the group, then visit:
   `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   Look for `"chat":{"id":...}` in the response
6. Add both values to your `.env.local`

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Vercel will auto-detect Next.js

### Add Environment Variables in Vercel Dashboard

Go to **Project Settings > Environment Variables** and add:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token from BotFather |
| `TELEGRAM_CHAT_ID` | Telegram group/channel chat ID |
| `CRON_SECRET` | Any random string for cron auth |

## How the Cron Job Works

The `vercel.json` configures a cron job that hits `/api/scan` every 5 minutes:

```json
{
  "crons": [
    {
      "path": "/api/scan",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Vercel sends a POST request to `/api/scan` with an `Authorization: Bearer <CRON_SECRET>` header. The scan endpoint:

1. Fetches all active sources from Supabase
2. For each source, parses RSS or scrapes the homepage
3. Skips articles already in the database (deduplication by URL)
4. Sends new articles to Claude for memecoin potential analysis
5. Stores results in Supabase
6. Sends Telegram alerts for scores >= 80

You can also trigger a scan manually from the dashboard using the "Scan Now" button, or by visiting `/api/trigger-scan`.

**Note:** Vercel cron jobs require a Pro plan. On the free tier, use an external cron service (e.g., cron-job.org) to hit your `/api/trigger-scan` endpoint.
