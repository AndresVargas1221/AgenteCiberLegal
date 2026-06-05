// =============================================================
// CyberOracle · Arsenal — Interfaz (modal con herramientas interactivas)
// =============================================================
import { el, copyToClipboard } from './dom.js'
import { currentUser } from './auth.js'
import { canUseTool } from './plans.js'
import { openBilling } from './billingUI.js'
import {
  INTERACTIVE_TOOLS,
  TOOL_REFERENCE,
  digestHex,
  toBase64, fromBase64, toHex, fromHex, urlEncode, urlDecode,
  analyzePassword,
  generatePassword, generatePassphrase,
  decodeJWT,
  identifyHash,
  buildNmap,
  hmacHex, signJWT, cidrInfo, timestampInfo,
  uuidv4, randomToken, convertBase, shannonEntropy,
  caesar, xorToHex, xorFromHex, testRegex, formatJSON, analyzeHeaders,
} from './tools.js'

let overlayEl = null
let panelEl = null
let navEl = null
let currentId = null

// ---------- Toast ----------
function toast(msg) {
  const t = el('div', { class: 'tk-toast', text: msg })
  document.body.appendChild(t)
  requestAnimationFrame(() => t.classList.add('show'))
  setTimeout(() => {
    t.classList.remove('show')
    setTimeout(() => t.remove(), 250)
  }, 1400)
}

function copyBtn(getText, label = 'Copiar') {
  return el('button', {
    class: 'tk-copy',
    text: label,
    onClick: async () => {
      const ok = await copyToClipboard(getText())
      toast(ok ? '✓ Copiado al portapapeles' : 'No se pudo copiar')
    },
  })
}

function field(labelText, control, hint) {
  const children = [el('label', { class: 'tk-label', text: labelText }), control]
  if (hint) children.push(el('div', { class: 'tk-hint', text: hint }))
  return el('div', { class: 'tk-field' }, children)
}

function warningBox(text) {
  return el('div', { class: 'tk-warn' }, [
    el('span', { class: 'tk-warn-icon', text: '⚠' }),
    el('span', { text }),
  ])
}

// ============================================================
// Render de cada herramienta
// ============================================================

function renderHash(panel) {
  const input = el('textarea', { class: 'tk-textarea', rows: '3', placeholder: 'Escribe un texto para calcular su hash…' })
  const results = el('div', { class: 'tk-results' })
  const algos = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']

  async function update() {
    results.innerHTML = ''
    const text = input.value
    if (!text) {
      results.appendChild(el('div', { class: 'tk-empty', text: 'El hash aparecerá aquí.' }))
      return
    }
    for (const algo of algos) {
      const hex = await digestHex(algo, text)
      const valueEl = el('code', { class: 'tk-hash-val', text: hex })
      results.appendChild(el('div', { class: 'tk-hash-row' }, [
        el('span', { class: 'tk-hash-algo', text: algo }),
        valueEl,
        copyBtn(() => hex, '⎘'),
      ]))
    }
  }
  input.addEventListener('input', update)

  panel.appendChild(field('Texto de entrada', input))
  panel.appendChild(el('div', { class: 'tk-note', text: 'MD5/SHA-1 se muestran solo por compatibilidad; para integridad usa SHA-256+.' }))
  panel.appendChild(results)
  update()
}

function renderEncoder(panel) {
  const input = el('textarea', { class: 'tk-textarea', rows: '3', placeholder: 'Texto o dato a transformar…' })
  const mode = el('select', { class: 'tk-select' }, [
    el('option', { value: 'base64', text: 'Base64' }),
    el('option', { value: 'url', text: 'URL' }),
    el('option', { value: 'hex', text: 'Hexadecimal' }),
  ])
  const dir = el('select', { class: 'tk-select' }, [
    el('option', { value: 'enc', text: 'Codificar →' }),
    el('option', { value: 'dec', text: 'Decodificar ←' }),
  ])
  const output = el('textarea', { class: 'tk-textarea tk-output', rows: '3', readonly: 'readonly', placeholder: 'Resultado…' })

  function update() {
    const v = input.value
    if (!v) { output.value = ''; return }
    try {
      const m = mode.value, d = dir.value
      if (m === 'base64') output.value = d === 'enc' ? toBase64(v) : fromBase64(v)
      else if (m === 'url') output.value = d === 'enc' ? urlEncode(v) : urlDecode(v)
      else output.value = d === 'enc' ? toHex(v) : fromHex(v)
    } catch (e) {
      output.value = '⚠ Entrada inválida para esta operación.'
    }
  }
  input.addEventListener('input', update)
  mode.addEventListener('change', update)
  dir.addEventListener('change', update)

  panel.appendChild(el('div', { class: 'tk-row2' }, [
    field('Formato', mode),
    field('Dirección', dir),
  ]))
  panel.appendChild(field('Entrada', input))
  const outField = field('Salida', output)
  outField.appendChild(copyBtn(() => output.value))
  panel.appendChild(outField)
}

