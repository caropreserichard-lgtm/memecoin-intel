import Anthropic from '@anthropic-ai/sdk';
import type { ClaudeAnalysis } from './types';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('CLAUDE_API_KEY / ANTHROPIC_API_KEY is not set');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export async function analyzeArticle(
  title: string,
  source: string,
  body: string
): Promise<ClaudeAnalysis> {
  const truncatedBody = body.slice(0, 2000);

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a memecoin narrative analyst for crypto twitter degens. Score this article ONLY on whether it could spawn a viral memecoin that people would actually buy. Be EXTREMELY strict — most articles should score below 40.

ARTICLE: ${title}
SOURCE: ${source}
BODY: ${truncatedBody}

Return ONLY raw JSON. No markdown, no backticks.

{"memecoin_score":0-100,"virality_score":0-100,"visual_score":0-100,"lore_score":0-100,"shillability_score":0-100,"simplicity_score":0-100,"controversy_score":0-100,"category":"animals|weird|science|viral|crime|heroic|politics|tech|internet-culture","concise_summary":"one sentence","why_interesting":"why memecoin potential","key_entities":["entities"],"emotional_profile":["emotions"],"mascot_potential":"description or null","suggested_tickers":["$TICKER"],"suggested_names":["coin names"],"suggested_pitch":"max 10 words","ct_shill_angle":"crypto twitter angle","strengths":["strengths"],"weaknesses":["weaknesses"],"verdict":"ignore|weak candidate|watchlist|strong candidate|top memecoin candidate"}

WHAT SCORES 85+  (TOP MEMECOIN — only 2-5% of articles):
- VIRAL INTERNET SENSATION — a person, animal, or character the ENTIRE internet is obsessing over right now (e.g. a celebrity's pet with a funny name going viral, a streamer's girlfriend everyone is memeing)
- ABSURD HEADLINE that reads like a meme itself (e.g. "rectal garlic for immune support", "man parks in all 211 spots")
- NEW AI AGENT going mega-viral with a catchy name people are memeing

WHAT SCORES 70-84 (STRONG — about 10% of articles):
- Specific ANIMAL doing something crazy/cute that went viral (escape, attack, rare sighting)
- BIZARRE discovery with meme potential (new dinosaur species, deep sea creature with funny look)
- Internet celebrity or trending person everyone is talking about
- Drug/treatment breakthrough with a catchy or absurd angle people would meme
- Viral moment with a CLEAR mascot or character people can rally behind

WHAT SCORES 40-69 (WEAK — filler, not worth tracking):
- Mildly interesting science that nobody will actually meme
- Sad/tragic stories (heart attacks, deaths, accidents) — these are NOT memecoin material even if someone acted heroically
- Generic weird news that isn't actually viral
- Celebrity news that isn't a specific viral moment

WHAT SCORES BELOW 40 (IGNORE — most articles):
- Generic politics, economy, war, policy
- Sports scores, transfers, match reports
- Product reviews, buying guides, lifestyle tips
- Local crime, accidents, health warnings
- Corporate news, earnings, mergers
- Any sad/depressing story — memecoins need JOY and ABSURDITY, not tragedy

CRITICAL RULES:
- SAD STORIES ALWAYS SCORE BELOW 40. A dad having a heart attack is NOT memecoin material. A kid saving someone is touching but NOT a memecoin.
- The article must make you LAUGH, feel AMAZED, or think "I need to buy that coin NOW"
- If you wouldn't tweet about it with a rocket emoji, score it below 50
- Internet trends, viral characters, and absurd moments > sad heroics
- Only 10-15% of ALL articles should score 70+`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  const parsed = JSON.parse(textBlock.text) as ClaudeAnalysis;
  return parsed;
}
