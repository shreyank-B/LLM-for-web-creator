export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Handle CORS preflight options
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST',
        'Access-Control-Allow-Headers': 'Content-Type, X-OpenAI-Key, X-Groq-Key',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(req.url);
  const isGroq = url.pathname.endsWith('groq') || url.searchParams.get('provider') === 'groq';

  const apiKey = isGroq ? req.headers.get('x-groq-key') : req.headers.get('x-openai-key');
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: isGroq ? 'Missing X-Groq-Key header' : 'Missing X-OpenAI-Key header' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  }

  const targetUrl = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';

  try {
    const body = await req.clone().text();

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: body,
    });

    // Stream the response directly to the client
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': response.headers.get('content-type') || 'text/event-stream',
        // Make sure caching is disabled for streaming
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}