function renderPwCheck(panel) {
  const input = el('input', { class: 'tk-input', type: 'text', placeholder: 'Escribe una contraseña para evaluarla…', autocomplete: 'off', spellcheck: 'false' })
  const bar = el('div', { class: 'tk-meter-fill' })
  const meter = el('div', { class: 'tk-meter' }, [bar])
  const labelEl = el('span', { class: 'tk-strength-label', text: '—' })
  const stats = el('div', { class: 'tk-stats' })
  const fb = el('ul', { class: 'tk-feedback' })

  const COLORS = ['#ff3b3b', '#ff7a18', '#fbbf24', '#33ff99', '#00f6ff']

  function update() {
    const r = analyzePassword(input.value)
    const pct = r.level < 0 ? 0 : ((r.level + 1) / 5) * 100
    bar.style.width = pct + '%'
    bar.style.background = r.level < 0 ? '#333' : COLORS[r.level]
    labelEl.textContent = r.label
    labelEl.style.color = r.level < 0 ? 'var(--text-faint)' : COLORS[r.level]

    stats.innerHTML = ''
    stats.appendChild(el('div', { class: 'tk-stat' }, [el('b', { text: String(r.length) }), document.createTextNode(' caracteres')]))
    stats.appendChild(el('div', { class: 'tk-stat' }, [el('b', { text: String(r.entropy) }), document.createTextNode(' bits entropía')]))
    stats.appendChild(el('div', { class: 'tk-stat' }, [document.createTextNode('Crackeo ≈ '), el('b', { text: r.crackTime })]))

    fb.innerHTML = ''
    r.feedback.forEach((f) => fb.appendChild(el('li', { text: f })))
  }
  input.addEventListener('input', update)

  panel.appendChild(field('Contraseña', input, 'Se evalúa 100% en tu navegador. No se envía a ningún lugar.'))
  panel.appendChild(el('div', { class: 'tk-strength-head' }, [el('span', { text: 'Fortaleza' }), labelEl]))
  panel.appendChild(meter)
  panel.appendChild(stats)
  panel.appendChild(fb)
  update()
}

function renderPwGen(panel) {
  // Contraseña aleatoria
  const lenVal = el('span', { class: 'tk-range-val', text: '16' })
  const len = el('input', { class: 'tk-range', type: 'range', min: '8', max: '48', value: '16' })
  const optUpper = el('input', { type: 'checkbox', checked: 'checked' })
  const optLower = el('input', { type: 'checkbox', checked: 'checked' })
  const optDigits = el('input', { type: 'checkbox', checked: 'checked' })
  const optSymbols = el('input', { type: 'checkbox', checked: 'checked' })
  const out = el('input', { class: 'tk-input tk-mono', type: 'text', readonly: 'readonly' })

  function checkbox(node, label) {
    return el('label', { class: 'tk-check' }, [node, el('span', { text: label })])
  }
  function gen() {
    out.value = generatePassword({
      length: Number(len.value),
      upper: optUpper.checked,
      lower: optLower.checked,
      digits: optDigits.checked,
      symbols: optSymbols.checked,
    })
  }
  len.addEventListener('input', () => { lenVal.textContent = len.value; gen() })
  ;[optUpper, optLower, optDigits, optSymbols].forEach((c) => c.addEventListener('change', gen))

  panel.appendChild(field('Longitud', el('div', { class: 'tk-range-wrap' }, [len, lenVal])))
  panel.appendChild(el('div', { class: 'tk-checks' }, [
    checkbox(optLower, 'minúsculas'),
    checkbox(optUpper, 'MAYÚSCULAS'),
    checkbox(optDigits, 'números'),
    checkbox(optSymbols, 'símbolos'),
  ]))
  const outField = field('Contraseña generada', out)
  outField.appendChild(el('div', { class: 'tk-btnrow' }, [
    el('button', { class: 'tk-btn', text: '↻ Generar', onClick: gen }),
    copyBtn(() => out.value),
  ]))
  panel.appendChild(outField)

  // Frase de paso
  panel.appendChild(el('div', { class: 'tk-divider' }))
  const phraseOut = el('input', { class: 'tk-input tk-mono', type: 'text', readonly: 'readonly' })
  const wordsVal = el('span', { class: 'tk-range-val', text: '4' })
  const words = el('input', { class: 'tk-range', type: 'range', min: '3', max: '8', value: '4' })
  function genPhrase() { phraseOut.value = generatePassphrase(Number(words.value)) }
  words.addEventListener('input', () => { wordsVal.textContent = words.value; genPhrase() })

  panel.appendChild(field('Frase de paso · nº de palabras', el('div', { class: 'tk-range-wrap' }, [words, wordsVal]), 'Las frases largas son fáciles de recordar y muy difíciles de crackear.'))
  const pField = field('Frase generada', phraseOut)
  pField.appendChild(el('div', { class: 'tk-btnrow' }, [
    el('button', { class: 'tk-btn', text: '↻ Generar', onClick: genPhrase }),
    copyBtn(() => phraseOut.value),
  ]))
  panel.appendChild(pField)

  gen()
  genPhrase()
}

