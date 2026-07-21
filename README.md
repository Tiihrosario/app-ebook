# RAEM · versão 7 local-first

PWA modular, sem dependências externas. Sirva a pasta por HTTPS (ou localhost); abrir `index.html` diretamente não ativa o service worker.

Esta versão inclui o texto integral da edição revisada do ebook, organizado em 22 seções, além do PDF completo para leitura ou download. Para publicar pelo GitHub no Netlify, coloque o conteúdo desta pasta na raiz do repositório, deixe o comando de build vazio e use `.` como diretório de publicação.

## Estrutura

- `js/content.js`: conteúdo editorial integral e independente da interface.
- `js/storage.js`: esquema de dados, datas locais, backup e restauração.
- `js/app.js`: navegação e componentes da aplicação.
- `css/app.css`: sistema visual responsivo e acessível.
- `sw.js`: cache do shell e do leitor integral. PDF e áudios são armazenados após o primeiro acesso e não bloqueiam a instalação.

## Escopo comercial

O pacote não simula conta, compra nem sincronização. Para venda com acesso restrito, conecte autenticação/licenciamento e backend no ambiente de hospedagem. Antes da publicação, disponibilize Termos de Uso, Política de Privacidade, política comercial e suporte; valide conteúdo de saúde com profissionais habilitados.

## Dados

Todos os registros ficam no navegador sob `raem-v5-state`. O usuário pode exportar, restaurar ou apagar seus dados. Backups incompatíveis, incompletos ou acima de 2 MB são recusados.
