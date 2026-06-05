// =============================================================
// CyberOracle · App (JavaScript vanilla, sin dependencias)
// Construye la UI del chat y conecta con el motor de respuesta.
// =============================================================
import { CATEGORIES, CATEGORY_MAP } from './data/categories.js'
import { KB, countByCategory } from './data/knowledgeBase.js'
import { getResponse, getEntryResponse } from './lib/bot.js'
import { getByCategory, getById } from './lib/search.js'
import { renderMarkdown } from './lib/markdown.js'
import { el } from './lib/dom.js'
import { openToolkit } from './lib/toolkit.js'
import { resolveToolTag, INTERACTIVE_TOOLS } from './lib/tools.js'
import { ensureSeed, currentUser, logout } from './lib/auth.js'
import { getPlan } from './lib/plans.js'
import { canQuery, consume, remaining, limitFor } from './lib/quota.js'
import { askAI, aiEnabled } from './lib/ai.js'
import { showAuth } from './lib/authUI.js'
import { openBilling } from './lib/billingUI.js'
import { openAdmin } from './lib/adminUI.js'

const COUNTS = countByCategory()

// Usuario en sesión (se establece en init)
let me = null
let accountEl = null

const SUGGESTIONS = [
  '¿Qué es el OWASP Top 10?',
  '¿Cómo funciona la inyección SQL?',
  'Cifrado simétrico vs asimétrico',
  '¿Para qué sirve Nmap?',
  '¿Cómo me protejo del ransomware?',
  '¿Qué certificación elijo para empezar?',
  '¿Qué es MITRE ATT&CK?',
  '¿Cómo empiezo en ciberseguridad?',
]

// ---------- Helper para crear elementos: importado desde ./lib/dom.js ----------

// ---------- Estado y referencias ----------
let chatEl, scrollEl, inputEl, sidebarEl, overlayEl
let activeCat = null

// ---------- Render del esqueleto ----------
function buildLayout() {
  const root = document.getElementById('root')
  root.innerHTML = ''

  // Fondos
  root.appendChild(el('div', { class: 'bg-grid' }))
  root.appendChild(el('div', { class: 'bg-glow bg-glow-1' }))
  root.appendChild(el('div', { class: 'bg-glow bg-glow-2' }))
  root.appendChild(el('div', { class: 'scanline' }))

  // Sidebar
  sidebarEl = buildSidebar()
  overlayEl = el('div', { class: 'overlay', onClick: closeSidebar })

  // Main
  const main = el('main', { class: 'main' }, [
    buildTopbar(),
    buildChatArea(),
    buildComposer(),
  ])

  const app = el('div', { class: 'app' }, [sidebarEl, overlayEl, main])
  root.appendChild(app)
}

function buildSidebar() {
  const brand = el('div', { class: 'brand' }, [
    el('div', { class: 'brand-logo', text: '◈' }),
    el('div', { class: 'brand-text' }, [
      el('span', { class: 'brand-name', text: 'CyberOracle' }),
      el('span', { class: 'brand-sub', text: 'Security Assistant' }),
    ]),
  ])

  const nav = el('nav', { class: 'cat-nav' })

  // Botón inicio
  const homeBtn = el('button', {
    class: 'cat-item active',
    onClick: () => {
      setActive(null, homeBtn)
      closeSidebar()
      inputEl.focus()
    },
  }, [
    el('span', { class: 'cat-item-icon', text: '⌂', style: { '--c': '#00f6ff' } }),
    el('span', { class: 'cat-item-name', text: 'Inicio / Chat' }),
  ])
  nav.appendChild(homeBtn)

  // Botón Arsenal de herramientas
  const arsenalBtn = el('button', {
    class: 'cat-item arsenal-item',
    onClick: () => { closeSidebar(); openToolkit('hash') },
  }, [
    el('span', { class: 'cat-item-icon', text: '🧰', style: { '--c': '#ff7a18' } }),
    el('span', { class: 'cat-item-name', text: 'Arsenal de Herramientas' }),
    el('span', { class: 'cat-item-count', text: String(INTERACTIVE_TOOLS.length) }),
  ])
  nav.appendChild(arsenalBtn)

  for (const c of CATEGORIES) {
    const btn = el('button', {
      class: 'cat-item',
      onClick: () => {
        setActive(c.id, btn)
        pickCategory(c.id)
      },
    }, [
      el('span', { class: 'cat-item-icon', text: c.icon, style: { '--c': c.color } }),
      el('span', { class: 'cat-item-name', text: c.name }),
      el('span', { class: 'cat-item-count', text: String(COUNTS[c.id] || 0) }),
    ])
    btn.dataset.cat = c.id
    nav.appendChild(btn)
  }

  const foot = el('div', { class: 'sidebar-foot' }, [
    el('span', { class: 'status-dot' }),
    document.createTextNode(' Offline · Conocimiento local'),
  ])

  return el('aside', { class: 'sidebar' }, [
    brand,
    el('div', { class: 'sidebar-section-title', text: `DOMINIOS · ${KB.length} temas` }),
    nav,
    foot,
  ])
}

