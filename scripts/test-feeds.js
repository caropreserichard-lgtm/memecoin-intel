require("dotenv").config({ path: ".env.local" });
const Parser = require("rss-parser");
const parser = new Parser({ timeout: 15000 });
const { createClient } = require("@supabase/supabase-js");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function test() {
  // Get all new sources
  const names = ["Metro UK News", "Metro UK Weird", "NY Post Trending", "Daily Mail News", "Daily Mail Weird"];
  const { data: sources } = await sb.from("sources").select("*").in("name", names);

  for (const src of sources || []) {
    console.log("\n--- " + src.name + " ---");
    console.log("RSS:", src.rss_url);
    console.log("Active:", src.active);
    console.log("Use scraping:", src.use_scraping);

    if (!src.rss_url && !src.use_scraping) {
      console.log("PROBLEM: No RSS URL and scraping is off");
      continue;
    }

    if (src.rss_url) {
      try {
        const feed = await parser.parseURL(src.rss_url);
        console.log("Items:", feed.items?.length || 0);
        if (feed.items && feed.items[0]) {
          console.log("Sample:", feed.items[0].title?.slice(0, 80));
          console.log("Link:", feed.items[0].link);
        }
      } catch (e) {
        console.log("RSS ERROR:", e.message?.slice(0, 100));
      }
    }
  }
}
test();
