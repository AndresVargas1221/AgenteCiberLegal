// CyberOracle KB · Parte 2 — Redes y Criptografía
export const KB_PART2 = [
  // ===================== REDES =====================
  {
    id: 'modelo-osi-tcpip',
    category: 'redes',
    title: 'Modelo OSI, TCP/IP y protocolos clave',
    keywords: ['osi', 'tcp/ip', 'tcp', 'udp', 'protocolos', 'capas', 'red', 'modelo de red', 'ip', 'puertos'],
    summary: 'Las capas de red y los protocolos que todo profesional de seguridad debe dominar.',
    content: `## Modelo OSI (7 capas)
1. **Física** — cables, señales.
2. **Enlace** — MAC, switches, VLAN (ataques: ARP spoofing, MAC flooding).
3. **Red** — IP, ICMP, routing (ataques: IP spoofing).
4. **Transporte** — TCP (fiable, handshake 3 vías) y UDP (rápido, sin estado).
5. **Sesión** — gestión de conexiones.
6. **Presentación** — cifrado, formatos (TLS encaja aquí).
7. **Aplicación** — HTTP, DNS, SMTP, SSH.

## TCP handshake
\`SYN → SYN-ACK → ACK\`. Abusos: SYN flood (DoS).

## Puertos comunes
- 22 SSH · 23 Telnet(inseguro) · 25 SMTP · 53 DNS · 80 HTTP · 443 HTTPS
- 139/445 SMB · 3389 RDP · 3306 MySQL · 1433 MSSQL · 161 SNMP

> Saber qué corre en cada puerto es la base del reconocimiento y del hardening.`,
    tools: ['Wireshark', 'tcpdump', 'Nmap'],
  },
  {
    id: 'firewall-ids-ips',
    category: 'redes',
    title: 'Firewalls, IDS/IPS, WAF y segmentación',
    keywords: ['firewall', 'ids', 'ips', 'waf', 'segmentacion', 'vlan', 'nac', 'deteccion intrusiones', 'snort', 'suricata'],
    summary: 'Dispositivos y técnicas para controlar y vigilar el tráfico de red.',
    content: `## Firewalls
- **Stateless:** filtran por reglas estáticas (IP/puerto).
- **Stateful:** rastrean el estado de las conexiones.
- **NGFW:** inspección profunda, identidad de aplicación, IPS integrado.

## IDS vs IPS
- **IDS (detección):** alerta sin bloquear (modo pasivo, fuera de línea).
- **IPS (prevención):** bloquea en línea.
- Métodos: por **firmas** (conocidas) y por **anomalías** (comportamiento).

## WAF
Firewall específico de aplicaciones web (capa 7). Mitiga OWASP Top 10 pero **no** sustituye código seguro.

## Segmentación
Dividir la red (VLANs, subredes, microsegmentación) limita el **movimiento lateral**. **NAC** controla qué dispositivos se conectan. Es un pilar de Zero Trust.`,
    tools: ['Snort', 'Suricata', 'pfSense', 'ModSecurity'],
  },
  {
    id: 'vpn-tunneling',
    category: 'redes',
    title: 'VPN, túneles y cifrado de tránsito',
    keywords: ['vpn', 'tunel', 'ipsec', 'wireguard', 'openvpn', 'tls', 'tunneling', 'cifrado en transito'],
    summary: 'Cómo proteger las comunicaciones en tránsito mediante túneles cifrados.',
    content: `## VPN (Virtual Private Network)
Crea un túnel cifrado sobre una red insegura.

- **IPsec:** opera en capa 3; modos *transport* y *tunnel*. Común en site-to-site.
- **OpenVPN:** sobre TLS, muy flexible.
- **WireGuard:** moderno, simple, criptografía actual, alto rendimiento.

## Buenas prácticas
- Usar protocolos modernos (WireGuard/IKEv2) y cifrados fuertes.
- MFA en el acceso VPN.
- Aplicar Zero Trust: una VPN no debe dar acceso plano a toda la red; segmentar.
- Registrar y monitorear conexiones.`,
    tools: ['WireGuard', 'OpenVPN', 'strongSwan'],
  },
  {
    id: 'dos-ddos',
    category: 'redes',
    title: 'DoS y DDoS — denegación de servicio y mitigación',
    keywords: ['dos', 'ddos', 'denegacion de servicio', 'syn flood', 'amplificacion', 'botnet', 'mitigacion', 'disponibilidad'],
    summary: 'Ataques que afectan la disponibilidad y cómo defenderse.',
    content: `## DoS / DDoS
Buscan agotar recursos (ancho de banda, CPU, conexiones) para tumbar un servicio. **DDoS** usa muchas fuentes (botnets).

### Tipos
- **Volumétricos:** saturan el ancho de banda (UDP/ICMP flood, amplificación DNS/NTP).
- **De protocolo:** agotan estados (SYN flood).
- **De aplicación (L7):** peticiones costosas a la app (HTTP flood, Slowloris).

### Mitigación
- Servicios anti-DDoS / CDN (scrubbing).
- Rate limiting y límites de conexiones.
- Autoescalado y arquitectura redundante.
- Filtrado de tráfico y geobloqueo según contexto.
- Plan de respuesta y contactos con el proveedor/ISP.`,
    tools: ['Cloudflare', 'fail2ban', 'iptables/nftables'],
  },

  // ===================== CRIPTOGRAFÍA =====================
  {
    id: 'cripto-simetrica-asimetrica',
    category: 'cripto',
    title: 'Cifrado simétrico vs asimétrico',
    keywords: ['criptografia', 'cifrado', 'simetrico', 'asimetrico', 'aes', 'rsa', 'ecc', 'clave publica', 'clave privada', 'encriptacion'],
    summary: 'Las dos grandes familias de cifrado y cuándo se usa cada una.',
    content: `## Cifrado simétrico
Una **misma clave** cifra y descifra. Rápido, ideal para grandes volúmenes.
- **AES** (128/192/256) es el estándar. Usar modos autenticados: **AES-GCM** o ChaCha20-Poly1305.
- Reto: **distribuir la clave** de forma segura.

## Cifrado asimétrico (clave pública)
Par de claves: **pública** (cifra/verifica) y **privada** (descifra/firma).
- **RSA** (2048+ bits) y **ECC** (curvas elípticas, más eficiente, p. ej. Curve25519).
- Más lento; se usa para **intercambio de claves** y **firmas**, no para grandes datos.

## Cifrado híbrido (lo real)
TLS combina ambos: asimétrico para **acordar** una clave de sesión, simétrico para **cifrar** los datos. Lo mejor de los dos mundos.

> Nunca inventes tu propia criptografía. Usa librerías auditadas (libsodium, Tink).`,
    tools: ['OpenSSL', 'libsodium', 'GnuPG', 'age'],
  },
  {
    id: 'hashing',
    category: 'cripto',
    title: 'Hashing, salting y almacenamiento de contraseñas',
    keywords: ['hash', 'hashing', 'sha256', 'md5', 'bcrypt', 'argon2', 'salt', 'contraseñas', 'passwords', 'rainbow table', 'integridad'],
    summary: 'Funciones hash, su uso para integridad y el almacenamiento correcto de contraseñas.',
    content: `## Funciones hash
Transforman datos en una huella de tamaño fijo, **irreversible** y sensible a cambios.
- **Integridad:** SHA-256/SHA-3 verifican que un archivo no cambió.
- **Evita:** MD5 y SHA-1 están **rotos** para usos de seguridad (colisiones).

## Almacenamiento de contraseñas (clave)
**Nunca** guardes contraseñas en texto plano ni con un hash rápido simple. Usa **hashes lentos y con sal**:
- **Argon2id** (recomendado actual), **bcrypt**, **scrypt**, **PBKDF2**.
- **Salt** único por usuario evita rainbow tables.
- **Pepper** opcional (secreto del servidor).

\`\`\`text
almacenar = Argon2id(password + salt_unico)
\`\`\`

## Conceptos
- **Colisión:** dos entradas con el mismo hash (malo).
- **HMAC:** hash con clave para autenticar mensajes (integridad + autenticidad).`,
    tools: ['Argon2', 'bcrypt', 'hashcat (auditoría)', 'sha256sum'],
  },
  {
    id: 'pki-tls',
    category: 'cripto',
    title: 'PKI, certificados y TLS/HTTPS',
    keywords: ['pki', 'certificado', 'tls', 'ssl', 'https', 'ca', 'autoridad certificadora', 'handshake', 'x509', 'lets encrypt'],
    summary: 'Infraestructura de clave pública y cómo TLS asegura las comunicaciones web.',
    content: `## PKI — Public Key Infrastructure
Sistema de **autoridades de certificación (CA)** que emiten y validan **certificados digitales** (X.509), vinculando una identidad a una clave pública. Cadena de confianza: CA raíz → intermedias → certificado del servidor.

## TLS / HTTPS
- **Handshake (TLS 1.3, simplificado):** acuerdo de claves efímeras (ECDHE → *forward secrecy*), autenticación del servidor por su certificado, y luego cifrado simétrico de la sesión.
- TLS 1.3 eliminó cifrados débiles y es más rápido.

## Buenas prácticas
- TLS 1.2+ (idealmente 1.3); deshabilitar SSLv3/TLS1.0/1.1.
- Suites con *forward secrecy* (ECDHE).
- HSTS, renovación automática (Let's Encrypt/ACME).
- Vigilar caducidad y validar la cadena.

> Verifica configuración con SSL Labs o \`testssl.sh\`.`,
    tools: ["Let's Encrypt", 'OpenSSL', 'testssl.sh', 'SSL Labs'],
  },
  {
    id: 'cripto-moderna',
    category: 'cripto',
    title: 'Firmas digitales, post-cuántica y errores comunes',
    keywords: ['firma digital', 'no repudio', 'post cuantica', 'quantum', 'criptografia moderna', 'nonce', 'errores cripto', 'entropia'],
    summary: 'Firmas digitales, amenaza cuántica y los errores criptográficos más frecuentes.',
    content: `## Firmas digitales
Garantizan **autenticidad, integridad y no repudio**: se firma con la clave **privada** y se verifica con la **pública**. Base de la firma de software, JWT (RS256/EdDSA) y certificados.

## Criptografía post-cuántica (PQC)
Los ordenadores cuánticos amenazan RSA/ECC (algoritmo de Shor). El NIST estandarizó algoritmos resistentes como **ML-KEM (Kyber)** y **ML-DSA (Dilithium)**. Estrategia: **crypto-agility** y migración progresiva.

## Errores comunes a evitar
- Reusar **nonces/IV** (rompe GCM/CTR).
- Usar **ECB** (revela patrones).
- Hardcodear claves en el código o repos.
- Generar claves con RNG no criptográfico (falta de **entropía**).
- "Roll your own crypto": implementar algoritmos propios.`,
    tools: ['libsodium', 'OpenSSL', 'git-secrets'],
  },
]
