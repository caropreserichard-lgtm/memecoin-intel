import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServiceClient();

  const { data: sources, error } = await supabase
    .from('sources')
    .select('*')
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get article counts per source
  const { data: counts } = await supabase
    .from('articles')
    .select('source_id');

  const countMap: Record<string, number> = {};
  if (counts) {
    for (const c of counts) {
      countMap[c.source_id] = (countMap[c.source_id] || 0) + 1;
    }
  }

  const enriched = sources?.map((s) => ({
    ...s,
    article_count: countMap[s.id] || 0,
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  const { error } = await supabase.from('sources').insert({
    name: body.name,
    url: body.url,
    rss_url: body.rss_url || null,
    category: body.category,
    trust_level: body.trust_level,
    use_scraping: body.use_scraping || false,
    active: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
