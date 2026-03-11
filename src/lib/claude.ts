import Anthropic from '@anthropic-ai/sdk';
import type { ClaudeAnalysis } from './types';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
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
        content: `You are a memecoin narrative analyst. Analyze this news article and return ONLY a valid JSON object. No preamble, no markdown, no backticks. Raw JSON only.

ARTICLE TITLE: ${title}
SOURCE: ${source}
BODY: ${truncatedBody}

Return exactly this JSON structure:
{
  "memecoin_score": 0-100,
  "virality_score": 0-100,
  "visual_score": 0-100,
  "lore_score": 0-100,
  "shillability_score": 0-100,
  "simplicity_score": 0-100,
  "controversy_score": 0-100,
  "concise_summary": "one sentence max",
  "why_interesting": "why this has memecoin potential",
  "key_entities": ["array of animals/people/objects/places"],
  "emotional_profile": ["array from: funny, shocking, adorable, bizarre, heroic, dystopian, rebellious, mysterious"],
  "mascot_potential": "description or null",
  "suggested_tickers": ["array of 3 max eg $PUNCH"],
  "suggested_names": ["array of 2-3 coin names"],
  "suggested_pitch": "one line pitch max 10 words",
  "ct_shill_angle": "how to post this on crypto twitter",
  "strengths": ["array of 2-3 strengths"],
  "weaknesses": ["array of 2-3 weaknesses"],
  "verdict": "one of: ignore | weak candidate | watchlist | strong candidate | top memecoin candidate"
}

SCORING RULES:
- Score HIGH for: strange, adorable, symbolic, rebellious, underdog story, iconic visual, easy mascot, one-sentence explainable, emotionally charged, viral momentum
- Score LOW for: corporate announcements, dry technical news, no character or mascot, hard to explain, low visual potential
- 90+ ONLY if: strong emotion + clear mascot + pitch under 10 words + viral right now`,
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
