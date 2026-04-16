require("dotenv").config({ path: ".env.local" });
const Parser = require("rss-parser");
const parser = new Parser({ timeout: 15000 });
const { createClient } = require("@supabase/supabase-js");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function debug() {
  const feeds = [
    { name: "Metro UK News", url: "https://metro.co.uk/feed/" },
    { name: "Daily Mail News", url: "https://www.dailymail.co.uk/news/index.rss" },
  ];

  for (const f of feeds) {
    console.log("\n=== " + f.name + " ===");
    const feed = await parser.parseURL(f.url);
    const first3 = feed.items.slice(0, 3);

    for (const item of first3) {
      console.log("\nTitle:", item.title ? item.title.slice(0, 80) : "MISSING");
      console.log("Link:", item.link ? item.link.slice(0, 120) : "MISSING");
      console.log("Has contentSnippet:", !!item.contentSnippet, "len:", (item.contentSnippet || "").length);
      console.log("Has content:", !!item.content, "len:", (item.content || "").length);

      // Check if URL exists in DB
      if (item.link) {
        const { data: existing } = await sb.from("articles").select("id, title").eq("url", item.link).single();
        console.log("In DB?", existing ? "YES - " + existing.title.slice(0, 50) : "NO");
      }
    }
  }
}
debug().catch(e => console.error(e));
