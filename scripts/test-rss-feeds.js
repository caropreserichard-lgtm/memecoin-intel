#!/usr/bin/env node

const https = require('https');
const http = require('http');

const feeds = [
  // MyModernMet
  { name: 'MyModernMet /feed/', url: 'https://mymodernmet.com/feed/' },
  { name: 'MyModernMet /rss', url: 'https://mymodernmet.com/rss' },
  { name: 'MyModernMet /index.xml', url: 'https://mymodernmet.com/index.xml' },
  // The Guardian
  { name: 'Guardian World', url: 'https://www.theguardian.com/world/rss' },
  { name: 'Guardian Environment', url: 'https://www.theguardian.com/environment/rss' },
  { name: 'Guardian Animals', url: 'https://www.theguardian.com/world/animals/rss' },
  // AfricaNews
  { name: 'AfricaNews /feed/', url: 'https://www.africanews.com/feed/' },
  { name: 'AfricaNews /rss', url: 'https://www.africanews.com/rss' },
  // Gigazine
  { name: 'Gigazine EN', url: 'https://gigazine.net/gsc_news/en/rss' },
  { name: 'Gigazine JP RSS 2.0', url: 'https://gigazine.net/news/rss_2.0/' },
  // Bored Panda
  { name: 'Bored Panda /feed/', url: 'https://www.boredpanda.com/feed/' },
  { name: 'Bored Panda /rss', url: 'https://www.boredpanda.com/rss' },
  // UPI
  { name: 'UPI Odd News rss', url: 'https://rss.upi.com/news/odd_news/rss' },
  { name: 'UPI Odd News /feed/', url: 'https://www.upi.com/Odd_News/feed/' },
  // Atlas Obscura
  { name: 'Atlas Obscura', url: 'https://www.atlasobscura.com/feeds/latest' },
];

function fetchUrl(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RSSReader/1.0)' },
      timeout: 15000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('/')) {
          const u = new URL(url);
          redirectUrl = u.origin + redirectUrl;
        }
        return fetchUrl(redirectUrl, maxRedirects - 1).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function countItems(xml) {
  const itemMatches = xml.match(/<item[\s>]/gi);
  const entryMatches = xml.match(/<entry[\s>]/gi);
  return (itemMatches ? itemMatches.length : 0) + (entryMatches ? entryMatches.length : 0);
}

function extractTitles(xml, max = 5) {
  const titles = [];
  // Match <item>...<title>...</title>...</item> patterns
  const itemRegex = /<item[^>]*>[\s\S]*?<\/item>/gi;
  const items = xml.match(itemRegex) || [];
  // Also try <entry> for Atom feeds
  const entryRegex = /<entry[^>]*>[\s\S]*?<\/entry>/gi;
  const entries = xml.match(entryRegex) || [];
  const allItems = [...items, ...entries];

  for (const item of allItems.slice(0, max)) {
    const titleMatch = item.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
    if (titleMatch) titles.push(titleMatch[1].trim());
  }
  return titles;
}

function isRSS(body) {
  const lower = body.substring(0, 1000).toLowerCase();
  return lower.includes('<rss') || lower.includes('<feed') || lower.includes('<atom') || lower.includes('<?xml');
}

function getChannelTitle(xml) {
  // Get channel-level title (not item title)
  const channelMatch = xml.match(/<channel[^>]*>[\s\S]*?<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
  if (channelMatch) return channelMatch[1].trim();
  // Atom feed title
  const feedTitleMatch = xml.match(/<feed[^>]*>[\s\S]*?<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
  if (feedTitleMatch) return feedTitleMatch[1].trim();
  return 'N/A';
}

async function testFeed(feed) {
  try {
    const result = await fetchUrl(feed.url);
    const contentType = result.headers['content-type'] || 'unknown';
    const validRSS = isRSS(result.body);
    const itemCount = validRSS ? countItems(result.body) : 0;
    const titles = validRSS ? extractTitles(result.body) : [];
    const channelTitle = validRSS ? getChannelTitle(result.body) : 'N/A';

    return {
      name: feed.name,
      url: feed.url,
      status: result.statusCode,
      contentType: contentType.split(';')[0].trim(),
      validRSS,
      itemCount,
      channelTitle,
      titles,
      bodySize: result.body.length,
    };
  } catch (err) {
    return {
      name: feed.name,
      url: feed.url,
      status: 'ERROR',
      error: err.message,
      validRSS: false,
      itemCount: 0,
    };
  }
}

async function main() {
  console.log('Testing RSS Feeds...\n');
  console.log('='.repeat(80));

  const results = await Promise.all(feeds.map(testFeed));

  for (const r of results) {
    const statusIcon = r.validRSS ? 'VALID' : 'FAIL';
    console.log(`\n[${statusIcon}] ${r.name}`);
    console.log(`  URL: ${r.url}`);
    console.log(`  HTTP Status: ${r.status}`);
    if (r.error) console.log(`  Error: ${r.error}`);
    if (r.contentType) console.log(`  Content-Type: ${r.contentType}`);
    if (r.validRSS) {
      console.log(`  Channel: ${r.channelTitle}`);
      console.log(`  Items: ${r.itemCount}`);
      console.log(`  Body Size: ${(r.bodySize / 1024).toFixed(1)} KB`);
      if (r.titles.length > 0) {
        console.log(`  Sample Titles:`);
        r.titles.forEach((t, i) => console.log(`    ${i+1}. ${t}`));
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\nSUMMARY - Working Feeds:');
  const working = results.filter(r => r.validRSS);
  const failing = results.filter(r => !r.validRSS);

  working.forEach(r => {
    console.log(`  [OK] ${r.name} - ${r.itemCount} items`);
  });

  if (failing.length > 0) {
    console.log('\nFailing Feeds:');
    failing.forEach(r => {
      console.log(`  [FAIL] ${r.name} - ${r.error || `HTTP ${r.status}`}`);
    });
  }
}

main().catch(console.error);
