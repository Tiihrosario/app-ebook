import { env, response, safeBody } from "./_shared.mjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") return response(405, { error: "Método não permitido." });
  const body = safeBody(event);
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  if (!email || !password) return response(400, { error: "Informe e-mail e senha." });
  try {
    const { url, publishable } = env();
    const r = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: publishable, "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) return response(401, { error: "E-mail ou senha inválidos." });
    return response(200, {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      user: { email: data.user?.email, name: data.user?.user_metadata?.name || email.split("@")[0] },
    });
  } catch (error) {
    console.error("login_error", error?.message);
    return response(500, { error: "Não foi possível entrar agora." });
  }
}
