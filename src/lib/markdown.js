// =============================================================
// CyberOracle · Renderizador de Markdown ligero y SEGURO (vanilla)
// Soporta: ## y ### títulos, listas (- y 1.), **negrita**, `código`,
// ```bloques de código```, > citas y párrafos.
// Genera nodos del DOM con textContent (sin innerHTML => sin XSS).
// =============================================================

// Procesa formato inline (**negrita** y `código`) dentro de un contenedor
function appendInline(parent, text) {
  // Primero separamos por código inline para proteger su contenido
  const codeParts = text.split(/(`[^`]+`)/g)
  for (const part of codeParts) {
    if (!part) continue
    if (part.startsWith('`') && part.endsWith('`')) {
      const code = document.createElement('code')
      code.className = 'md-inline-code'
      code.textContent = part.slice(1, -1)
      parent.appendChild(code)
    } else {
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g)
      for (const bp of boldParts) {
        if (!bp) continue
        if (bp.startsWith('**') && bp.endsWith('**')) {
          const strong = document.createElement('strong')
          strong.textContent = bp.slice(2, -2)
          parent.appendChild(strong)
        } else {
          parent.appendChild(document.createTextNode(bp))
        }
      }
    }
  }
}

// Devuelve un DocumentFragment con el markdown renderizado
export function renderMarkdown(md) {
  const frag = document.createDocumentFragment()
  const lines = (md || '').split('\n')
  let i = 0
  let listEl = null
  let listOrdered = false

  const flushList = () => {
    if (listEl) {
      frag.appendChild(listEl)
      listEl = null
    }
  }

  while (i < lines.length) {
    const line = lines[i]

    // Bloque de código ```
    if (line.trim().startsWith('```')) {
      flushList()
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // saltar cierre
      const pre = document.createElement('pre')
      pre.className = 'md-pre'
      const code = document.createElement('code')
      code.textContent = codeLines.join('\n')
      pre.appendChild(code)
      frag.appendChild(pre)
      continue
    }

    // Títulos
    if (line.startsWith('### ')) {
      flushList()
      const h = document.createElement('h4')
      h.className = 'md-h4'
      appendInline(h, line.slice(4))
      frag.appendChild(h)
      i++
      continue
    }
    if (line.startsWith('## ')) {
      flushList()
      const h = document.createElement('h3')
      h.className = 'md-h3'
      appendInline(h, line.slice(3))
      frag.appendChild(h)
      i++
      continue
    }

    // Cita
    if (line.startsWith('> ')) {
      flushList()
      const bq = document.createElement('blockquote')
      bq.className = 'md-quote'
      appendInline(bq, line.slice(2))
      frag.appendChild(bq)
      i++
      continue
    }

    // Lista no ordenada
    if (/^\s*-\s+/.test(line)) {
      if (!listEl || listOrdered) {
        flushList()
        listEl = document.createElement('ul')
        listEl.className = 'md-ul'
        listOrdered = false
      }
      const li = document.createElement('li')
      appendInline(li, line.replace(/^\s*-\s+/, ''))
      listEl.appendChild(li)
      i++
      continue
    }

    // Lista ordenada
    if (/^\s*\d+\.\s+/.test(line)) {
      if (!listEl || !listOrdered) {
        flushList()
        listEl = document.createElement('ol')
        listEl.className = 'md-ol'
        listOrdered = true
      }
      const li = document.createElement('li')
      appendInline(li, line.replace(/^\s*\d+\.\s+/, ''))
      listEl.appendChild(li)
      i++
      continue
    }

    // Línea en blanco
    if (line.trim() === '') {
      flushList()
      i++
      continue
    }

    // Párrafo
    flushList()
    const p = document.createElement('p')
    p.className = 'md-p'
    appendInline(p, line)
    frag.appendChild(p)
    i++
  }
  flushList()
  return frag
}