function renderJWT(panel) {
  const input = el('textarea', { class: 'tk-textarea tk-mono', rows: '4', placeholder: 'Pega un token JWT (xxxxx.yyyyy.zzzzz)…' })
  const out = el('div', { class: 'tk-jwt-out' })

  function jsonBlock(title, obj, cls) {
    return el('div', { class: 'tk-jwt-section' }, [
      el('div', { class: `tk-jwt-title ${cls}`, text: title }),
      el('pre', { class: 'tk-jwt-pre' }, [el('code', { text: JSON.stringify(obj, null, 2) })]),
    ])
  }
  function update() {
    out.innerHTML = ''
    if (!input.value.trim()) { out.appendChild(el('div', { class: 'tk-empty', text: 'El contenido decodificado aparecerá aquí.' })); return }
    const r = decodeJWT(input.value)
    if (r.error) { out.appendChild(el('div', { class: 'tk-warn' }, [el('span', { class: 'tk-warn-icon', text: '⚠' }), el('span', { text: r.error })])); return }
    out.appendChild(jsonBlock('HEADER', r.header, 'h-red'))
    out.appendChild(jsonBlock('PAYLOAD', r.payload, 'h-violet'))
    if (r.notes && r.notes.length) {
      const ul = el('ul', { class: 'tk-feedback' })
      r.notes.forEach((n) => ul.appendChild(el('li', { text: n })))
      out.appendChild(ul)
    }
    out.appendChild(el('div', { class: 'tk-note', text: 'La firma NO se verifica (eso requiere la clave secreta). Esto solo decodifica el contenido.' }))
  }
  input.addEventListener('input', update)
  panel.appendChild(field('Token JWT', input))
  panel.appendChild(out)
  update()
}

function renderHashId(panel) {
  const input = el('input', { class: 'tk-input tk-mono', type: 'text', placeholder: 'Pega un hash para identificarlo…' })
  const out = el('div', { class: 'tk-results' })
  function update() {
    out.innerHTML = ''
    if (!input.value.trim()) { out.appendChild(el('div', { class: 'tk-empty', text: 'Los posibles tipos aparecerán aquí.' })); return }
    const guesses = identifyHash(input.value)
    out.appendChild(el('div', { class: 'tk-tags' }, guesses.map((g) => el('span', { class: 'tk-tag', text: g }))))
  }
  input.addEventListener('input', update)
  panel.appendChild(field('Hash', input))
  panel.appendChild(out)
  update()
}

function renderNmap(panel) {
  const target = el('input', { class: 'tk-input tk-mono', type: 'text', value: '192.168.1.0/24' })
  const scanType = el('select', { class: 'tk-select' }, [
    el('option', { value: '-sS', text: 'SYN scan (-sS)' }),
    el('option', { value: '-sT', text: 'Connect scan (-sT)' }),
    el('option', { value: '-sU', text: 'UDP scan (-sU)' }),
    el('option', { value: '-sn', text: 'Ping sweep (-sn)' }),
  ])
  const ports = el('select', { class: 'tk-select' }, [
    el('option', { value: 'top', text: 'Top 1000 (por defecto)' }),
    el('option', { value: 'all', text: 'Todos (-p-)' }),
    el('option', { value: 'custom', text: 'Personalizado' }),
  ])
  const customPorts = el('input', { class: 'tk-input tk-mono', type: 'text', value: '80,443,22', style: { display: 'none' } })
  const timing = el('select', { class: 'tk-select' }, [
    el('option', { value: '-T3', text: 'Normal (-T3)' }),
    el('option', { value: '-T4', text: 'Rápido (-T4)', selected: 'selected' }),
    el('option', { value: '-T2', text: 'Sigiloso (-T2)' }),
  ])
  const cVer = el('input', { type: 'checkbox', checked: 'checked' })
  const cScripts = el('input', { type: 'checkbox', checked: 'checked' })
  const cOs = el('input', { type: 'checkbox' })
  const cVuln = el('input', { type: 'checkbox' })
  const out = el('code', { class: 'tk-cmd' })

  function checkbox(node, label) {
    return el('label', { class: 'tk-check' }, [node, el('span', { text: label })])
  }
  function update() {
    customPorts.style.display = ports.value === 'custom' ? '' : 'none'
    out.textContent = buildNmap({
      target: target.value,
      scanType: scanType.value,
      ports: ports.value,
      customPorts: customPorts.value,
      serviceVersion: cVer.checked,
      defaultScripts: cScripts.checked,
      osDetect: cOs.checked,
      vulnScripts: cVuln.checked,
      timing: timing.value,
    })
  }
  ;[target, customPorts].forEach((n) => n.addEventListener('input', update))
  ;[scanType, ports, timing, cVer, cScripts, cOs, cVuln].forEach((n) => n.addEventListener('change', update))

  panel.appendChild(field('Objetivo (IP / rango / dominio)', target))
  panel.appendChild(el('div', { class: 'tk-row2' }, [field('Tipo de escaneo', scanType), field('Velocidad', timing)]))
  panel.appendChild(field('Puertos', ports))
  panel.appendChild(field('Puertos personalizados', customPorts))
  panel.appendChild(el('div', { class: 'tk-checks' }, [
    checkbox(cVer, 'versión (-sV)'),
    checkbox(cScripts, 'scripts (-sC)'),
    checkbox(cOs, 'SO (-O)'),
    checkbox(cVuln, 'vuln scripts'),
  ]))
  const cmdField = el('div', { class: 'tk-field' }, [
    el('label', { class: 'tk-label', text: 'Comando generado' }),
    el('div', { class: 'tk-cmd-wrap' }, [out]),
  ])
  cmdField.appendChild(copyBtn(() => out.textContent))
  panel.appendChild(cmdField)
  panel.appendChild(warningBox('Esta herramienta solo GENERA el comando. Ejecútalo únicamente contra sistemas propios o con autorización por escrito.'))
  update()
}

