// Netlify Function: Chat proxy to OpenAI (no API key in the browser)
// Usage: POST /.netlify/functions/chat with JSON { messages: [{role, content}, ...] }

const allowed = process.env.ALLOWED_ORIGIN || "*";
function corsHeaders(origin = allowed) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: "Missing OPENAI_API_KEY" }) };
  }

  try {
    if ((event.body || "").length > 64 * 1024) {
      return { statusCode: 413, headers: corsHeaders(), body: JSON.stringify({ error: "Payload too large" }) };
    }
    const { messages } = JSON.parse(event.body || "{}");
    if (!Array.isArray(messages) || messages.length === 0) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: "Missing messages array" }) };
    }

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.3,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return { statusCode: resp.status, headers: corsHeaders(), body: JSON.stringify({ error: `OpenAI error: ${errText}` }) };
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content ?? "";

    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ content: reply }) };
  } catch (e) {
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: `Server error: ${e.message}` }) };
  }
};
