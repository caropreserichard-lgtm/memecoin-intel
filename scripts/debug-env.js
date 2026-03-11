require('dotenv').config({ path: '.env.local' });

const keys = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_KEY', 'ANTHROPIC_API_KEY', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'CRON_SECRET'];

for (const key of keys) {
  const val = process.env[key] || '';
  console.log(key + ':', val ? val.substring(0, 15) + '... (len=' + val.length + ')' : 'MISSING');
}
