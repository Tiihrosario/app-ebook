const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

export function response(statusCode, data) {
  return { statusCode, headers: jsonHeaders, body: JSON.stringify(data) };
}

export function env() {
  const url = process.env.SUPABASE_URL;
  const publishable = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishable) throw new Error("Configuração do Supabase ausente.");
  return { url: url.replace(/\/$/, ""), publishable };
}

export function bearer(headers = {}) {
  const raw = headers.authorization || headers.Authorization || "";
  return raw.startsWith("Bearer ") ? raw.slice(7).trim() : "";
}

export function safeBody(event) {
  try { return JSON.parse(event.body || "{}"); } catch { return null; }
}
