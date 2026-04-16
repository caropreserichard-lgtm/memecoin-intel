require("dotenv").config({ path: ".env.local" });
const Parser = require("rss-parser");
const parser = new Parser({ timeout: 15000 });
const cheerio = require("cheerio");
const { createClient } = require("@supabase/supabase-js");
const Anthropic = require("@anthropic-ai/sdk").default;

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function testSource(sourceName) {
  console.log("Testing source:", sourceName);

  // 1. Get source from DB
  const { data: source, error: srcErr } = await sb.from("sources").select("*").eq("name", sourceName).single();
  if (srcErr || !source) {
    console.log("Source not found:", srcErr?.message);
    return;
  }
  console.log("Source found:", source.name, "| RSS:", source.rss_url, "| Active:", source.active);

  // 2. Fetch RSS
  console.log("\nFetching RSS...");
  const feed = await parser.parseURL(source.rss_url);
  console.log("Got", feed.items.length, "items");

  // 3. Process first article
  const item = feed.items[0];
  if (!item) { console.log("No items"); return; }

  console.log("\nFirst item:");
  console.log("  Title:", item.title);
  console.log("  Link:", item.link);

  // Get body text
  let bodyText = item.contentSnippet || "";
  if (item.content && !bodyText) {
    const $ = cheerio.load(item.content);
    bodyText = $.text().trim();
  }

  // Scrape if too short
  if (bodyText.length < 200 && item.link) {
    console.log("  Body too short (" + bodyText.length + "), scraping...");
    try {
      const res = await fetch(item.link, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; MemecoinIntel/1.0)" },
        signal: AbortSignal.timeout(10000),
      });
      const html = await res.text();
      const $ = cheerio.load(html);
      $("script, style, nav, header, footer, aside").remove();
      const selectors = ["article", "[role='main']", ".article-body", ".post-content", ".entry-content", "main"];
      for (const sel of selectors) {
        const text = $(sel).text().trim();
        if (text.length > 200) {
          bodyText = text.replace(/\s+/g, " ").slice(0, 3000);
          console.log("  Scraped body from <" + sel + ">: " + bodyText.length + " chars");
          break;
        }
      }
      if (bodyText.length < 200) {
        const paragraphs = $("p").map((_, el) => $(el).text().trim()).get().filter(p => p.length > 40);
        bodyText = paragraphs.join(" ").slice(0, 3000);
        console.log("  Scraped from paragraphs: " + bodyText.length + " chars");
      }
    } catch (e) {
      console.log("  Scrape error:", e.message?.slice(0, 80));
    }
  } else {
    console.log("  Body from RSS: " + bodyText.length + " chars");
  }

  // 4. Check duplicate
  const { data: existing } = await sb.from("articles").select("id").eq("url", item.link).single();
  console.log("  Already in DB:", !!existing);

  if (existing) {
    console.log("  Skipping (duplicate)");
    return;
  }

  // 5. Analyze with Claude
  console.log("\nAnalyzing with Claude...");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const truncBody = bodyText.slice(0, 2000);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `Analyze this article for memecoin potential. Return ONLY raw JSON. Title: ${item.title} Body: ${truncBody.slice(0, 500)}... Return: {"memecoin_score": 0-100, "category": "viral", "concise_summary": "one line", "verdict": "watchlist"}`
    }],
  });

  const text = response.content.find(b => b.type === "text")?.text;
  console.log("Claude response:", text?.slice(0, 200));
  console.log("\nSUCCESS - Source works end-to-end");
}

testSource("Metro UK News").catch(e => console.error("FATAL:", e.message));
