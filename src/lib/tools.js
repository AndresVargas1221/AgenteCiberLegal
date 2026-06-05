// =============================================================
// CyberOracle · Arsenal — lógica de herramientas (100% client-side)
// Todo se ejecuta en el navegador, sin enviar datos a ningún sitio.
// Enfoque defensivo y educativo.
// =============================================================

// ---------------- Hashing (Web Crypto API real) ----------------
export async function digestHex(algo, text) {
  // algo: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest(algo, data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// ---------------- Codificación / Decodificación ----------------
export function toBase64(str) {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin)
}
export function fromBase64(b64) {
  const bin = atob(b64.trim())
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}
export function toHex(str) {
  const bytes = new TextEncoder().encode(str)
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join(' ')
}
export function fromHex(hex) {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '')
  const pairs = clean.match(/.{1,2}/g) || []
  const bytes = pairs.map((h) => parseInt(h, 16))
  return new TextDecoder().decode(Uint8Array.from(bytes))
}
export const urlEncode = (s) => encodeURIComponent(s)
export const urlDecode = (s) => decodeURIComponent(s)

// ---------------- Tiempo legible ----------------
function humanTime(seconds) {
  if (!isFinite(seconds)) return 'prácticamente infinito'
  if (seconds < 1) return 'instantáneo'
  const units = [
    ['siglos', 3155760000],
    ['años', 31557600],
    ['meses', 2629800],
    ['días', 86400],
    ['horas', 3600],
    ['minutos', 60],
    ['segundos', 1],
  ]
  for (const [name, secs] of units) {
    if (seconds >= secs) {
      const v = seconds / secs
      if (name === 'siglos' && v > 1000) return 'más de mil siglos'
      return `${v >= 100 ? Math.round(v) : v.toFixed(1)} ${name}`
    }
  }
  return 'instantáneo'
}

// ---------------- Analizador de contraseñas ----------------
export function analyzePassword(pw) {
  if (!pw) {
    return { length: 0, entropy: 0, level: -1, label: '—', crackTime: '—', charset: 0, feedback: [] }
  }
  let charset = 0
  const hasLower = /[a-z]/.test(pw)
  const hasUpper = /[A-Z]/.test(pw)
  const hasDigit = /[0-9]/.test(pw)
  const hasSymbol = /[^a-zA-Z0-9]/.test(pw)
  if (hasLower) charset += 26
  if (hasUpper) charset += 26
  if (hasDigit) charset += 10
  if (hasSymbol) charset += 33

  const length = pw.length
  const entropy = length * Math.log2(charset || 1)

  // Escenario ofensivo realista: ~100 mil millones de intentos/seg (GPU offline, hash rápido)
  const guessesPerSec = 1e11
  const avgGuesses = Math.pow(2, entropy) / 2
  const seconds = avgGuesses / guessesPerSec

  let level, label
  if (entropy < 28) { level = 0; label = 'Muy débil' }
  else if (entropy < 36) { level = 1; label = 'Débil' }
  else if (entropy < 60) { level = 2; label = 'Aceptable' }
  else if (entropy < 128) { level = 3; label = 'Fuerte' }
  else { level = 4; label = 'Muy fuerte' }

  const feedback = []
  if (length < 12) feedback.push('Usa al menos 12-16 caracteres (mejor una frase larga).')
  if (!hasUpper || !hasLower) feedback.push('Combina mayúsculas y minúsculas.')
  if (!hasDigit) feedback.push('Añade números.')
  if (!hasSymbol) feedback.push('Añade símbolos (!@#$…).')
  if (/^[0-9]+$/.test(pw)) feedback.push('Evita contraseñas solo numéricas.')
  if (/(.)\1{2,}/.test(pw)) feedback.push('Evita caracteres repetidos (aaa, 111).')
  if (/(1234|abcd|qwerty|password|admin|0000)/i.test(pw)) feedback.push('Evita secuencias y palabras comunes.')
  if (feedback.length === 0) feedback.push('¡Buena contraseña! Úsala con un gestor y activa MFA.')

  return {
    length,
    entropy: Math.round(entropy),
    level,
    label,
    charset,
    crackTime: humanTime(seconds),
    feedback,
  }
}

