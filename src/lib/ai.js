// =============================================================
// CyberOracle · Capa de IA (con respaldo local que NUNCA falla)
//
// Si hay una API configurada (admin) y conexión, consulta un LLM
// compatible con la API de OpenAI. Ante cualquier fallo, devuelve
// null para que la app use el motor de conocimiento local.
//
// IMPORTANTE: en este sandbox no hay internet; la IA real funciona
// cuando despliegues la app en un servidor con acceso a internet y
// configures la API key desde el panel de administración.
// =============================================================
import { getAIConfig } from './store.js'
import { search } from './search.js'

const SYSTEM_PROMPT = [
  'Eres CyberOracle, un asistente experto en ciberseguridad.',
  'Respondes en español, de forma clara, técnica y estructurada (usa markdown).',
  'Tu enfoque es SIEMPRE defensivo, ético y educativo.',
  'No ayudas a atacar sistemas sin autorización ni a crear malware.',
  'Cuando sea útil, menciona herramientas y buenas prácticas.',
].join(' ')

// Construye contexto a partir de la base de conocimiento local (RAG simple)
function buildContext(query) {
  const hits = search(query, 3)
  if (!hits.length) return ''
  return hits
    .map((h) => `## ${h.entry.title}\n${h.entry.summary}\n${h.entry.content}`)
    .join('\n\n---\n\n')
    .slice(0, 6000)
}

export function aiEnabled() {
  const cfg = getAIConfig()
  return !!(cfg && cfg.enabled && cfg.apiKey)
}

// Devuelve { text } si la IA respondió, o null para usar el respaldo local.
export async function askAI(query) {
  const cfg = getAIConfig()
  if (!cfg || !cfg.enabled || !cfg.apiKey) return null
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return null

  const context = buildContext(query)
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: context
        ? `Contexto de la base de conocimiento:\n${context}\n\nPregunta del usuario: ${query}`
        : query,
    },
  ]

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 30000)
    const res = await fetch(cfg.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model || 'gpt-4o-mini',
        messages,
        temperature: 0.3,
        max_tokens: 800,
      }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content
    if (!text) return null
    return { text, source: 'ia' }
  } catch {
    // Cualquier error (red, CORS, timeout, etc.) => respaldo local
    return null
  }
}
