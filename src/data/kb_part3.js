// CyberOracle KB · Parte 3 — Pentesting y Herramientas
export const KB_PART3 = [
  // ===================== PENTESTING =====================
  {
    id: 'metodologia-pentest',
    category: 'pentesting',
    title: 'Metodología de Pentesting y sus fases',
    keywords: ['pentest', 'pentesting', 'metodologia', 'fases', 'ptes', 'reconocimiento', 'explotacion', 'post explotacion', 'reporte', 'kill chain', 'red team'],
    summary: 'Las fases estándar de una prueba de penetración profesional y ética.',
    content: `## Pentesting ético

Simulación **autorizada** de un ataque para encontrar y reportar debilidades **antes** que un adversario real. Requiere **alcance y permiso por escrito** (regla de oro).

### Fases (PTES / estilo OSCP)
1. **Pre-engagement:** alcance, reglas, autorización, objetivos.
2. **Reconocimiento:** OSINT, footprinting (pasivo) y escaneo (activo).
3. **Enumeración:** servicios, versiones, usuarios, shares.
4. **Análisis de vulnerabilidades:** mapear hallazgos a debilidades.
5. **Explotación:** obtener acceso (controlado, sin causar daño).
6. **Post-explotación:** escalada de privilegios, persistencia (en lab), evaluar impacto, movimiento lateral.
7. **Reporte:** hallazgos, riesgo (CVSS), evidencias y **recomendaciones**. Es la entrega de mayor valor.

### Tipos
- **Black/Grey/White box** según el conocimiento previo.
- **Red Team:** simulación adversaria sigilosa y orientada a objetivos.
- **Purple Team:** Red + Blue colaborando para mejorar detección.

> Cyber Kill Chain (Lockheed Martin): recon → weaponization → delivery → exploitation → installation → C2 → actions on objectives.`,
    tools: ['Kali Linux', 'Parrot OS', 'Metasploit', 'Burp Suite'],
  },
  {
    id: 'reconocimiento-osint',
    category: 'pentesting',
    title: 'Reconocimiento, footprinting y OSINT',
    keywords: ['reconocimiento', 'osint', 'footprinting', 'recon', 'enumeracion', 'informacion publica', 'dns', 'subdominios', 'google dorks'],
    summary: 'Recolección de información pública (pasiva) y activa sobre un objetivo autorizado.',
    content: `## Reconocimiento

Primera fase: cuanta más información, mejor el ataque/defensa.

### Pasivo (sin tocar el objetivo)
- **OSINT:** información pública (webs, redes sociales, registros).
- **WHOIS / DNS:** dominios, registros, rangos IP.
- **Google Dorks:** búsquedas avanzadas (\`site:\`, \`filetype:\`, \`inurl:\`).
- Filtraciones de credenciales, repos públicos, metadatos de documentos.

### Activo (interactúa con el objetivo)
- Escaneo de puertos y servicios, banner grabbing.
- Enumeración de subdominios, directorios web, usuarios.

### Defensa (reducir tu huella)
- Minimiza información sensible pública.
- Revisa metadatos antes de publicar archivos.
- Monitorea menciones y filtraciones de tu organización.`,
    tools: ['theHarvester', 'Amass', 'Shodan', 'Maltego', 'recon-ng', 'dnsrecon'],
  },
  {
    id: 'escalada-privilegios',
    category: 'pentesting',
    title: 'Escalada de privilegios (Linux y Windows)',
    keywords: ['escalada de privilegios', 'privilege escalation', 'privesc', 'suid', 'sudo', 'kernel', 'linux', 'windows', 'token', 'misconfiguracion'],
    summary: 'Cómo se pasa de acceso limitado a control total, y cómo prevenirlo.',
    content: `## Escalada de privilegios

Pasar de un usuario sin privilegios a admin/root. Concepto clave en post-explotación (en entornos autorizados/labs).

### Vectores frecuentes (Linux)
- Binarios **SUID/SGID** mal configurados (ver GTFOBins).
- Permisos \`sudo\` excesivos.
- Tareas **cron** escribibles, PATH inseguro.
- Kernel/servicios sin parchear.

### Vectores frecuentes (Windows)
- Servicios con rutas no citadas o permisos débiles.
- Tokens y privilegios (SeImpersonate, "Potato").
- Credenciales en memoria/registro, AlwaysInstallElevated.

### Defensa
- **Mínimo privilegio** y revisión de \`sudoers\`.
- Parcheo continuo del kernel y servicios.
- Auditar SUID, permisos de servicios y tareas programadas.
- EDR para detectar técnicas comunes.`,
    tools: ['LinPEAS / WinPEAS', 'GTFOBins', 'LOLBAS', 'BloodHound'],
  },

  // ===================== HERRAMIENTAS =====================
  {
    id: 'nmap',
    category: 'herramientas',
    title: 'Nmap — escáner de redes y puertos',
    keywords: ['nmap', 'escaneo', 'puertos', 'scan', 'descubrimiento', 'nse', 'servicios', 'mapa de red'],
    summary: 'El escáner de red más usado: descubre hosts, puertos, servicios y versiones.',
    content: `## Nmap (Network Mapper)

Herramienta esencial de descubrimiento y auditoría de red. **Úsala solo en redes propias o autorizadas.**

### Comandos típicos
\`\`\`bash
nmap -sn 192.168.1.0/24          # descubrir hosts (ping sweep)
nmap -sS -p- 10.10.10.5          # SYN scan de todos los puertos
nmap -sV -sC 10.10.10.5          # versiones + scripts por defecto
nmap -A 10.10.10.5               # OS + versión + scripts + traceroute
nmap --script vuln 10.10.10.5    # scripts NSE de vulnerabilidades
\`\`\`

### Tipos de escaneo
- \`-sS\` SYN (sigiloso), \`-sT\` connect, \`-sU\` UDP.
- \`-T0..T5\` velocidad/sigilo.
- **NSE:** motor de scripts (descubrimiento, vuln, brute, etc.).

### Defensa
- Detectar escaneos con IDS, limitar exposición, filtrar puertos, fingerprinting controlado.`,
    tools: ['Nmap', 'Zenmap', 'masscan'],
  },
  {
    id: 'burp-suite',
    category: 'herramientas',
    title: 'Burp Suite — proxy y auditoría web',
    keywords: ['burp', 'burp suite', 'proxy', 'interceptar', 'repeater', 'intruder', 'web', 'scanner web', 'http'],
    summary: 'El proxy de intercepción estándar para pruebas de seguridad en aplicaciones web.',
    content: `## Burp Suite

Plataforma para probar la seguridad de aplicaciones web. Actúa como **proxy** entre el navegador y el servidor, permitiendo ver y modificar el tráfico.

### Módulos clave
- **Proxy:** intercepta y edita peticiones/respuestas.
- **Repeater:** reenvía y modifica peticiones manualmente.
- **Intruder:** automatiza payloads (fuzzing, enumeración).
- **Decoder/Comparer:** codificaciones y diferencias.
- **Scanner** (Pro): detección automática de vulnerabilidades.
- **Extensions (BApp Store):** amplían funcionalidad.

### Flujo típico
1. Configurar el navegador para usar el proxy de Burp.
2. Navegar la app para poblar el *site map*.
3. Analizar puntos de entrada y probar con Repeater/Intruder.

> Alternativa libre y open source: **OWASP ZAP**.`,
    tools: ['Burp Suite', 'OWASP ZAP', 'mitmproxy'],
  },
  {
    id: 'wireshark',
    category: 'herramientas',
    title: 'Wireshark y tcpdump — análisis de tráfico',
    keywords: ['wireshark', 'tcpdump', 'sniffer', 'captura de paquetes', 'pcap', 'analisis de trafico', 'filtros', 'red'],
    summary: 'Captura y análisis profundo de paquetes para diagnóstico y forense de red.',
    content: `## Wireshark / tcpdump

Analizadores de paquetes para inspeccionar el tráfico en detalle. Útiles en forense, diagnóstico y detección.

### tcpdump (CLI)
\`\`\`bash
tcpdump -i eth0 -w captura.pcap        # capturar a archivo
tcpdump -i eth0 'tcp port 80'          # filtrar HTTP
tcpdump -nn -A 'port 53'               # ver DNS en ASCII
\`\`\`

### Wireshark (GUI)
- **Filtros de visualización:** \`http\`, \`ip.addr == 10.0.0.5\`, \`tcp.flags.syn == 1\`.
- **Follow TCP Stream** para reconstruir conversaciones.
- Estadísticas de protocolos, exportación de objetos.

### Usos en seguridad
- Detectar exfiltración, C2, tráfico en claro y anomalías.
- En lab/red propia: capturar handshakes y analizar protocolos.

> Captura solo en redes donde tengas autorización; el sniffing de tráfico ajeno puede ser ilegal.`,
    tools: ['Wireshark', 'tcpdump', 'tshark'],
  },
  {
    id: 'metasploit',
    category: 'herramientas',
    title: 'Metasploit Framework — explotación (lab/autorizado)',
    keywords: ['metasploit', 'msf', 'exploit', 'payload', 'meterpreter', 'framework', 'explotacion', 'msfvenom'],
    summary: 'Framework para desarrollar y ejecutar exploits en entornos autorizados o de laboratorio.',
    content: `## Metasploit Framework

Plataforma de explotación usada en pentesting **autorizado** y aprendizaje (HTB, labs). Modulariza exploits, payloads y post-explotación.

### Conceptos
- **Exploit:** código que aprovecha una vulnerabilidad.
- **Payload:** lo que se ejecuta tras explotar (p. ej. **Meterpreter**).
- **Auxiliary:** escáneres, fuzzers, enumeración.
- **msfvenom:** genera payloads independientes.

### Flujo básico (msfconsole)
\`\`\`text
search <servicio/cve>
use exploit/...
set RHOSTS / LHOST / payload
run
\`\`\`

### Uso responsable
- Solo en máquinas propias, labs (Metasploitable, VulnHub) o con permiso por escrito.
- Documenta todo para el reporte.

### Defensa
- Parcheo, EDR/IDS, segmentación y detección de payloads/C2 conocidos.`,
    tools: ['Metasploit', 'msfvenom', 'Metasploitable (lab)'],
  },
  {
    id: 'password-tools',
    category: 'herramientas',
    title: 'Auditoría de contraseñas: Hashcat, John, Hydra',
    keywords: ['hashcat', 'john the ripper', 'hydra', 'cracking', 'contraseñas', 'fuerza bruta', 'diccionario', 'wordlist', 'rainbow'],
    summary: 'Herramientas para auditar la fortaleza de contraseñas y por qué importan.',
    content: `## Herramientas de auditoría de contraseñas

Usadas por equipos de seguridad para **medir la fortaleza** de credenciales (con autorización) y por atacantes para romperlas. Conocerlas ayuda a defender mejor.

- **Hashcat:** crackeo acelerado por GPU de hashes (offline). Modos: diccionario, reglas, máscara, híbrido.
- **John the Ripper:** crackeo de hashes versátil, multi-formato.
- **Hydra / Medusa:** fuerza bruta de **servicios en línea** (SSH, FTP, HTTP login).

### Por qué importa (defensa)
- Demuestra que contraseñas débiles caen en segundos.
- Justifica políticas: **frases de paso largas**, MFA, gestores de contraseñas.
- Refuerza el uso de hashes lentos (Argon2/bcrypt) y bloqueo tras intentos fallidos.

> Wordlists comunes: rockyou.txt, SecLists. Úsalas solo en entornos autorizados.`,
    tools: ['Hashcat', 'John the Ripper', 'Hydra', 'SecLists'],
  },
  {
    id: 'web-recon-tools',
    category: 'herramientas',
    title: 'Enumeración web: Gobuster, ffuf, Nikto, sqlmap',
    keywords: ['gobuster', 'ffuf', 'nikto', 'sqlmap', 'fuzzing', 'directorios', 'enumeracion web', 'dirbuster', 'wpscan'],
    summary: 'Herramientas para descubrir contenido y vulnerabilidades en aplicaciones web.',
    content: `## Enumeración y fuzzing web

- **Gobuster / ffuf / dirsearch:** descubren directorios, archivos y subdominios por fuerza bruta con wordlists.
- **Nikto:** escáner de servidores web (configuraciones inseguras, archivos peligrosos).
- **sqlmap:** detección y explotación automatizada de SQLi.
- **WPScan:** auditoría específica de WordPress.
- **whatweb / wappalyzer:** fingerprint de tecnologías.

### Ejemplo (autorizado)
\`\`\`bash
ffuf -u https://target/FUZZ -w wordlist.txt
gobuster dir -u https://target -w common.txt
\`\`\`

### Defensa
- Ocultar versiones, eliminar archivos por defecto/backup.
- Rate limiting y WAF para detectar fuzzing.
- Monitoreo de 404 masivos (señal de enumeración).`,
    tools: ['ffuf', 'Gobuster', 'Nikto', 'sqlmap', 'WPScan'],
  },
]
