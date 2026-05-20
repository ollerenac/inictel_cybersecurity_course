# Requirements — Curso de Ciberseguridad INICTEL

## v1 Requirements

### Infrastructure (INFRA)

- [ ] **INFRA-01**: El sitio se construye con Docusaurus 3 (v3.10.1) sobre Node.js 22 LTS
- [ ] **INFRA-02**: La interfaz del sitio está completamente en español (`defaultLocale: 'es'`) — navegación, búsqueda, mensajes de error, todo el chrome
- [ ] **INFRA-03**: El sitio soporta modo oscuro (light/dark toggle visible en el header)

### Navigation (NAV)

- [ ] **NAV-01**: El sidebar muestra las 7 categorías como secciones de nivel superior (Crypto, Web Hacking, Forensics, System Hacking, Malware, ISMS, Reversing)
- [ ] **NAV-02**: Cada página de ejercicio muestra breadcrumbs (Inicio > Categoría > Ejercicio)
- [ ] **NAV-03**: Cada página de ejercicio tiene enlaces Anterior / Siguiente para navegación secuencial
- [ ] **NAV-04**: Cada página de ejercicio tiene tabla de contenidos en página con saltos a las secciones (Teoría, Herramientas, Solución)

### Exercise Pages (EXERCISE)

- [ ] **EXERCISE-01**: Cada ejercicio sigue la plantilla estructurada: Título + metadatos, Teoría del concepto, Herramientas utilizadas, Solución paso a paso
- [ ] **EXERCISE-02**: Cada ejercicio muestra un badge de dificultad (Básico / Intermedio / Avanzado)
- [ ] **EXERCISE-03**: Los bloques de código tienen resaltado sintáctico (bash, python, hex, HTTP) y botón de copiar con un clic
- [ ] **EXERCISE-04**: La solución paso a paso está oculta tras un elemento `<details>` / `<summary>` — el estudiante intenta primero, luego revela

### Content Architecture (CONTENT)

- [ ] **CONTENT-01**: Se analiza el catálogo completo de 87 ejercicios y se selecciona un subconjunto curado, con clasificación de dificultad documentada para cada ejercicio incluido
- [ ] **CONTENT-02**: Existe un glosario del proyecto que fija las decisiones de terminología español/inglés para cada concepto clave del curso (evita inconsistencias entre writeups)
- [ ] **CONTENT-03**: Existe una guía de autoría de writeups que incluye la plantilla obligatoria, convenciones de escritura y ejemplos de buenas prácticas
- [ ] **CONTENT-04**: El sitio incluye una página de referencia cruzada de herramientas que lista las herramientas utilizadas en el curso y qué ejercicios las emplean

### Homepage & Orientation (HOME)

- [ ] **HOME-01**: La página de inicio explica qué es el curso, cómo usarlo y describe los 3 niveles de dificultad con sus criterios
- [ ] **HOME-02**: Los datos de conexión al servidor wargame (IP: 192.168.22.28, credenciales: user1/user1, instrucciones de acceso) están visibles en un lugar permanente y prominente
- [ ] **HOME-03**: Existe un índice maestro de ejercicios filtrable por categoría Y por nivel de dificultad
- [ ] **HOME-04**: Existe una guía editorial de progresión por dificultad — "comienza aquí" para cada nivel, con prerrequisitos recomendados

### Writeup Quality (WRITEUP)

- [ ] **WRITEUP-01**: Los writeups incluyen anotaciones de callejones sin salida — breve nota sobre enfoques fallidos y por qué fallan
- [ ] **WRITEUP-02**: Los writeups distinguen visualmente los comandos del usuario de las respuestas del sistema (convención establecida en la guía de autoría)
- [ ] **WRITEUP-03**: Cada categoría tiene una declaración de prerrequisitos — qué conocimiento previo asume esa categoría
- [ ] **WRITEUP-04**: Los writeups incluyen las versiones exactas de las herramientas utilizadas

---

## v2 Requirements (Deferred)

- Búsqueda offline con índice Lunr (`@cmfcmf/docusaurus-search-local`) — pospuesta para v1, pero **recomendada fuertemente** si la red local no tiene acceso a internet (la búsqueda por defecto de Docusaurus falla en intranets sin conexión)
- Configuración de Nginx para servir el sitio en la red local — diferida; puede cubrirse con documentación de deployment en la guía de uso
- Convención de variable para la IP del servidor wargame (evitar hardcoding en writeups)
- Calendario de revisión periódica para detectar divergencia entre writeups y el servidor wargame

---

## Out of Scope

- Seguimiento de progreso del estudiante — requiere backend/base de datos, fuera del alcance estático
- Autenticación / login — el sitio es de acceso libre en la red interna
- Acceso público en internet — solo red interna INICTEL
- Quizzes o gamificación — sitio de documentación, no plataforma interactiva
- Los 87 ejercicios completos — se usa un subconjunto curado; calidad de writeup > cobertura total
- CI/CD automatizado — build y deploy manual es suficiente para este contexto

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 — Site Foundation | Pending |
| INFRA-02 | Phase 1 — Site Foundation | Pending |
| INFRA-03 | Phase 1 — Site Foundation | Pending |
| NAV-01 | Phase 1 — Site Foundation | Pending |
| NAV-02 | Phase 1 — Site Foundation | Pending |
| NAV-03 | Phase 1 — Site Foundation | Pending |
| NAV-04 | Phase 1 — Site Foundation | Pending |
| CONTENT-01 | Phase 2 — Content Architecture | Pending |
| CONTENT-02 | Phase 2 — Content Architecture | Pending |
| CONTENT-03 | Phase 2 — Content Architecture | Pending |
| CONTENT-04 | Phase 2 — Content Architecture | Pending |
| HOME-01 | Phase 2 — Content Architecture | Pending |
| HOME-02 | Phase 2 — Content Architecture | Pending |
| HOME-03 | Phase 2 — Content Architecture | Pending |
| HOME-04 | Phase 2 — Content Architecture | Pending |
| EXERCISE-01 | Phase 3 — Writeup Production & Polish | Pending |
| EXERCISE-02 | Phase 3 — Writeup Production & Polish | Pending |
| EXERCISE-03 | Phase 3 — Writeup Production & Polish | Pending |
| EXERCISE-04 | Phase 3 — Writeup Production & Polish | Pending |
| WRITEUP-01 | Phase 3 — Writeup Production & Polish | Pending |
| WRITEUP-02 | Phase 3 — Writeup Production & Polish | Pending |
| WRITEUP-03 | Phase 3 — Writeup Production & Polish | Pending |
| WRITEUP-04 | Phase 3 — Writeup Production & Polish | Pending |

---

## Definition of Done (v1)

- [ ] El sitio estático está construido y servible desde la red interna
- [ ] Los 3 niveles de dificultad están representados con al menos N ejercicios curados por nivel
- [ ] Cada ejercicio incluido tiene un writeup completo (teoría + herramientas + solución)
- [ ] La guía de autoría, glosario y prerrequisitos por categoría existen y son coherentes con el contenido
- [ ] Un usuario sin conocimientos previos puede navegar el sitio, conectarse al servidor wargame y completar un ejercicio básico usando solo el curso