function renderReference(panel, filterName) {
  const search = el('input', { class: 'tk-input', type: 'text', placeholder: 'Buscar herramienta… (nmap, sqlmap, hydra…)' })
  const list = el('div', { class: 'tk-ref-list' })
  const names = Object.keys(TOOL_REFERENCE).sort((a, b) => a.localeCompare(b))

  function build(filter) {
    list.innerHTML = ''
    const f = (filter || '').toLowerCase()
    const filtered = names.filter((n) => n.toLowerCase().includes(f))
    if (filtered.length === 0) {
      list.appendChild(el('div', { class: 'tk-empty', text: 'Sin coincidencias.' }))
      return
    }
    filtered.forEach((name) => {
      const ref = TOOL_REFERENCE[name]
      const examples = el('div', { class: 'tk-ref-examples' },
        ref.examples.map((ex) => el('div', { class: 'tk-ref-ex' }, [
          el('code', { text: ex }),
          copyBtn(() => ex, '⎘'),
        ])),
      )
      list.appendChild(el('div', { class: 'tk-ref-card' }, [
        el('div', { class: 'tk-ref-head' }, [
          el('span', { class: 'tk-ref-name', text: name }),
          el('a', { class: 'tk-ref-link', href: ref.url, target: '_blank', rel: 'noopener noreferrer', text: 'docs ↗' }),
        ]),
        el('div', { class: 'tk-ref-what', text: ref.what }),
        examples,
      ]))
    })
  }
  search.addEventListener('input', () => build(search.value))
  panel.appendChild(field('Cheat-sheets de herramientas CLI', search))
  panel.appendChild(warningBox('Uso educativo. Ejecuta estas herramientas solo en sistemas propios o autorizados.'))
  panel.appendChild(list)
  if (filterName) search.value = filterName
  build(filterName || '')
}

// ============================================================
// Render de herramientas nuevas (v2)
// ============================================================

function renderHmac(panel) {
  const hashSel = el('select', { class: 'tk-select' }, [
    el('option', { value: 'SHA-256', text: 'HMAC-SHA256' }),
    el('option', { value: 'SHA-384', text: 'HMAC-SHA384' }),
    el('option', { value: 'SHA-512', text: 'HMAC-SHA512' }),
  ])
  const key = el('input', { class: 'tk-input tk-mono', type: 'text', placeholder: 'Clave secreta' })
  const msg = el('textarea', { class: 'tk-textarea', rows: '3', placeholder: 'Mensaje a autenticar…' })
  const out = el('code', { class: 'tk-hash-val' })
  async function update() {
    if (!key.value || !msg.value) { out.textContent = '(introduce clave y mensaje)'; return }
    out.textContent = await hmacHex(hashSel.value, key.value, msg.value)
  }
  ;[key, msg].forEach((n) => n.addEventListener('input', update))
  hashSel.addEventListener('change', update)
  panel.appendChild(field('Algoritmo', hashSel))
  panel.appendChild(field('Clave', key))
  panel.appendChild(field('Mensaje', msg))
  const outF = el('div', { class: 'tk-field' }, [el('label', { class: 'tk-label', text: 'HMAC (hex)' }), el('div', { class: 'tk-cmd-wrap' }, [out])])
  outF.appendChild(copyBtn(() => out.textContent))
  panel.appendChild(outF)
  update()
}

function renderJwtSign(panel) {
  const alg = el('select', { class: 'tk-select' }, [
    el('option', { value: 'HS256', text: 'HS256' }),
    el('option', { value: 'HS384', text: 'HS384' }),
    el('option', { value: 'HS512', text: 'HS512' }),
  ])
  const payload = el('textarea', { class: 'tk-textarea tk-mono', rows: '5', text: '{\n  "sub": "1234",\n  "name": "Ada",\n  "role": "user"\n}' })
  const secret = el('input', { class: 'tk-input tk-mono', type: 'text', value: 'mi-clave-secreta' })
  const out = el('code', { class: 'tk-cmd' })
  async function update() {
    try {
      const obj = JSON.parse(payload.value)
      out.textContent = await signJWT(obj, secret.value, alg.value)
    } catch {
      out.textContent = '⚠ El payload debe ser JSON válido.'
    }
  }
  ;[payload, secret].forEach((n) => n.addEventListener('input', update))
  alg.addEventListener('change', update)
  panel.appendChild(field('Algoritmo', alg))
  panel.appendChild(field('Payload (JSON)', payload))
  panel.appendChild(field('Secreto (HMAC)', secret))
  const outF = el('div', { class: 'tk-field' }, [el('label', { class: 'tk-label', text: 'JWT firmado' }), el('div', { class: 'tk-cmd-wrap' }, [out])])
  outF.appendChild(copyBtn(() => out.textContent))
  panel.appendChild(outF)
  panel.appendChild(el('div', { class: 'tk-note', text: 'Genera tokens para pruebas en TUS propias aplicaciones.' }))
  update()
}

