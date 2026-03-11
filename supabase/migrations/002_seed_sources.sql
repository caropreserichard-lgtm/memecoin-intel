-- Seed sources
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
  ('ScienceAlert', 'https://www.sciencealert.com', 'https://www.sciencealert.com/feed', 'science', 5, false)
ON CONFLICT DO NOTHING;
