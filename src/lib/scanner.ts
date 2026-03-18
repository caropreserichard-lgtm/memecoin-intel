import { createServiceClient } from '@/lib/supabase';
import { fetchFromRSS, fetchFromScraping } from '@/lib/fetcher';
import { analyzeArticle } from '@/lib/claude';
import { sendTelegramAlert } from '@/lib/telegram';
import type { Source } from '@/lib/types';

export interface ScanResult {
  scanned: number;
  new: number;
  analyzed: number;
  highScore: number;
  errors: number;
  errorDetails: string[];
}

export async function runScan(): Promise<ScanResult> {
  const supabase = createServiceClient();
  const result: ScanResult = { scanned: 0, new: 0, analyzed: 0, highScore: 0, errors: 0, errorDetails: [] };

  if (!process.env.CLAUDE_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    result.errors = 1;
    result.errorDetails.push('ANTHROPIC_API_KEY is not set');
    return result;
  }

  const { data: sources, error: sourcesError } = await supabase
    .from('sources')
    .select('*')
    .eq('active', true);

  if (sourcesError || !sources) {
    result.errors = 1;
    result.errorDetails.push('Failed to fetch sources');
    return result;
  }

  // Shuffle sources so every source gets a fair chance within the timeout
  const shuffledSources = [...(sources as Source[])].sort(() => Math.random() - 0.5);

  // Fetch all RSS feeds in parallel first (fast), then analyze sequentially (slow)
  const allArticles: { source: Source; article: { title: string; url: string; published_at: string | null; body_text: string } }[] = [];

  await Promise.all(
    shuffledSources.map(async (source) => {
      try {
        console.log(`[SCAN] Fetching ${source.name} (${source.rss_url || 'scraping'})...`);
        const articles = source.use_scraping
          ? await fetchFromScraping(source)
          : await fetchFromRSS(source);

        console.log(`[SCAN] ${source.name}: got ${articles.length} articles`);
        result.scanned += articles.length;

        for (const article of articles) {
          allArticles.push({ source, article });
        }
      } catch (sourceError) {
        const errMsg = sourceError instanceof Error ? sourceError.message : String(sourceError);
        console.error(`[SCAN] Source error for "${source.name}":`, errMsg);
        result.errors++;
        result.errorDetails.push(`SOURCE "${source.name}": ${errMsg.slice(0, 150)}`);
      }
    })
  );

  // Pre-filter: skip obviously boring titles to save Claude API credits
  const SKIP_KEYWORDS = [
    'horoscope', 'daily forecast', 'weather forecast', 'crossword', 'sudoku',
    'best deals', 'discount code', 'coupon', 'sale now', 'affiliate',
    'sponsored', 'review:', 'buying guide', 'best indoor', 'best outdoor',
    'newsletter', 'subscribe', 'sign up', 'podcast episode',
    'transfer window', 'transfer news', 'premier league table',
    'match report', 'match preview', 'lineup', 'team news',
    'games inbox', 'reader feature', 'reader letter',
    'daily cartoon',
  ];

  const filtered = allArticles.filter(({ article }) => {
    const lower = article.title.toLowerCase();
    return !SKIP_KEYWORDS.some(kw => lower.includes(kw));
  });

  const skipped = allArticles.length - filtered.length;
  console.log(`[SCAN] Total articles collected: ${allArticles.length} from ${shuffledSources.length} sources (${skipped} pre-filtered out)`);

  // De-duplicate: only keep articles not already in DB
  const newArticles: typeof filtered = [];
  for (const item of filtered) {
    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('url', item.article.url)
      .single();

    if (!existing) newArticles.push(item);
  }

  console.log(`[SCAN] ${newArticles.length} new articles to analyze (${filtered.length - newArticles.length} already in DB)`);

  // Process ALL new articles with fail-fast on credit errors
  let creditError = false;
  for (const { source, article } of newArticles) {
    if (creditError) break;

    try {
      const analysis = await analyzeArticle(
        article.title,
        source.name,
        article.body_text
      );

      result.analyzed++;

      // Save ALL articles to DB so they don't get re-analyzed on next scan
      const { error: insertError } = await supabase.from('articles').insert({
        title: article.title,
        url: article.url,
        source_id: source.id,
        category: analysis.category || source.category,
        published_at: article.published_at,
        body_text: article.body_text.slice(0, 2000),
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
        console.error('Insert error:', insertError);
        result.errors++;
        result.errorDetails.push(`INSERT [${source.name}] "${article.title}": ${insertError.message}`);
        continue;
      }

      result.new++;

      if (analysis.memecoin_score >= 75) {
        result.highScore++;
        console.log(`[SCAN] 🔥 HIGH SCORE (${analysis.memecoin_score}): ${article.title.slice(0, 70)}`);
      } else {
        console.log(`[SCAN] ✓ saved (score ${analysis.memecoin_score}): ${article.title.slice(0, 60)}`);
      }

      if (analysis.memecoin_score >= 80) {
        await sendTelegramAlert({
          score: analysis.memecoin_score,
          title: article.title,
          source: source.name,
          category: analysis.category || source.category,
          tickers: analysis.suggested_tickers,
          pitch: analysis.suggested_pitch,
          ct_shill_angle: analysis.ct_shill_angle,
          url: article.url,
        });
      }
    } catch (analysisError) {
      const errMsg = analysisError instanceof Error ? analysisError.message : String(analysisError);

      // FAIL-FAST: if credits ran out, stop immediately instead of wasting time
      if (errMsg.includes('credit balance is too low') || errMsg.includes('insufficient_quota')) {
        console.error(`[SCAN] ❌ API CREDITS EXHAUSTED — stopping scan early`);
        creditError = true;
        result.errors++;
        result.errorDetails.push('API CREDITS EXHAUSTED: Please add credits at console.anthropic.com');
        break;
      }

      console.error(`Analysis error for "${article.title}":`, errMsg);
      result.errors++;
      result.errorDetails.push(`ANALYSIS [${source.name}] "${article.title.slice(0, 50)}": ${errMsg.slice(0, 100)}`);
    }
  }

  if (result.errorDetails.length > 10) {
    result.errorDetails = result.errorDetails.slice(0, 10);
    result.errorDetails.push(`... and ${result.errors - 10} more errors`);
  }

  return result;
}
