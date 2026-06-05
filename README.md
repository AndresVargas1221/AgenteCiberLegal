# 🛡️ CyberOracle · Asistente de Ciberseguridad

Asistente conversacional **futurista** y **100% ético/defensivo** sobre ciberseguridad,
con **login**, **planes de suscripción**, **panel de administración**, un **Arsenal de
herramientas interactivas** y una **capa de IA opcional**.

> Conocimiento **educativo y defensivo**. Practica solo en sistemas propios o autorizados.

---

## ✨ Características

- 🤖 **Asistente IA con respaldo local que nunca falla.** Si configuras una API (compatible
  con OpenAI) y hay internet, responde con IA; si no, usa el **motor de conocimiento local**
  (45+ temas, 20 dominios).
- 🔐 **Login de usuario y administrador** (roles, hashing PBKDF2 con Web Crypto).
- 💳 **3 planes de suscripción** con cuotas diarias y herramientas por plan:
  | Plan | Precio | Consultas IA/día | Herramientas |
  |------|--------|------------------|--------------|
  | **Gratis** | $0 | 3 | 4 esenciales |
  | **Pro** | $9.99/mes | 100 | casi todas |
  | **Elite** | $24.99/mes | ∞ | todas |
- 🛠️ **Panel de administración**: gestionar usuarios (plan, rol, suspender, eliminar),
  estadísticas (usuarios, ingresos estimados, consultas) y configuración de la IA.
- 🧰 **Arsenal con 19 herramientas interactivas** (funcionan 100% en el navegador).
- 📖 **Cheat-sheets de 45+ herramientas CLI** (Nmap, sqlmap, Hydra, Hashcat, Nuclei…).
- 🎨 Interfaz **oscura futurista**: neón, glassmorphism, animaciones.
- 🧩 **Sin dependencias ni build**: JavaScript puro con módulos ES.

## 🧰 Herramientas del Arsenal (client-side)

Hash (SHA), HMAC, Base64/URL/Hex, conversor de bases, analizador de contraseñas,
generador de contraseñas/frases, calculadora de entropía, decodificador y **firmador** de JWT,
identificador de hash, UUID y tokens, conversor de timestamps, calculadora CIDR/subredes,
César/ROT13, cifrado XOR, probador de regex, formateador JSON, analizador de cabeceras HTTP
de seguridad y constructor de comandos Nmap.

## 🔑 Acceso de demostración

- **Administrador:** usuario `admin` · contraseña `admin123`
- O **regístrate** para crear una cuenta nueva (empieza en el plan Gratis).

## 🚀 Cómo ejecutarlo

La app usa **módulos ES**, así que necesita servirse por HTTP:

```bash
python3 -m http.server 5173    # o:  npm start
```

Abre **http://localhost:5173**

## 🤖 Activar la IA real (al desplegar con internet)

1. Inicia sesión como **admin** → botón **🛠 (panel)** → pestaña **IA**.
2. Activa la IA e introduce **endpoint**, **modelo** y **API key** (compatible con la API de OpenAI).
3. Guarda. Sin esto, el asistente usa el motor de conocimiento local (siempre funcional).

## 📁 Estructura

```
index.html
src/
  app.js                # UI del chat + integración (auth, cuota, IA)
  styles.css            # tema futurista
  lib/
    dom.js              # helpers de DOM
    search.js           # motor de búsqueda + sinónimos
    bot.js              # lógica de respuesta / intención
    markdown.js         # renderizador Markdown seguro
    tools.js            # lógica de las 19 herramientas + cheat-sheets
    toolkit.js          # UI del Arsenal (con gating por plan)
    plans.js            # definición de planes y permisos
    store.js            # persistencia (localStorage)
    auth.js             # registro/login/roles (PBKDF2)
    quota.js            # control de consultas diarias
    ai.js               # capa de IA con respaldo local
    authUI.js           # pantalla de login/registro
    billingUI.js        # planes / upgrade
    adminUI.js          # panel de administración
  data/
    categories.js       # 20 dominios
    knowledgeBase.js    # agregador
    kb_part1..6.js       # entradas por dominio
public/shield.svg
```

## ⚠️ Nota importante sobre seguridad (prototipo)

El **login y los pagos son un prototipo client-side** (datos en `localStorage`). Es ideal
para demostración y desarrollo, pero **no es seguro para producción**: cualquiera con acceso
al navegador podría manipularlo. Para un producto real:

- Mueve **autenticación, usuarios y cuotas** a un **backend** (p. ej. Node + base de datos).
- Integra **pagos reales** con una pasarela como **Stripe**.
- Llama a la **API de IA desde el servidor** (no expongas la API key en el navegador).

El código está organizado en módulos para facilitar esa migración.

---

Hecho con foco en la **defensa y el aprendizaje**. 🔐
