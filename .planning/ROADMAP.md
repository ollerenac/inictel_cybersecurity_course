# Roadmap — Curso de Ciberseguridad INICTEL

## Phases

- [x] **Phase 1: Site Foundation** - El sitio Docusaurus 3 funciona en la intranet con navegación completa en español
- [ ] **Phase 2: Content Architecture** - La arquitectura de contenido está definida — catálogo curado, glosario, guía de autoría, índice de ejercicios y panel de conexión
- [ ] **Phase 3: Writeup Production & Polish** - Los writeups del subconjunto curado están completos con plantilla estructurada, badges de dificultad, código resaltado y convenciones pedagógicas

---

## Phase Details

### Phase 1: Site Foundation
**Goal**: El sitio Docusaurus 3 sirve contenido en la intranet con navegación completamente en español, modo oscuro, sidebar de 7 categorías, breadcrumbs, enlaces anterior/siguiente y tabla de contenidos por página.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, NAV-01, NAV-02, NAV-03, NAV-04
**Success Criteria** (what must be TRUE):
  1. Un usuario abre el sitio en la red local y toda la UI — navegación, sidebar, búsqueda, mensajes — aparece en español
  2. El sidebar muestra las 7 categorías como secciones de nivel superior y el usuario puede expandirlas para ver ejercicios
  3. El usuario navega entre ejercicios con enlaces Anterior/Siguiente sin salir del sitio
  4. Cada página de ejercicio muestra breadcrumbs (Inicio > Categoría > Ejercicio) y una tabla de contenidos lateral con saltos a Teoría, Herramientas y Solución
  5. El usuario puede alternar entre modo claro y modo oscuro desde el header
**Plans**: TBD
**UI hint**: yes

### Phase 2: Content Architecture
**Goal**: Existe una arquitectura de contenido completa — catálogo de ejercicios curado y clasificado, glosario de términos, guía de autoría, índice maestro filtrable y panel de conexión al servidor wargame — que permite escalar la producción de writeups sin inconsistencias.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: CONTENT-01, CONTENT-02, CONTENT-03, CONTENT-04, HOME-01, HOME-02, HOME-03, HOME-04
**Success Criteria** (what must be TRUE):
  1. Existe un documento que lista los ejercicios curados con su categoría, nivel de dificultad asignado y criterio de clasificación, accesible en el repositorio
  2. Un autor nuevo puede abrir la guía de autoría y saber exactamente qué secciones incluir, qué convenciones de escritura seguir y cómo usar el glosario para elegir terminología
  3. La página de inicio explica qué es el curso, describe los 3 niveles de dificultad y muestra los datos de conexión al servidor wargame (192.168.22.28 / user1/user1) de forma prominente
  4. El índice maestro de ejercicios permite filtrar por categoría Y por nivel de dificultad simultáneamente, y muestra los 2 writeups ya existentes correctamente clasificados
  5. Existe una página de referencia de herramientas que lista cada herramienta usada en el curso y qué ejercicios la emplean
**Plans**: TBD

### Phase 3: Writeup Production & Polish
**Goal**: El subconjunto curado de ejercicios tiene writeups completos — con plantilla estructurada, badge de dificultad, código resaltado con botón de copia, solución oculta tras details/summary, anotaciones de callejones sin salida, convención visual comando/respuesta, versiones de herramientas y prerrequisitos por categoría.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: EXERCISE-01, EXERCISE-02, EXERCISE-03, EXERCISE-04, WRITEUP-01, WRITEUP-02, WRITEUP-03, WRITEUP-04
**Success Criteria** (what must be TRUE):
  1. Cada ejercicio del subconjunto curado tiene un writeup que incluye Teoría, Herramientas y Solución paso a paso en español, siguiendo la plantilla de la guía de autoría
  2. Cada ejercicio muestra un badge visible de dificultad (Básico / Intermedio / Avanzado) y la solución paso a paso está oculta por defecto detrás de un elemento details/summary
  3. Los bloques de código tienen resaltado sintáctico (bash, python, hex, HTTP) y un botón de copiar — los comandos del usuario se distinguen visualmente de las respuestas del sistema
  4. Al menos un writeup por categoría incluye una nota de callejón sin salida (enfoque fallido y por qué falla) y las versiones exactas de las herramientas utilizadas
  5. Cada categoría tiene una página de prerrequisitos que declara qué conocimiento previo asume — y un usuario nuevo puede empezar por "comienza aquí" desde la página de inicio
**Plans**: TBD
**UI hint**: yes

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Site Foundation | 7/7 | Complete | 2026-05-20 |
| 2. Content Architecture | 0/0 | Not started | - |
| 3. Writeup Production & Polish | 0/0 | Not started | - |
