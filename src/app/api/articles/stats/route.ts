import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServiceClient();

  // Use last 24 hours instead of UTC date boundary to avoid timezone mismatches
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Fetch all article scores in a single lightweight query
  const { data: articles, error } = await supabase
    .from('articles')
    .select('memecoin_score, created_at');

  if (error) {
    console.error('Stats query error:', error);
    return NextResponse.json({
      totalToday: 0,
      topCandidates: 0,
      strongCandidates: 0,
      watchlist: 0,
    });
  }

  const allArticles = articles || [];

  const totalToday = allArticles.filter(
    (a) => a.created_at && a.created_at >= twentyFourHoursAgo
  ).length;

  const topCandidates = allArticles.filter(
    (a) => a.memecoin_score >= 90
  ).length;

  const strongCandidates = allArticles.filter(
    (a) => a.memecoin_score >= 80 && a.memecoin_score < 90
  ).length;

  const watchlist = allArticles.filter(
    (a) => a.memecoin_score >= 70 && a.memecoin_score < 80
  ).length;

  return NextResponse.json({
    totalToday,
    topCandidates,
    strongCandidates,
    watchlist,
  });
}
