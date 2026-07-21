# RAEM · versão final local-first

PWA modular, sem dependências externas. Sirva a pasta por HTTPS (ou localhost); abrir `index.html` diretamente não ativa o service worker.

## Estrutura

- `js/content.js`: conteúdo editorial independente da interface.
- `js/storage.js`: esquema de dados, datas locais, backup e restauração.
- `js/app.js`: navegação e componentes da aplicação.
- `css/app.css`: sistema visual responsivo e acessível.
- `sw.js`: cache do shell. Áudios são carregados sob demanda e não bloqueiam a instalação.

## Escopo comercial

O pacote não simula conta, compra nem sincronização. Para venda com acesso restrito, conecte autenticação/licenciamento e backend no ambiente de hospedagem. Antes da publicação, disponibilize Termos de Uso, Política de Privacidade, política comercial e suporte; valide conteúdo de saúde com profissionais habilitados.

## Dados

Todos os registros ficam no navegador sob `raem-v5-state`. O usuário pode exportar, restaurar ou apagar seus dados. Backups incompatíveis, incompletos ou acima de 2 MB são recusados.
