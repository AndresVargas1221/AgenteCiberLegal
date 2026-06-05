// CyberOracle KB · Parte 4 — Malware, Forense, IR, Blue Team
export const KB_PART4 = [
  // ===================== MALWARE =====================
  {
    id: 'tipos-malware',
    category: 'malware',
    title: 'Tipos de malware y cómo se propagan',
    keywords: ['malware', 'virus', 'troyano', 'ransomware', 'gusano', 'rootkit', 'spyware', 'botnet', 'keylogger', 'tipos de malware'],
    summary: 'Taxonomía del software malicioso y vectores de infección.',
    content: `## Tipos de malware

- **Virus:** se adjunta a archivos y requiere ejecución del usuario.
- **Gusano (worm):** se propaga solo por la red sin interacción.
- **Troyano:** se disfraza de software legítimo.
- **Ransomware:** cifra datos y exige rescate (doble extorsión: también filtra).
- **Spyware / Keylogger:** roba información y pulsaciones.
- **Rootkit / Bootkit:** oculta presencia a nivel profundo del sistema.
- **RAT:** acceso remoto al equipo de la víctima.
- **Botnet:** red de equipos comprometidos controlados por C2.
- **Fileless:** vive en memoria, abusa de herramientas legítimas (LOLBins).

### Vectores comunes
Phishing, adjuntos, drive-by download, USB, software pirata, dependencias maliciosas (supply chain).

### Defensa
- EDR/antivirus, parcheo, mínimos privilegios.
- **Backups offline 3-2-1** (clave contra ransomware).
- Filtrado de correo/web y concienciación.`,
    tools: ['EDR', 'VirusTotal', 'YARA'],
  },
  {
    id: 'analisis-malware',
    category: 'malware',
    title: 'Análisis de malware: estático vs dinámico',
    keywords: ['analisis de malware', 'estatico', 'dinamico', 'sandbox', 'ingenieria inversa', 'reversing', 'yara', 'ioc', 'detonacion'],
    summary: 'Técnicas para analizar muestras de malware de forma segura.',
    content: `## Análisis de malware (defensivo)

Siempre en un **entorno aislado** (VM sin red o red controlada, snapshots). Nunca en producción.

### Análisis estático (sin ejecutar)
- Hashes, strings, cabeceras PE/ELF, imports, entropía (packing).
- Reglas **YARA** para clasificar familias.
- Desensamblado/decompilado (Ghidra, IDA, radare2).

### Análisis dinámico (ejecutando)
- **Sandbox** que observa comportamiento: procesos, red, registro, archivos.
- Monitoreo con Procmon, Wireshark, captura de IOCs.
- **C2 beaconing**, persistencia, técnicas de evasión.

### Resultado
- **IOCs** (hashes, dominios, IPs) y **TTPs** (mapeados a MITRE ATT&CK) para detección y bloqueo.

### Retos
Anti-análisis: detección de VM/debugger, ofuscación, packing, ejecución diferida.`,
    tools: ['Ghidra', 'IDA', 'radare2', 'YARA', 'Cuckoo/CAPE Sandbox', 'PEStudio'],
  },

  // ===================== FORENSE =====================
  {
    id: 'forense-digital',
    category: 'forense',
    title: 'Forense digital: adquisición y cadena de custodia',
    keywords: ['forense', 'forensics', 'cadena de custodia', 'adquisicion', 'imagen', 'evidencia', 'memoria', 'disco', 'volatilidad', 'dfir'],
    summary: 'Cómo recolectar y preservar evidencia digital de forma legalmente válida.',
    content: `## Forense digital (DFIR)

Proceso de identificar, preservar, analizar y presentar evidencia digital, manteniendo su validez legal.

### Principios
- **Cadena de custodia:** documentar quién, qué, cuándo y cómo se manejó cada evidencia.
- **Integridad:** trabajar sobre **copias bit a bit** (imágenes) verificadas con hash; usar **write-blockers**.
- **Orden de volatilidad:** capturar primero lo más volátil:
  1. Registros/caché/CPU
  2. **Memoria RAM**
  3. Estado de red/conexiones
  4. Disco
  5. Logs/backups remotos

### Fases
Identificación → Adquisición → Análisis → Documentación → Presentación.

### Análisis típico
- **Memoria:** procesos, inyecciones, conexiones (Volatility).
- **Disco:** timeline, archivos borrados, artefactos del SO.
- **Red:** PCAP, logs de proxy/DNS.`,
    tools: ['Autopsy/Sleuth Kit', 'Volatility', 'FTK Imager', 'dd/dcfldd', 'Wireshark'],
  },

  // ===================== INCIDENTES =====================
  {
    id: 'respuesta-incidentes',
    category: 'incidentes',
    title: 'Respuesta a Incidentes — ciclo de vida (NIST/SANS)',
    keywords: ['respuesta a incidentes', 'incident response', 'ir', 'nist', 'sans', 'contencion', 'erradicacion', 'recuperacion', 'csirt', 'playbook'],
    summary: 'El proceso estructurado para gestionar un incidente de seguridad.',
    content: `## Ciclo de Respuesta a Incidentes

Referencia **NIST SP 800-61** (y modelo SANS PICERL).

### Fases NIST
1. **Preparación:** equipo (CSIRT), herramientas, playbooks, formación, backups.
2. **Detección y análisis:** identificar el incidente, alcance y severidad (triage).
3. **Contención, erradicación y recuperación:**
   - **Contención:** corto plazo (aislar host) y largo plazo.
   - **Erradicación:** eliminar la causa (malware, cuentas, vulnerabilidad).
   - **Recuperación:** restaurar servicios, validar, monitorear.
4. **Actividad post-incidente:** lecciones aprendidas, mejorar controles.

### Modelo SANS — PICERL
**P**reparation, **I**dentification, **C**ontainment, **E**radication, **R**ecovery, **L**essons learned.

### Buenas prácticas
- No apagar equipos sin antes capturar memoria (preserva evidencia).
- Comunicación clara y registro temporal de acciones.
- Tener contactos legales, RR.PP. y notificación regulatoria (p. ej. RGPD: 72h).`,
    tools: ['TheHive', 'Velociraptor', 'GRR', 'MISP'],
  },

  // ===================== BLUE TEAM / SOC =====================
  {
    id: 'soc-siem',
    category: 'blueteam',
    title: 'SOC, SIEM y monitoreo de seguridad',
    keywords: ['soc', 'siem', 'monitoreo', 'logs', 'correlacion', 'alertas', 'blue team', 'splunk', 'elastic', 'wazuh', 'deteccion'],
    summary: 'Cómo funciona un Centro de Operaciones de Seguridad y el rol del SIEM.',
    content: `## SOC — Security Operations Center

Equipo y plataforma que **monitorea, detecta y responde** a amenazas 24/7. Niveles: L1 (triage), L2 (investigación), L3 (threat hunting/IR).

## SIEM — Security Information and Event Management
Centraliza y **correlaciona logs** de múltiples fuentes para generar alertas.

### Capacidades
- Recolección y normalización de logs (firewall, EDR, servidores, nube, apps).
- **Reglas de correlación** y detección de anomalías.
- Dashboards, alertas y casos.
- **SOAR:** automatiza respuestas (orquestación).

### Métricas clave
- **MTTD** (tiempo medio de detección) y **MTTR** (de respuesta).
- Reducción de **falsos positivos**.

### Fuentes de log esenciales
Autenticación, DNS, proxy/web, endpoint (Sysmon), firewall, cloud (CloudTrail).`,
    tools: ['Splunk', 'Elastic/ELK', 'Wazuh', 'Microsoft Sentinel', 'Graylog'],
  },
  {
    id: 'threat-hunting-detection',
    category: 'blueteam',
    title: 'Threat Hunting y detección basada en comportamiento',
    keywords: ['threat hunting', 'caza de amenazas', 'deteccion', 'sigma', 'sysmon', 'edr', 'comportamiento', 'hipotesis', 'ioc', 'ioa'],
    summary: 'Búsqueda proactiva de amenazas que evaden los controles automáticos.',
    content: `## Threat Hunting

Búsqueda **proactiva** de actividad maliciosa que no disparó alertas. Parte de **hipótesis** (basadas en TTPs de MITRE ATT&CK) y busca evidencia en los datos.

### IOC vs IOA
- **IOC (Indicator of Compromise):** artefactos conocidos (hash, IP, dominio). Reactivo.
- **IOA (Indicator of Attack):** comportamiento/intención (p. ej. proceso de Office que lanza PowerShell). Proactivo.

### Telemetría clave
- **Sysmon** (Windows): creación de procesos, conexiones, carga de DLLs.
- **EDR** para visibilidad de endpoint y respuesta.
- Logs de DNS, proxy y autenticación.

### Reglas de detección
- **Sigma:** formato genérico de reglas de detección (se traduce a Splunk, Elastic, etc.).
- Mapear detecciones a **MITRE ATT&CK** para medir cobertura.

> Ejemplos de hunts: PowerShell ofuscado, persistencia en Run keys, beaconing periódico, uso anómalo de cuentas privilegiadas.`,
    tools: ['Sysmon', 'Sigma', 'Velociraptor', 'EDR (CrowdStrike, Defender)', 'Zeek'],
  },
]
