import { createServiceClient } from '@/lib/supabase';
import { fetchFromRSS, fetchFromScraping } from '@/lib/fetcher';
import { analyzeArticle } from '@/lib/claude';
import { sendTelegramAlert } from '@/lib/telegram';
import type { Source } from '@/lib/types';

export interface ScanResult {
  scanned: number;
  new: number;
  errors: number;
  errorDetails: string[];
}

export async function runScan(): Promise<ScanResult> {
  const supabase = createServiceClient();
  const result: ScanResult = { scanned: 0, new: 0, errors: 0, errorDetails: [] };

  if (!process.env.ANTHROPIC_API_KEY) {
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

  for (const source of sources as Source[]) {
    try {
      const articles = source.use_scraping
        ? await fetchFromScraping(source)
        : await fetchFromRSS(source);

      result.scanned += articles.length;

      for (const article of articles) {
        const { data: existing } = await supabase
          .from('articles')
          .select('id')
          .eq('url', article.url)
          .single();

        if (existing) continue;

        try {
          const analysis = await analyzeArticle(
            article.title,
            source.name,
            article.body_text
          );

          const { error: insertError } = await supabase.from('articles').insert({
            title: article.title,
            url: article.url,
            source_id: source.id,
            category: source.category,
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

          if (analysis.memecoin_score >= 80) {
            await sendTelegramAlert({
              score: analysis.memecoin_score,
              title: article.title,
              source: source.name,
              category: source.category,
              tickers: analysis.suggested_tickers,
              pitch: analysis.suggested_pitch,
              ct_shill_angle: analysis.ct_shill_angle,
              url: article.url,
            });
          }
        } catch (analysisError) {
          const errMsg = analysisError instanceof Error ? analysisError.message : String(analysisError);
          console.error(`Analysis error for "${article.title}":`, errMsg);
          result.errors++;
          result.errorDetails.push(`ANALYSIS [${source.name}] "${article.title.slice(0, 50)}": ${errMsg.slice(0, 100)}`);
        }
      }
    } catch (sourceError) {
      const errMsg = sourceError instanceof Error ? sourceError.message : String(sourceError);
      console.error(`Source error for "${source.name}":`, errMsg);
      result.errors++;
      result.errorDetails.push(`SOURCE "${source.name}": ${errMsg.slice(0, 150)}`);
    }
  }

  if (result.errorDetails.length > 10) {
    result.errorDetails = result.errorDetails.slice(0, 10);
    result.errorDetails.push(`... and ${result.errors - 10} more errors`);
  }

  return result;
}
