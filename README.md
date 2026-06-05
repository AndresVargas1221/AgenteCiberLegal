# 🛡️ CyberOracle · Asistente de Ciberseguridad

Asistente conversacional **futurista** y **100% ético/defensivo** sobre ciberseguridad.
Pregúntale lo que quieras (ataques y defensas, herramientas, criptografía, pentesting,
nube, forense, certificaciones…) y te responde con explicaciones claras, herramientas
recomendadas y buenas prácticas.

> Conocimiento **educativo y defensivo**. Practica solo en sistemas propios o autorizados.

---

## ✨ Características

- **45+ temas** organizados en **20 dominios** de seguridad.
- Buscador inteligente con **sinónimos en español** (entiende preguntas naturales).
- Interfaz **oscura futurista**: neón cian/violeta, glassmorphism, animaciones y efecto "escribiendo".
- Navegación por dominios desde la barra lateral.
- Sugerencias y temas relacionados con un clic.
- Renderizado de Markdown **seguro** (sin `innerHTML` para contenido dinámico → sin XSS).
- **Sin dependencias ni build**: JavaScript puro con módulos ES. Arranca al instante.

## 🗂️ Dominios cubiertos

Fundamentos · Seguridad Web (OWASP) · Redes · Criptografía · Pentesting · Herramientas ·
Análisis de Malware · Forense Digital · Respuesta a Incidentes · Blue Team/SOC · Cloud ·
Móvil · IoT/OT · Ingeniería Social · Active Directory · Frameworks (MITRE/NIST/ISO) ·
Certificaciones · DevSecOps · Threat Intelligence · Carrera & Aprendizaje.

## 🚀 Cómo ejecutarlo

La app usa **módulos ES**, así que necesita servirse por HTTP (no abrir el archivo directo).
Elige cualquiera de estas opciones desde la carpeta del proyecto:

```bash
# Opción A — Python (no requiere instalar nada)
python3 -m http.server 5173

# Opción B — Node (si lo tienes)
npx serve .

# Opción C — npm script incluido
npm start
```

Luego abre en el navegador: **http://localhost:5173**

## 📁 Estructura

```
index.html              # punto de entrada
src/
  app.js                # UI del chat (vanilla JS)
  styles.css            # tema futurista
  lib/
    search.js           # motor de búsqueda + sinónimos
    bot.js              # lógica de respuesta / intención
    markdown.js         # renderizador Markdown seguro
  data/
    categories.js       # los 20 dominios
    knowledgeBase.js    # agregador de la base de conocimiento
    kb_part1..6.js       # entradas por dominio
public/
  shield.svg            # ícono
```

## 🧠 Cómo ampliar el conocimiento

Cada tema es un objeto en `src/data/kb_partX.js`:

```js
{
  id: 'identificador-unico',
  category: 'web',                 // id de una categoría existente
  title: 'Título del tema',
  keywords: ['palabras', 'clave'], // mejoran la búsqueda
  summary: 'Resumen corto.',
  content: `## Markdown soportado...`,
  tools: ['Herramienta1', 'Herramienta2'],
}
```

Añade nuevas entradas a cualquier parte y aparecerán automáticamente.

---

Hecho con foco en la **defensa y el aprendizaje**. 🔐
