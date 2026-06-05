// =============================================================
// CyberOracle · Lógica de respuesta del asistente
// Combina detección de intención + búsqueda y devuelve un
// objeto de mensaje estructurado que la UI sabe renderizar.
// =============================================================
import { search, detectIntent } from './search.js'
import { CATEGORY_MAP } from '../data/categories.js'

const GREETING_REPLIES = [
  'Hola 👋 Soy **CyberOracle**, tu asistente de ciberseguridad. Pregúntame lo que quieras: conceptos, herramientas, OWASP, criptografía, pentesting, defensa, certificaciones... lo que necesites.',
  'Saludos, operador. Sistemas en línea ✅. ¿Sobre qué área de ciberseguridad quieres profundizar hoy?',
]

const THANKS_REPLIES = [
  '¡De nada! 🛡️ Sigue preguntando, estoy aquí para que aprendas y protejas mejor.',
  'Un placer. Recuerda: el conocimiento de seguridad se usa para **proteger**. ¿Seguimos?',
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Genera la respuesta del bot a partir del texto del usuario
export function getResponse(query) {
  const intent = detectIntent(query)

  if (intent === 'empty') {
    return { kind: 'text', text: 'Escribe una pregunta sobre ciberseguridad y te ayudo. 🙂' }
  }
  if (intent === 'greeting') {
    return { kind: 'text', text: pick(GREETING_REPLIES) }
  }
  if (intent === 'thanks') {
    return { kind: 'text', text: pick(THANKS_REPLIES) }
  }
  if (intent === 'help') {
    return { kind: 'help' }
  }

  // Consulta normal -> buscar en la base de conocimiento
  const results = search(query, 5)

  if (results.length === 0) {
    return { kind: 'notfound', query }
  }

  const best = results[0]
  const related = results
    .slice(1)
    .filter((r) => r.score >= Math.max(8, best.score * 0.25))
    .slice(0, 4)
    .map((r) => ({ id: r.entry.id, title: r.entry.title, category: r.entry.category }))

  return {
    kind: 'answer',
    entry: best.entry,
    category: CATEGORY_MAP[best.entry.category],
    confidence: best.score,
    related,
  }
}

// Respuesta directa cuando se hace clic en una entrada concreta
export function getEntryResponse(entry) {
  return {
    kind: 'answer',
    entry,
    category: CATEGORY_MAP[entry.category],
    confidence: 100,
    related: [],
  }
}
