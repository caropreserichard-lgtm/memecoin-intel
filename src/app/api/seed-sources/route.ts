import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const NEW_SOURCES = [
  // --- Previously added sources ---
  { name: 'MyModernMet', url: 'https://mymodernmet.com', rss_url: 'https://mymodernmet.com/feed/', category: 'weird', trust_level: 4 },
  { name: 'Guardian Animals', url: 'https://www.theguardian.com/world/animals', rss_url: 'https://www.theguardian.com/world/animals/rss', category: 'animals', trust_level: 5 },
  { name: 'UPI Odd News', url: 'https://www.upi.com/Odd_News', rss_url: 'https://rss.upi.com/news/odd_news/rss', category: 'weird', trust_level: 4 },
  { name: 'Bored Panda', url: 'https://www.boredpanda.com', rss_url: 'https://www.boredpanda.com/feed/', category: 'weird', trust_level: 4 },

  // --- Viral / Tabloid ---
  { name: 'TMZ', url: 'https://www.tmz.com', rss_url: 'https://www.tmz.com/rss.xml', category: 'viral', trust_level: 3 },
  { name: 'LADbible', url: 'https://www.ladbible.com', rss_url: 'https://www.ladbible.com/rss.xml', category: 'viral', trust_level: 3 },
  { name: 'Unilad', url: 'https://www.unilad.com', rss_url: 'https://www.unilad.com/feed/', category: 'viral', trust_level: 3 },
  { name: 'Daily Star', url: 'https://www.dailystar.co.uk', rss_url: 'https://www.dailystar.co.uk/rss.xml', category: 'weird', trust_level: 3 },
  { name: 'Metro UK', url: 'https://metro.co.uk', rss_url: 'https://metro.co.uk/feed/', category: 'weird', trust_level: 3 },
  { name: 'Mirror UK', url: 'https://www.mirror.co.uk', rss_url: 'https://www.mirror.co.uk/rss.xml', category: 'weird', trust_level: 3 },
  { name: 'NY Post Weird', url: 'https://nypost.com/weird-but-true', rss_url: 'https://nypost.com/weird-but-true/feed/', category: 'weird', trust_level: 4 },

  // --- Animals ---
  { name: 'The Dodo', url: 'https://www.thedodo.com', rss_url: 'https://www.thedodo.com/rss.xml', category: 'animals', trust_level: 4 },
  { name: 'Treehugger', url: 'https://www.treehugger.com', rss_url: 'https://www.treehugger.com/feeds/all', category: 'animals', trust_level: 4 },
  { name: 'National Geographic', url: 'https://www.nationalgeographic.com', rss_url: 'https://www.nationalgeographic.com/content/natgeo/en_US/news/rss-feeds/full-story/rss.xml', category: 'animals', trust_level: 5 },

  // --- Science / Discovery ---
  { name: 'Popular Science', url: 'https://www.popsci.com', rss_url: 'https://www.popsci.com/rss.xml', category: 'science', trust_level: 4 },
  { name: 'New Scientist', url: 'https://www.newscientist.com', rss_url: 'https://www.newscientist.com/feed/home/', category: 'science', trust_level: 5 },
  { name: 'Futurism', url: 'https://futurism.com', rss_url: 'https://futurism.com/feed', category: 'science', trust_level: 4 },
  { name: 'Discover Magazine', url: 'https://www.discovermagazine.com', rss_url: 'https://www.discovermagazine.com/rss', category: 'science', trust_level: 4 },
  { name: 'EarthSky', url: 'https://earthsky.org', rss_url: 'https://earthsky.org/feed', category: 'science', trust_level: 4 },

  // --- Tech / Viral Tech ---
  { name: 'The Verge', url: 'https://www.theverge.com', rss_url: 'https://www.theverge.com/rss/index.xml', category: 'tech', trust_level: 5 },
  { name: 'Gizmodo', url: 'https://gizmodo.com', rss_url: 'https://gizmodo.com/rss', category: 'tech', trust_level: 4 },
  { name: 'Mashable', url: 'https://mashable.com', rss_url: 'https://mashable.com/feeds/rss/all', category: 'tech', trust_level: 4 },

  // --- Weird / Interesting ---
  { name: 'Atlas Obscura', url: 'https://www.atlasobscura.com', rss_url: 'https://www.atlasobscura.com/feeds/latest', category: 'weird', trust_level: 4 },
  { name: "Ripley's", url: 'https://www.ripleys.com', rss_url: 'https://www.ripleys.com/feed/', category: 'weird', trust_level: 4 },
  { name: 'Mental Floss', url: 'https://www.mentalfloss.com', rss_url: 'https://www.mentalfloss.com/rss.xml', category: 'weird', trust_level: 4 },
  { name: 'Smithsonian Magazine', url: 'https://www.smithsonianmag.com', rss_url: 'https://www.smithsonianmag.com/rss/latest_articles/', category: 'science', trust_level: 5 },

  // --- Crime / Heroic ---
  { name: 'Crime Online', url: 'https://www.crimeonline.com', rss_url: 'https://www.crimeonline.com/feed/', category: 'weird', trust_level: 3 },
  { name: 'People', url: 'https://people.com', rss_url: 'https://people.com/feed/', category: 'weird', trust_level: 4 },
];

export async function GET() {
  const supabase = createServiceClient();
  const results: string[] = [];

  for (const source of NEW_SOURCES) {
    const { data: existing } = await supabase
      .from('sources')
      .select('id')
      .eq('name', source.name)
      .single();

    if (existing) {
      results.push(`${source.name}: already exists`);
      continue;
    }

    const { error } = await supabase.from('sources').insert({
      ...source,
      active: true,
      use_scraping: false,
    });

    if (error) {
      results.push(`${source.name}: ERROR - ${error.message}`);
    } else {
      results.push(`${source.name}: ADDED`);
    }
  }

  return NextResponse.json({ results });
}
