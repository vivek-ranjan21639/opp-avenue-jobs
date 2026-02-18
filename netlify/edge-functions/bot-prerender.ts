const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'slurp',        // Yahoo
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'sogou',
  'exabot',
  'facebot',
  'facebookexternalhit',
  'ia_archiver',  // Alexa
  'twitterbot',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest',
  'applebot',
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'seznambot',
  'petalbot',
  'screaming frog',
  'rogerbot',
  'dotbot',
  'gigabot',
  // Prerender/SSR checker tools
  'prerender',
  'headlesschrome',
  'lighthouse',
  'pagespeed',
  'w3c_validator',
  'whatsapp',
  'slack',
  'telegram',
  'discord',
];

const SUPABASE_PRERENDER_URL = 'https://nudjyemktgioxmxwnxev.supabase.co/functions/v1/prerender';

export default async function handler(request: Request, context: any) {
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  
  // Check if it's a bot
  const isBot = BOT_USER_AGENTS.some(bot => userAgent.includes(bot));
  
  if (!isBot) {
    // Normal user — serve the SPA
    return context.next();
  }

  // It's a bot — fetch pre-rendered HTML from Supabase edge function
  const url = new URL(request.url);
  const path = url.pathname;

  // Skip asset requests
  if (
    path.startsWith('/assets/') ||
    path.startsWith('/favicon') ||
    path.endsWith('.js') ||
    path.endsWith('.css') ||
    path.endsWith('.png') ||
    path.endsWith('.jpg') ||
    path.endsWith('.svg') ||
    path.endsWith('.ico') ||
    path.endsWith('.xml') ||
    path.endsWith('.json') ||
    path.endsWith('.txt')
  ) {
    return context.next();
  }

  try {
    const prerenderUrl = `${SUPABASE_PRERENDER_URL}?path=${encodeURIComponent(path)}`;
    
    const response = await fetch(prerenderUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Prerender failed for ${path}: ${response.status}`);
      return context.next();
    }

    const html = await response.text();

    return new Response(html, {
      status: response.status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'X-Prerendered': 'true',
      },
    });
  } catch (error) {
    console.error(`Prerender error for ${path}:`, error);
    // Fallback to SPA on error
    return context.next();
  }
}

export const config = {
  path: "/*",
};