// ---------------- Generador de contraseñas / frases ----------------
const LOWER = 'abcdefghijkmnpqrstuvwxyz'
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const DIGITS = '23456789'
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?'
// Palabras para frases de paso (diceware simplificado)
const WORDS = [
  'galaxia', 'volcan', 'titanio', 'neon', 'cobalto', 'orbita', 'plasma', 'quasar',
  'nimbo', 'cobre', 'zafiro', 'tundra', 'cipres', 'halcon', 'lince', 'mantra',
  'fenix', 'kraken', 'pixel', 'vortice', 'cromo', 'bisonte', 'ambar', 'delta',
  'sigma', 'tornado', 'glaciar', 'pradera', 'meteoro', 'rubi', 'jade', 'onix',
]

function randInt(max) {
  const arr = new Uint32Array(1)
  crypto.getRandomValues(arr)
  return arr[0] % max
}
function pick(str) {
  return str[randInt(str.length)]
}

export function generatePassword(opts = {}) {
  const {
    length = 16,
    upper = true,
    lower = true,
    digits = true,
    symbols = true,
  } = opts
  let pool = ''
  const required = []
  if (lower) { pool += LOWER; required.push(pick(LOWER)) }
  if (upper) { pool += UPPER; required.push(pick(UPPER)) }
  if (digits) { pool += DIGITS; required.push(pick(DIGITS)) }
  if (symbols) { pool += SYMBOLS; required.push(pick(SYMBOLS)) }
  if (!pool) pool = LOWER + DIGITS

  const out = [...required]
  for (let i = out.length; i < length; i++) out.push(pick(pool))
  // Mezcla (Fisher-Yates con CSPRNG)
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out.slice(0, length).join('')
}

export function generatePassphrase(words = 4, separator = '-') {
  const parts = []
  for (let i = 0; i < words; i++) parts.push(WORDS[randInt(WORDS.length)])
  // Añade un número al final para cumplir políticas
  parts.push(String(randInt(90) + 10))
  return parts.join(separator)
}

