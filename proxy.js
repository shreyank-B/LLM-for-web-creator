/**
 * ARCA Local Proxy Server
 * Forwards AI requests server-side to bypass browser CORS restrictions.
 * Supports: OpenAI, Groq, and Gemini (Streaming enabled)
 * Run: node proxy.js
 */
const http = require('http');
const https = require('https');

const PORT = 3001;

const server = http.createServer((req, res) => {
    // CORS configuration
                                   res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-OpenAI-Key, X-Groq-Key, X-Gemini-Key');

                                   // Handle preflight options
                                   if (req.method === 'OPTIONS') {
                                         res.statusCode = 204;
                                         return res.end();
                                   }

                                   // Determine provider from URL or path
                                   const url = new URL(req.url, `http://${req.headers.host}`);
    const provider = url.searchParams.get('provider') || (req.url.includes('groq') ? 'groq' : req.url.includes('openai') ? 'openai' : 'gemini');

                                   let targetHost = '';
    let targetPath = '';
    let apiKey = '';

                                   if (provider === 'groq') {
                                         targetHost = 'api.groq.com';
                                         targetPath = '/openai/v1/chat/completions';
                                         apiKey = req.headers['x-groq-key'];
                                   } else if (provider === 'openai') {
                                         targetHost = 'api.openai.com';
                                         targetPath = '/v1/chat/completions';
                                         apiKey = req.headers['x-openai-key'];
                                   } else {
                                         // Gemini
      const isStream = url.searchParams.get('stream') === 'true';
                                         const method = isStream ? 'streamGenerateContent' : 'generateContent';
                                         apiKey = req.headers['x-gemini-key'];
                                         targetHost = 'generativelanguage.googleapis.com';
                                         targetPath = `/v1beta/models/gemini-2.0-flash:${method}?key=${apiKey}${isStream ? '&alt=sse' : ''}`;
                                   }

                                   if (!apiKey) {
                                         res.statusCode = 400;
                                         res.setHeader('Content-Type', 'application/json');
                                         return res.end(JSON.stringify({ error: `Missing API key for ${provider}` }));
                                   }

                                   // Read request body
                                   let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
          const options = {
                  hostname: targetHost,
                  port: 443,
                  path: targetPath,
                  method: 'POST',
                  headers: {
                            'Content-Type': 'application/json',
                  },
          };
                                                                                                                
               if (provider !== 'gemini') {
                 options.headers['Authorization'] = `Bearer ${apiKey}`;
               }

               const proxyReq = https.request(options, (proxyRes) => {
                       res.writeHead(proxyRes.statusCode, {
                                 ...proxyRes.headers,
                                 'Access-Control-Allow-Origin': '*',
                       });
                        proxyRes.pipe(res);
});

               proxyReq.on('error', (e) => {
                       console.error('Proxy Error:', e.message);
                       res.statusCode = 500;
                       res.end(JSON.stringify({ error: e.message }));
               });

               proxyReq.write(body);
          proxyReq.end();
    });
});

server.listen(PORT, () => {
    console.log(`ARCA Unified Proxy running at http://localhost:${PORT}`);
    console.log(`   Supports: Google Gemini, OpenAI, Groq`);
});
