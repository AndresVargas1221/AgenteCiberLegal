// =============================================================
// CyberOracle · Base de Conocimiento de Ciberseguridad (agregador)
// Une todas las partes temáticas en un único array `KB`.
// Cada entrada: { id, category, title, keywords[], summary, content(md), tools[] }
// Contenido educativo y defensivo.
// =============================================================
import { KB_PART1 } from './kb_part1.js'
import { KB_PART2 } from './kb_part2.js'
import { KB_PART3 } from './kb_part3.js'
import { KB_PART4 } from './kb_part4.js'
import { KB_PART5 } from './kb_part5.js'
import { KB_PART6 } from './kb_part6.js'

export const KB = [
  ...KB_PART1,
  ...KB_PART2,
  ...KB_PART3,
  ...KB_PART4,
  ...KB_PART5,
  ...KB_PART6,
]

// Conjunto de herramientas únicas mencionadas en toda la base
export const ALL_TOOLS = Array.from(
  new Set(KB.flatMap((e) => e.tools || [])),
).sort((a, b) => a.localeCompare(b))

// Conteo de entradas por categoría (para mostrar en la UI)
export function countByCategory() {
  return KB.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1
    return acc
  }, {})
}
