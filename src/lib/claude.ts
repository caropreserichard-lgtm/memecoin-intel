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
        content: `You are an elite memecoin narrative scout for crypto twitter. Your job is to filter noise and find ONLY events with real token potential.

ARTICLE: ${title}
SOURCE: ${source}
BODY: ${truncatedBody}

Return ONLY raw JSON. No markdown, no backticks.

{"memecoin_score":0-100,"virality_score":0-100,"visual_score":0-100,"lore_score":0-100,"shillability_score":0-100,"simplicity_score":0-100,"controversy_score":0-100,"category":"animals|weird|science|viral|heroic|tech|internet-culture|event","concise_summary":"one sentence","why_interesting":"why memecoin potential","key_entities":["entities"],"emotional_profile":["emotions"],"mascot_potential":"description or null","suggested_tickers":["$TICKER"],"suggested_names":["coin names"],"suggested_pitch":"max 10 words","ct_shill_angle":"crypto twitter angle","strengths":["strengths"],"weaknesses":["weaknesses"],"verdict":"ignore|weak candidate|watchlist|strong candidate|top memecoin candidate"}

=== THE MEME-COIN CHECKLIST (article must hit 2+ to score 70+) ===

1. VISUAL ICONOGRAPHY: Is there a powerful image/video? (baby monkey hugging a toy, corgi leading a pack, neon blue pigs). If you can picture a PFP or meme from it, +20 points.

2. EMOTIONAL NARRATIVE: Does it trigger JOY, WONDER, or ABSURDITY? (capybara escaping zoo = drama + cute, bear freed from cage = justice, AI chatbot recommending rectal garlic = pure absurdity). Sad/tragic stories do NOT count.

3. TICKER POTENTIAL: Is the name short, catchy, instantly memeable? (e.g. $SAMBA the capybara, $MOMO the girlfriend, $GARLIC, $CORGI). If the ticker writes itself, +20 points.

4. EVENT TIMING: Is this tied to a MAJOR scheduled event the world is watching? (Artemis launch, SpaceX landing, major tech release, World Cup moment). Anticipation = buying pressure.

=== SCORING GUIDE ===

90-100 (TOP MEMECOIN — 1-2% of articles):
- Hits ALL 4 checklist items. The entire internet is already talking about it.
- Example: "Samba the capybara escapes zoo, city-wide manhunt goes viral" — visual (cute capybara), emotional (freedom drama), ticker ($SAMBA), timing (trending NOW).

75-89 (STRONG CANDIDATE — 5-10% of articles):
- Hits 3 of 4 checklist items. Clear memecoin potential.
- Examples: Baby titi monkey gets cuddly surrogate mom ($TITI), Corgi leads 7 lost dogs home ($CORGI), Chinese AI agent OpenClaw goes viral ($CLAW), bizarre discovery with funny name.

60-74 (WATCHLIST — maybe 10-15%):
- Hits 2 of 4 checklist items. Interesting but needs more viral momentum.
- Examples: Rare animal sighting with okay ticker, weird science headline, trending person without clear mascot.

BELOW 60 (IGNORE — 70-80% of articles):
- Hits 0-1 checklist items. Not memecoin material.

=== INSTANT SCORE BELOW 30 (hard filter) ===
- Politics, war, economy, policy updates
- Sports scores, transfers, match reports
- Product reviews, buying guides, deals, lifestyle tips
- Sad/tragic stories: deaths, heart attacks, accidents, disease warnings
- Corporate earnings, mergers, layoffs
- Generic science papers nobody will meme
- Any article that makes you feel SAD instead of EXCITED

=== CRITICAL RULES ===
- SAD = LOW SCORE. Always. Heart attacks, cancer deaths, accidents = below 30. Period.
- The TICKER TEST: If you can't imagine a $TICKER from this article, score below 50.
- The TWEET TEST: If you wouldn't quote-tweet this with rocket emojis, score below 50.
- The PFP TEST: If there's no character/animal/mascot for a profile picture, subtract 20.
- INTERNET CULTURE > traditional news. Trending memes, viral moments, absurd headlines win.
- When in doubt, score LOW. False positives waste more time than false negatives.`,
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
