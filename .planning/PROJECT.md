# Curso de Ciberseguridad — INICTEL Wargame

## What This Is

Un curso de ciberseguridad estructurado en 3 niveles (básico, intermedio, avanzado), construido a partir de ejercicios seleccionados de un framework de wargames alojado en la red local de INICTEL (192.168.22.28). Para cada ejercicio, se produce un writeup completo en español que incluye teoría del concepto, herramientas utilizadas y solución paso a paso. El resultado final es un sitio web estático de tipo documentación, accesible dentro de la red interna, dirigido a un público mixto: estudiantes universitarios, equipos profesionales y autodidactas.

## Core Value

Que cualquier persona dentro de la red pueda tomar el curso de forma autónoma — leer el concepto, intentar el ejercicio en el servidor wargame, y verificar su comprensión con el writeup completo.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Analizar y catalogar los 87 ejercicios del servidor wargame (Crypto 13, Web Hacking 26, Forensics 20, System Hacking 12, Malware 3, ISMS 3, Reversing 10)
- [ ] Clasificar un subconjunto curado de ejercicios en 3 niveles de dificultad según complejidad conceptual (básico = concepto único, avanzado = cadena de técnicas)
- [ ] Resolver y documentar cada ejercicio seleccionado con writeup completo: teoría + herramientas + solución paso a paso (en español)
- [ ] Publicar el curso como sitio web estático accesible en la red interna

### Out of Scope

- Seguimiento de progreso del estudiante — no se requiere autenticación ni base de datos
- Acceso público en internet — solo red interna
- Incluir los 87 ejercicios — se usa un subconjunto curado
- Quizzes o gamificación — sitio de documentación, no plataforma interactiva

## Context

- **Servidor wargame:** 192.168.22.28, credenciales `user1`/`user1`
- **Categorías disponibles:** Crypto (13), Web Hacking (26), Forensics (20), System Hacking (12), Malware (3), ISMS (3), Reversing (10)
- **Idioma del curso:** Español
- **Tipo de sitio:** Estático, estilo documentación (similar a MkDocs o Docusaurus)
- **Red:** Solo accesible en red local (INICTEL)
- El análisis de los ejercicios requiere acceso activo al servidor wargame para probar y resolver cada reto

## Constraints

- **Network**: Sitio solo en red interna — no requiere CDN ni hosting externo
- **Language**: Todo el contenido en español
- **Stack**: Sin framework dinámico — sitio estático para facilitar mantenimiento
- **Scope**: Subconjunto curado de ejercicios — calidad de writeup > cobertura total
- **Access**: El servidor wargame está en 192.168.22.28 con credenciales user1/user1 — la resolución de ejercicios requiere conexión a esa red

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Subconjunto curado en vez de los 87 ejercicios | Permite writeups de mayor calidad y mayor cobertura pedagógica por nivel | — Pending |
| Dificultad definida por complejidad conceptual | Consistente con objetivos pedagógicos — un concepto = básico, cadena de técnicas = avanzado | — Pending |
| Sitio estático tipo documentación | Simple de mantener, no requiere backend, legible sin JavaScript | — Pending |
| Contenido en español | Audiencia principal es hispanohablante (INICTEL, Perú) | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-20 after initialization*
