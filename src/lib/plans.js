// =============================================================
// CyberOracle · Planes de suscripción y control de acceso
// =============================================================
import { INTERACTIVE_TOOLS } from './tools.js'

const ALL_TOOL_IDS = INTERACTIVE_TOOLS.map((t) => t.id).concat('reference')

// Herramientas permitidas en el plan gratis (las básicas)
const FREE_TOOLS = ['hash', 'encoder', 'pwcheck', 'hashid', 'reference']

// Herramientas exclusivas del plan Elite (las más avanzadas)
const ELITE_ONLY = ['jwtsign', 'httpheaders', 'xor', 'nmap']

// Pro = todo excepto las exclusivas de Elite
const PRO_TOOLS = ALL_TOOL_IDS.filter((id) => !ELITE_ONLY.includes(id))

export const PLANS = {
  free: {
    id: 'free',
    name: 'Gratis',
    price: 0,
    priceLabel: '$0',
    period: 'siempre',
    color: '#33ff99',
    dailyQueries: 3,
    tools: FREE_TOOLS,
    tagline: 'Para empezar y aprender',
    features: [
      '3 consultas al asistente IA por día',
      'Base de conocimiento completa (45+ temas)',
      '4 herramientas esenciales',
      'Cheat-sheets de referencia',
    ],
    notIncluded: ['Herramientas avanzadas', 'Consultas ilimitadas', 'Exportar resultados'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    priceLabel: '$9.99',
    period: '/mes',
    color: '#00f6ff',
    popular: true,
    dailyQueries: 100,
    tools: PRO_TOOLS,
    tagline: 'Para profesionales y estudiantes',
    features: [
      '100 consultas IA por día',
      'Casi todas las herramientas del Arsenal',
      'Generador de contraseñas y tokens',
      'Decodificador JWT, HMAC, CIDR y más',
      'Soporte por email',
    ],
    notIncluded: ['Herramientas exclusivas Elite', 'Consultas ilimitadas'],
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    price: 24.99,
    priceLabel: '$24.99',
    period: '/mes',
    color: '#c084fc',
    dailyQueries: Infinity,
    tools: 'all',
    tagline: 'Sin límites, para expertos',
    features: [
      'Consultas IA ILIMITADAS',
      'TODAS las herramientas (incl. firmador JWT, XOR, analizador de cabeceras, Nmap builder)',
      'Acceso prioritario a la IA',
      'Exportar y copiar todos los resultados',
      'Soporte prioritario',
    ],
    notIncluded: [],
  },
}

export const PLAN_ORDER = ['free', 'pro', 'elite']

export function getPlan(planId) {
  return PLANS[planId] || PLANS.free
}

// Conjunto de herramientas permitidas para un usuario (admin = todas)
export function allowedToolsFor(user) {
  if (!user) return new Set(FREE_TOOLS)
  if (user.role === 'admin') return 'all'
  const plan = getPlan(user.plan)
  if (plan.tools === 'all') return 'all'
  return new Set(plan.tools)
}

export function canUseTool(user, toolId) {
  const allowed = allowedToolsFor(user)
  return allowed === 'all' || allowed.has(toolId)
}

// Límite diario de consultas (admin = ilimitado)
export function dailyLimitFor(user) {
  if (!user) return PLANS.free.dailyQueries
  if (user.role === 'admin') return Infinity
  return getPlan(user.plan).dailyQueries
}
