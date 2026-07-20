# Corrección de datos del portal OFFen EDU y del flujo de trabajo

**Fecha:** 2026-07-20
**Estado:** Aprobado

## Problema

Los documentos del proyecto describen el portal de la plataforma con una IP y unas
credenciales que no son reales:

- IP `192.168.22.28` (falsa) en lugar de `192.168.22.147`.
- Credenciales fijas `user1`/`user1` (falsas). Cada participante usa las suyas.
- El flujo de trabajo está mal descrito: los documentos implican que Claude se conecta
  a la red wargame para resolver los ejercicios.

El dato falso se propagó a `CLAUDE.md` y `.planning/PROJECT.md`, que re-siembran el
contexto en cada sesión, por lo que el error se repite indefinidamente.

## Alcance

Se distinguen dos clases de direcciones. Solo la primera es incorrecta.

| Clase | Direcciones | Naturaleza | Acción |
|-------|-------------|------------|--------|
| A — Portal OFFen EDU | `192.168.22.147` | IP fija, única constante de red del proyecto | Corregir |
| B — Infra por ejercicio | `192.168.200.x`, credenciales de máquina | Infraestructura virtualizada (OpenStack) que cada CTF despliega | No tocar |

La Clase B aparece en los writeups publicados (`baby-rsa`, `my-webview`,
`dll-injection`) y es correcta para su ejercicio.

## Decisión

Corrección puntual por búsqueda y reemplazo, sin introducir un sistema de variables.

En el sitio publicado, la IP del portal aparece únicamente en `site/docs/conexion.md`;
los writeups no la mencionan. El portal ya es de facto una fuente única, así que
centralizarlo en `docusaurus.config` o en un componente MDX añadiría acoplamiento sin
resolver un problema que exista. El defecto real es un dato falso repetido, no la
ausencia de un mecanismo de configuración.

## Reglas

1. **IP del portal** — `192.168.22.28` → `192.168.22.147` en todos los archivos.

2. **Credenciales del portal** — Eliminar `user1`/`user1`. La tabla de acceso en
   `conexion.md` queda así:

   | Campo | Valor |
   |-------|-------|
   | Plataforma web | http://192.168.22.147 |
   | Credenciales | Cada participante usa las credenciales asignadas por INICTEL |

   Mismo criterio en `REQUIREMENTS.md` (HOME-02), `ROADMAP.md` y
   `research/FEATURES.md`, que hoy piden mostrar `user1/user1` de forma prominente.

3. **Flujo de trabajo** — En `CLAUDE.md` y `.planning/PROJECT.md`, dejar explícito que
   el instructor resuelve los CTF y aporta capturas y datos, y que Claude redacta el
   writeup sin acceder a la red wargame.

4. **No tocar** — La infraestructura de Clase B en los writeups existentes.

## Archivos afectados

- Publicado: `site/docs/conexion.md`
- Contexto de sesión: `CLAUDE.md`, `.planning/PROJECT.md`, `.planning/STATE.md`
- Planning: `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`,
  `.planning/research/{FEATURES,SUMMARY,ARCHITECTURE,PITFALLS}.md`
- Histórico: `continuation.md`

## Verificación

```bash
grep -rn "192.168.22.28\|user1/user1" . --exclude-dir=node_modules --exclude-dir=.git
```

Debe devolver cero resultados.
