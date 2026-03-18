import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);

  const category = searchParams.get('category');
  const verdict = searchParams.get('verdict');
  const minScore = searchParams.get('minScore');
  const maxScore = searchParams.get('maxScore');
  const starred = searchParams.get('starred');
  const showRejected = searchParams.get('showRejected');
  const date = searchParams.get('date');
  const sortBy = searchParams.get('sortBy');

  let query = supabase
    .from('articles')
    .select('*, sources(name)');

  if (sortBy === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else {
    query = query
      .order('memecoin_score', { ascending: false })
      .order('created_at', { ascending: false });
  }

  query = query.limit(200);

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  if (verdict && verdict !== 'all') {
    const verdictMap: Record<string, string> = {
      top: 'top memecoin candidate',
      strong: 'strong candidate',
      watchlist: 'watchlist',
      weak: 'weak candidate',
      ignore: 'ignore',
    };
    query = query.eq('verdict', verdictMap[verdict] || verdict);
  }

  if (minScore) {
    query = query.gte('memecoin_score', parseInt(minScore));
  }
  if (maxScore) {
    query = query.lte('memecoin_score', parseInt(maxScore));
  }

  if (starred === 'true') {
    query = query.eq('is_starred', true);
  }

  if (showRejected !== 'true') {
    query = query.is('is_rejected', false);
  }

  if (date) {
    query = query.gte('created_at', `${date}T00:00:00`).lte('created_at', `${date}T23:59:59`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
