export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch { return new Response('Not found', {status:404}); }
    if (/(^|\/)\./.test(pathname) || /^\/(?:scripts|tests|config|src|outputs|_private|_tmp[^/]*)(?:\/|$)/i.test(pathname) || /\.(?:md|mjs|py|toml|ya?ml)$/i.test(pathname)) {
      return new Response('Not found', {status:404, headers:{'Content-Type':'text/plain; charset=utf-8','X-Content-Type-Options':'nosniff'}});
    }
    if (pathname === '/ads.txt') {
      const upstream = await fetch('https://api.nitropay.com/v1/ads-2368.txt');
      if (!upstream.ok) return new Response('ads.txt temporarily unavailable', {status:503});
      const text = await upstream.text();
      const record = 'google.com, pub-8830315294299920, DIRECT, f08c47fec0942fa0';
      return new Response(text.trimEnd() + (text.includes(record) ? '' : '\n' + record) + '\n', {headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
    return env.ASSETS.fetch(request);
  }
};
