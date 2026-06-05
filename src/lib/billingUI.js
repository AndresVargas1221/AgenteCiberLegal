// =============================================================
// CyberOracle · UI de planes y suscripción
// El "pago" es simulado (prototipo). Para cobros reales,
// integra una pasarela (p. ej. Stripe Checkout) en el backend.
// =============================================================
import { el } from './dom.js'
import { PLANS, PLAN_ORDER } from './plans.js'
import { setUserPlan, currentUser } from './auth.js'

let overlayEl = null
let onChangeCb = null

function close() {
  if (overlayEl) {
    overlayEl.classList.remove('show')
    const o = overlayEl
    overlayEl = null
    setTimeout(() => o.remove(), 220)
  }
}

function planCard(plan, user) {
  const isCurrent = user && user.plan === plan.id
  const card = el('div', { class: `plan-card ${plan.popular ? 'popular' : ''} ${isCurrent ? 'current' : ''}`, style: { '--c': plan.color } })

  if (plan.popular) card.appendChild(el('div', { class: 'plan-badge', text: 'MÁS POPULAR' }))

  card.appendChild(el('div', { class: 'plan-name', text: plan.name }))
  card.appendChild(el('div', { class: 'plan-tagline', text: plan.tagline }))
  card.appendChild(el('div', { class: 'plan-price' }, [
    el('span', { class: 'plan-price-amount', text: plan.priceLabel }),
    el('span', { class: 'plan-price-period', text: plan.period }),
  ]))

  const feats = el('ul', { class: 'plan-feats' })
  plan.features.forEach((f) => feats.appendChild(el('li', { class: 'plan-feat yes' }, [el('span', { class: 'plan-tick', text: '✓' }), document.createTextNode(f)])))
  ;(plan.notIncluded || []).forEach((f) => feats.appendChild(el('li', { class: 'plan-feat no' }, [el('span', { class: 'plan-cross', text: '✕' }), document.createTextNode(f)])))
  card.appendChild(feats)

  if (isCurrent) {
    card.appendChild(el('button', { class: 'plan-btn current-btn', disabled: 'disabled', text: 'Plan actual' }))
  } else {
    const label = plan.price === 0 ? 'Cambiar a Gratis' : `Mejorar a ${plan.name}`
    const btn = el('button', { class: 'plan-btn', text: label, style: { '--c': plan.color } })
    btn.addEventListener('click', () => {
      // Pago simulado
      setUserPlan(user.id, plan.id)
      onChangeCb?.(currentUser())
      close()
    })
    card.appendChild(btn)
  }
  return card
}

export function openBilling(onChange) {
  if (overlayEl) close()
  onChangeCb = onChange
  const user = currentUser()

  const grid = el('div', { class: 'plans-grid' }, PLAN_ORDER.map((id) => planCard(PLANS[id], user)))

  const modal = el('div', { class: 'plans-modal', onClick: (e) => e.stopPropagation() }, [
    el('div', { class: 'plans-head' }, [
      el('div', {}, [
        el('h2', { class: 'plans-title', text: 'Elige tu plan' }),
        el('p', { class: 'plans-sub', text: 'Desbloquea más consultas IA y herramientas del Arsenal.' }),
      ]),
      el('button', { class: 'tk-close', text: '✕', 'aria-label': 'Cerrar', onClick: close }),
    ]),
    grid,
    el('div', { class: 'plans-foot', text: '💳 Pago simulado (demo). Para cobros reales se integra una pasarela como Stripe en el backend.' }),
  ])

  overlayEl = el('div', { class: 'plans-overlay', onClick: close }, [modal])
  document.body.appendChild(overlayEl)
  requestAnimationFrame(() => overlayEl.classList.add('show'))
}
