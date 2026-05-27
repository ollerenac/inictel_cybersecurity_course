# Continuation — Curso de Ciberseguridad INICTEL

## Estado del proyecto al corte de sesión (2026-05-26)

### Qué existe

- `.planning/PROJECT.md` — contexto completo del proyecto
- `.planning/REQUIREMENTS.md` — requerimientos v1 definidos
- `.planning/config.json` — configuración GSD (YOLO, coarse, parallel, balanced)
- `.planning/research/` — investigación completa (STACK, FEATURES, ARCHITECTURE, PITFALLS, SUMMARY)
- `.planning/ROADMAP.md` — 3 fases definidas, Phase 1 marcada completa
- `.planning/STATE.md` — estado GSD
- `CLAUDE.md` — contexto auto-leído por Claude al inicio de sesión
- `site/` — sitio Docusaurus 3 funcional

### Sitio web — estado actual

Stack: Docusaurus 3.10.1 + Node.js 24 + español (defaultLocale: 'es')

**GitHub repo:** https://github.com/ollerenac/inictel_cybersecurity_course
**GitHub Pages (live):** https://ollerenac.github.io/inictel_cybersecurity_course/
**Deploy:** automático via GitHub Actions en cada push a master

Ejercicios documentados:
1. `site/docs/crypto/baby-rsa.md` — **COMPLETO** (Criptografía, Básico)
2. `site/docs/web-hacking/my-webview.md` — **COMPLETO** (Web Hacking, Intermedio, SSRF)

Sidebar: 7 categorías visibles. Las 5 sin writeups tienen páginas intro con prerrequisitos y tabla de herramientas.

Para arrancar el sitio localmente: `cd site && npm start -- --port 3001 --no-open`

### GSD Workflow — estado

Phase 1 (Site Foundation): **COMPLETA** — INFRA-01..03 + NAV-01..04 cumplidos.
Phase 2 (Content Architecture): **NO INICIADA**
Phase 3 (Writeup Production): **NO INICIADA**

---

### Ejercicio en progreso — Forensics: "Company A Confidential Leaked Case"

**NO resuelto aún** — investigación activa, sin flag.

**Metadata:**
- Categoría: Forensics / Dificultad: Alto
- TTP: Encrypted/Encoded File, Hide Artifacts
- Entorno: Windows 10 Pro

**Infraestructura:**
- Workstation Windows: 192.168.200.50
- File server: 192.168.200.200:80

**Artefacto:** `http://192.168.200.200/prob.zip` → `[Company A] Alex_PC.ad1` (~385 MB, imagen FTK Imager AD1)

**Las 4 preguntas del flag:**
1. ¿Quién es el destinatario del archivo filtrado por Alex? (lowercase)
2. ¿Cuánto recibió por filtrarlo? (3 decimales — probablemente crypto, e.g. 0.025)
3. ¿Cuál es el tiempo de detección mencionado por Team Leader Sera? (YYYY-MM-DD_HH:MM:SS, UTC+0)
4. ¿Cuál es el contenido del archivo confidencial filtrado? (STRING)

Flag format: `flag_answer1_answer2_answer3_answer4`

---

### Hallazgos de investigación (estado al corte)

**Explorado y descartado:**
- `AppData/Roaming`: solo Adobe, Microsoft, Notion, Session (sin Thunderbird/Outlook)
- `AppData/Roaming/Microsoft/Windows/Recent/`: encontrados 3 .lnk → ver abajo
- `AppData/Roaming/Session/Local Storage/leveldb/`: casi vacío (archivos de 1 byte), preview muestra `redux-persist localStoarge test` — sin mensajes
- `AppData/Roaming/Session/sql/db.sqlite`: 720 bytes — SQLite mínimo/vacío o SQLCipher encriptado
- `$Recycle.Bin`: vacío
- `AppData/Local/Microsoft/OneDrive/logs/Personal/`: archivos `.aodl` binarios, no legibles con strings

**Hallazgo clave — archivos .lnk en Recent:**

