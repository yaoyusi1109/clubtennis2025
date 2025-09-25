// Simple health check for functions
const allowed = process.env.ALLOWED_ORIGIN || "*";
const headers = {
  "Access-Control-Allow-Origin": allowed,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }
  const ok = !!process.env.OPENAI_API_KEY;
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok, message: ok ? "functions ok" : "OPENAI_API_KEY not set" }),
  };
};
