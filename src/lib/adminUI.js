// =============================================================
// CyberOracle · Panel de Administración
// Gestión de usuarios, planes, estadísticas y configuración de IA.
// Solo accesible para usuarios con rol 'admin'.
// =============================================================
import { el } from './dom.js'
import { getUsers, getUserUsage, getAIConfig, setAIConfig } from './store.js'
import { setUserPlan, setUserRole, setUserStatus, removeUser, currentUser } from './auth.js'
import { PLANS, PLAN_ORDER, dailyLimitFor } from './plans.js'

let overlayEl = null
let bodyEl = null
let onChangeCb = null

function close() {
  if (overlayEl) {
    overlayEl.classList.remove('show')
    const o = overlayEl
    overlayEl = null
    setTimeout(() => o.remove(), 220)
  }
}

function refresh() {
  onChangeCb?.(currentUser())
  renderTab(currentTab)
}

let currentTab = 'users'

// ---------- Pestaña: Estadísticas ----------
function renderStats() {
  const users = getUsers()
  const byPlan = { free: 0, pro: 0, elite: 0 }
  let queriesToday = 0
  users.forEach((u) => {
    byPlan[u.plan] = (byPlan[u.plan] || 0) + 1
    queriesToday += getUserUsage(u.id)
  })
  const admins = users.filter((u) => u.role === 'admin').length

  const stat = (label, value, color) =>
    el('div', { class: 'adm-stat', style: { '--c': color || '#00f6ff' } }, [
      el('div', { class: 'adm-stat-val', text: String(value) }),
      el('div', { class: 'adm-stat-label', text: label }),
    ])

  bodyEl.appendChild(el('div', { class: 'adm-stats-grid' }, [
    stat('Usuarios totales', users.length, '#00f6ff'),
    stat('Plan Gratis', byPlan.free, '#33ff99'),
    stat('Plan Pro', byPlan.pro, '#00f6ff'),
    stat('Plan Elite', byPlan.elite, '#c084fc'),
    stat('Administradores', admins, '#fbbf24'),
    stat('Consultas hoy', queriesToday, '#ff7a18'),
  ]))

  // Ingresos mensuales estimados (demo)
  const mrr = (byPlan.pro * PLANS.pro.price + byPlan.elite * PLANS.elite.price).toFixed(2)
  bodyEl.appendChild(el('div', { class: 'adm-mrr' }, [
    el('span', { text: 'Ingreso mensual recurrente estimado (MRR): ' }),
    el('b', { text: `$${mrr}` }),
  ]))
}

// ---------- Pestaña: Usuarios ----------
function renderUsers() {
  const me = currentUser()
  const users = getUsers()

  const table = el('div', { class: 'adm-table' })
  table.appendChild(el('div', { class: 'adm-row adm-head' }, [
    el('span', { text: 'Usuario' }),
    el('span', { text: 'Rol' }),
    el('span', { text: 'Plan' }),
    el('span', { text: 'Uso hoy' }),
    el('span', { text: 'Estado' }),
    el('span', { text: 'Acciones' }),
  ]))

  users.forEach((u) => {
    // Plan
    const planSel = el('select', { class: 'adm-mini-select' },
      PLAN_ORDER.map((p) => el('option', { value: p, text: PLANS[p].name, ...(u.plan === p ? { selected: 'selected' } : {}) })),
    )
    planSel.addEventListener('change', () => { setUserPlan(u.id, planSel.value); refresh() })

    // Rol
    const roleSel = el('select', { class: 'adm-mini-select' }, [
      el('option', { value: 'user', text: 'user', ...(u.role === 'user' ? { selected: 'selected' } : {}) }),
      el('option', { value: 'admin', text: 'admin', ...(u.role === 'admin' ? { selected: 'selected' } : {}) }),
    ])
    roleSel.addEventListener('change', () => { setUserRole(u.id, roleSel.value); refresh() })

    const limit = dailyLimitFor(u)
    const usageTxt = `${getUserUsage(u.id)} / ${limit === Infinity ? '∞' : limit}`

    // Estado
    const statusBtn = el('button', {
      class: `adm-status ${u.status === 'suspended' ? 'sus' : 'act'}`,
      text: u.status === 'suspended' ? 'Suspendido' : 'Activo',
    })
    statusBtn.addEventListener('click', () => {
      setUserStatus(u.id, u.status === 'suspended' ? 'active' : 'suspended')
      refresh()
    })

    // Eliminar (no a uno mismo)
    const delBtn = el('button', { class: 'adm-del', text: '🗑', title: 'Eliminar usuario' })
    if (u.id === me.id) { delBtn.disabled = true; delBtn.title = 'No puedes eliminarte a ti mismo' }
    delBtn.addEventListener('click', () => {
      if (confirm(`¿Eliminar al usuario "${u.username}"?`)) { removeUser(u.id); refresh() }
    })

    table.appendChild(el('div', { class: 'adm-row' }, [
      el('div', { class: 'adm-user' }, [
        el('span', { class: 'adm-uname', text: u.username }),
        el('span', { class: 'adm-umail', text: u.email || '' }),
      ]),
      roleSel,
      planSel,
      el('span', { class: 'adm-usage', text: usageTxt }),
      statusBtn,
      delBtn,
    ]))
  })

  bodyEl.appendChild(table)
}

