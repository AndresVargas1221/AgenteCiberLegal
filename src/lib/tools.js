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
  { id: 'hmac', name: 'Generador HMAC', icon: '⊟', color: '#00f6ff', desc: 'HMAC-SHA256/384/512 con clave' },
  { id: 'encoder', name: 'Codificar / Decodificar', icon: '⇄', color: '#33ff99', desc: 'Base64 · URL · Hex' },
  { id: 'base', name: 'Conversor de Bases', icon: '⟐', color: '#33ff99', desc: 'Binario · Octal · Decimal · Hex' },
  { id: 'pwcheck', name: 'Analizador de Contraseñas', icon: '◆', color: '#ff4d6d', desc: 'Entropía y tiempo de crackeo' },
  { id: 'pwgen', name: 'Generador de Contraseñas', icon: '⚿', color: '#c084fc', desc: 'Aleatoriedad criptográfica' },
  { id: 'entropy', name: 'Calculadora de Entropía', icon: '∿', color: '#c084fc', desc: 'Entropía de Shannon de un texto' },
  { id: 'jwt', name: 'Decodificador JWT', icon: '⬡', color: '#fbbf24', desc: 'Inspecciona header y payload' },
  { id: 'jwtsign', name: 'Firmador JWT (HS256)', icon: '✶', color: '#fbbf24', desc: 'Genera un JWT firmado' },
  { id: 'hashid', name: 'Identificador de Hash', icon: '?', color: '#38bdf8', desc: 'Detecta el tipo de hash' },
  { id: 'uuid', name: 'UUID & Tokens', icon: '⧉', color: '#38bdf8', desc: 'UUID v4 y tokens seguros' },
  { id: 'timestamp', name: 'Conversor de Timestamps', icon: '◷', color: '#60a5fa', desc: 'Epoch ⇄ fecha' },
  { id: 'cidr', name: 'Calculadora CIDR', icon: '⊞', color: '#22d3ee', desc: 'Subredes, rango y hosts' },
  { id: 'rot', name: 'César / ROT13', icon: '↻', color: '#a78bfa', desc: 'Cifrado por desplazamiento' },
  { id: 'xor', name: 'Cifrado XOR', icon: '⊕', color: '#a78bfa', desc: 'XOR con clave (hex)' },
  { id: 'regex', name: 'Probador de Regex', icon: '⋙', color: '#f472b6', desc: 'Prueba expresiones regulares' },
  { id: 'json', name: 'Formateador JSON', icon: '{}', color: '#f472b6', desc: 'Valida y embellece JSON' },
  { id: 'httpheaders', name: 'Analizador de Cabeceras', icon: '⛨', color: '#33ff99', desc: 'Evalúa headers de seguridad' },
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
  Nuclei: {
    what: 'Escáner de vulnerabilidades basado en plantillas (YAML).',
    url: 'https://docs.projectdiscovery.io/tools/nuclei',
    examples: ['nuclei -u https://t', 'nuclei -l urls.txt -t cves/'],
  },
  Subfinder: {
    what: 'Descubrimiento pasivo y rápido de subdominios.',
    url: 'https://docs.projectdiscovery.io/tools/subfinder',
    examples: ['subfinder -d dominio.com'],
  },
  httpx: {
    what: 'Sondeo HTTP rápido para validar hosts vivos y tecnologías.',
    url: 'https://docs.projectdiscovery.io/tools/httpx',
    examples: ['httpx -l hosts.txt -title -tech-detect'],
  },
  masscan: {
    what: 'Escáner de puertos masivo y muy rápido.',
    url: 'https://github.com/robertdavidgraham/masscan',
    examples: ['masscan -p1-65535 10.0.0.0/24 --rate 1000'],
  },
  Netcat: {
    what: 'Navaja suiza de red: conexiones TCP/UDP, transferencia, listeners.',
    url: 'https://nmap.org/ncat/',
    examples: ['nc -lvnp 4444', 'nc target 80'],
  },
  Nessus: {
    what: 'Escáner de vulnerabilidades comercial muy usado en empresas.',
    url: 'https://docs.tenable.com/',
    examples: ['Crea una política y lanza un scan desde la web'],
  },
  OpenVAS: {
    what: 'Escáner de vulnerabilidades open source (Greenbone).',
    url: 'https://www.greenbone.net/en/',
    examples: ['Configura objetivos y tareas desde la GUI'],
  },
  'Aircrack-ng': {
    what: 'Suite de auditoría de redes WiFi (en redes propias).',
    url: 'https://www.aircrack-ng.org/documentation.html',
    examples: ['airodump-ng wlan0mon', 'aircrack-ng -w wordlist cap.cap'],
  },
  Impacket: {
    what: 'Colección de scripts Python para protocolos de red (SMB, Kerberos).',
    url: 'https://github.com/fortra/impacket',
    examples: ['secretsdump.py dom/user@host', 'psexec.py dom/user@host'],
  },
  CrackMapExec: {
    what: 'Post-explotación y enumeración masiva en redes Windows/AD.',
    url: 'https://www.crackmapexec.wiki/',
    examples: ['crackmapexec smb 10.0.0.0/24 -u u -p p'],
  },
  Responder: {
    what: 'Envenenamiento LLMNR/NBT-NS para capturar credenciales (lab/autorizado).',
    url: 'https://github.com/lgandx/Responder',
    examples: ['responder -I eth0'],
  },
  enum4linux: {
    what: 'Enumeración de información SMB/Samba en hosts.',
    url: 'https://github.com/CiscoCXSecurity/enum4linux',
    examples: ['enum4linux -a 10.0.0.5'],
  },
  Wfuzz: {
    what: 'Fuzzer web para fuerza bruta de parámetros y rutas.',
    url: 'https://wfuzz.readthedocs.io/',
    examples: ['wfuzz -w wl.txt https://t/FUZZ'],
  },
  Binwalk: {
    what: 'Análisis y extracción de firmware e imágenes binarias.',
    url: 'https://github.com/ReFirmLabs/binwalk',
    examples: ['binwalk -e firmware.bin'],
  },
  Frida: {
    what: 'Instrumentación dinámica para apps (móvil/escritorio).',
    url: 'https://frida.re/docs/home/',
    examples: ['frida-trace -U -i "open" app'],
  },
  MobSF: {
    what: 'Análisis automático de seguridad para apps móviles.',
    url: 'https://mobsf.github.io/docs/',
    examples: ['Sube el APK/IPA a la interfaz web'],
  },
  CyberChef: {
    what: '"Navaja suiza" web para codificar, cifrar y analizar datos.',
    url: 'https://gchq.github.io/CyberChef/',
    examples: ['Arrastra operaciones para construir una "receta"'],
  },
  Autopsy: {
    what: 'Plataforma forense de disco con interfaz gráfica.',
    url: 'https://www.autopsy.com/',
    examples: ['Crea un caso e ingiere una imagen de disco'],
  },
  Mimikatz: {
    what: 'Extrae credenciales en Windows (uso defensivo/autorizado).',
    url: 'https://github.com/gentilkiwi/mimikatz',
    examples: ['sekurlsa::logonpasswords'],
  },
  Snort: {
    what: 'IDS/IPS open source basado en firmas.',
    url: 'https://www.snort.org/documents',
    examples: ['snort -c snort.conf -i eth0'],
  },
  Suricata: {
    what: 'IDS/IPS de alto rendimiento, multihilo.',
    url: 'https://docs.suricata.io/',
    examples: ['suricata -c suricata.yaml -i eth0'],
  },
  Zeek: {
    what: 'Monitor de red para análisis y detección (antes Bro).',
    url: 'https://docs.zeek.org/',
    examples: ['zeek -i eth0', 'zeek -r captura.pcap'],
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


// =============================================================
// CyberOracle · Arsenal — Herramientas adicionales (v2)
// Todo client-side. Web Crypto donde aplica.
// =============================================================

// ---------- Utilidades base64url ----------
function b64urlFromBytes(bytes) {
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function b64urlFromStr(str) {
  return b64urlFromBytes(new TextEncoder().encode(str))
}

// ---------- HMAC (Web Crypto) ----------
export async function hmacHex(hashName, key, msg) {
  const enc = new TextEncoder()
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: hashName }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', k, enc.encode(msg))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// ---------- Firmador de JWT (HS256/384/512) ----------
export async function signJWT(payloadObj, secret, alg = 'HS256') {
  const header = { alg, typ: 'JWT' }
  const h = b64urlFromStr(JSON.stringify(header))
  const p = b64urlFromStr(JSON.stringify(payloadObj))
  const data = `${h}.${p}`
  const hashName = alg === 'HS512' ? 'SHA-512' : alg === 'HS384' ? 'SHA-384' : 'SHA-256'
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: hashName }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(data))
  return `${data}.${b64urlFromBytes(new Uint8Array(sig))}`
}