function renderCidr(panel) {
  const input = el('input', { class: 'tk-input tk-mono', type: 'text', value: '192.168.1.0/24' })
  const out = el('div', { class: 'tk-results' })
  function row(label, value) {
    return el('div', { class: 'tk-hash-row' }, [
      el('span', { class: 'tk-hash-algo', text: label }),
      el('code', { class: 'tk-hash-val', text: String(value) }),
    ])
  }
  function update() {
    out.innerHTML = ''
    const r = cidrInfo(input.value)
    if (r.error) { out.appendChild(el('div', { class: 'tk-warn' }, [el('span', { class: 'tk-warn-icon', text: '⚠' }), el('span', { text: r.error })])); return }
    out.appendChild(row('Red', r.network + r.cidr))
    out.appendChild(row('Máscara', r.mask))
    out.appendChild(row('Wildcard', r.wildcard))
    out.appendChild(row('Broadcast', r.broadcast))
    out.appendChild(row('Rango útil', `${r.first}  –  ${r.last}`))
    out.appendChild(row('Hosts útiles', r.usableHosts.toLocaleString()))
    out.appendChild(row('Total dir.', r.totalHosts.toLocaleString()))
  }
  input.addEventListener('input', update)
  panel.appendChild(field('Red en notación CIDR', input, 'Ejemplo: 10.0.0.0/8, 192.168.1.0/24'))
  panel.appendChild(out)
  update()
}

function renderTimestamp(panel) {
  const input = el('input', { class: 'tk-input tk-mono', type: 'text', placeholder: 'Epoch (seg/ms) o fecha ISO…' })
  const nowBtn = el('button', { class: 'tk-btn', text: '⌚ Ahora', onClick: () => { input.value = String(Math.floor(Date.now() / 1000)); update() } })
  const out = el('div', { class: 'tk-results' })
  function row(label, value) {
    return el('div', { class: 'tk-hash-row' }, [
      el('span', { class: 'tk-hash-algo', text: label }),
      el('code', { class: 'tk-hash-val', text: String(value) }),
      copyBtn(() => String(value), '⎘'),
    ])
  }
  function update() {
    out.innerHTML = ''
    const r = timestampInfo(input.value)
    if (!r) { out.appendChild(el('div', { class: 'tk-empty', text: 'Introduce un valor o pulsa "Ahora".' })); return }
    if (r.error) { out.appendChild(el('div', { class: 'tk-warn' }, [el('span', { class: 'tk-warn-icon', text: '⚠' }), el('span', { text: r.error })])); return }
    out.appendChild(row('Epoch (s)', r.epochSec))
    out.appendChild(row('Epoch (ms)', r.epochMs))
    out.appendChild(row('ISO 8601', r.iso))
    out.appendChild(row('UTC', r.utc))
    out.appendChild(row('Local', r.local))
    out.appendChild(row('Relativo', r.relative))
  }
  input.addEventListener('input', update)
  const f = field('Valor', input)
  f.appendChild(el('div', { class: 'tk-btnrow' }, [nowBtn]))
  panel.appendChild(f)
  panel.appendChild(out)
  update()
}

function renderUuid(panel) {
  const uuidOut = el('input', { class: 'tk-input tk-mono', type: 'text', readonly: 'readonly' })
  function genU() { uuidOut.value = uuidv4() }
  const uF = field('UUID v4', uuidOut)
  uF.appendChild(el('div', { class: 'tk-btnrow' }, [el('button', { class: 'tk-btn', text: '↻ Generar UUID', onClick: genU }), copyBtn(() => uuidOut.value)]))
  panel.appendChild(uF)

  panel.appendChild(el('div', { class: 'tk-divider' }))

  const bytesVal = el('span', { class: 'tk-range-val', text: '32' })
  const bytes = el('input', { class: 'tk-range', type: 'range', min: '8', max: '64', value: '32' })
  const fmt = el('select', { class: 'tk-select' }, [
    el('option', { value: 'hex', text: 'Hexadecimal' }),
    el('option', { value: 'base64url', text: 'Base64URL' }),
    el('option', { value: 'base64', text: 'Base64' }),
  ])
  const tokOut = el('input', { class: 'tk-input tk-mono', type: 'text', readonly: 'readonly' })
  function genT() { tokOut.value = randomToken(Number(bytes.value), fmt.value) }
  bytes.addEventListener('input', () => { bytesVal.textContent = bytes.value; genT() })
  fmt.addEventListener('change', genT)
  panel.appendChild(field('Tamaño del token (bytes)', el('div', { class: 'tk-range-wrap' }, [bytes, bytesVal])))
  panel.appendChild(field('Formato', fmt))
  const tF = field('Token aleatorio seguro', tokOut)
  tF.appendChild(el('div', { class: 'tk-btnrow' }, [el('button', { class: 'tk-btn', text: '↻ Generar token', onClick: genT }), copyBtn(() => tokOut.value)]))
  panel.appendChild(tF)
  genU()
  genT()
}

