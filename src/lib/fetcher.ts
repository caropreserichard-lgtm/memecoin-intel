import RSSParser from 'rss-parser';
import * as cheerio from 'cheerio';
import type { Source } from './types';

const rssParser = new RSSParser();

interface FetchedArticle {
  title: string;
  url: string;
  published_at: string | null;
  body_text: string;
}

export async function fetchFromRSS(source: Source): Promise<FetchedArticle[]> {
  if (!source.rss_url) return [];

  const feed = await rssParser.parseURL(source.rss_url);
  const articles: FetchedArticle[] = [];

  for (const item of feed.items.slice(0, 15)) {
    if (!item.link || !item.title) continue;

    let bodyText = '';
    if (item.contentSnippet) {
      bodyText = item.contentSnippet;
    } else if (item.content) {
      const $ = cheerio.load(item.content);
      bodyText = $.text().trim();
    }

    // Try to fetch full article body if snippet is too short
    if (bodyText.length < 200) {
      try {
        const fullBody = await scrapeArticleBody(item.link);
        if (fullBody.length > bodyText.length) {
          bodyText = fullBody;
        }
      } catch {
        // Keep what we have
      }
    }

    articles.push({
      title: item.title,
      url: item.link,
      published_at: item.isoDate || item.pubDate || null,
      body_text: bodyText.slice(0, 3000),
    });
  }

  return articles;
}

export async function fetchFromScraping(source: Source): Promise<FetchedArticle[]> {
  const response = await fetch(source.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MemecoinIntel/1.0)',
    },
  });
  const html = await response.text();
  const $ = cheerio.load(html);
  const articles: FetchedArticle[] = [];
  const seen = new Set<string>();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    const fullUrl = href.startsWith('http') ? href : new URL(href, source.url).toString();

    // Filter for article-like URLs
    if (
      seen.has(fullUrl) ||
      fullUrl.includes('#') ||
      fullUrl.includes('?') ||
      fullUrl.endsWith('.jpg') ||
      fullUrl.endsWith('.png') ||
      fullUrl === source.url ||
      fullUrl === source.url + '/'
    ) return;

    const linkText = $(el).text().trim();
    if (linkText.length < 20 || linkText.length > 300) return;

    seen.add(fullUrl);
    articles.push({
      title: linkText,
      url: fullUrl,
      published_at: null,
      body_text: '',
    });
  });

  // Fetch body for top articles
  const topArticles = articles.slice(0, 10);
  for (const article of topArticles) {
    try {
      article.body_text = await scrapeArticleBody(article.url);
    } catch {
      // Skip if scraping fails
    }
  }

  return topArticles.filter((a) => a.body_text.length > 100);
}

async function scrapeArticleBody(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MemecoinIntel/1.0)',
      },
      signal: controller.signal,
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .ad, .sidebar, .comments, .social-share').remove();

    // Try common article selectors
    const selectors = ['article', '[role="main"]', '.article-body', '.post-content', '.entry-content', 'main'];
    for (const selector of selectors) {
      const text = $(selector).text().trim();
      if (text.length > 200) {
        return text.replace(/\s+/g, ' ').slice(0, 3000);
      }
    }

    // Fallback to paragraphs
    const paragraphs = $('p')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter((p) => p.length > 40);

    return paragraphs.join(' ').slice(0, 3000);
  } finally {
    clearTimeout(timeout);
  }
}
