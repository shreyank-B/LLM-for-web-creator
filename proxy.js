/**
 * ARCA Local Proxy Server
 * Forwards OpenAI requests server-side to bypass browser CORS restrictions.
 * Run: node proxy.js
 * Then in index.html the callOpenAI function targets http://localhost:3001/openai
 */
const http = require('http');
const https = require('https');

const PORT = 3001;

const server = http.createServer((req, res) => {
  // Allow CORS from localhost
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-OpenAI-Key, X-Groq-Key');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'POST' || (req.url !== '/openai' && req.url !== '/groq')) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const isGroq = req.url === '/groq';
  const apiKey = isGroq ? req.headers['x-groq-key'] : req.headers['x-openai-key'];
  if (!apiKey) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: isGroq ? 'Missing X-Groq-Key header' : 'Missing X-OpenAI-Key header' }));
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const options = {
      hostname: isGroq ? 'api.groq.com' : 'api.openai.com',
      port: 443,
      path: isGroq ? '/openai/v1/chat/completions' : '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    };


    const proxyReq = https.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': proxyRes.headers['content-type'] || 'text/event-stream',
        'Access-Control-Allow-Origin': '*',
      });
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (e) => {
      console.error('Proxy error:', e.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    });

    proxyReq.write(body);
    proxyReq.end();
  });
});

server.listen(PORT, () => {
  console.log(`✅ ARCA Proxy running at http://localhost:${PORT}`);
  console.log(`   OpenAI requests → http://localhost:${PORT}/openai`);
});
