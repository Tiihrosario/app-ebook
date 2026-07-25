import { bearer, env, response, safeBody } from "./_shared.mjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") return response(405, { error: "Método não permitido." });
  const token = bearer(event.headers);
  const password = String(safeBody(event)?.password || "");
  if (!token) return response(401, { error: "Convite inválido ou expirado." });
  if (password.length < 8) return response(400, { error: "Crie uma senha com pelo menos 8 caracteres." });
  try {
    const { url, publishable } = env();
    const r = await fetch(`${url}/auth/v1/user`, {
      method: "PUT",
      headers: { apikey: publishable, authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!r.ok) return response(400, { error: "Não foi possível criar a senha. Solicite um novo convite." });
    return response(200, { ok: true });
  } catch (error) {
    console.error("set_password_error", error?.message);
    return response(500, { error: "Não foi possível criar a senha agora." });
  }
}