function setActive(catId, btn) {
  activeCat = catId
  sidebarEl.querySelectorAll('.cat-item').forEach((b) => b.classList.remove('active'))
  if (btn) btn.classList.add('active')
}

function buildTopbar() {
  const menuBtn = el('button', { class: 'menu-btn', 'aria-label': 'Menú', text: '☰', onClick: toggleSidebar })
  const title = el('div', { class: 'topbar-title' }, [
    el('span', { class: 'topbar-icon', text: '◈' }),
    el('div', {}, [
      el('div', { class: 'topbar-name', text: 'CyberOracle' }),
      el('div', { class: 'topbar-tag', text: 'Asistente de Ciberseguridad · Defensivo & Ético' }),
    ]),
  ])
  const arsenalBtn = el('button', {
    class: 'arsenal-btn',
    title: 'Arsenal de herramientas interactivas',
    onClick: () => openToolkit('hash'),
  }, [
    el('span', { class: 'arsenal-btn-icon', text: '🧰' }),
    el('span', { class: 'arsenal-btn-text', text: 'Arsenal' }),
  ])
  accountEl = el('div', { class: 'account', id: 'account-bar' })
  renderAccount()
  return el('header', { class: 'topbar' }, [menuBtn, title, arsenalBtn, accountEl])
}

// Renderiza/actualiza la barra de cuenta (plan, consultas, admin, salir)
function renderAccount() {
  if (!accountEl) return
  accountEl.innerHTML = ''
  if (!me) return
  const plan = getPlan(me.plan)
  const rem = remaining(me)
  const limit = limitFor(me)
  const remLabel = rem === Infinity ? '∞' : String(rem)

  // Chip de plan (abre planes)
  const planChip = el('button', {
    class: 'acct-plan',
    style: { '--c': me.role === 'admin' ? '#fbbf24' : plan.color },
    title: 'Ver y cambiar de plan',
    onClick: () => openBilling(onUserChange),
  }, [
    el('span', { class: 'acct-plan-dot' }),
    document.createTextNode(me.role === 'admin' ? 'ADMIN' : plan.name.toUpperCase()),
  ])

  // Consultas restantes
  const queries = el('span', {
    class: 'acct-queries',
    title: limit === Infinity ? 'Consultas ilimitadas' : 'Consultas IA restantes hoy',
  }, [el('span', { class: 'acct-bolt', text: '⚡' }), document.createTextNode(' ' + remLabel)])

  accountEl.appendChild(planChip)
  accountEl.appendChild(queries)

  if (aiEnabled()) {
    accountEl.appendChild(el('span', { class: 'acct-ai', title: 'IA conectada', text: 'IA' }))
  }

  if (me.role === 'admin') {
    accountEl.appendChild(el('button', {
      class: 'acct-icon-btn', title: 'Panel de administración', text: '🛠',
      onClick: () => openAdmin(onUserChange),
    }))
  }

  accountEl.appendChild(el('span', { class: 'acct-user', text: me.username }))
  accountEl.appendChild(el('button', {
    class: 'acct-icon-btn', title: 'Cerrar sesión', text: '⎋', onClick: handleLogout,
  }))
}

// Callback cuando cambia el usuario (plan/rol desde billing o admin)
function onUserChange(updated) {
  me = updated || currentUser()
  renderAccount()
}

function handleLogout() {
  logout()
  me = null
  initAuthScreen()
}

function buildChatArea() {
  chatEl = el('div', { class: 'chat-inner' })
  scrollEl = el('div', { class: 'chat' }, [chatEl])
  return scrollEl
}

