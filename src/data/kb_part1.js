// =============================================================
// CyberOracle · Base de Conocimiento de Ciberseguridad
// Contenido educativo y defensivo. Cada entrada:
//   { id, category, title, keywords[], summary, content(md), tools[] }
// =============================================================

export const KB_PART1 = [
  // ===================== FUNDAMENTOS =====================
  {
    id: 'cia-triad',
    category: 'fundamentos',
    title: 'La Tríada CIA: Confidencialidad, Integridad, Disponibilidad',
    keywords: ['cia', 'triada', 'confidencialidad', 'integridad', 'disponibilidad', 'principios', 'fundamentos', 'pilares'],
    summary: 'Los tres pilares sobre los que se construye toda la seguridad de la información.',
    content: `## La Tríada CIA

Es el modelo fundamental de la seguridad de la información. Todo control de seguridad busca proteger al menos uno de estos pilares:

- **Confidencialidad (Confidentiality):** la información solo es accesible para quien está autorizado. Se logra con cifrado, control de acceso, clasificación de datos y autenticación.
- **Integridad (Integrity):** los datos no se alteran de forma no autorizada. Se protege con hashing, firmas digitales, control de versiones y checksums.
- **Disponibilidad (Availability):** los sistemas y datos están accesibles cuando se necesitan. Se logra con redundancia, balanceo de carga, backups y protección anti-DDoS.

### Extensiones del modelo
- **Autenticidad:** garantizar que algo/alguien es quien dice ser.
- **No repudio:** que el autor de una acción no pueda negarla (firmas digitales, logs).
- **Modelo Parkerian Hexad:** añade posesión/control, autenticidad y utilidad.

> Regla de oro: la seguridad busca un **equilibrio**. Cifrar todo (confidencialidad) puede afectar disponibilidad; demasiados controles afectan usabilidad. La gestión de riesgo decide el balance.`,
    tools: [],
  },
  {
    id: 'amenaza-vuln-riesgo',
    category: 'fundamentos',
    title: 'Amenaza vs. Vulnerabilidad vs. Riesgo vs. Exploit',
    keywords: ['amenaza', 'vulnerabilidad', 'riesgo', 'exploit', 'threat', 'risk', 'activo', 'asset', 'diferencia'],
    summary: 'Diferencias clave entre los conceptos que sostienen la gestión de riesgo.',
    content: `## Conceptos esenciales

- **Activo (Asset):** algo de valor a proteger (datos, servidores, reputación, personas).
- **Vulnerabilidad:** una debilidad explotable (software sin parche, contraseña débil, mala config).
- **Amenaza (Threat):** un agente o evento con potencial de causar daño (atacante, malware, desastre).
- **Exploit:** la técnica o código que aprovecha una vulnerabilidad concreta.
- **Riesgo:** la probabilidad de que una amenaza explote una vulnerabilidad y su impacto.

### Fórmula del riesgo
\`\`\`
Riesgo = Amenaza × Vulnerabilidad × Impacto
\`\`\`

### Tratamiento del riesgo
1. **Mitigar** — aplicar controles para reducirlo.
2. **Transferir** — seguros, terceros.
3. **Aceptar** — asumirlo si es bajo o el coste de mitigar es mayor.
4. **Evitar** — eliminar la actividad que lo genera.

### Tipos de controles
- **Preventivos** (firewall, MFA), **Detectivos** (IDS, logs), **Correctivos** (backups, parches).
- Por naturaleza: **técnicos**, **administrativos** (políticas) y **físicos**.`,
    tools: [],
  },
  {
    id: 'aaa-iam',
    category: 'fundamentos',
    title: 'Autenticación, Autorización y Accounting (AAA) e IAM',
    keywords: ['autenticacion', 'autorizacion', 'accounting', 'aaa', 'iam', 'mfa', '2fa', 'identidad', 'rbac', 'privilegios', 'least privilege'],
    summary: 'Cómo se gestiona la identidad y el acceso en sistemas seguros.',
    content: `## AAA — Authentication, Authorization, Accounting

- **Autenticación:** verificar identidad. Factores:
  - *Algo que sabes* (contraseña, PIN)
  - *Algo que tienes* (token, móvil, llave FIDO2)
  - *Algo que eres* (biometría)
- **Autorización:** qué puede hacer una identidad ya autenticada.
- **Accounting/Auditing:** registrar quién hizo qué y cuándo.

### MFA / 2FA
Combinar 2+ factores reduce drásticamente el robo de cuentas. Las **llaves FIDO2/WebAuthn** son resistentes a phishing (mejor que SMS o TOTP).

### Modelos de control de acceso
- **DAC** (discrecional): el dueño decide.
- **MAC** (obligatorio): etiquetas/clearances (entornos militares).
- **RBAC** (por rol): permisos según el rol.
- **ABAC** (por atributos): decisiones según contexto (hora, ubicación, dispositivo).

### Principios clave
- **Mínimo privilegio:** solo el acceso estrictamente necesario.
- **Separación de funciones:** ninguna persona controla un proceso crítico completo.
- **Need to know:** acceso a datos solo si es necesario para la tarea.
- **Zero Trust:** "nunca confiar, siempre verificar".`,
    tools: ['Keycloak', 'Okta', 'Active Directory', 'FIDO2/WebAuthn'],
  },
  {
    id: 'defense-in-depth',
    category: 'fundamentos',
    title: 'Defensa en Profundidad y Modelos de Seguridad',
    keywords: ['defensa en profundidad', 'defense in depth', 'capas', 'zero trust', 'modelo', 'arquitectura segura', 'hardening'],
    summary: 'Estrategia de múltiples capas de seguridad y el modelo Zero Trust.',
    content: `## Defensa en Profundidad (Defense in Depth)

Filosofía de aplicar **múltiples capas** de controles para que, si una falla, otras sigan protegiendo. Inspirada en castillos: foso, muros, torres, guardias.

### Capas típicas
1. **Perímetro:** firewall, IPS, filtrado.
2. **Red:** segmentación, VLANs, NAC.
3. **Host:** EDR/antivirus, hardening, parches.
4. **Aplicación:** validación de entrada, WAF, SAST/DAST.
5. **Datos:** cifrado, DLP, control de acceso.
6. **Personas:** concienciación, políticas.

### Zero Trust
Asume que **no hay perímetro de confianza**. Cada petición se verifica según identidad, dispositivo y contexto. Pilares:
- Verificación continua de identidad.
- Mínimo privilegio y microsegmentación.
- Asumir brecha (assume breach).

### Hardening (endurecimiento)
Reducir la superficie de ataque: desactivar servicios innecesarios, cerrar puertos, aplicar baselines (CIS Benchmarks), parchear y aplicar configuraciones seguras por defecto.`,
    tools: ['CIS Benchmarks', 'Lynis', 'OpenSCAP'],
  },

  // ===================== SEGURIDAD WEB =====================
  {
    id: 'owasp-top10',
    category: 'web',
    title: 'OWASP Top 10 — Riesgos críticos en aplicaciones web',
    keywords: ['owasp', 'top 10', 'top10', 'web', 'vulnerabilidades web', 'riesgos web', 'owasp top ten'],
    summary: 'El estándar de facto de los 10 riesgos más críticos en aplicaciones web (edición 2021).',
    content: `## OWASP Top 10 (2021)

1. **A01 Broken Access Control** — fallos de autorización (IDOR, escalada de privilegios). El #1 actual.
2. **A02 Cryptographic Failures** — datos sensibles sin cifrar o con cripto débil.
3. **A03 Injection** — SQLi, NoSQLi, OS command, LDAP. Entrada no validada que llega a un intérprete.
4. **A04 Insecure Design** — fallos por diseño, falta de modelado de amenazas.
5. **A05 Security Misconfiguration** — configuraciones por defecto, headers faltantes, verbosidad.
6. **A06 Vulnerable and Outdated Components** — librerías/dependencias sin parchear.
7. **A07 Identification and Authentication Failures** — sesiones, credenciales, fuerza bruta.
8. **A08 Software and Data Integrity Failures** — actualizaciones/CI-CD sin verificar (incluye deserialización insegura).
9. **A09 Security Logging and Monitoring Failures** — falta de detección y trazabilidad.
10. **A10 Server-Side Request Forgery (SSRF)** — forzar al servidor a hacer peticiones a destinos internos.

### Defensa transversal
- Validar y **sanear toda entrada**; usar listas blancas.
- **Consultas parametrizadas** (prepared statements).
- Aplicar **headers de seguridad** y CSP.
- Gestión de dependencias y parcheo continuo.
- Logging y monitoreo de eventos de seguridad.

> OWASP también publica Top 10 para APIs, LLM, Móvil y más.`,
    tools: ['OWASP ZAP', 'Burp Suite', 'Nikto', 'OWASP Dependency-Check'],
  },
  {
    id: 'sql-injection',
    category: 'web',
    title: 'Inyección SQL (SQLi) — qué es y cómo defenderse',
    keywords: ['sql injection', 'sqli', 'inyeccion sql', 'base de datos', 'prepared statements', 'sqlmap', 'union', 'blind sqli'],
    summary: 'La inyección SQL permite manipular consultas a la base de datos; se previene con consultas parametrizadas.',
    content: `## Inyección SQL (SQLi)

Ocurre cuando la entrada del usuario se concatena directamente en una consulta SQL, permitiendo alterar su lógica.

### Tipos
- **In-band:** clásica y basada en errores o **UNION**.
- **Blind (ciega):** sin salida visible; se infiere por respuestas **booleanas** o **temporales** (time-based).
- **Out-of-band:** exfiltración por canales externos (DNS/HTTP).

### Ejemplo del problema (vulnerable)
\`\`\`sql
-- La entrada "' OR '1'='1" rompe la lógica
SELECT * FROM users WHERE user = '$input';
\`\`\`

### Defensa (lo correcto)
1. **Consultas parametrizadas / prepared statements** — la defensa #1.
\`\`\`python
cursor.execute("SELECT * FROM users WHERE user = %s", (user,))
\`\`\`
2. **ORMs** bien usados (sin concatenar).
3. **Validación de entrada** y allow-lists.
4. **Mínimo privilegio** en la cuenta de BD.
5. **WAF** como capa adicional (no sustituye al código seguro).

> Pentesting autorizado: \`sqlmap\` automatiza la detección/explotación. Úsalo solo en sistemas propios o con permiso por escrito.`,
    tools: ['sqlmap', 'Burp Suite', 'OWASP ZAP'],
  },
  {
    id: 'xss',
    category: 'web',
    title: 'Cross-Site Scripting (XSS) — tipos y mitigación',
    keywords: ['xss', 'cross site scripting', 'javascript', 'csp', 'reflejado', 'almacenado', 'dom', 'sanitizacion', 'escape'],
    summary: 'XSS inyecta scripts en el navegador de la víctima; se mitiga con escape de salida y CSP.',
    content: `## Cross-Site Scripting (XSS)

El atacante logra ejecutar **JavaScript** en el navegador de otra víctima, robando sesiones, registrando teclas o defaceando.

### Tipos
- **Reflejado:** el payload viaja en la petición y se refleja en la respuesta (links maliciosos).
- **Almacenado (persistente):** el payload se guarda en el servidor (comentarios, perfiles) y afecta a todos.
- **DOM-based:** la vulnerabilidad está en el JS del cliente que manipula el DOM con datos no confiables.

### Defensa
1. **Codificación/escape de salida según contexto** (HTML, atributo, JS, URL).
2. **Content Security Policy (CSP)** para limitar de dónde se cargan scripts.
3. **Sanitización** con librerías como DOMPurify para HTML enriquecido.
4. Cookies con flags **HttpOnly** y **Secure** (evita robo vía JS).
5. Frameworks modernos (React, Angular) escapan por defecto: no uses \`dangerouslySetInnerHTML\` / \`innerHTML\` con datos no confiables.

\`\`\`http
Content-Security-Policy: default-src 'self'; script-src 'self'
\`\`\``,
    tools: ['Burp Suite', 'OWASP ZAP', 'DOMPurify'],
  },
  {
    id: 'csrf-ssrf',
    category: 'web',
    title: 'CSRF y SSRF — falsificación de peticiones',
    keywords: ['csrf', 'ssrf', 'cross site request forgery', 'server side request forgery', 'token', 'samesite', 'metadata'],
    summary: 'CSRF abusa de la sesión del usuario; SSRF abusa del servidor para alcanzar recursos internos.',
    content: `## CSRF — Cross-Site Request Forgery

Fuerza al navegador de una víctima autenticada a enviar una petición no deseada (p. ej. transferir dinero) aprovechando su cookie de sesión.

**Defensa:**
- **Tokens anti-CSRF** sincronizados por sesión/petición.
- Cookies **SameSite=Lax/Strict**.
- Revalidar acciones sensibles (re-autenticación, confirmación).
- Verificar cabeceras \`Origin\`/\`Referer\`.

## SSRF — Server-Side Request Forgery

El atacante hace que **el servidor** realice peticiones a destinos que elige, alcanzando servicios internos, metadatos cloud (\`169.254.169.254\`) o puertos no expuestos.

**Defensa:**
- **Allow-list** de dominios/IPs permitidos.
- Bloquear rangos privados y direcciones de metadatos.
- Deshabilitar redirecciones y esquemas peligrosos (\`file://\`, \`gopher://\`).
- Usar IMDSv2 en AWS (requiere token).`,
    tools: ['Burp Suite', 'OWASP ZAP'],
  },
  {
    id: 'web-headers-auth',
    category: 'web',
    title: 'Headers de seguridad, sesiones y autenticación web',
    keywords: ['headers', 'cabeceras seguridad', 'hsts', 'csp', 'cookies', 'jwt', 'sesiones', 'cors', 'samesite', 'oauth'],
    summary: 'Cabeceras HTTP de seguridad, manejo seguro de sesiones, JWT y CORS.',
    content: `## Headers de seguridad HTTP

- **Strict-Transport-Security (HSTS):** fuerza HTTPS.
- **Content-Security-Policy (CSP):** mitiga XSS/inyección.
- **X-Content-Type-Options: nosniff:** evita MIME sniffing.
- **X-Frame-Options / frame-ancestors:** anti-clickjacking.
- **Referrer-Policy** y **Permissions-Policy.**

## Sesiones y cookies
- IDs de sesión largos y aleatorios; regenerar tras login.
- Flags **HttpOnly, Secure, SameSite.**
- Expiración e invalidación en logout.

## JWT (JSON Web Tokens)
- Firmar con algoritmos fuertes (RS256/EdDSA); **rechazar \`alg: none\`.**
- No guardar datos sensibles en el payload (es legible).
- Expiración corta + refresh tokens; validar \`iss\`, \`aud\`, \`exp\`.

## CORS
- Configurar \`Access-Control-Allow-Origin\` con cuidado; **nunca** \`*\` junto a credenciales.

## OAuth 2.0 / OIDC
- Usar **Authorization Code + PKCE** para apps públicas; validar \`state\` (anti-CSRF) y \`redirect_uri\`.`,
    tools: ['securityheaders.com', 'Burp Suite', 'jwt.io'],
  },
]
