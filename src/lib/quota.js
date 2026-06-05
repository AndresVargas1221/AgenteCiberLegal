// =============================================================
// CyberOracle · Quota — control de consultas diarias por plan
// =============================================================
import { getUserUsage, incrementUsage } from './store.js'
import { dailyLimitFor } from './plans.js'

export function usedToday(user) {
  if (!user) return 0
  return getUserUsage(user.id)
}

export function limitFor(user) {
  return dailyLimitFor(user)
}

export function remaining(user) {
  const limit = limitFor(user)
  if (limit === Infinity) return Infinity
  return Math.max(0, limit - usedToday(user))
}

export function canQuery(user) {
  return remaining(user) > 0
}

// Registra una consulta y devuelve cuántas quedan
export function consume(user) {
  if (!user) return { ok: false, remaining: 0 }
  const limit = limitFor(user)
  if (limit === Infinity) {
    incrementUsage(user.id) // se registra para estadísticas
    return { ok: true, remaining: Infinity }
  }
  if (usedToday(user) >= limit) return { ok: false, remaining: 0 }
  const count = incrementUsage(user.id)
  return { ok: true, remaining: Math.max(0, limit - count) }
}

export function limitLabel(user) {
  const limit = limitFor(user)
  return limit === Infinity ? '∞' : String(limit)
}