function buildComposer() {
  inputEl = el('textarea', {
    class: 'composer-input',
    rows: '1',
    placeholder: 'Pregunta sobre ciberseguridad...  (ej: ¿cómo funciona el phishing?)',
  })
  inputEl.addEventListener('input', autoGrow)
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  })

  const sendBtn = el('button', {
    class: 'send-btn',
    'aria-label': 'Enviar',
    onClick: () => send(),
  }, [el('span', { class: 'send-icon', text: '➤' })])

  const inner = el('div', { class: 'composer-inner' }, [inputEl, sendBtn])
  const hint = el('div', { class: 'composer-hint' })
  hint.appendChild(document.createTextNode('CyberOracle ofrece conocimiento '))
  hint.appendChild(el('strong', { text: 'defensivo y educativo' }))
  hint.appendChild(document.createTextNode('. Practica solo en sistemas autorizados.'))

  return el('footer', { class: 'composer' }, [inner, hint])
}

function autoGrow() {
  inputEl.style.height = 'auto'
  inputEl.style.height = Math.min(inputEl.scrollHeight, 140) + 'px'
}

// ---------- Sidebar móvil ----------
function toggleSidebar() { sidebarEl.classList.toggle('open') }
function closeSidebar() { sidebarEl.classList.remove('open') }

// ---------- Scroll ----------
function scrollToBottom() {
  requestAnimationFrame(() => { scrollEl.scrollTop = scrollEl.scrollHeight })
}

// ---------- Mensajes ----------
function addUserMessage(text) {
  const msg = el('div', { class: 'msg user' }, [
    el('div', { class: 'bubble user-bubble', text }),
    el('div', { class: 'avatar user-avatar', text: 'TÚ' }),
  ])
  chatEl.appendChild(msg)
  scrollToBottom()
}

function addBotMessage(buildContent) {
  // Burbuja con "typing" y luego contenido
  const bubble = el('div', { class: 'bot-bubble' })
  const typing = el('div', { class: 'typing' }, [el('span'), el('span'), el('span')])
  bubble.appendChild(typing)

  const msg = el('div', { class: 'msg bot' }, [
    el('div', { class: 'avatar bot-avatar', text: '◈' }),
    bubble,
  ])
  chatEl.appendChild(msg)
  scrollToBottom()

  const delay = 350 + Math.random() * 450
  setTimeout(() => {
    bubble.innerHTML = ''
    bubble.appendChild(buildContent())
    scrollToBottom()
  }, delay)
}

// Variante asíncrona (para respuestas de IA). Nunca lanza errores al usuario.
function addBotMessageAsync(builderAsync) {
  const bubble = el('div', { class: 'bot-bubble' })
  bubble.appendChild(el('div', { class: 'typing' }, [el('span'), el('span'), el('span')]))
  const msg = el('div', { class: 'msg bot' }, [
    el('div', { class: 'avatar bot-avatar', text: '◈' }),
    bubble,
  ])
  chatEl.appendChild(msg)
  scrollToBottom()

  const minDelay = new Promise((r) => setTimeout(r, 420))
  Promise.all([Promise.resolve().then(builderAsync), minDelay])
    .then(([node]) => {
      bubble.innerHTML = ''
      bubble.appendChild(node)
      scrollToBottom()
    })
    .catch(() => {
      bubble.innerHTML = ''
      bubble.appendChild(buildTextAnswer('Ocurrió un problema procesando tu consulta. Intenta de nuevo.'))
      scrollToBottom()
    })
}

// ---------- Constructores de respuesta ----------
function buildWelcome() {
  const wrap = el('div', { class: 'answer welcome' })
  wrap.appendChild(el('div', { class: 'welcome-badge', text: 'SISTEMA EN LÍNEA' }))
  wrap.appendChild(el('h2', { class: 'answer-title glow', text: 'Bienvenido a CyberOracle' }))
  const body = el('div', { class: 'answer-body' })
  body.appendChild(renderMarkdown(
    'Tu **asistente de ciberseguridad**. Pregúntame cualquier cosa: ataques y defensas, herramientas, criptografía, pentesting, nube, forense, certificaciones y mucho más. Conocimiento **defensivo y ético**, listo para que aprendas y protejas.',
  ))
  wrap.appendChild(body)
  wrap.appendChild(buildSuggestions(SUGGESTIONS))
  return wrap
}

function buildSuggestions(list) {
  const wrap = el('div', { class: 'suggest-wrap' })
  for (const s of list) {
    wrap.appendChild(el('button', { class: 'suggest-chip', text: s, onClick: () => send(s) }))
  }
  return wrap
}

