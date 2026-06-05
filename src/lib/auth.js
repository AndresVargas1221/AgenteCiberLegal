// =============================================================
// CyberOracle · Auth — registro, login, sesión y roles
// Hashing con PBKDF2 (Web Crypto). Prototipo client-side:
// para producción, mover a un backend seguro.
// =============================================================
import {
  getUsers, findUser, upsertUser, deleteUser,
  getSession, setSession, clearSession,
} from './store.js'

const PBKDF2_ITER = 100000

function bytesToHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}
function hexToBytes(hex) {
  return Uint8Array.from((hex.match(/.{1,2}/g) || []).map((h) => parseInt(h, 16)))
}
function randomHex(n) {
  const a = new Uint8Array(n)
  crypto.getRandomValues(a)
  return bytesToHex(a)
}

async function pbkdf2(password, saltHex) {
  const enc = new TextEncoder()
  const keyMat = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: hexToBytes(saltHex), iterations: PBKDF2_ITER, hash: 'SHA-256' },
    keyMat,
    256,
  )
  return bytesToHex(new Uint8Array(bits))
}

function uid() {
  return 'u_' + randomHex(8)
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ---------- Seed: crea el admin por defecto la primera vez ----------
export async function ensureSeed() {
  const users = getUsers()
  if (users.length > 0) return
  const salt = randomHex(16)
  const hash = await pbkdf2('admin123', salt)
  upsertUser({
    id: uid(),
    username: 'admin',
    email: 'admin@cyberoracle.local',
    salt,
    hash,
    role: 'admin',
    plan: 'elite',
    status: 'active',
    createdAt: Date.now(),
  })
}

// ---------- Registro ----------
export async function register({ username, email, password }) {
  username = (username || '').trim()
  email = (email || '').trim()
  if (username.length < 3) return { error: 'El usuario debe tener al menos 3 caracteres.' }
  if (!validEmail(email)) return { error: 'Email no válido.' }
  if ((password || '').length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  if (findUser(username)) return { error: 'Ese nombre de usuario ya existe.' }
  if (findUser(email)) return { error: 'Ese email ya está registrado.' }

  const salt = randomHex(16)
  const hash = await pbkdf2(password, salt)
  const user = {
    id: uid(),
    username,
    email,
    salt,
    hash,
    role: 'user',
    plan: 'free',
    status: 'active',
    createdAt: Date.now(),
  }
  upsertUser(user)
  setSession(user.id)
  return { user: sanitize(user) }
}

// ---------- Login ----------
export async function login(identifier, password) {
  const user = findUser((identifier || '').trim())
  if (!user) return { error: 'Usuario no encontrado.' }
  if (user.status === 'suspended') return { error: 'Cuenta suspendida. Contacta al administrador.' }
  const hash = await pbkdf2(password || '', user.salt)
  if (hash !== user.hash) return { error: 'Contraseña incorrecta.' }
  setSession(user.id)
  return { user: sanitize(user) }
}

export function logout() {
  clearSession()
}

// ---------- Usuario actual ----------
export function currentUser() {
  const session = getSession()
  if (!session) return null
  const user = getUsers().find((u) => u.id === session.userId)
  return user ? sanitize(user) : null
}

export function isAdmin(user) {
  return !!user && user.role === 'admin'
}

// ---------- Operaciones de administración ----------
export function setUserPlan(userId, plan) {
  const user = getUsers().find((u) => u.id === userId)
  if (!user) return false
  user.plan = plan
  upsertUser(user)
  return true
}
export function setUserRole(userId, role) {
  const user = getUsers().find((u) => u.id === userId)
  if (!user) return false
  user.role = role
  upsertUser(user)
  return true
}
export function setUserStatus(userId, status) {
  const user = getUsers().find((u) => u.id === userId)
  if (!user) return false
  user.status = status
  upsertUser(user)
  return true
}
export function removeUser(userId) {
  deleteUser(userId)
}

// Quita los campos sensibles antes de exponer el usuario a la UI
function sanitize(u) {
  const { hash, salt, ...rest } = u
  return rest
}
