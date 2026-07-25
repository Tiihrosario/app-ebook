import { bearer, env, response } from "./_shared.mjs";

export async function handler(event) {
  const token = bearer(event.headers);
  if (!token) return response(401, { error: "Sessão ausente." });
  try {
    const { url, publishable } = env();
    const r = await fetch(`${url}/auth/v1/user`, { headers: { apikey: publishable, authorization: `Bearer ${token}` } });
    const user = await r.json();
    if (!r.ok) return response(401, { error: "Sessão inválida ou acesso bloqueado." });
    return response(200, { user: { email: user.email, name: user.user_metadata?.name || user.email?.split("@")[0] } });
  } catch (error) {
    console.error("session_error", error?.message);
    return response(500, { error: "Não foi possível validar o acesso." });
  }
}
