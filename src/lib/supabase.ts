import { createClient } from '@supabase/supabase-js';

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder';

// Client-side Supabase client (uses anon key)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY
);

// Server-side Supabase client (uses service key for full access)
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL,
    process.env.SUPABASE_SERVICE_KEY || PLACEHOLDER_KEY
  );
}
