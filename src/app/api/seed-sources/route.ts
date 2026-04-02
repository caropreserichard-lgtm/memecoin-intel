import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const NEW_SOURCES = [
  { name: 'MyModernMet', url: 'https://mymodernmet.com', rss_url: 'https://mymodernmet.com/feed/', category: 'weird', trust_level: 4 },
  { name: 'Guardian Animals', url: 'https://www.theguardian.com/world/animals', rss_url: 'https://www.theguardian.com/world/animals/rss', category: 'animals', trust_level: 5 },
  { name: 'UPI Odd News', url: 'https://www.upi.com/Odd_News', rss_url: 'https://rss.upi.com/news/odd_news/rss', category: 'weird', trust_level: 4 },
  { name: 'Bored Panda', url: 'https://www.boredpanda.com', rss_url: 'https://www.boredpanda.com/feed/', category: 'weird', trust_level: 4 },
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
