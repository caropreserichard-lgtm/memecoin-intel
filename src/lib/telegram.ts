interface TelegramAlert {
  score: number;
  title: string;
  source: string;
  category: string;
  tickers: string[];
  pitch: string;
  ct_shill_angle?: string;
  url: string;
}

export async function sendTelegramAlert(alert: TelegramAlert): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('Telegram credentials not configured, skipping alert');
    return;
  }

  const tickerStr = alert.tickers.join(' ');
  let message: string;

  if (alert.score >= 90) {
    message = [
      `🚨 TOP MEMECOIN CANDIDATE — ${alert.score}/100`,
      `📰 ${alert.title}`,
      `📁 ${alert.source} | ${alert.category}`,
      `💰 ${tickerStr}`,
      `🎯 ${alert.pitch}`,
      `🧠 CT: ${alert.ct_shill_angle}`,
      `🔗 ${alert.url}`,
    ].join('\n');
  } else {
    message = [
      `⚡ STRONG CANDIDATE — ${alert.score}/100`,
      `📰 ${alert.title}`,
      `📁 ${alert.source} | ${alert.category}`,
      `💰 ${tickerStr}`,
      `🎯 ${alert.pitch}`,
      `🔗 ${alert.url}`,
    ].join('\n');
  }

  const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Telegram API error:', error);
  }
}
