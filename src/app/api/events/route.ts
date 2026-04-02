import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET: fetch upcoming events
export async function GET() {
  const { data: events, error } = await supabase
    .from('upcoming_events')
    .select('*')
    .in('status', ['upcoming', 'live'])
    .order('event_date', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(events || []);
}

// POST: add a new event
export async function POST(request: NextRequest) {
  const serviceClient = createServiceClient();
  const body = await request.json();

  const { title, description, event_date, category, ticker_potential, source_url, memecoin_angle, conviction_level } = body;

  if (!title || !event_date || !category) {
    return NextResponse.json({ error: 'title, event_date, and category are required' }, { status: 400 });
  }

  const { data, error } = await serviceClient.from('upcoming_events').insert({
    title,
    description: description || null,
    event_date,
    category,
    ticker_potential: ticker_potential || null,
    source_url: source_url || null,
    memecoin_angle: memecoin_angle || null,
    conviction_level: conviction_level || 5,
    status: 'upcoming',
  }).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