function renderBase(panel) {
  const fromBase = el('select', { class: 'tk-select' }, [
    el('option', { value: '10', text: 'Decimal' }),
    el('option', { value: '2', text: 'Binario' }),
    el('option', { value: '8', text: 'Octal' }),
    el('option', { value: '16', text: 'Hexadecimal' }),
  ])
  const input = el('input', { class: 'tk-input tk-mono', type: 'text', placeholder: 'Introduce un número…' })
  const out = el('div', { class: 'tk-results' })
  function row(label, value) {
    return el('div', { class: 'tk-hash-row' }, [
      el('span', { class: 'tk-hash-algo', text: label }),
      el('code', { class: 'tk-hash-val', text: value }),
      copyBtn(() => value, '⎘'),
    ])
  }
  function update() {
    out.innerHTML = ''
    if (!input.value.trim()) { out.appendChild(el('div', { class: 'tk-empty', text: 'El resultado en todas las bases aparecerá aquí.' })); return }
    const r = convertBase(input.value, Number(fromBase.value))
    if (r.error) { out.appendChild(el('div', { class: 'tk-warn' }, [el('span', { class: 'tk-warn-icon', text: '⚠' }), el('span', { text: r.error })])); return }
    out.appendChild(row('Binario', r.bin))
    out.appendChild(row('Octal', r.oct))
    out.appendChild(row('Decimal', r.dec))
    out.appendChild(row('Hex', r.hex))
  }
  ;[input].forEach((n) => n.addEventListener('input', update))
  fromBase.addEventListener('change', update)
  panel.appendChild(field('Base de entrada', fromBase))
  panel.appendChild(field('Número', input))
  panel.appendChild(out)
  update()
}

function renderEntropy(panel) {
  const input = el('textarea', { class: 'tk-textarea', rows: '3', placeholder: 'Texto para medir su entropía de Shannon…' })
  const stats = el('div', { class: 'tk-stats' })
  function update() {
    const r = shannonEntropy(input.value)
    stats.innerHTML = ''
    stats.appendChild(el('div', { class: 'tk-stat' }, [el('b', { text: r.perChar.toFixed(2) }), document.createTextNode(' bits/carácter')]))
    stats.appendChild(el('div', { class: 'tk-stat' }, [el('b', { text: Math.round(r.bits) + '' }), document.createTextNode(' bits totales')]))
    stats.appendChild(el('div', { class: 'tk-stat' }, [el('b', { text: String(r.len) }), document.createTextNode(' caracteres')]))
  }
  input.addEventListener('input', update)
  panel.appendChild(field('Texto', input, 'La entropía de Shannon mide la imprevisibilidad de los datos.'))
  panel.appendChild(stats)
  update()
}

function renderRot(panel) {
  const input = el('textarea', { class: 'tk-textarea', rows: '3', placeholder: 'Texto a cifrar/descifrar…' })
  const shiftVal = el('span', { class: 'tk-range-val', text: '13' })
  const shift = el('input', { class: 'tk-range', type: 'range', min: '0', max: '25', value: '13' })
  const out = el('textarea', { class: 'tk-textarea tk-output', rows: '3', readonly: 'readonly' })
  function update() { out.value = caesar(input.value, Number(shift.value)) }
  input.addEventListener('input', update)
  shift.addEventListener('input', () => { shiftVal.textContent = shift.value; update() })
  panel.appendChild(field('Entrada', input))
  panel.appendChild(field('Desplazamiento (13 = ROT13)', el('div', { class: 'tk-range-wrap' }, [shift, shiftVal])))
  const outF = field('Salida', out)
  outF.appendChild(copyBtn(() => out.value))
  panel.appendChild(outF)
  update()
}

function renderXor(panel) {
  const dir = el('select', { class: 'tk-select' }, [
    el('option', { value: 'enc', text: 'Texto → XOR (hex)' }),
    el('option', { value: 'dec', text: 'XOR (hex) → Texto' }),
  ])
  const key = el('input', { class: 'tk-input tk-mono', type: 'text', placeholder: 'Clave', value: 'clave' })
  const input = el('textarea', { class: 'tk-textarea tk-mono', rows: '3', placeholder: 'Entrada…' })
  const out = el('textarea', { class: 'tk-textarea tk-output tk-mono', rows: '3', readonly: 'readonly' })
  function update() {
    try {
      out.value = dir.value === 'enc' ? xorToHex(input.value, key.value) : xorFromHex(input.value, key.value)
    } catch { out.value = '⚠ Entrada inválida.' }
  }
  ;[key, input].forEach((n) => n.addEventListener('input', update))
  dir.addEventListener('change', update)
  panel.appendChild(field('Dirección', dir))
  panel.appendChild(field('Clave', key))
  panel.appendChild(field('Entrada', input))
  const outF = field('Salida', out)
  outF.appendChild(copyBtn(() => out.value))
  panel.appendChild(outF)
  panel.appendChild(el('div', { class: 'tk-note', text: 'XOR es educativo; no es cifrado seguro por sí solo.' }))
  update()
}

