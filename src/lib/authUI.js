// =============================================================
// CyberOracle · UI de autenticación (login / registro)
// Pantalla completa que se muestra antes de entrar a la app.
// =============================================================
import { el } from './dom.js'
import { login, register } from './auth.js'

let containerEl = null
let onSuccess = null

function feedback(msg, type = 'error') {
  const box = document.getElementById('auth-feedback')
  if (!box) return
  box.textContent = msg
  box.className = `auth-feedback ${type}`
}

function setLoading(btn, loading, label) {
  btn.disabled = loading
  btn.textContent = loading ? 'Procesando…' : label
}

function buildLogin() {
  const user = el('input', { class: 'auth-input', type: 'text', placeholder: 'Usuario o email', autocomplete: 'username' })
  const pass = el('input', { class: 'auth-input', type: 'password', placeholder: 'Contraseña', autocomplete: 'current-password' })
  const btn = el('button', { class: 'auth-submit', text: 'Entrar' })

  async function submit() {
    feedback('', 'error')
    setLoading(btn, true, 'Entrar')
    const res = await login(user.value, pass.value)
    setLoading(btn, false, 'Entrar')
    if (res.error) { feedback(res.error); return }
    onSuccess?.(res.user)
  }
  btn.addEventListener('click', submit)
  ;[user, pass].forEach((i) => i.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit() }))

  return el('div', { class: 'auth-form' }, [
    el('div', { class: 'auth-field' }, [el('label', { class: 'auth-label', text: 'Usuario' }), user]),
    el('div', { class: 'auth-field' }, [el('label', { class: 'auth-label', text: 'Contraseña' }), pass]),
    btn,
    el('div', { class: 'auth-demo' }, [
      el('span', { text: 'Demo admin: ' }),
      el('code', { text: 'admin / admin123' }),
    ]),
  ])
}

function buildRegister() {
  const user = el('input', { class: 'auth-input', type: 'text', placeholder: 'Elige un usuario', autocomplete: 'username' })
  const email = el('input', { class: 'auth-input', type: 'email', placeholder: 'tu@email.com', autocomplete: 'email' })
  const pass = el('input', { class: 'auth-input', type: 'password', placeholder: 'Mínimo 6 caracteres', autocomplete: 'new-password' })
  const btn = el('button', { class: 'auth-submit', text: 'Crear cuenta' })

  async function submit() {
    feedback('', 'error')
    setLoading(btn, true, 'Crear cuenta')
    const res = await register({ username: user.value, email: email.value, password: pass.value })
    setLoading(btn, false, 'Crear cuenta')
    if (res.error) { feedback(res.error); return }
    feedback('¡Cuenta creada! Entrando…', 'ok')
    onSuccess?.(res.user)
  }
  btn.addEventListener('click', submit)
  ;[user, email, pass].forEach((i) => i.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit() }))

  return el('div', { class: 'auth-form' }, [
    el('div', { class: 'auth-field' }, [el('label', { class: 'auth-label', text: 'Usuario' }), user]),
    el('div', { class: 'auth-field' }, [el('label', { class: 'auth-label', text: 'Email' }), email]),
    el('div', { class: 'auth-field' }, [el('label', { class: 'auth-label', text: 'Contraseña' }), pass]),
    btn,
    el('div', { class: 'auth-demo', text: 'Tu cuenta empieza en el plan Gratis (3 consultas/día).' }),
  ])
}

function render(mode) {
  const formWrap = el('div', { class: 'auth-formwrap' }, [mode === 'login' ? buildLogin() : buildRegister()])

  const tabLogin = el('button', { class: `auth-tab ${mode === 'login' ? 'active' : ''}`, text: 'Iniciar sesión' })
  const tabReg = el('button', { class: `auth-tab ${mode === 'register' ? 'active' : ''}`, text: 'Registrarse' })
  tabLogin.addEventListener('click', () => render('login'))
  tabReg.addEventListener('click', () => render('register'))

  const card = el('div', { class: 'auth-card' }, [
    el('div', { class: 'auth-brand' }, [
      el('div', { class: 'auth-logo', text: '◈' }),
      el('div', {}, [
        el('div', { class: 'auth-title', text: 'CyberOracle' }),
        el('div', { class: 'auth-sub', text: 'Asistente de Ciberseguridad' }),
      ]),
    ]),
    el('div', { class: 'auth-tabs' }, [tabLogin, tabReg]),
    el('div', { id: 'auth-feedback', class: 'auth-feedback' }),
    formWrap,
    el('div', { class: 'auth-note', text: '🔒 Prototipo: la autenticación es local (demo). En producción usa un backend seguro.' }),
  ])

  containerEl.innerHTML = ''
  containerEl.appendChild(card)
}

export function showAuth(rootEl, onLogin) {
  onSuccess = onLogin
  containerEl = el('div', { class: 'auth-screen' }, [
    el('div', { class: 'bg-grid' }),
    el('div', { class: 'bg-glow bg-glow-1' }),
    el('div', { class: 'bg-glow bg-glow-2' }),
  ])
  rootEl.innerHTML = ''
  rootEl.appendChild(containerEl)
  render('login')
}
