require('dotenv').config({ path: '.env.local', override: true });
const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk').default;
const RSSParser = require('rss-parser');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function main() {
  // Grab a source
  const { data: source } = await supabase
    .from('sources')
    .select('*')
    .eq('name', 'ScienceAlert')
    .single();
  console.log('Source:', source.name, source.id);

  // Parse RSS
  const parser = new RSSParser();
  const feed = await parser.parseURL(source.rss_url);
  const item = feed.items[0];
  console.log('Article:', item.title);
  console.log('URL:', item.link);

  const bodyText = (item.contentSnippet || item.content || '').slice(0, 2000);
  console.log('Body length:', bodyText.length);

  // Check if exists
  const { data: existing } = await supabase
    .from('articles')
    .select('id')
    .eq('url', item.link)
    .single();
  console.log('Already exists?', existing ? 'YES' : 'NO');

  // Try Claude analysis
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  console.log('\nCalling Claude...');
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a memecoin narrative analyst. Analyze this news article and return ONLY a valid JSON object. No preamble, no markdown, no backticks. Raw JSON only.

ARTICLE TITLE: ${item.title}
SOURCE: ScienceAlert
BODY: ${bodyText}

Return exactly this JSON structure:
{
  "memecoin_score": 0,
  "virality_score": 0,
  "visual_score": 0,
  "lore_score": 0,
  "shillability_score": 0,
  "simplicity_score": 0,
  "controversy_score": 0,
  "concise_summary": "",
  "why_interesting": "",
  "key_entities": [],
  "emotional_profile": [],
  "mascot_potential": null,
  "suggested_tickers": [],
  "suggested_names": [],
  "suggested_pitch": "",
  "ct_shill_angle": "",
  "strengths": [],
  "weaknesses": [],
  "verdict": "ignore"
}`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === 'text')?.text;
  console.log('Claude raw (first 300):', text?.substring(0, 300));

  let analysis;
  try {
    analysis = JSON.parse(text);
    console.log('\nParsed OK!');
    console.log('  Score:', analysis.memecoin_score);
    console.log('  Verdict:', analysis.verdict);
    console.log('  Tickers:', analysis.suggested_tickers);
  } catch (e) {
    console.log('JSON PARSE ERROR:', e.message);
    console.log('Full response:', text);
    return;
  }

  // Try insert
  const { error: insertError } = await supabase.from('articles').insert({
    title: item.title,
    url: item.link,
    source_id: source.id,
    category: source.category,
    published_at: item.isoDate || null,
    body_text: bodyText,
    memecoin_score: analysis.memecoin_score,
    virality_score: analysis.virality_score,
    visual_score: analysis.visual_score,
    lore_score: analysis.lore_score,
    shillability_score: analysis.shillability_score,
    simplicity_score: analysis.simplicity_score,
    controversy_score: analysis.controversy_score,
    verdict: analysis.verdict,
    suggested_tickers: analysis.suggested_tickers,
    suggested_names: analysis.suggested_names,
    suggested_pitch: analysis.suggested_pitch,
    ct_shill_angle: analysis.ct_shill_angle,
    key_entities: analysis.key_entities,
    emotional_profile: analysis.emotional_profile,
    mascot_potential: analysis.mascot_potential,
    strengths: analysis.strengths,
    weaknesses: analysis.weaknesses,
    concise_summary: analysis.concise_summary,
    why_interesting: analysis.why_interesting,
  });

  if (insertError) {
    console.log('\nINSERT ERROR:', JSON.stringify(insertError, null, 2));
  } else {
    console.log('\nINSERT OK! Article saved to Supabase.');
  }
}

main().catch((e) => console.log('FATAL:', e.message, e.stack));