// ---------- Calculadora CIDR / Subred ----------
export function cidrInfo(input) {
  const raw = (input || '').trim()
  const [ip, bitsStr] = raw.split('/')
  const bits = parseInt(bitsStr, 10)
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(ip || '') || isNaN(bits) || bits < 0 || bits > 32) {
    return { error: 'Formato esperado: 192.168.1.0/24' }
  }
  const octs = ip.split('.').map(Number)
  if (octs.some((o) => o < 0 || o > 255)) return { error: 'Octetos fuera de rango (0-255).' }
  const ipNum = (((octs[0] << 24) >>> 0) + (octs[1] << 16) + (octs[2] << 8) + octs[3]) >>> 0
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0
  const network = (ipNum & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0
  const toIp = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.')
  const hostBits = 32 - bits
  const total = Math.pow(2, hostBits)
  const usable = bits >= 31 ? (bits === 32 ? 1 : 2) : total - 2
  const first = bits >= 31 ? network : (network + 1) >>> 0
  const last = bits >= 31 ? broadcast : (broadcast - 1) >>> 0
  return {
    cidr: `/${bits}`,
    network: toIp(network),
    broadcast: toIp(broadcast),
    mask: toIp(mask),
    wildcard: toIp(~mask >>> 0),
    first: toIp(first),
    last: toIp(last),
    totalHosts: total,
    usableHosts: usable,
  }
}

