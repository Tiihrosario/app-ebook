# Integração Kiwify + Netlify + Supabase

## 1. Enviar ao GitHub

No repositório `app-ebook`, use **Add file → Upload files** e envie todos os itens deste pacote, mantendo as pastas:

- `index.html` (substitui o atual)
- `netlify.toml`
- `package.json`
- pasta `netlify/functions`

Confirme em **Commit changes**. O Netlify fará um novo deploy automaticamente.

## 2. Variáveis no Netlify

As três variáveis do Supabase já devem existir. Crie mais duas:

- `KIWIFY_WEBHOOK_TOKEN`: uma senha aleatória longa, somente letras e números.
- `KIWIFY_PRODUCT_ID`: ID do produto vendido na Kiwify (recomendado).

Marque **Contains secret values** para `SUPABASE_SECRET_KEY` e `KIWIFY_WEBHOOK_TOKEN`.

## 3. Criar webhook na Kiwify

Na Kiwify, abra **Apps → Webhooks → Criar webhook**.

URL (troque `SEU_TOKEN` pelo mesmo valor salvo no Netlify):

`https://codigoapp.netlify.app/api/kiwify?token=SEU_TOKEN`

Selecione o produto correto e estes eventos:

- Compra/Venda aprovada
- Reembolso
- Chargeback
- Assinatura renovada (se o produto for recorrente)
- Assinatura cancelada (se o produto for recorrente)

Salve e use **Testar webhook**. O log deve apresentar HTTP 200.

## 4. Funcionamento

- Compra aprovada: o Supabase envia um convite ao e-mail usado na compra.
- A pessoa abre o convite, cria uma senha e entra no app.
- Reembolso/chargeback: o usuário é bloqueado.
- Nova compra com o mesmo e-mail: o acesso é restaurado.

## Segurança

Nunca envie `SUPABASE_SECRET_KEY` ao GitHub ou no HTML. Se uma chave secreta aparecer em captura de tela, gere outra e apague a anterior.
