// =============================================================
// CyberOracle · Motor de búsqueda y respuesta
// Indexa la base de conocimiento y puntúa las consultas del usuario.
// Sin dependencias externas (funciona offline).
// =============================================================
import { KB } from '../data/knowledgeBase.js'

// --- Normalización: minúsculas + quitar acentos + limpiar símbolos ---
export function normalize(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar diacríticos
    .replace(/[^a-z0-9áéíóúñ\s+#.&/-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Palabras vacías en español/inglés que no aportan a la búsqueda
const STOPWORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al', 'a',
  'y', 'o', 'u', 'que', 'qué', 'como', 'cómo', 'es', 'son', 'en', 'por', 'para',
  'con', 'sin', 'su', 'sus', 'lo', 'le', 'me', 'mi', 'tu', 'se', 'sobre', 'cual',
  'cuales', 'cuál', 'cuáles', 'donde', 'cuando', 'quien', 'esto', 'esta', 'este',
  'estos', 'estas', 'hay', 'tiene', 'puede', 'puedo', 'quiero', 'dime', 'dame',
  'explica', 'explicame', 'háblame', 'hablame', 'cuentame', 'cuéntame', 'sirve',
  'funciona', 'the', 'a', 'an', 'of', 'to', 'and', 'or', 'what', 'is', 'are',
  'how', 'about', 'tell', 'me', 'i', 'you', 'do', 'does', 'mas', 'más', 'todo',
])

// Sinónimos / expansión de términos para mejorar el matching
const SYNONYMS = {
  contrasena: ['password', 'clave', 'credencial'],
  contrasenas: ['passwords', 'claves', 'credenciales'],
  password: ['contrasena', 'clave'],
  cifrado: ['encriptacion', 'criptografia', 'encriptar'],
  encriptacion: ['cifrado', 'criptografia'],
  red: ['network', 'redes'],
  redes: ['network', 'red'],
  vulnerabilidad: ['fallo', 'debilidad', 'bug', 'vuln'],
  ataque: ['attack', 'exploit'],
  herramienta: ['tool', 'software', 'programa'],
  herramientas: ['tools', 'programas'],
  hackeo: ['hacking', 'pentest', 'pentesting'],
  hacker: ['pentester', 'pentesting'],
  proteger: ['defensa', 'defender', 'mitigar', 'prevenir'],
  defensa: ['proteger', 'defender', 'mitigacion'],
  nube: ['cloud', 'aws', 'azure'],
  cloud: ['nube'],
  movil: ['mobile', 'android', 'ios', 'celular', 'telefono'],
  certificacion: ['certificado', 'curso', 'oscp', 'ceh'],
  certificaciones: ['certificados', 'cursos'],
  aprender: ['estudiar', 'empezar', 'iniciar', 'comenzar'],
  empezar: ['aprender', 'iniciar', 'comenzar', 'principiante'],
  inyeccion: ['injection', 'sqli'],
  correo: ['email', 'mail', 'phishing'],
  virus: ['malware', 'troyano'],
  cortafuegos: ['firewall'],
}

function tokenize(text) {
  const norm = normalize(text)
  const raw = norm.split(' ').filter((t) => t && !STOPWORDS.has(t))
  const expanded = new Set(raw)
  for (const t of raw) {
    const syns = SYNONYMS[t]
    if (syns) syns.forEach((s) => expanded.add(s))
  }
  return Array.from(expanded)
}

// --- Pre-indexado de la base de conocimiento ---
const INDEX = KB.map((entry) => {
  const keywordText = (entry.keywords || []).join(' ')
  const toolText = (entry.tools || []).join(' ')
  return {
    entry,
    nTitle: normalize(entry.title),
    nKeywords: normalize(keywordText),
    nSummary: normalize(entry.summary),
    nContent: normalize(entry.content),
    nTools: normalize(toolText),
    keywordSet: new Set(normalize(keywordText).split(' ')),
  }
})

// Puntúa una entrada para los tokens dados
function scoreEntry(idx, tokens) {
  let score = 0
  const matched = []
  for (const token of tokens) {
    let hit = 0
    if (idx.keywordSet.has(token)) hit += 12 // match exacto de keyword
    else if (idx.nKeywords.includes(token)) hit += 8
    if (idx.nTitle.includes(token)) hit += 10
    if (idx.nTools.includes(token)) hit += 7
    if (idx.nSummary.includes(token)) hit += 4
    if (idx.nContent.includes(token)) hit += 2
    if (hit > 0) matched.push(token)
    score += hit
  }
  // Bonus por cubrir varios términos de la consulta (relevancia)
  if (tokens.length > 0) {
    score += (matched.length / tokens.length) * 6
  }
  return { score, matched }
}

// Búsqueda principal: devuelve entradas ordenadas por relevancia
export function search(query, limit = 5) {
  const tokens = tokenize(query)
  if (tokens.length === 0) return []
  const results = INDEX.map((idx) => {
    const { score, matched } = scoreEntry(idx, tokens)
    return { entry: idx.entry, score, matched }
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
  return results.slice(0, limit)
}

// Devuelve todas las entradas de una categoría
export function getByCategory(categoryId) {
  return KB.filter((e) => e.category === categoryId)
}

// Devuelve una entrada por id
export function getById(id) {
  return KB.find((e) => e.id === id)
}

// --- Detección de intención (saludos, ayuda, agradecimiento) ---
const GREETINGS = ['hola', 'buenas', 'hey', 'que tal', 'qué tal', 'saludos', 'hi', 'hello', 'ola']
const THANKS = ['gracias', 'thanks', 'genial', 'perfecto', 'excelente', 'crack']
const HELP = ['ayuda', 'help', 'que puedes hacer', 'qué puedes hacer', 'que sabes', 'qué sabes', 'opciones', 'menu', 'menú', 'temas']

export function detectIntent(query) {
  const n = normalize(query)
  if (!n) return 'empty'
  const words = n.split(' ')
  if (GREETINGS.some((g) => n === g || n.startsWith(g + ' ') || words[0] === normalize(g))) {
    if (words.length <= 3) return 'greeting'
  }
  if (THANKS.some((t) => n === normalize(t) || words.includes(normalize(t)))) {
    if (words.length <= 4) return 'thanks'
  }
  if (HELP.some((h) => n.includes(normalize(h)))) return 'help'
  return 'query'
}