// ---------- Conversor de timestamps ----------
export function timestampInfo(input) {
  const v = (input || '').trim()
  if (!v) return null
  let date
  if (/^\d+$/.test(v)) {
    const n = Number(v)
    date = new Date(v.length > 10 ? n : n * 1000)
  } else {
    const t = Date.parse(v)
    if (isNaN(t)) return { error: 'Fecha no reconocida. Prueba ISO o un epoch.' }
    date = new Date(t)
  }
  if (isNaN(date.getTime())) return { error: 'Valor inválido.' }
  return {
    iso: date.toISOString(),
    local: date.toLocaleString(),
    utc: date.toUTCString(),
    epochSec: Math.floor(date.getTime() / 1000),
    epochMs: date.getTime(),
    relative: relativeTime(date.getTime()),
  }
}
function relativeTime(ms) {
  const diff = (ms - Date.now()) / 1000
  const abs = Math.abs(diff)
  const fut = diff > 0
  let val, unit
  if (abs < 60) { val = Math.round(abs); unit = 'segundos' }
  else if (abs < 3600) { val = Math.round(abs / 60); unit = 'minutos' }
  else if (abs < 86400) { val = Math.round(abs / 3600); unit = 'horas' }
  else if (abs < 2629800) { val = Math.round(abs / 86400); unit = 'días' }
  else if (abs < 31557600) { val = Math.round(abs / 2629800); unit = 'meses' }
  else { val = Math.round(abs / 31557600); unit = 'años' }
  return fut ? `dentro de ${val} ${unit}` : `hace ${val} ${unit}`
}

// ---------- UUID y tokens aleatorios ----------
export function uuidv4() {
  if (crypto.randomUUID) return crypto.randomUUID()
  const a = new Uint8Array(16)
  crypto.getRandomValues(a)
  a[6] = (a[6] & 0x0f) | 0x40
  a[8] = (a[8] & 0x3f) | 0x80
  const h = [...a].map((b) => b.toString(16).padStart(2, '0'))
  return `${h.slice(0, 4).join('')}-${h.slice(4, 6).join('')}-${h.slice(6, 8).join('')}-${h.slice(8, 10).join('')}-${h.slice(10, 16).join('')}`
}
export function randomToken(bytes = 32, fmt = 'hex') {
  const a = new Uint8Array(bytes)
  crypto.getRandomValues(a)
  if (fmt === 'hex') return [...a].map((b) => b.toString(16).padStart(2, '0')).join('')
  if (fmt === 'base64url') return b64urlFromBytes(a)
  let bin = ''
  a.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin)
}