// ---------- Pestaña: IA ----------
function renderAI() {
  const cfg = getAIConfig()

  const enabled = el('input', { type: 'checkbox', ...(cfg.enabled ? { checked: 'checked' } : {}) })
  const provider = el('input', { class: 'tk-input', type: 'text', value: cfg.provider || 'openai' })
  const endpoint = el('input', { class: 'tk-input', type: 'text', value: cfg.endpoint || '' })
  const model = el('input', { class: 'tk-input', type: 'text', value: cfg.model || '' })
  const apiKey = el('input', { class: 'tk-input', type: 'password', value: cfg.apiKey || '', placeholder: 'sk-...' })

  const saveBtn = el('button', { class: 'tk-btn', text: '💾 Guardar configuración' })
  const status = el('div', { class: 'adm-ai-status' })
  saveBtn.addEventListener('click', () => {
    setAIConfig({
      enabled: enabled.checked,
      provider: provider.value.trim(),
      endpoint: endpoint.value.trim(),
      model: model.value.trim(),
      apiKey: apiKey.value.trim(),
    })
    status.textContent = '✓ Guardado. La IA se usará cuando haya internet y una API key válida.'
    status.className = 'adm-ai-status ok'
    onChangeCb?.(currentUser())
  })

  const field = (label, control, hint) =>
    el('div', { class: 'tk-field' }, [el('label', { class: 'tk-label', text: label }), control, hint ? el('div', { class: 'tk-hint', text: hint }) : null])

  bodyEl.appendChild(el('div', { class: 'adm-ai' }, [
    el('div', { class: 'tk-warn' }, [
      el('span', { class: 'tk-warn-icon', text: 'ℹ' }),
      el('span', { text: 'Conecta un modelo compatible con la API de OpenAI. Sin esto, el asistente usa el motor de conocimiento local (siempre funcional). En este sandbox no hay internet; configúralo al desplegar.' }),
    ]),
    el('label', { class: 'tk-check', style: { marginTop: '0.6rem' } }, [enabled, el('span', { text: 'Activar respuestas con IA' })]),
    field('Proveedor', provider, 'Etiqueta informativa (openai, groq, azure…).'),
    field('Endpoint', endpoint, 'URL de chat/completions compatible con OpenAI.'),
    field('Modelo', model, 'p. ej. gpt-4o-mini, llama-3.1-70b…'),
    field('API Key', apiKey, 'Se guarda solo en este navegador (localStorage).'),
    el('div', { class: 'tk-btnrow' }, [saveBtn]),
    status,
  ]))
}

function renderTab(tab) {
  currentTab = tab
  bodyEl.innerHTML = ''
  overlayEl.querySelectorAll('.adm-tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab))
  if (tab === 'users') renderUsers()
  else if (tab === 'stats') renderStats()
  else if (tab === 'ai') renderAI()
}

export function openAdmin(onChange) {
  if (overlayEl) close()
  onChangeCb = onChange

  const tabs = el('div', { class: 'adm-tabs' }, [
    el('button', { class: 'adm-tab active', dataset: { tab: 'users' }, text: '👥 Usuarios', onClick: () => renderTab('users') }),
    el('button', { class: 'adm-tab', dataset: { tab: 'stats' }, text: '📊 Estadísticas', onClick: () => renderTab('stats') }),
    el('button', { class: 'adm-tab', dataset: { tab: 'ai' }, text: '🤖 IA', onClick: () => renderTab('ai') }),
  ])

  bodyEl = el('div', { class: 'adm-body' })

  const modal = el('div', { class: 'adm-modal', onClick: (e) => e.stopPropagation() }, [
    el('div', { class: 'adm-header' }, [
      el('div', { class: 'adm-header-title' }, [
        el('span', { class: 'adm-header-icon', text: '🛠' }),
        el('div', {}, [
          el('div', { class: 'adm-header-name', text: 'Panel de Administración' }),
          el('div', { class: 'adm-header-sub', text: 'Control de usuarios, planes e IA' }),
        ]),
      ]),
      el('button', { class: 'tk-close', text: '✕', 'aria-label': 'Cerrar', onClick: close }),
    ]),
    tabs,
    bodyEl,
  ])

  overlayEl = el('div', { class: 'adm-overlay', onClick: close }, [modal])
  document.body.appendChild(overlayEl)
  requestAnimationFrame(() => overlayEl.classList.add('show'))
  renderTab('users')
}
