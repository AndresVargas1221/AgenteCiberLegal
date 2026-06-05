// CyberOracle KB · Parte 6 — AD, Frameworks, Certs, DevSecOps, Threat Intel, Carrera
export const KB_PART6 = [
  // ===================== ACTIVE DIRECTORY =====================
  {
    id: 'active-directory',
    category: 'ad',
    title: 'Active Directory: ataques comunes y hardening',
    keywords: ['active directory', 'ad', 'kerberos', 'kerberoasting', 'pass the hash', 'golden ticket', 'bloodhound', 'ntlm', 'windows', 'mimikatz'],
    summary: 'Cómo se ataca y se protege el directorio que sostiene la mayoría de redes corporativas.',
    content: `## Active Directory (AD)

Servicio de directorio de Microsoft; controla identidades y accesos en redes Windows. Objetivo prioritario de los atacantes (control del dominio = control de todo).

### Ataques frecuentes (concepto defensivo)
- **Kerberoasting:** solicitar tickets de servicio (SPN) y crackearlos offline.
- **AS-REP Roasting:** cuentas sin preautenticación Kerberos.
- **Pass-the-Hash / Pass-the-Ticket:** reutilizar credenciales sin conocer la contraseña.
- **Golden/Silver Ticket:** forjar tickets Kerberos con la clave KRBTGT.
- **DCSync:** simular un DC para extraer hashes.
- Mapeo de rutas de ataque con **BloodHound** (relaciones y privilegios).

### Hardening
- **Tiered model** (Tier 0/1/2) y cuentas administrativas separadas.
- Contraseñas largas para cuentas de servicio (o gMSA), rotar **KRBTGT**.
- **LAPS** para contraseñas locales únicas.
- Limitar admins de dominio, deshabilitar NTLM donde se pueda.
- Monitoreo de eventos (4768/4769/4624), detección con MDI/EDR.`,
    tools: ['BloodHound', 'PingCastle', 'LAPS', 'Microsoft Defender for Identity'],
  },

  // ===================== FRAMEWORKS =====================
  {
    id: 'mitre-attack',
    category: 'frameworks',
    title: 'MITRE ATT&CK — tácticas y técnicas adversarias',
    keywords: ['mitre', 'attack', 'att&ck', 'ttp', 'tacticas', 'tecnicas', 'matriz', 'd3fend', 'adversario', 'mapeo'],
    summary: 'La base de conocimiento de comportamientos adversarios usada para detección y defensa.',
    content: `## MITRE ATT&CK

Base de conocimiento global de **tácticas, técnicas y procedimientos (TTPs)** reales de adversarios, organizada en una matriz.

### Estructura
- **Tácticas** = el *porqué* (objetivos): Reconnaissance, Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, C2, Exfiltration, Impact.
- **Técnicas / sub-técnicas** = el *cómo* (p. ej. T1566 Phishing).

### Usos
- **Detección:** mapear reglas y medir cobertura (ATT&CK Navigator).
- **Threat hunting:** generar hipótesis.
- **Red/Purple team:** emular adversarios.
- **Threat intel:** describir grupos (APTs) por sus TTPs.

### Relacionados
- **MITRE D3FEND:** contramedidas defensivas.
- **Cyber Kill Chain** (Lockheed) y **Diamond Model.**`,
    tools: ['ATT&CK Navigator', 'Atomic Red Team', 'Caldera'],
  },
  {
    id: 'estandares-cumplimiento',
    category: 'frameworks',
    title: 'NIST CSF, ISO 27001, CIS Controls y cumplimiento',
    keywords: ['nist', 'csf', 'iso 27001', 'cis controls', 'cumplimiento', 'gdpr', 'rgpd', 'pci dss', 'hipaa', 'gobernanza', 'grc'],
    summary: 'Los marcos de gestión y normativas que estructuran un programa de seguridad.',
    content: `## Marcos de gestión

### NIST Cybersecurity Framework (CSF 2.0)
Funciones: **Govern, Identify, Protect, Detect, Respond, Recover.** Marco flexible para gestionar riesgo.

### ISO/IEC 27001
Norma certificable para un **SGSI** (Sistema de Gestión de Seguridad de la Información). El Anexo A define controles; enfoque en mejora continua (PDCA).

### CIS Controls
18 controles priorizados y accionables (inventario, gestión de vulnerabilidades, MFA, backups...). Muy prácticos para empezar. Incluye **CIS Benchmarks** de hardening.

## Normativas (compliance)
- **RGPD/GDPR:** protección de datos personales en la UE (notificación de brechas en 72h).
- **PCI DSS:** datos de tarjetas de pago.
- **HIPAA:** salud (EE. UU.).
- **SOC 2:** controles de servicio.

> Cumplir ≠ estar seguro, pero ayuda a estructurar y priorizar.`,
    tools: ['CIS-CAT', 'OpenSCAP', 'GRC tools'],
  },

  // ===================== CERTIFICACIONES =====================
  {
    id: 'certificaciones',
    category: 'certificaciones',
    title: 'Certificaciones de ciberseguridad y por dónde empezar',
    keywords: ['certificaciones', 'oscp', 'ceh', 'security+', 'comptia', 'cissp', 'ejpt', 'pnpt', 'crto', 'gcih', 'certificados'],
    summary: 'Las certificaciones más reconocidas según nivel y especialidad.',
    content: `## Certificaciones por nivel

### Inicio / fundamentos
- **CompTIA Security+** — base teórica, muy valorada para empezar.
- **CompTIA Network+ / A+** — redes y soporte (prerequisito útil).
- **(ISC)² CC** — entrada gratuita a fundamentos.

### Ofensiva (pentesting / red team)
- **eJPT (INE)** — práctica, ideal como primera ofensiva.
- **PNPT (TCM)** — pentest realista con reporte y AD.
- **OSCP (OffSec)** — la referencia: 24h de examen práctico, "Try Harder".
- **OSEP / OSWE / CRTO** — avanzadas (evasión, web, red team).

### Defensa / Blue Team
- **BTL1 / GCIH / GCFA (SANS)** — IR y forense.
- **CySA+** — análisis de seguridad.

### Gestión / arquitectura
- **CISSP (ISC²)** — gestión, amplio, requiere experiencia.
- **CISM / CISA (ISACA)** — gobierno y auditoría.

### Nube
- **AWS Security Specialty**, **AZ-500**, **GCP Security**.

> Consejo: combina **una teórica** (Security+/CISSP) con **una práctica** (eJPT/OSCP/BTL1) según tu objetivo.`,
    tools: [],
  },

  // ===================== DEVSECOPS =====================
  {
    id: 'devsecops',
    category: 'devsecops',
    title: 'DevSecOps: seguridad en el ciclo de desarrollo',
    keywords: ['devsecops', 'sast', 'dast', 'sca', 'ci/cd', 'shift left', 'secrets', 'supply chain', 'sbom', 'pipeline seguro'],
    summary: 'Integrar la seguridad de forma automática en el pipeline de desarrollo.',
    content: `## DevSecOps

"Shift left": integrar seguridad **desde el inicio** y de forma **automatizada** en CI/CD, no como un paso final.

### Controles por etapa
- **Código:** SAST (análisis estático), linters de seguridad, pre-commit hooks.
- **Dependencias:** SCA (Software Composition Analysis) para CVEs y licencias; generar **SBOM**.
- **Secretos:** escaneo para evitar claves en el repo (gitleaks, trufflehog).
- **IaC:** escaneo de Terraform/K8s (tfsec, Checkov, KICS).
- **Build/Imagen:** escaneo de contenedores (Trivy), firma (cosign).
- **Runtime:** DAST (pruebas dinámicas), IAST, monitoreo.

### Supply chain
- Verificar integridad de dependencias y artefactos (SLSA, firmas).
- Pinning de versiones y mirrors internos.

### Cultura
- Security champions, *threat modeling* temprano, fallar el pipeline ante hallazgos críticos.`,
    tools: ['Semgrep', 'SonarQube', 'Trivy', 'gitleaks', 'OWASP Dependency-Check', 'Snyk'],
  },

  // ===================== THREAT INTELLIGENCE =====================
  {
    id: 'threat-intel',
    category: 'threatintel',
    title: 'Threat Intelligence: IOCs, TTPs y OSINT',
    keywords: ['threat intelligence', 'inteligencia de amenazas', 'ioc', 'ttp', 'apt', 'osint', 'misp', 'stix', 'taxii', 'feeds'],
    summary: 'Cómo se recolecta y usa la inteligencia sobre amenazas para anticiparse.',
    content: `## Threat Intelligence (CTI)

Conocimiento sobre adversarios (quiénes, cómo, por qué) para tomar mejores decisiones de defensa.

### Niveles
- **Estratégico:** tendencias y riesgo para la dirección.
- **Operacional:** campañas y TTPs de grupos (APTs).
- **Táctico:** TTPs concretos (ATT&CK).
- **Técnico:** IOCs (hashes, IPs, dominios) para bloqueo.

### Pirámide del dolor (Bianco)
Bloquear **TTPs/herramientas** duele más al atacante que bloquear hashes/IPs (fáciles de cambiar).

### Compartir e intercambiar
- **STIX/TAXII:** formatos/protocolo de intercambio.
- **MISP:** plataforma de compartición de IOCs.
- Feeds, ISACs sectoriales y OSINT.

### OSINT defensivo
Monitorear filtraciones, dominios *typosquatting*, exposición de la marca y credenciales comprometidas.`,
    tools: ['MISP', 'OpenCTI', 'VirusTotal', 'Shodan', 'AbuseIPDB'],
  },

  // ===================== CARRERA =====================
  {
    id: 'ruta-aprendizaje',
    category: 'carrera',
    title: 'Cómo empezar en ciberseguridad: ruta y laboratorios',
    keywords: ['como empezar', 'aprender', 'ruta', 'roadmap', 'principiante', 'laboratorios', 'hackthebox', 'tryhackme', 'practicar', 'carrera', 'estudiar'],
    summary: 'Una ruta práctica para iniciarte y los mejores entornos para practicar legalmente.',
    content: `## Ruta para empezar en ciberseguridad

### 1. Bases sólidas
- **Redes** (TCP/IP, DNS, HTTP), **sistemas** (Linux + Windows), **un lenguaje** (Python).
- Conceptos de seguridad (CIA, OWASP, criptografía básica).

### 2. Elige un camino
- **Red Team / Pentest**, **Blue Team / SOC**, **GRC**, **AppSec**, **Cloud Security**, **Forense/DFIR**.

### 3. Practica en entornos LEGALES
- **TryHackMe** — guiado, ideal para empezar.
- **Hack The Box** — retos y máquinas realistas.
- **PortSwigger Web Security Academy** — gratis, excelente para web.
- **OverTheWire**, **VulnHub**, **picoCTF**, **Root-Me** — CTFs y wargames.
- Monta tu **homelab** (VMs aisladas, Metasploitable, AD lab).

### 4. Certifícate y construye portfolio
- Security+ → eJPT → OSCP (ofensiva) o BTL1/CySA+ (defensiva).
- Documenta writeups (de máquinas que permitan publicarlos).

### Regla ética
Practica **solo** en sistemas propios o plataformas autorizadas. Hackear sin permiso es delito. La mentalidad correcta: **usa el conocimiento para proteger.**`,
    tools: ['TryHackMe', 'Hack The Box', 'PortSwigger Academy', 'picoCTF', 'VirtualBox/VMware'],
  },
  {
    id: 'etica-legal',
    category: 'carrera',
    title: 'Ética, legalidad y hacking responsable',
    keywords: ['etica', 'legal', 'hacking etico', 'autorizacion', 'responsible disclosure', 'bug bounty', 'permiso', 'ley', 'delito'],
    summary: 'El marco ético y legal imprescindible para cualquier profesional de seguridad.',
    content: `## Ética y legalidad

El conocimiento de seguridad es poderoso: úsalo para **proteger**, nunca para dañar.

### Principios
- **Autorización por escrito** antes de cualquier prueba (alcance, reglas, fechas).
- **No causar daño** ni acceder a datos más allá de lo necesario.
- **Confidencialidad** de lo hallado.
- Reportar de forma **responsable** y constructiva.

### Hacking sin permiso = delito
Acceder, escanear de forma intrusiva o explotar sistemas ajenos sin autorización es ilegal en la mayoría de países (p. ej. leyes de fraude informático), con consecuencias penales.

### Vías legales para practicar tus habilidades
- **Bug bounty** (HackerOne, Bugcrowd, Intigriti): pruebas autorizadas con recompensa.
- **Responsible / coordinated disclosure:** reportar fallos al fabricante con tiempo para parchear.
- **CTFs y labs** dedicados.

> CyberOracle se enfoca en seguridad **defensiva y ética**. No proporciono ayuda para atacar sistemas sin autorización ni para crear software malicioso.`,
    tools: ['HackerOne', 'Bugcrowd', 'Intigriti'],
  },
]