// ---------- Conversor de bases numéricas ----------
export function convertBase(value, fromBase) {
  const n = parseInt((value || '').trim(), fromBase)
  if (isNaN(n)) return { error: 'Número inválido para la base elegida.' }
  return {
    bin: n.toString(2),
    oct: n.toString(8),
    dec: n.toString(10),
    hex: n.toString(16).toUpperCase(),
  }
}

// ---------- Entropía de Shannon ----------
export function shannonEntropy(str) {
  if (!str) return { perChar: 0, bits: 0, len: 0 }
  const freq = {}
  for (const ch of str) freq[ch] = (freq[ch] || 0) + 1
  let H = 0
  const len = str.length
  for (const k in freq) {
    const p = freq[k] / len
    H -= p * Math.log2(p)
  }
  return { perChar: H, bits: H * len, len }
}

// ---------- Cifrado César / ROT ----------
export function caesar(str, shift) {
  const s = ((shift % 26) + 26) % 26
  return (str || '').replace(/[a-z]/gi, (c) => {
    const base = c <= 'Z' ? 65 : 97
    return String.fromCharCode(((c.charCodeAt(0) - base + s) % 26) + base)
  })
}

// ---------- Cifrado XOR (clave de texto) ----------
export function xorToHex(text, key) {
  if (!key) return ''
  const tb = new TextEncoder().encode(text)
  const kb = new TextEncoder().encode(key)
  const out = tb.map((b, i) => b ^ kb[i % kb.length])
  return [...out].map((b) => b.toString(16).padStart(2, '0')).join('')
}
export function xorFromHex(hex, key) {
  if (!key) return ''
  const bytes = (hex.replace(/[^0-9a-fA-F]/g, '').match(/.{1,2}/g) || []).map((h) => parseInt(h, 16))
  const kb = new TextEncoder().encode(key)
  const out = bytes.map((b, i) => b ^ kb[i % kb.length])
  return new TextDecoder().decode(Uint8Array.from(out))
}

// ---------- Probador de Regex ----------
export function testRegex(pattern, flags, text) {
  try {
    const gflags = flags.includes('g') ? flags : flags + 'g'
    const re = new RegExp(pattern, gflags)
    const matches = [...(text || '').matchAll(re)].map((m) => m[0])
    return { ok: true, count: matches.length, matches: matches.slice(0, 200) }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// ---------- Formateador / validador JSON ----------
export function formatJSON(str) {
  try {
    const obj = JSON.parse(str)
    return { ok: true, pretty: JSON.stringify(obj, null, 2) }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// ---------- Analizador de cabeceras HTTP de seguridad ----------
export function analyzeHeaders(raw) {
  const map = {}
  ;(raw || '').split('\n').forEach((l) => {
    const i = l.indexOf(':')
    if (i > 0) map[l.slice(0, i).trim().toLowerCase()] = l.slice(i + 1).trim()
  })
  const checks = [
    { key: 'strict-transport-security', name: 'Strict-Transport-Security (HSTS)', good: 'Fuerza HTTPS' },
    { key: 'content-security-policy', name: 'Content-Security-Policy (CSP)', good: 'Mitiga XSS/inyección' },
    { key: 'x-content-type-options', name: 'X-Content-Type-Options', good: 'Evita MIME sniffing' },
    { key: 'x-frame-options', name: 'X-Frame-Options', good: 'Anti-clickjacking' },
    { key: 'referrer-policy', name: 'Referrer-Policy', good: 'Controla el Referer' },
    { key: 'permissions-policy', name: 'Permissions-Policy', good: 'Limita APIs del navegador' },
  ]
  const results = checks.map((c) => ({ name: c.name, present: !!map[c.key], value: map[c.key] || '', good: c.good }))
  const score = Math.round((results.filter((r) => r.present).length / checks.length) * 100)
  const warns = []
  if (map['server']) warns.push('La cabecera "Server" revela software: ' + map['server'])
  if (map['x-powered-by']) warns.push('"X-Powered-By" revela tecnología: ' + map['x-powered-by'])
  return { results, score, warns }
}
