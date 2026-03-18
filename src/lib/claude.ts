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
        content: `You are a memecoin narrative analyst. Score this article ONLY on whether it could spawn a viral memecoin. Be VERY strict — most articles should score below 50.

ARTICLE: ${title}
SOURCE: ${source}
BODY: ${truncatedBody}

Return ONLY raw JSON. No markdown, no backticks.

{"memecoin_score":0-100,"virality_score":0-100,"visual_score":0-100,"lore_score":0-100,"shillability_score":0-100,"simplicity_score":0-100,"controversy_score":0-100,"category":"animals|weird|science|viral|crime|heroic|politics|tech","concise_summary":"one sentence","why_interesting":"why memecoin potential","key_entities":["entities"],"emotional_profile":["emotions"],"mascot_potential":"description or null","suggested_tickers":["$TICKER"],"suggested_names":["coin names"],"suggested_pitch":"max 10 words","ct_shill_angle":"crypto twitter angle","strengths":["strengths"],"weaknesses":["weaknesses"],"verdict":"ignore|weak candidate|watchlist|strong candidate|top memecoin candidate"}

WHAT SCORES 75+:
- A specific ANIMAL doing something crazy (escape, attack, rescue, rare sighting)
- A HERO saving someone (teacher stops stabber, man rescues drowning kid)
- RARE DISCOVERY (new dinosaur species, ancient fossil, deep sea creature)
- NEW AI AGENT or breakthrough tech the internet is buzzing about
- BIZARRE viral moment (man parks in all 211 spots, camel beauty contest cheating)
- Something the ENTIRE internet is talking about right now

WHAT SCORES BELOW 50 (most articles):
- Generic politics, economy, war updates, policy changes
- Sports scores, transfer rumors, match reports
- Product reviews, buying guides, lifestyle tips
- Local crime that isnt bizarre or viral
- Corporate news, earnings, mergers
- Generic science papers nobody will meme

BE STRICT. Only 10-20% of articles should score 75+. If there's no clear animal, hero, discovery, AI agent, or bizarre viral moment — score it LOW.`,
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