function buildConfidence(value) {
  const pct = Math.max(12, Math.min(100, Math.round((value / 60) * 100)))
  const fill = el('div', { class: 'confidence-fill', style: { width: pct + '%' } })
  return el('div', { class: 'confidence', title: `Relevancia: ${pct}%` }, [
    el('div', { class: 'confidence-track' }, [fill]),
    el('span', { class: 'confidence-label', text: `match ${pct}%` }),
  ])
}

function buildCatChip(cat) {
  return el('span', { class: 'cat-chip', style: { '--c': cat?.color || '#00f6ff' } }, [
    el('span', { class: 'cat-chip-icon', text: cat?.icon || '◈' }),
    document.createTextNode(cat?.name || ''),
  ])
}

function buildAnswer(response) {
  const { entry, category, confidence, related } = response
  const wrap = el('div', { class: 'answer' })

  wrap.appendChild(el('div', { class: 'answer-head' }, [
    buildCatChip(category),
    buildConfidence(confidence),
  ]))
  wrap.appendChild(el('h2', { class: 'answer-title', text: entry.title }))

  const body = el('div', { class: 'answer-body' })
  body.appendChild(renderMarkdown(entry.content))
  wrap.appendChild(body)

  if (entry.tools && entry.tools.length) {
    const list = el('div', { class: 'tools-list' })
    entry.tools.forEach((t) => {
      const tag = el('button', {
        class: 'tool-tag',
        title: 'Abrir en el Arsenal',
        onClick: () => openToolFromTag(t),
      }, [t])
      list.appendChild(tag)
    })
    wrap.appendChild(el('div', { class: 'tools-row' }, [
      el('span', { class: 'tools-label', text: '⚙ Herramientas · clic para usar' }),
      list,
    ]))
  }

  if (related && related.length) {
    const list = el('div', { class: 'related-list' })
    related.forEach((r) => {
      list.appendChild(el('button', { class: 'related-btn', text: r.title, onClick: () => openEntry(r.id) }))
    })
    wrap.appendChild(el('div', { class: 'related' }, [
      el('span', { class: 'related-label', text: '🔗 Relacionado' }),
      list,
    ]))
  }

  return wrap
}

function buildHelp() {
  const wrap = el('div', { class: 'answer' })
  wrap.appendChild(el('h2', { class: 'answer-title', text: '¿Qué puedo hacer por ti? 🧠' }))
  const body = el('div', { class: 'answer-body' })
  body.appendChild(renderMarkdown(
    `Soy un asistente de ciberseguridad con conocimiento en **${KB.length}+ temas** repartidos en **${CATEGORIES.length} dominios**. Pregúntame con tus palabras y te respondo con explicaciones claras, herramientas y buenas prácticas.\n\nExplora un dominio:`,
  ))
  wrap.appendChild(body)

  const grid = el('div', { class: 'help-grid' })
  for (const c of CATEGORIES) {
    grid.appendChild(el('button', { class: 'help-cat', style: { '--c': c.color }, onClick: () => pickCategory(c.id) }, [
      el('span', { class: 'help-cat-icon', text: c.icon }),
      el('span', { class: 'help-cat-name', text: c.name }),
      el('span', { class: 'help-cat-count', text: String(COUNTS[c.id] || 0) }),
    ]))
  }
  wrap.appendChild(grid)
  return wrap
}

function buildCategoryList(categoryId) {
  const cat = CATEGORY_MAP[categoryId]
  const entries = getByCategory(categoryId)
  const wrap = el('div', { class: 'answer' })
  wrap.appendChild(el('div', { class: 'answer-head' }, [buildCatChip(cat)]))
  wrap.appendChild(el('h2', { class: 'answer-title', text: cat?.desc || cat?.name }))
  const list = el('div', { class: 'related-list', style: { marginTop: '0.5rem' } })
  entries.forEach((e) => {
    list.appendChild(el('button', { class: 'related-btn', text: e.title, onClick: () => openEntry(e.id) }))
  })
  wrap.appendChild(list)
  return wrap
}

function buildNotFound(query) {
  const wrap = el('div', { class: 'answer' })
  wrap.appendChild(el('h2', { class: 'answer-title', text: 'No encontré una coincidencia exacta 🔍' }))
  const body = el('div', { class: 'answer-body' })
  const p = el('p', { class: 'md-p' })
  p.appendChild(document.createTextNode('No tengo una entrada clara para '))
  p.appendChild(el('strong', { text: `“${query}”` }))
  p.appendChild(document.createTextNode('. Prueba reformular o explora estos temas:'))
  body.appendChild(p)
  wrap.appendChild(body)
  wrap.appendChild(buildSuggestions(SUGGESTIONS.slice(0, 5)))
  return wrap
}