| .lnk | Ruta extraída (ASCII) | Implicación |
|------|----------------------|-------------|
| `CONFIDENTIAL.docx.lnk` | `C:\Users\user\Desktop\CONFIDENTIAL.docx` | El archivo existió en Desktop — **ya no está** |
| `SECRET USB (E).lnk` | Unidad E: — USB externo | Posible vector de exfiltración o fuente del archivo |
| `The Internet.lnk` | Output ilegible (h?S??Bi??) | Posible acceso web — URL no recuperada |

**CONFIDENTIAL.docx:** existió en Desktop pero fue borrado. No aparece en $Recycle.Bin → fue eliminado permanentemente (Shift+Delete) o está en espacio no asignado.

**Fecha relevante en OneDrive log:** `SyncEngine-2024-05-04.1510.7112.1.aodl` — fecha 5/4/2024 3:10:40 PM. Podría correlacionarse con Q3, pero el archivo es binario puro.

---

### Próximos pasos para resolver el ejercicio

**Prioridad alta — sin explorar todavía:**

1. **`Users/user/OneDrive/`** (la carpeta de sync, NO los logs) — si Alex subió CONFIDENTIAL.docx a OneDrive, hay copia local ahí. También buscar archivos con nombres sospechosos.

2. **`Session/attachments.noindex/`** — adjuntos enviados/recibidos en Session. Podría contener el archivo o captura del pago.

3. **`db.sqlite` de Session vía Python** — comando corregido (sin `\"`):
   ```powershell
   python -c "import sqlite3; con=sqlite3.connect('C:/Users/user/Downloads/db.sqlite'); cur=con.cursor(); cur.execute('SELECT name FROM sqlite_master'); print(cur.fetchall()); con.close()"
   ```

4. **FTK → Desktop → vista lista de archivos** — buscar CONFIDENTIAL.docx marcado como deleted (ícono tachado en FTK). Si aparece, exportarlo aunque esté "eliminado".

5. **`Orphan Files`** en FTK — archivos sin directorio padre recuperados del espacio no asignado.

6. **`Notion`** en AppData/Roaming — Notion almacena datos localmente en SQLite. Podría tener notas con el recipient/monto.

**Hipótesis de trabajo:**
- Q1 + Q2 (recipient + monto): comunicación en Session (mensajes o adjuntos) — también posible en Notion
- Q3 (tiempo detección de Sera): mensaje de Sera en Session inbox de Alex, o en un archivo de texto/documento
- Q4 (contenido del archivo): CONFIDENTIAL.docx — eliminado del Desktop, buscar en OneDrive o espacio no asignado; está codificado (TTP: Encrypted/Encoded File), probablemente base64

---

### Imágenes capturadas (images/fo_confidential_leaking_XX.png)

- 01: File server mostrando prob.zip
- 02: Downloads con prob.zip y el .ad1 descomprimido
- 03: FTK Imager abierto con el árbol de evidencia
- 04: PowerShell output de strings en CONFIDENTIAL.docx.lnk (Unicode + ASCII)
- 05: FTK — OneDrive/logs/Personal (SyncEngine files)
- 06: FTK — Session/Local Storage/leveldb (casi vacío, preview redux-persist)

---

### Metodología de writeups establecida

Estructura de cada ejercicio documentado:
1. Tabla de metadata (categoría, dificultad, herramientas, concepto, TTP)
2. Enunciado + infraestructura
3. Reconocimiento (con capturas)
4. Teoría completa (problema → conceptos → algoritmo/técnica → vulnerabilidad)
5. Explotación paso a paso (con comandos y capturas)
6. ¿Qué aprendimos? (bullets concisos)
7. Callejón sin salida explorado (:::note[])
8. Mitigaciones (tabla)

Imágenes: guardar en `images/` con prefijo del ejercicio, copiar a `site/static/img/<ejercicio>/` al documentar.
Admonitions Docusaurus v3: usar `:::note[Título]` con líneas en blanco internas.

---

### Credenciales y accesos

- Servidor wargame plataforma: http://192.168.22.28, user1/user1
- Workstation ejercicios (Linux): 192.168.200.51, user/user
- Workstation ejercicios (Windows): 192.168.200.50
- File server ejercicios: http://192.168.200.200/
