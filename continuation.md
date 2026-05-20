# Continuation — Curso de Ciberseguridad INICTEL

## Estado del proyecto al corte de sesión (2026-05-20)

### Qué existe

- `.planning/PROJECT.md` — contexto completo del proyecto
- `.planning/REQUIREMENTS.md` — requerimientos v1 definidos (pendiente aprobación final + roadmap)
- `.planning/config.json` — configuración GSD (YOLO, coarse, parallel, balanced)
- `.planning/research/` — investigación completa (STACK, FEATURES, ARCHITECTURE, PITFALLS, SUMMARY)
- `site/` — sitio Docusaurus 3 funcional, corriendo en localhost:3001

### Sitio web — estado actual

Stack: Docusaurus 3.10.1 + Node.js 24 + español (defaultLocale: 'es')

Ejercicios documentados:
1. `site/docs/crypto/baby-rsa.md` — **COMPLETO** (Criptografía, Básico)
2. `site/docs/web-hacking/my-webview.md` — **COMPLETO** (Web Hacking, Intermedio, SSRF)

Sidebar: solo muestra las categorías con contenido (Criptografía, Web Hacking).

Para arrancar el sitio: `cd site && npm start -- --port 3001 --no-open`

### GSD Workflow — estado

El workflow `/gsd-new-project` quedó INCOMPLETO — se interrumpió antes del roadmap.
Completado: PROJECT.md ✓, config.json ✓, research ✓, REQUIREMENTS.md ✓
Pendiente: aprobación de REQUIREMENTS.md, Project Structure Mode, Roadmap (paso 7.5 y 8)

Para retomar el roadmap en nueva sesión: revisar `.planning/REQUIREMENTS.md` y ejecutar
el roadmapper manualmente o continuar con `/gsd:plan-phase 1`.

### Ejercicio en progreso — Forensics: "Company A Confidential Leaked Case"

**NO documentado aún** — estábamos en fase de investigación, no llegamos a las respuestas.

Metadata:
- Categoría: Forensics
- Dificultad: Alto
- TTP: Encrypted/Encoded File, Hide Artifacts
- Entorno: Windows

Infraestructura:
- Workstation Windows: 192.168.200.50
- File server: 192.168.200.200:80

Artefacto disponible: `http://192.168.200.200/prob.zip` → descomprime a
`[Company A] Alex_PC.ad1` (~385 MB, imagen forense FTK Imager AD1)

Las 4 preguntas del flag:
1. ¿Quién es el destinatario del archivo filtrado por Alex? (lowercase)
2. ¿Cuánto recibió por filtrarlo? (3 decimales)
3. ¿Cuál es el tiempo de detección mencionado por Team Leader Sera? (YYYY-MM-DD_HH:MM:SS, UTC+0)
4. ¿Cuál es el contenido del archivo confidencial filtrado? (STRING)

Flag format: `flag_answer1_answer2_answer3_answer4`

Estado de investigación al corte:
- .ad1 abierto en FTK Imager 4.7.1.2 en el workstation Windows (.50)
- Árbol de archivos visible: [root] → Users → user → Desktop, Documents, Downloads,
  AppData, OneDrive, Pictures, Videos
- El usuario en el sistema se llama "user" (no "Alex" — Alex es el nombre del empleado)
- Carpetas exploradas pero resultados NO reportados aún — continuar desde aquí

Próximos pasos para resolver:
1. Explorar Desktop y Documents — buscar el archivo confidencial
2. Explorar AppData — clientes de email (Outlook, Thunderbird), apps de chat
3. Explorar OneDrive — archivos sincronizados/subidos (probable vector de filtración)
4. Revisar $Recycle.Bin — artefactos eliminados
5. Decodificar el archivo confidencial (TTP: Encrypted/Encoded File)

Imágenes capturadas (en images/fo_confidential_leaking_0X.png):
- 01: File server mostrando prob.zip
- 02: Downloads con prob.zip y el .ad1 descomprimido
- 03: FTK Imager abierto con el árbol de evidencia

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

Imágenes: guardar en `images/` con prefijo del ejercicio, copiar a
`site/static/img/<ejercicio>/` al documentar.

Admonitions Docusaurus v3: usar `:::note[Título]` con líneas en blanco internas.

### Credenciales y accesos

- Servidor wargame plataforma: http://192.168.22.28, user1/user1
- Workstation ejercicios (Linux): 192.168.200.51, user/user
- Workstation ejercicios (Windows): 192.168.200.50
- File server ejercicios: http://192.168.200.200/

### GitHub Pages

Pendiente — el usuario creará el repo. Actualizar en docusaurus.config.js:
- `url`: https://USERNAME.github.io
- `baseUrl`: /REPONAME/
- `organizationName`: USERNAME
- `projectName`: REPONAME
Luego: `GIT_USER=USERNAME npm run deploy` desde `site/`