// ---------------- Decodificador JWT ----------------
function b64urlDecode(part) {
  let s = part.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  const bin = atob(s)
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function decodeJWT(token) {
  const parts = (token || '').trim().split('.')
  if (parts.length < 2) {
    return { error: 'No parece un JWT válido (faltan secciones separadas por puntos).' }
  }
  try {
    const header = JSON.parse(b64urlDecode(parts[0]))
    const payload = JSON.parse(b64urlDecode(parts[1]))
    const notes = []
    if (header.alg === 'none') notes.push('⚠ alg = "none": token sin firma. ¡Peligroso si el servidor lo acepta!')
    if (payload.exp) {
      const exp = new Date(payload.exp * 1000)
      const expired = exp.getTime() < Date.now()
      notes.push(`Expira: ${exp.toLocaleString()} ${expired ? '— ⚠ EXPIRADO' : '— vigente'}`)
    }
    if (payload.iat) notes.push(`Emitido: ${new Date(payload.iat * 1000).toLocaleString()}`)
    return {
      header,
      payload,
      signature: parts[2] || '(sin firma)',
      notes,
    }
  } catch (e) {
    return { error: 'No se pudo decodificar. ¿El token está completo y bien formado?' }
  }
}

// ---------------- Identificador de hash ----------------
export function identifyHash(input) {
  const h = (input || '').trim()
  if (!h) return []
  const guesses = []
  const isHex = /^[a-fA-F0-9]+$/.test(h)
  if (h.startsWith('$2a$') || h.startsWith('$2b$') || h.startsWith('$2y$')) guesses.push('bcrypt')
  if (h.startsWith('$argon2')) guesses.push('Argon2')
  if (h.startsWith('$6$')) guesses.push('sha512crypt (Linux /etc/shadow)')
  if (h.startsWith('$5$')) guesses.push('sha256crypt')
  if (h.startsWith('$1$')) guesses.push('md5crypt')
  if (h.startsWith('$y$') || h.startsWith('$7$')) guesses.push('yescrypt / scrypt')
  if (isHex) {
    const len = h.length
    if (len === 32) guesses.push('MD5', 'NTLM', 'MD4')
    else if (len === 40) guesses.push('SHA-1')
    else if (len === 56) guesses.push('SHA-224')
    else if (len === 64) guesses.push('SHA-256', 'SHA3-256')
    else if (len === 96) guesses.push('SHA-384')
    else if (len === 128) guesses.push('SHA-512', 'SHA3-512')
  }
  if (/^[a-fA-F0-9]{32}:[a-fA-F0-9]{32}$/.test(h)) guesses.push('LM:NTLM (par de hashes Windows)')
  if (guesses.length === 0) guesses.push('Formato no reconocido (¿base64? ¿texto?)')
  return [...new Set(guesses)]
}

// ---------------- Constructor de comando Nmap ----------------
export function buildNmap(opts = {}) {
  const {
    target = '192.168.1.0/24',
    scanType = '-sS',
    ports = 'top',
    customPorts = '80,443',
    serviceVersion = true,
    defaultScripts = true,
    osDetect = false,
    vulnScripts = false,
    timing = '-T4',
  } = opts
  const parts = ['nmap']
  if (scanType) parts.push(scanType)
  if (serviceVersion) parts.push('-sV')
  if (defaultScripts) parts.push('-sC')
  if (osDetect) parts.push('-O')
  if (vulnScripts) parts.push('--script vuln')
  if (timing) parts.push(timing)
  if (ports === 'all') parts.push('-p-')
  else if (ports === 'custom') parts.push('-p ' + (customPorts || '80,443'))
  // 'top' => por defecto (1000 puertos), no se añade flag
  parts.push(target || '<objetivo>')
  return parts.join(' ')
}

// ---------------- Metadatos de herramientas interactivas ----------------
export const INTERACTIVE_TOOLS = [
  { id: 'hash', name: 'Generador de Hash', icon: '#', color: '#00f6ff', desc: 'SHA-1/256/384/512 de cualquier texto' },
  { id: 'encoder', name: 'Codificar / Decodificar', icon: '⇄', color: '#33ff99', desc: 'Base64 · URL · Hex' },
  { id: 'pwcheck', name: 'Analizador de Contraseñas', icon: '◆', color: '#ff4d6d', desc: 'Entropía y tiempo de crackeo' },
  { id: 'pwgen', name: 'Generador de Contraseñas', icon: '⚿', color: '#c084fc', desc: 'Aleatoriedad criptográfica' },
  { id: 'jwt', name: 'Decodificador JWT', icon: '⬡', color: '#fbbf24', desc: 'Inspecciona header y payload' },
  { id: 'hashid', name: 'Identificador de Hash', icon: '?', color: '#38bdf8', desc: 'Detecta el tipo de hash' },
  { id: 'nmap', name: 'Constructor Nmap', icon: '⌖', color: '#ff7a18', desc: 'Genera el comando (no lo ejecuta)' },
]

// ---------------- Cheat-sheets / referencia de herramientas CLI ----------------
// Uso educativo. Ejecuta estas herramientas SOLO en sistemas propios o autorizados.
export const TOOL_REFERENCE = {
  Nmap: {
    what: 'Escáner de red y puertos. Descubre hosts, servicios y versiones.',
    url: 'https://nmap.org/book/man.html',
    examples: ['nmap -sV -sC 10.10.10.5', 'nmap -p- 10.10.10.5', 'nmap --script vuln <objetivo>'],
  },
  'Burp Suite': {
    what: 'Proxy de intercepción para auditar aplicaciones web.',
    url: 'https://portswigger.net/burp/documentation',
    examples: ['Configura el navegador con el proxy de Burp', 'Usa Repeater para reenviar peticiones'],
  },
  'OWASP ZAP': {
    what: 'Proxy y escáner web open source (alternativa libre a Burp).',
    url: 'https://www.zaproxy.org/docs/',
    examples: ['zap.sh -daemon -port 8080', 'Spider + Active Scan desde la GUI'],
  },
  Wireshark: {
    what: 'Analizador de paquetes para inspeccionar tráfico de red.',
    url: 'https://www.wireshark.org/docs/',
    examples: ['Filtro: http', 'Filtro: ip.addr == 10.0.0.5', 'Follow > TCP Stream'],
  },
  tcpdump: {
    what: 'Captura de paquetes por línea de comandos.',
    url: 'https://www.tcpdump.org/manpages/tcpdump.1.html',
    examples: ['tcpdump -i eth0 -w out.pcap', "tcpdump -nn 'tcp port 80'"],
  },
  Metasploit: {
    what: 'Framework de explotación para pentesting autorizado y labs.',
    url: 'https://docs.metasploit.com/',
    examples: ['msfconsole', 'search <cve>', 'use exploit/...  ; set RHOSTS ; run'],
  },
  Hashcat: {
    what: 'Crackeo de hashes acelerado por GPU (auditoría offline).',
    url: 'https://hashcat.net/wiki/',
    examples: ['hashcat -m 0 hashes.txt rockyou.txt', 'hashcat -m 1000 ntlm.txt -a 3 ?a?a?a?a'],
  },
  'John the Ripper': {
    what: 'Cracker de contraseñas multi-formato.',
    url: 'https://www.openwall.com/john/doc/',
    examples: ['john --wordlist=rockyou.txt hashes.txt', 'john --show hashes.txt'],
  },
  Hydra: {
    what: 'Fuerza bruta de servicios en línea (auditoría autorizada).',
    url: 'https://github.com/vanhauser-thc/thc-hydra',
    examples: ['hydra -l admin -P pass.txt ssh://10.0.0.5'],
  },
  sqlmap: {
    what: 'Detección y explotación automatizada de inyección SQL.',
    url: 'https://github.com/sqlmapproject/sqlmap/wiki',
    examples: ['sqlmap -u "https://t/?id=1" --batch', 'sqlmap -r req.txt --dbs'],
  },
  Gobuster: {
    what: 'Fuerza bruta de directorios, archivos y subdominios.',
    url: 'https://github.com/OJ/gobuster',
    examples: ['gobuster dir -u https://t -w common.txt'],
  },
  ffuf: {
    what: 'Fuzzer web rápido para descubrir contenido.',
    url: 'https://github.com/ffuf/ffuf',
    examples: ['ffuf -u https://t/FUZZ -w wordlist.txt'],
  },
  Nikto: {
    what: 'Escáner de servidores web (configuraciones inseguras).',
    url: 'https://github.com/sullo/nikto',
    examples: ['nikto -h https://t'],
  },
  WPScan: {
    what: 'Auditoría de seguridad específica de WordPress.',
    url: 'https://github.com/wpscanteam/wpscan',
    examples: ['wpscan --url https://t --enumerate u'],
  },
  theHarvester: {
    what: 'OSINT: correos, subdominios y hosts de fuentes públicas.',
    url: 'https://github.com/laramies/theHarvester',
    examples: ['theHarvester -d dominio.com -b all'],
  },
  Amass: {
    what: 'Enumeración de subdominios y mapeo de superficie de ataque.',
    url: 'https://github.com/owasp-amass/amass',
    examples: ['amass enum -d dominio.com'],
  },
  Shodan: {
    what: 'Buscador de dispositivos y servicios expuestos en Internet.',
    url: 'https://help.shodan.io/',
    examples: ['shodan search "apache"', 'shodan host 8.8.8.8'],
  },
  Ghidra: {
    what: 'Suite de ingeniería inversa de la NSA (gratuita).',
    url: 'https://ghidra-sre.org/',
    examples: ['Importar binario > Auto-analyze', 'Ver el decompilador'],
  },
  YARA: {
    what: 'Reglas para identificar y clasificar malware por patrones.',
    url: 'https://yara.readthedocs.io/',
    examples: ['yara reglas.yar muestra.bin'],
  },
  Volatility: {
    what: 'Análisis forense de volcados de memoria RAM.',
    url: 'https://volatilityfoundation.github.io/',
    examples: ['vol.py -f dump.raw windows.pslist'],
  },
  BloodHound: {
    what: 'Mapea rutas de ataque y privilegios en Active Directory.',
    url: 'https://bloodhound.readthedocs.io/',
    examples: ['Recolecta con SharpHound', 'Consulta "Shortest path to Domain Admins"'],
  },
  Trivy: {
    what: 'Escáner de vulnerabilidades para contenedores e IaC.',
    url: 'https://aquasecurity.github.io/trivy/',
    examples: ['trivy image nginx:latest', 'trivy fs .'],
  },
  Semgrep: {
    what: 'Análisis estático (SAST) basado en reglas.',
    url: 'https://semgrep.dev/docs/',
    examples: ['semgrep --config auto .'],
  },
  gitleaks: {
    what: 'Detecta secretos y claves filtradas en repositorios.',
    url: 'https://github.com/gitleaks/gitleaks',
    examples: ['gitleaks detect --source .'],
  },
}

// Resuelve una etiqueta de herramienta a una acción del Arsenal.
// Devuelve { type:'tool', id } si hay una herramienta interactiva equivalente,
// o { type:'ref', name } para mostrar su cheat-sheet, o { type:'none' }.
export function resolveToolTag(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('jwt')) return { type: 'tool', id: 'jwt' }
  if (n.includes('argon') || n.includes('bcrypt')) return { type: 'tool', id: 'pwcheck' }
  if (n.includes('hashcat') || n.includes('john')) return { type: 'tool', id: 'hashid' }
  if (n.includes('sha256sum') || n === 'openssl') return { type: 'tool', id: 'hash' }
  if (n === 'nmap') return { type: 'tool', id: 'nmap' }
  // Coincidencia con la referencia
  for (const key of Object.keys(TOOL_REFERENCE)) {
    if (key.toLowerCase() === n) return { type: 'ref', name: key }
  }
  return { type: 'none', name }
}