function buildTextAnswer(text) {
  const body = el('div', { class: 'answer-body' })
  body.appendChild(renderMarkdown(text))
  return body
}

// Respuesta generada por IA (con distintivo)
function buildAIAnswer(text) {
  const wrap = el('div', { class: 'answer' })
  wrap.appendChild(el('div', { class: 'answer-head' }, [
    el('span', { class: 'cat-chip', style: { '--c': '#c084fc' } }, [
      el('span', { class: 'cat-chip-icon', text: '🤖' }),
      document.createTextNode('Respuesta IA'),
    ]),
  ]))
  const body = el('div', { class: 'answer-body' })
  body.appendChild(renderMarkdown(text))
  wrap.appendChild(body)
  return wrap
}

// Mensaje cuando se agota la cuota diaria
function buildLimitReached() {
  const plan = getPlan(me?.plan)
  const wrap = el('div', { class: 'answer' })
  wrap.appendChild(el('h2', { class: 'answer-title', text: 'Has alcanzado tu límite diario 🚦' }))
  const body = el('div', { class: 'answer-body' })
  body.appendChild(renderMarkdown(
    `Tu plan **${plan.name}** incluye **${plan.dailyQueries === Infinity ? 'consultas ilimitadas' : plan.dailyQueries + ' consultas IA al día'}**. ` +
    'Vuelve mañana o mejora tu plan para seguir consultando sin límites.\n\n' +
    '💡 Mientras tanto, puedes seguir explorando la **base de conocimiento** por categorías y usar las **herramientas** disponibles en tu plan.',
  ))
  wrap.appendChild(body)
  const btn = el('button', { class: 'plan-btn', style: { '--c': '#00f6ff', maxWidth: '240px' }, text: '⭐ Ver planes', onClick: () => openBilling(onUserChange) })
  wrap.appendChild(btn)
  return wrap
}

// ---------- Render de una respuesta del bot ----------
function renderResponse(response) {
  switch (response.kind) {
    case 'welcome': return buildWelcome()
    case 'text': return buildTextAnswer(response.text)
    case 'help': return buildHelp()
    case 'answer': return buildAnswer(response)
    case 'category': return buildCategoryList(response.categoryId)
    case 'notfound': return buildNotFound(response.query)
    default: return buildTextAnswer('…')
  }
}

// ---------- Acciones ----------
async function send(textArg) {
  const text = (textArg != null ? textArg : inputEl.value).trim()
  if (!text) return

  // Control de cuota diaria
  if (!canQuery(me)) {
    addUserMessage(text)
    inputEl.value = ''
    autoGrow()
    addBotMessage(() => buildLimitReached())
    return
  }

  addUserMessage(text)
  inputEl.value = ''
  autoGrow()

  // Consume una consulta y actualiza el contador
  consume(me)
  renderAccount()

  // Intenta IA (si está configurada y hay red); si no, motor local. Nunca falla.
  addBotMessageAsync(async () => {
    const ai = await askAI(text)
    if (ai && ai.text) return buildAIAnswer(ai.text)
    return renderResponse(getResponse(text))
  })
}

function openEntry(entryId) {
  const entry = getById(entryId)
  if (!entry) return
  addUserMessage(entry.title)
  addBotMessage(() => buildAnswer(getEntryResponse(entry)))
}

function pickCategory(categoryId) {
  const cat = CATEGORY_MAP[categoryId]
  closeSidebar()
  addUserMessage(`Explorar: ${cat?.name}`)
  addBotMessage(() => buildCategoryList(categoryId))
}

// Abre el Arsenal a partir de una etiqueta de herramienta.
function openToolFromTag(name) {
  const r = resolveToolTag(name)
  if (r.type === 'tool') openToolkit(r.id)
  else if (r.type === 'ref') openToolkit('reference', r.name)
  else openToolkit('reference', name)
}

// ---------- Init ----------
function startApp(user) {
  me = user
  buildLayout()
  addBotMessage(() => buildWelcome())
  inputEl.focus()
}

function initAuthScreen() {
  showAuth(document.getElementById('root'), (user) => startApp(user))
}

async function init() {
  try {
    await ensureSeed()
  } catch {
    /* si Web Crypto no está disponible, continúa con login vacío */
  }
  const user = currentUser()
  if (user) startApp(user)
  else initAuthScreen()
}

init()
