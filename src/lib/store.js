// =============================================================
// CyberOracle · Store — persistencia en localStorage
// NOTA: esto es un prototipo de front-end. Para producción real,
// la autenticación, los usuarios y los pagos deben vivir en un
// backend seguro (servidor + base de datos + pasarela de pago).
// =============================================================

const KEYS = {
  users: 'co_users',
  session: 'co_session',
  usage: 'co_usage',
  ai: 'co_ai',
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

// ---------- Usuarios ----------
export function getUsers() {
  return read(KEYS.users, [])
}
export function saveUsers(users) {
  return write(KEYS.users, users)
}
export function findUser(idOrName) {
  const users = getUsers()
  const q = (idOrName || '').toLowerCase()
  return users.find(
    (u) => u.id === idOrName || u.username.toLowerCase() === q || (u.email || '').toLowerCase() === q,
  )
}
export function upsertUser(user) {
  const users = getUsers()
  const i = users.findIndex((u) => u.id === user.id)
  if (i >= 0) users[i] = user
  else users.push(user)
  saveUsers(users)
  return user
}
export function deleteUser(id) {
  saveUsers(getUsers().filter((u) => u.id !== id))
}

// ---------- Sesión ----------
export function getSession() {
  return read(KEYS.session, null)
}
export function setSession(userId) {
  write(KEYS.session, { userId, at: Date.now() })
}
export function clearSession() {
  try {
    localStorage.removeItem(KEYS.session)
  } catch {
    /* ignore */
  }
}

// ---------- Uso diario (consultas) ----------
export function todayKey() {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}
export function getUsage() {
  return read(KEYS.usage, {})
}
export function getUserUsage(userId) {
  const usage = getUsage()
  const entry = usage[userId]
  if (!entry || entry.date !== todayKey()) return 0
  return entry.count
}
export function incrementUsage(userId) {
  const usage = getUsage()
  const today = todayKey()
  const entry = usage[userId]
  if (!entry || entry.date !== today) usage[userId] = { date: today, count: 1 }
  else entry.count += 1
  write(KEYS.usage, usage)
  return usage[userId].count
}
export function resetUserUsage(userId) {
  const usage = getUsage()
  delete usage[userId]
  write(KEYS.usage, usage)
}

// ---------- Configuración de IA ----------
export function getAIConfig() {
  return read(KEYS.ai, {
    enabled: false,
    provider: 'openai',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    apiKey: '',
  })
}
export function setAIConfig(cfg) {
  write(KEYS.ai, cfg)
}