function renderRegex(panel) {
  const pattern = el('input', { class: 'tk-input tk-mono', type: 'text', placeholder: 'Patrón, p. ej. \\d{3}-\\d{4}' })
  const flags = el('input', { class: 'tk-input tk-mono', type: 'text', value: 'gi', placeholder: 'flags (g,i,m,s)' })
  const text = el('textarea', { class: 'tk-textarea', rows: '4', placeholder: 'Texto donde buscar…' })
  const out = el('div', { class: 'tk-results' })
  function update() {
    out.innerHTML = ''
    if (!pattern.value || !text.value) { out.appendChild(el('div', { class: 'tk-empty', text: 'Las coincidencias aparecerán aquí.' })); return }
    const r = testRegex(pattern.value, flags.value || '', text.value)
    if (!r.ok) { out.appendChild(el('div', { class: 'tk-warn' }, [el('span', { class: 'tk-warn-icon', text: '⚠' }), el('span', { text: 'Regex inválida: ' + r.error })])); return }
    out.appendChild(el('div', { class: 'tk-stat' }, [el('b', { text: String(r.count) }), document.createTextNode(' coincidencias')]))
    if (r.matches.length) out.appendChild(el('div', { class: 'tk-tags' }, r.matches.map((m) => el('span', { class: 'tk-tag', text: m || '(vacío)' }))))
  }
  ;[pattern, flags, text].forEach((n) => n.addEventListener('input', update))
  panel.appendChild(el('div', { class: 'tk-row2' }, [field('Patrón', pattern), field('Flags', flags)]))
  panel.appendChild(field('Texto', text))
  panel.appendChild(out)
  update()
}

function renderJson(panel) {
  const input = el('textarea', { class: 'tk-textarea tk-mono', rows: '6', placeholder: 'Pega JSON aquí…' })
  const out = el('pre', { class: 'tk-jwt-pre' }, [el('code', { class: 'tk-json-out' })])
  const codeEl = out.querySelector('code')
  const status = el('div', { class: 'adm-ai-status' })
  function update() {
    if (!input.value.trim()) { codeEl.textContent = ''; status.textContent = ''; return }
    const r = formatJSON(input.value)
    if (!r.ok) { codeEl.textContent = ''; status.textContent = '⚠ JSON inválido: ' + r.error; status.className = 'adm-ai-status err'; return }
    codeEl.textContent = r.pretty
    status.textContent = '✓ JSON válido'
    status.className = 'adm-ai-status ok'
  }
  input.addEventListener('input', update)
  panel.appendChild(field('Entrada', input))
  panel.appendChild(status)
  const outF = el('div', { class: 'tk-field' }, [el('label', { class: 'tk-label', text: 'Formateado' }), out])
  outF.appendChild(copyBtn(() => codeEl.textContent))
  panel.appendChild(outF)
}

function renderHttpHeaders(panel) {
  const input = el('textarea', { class: 'tk-textarea tk-mono', rows: '6', placeholder: 'Pega las cabeceras de respuesta HTTP…\nEj:\nStrict-Transport-Security: max-age=63072000\nContent-Security-Policy: default-src \'self\'' })
  const out = el('div', {})
  function update() {
    out.innerHTML = ''
    if (!input.value.trim()) { out.appendChild(el('div', { class: 'tk-empty', text: 'El análisis aparecerá aquí.' })); return }
    const r = analyzeHeaders(input.value)
    const color = r.score >= 80 ? '#33ff99' : r.score >= 50 ? '#fbbf24' : '#ff4d6d'
    out.appendChild(el('div', { class: 'tk-score', style: { '--c': color } }, [
      el('span', { class: 'tk-score-num', text: r.score + '%' }),
      el('span', { class: 'tk-score-label', text: 'cabeceras de seguridad presentes' }),
    ]))
    const list = el('div', { class: 'tk-results' })
    r.results.forEach((c) => {
      list.appendChild(el('div', { class: 'tk-hash-row' }, [
        el('span', { class: 'tk-hash-algo', style: { color: c.present ? '#33ff99' : '#ff4d6d', width: '90px' }, text: c.present ? '✓ presente' : '✗ falta' }),
        el('span', { class: 'tk-hash-val', text: c.name + (c.value ? ' — ' + c.value : ' — ' + c.good) }),
      ]))
    })
    out.appendChild(list)
    r.warns.forEach((w) => out.appendChild(el('div', { class: 'tk-warn' }, [el('span', { class: 'tk-warn-icon', text: '⚠' }), el('span', { text: w })])))
  }
  input.addEventListener('input', update)
  panel.appendChild(field('Cabeceras HTTP', input))
  panel.appendChild(out)
  update()
}

// ============================================================
// Modal
// ============================================================
const RENDERERS = {
  hash: renderHash,
  hmac: renderHmac,
  encoder: renderEncoder,
  base: renderBase,
  pwcheck: renderPwCheck,
  pwgen: renderPwGen,
  entropy: renderEntropy,
  jwt: renderJWT,
  jwtsign: renderJwtSign,
  hashid: renderHashId,
  uuid: renderUuid,
  timestamp: renderTimestamp,
  cidr: renderCidr,
  rot: renderRot,
  xor: renderXor,
  regex: renderRegex,
  json: renderJson,
  httpheaders: renderHttpHeaders,
  nmap: renderNmap,
}

