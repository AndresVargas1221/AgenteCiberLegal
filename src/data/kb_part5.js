// CyberOracle KB · Parte 5 — Cloud, Móvil, IoT/OT, Ingeniería Social
export const KB_PART5 = [
  // ===================== CLOUD =====================
  {
    id: 'cloud-security',
    category: 'cloud',
    title: 'Seguridad en la nube y modelo de responsabilidad compartida',
    keywords: ['cloud', 'nube', 'aws', 'azure', 'gcp', 'responsabilidad compartida', 'iam cloud', 's3', 'misconfiguracion', 'cspm'],
    summary: 'Fundamentos de seguridad cloud y el reparto de responsabilidades.',
    content: `## Seguridad en la nube

### Modelo de responsabilidad compartida
- **El proveedor** asegura la nube (hardware, hipervisor, red física).
- **El cliente** asegura lo que pone *en* la nube (datos, IAM, configuración, SO según el servicio).
- Varía según IaaS / PaaS / SaaS (a más gestionado, menos responsabilidad del cliente).

### Riesgos top
- **Misconfiguraciones** (la causa #1): buckets S3 públicos, puertos abiertos, secrets expuestos.
- **IAM excesivo:** permisos amplios, claves estáticas, falta de MFA.
- **Falta de visibilidad** y logging.

### Buenas prácticas
- Mínimo privilegio, roles temporales, MFA en cuentas raíz/admin.
- **CSPM** para detectar malas configuraciones.
- Cifrado en reposo y tránsito; gestión de secretos (Vault, KMS).
- Logging centralizado (CloudTrail), alertas y segmentación de cuentas.
- IaC seguro (escaneo de Terraform con tfsec/Checkov).`,
    tools: ['ScoutSuite', 'Prowler', 'tfsec', 'Checkov', 'AWS CloudTrail', 'HashiCorp Vault'],
  },
  {
    id: 'contenedores-k8s',
    category: 'cloud',
    title: 'Seguridad de contenedores y Kubernetes',
    keywords: ['contenedores', 'docker', 'kubernetes', 'k8s', 'containers', 'imagenes', 'pod security', 'rbac k8s', 'escaneo de imagenes'],
    summary: 'Riesgos y controles para Docker, imágenes y clústeres Kubernetes.',
    content: `## Seguridad de contenedores

### Imágenes
- Usar imágenes mínimas y de confianza; **escanear** (Trivy, Grype).
- No incluir secretos; usar usuarios no-root; firmar imágenes (cosign).
- Actualizar bases y reconstruir ante CVEs.

### Runtime
- Limitar capabilities, read-only FS, seccomp/AppArmor.
- No exponer el socket de Docker.

## Kubernetes
- **RBAC** estricto y namespaces; mínimo privilegio para ServiceAccounts.
- **NetworkPolicies** para microsegmentar pods.
- **Pod Security Standards** (restricted), evitar privilegiados/hostPath.
- Secrets cifrados (etcd encryption, sealed-secrets/Vault).
- Escaneo de manifiestos y admission controllers (OPA/Kyverno).
- Auditar el API server y los logs del clúster.`,
    tools: ['Trivy', 'Grype', 'kube-bench', 'Falco', 'OPA/Kyverno', 'cosign'],
  },

  // ===================== MÓVIL =====================
  {
    id: 'seguridad-movil',
    category: 'movil',
    title: 'Seguridad móvil: Android e iOS (OWASP MASVS)',
    keywords: ['movil', 'android', 'ios', 'apk', 'owasp masvs', 'mstg', 'almacenamiento inseguro', 'frida', 'aplicaciones moviles'],
    summary: 'Riesgos y controles para aplicaciones móviles según OWASP.',
    content: `## Seguridad de aplicaciones móviles

OWASP define **MASVS** (estándar de verificación) y la **MASTG** (guía de pruebas).

### Riesgos frecuentes (OWASP Mobile)
- **Almacenamiento inseguro** de datos (SharedPrefs/plist sin cifrar).
- Comunicación insegura (sin TLS / sin pinning).
- Criptografía débil y secretos hardcodeados en el APK/IPA.
- Autenticación/sesiones deficientes.
- Falta de protección anti-tampering/root-jailbreak.

### Pruebas
- **Estático:** decompilar (jadx, apktool), buscar secretos.
- **Dinámico:** interceptar tráfico (Burp + certificado), instrumentar con **Frida/Objection**.

### Defensa
- Cifrado de datos sensibles (Keystore/Keychain).
- TLS + **certificate pinning**.
- Ofuscación, detección de root/jailbreak, no confiar en controles del cliente.`,
    tools: ['MobSF', 'jadx', 'apktool', 'Frida', 'Objection'],
  },

  // ===================== IoT / OT =====================
  {
    id: 'iot-ot-ics',
    category: 'iot',
    title: 'Seguridad IoT, OT e ICS/SCADA',
    keywords: ['iot', 'ot', 'ics', 'scada', 'dispositivos', 'firmware', 'industrial', 'plc', 'modbus', 'embebido'],
    summary: 'Particularidades de proteger dispositivos conectados y sistemas industriales.',
    content: `## IoT y OT/ICS

### IoT (Internet of Things)
Dispositivos con recursos limitados y, a menudo, seguridad débil.

**Riesgos:** credenciales por defecto, firmware sin actualizar, servicios inseguros, falta de cifrado, exposición a Internet (Shodan).

**Defensa:** cambiar credenciales, segmentar en VLAN propia, actualizar firmware, deshabilitar servicios, monitorear.

### OT / ICS / SCADA
Sistemas que controlan procesos físicos (energía, agua, manufactura). Priorizan **disponibilidad y seguridad física** sobre confidencialidad.

- Protocolos legacy sin autenticación (**Modbus**, DNP3).
- **No** se pueden parchear/reiniciar fácilmente.
- Referencia: **modelo Purdue** y norma **IEC 62443**.

**Defensa:** segmentación IT/OT estricta, DMZ industrial, monitoreo pasivo, control de accesos remotos.`,
    tools: ['Shodan', 'Nmap (scripts ICS)', 'Wireshark', 'Binwalk (firmware)'],
  },

  // ===================== INGENIERÍA SOCIAL =====================
  {
    id: 'ingenieria-social',
    category: 'social',
    title: 'Ingeniería social y phishing: concienciación y defensa',
    keywords: ['ingenieria social', 'phishing', 'spear phishing', 'vishing', 'smishing', 'pretexting', 'concienciacion', 'bec', 'fraude'],
    summary: 'Cómo manipulan los atacantes a las personas y cómo proteger a tu organización.',
    content: `## Ingeniería social

Manipula a las personas para que entreguen información o realicen acciones. **El humano es el eslabón más explotado.**

### Técnicas
- **Phishing:** correos masivos engañosos.
- **Spear phishing:** dirigido y personalizado.
- **Whaling:** contra altos directivos.
- **Vishing/Smishing:** por voz / SMS.
- **Pretexting:** crear un escenario creíble.
- **Baiting:** cebos (USB "perdidos").
- **BEC (Business Email Compromise):** fraude por suplantación de ejecutivos/proveedores.

### Principios de persuasión que abusan
Autoridad, urgencia, escasez, prueba social, simpatía, reciprocidad.

### Defensa (orientada a protección)
- **Formación y simulacros** de phishing periódicos.
- Verificación por **segundo canal** en pagos/cambios de cuenta.
- **MFA** resistente a phishing (FIDO2), filtrado de correo (SPF/DKIM/DMARC).
- Cultura de reportar sin culpa y procedimientos claros.

> Enfoque defensivo: este conocimiento es para **proteger y concienciar**, no para engañar a nadie.`,
    tools: ['GoPhish (simulacros)', 'KnowBe4', 'DMARC/SPF/DKIM'],
  },
]
