// Categorías (dominios) de ciberseguridad cubiertas por CyberOracle
export const CATEGORIES = [
  { id: 'fundamentos', name: 'Fundamentos', icon: '◈', color: '#00f6ff', desc: 'Conceptos base, CIA, amenazas y riesgo' },
  { id: 'web', name: 'Seguridad Web', icon: '⬡', color: '#ff4d6d', desc: 'OWASP Top 10, XSS, SQLi, CSRF' },
  { id: 'redes', name: 'Redes', icon: '⌬', color: '#33ff99', desc: 'Protocolos, firewalls, IDS/IPS, escaneo' },
  { id: 'cripto', name: 'Criptografía', icon: '⟁', color: '#c084fc', desc: 'Cifrado, hashing, PKI, TLS' },
  { id: 'pentesting', name: 'Pentesting', icon: '⌖', color: '#ff7a18', desc: 'Metodología, fases, explotación' },
  { id: 'herramientas', name: 'Herramientas', icon: '⚙', color: '#00f6ff', desc: 'Nmap, Burp, Wireshark, Metasploit' },
  { id: 'malware', name: 'Análisis de Malware', icon: '☣', color: '#ff4d6d', desc: 'Tipos, análisis estático/dinámico' },
  { id: 'forense', name: 'Forense Digital', icon: '⊡', color: '#38bdf8', desc: 'Adquisición, cadena de custodia' },
  { id: 'incidentes', name: 'Respuesta a Incidentes', icon: '⚡', color: '#fbbf24', desc: 'Ciclo IR NIST, contención' },
  { id: 'blueteam', name: 'Blue Team / SOC', icon: '🛡', color: '#33ff99', desc: 'SIEM, detección, threat hunting' },
  { id: 'cloud', name: 'Seguridad Cloud', icon: '☁', color: '#60a5fa', desc: 'AWS, Azure, GCP, responsabilidad' },
  { id: 'movil', name: 'Seguridad Móvil', icon: '▢', color: '#a78bfa', desc: 'Android, iOS, OWASP MASVS' },
  { id: 'iot', name: 'IoT / OT', icon: '◎', color: '#34d399', desc: 'Dispositivos, ICS/SCADA' },
  { id: 'social', name: 'Ingeniería Social', icon: '◉', color: '#f472b6', desc: 'Phishing, concienciación, defensa' },
  { id: 'ad', name: 'Active Directory', icon: '⊞', color: '#22d3ee', desc: 'Windows, Kerberos, hardening' },
  { id: 'frameworks', name: 'Frameworks', icon: '▦', color: '#facc15', desc: 'MITRE ATT&CK, NIST, ISO 27001' },
  { id: 'certificaciones', name: 'Certificaciones', icon: '✦', color: '#c084fc', desc: 'OSCP, CEH, Security+, CISSP' },
  { id: 'devsecops', name: 'DevSecOps', icon: '∞', color: '#2dd4bf', desc: 'CI/CD, SAST/DAST, contenedores' },
  { id: 'threatintel', name: 'Threat Intelligence', icon: '⊛', color: '#fb7185', desc: 'IOCs, TTPs, OSINT' },
  { id: 'carrera', name: 'Carrera & Aprendizaje', icon: '★', color: '#00f6ff', desc: 'Rutas, labs, recursos' },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))
