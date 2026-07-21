import { bookSections, chapters, plan, checkItems } from './content.js';
import { load, save, erase, exportData, importData, localDate } from './storage.js';

let state = load();
let route = location.hash.slice(1) || 'inicio';
let installPrompt = null;
const root = document.querySelector('#app');
const nav = [['inicio', 'Hoje'], ['leitura', 'Ebook'], ['hoje', 'Práticas'], ['espaco', 'Perfil']];
const PAGE_SIZE = 9;
const esc = value => String(value).replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));
const commit = () => { save(state); render(); };

function shell(content) {
  return `<div class="shell"><aside class="side"><div class="brand"><span class="brand-orbit" aria-hidden="true"></span><span>RAEM</span><small>O Código do Emagrecimento</small></div><nav class="nav" aria-label="Principal">${nav.map(([itemRoute, label]) => `<button class="nav-${itemRoute}" data-route="${itemRoute}" ${route === itemRoute ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true"></span><span>${label}</span></button>`).join('')}</nav><p class="privacy-note">Dados salvos somente neste dispositivo.<br>Conteúdo educativo, sem diagnóstico.</p></aside><main class="main" id="main" tabindex="-1"><div class="topline"><span class="eyebrow">RAEM · reconhecer · arquitetar · executar · manter</span><span class="status" role="status">${navigator.onLine ? 'Salvo no dispositivo' : 'Offline · salvo no dispositivo'}</span></div>${content}</main></div>`;
}

function progress() {
  return Math.round(state.reader.completed.length / chapters.length * 100);
}

function chapterNumber(section) {
  return section.chapter || chapters.findIndex(chapter => chapter.id === section.id) + 1;
}

function home() {
  const next = chapters.find(chapter => !state.reader.completed.includes(chapter.chapter)) || chapters.at(-1);
  return shell(`<section class="home-hero"><div class="home-head"><div class="home-brand"><span class="brand-orbit" aria-hidden="true"></span><span>RAEM</span></div><p>Bom dia, Manu</p><button class="settings-btn" data-route="espaco" aria-label="Configurações">⚙</button></div><div class="hero-copy"><h1>O que faz<br>sentido para<br>você agora?</h1><p>Continue no seu ritmo.</p></div></section><section class="home-paper"><article class="continue-card"><span class="eyebrow">Continue de onde parou</span><h2>Capítulo ${next.chapter} · ${esc(next.title.replace(/^Capítulo \d+\s*/i, ''))}</h2><div class="progress-line"><span><i style="width:${progress()}%"></i></span><strong>${progress()}%</strong></div><button class="continue-btn" data-book="${next.id}" data-page="0">Continuar leitura <span aria-hidden="true">→</span></button></article><section class="moment"><h2>Para este momento</h2><div class="moment-grid"><button class="moment-card coral-moment" data-pause><span class="moment-symbol" aria-hidden="true">◯</span><span><strong>Fazer uma pausa</strong><small>Respire e volte para você.</small></span></button><button class="moment-card turquoise-moment" data-route="hoje"><span class="moment-symbol" aria-hidden="true">〰</span><span><strong>Registrar meu dia</strong><small>Escreva para se escutar.</small></span></button><button class="moment-card violet-moment" data-book="${next.id}" data-page="0"><span class="moment-symbol" aria-hidden="true">≋</span><span><strong>Ouvir um áudio</strong><small>Áudio e leitura do capítulo.</small></span></button><button class="moment-card gold-moment" data-route="plano"><span class="moment-symbol orbit-small" aria-hidden="true"></span><span><strong>Ver ferramentas</strong><small>Recursos para sua jornada.</small></span></button></div></section></section>`);
}

function reading() {
  const groups = ['Comece aqui', 'Capítulos', 'Bônus e ferramentas', 'Referências'];
  return shell(`<header class="section-head"><span class="eyebrow">Ebook integral</span><h2>O livro completo, página por página.</h2><p class="lead">Carta ao leitor, introdução, oito capítulos, todos os bônus, workbook, referências e expediente — sem resumos ou cortes.</p><div class="ebook-actions"><a class="primary" href="assets/ebook-integral.pdf" target="_blank" rel="noopener">Abrir edição em PDF</a><a class="ghost" href="assets/ebook-integral.pdf" download>Baixar PDF</a></div></header><div class="book-library">${groups.map(group => `<section class="book-group"><h3>${group}</h3><div class="chapter-list">${bookSections.filter(item => item.group === group).map(item => `<article class="chapter-row"><span>${item.chapter || '•'}</span><div><small>${item.phase || item.group}</small><h3>${esc(item.title)}</h3><p>${item.blocks.length} trechos integrais</p></div><button class="ghost" data-book="${item.id}" data-page="0">${item.chapter && state.reader.completed.includes(item.chapter) ? 'Revisitar' : 'Ler'}</button></article>`).join('')}</div></section>`).join('')}</div>`);
}

function renderBlock(block) {
  if (block.type === 'heading') return `<h3>${esc(block.text)}</h3>`;
  if (block.type === 'bullet') return `<div class="book-bullet"><span aria-hidden="true">•</span><p>${esc(block.text)}</p></div>`;
  if (block.type === 'number') return `<div class="book-bullet"><span aria-hidden="true">—</span><p>${esc(block.text)}</p></div>`;
  return `<p>${esc(block.text)}</p>`;
}

function reader(id, page = 0) {
  const item = bookSections.find(section => section.id === id) || bookSections[0];
  const totalPages = Math.max(1, Math.ceil(item.blocks.length / PAGE_SIZE));
  page = Math.max(0, Math.min(page, totalPages - 1));
  const blocks = item.blocks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  state.reader.chapter = item.chapter || state.reader.chapter;
  state.reader.section = page;
  state.reader.bookSection = item.id;
  save(state);
  const audio = item.chapter ? `assets/audio-${String(item.chapter).padStart(2, '0')}.mp3` : '';
  const finish = page === totalPages - 1;
  return shell(`<article class="reader book-reader" style="--scale:${state.prefs.textScale}"><div class="reader-top"><button class="ghost" data-route="leitura">← Sumário</button><div class="toolbar" aria-label="Tamanho do texto"><button data-scale="-.1" aria-label="Diminuir texto">A−</button><button data-scale=".1" aria-label="Aumentar texto">A+</button></div></div><span class="eyebrow">${esc(item.phase || item.group)} · página ${page + 1} de ${totalPages}</span>${page === 0 ? `<h2>${esc(item.title)}</h2>` : ''}${page === 0 && audio ? `<div class="audio"><label>Áudio do capítulo<audio controls preload="none" src="${audio}"></audio></label><button class="ghost" data-audio-cache="${audio}">Disponibilizar offline</button><small data-audio-status>Carregado somente quando você escolher.</small></div>` : ''}<div class="book-copy">${blocks.map(renderBlock).join('')}</div><div class="reading-progress" aria-label="Progresso desta seção"><i style="width:${Math.round((page + 1) / totalPages * 100)}%"></i></div><div class="reader-nav"><button class="ghost" data-book-prev ${page === 0 ? 'disabled' : ''}>Anterior</button>${finish ? (item.chapter ? `<button class="primary" data-complete="${item.chapter}">${state.reader.completed.includes(item.chapter) ? 'Capítulo concluído' : 'Concluir capítulo'}</button>` : `<button class="primary" data-route="leitura">Voltar ao sumário</button>`) : '<button class="primary" data-book-next>Continuar</button>'}</div></article>`);
}

function today() {
  const date = localDate();
  const record = state.daily[date] || { checks: Array(4).fill(false), note: '' };
  return shell(`<header class="section-head"><span class="eyebrow">Registro de ${new Date(date + 'T12:00').toLocaleDateString('pt-BR')}</span><h2>Como está seu sistema hoje?</h2><p class="lead">Um registro de percepção, não uma nota sobre seu desempenho.</p></header><section class="grid"><div class="card coral" style="grid-column:span 2"><div class="check-grid">${checkItems.map((item, index) => `<button class="check" data-check="${index}" aria-pressed="${record.checks[index]}"><span>${record.checks[index] ? '●' : '○'}</span><span>${esc(item)}</span></button>`).join('')}</div><label style="margin-top:16px">Uma observação opcional<textarea data-note placeholder="Escreva sem precisar concluir nada…">${esc(record.note)}</textarea></label></div><aside class="card gold"><span class="eyebrow">Pausa guiada</span><h3>60 segundos de espaço</h3><p>Solte o ar devagar. Note corpo, emoção e contexto. Depois escolha entre comer, esperar, pedir apoio ou atender outra necessidade.</p><button class="primary" data-pause>Iniciar pausa</button></aside></section><section class="card violet" style="margin-top:16px"><span class="eyebrow">Plano Se–Então</span><h3>Antecipar sem controlar tudo.</h3><div class="grid"><label>Se acontecer…<input data-if placeholder="Ex.: eu chegar muito cansado"></label><label>Então posso…<input data-then placeholder="Ex.: pausar e escolher algo simples"></label><button class="primary" data-add-if>Adicionar</button></div><div class="if-list">${state.ifthen.map((item, index) => `<div class="if-item"><span><strong>Se</strong> ${esc(item.if)}, <strong>então</strong> ${esc(item.then)}.</span><button class="ghost" data-del-if="${index}">Excluir</button></div>`).join('')}</div></section>`);
}

function planPage() {
  const start = new Date(state.plan.start + 'T12:00');
  return shell(`<header class="section-head"><span class="eyebrow">Continuidade</span><h2>Plano de 30 dias</h2><p class="lead">Use como sequência livre ou calendário real. Cada registro guarda a data em que foi feito.</p></header><div class="card"><div class="grid"><label>Modo<select data-plan-mode><option value="free" ${state.plan.mode === 'free' ? 'selected' : ''}>Sequência livre</option><option value="calendar" ${state.plan.mode === 'calendar' ? 'selected' : ''}>Calendário</option></select></label><label>Data inicial<input data-plan-start type="date" value="${state.plan.start}" ${state.plan.mode === 'free' ? 'disabled' : ''}></label></div><p class="notice">Datas futuras ficam disponíveis para consulta, mas não podem ser marcadas antes de acontecer.</p><div class="plan-grid">${plan.map((item, index) => { const due = new Date(start); due.setDate(due.getDate() + index); const dueKey = localDate(due); const future = state.plan.mode === 'calendar' && dueKey > localDate(); const done = !!state.plan.records[index]; return `<button class="day ${done ? 'done' : ''} ${future ? 'future' : ''}" data-day="${index}" ${future ? 'disabled' : ''}><strong>${index + 1}</strong><small>${state.plan.mode === 'calendar' ? due.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Etapa'}</small><span class="sr">${esc(item)}</span><br><small>${done ? 'Registrado em ' + new Date(done + 'T12:00').toLocaleDateString('pt-BR') : 'Abrir'}</small></button>`; }).join('')}</div></div>`);
}

function space() {
  const installText = matchMedia('(display-mode: standalone)').matches ? 'Aplicativo instalado neste dispositivo.' : installPrompt ? 'Instale o RAEM para abrir como aplicativo e usar o conteúdo offline.' : 'No iPhone, use Compartilhar → Adicionar à Tela de Início. No computador ou Android, procure “Instalar aplicativo” no menu do navegador.';
  return shell(`<header class="section-head"><span class="eyebrow">Seu aplicativo</span><h2>Leitura, instalação e privacidade.</h2><p class="lead">O ebook integral e suas ferramentas ficam disponíveis neste dispositivo. Não há conta, rastreamento ou sincronização automática.</p></header><div class="grid"><section class="card gold"><h3>Instalar o app</h3><p>${installText}</p>${installPrompt ? '<button class="primary" data-install>Instalar aplicativo</button>' : ''}</section><section class="card turquoise"><h3>Ebook completo</h3><p>Leia dentro do app ou guarde uma cópia da edição integral.</p><a class="primary" href="assets/ebook-integral.pdf" download>Baixar PDF</a></section><section class="card turquoise"><h3>Backup</h3><p>Exporte um arquivo compatível com esta versão.</p><button class="primary" data-export>Exportar dados</button></section><section class="card violet"><h3>Restaurar</h3><p>A importação valida versão, estrutura e limite de tamanho.</p><label class="ghost">Selecionar arquivo<input class="sr" type="file" accept="application/json" data-import></label></section><section class="card coral"><h3>Apagar</h3><p>Remove permanentemente os registros deste navegador.</p><button class="ghost" data-erase>Apagar dados</button></section></div><section class="card gold" style="margin-top:16px"><h3>Escopo e prontidão comercial</h3><p>Conteúdo educativo e de autorreflexão. Não diagnostica, trata ou prescreve. Antes da venda, publique Termos de Uso, Política de Privacidade, canal de suporte e política comercial; valide o conteúdo com profissionais habilitados e integre autenticação ou licenciamento ao ambiente de hospedagem.</p></section>`);
}

function render() {
  const parts = route.split('/');
  root.innerHTML = route.startsWith('livro/') ? reader(+parts[1], +parts[2] || 0) : route === 'leitura' ? reading() : route === 'hoje' ? today() : route === 'plano' ? planPage() : route === 'espaco' ? space() : home();
  bind();
  document.querySelector('#main')?.focus({ preventScroll: true });
}

function go(nextRoute) { route = nextRoute; location.hash = nextRoute; render(); }

function bind() {
  document.querySelectorAll('[data-route]').forEach(button => button.onclick = () => go(button.dataset.route));
  document.querySelectorAll('[data-book]').forEach(button => button.onclick = () => go(`livro/${button.dataset.book}/${button.dataset.page || 0}`));
  document.querySelector('[data-book-next]')?.addEventListener('click', () => go(`livro/${state.reader.bookSection}/${state.reader.section + 1}`));
  document.querySelector('[data-book-prev]')?.addEventListener('click', () => go(`livro/${state.reader.bookSection}/${state.reader.section - 1}`));
  document.querySelectorAll('[data-scale]').forEach(button => button.onclick = () => { state.prefs.textScale = Math.max(.8, Math.min(1.4, state.prefs.textScale + Number(button.dataset.scale))); commit(); });
  document.querySelector('[data-complete]')?.addEventListener('click', event => { const number = +event.currentTarget.dataset.complete; if (!state.reader.completed.includes(number)) state.reader.completed.push(number); save(state); const next = chapters[number]; go(next ? `livro/${next.id}/0` : 'inicio'); });
  document.querySelectorAll('[data-check]').forEach(button => button.onclick = () => { const date = localDate(); const record = state.daily[date] || { checks: Array(4).fill(false), note: '' }; record.checks[+button.dataset.check] = !record.checks[+button.dataset.check]; state.daily[date] = record; commit(); });
  document.querySelector('[data-note]')?.addEventListener('change', event => { const date = localDate(); const record = state.daily[date] || { checks: Array(4).fill(false), note: '' }; record.note = event.target.value.slice(0, 2000); state.daily[date] = record; save(state); });
  document.querySelector('[data-pause]')?.addEventListener('click', pause);
  document.querySelector('[data-plan-mode]')?.addEventListener('change', event => { state.plan.mode = event.target.value; commit(); });
  document.querySelector('[data-plan-start]')?.addEventListener('change', event => { if (confirm('Alterar a data inicial mantém os registros já feitos, mas muda as datas previstas. Continuar?')) { state.plan.start = event.target.value; commit(); } else render(); });
  document.querySelectorAll('[data-day]').forEach(button => button.onclick = () => { const index = +button.dataset.day; if (state.plan.records[index]) { if (confirm('Remover este registro?')) delete state.plan.records[index]; } else state.plan.records[index] = localDate(); commit(); });
  document.querySelector('[data-export]')?.addEventListener('click', () => exportData(state));
  document.querySelector('[data-import]')?.addEventListener('change', async event => { try { state = await importData(event.target.files[0]); save(state); alert('Backup restaurado.'); render(); } catch (error) { alert(error.message); } });
  document.querySelector('[data-erase]')?.addEventListener('click', () => { if (confirm('Apagar permanentemente todos os dados deste navegador?')) { erase(); state = load(); go('inicio'); } });
  document.querySelector('[data-install]')?.addEventListener('click', installApp);
}

function pause() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = '<div><span class="eyebrow">Pausa guiada</span><h2>Há espaço antes da próxima escolha.</h2><p data-count class="metric">60</p><p>Respire no seu ritmo. Observe o que está presente sem precisar resolver tudo agora.</p><button class="primary" data-close>Encerrar</button></div>';
  document.body.append(modal);
  modal.querySelector('[data-close]').focus();
  let seconds = 60;
  const timer = setInterval(() => { seconds -= 1; modal.querySelector('[data-count]').textContent = seconds; if (seconds <= 0) clearInterval(timer); }, 1000);
  modal.querySelector('[data-close]').onclick = () => { clearInterval(timer); modal.remove(); };
}

async function cacheAudio(event) {
  const button = event.target.closest('[data-audio-cache]');
  const status = document.querySelector('[data-audio-status]');
  try { button.disabled = true; status.textContent = 'Baixando para uso offline…'; const cache = await caches.open('raem-audio-v7'); const url = button.dataset.audio; const response = await fetch(url); if (!response.ok) throw Error(); await cache.put(url, response); status.textContent = 'Áudio disponível offline neste dispositivo.'; button.textContent = 'Disponível offline'; } catch { status.textContent = 'Não foi possível baixar agora. Verifique a conexão.'; button.disabled = false; }
}

async function installApp() {
  if (!installPrompt) return;
  await installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  render();
}

root.addEventListener('click', event => {
  if (event.target.closest('[data-audio-cache]')) return cacheAudio(event);
  if (event.target.closest('[data-add-if]')) { const first = document.querySelector('[data-if]').value.trim(); const second = document.querySelector('[data-then]').value.trim(); if (!first || !second) return alert('Preencha as duas partes do plano.'); state.ifthen.push({ if: first.slice(0, 240), then: second.slice(0, 240) }); commit(); }
  const remove = event.target.closest('[data-del-if]');
  if (remove) { state.ifthen.splice(+remove.dataset.delIf, 1); commit(); }
});

addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; render(); });
addEventListener('appinstalled', () => { installPrompt = null; render(); });
addEventListener('hashchange', () => { route = location.hash.slice(1) || 'inicio'; render(); });
addEventListener('online', render);
addEventListener('offline', render);
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
render();
