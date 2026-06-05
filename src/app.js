// =============================================================
// CyberOracle · App (JavaScript vanilla, sin dependencias)
// Construye la UI del chat y conecta con el motor de respuesta.
// =============================================================
import { CATEGORIES, CATEGORY_MAP } from './data/categories.js'
import { KB, countByCategory } from './data/knowledgeBase.js'
import { getResponse, getEntryResponse } from './lib/bot.js'
import { getByCategory, getById } from './lib/search.js'
import { renderMarkdown } from './lib/markdown.js'

const COUNTS = countByCategory()

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

// ---------- Helper para crear elementos ----------
function el(tag, props = {}, children = []) {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(props)) {
    if (key === 'class') node.className = value
    else if (key === 'text') node.textContent = value
    else if (key === 'html') node.innerHTML = value // solo para contenido controlado interno
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value)
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(node.style, value)
    } else if (value !== undefined && value !== null) {
      node.setAttribute(key, value)
    }
  }
  const kids = Array.isArray(children) ? children : [children]
  for (const c of kids) {
    if (c == null) continue
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c)
  }
  return node
}

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
  const status = el('div', { class: 'topbar-status' }, [
    el('span', { class: 'status-dot' }),
    document.createTextNode('ONLINE'),
  ])
  return el('header', { class: 'topbar' }, [menuBtn, title, status])
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
    entry.tools.forEach((t) => list.appendChild(el('span', { class: 'tool-tag', text: t })))
    wrap.appendChild(el('div', { class: 'tools-row' }, [
      el('span', { class: 'tools-label', text: '⚙ Herramientas' }),
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
function send(textArg) {
  const text = (textArg != null ? textArg : inputEl.value).trim()
  if (!text) return
  addUserMessage(text)
  inputEl.value = ''
  autoGrow()
  const response = getResponse(text)
  addBotMessage(() => renderResponse(response))
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

// ---------- Init ----------
buildLayout()
addBotMessage(() => buildWelcome())
inputEl.focus()