function selectTool(id, refName) {
  currentId = id
  panelEl.innerHTML = ''
  navEl.querySelectorAll('.tk-nav-item').forEach((b) => b.classList.toggle('active', b.dataset.id === id))

  let title, sub
  if (id === 'reference') {
    title = 'Referencia · Cheat-sheets'
    sub = 'Uso y ejemplos de las herramientas CLI'
  } else {
    const meta = INTERACTIVE_TOOLS.find((t) => t.id === id)
    title = meta?.name || ''
    sub = meta?.desc || ''
  }
  panelEl.appendChild(el('div', { class: 'tk-panel-head' }, [
    el('h3', { class: 'tk-panel-title', text: title }),
    el('p', { class: 'tk-panel-sub', text: sub }),
  ]))
  const body = el('div', { class: 'tk-panel-body' })
  panelEl.appendChild(body)

  // Gating por plan
  if (id !== 'reference' && !canUseTool(currentUser(), id)) {
    renderLocked(body, title)
    return
  }

  if (id === 'reference') renderReference(body, refName)
  else RENDERERS[id]?.(body)
}

// Panel mostrado cuando la herramienta no está incluida en el plan
function renderLocked(panel, toolName) {
  panel.appendChild(el('div', { class: 'tk-locked' }, [
    el('div', { class: 'tk-locked-icon', text: '🔒' }),
    el('h3', { class: 'tk-locked-title', text: `"${toolName}" no está en tu plan` }),
    el('p', { class: 'tk-locked-text', text: 'Mejora tu plan para desbloquear esta y otras herramientas avanzadas del Arsenal.' }),
    el('button', {
      class: 'tk-btn',
      text: '⭐ Ver planes',
      onClick: () => { closeToolkit(); openBilling() },
    }),
  ]))
}

function buildModal() {
  navEl = el('nav', { class: 'tk-nav' })

  INTERACTIVE_TOOLS.forEach((t) => {
    const locked = !canUseTool(currentUser(), t.id)
    const btn = el('button', {
      class: `tk-nav-item ${locked ? 'locked' : ''}`,
      dataset: { id: t.id },
      onClick: () => selectTool(t.id),
    }, [
      el('span', { class: 'tk-nav-icon', style: { '--c': t.color }, text: t.icon }),
      el('span', { class: 'tk-nav-text' }, [
        el('span', { class: 'tk-nav-name', text: t.name }),
        el('span', { class: 'tk-nav-desc', text: t.desc }),
      ]),
      locked ? el('span', { class: 'tk-lock', title: 'Requiere mejorar el plan', text: '🔒' }) : null,
    ])
    navEl.appendChild(btn)
  })
  // Referencia
  const refBtn = el('button', {
    class: 'tk-nav-item',
    dataset: { id: 'reference' },
    onClick: () => selectTool('reference'),
  }, [
    el('span', { class: 'tk-nav-icon', style: { '--c': '#94a3b8' }, text: '📖' }),
    el('span', { class: 'tk-nav-text' }, [
      el('span', { class: 'tk-nav-name', text: 'Referencia CLI' }),
      el('span', { class: 'tk-nav-desc', text: 'Cheat-sheets y enlaces' }),
    ]),
  ])
  navEl.appendChild(refBtn)

  panelEl = el('div', { class: 'tk-panel' })

  const header = el('div', { class: 'tk-header' }, [
    el('div', { class: 'tk-header-title' }, [
      el('span', { class: 'tk-header-icon', text: '🧰' }),
      el('div', {}, [
        el('div', { class: 'tk-header-name', text: 'Arsenal de Herramientas' }),
        el('div', { class: 'tk-header-sub', text: 'Utilidades que funcionan aquí mismo · 100% en tu navegador' }),
      ]),
    ]),
    el('button', { class: 'tk-close', text: '✕', 'aria-label': 'Cerrar', onClick: closeToolkit }),
  ])

  const modal = el('div', { class: 'tk-modal', onClick: (e) => e.stopPropagation() }, [
    header,
    el('div', { class: 'tk-body' }, [navEl, panelEl]),
  ])

  overlayEl = el('div', { class: 'tk-overlay', onClick: closeToolkit }, [modal])
  document.body.appendChild(overlayEl)

  document.addEventListener('keydown', escHandler)
}

function escHandler(e) {
  if (e.key === 'Escape') closeToolkit()
}

export function closeToolkit() {
  if (overlayEl) {
    overlayEl.classList.remove('show')
    document.removeEventListener('keydown', escHandler)
    const o = overlayEl
    overlayEl = null
    setTimeout(() => o.remove(), 220)
  }
}

// Abre el Arsenal. opcional: id de herramienta o referencia.
export function openToolkit(initialId, refName) {
  if (overlayEl) closeToolkit()
  buildModal()
  requestAnimationFrame(() => overlayEl.classList.add('show'))
  if (initialId === 'reference') selectTool('reference', refName)
  else selectTool(initialId && RENDERERS[initialId] ? initialId : 'hash')
}
