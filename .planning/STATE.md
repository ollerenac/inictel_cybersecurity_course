---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-06-09T02:15:25.093Z"
---

# Project State — Curso de Ciberseguridad INICTEL

## Project Reference

**Core value**: Que cualquier persona dentro de la red pueda tomar el curso de forma autónoma — leer el concepto, intentar el ejercicio en el servidor wargame, y verificar su comprensión con el writeup completo.

**Current focus**: Phase 3 — Writeup Production (Phase 2 diferida)

## Quick Tasks Completed

| Fecha | Slug | Resultado |
|-------|------|-----------|
| 2026-07-20 | healthcheck-pedagogia-recon | Enriquecida pedagogía de Healthcheck (Intro + Paso 0 + Paso 1): sección Escenario/kill-chain, convención "Explica el comando", Paso 1 reescrito |

---

## Current Position

| Field | Value |
|-------|-------|
| Phase | 3 — Writeup Production (Phase 2 diferida) |
| Plan | Un plan por CTF (oleadas) |
| Status | In Progress |
| Progress | 4 writeups completados |

**Phase goal**: Producción continua de writeups de CTFs por oleadas — un plan por ejercicio. El instructor resuelve y aporta capturas/datos; Claude redacta writeup (`site/docs/<cat>/`) + registro crudo (`soluciones/<cat>/`) sin acceder a la red wargame. Phase 1 completa; Phase 2 (andamiaje de contenido) diferida.

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases total | 3 (Phase 2 diferida) |
| Phases complete | 1 (Site Foundation) |
| Requirements total (v1) | 19 |
| Requirements complete | 0 |
| Writeups complete | 4 (Baby RSA, My WebView, DLL Injection, Healthcheck) |

---

## Accumulated Context

### Decisions

| Decision | Rationale | Phase |
|----------|-----------|-------|
| Docusaurus 3 (v3.10.1) on Node.js 22 LTS | Static, no backend, well-maintained, Spanish locale support | P1 |
| Subconjunto curado de ejercicios | Calidad de writeup > cobertura total | P2 |
| Dificultad en frontmatter tags, no en directorios | Sidebar navegable + filtrado por dificultad habilitado | P2 |
| Solución oculta tras details/summary | Pedagógico: el estudiante intenta primero | P3 |
| Búsqueda local Lunr (offline) | La búsqueda Algolia requiere internet — intranet sin conexión externa | v2 |

### Current State of Site

- Docusaurus 3 scaffolded and running at `site/`
- 2 writeups already complete:
  - `docs/crypto/baby-rsa.md` (Crypto / Básico)
  - `docs/web-hacking/my-webview.md` (Web Hacking / Intermedio)
- INFRA-01, INFRA-02, INFRA-03, NAV-01..04, EXERCISE-01..04 partially implemented

### Known Open Questions

- Which exercises to include in curated subset? (selection criteria not yet defined)
- Where does the site live? (dedicated server vs. shared with 192.168.22.147)
- What is the baseUrl? (`/` vs `/curso/`) — must be set before first production build
- Who authors writeups? (single instructor vs. multiple contributors)
- Does the build machine have internet access for npm installs?

### Blockers

None currently.

### Todos

- [ ] Define baseUrl before Phase 1 build
- [ ] Select and classify the curated exercise subset (Phase 2)
- [ ] Create glossary before writeup production begins (Phase 2)

---

## Session Continuity

**Last updated**: 2026-05-20
**Last action**: Roadmap initialized — ROADMAP.md, STATE.md, REQUIREMENTS.md traceability written
**Next action**: `/gsd:plan-phase 1` to create execution plan for Phase 1
