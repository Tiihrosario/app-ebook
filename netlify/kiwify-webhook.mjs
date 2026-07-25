import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { response, safeBody } from "./_shared.mjs";

function same(a, b) {
  const x = Buffer.from(String(a || ""));
  const y = Buffer.from(String(b || ""));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function pick(obj, paths) {
  for (const path of paths) {
    let value = obj;
    for (const key of path.split(".")) value = value?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
}

function normalized(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_");
}

async function findUser(admin, email) {
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const user = data.users.find((item) => item.email?.toLowerCase() === email);
    if (user || data.users.length < 1000) return user;
  }
}

export async function handler(event) {
  if (event.httpMethod !== "POST") return response(405, { error: "Método não permitido." });
  const expected = process.env.KIWIFY_WEBHOOK_TOKEN;
  const received = event.queryStringParameters?.token;
  if (!expected || !same(expected, received)) return response(401, { error: "Webhook não autorizado." });

  const body = safeBody(event);
  if (!body) return response(400, { error: "JSON inválido." });
  const productId = String(pick(body, ["Product.product_id", "product.product_id", "product.id", "order.product_id", "product_id"]) || "");
  if (process.env.KIWIFY_PRODUCT_ID && productId !== process.env.KIWIFY_PRODUCT_ID) return response(202, { ignored: "produto" });

  const email = String(pick(body, ["Customer.email", "customer.email", "order.Customer.email", "order.customer.email", "buyer.email", "email"]) || "").trim().toLowerCase();
  const name = String(pick(body, ["Customer.full_name", "Customer.name", "customer.full_name", "customer.name", "order.Customer.full_name", "buyer.name"]) || "").trim();
  const kind = normalized(pick(body, ["webhook_event_type", "event", "event_type", "order_status", "status", "order.status"]));
  if (!email) return response(400, { error: "E-mail do comprador ausente." });

  // A Kiwify usa endereços reservados/fictícios ao acionar "Testar Webhook".
  // Confirmamos o recebimento, mas não tentamos criar um usuário ou enviar convite.
  const domain = email.split("@")[1] || "";
  if (["example.com", "example.org", "example.net"].includes(domain)) {
    return response(200, { ok: true, action: "test_received" });
  }

  const grant = ["order_approved", "purchase_approved", "compra_aprovada", "venda_aprovada", "approved", "paid", "subscription_renewed", "assinatura_renovada"].some((x) => kind.includes(x));
  const revoke = ["refund", "refunded", "reembolso", "chargeback", "subscription_canceled", "subscription_cancelled", "assinatura_cancelada"].some((x) => kind.includes(x));
  if (!grant && !revoke) return response(202, { ignored: "evento", event: kind });

  const url = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return response(500, { error: "Supabase não configurado." });
  const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

  try {
    const user = await findUser(admin, email);
    if (grant) {
      if (user) {
        const { error } = await admin.auth.admin.updateUserById(user.id, { ban_duration: "none", user_metadata: { ...user.user_metadata, name: name || user.user_metadata?.name, source: "kiwify" } });
        if (error) throw error;
        return response(200, { ok: true, action: "access_restored" });
      }
      const { error } = await admin.auth.admin.inviteUserByEmail(email, { data: { name, source: "kiwify" }, redirectTo: "https://codigoapp.netlify.app/" });
      if (error) throw error;
      return response(200, { ok: true, action: "invite_sent" });
    }
    if (user) {
      const { error } = await admin.auth.admin.updateUserById(user.id, { ban_duration: "876000h" });
      if (error) throw error;
    }
    return response(200, { ok: true, action: "access_revoked" });
  } catch (error) {
    console.error("kiwify_webhook_error", error?.message);
    return response(500, { error: "Falha ao processar o acesso." });
  }
}
