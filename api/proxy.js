module.exports = async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-OpenAI-Key, X-Groq-Key, X-Gemini-Key');
    if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
    if (req.method !== 'POST') { res.statusCode = 405; res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ error: 'Method not allowed' })); }
    const url = new URL(req.url, `http://${req.headers.host}`);
    const provider = url.searchParams.get('provider') || (req.url.includes('groq') ? 'groq' : req.url.includes('openai') ? 'openai' : 'gemini');
    let targetUrl = '';
    let apiKey = '';
    if (provider === 'groq') { targetUrl = 'https://api.groq.com/openai/v1/chat/completions'; apiKey = req.headers['x-groq-key']; }
    else if (provider === 'openai') { targetUrl = 'https://api.openai.com/v1/chat/completions'; apiKey = req.headers['x-openai-key']; }
    else { const isStream = url.searchParams.get('stream') === 'true'; const method = isStream ? 'streamGenerateContent' : 'generateContent'; apiKey = req.headers['x-gemini-key']; targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:${method}?key=${apiKey}${isStream ? '&alt=sse' : ''}`; }
    if (!apiKey) { res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ error: `Missing API key for ${provider}` })); }
    try {
          const fetchOptions = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body) };
          if (provider !== 'gemini') { fetchOptions.headers['Authorization'] = `Bearer ${apiKey}`; }
          const fetchRes = await fetch(targetUrl, fetchOptions);
          res.statusCode = fetchRes.status;
          res.setHeader('Content-Type', fetchRes.headers.get('content-type') || 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache, no-transform');
          res.setHeader('Connection', 'keep-alive');
          if (!fetchRes.ok) { const errText = await fetchRes.text(); return res.end(errText); }
          if (fetchRes.body) { const reader = fetchRes.body.getReader(); const decoder = new TextDecoder(); while (true) { const { done, value } = await reader.read(); if (done) break; res.write(decoder.decode(value)); } res.end(); }
          else { res.end(); }
    } catch (err) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ error: err.message })); }
};
