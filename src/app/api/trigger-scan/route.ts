import { NextResponse } from 'next/server';
import { runScan } from '@/lib/scanner';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await runScan();
  return NextResponse.json(result);
}
