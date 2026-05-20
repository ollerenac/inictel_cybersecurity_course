<!-- GSD:project-start source:PROJECT.md -->
## Project

**Curso de Ciberseguridad — INICTEL Wargame**

Un curso de ciberseguridad estructurado en 3 niveles (básico, intermedio, avanzado), construido a partir de ejercicios seleccionados de un framework de wargames alojado en la red local de INICTEL (192.168.22.28). Para cada ejercicio, se produce un writeup completo en español que incluye teoría del concepto, herramientas utilizadas y solución paso a paso. El resultado final es un sitio web estático de tipo documentación, accesible dentro de la red interna, dirigido a un público mixto: estudiantes universitarios, equipos profesionales y autodidactas.

**Core Value:** Que cualquier persona dentro de la red pueda tomar el curso de forma autónoma — leer el concepto, intentar el ejercicio en el servidor wargame, y verificar su comprensión con el writeup completo.

### Constraints

- **Network**: Sitio solo en red interna — no requiere CDN ni hosting externo
- **Language**: Todo el contenido en español
- **Stack**: Sin framework dinámico — sitio estático para facilitar mantenimiento
- **Scope**: Subconjunto curado de ejercicios — calidad de writeup > cobertura total
- **Access**: El servidor wargame está en 192.168.22.28 con credenciales user1/user1 — la resolución de ejercicios requiere conexión a esa red
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Site Generator
- **Choice:** Docusaurus 3 (classic template)
- **Version:** 3.10.1 (current stable as of May 2026)
- **Rationale:** Docusaurus is actively developed by Meta with releases through late 2025 (3.7, 3.8, 3.9). It ships a documentation-first structure out of the box — sidebar navigation, category grouping, breadcrumbs, dark mode — exactly what a multi-category course site needs. Critically, it supports Spanish (locale `es`) natively through its i18n system, with UI strings pre-translated by the community. MkDocs Material was the obvious alternative but entered confirmed maintenance mode in November 2024 (no new features, bug fixes only until Nov 2026); starting a new project on it now creates known-expiration technical debt. Docusaurus also has a richer plugin ecosystem for offline search, which matters for an intranet deployment.
- **Confidence:** High
### Runtime
- **Choice:** Node.js 22 LTS
- **Version:** 22.x (LTS, current recommended)
- **Rationale:** Docusaurus 3 requires Node.js >= 20. Node 22 is the current LTS line, giving the longest maintenance window. Used only at build time — the deployed artifact is pure static HTML/CSS/JS, so Node does not run in production on the local server.
- **Confidence:** High
### Language Config (i18n)
- **Choice:** Docusaurus i18n with locale `es`, single-locale build
- **Version:** Built into Docusaurus 3
- **Rationale:** Since 100% of the content is Spanish, configure `defaultLocale: 'es'` in `docusaurus.config.js`. This sets the HTML `lang` attribute, localizes all UI labels (navigation, search placeholder, "next/prev" buttons, etc.) to Spanish without managing a multi-locale build. The `es` locale has community-contributed translations shipped with Docusaurus itself — no manual UI translation needed.
- **Confidence:** High
### Search
- **Choice:** `@cmfcmf/docusaurus-search-local`
- **Version:** latest compatible with Docusaurus 3 (check npm at build time)
- **Rationale:** The default Docusaurus search uses Algolia DocSearch, which makes HTTP requests to external Algolia servers. On an intranet at 192.168.22.x with no internet access, Algolia will fail silently. `@cmfcmf/docusaurus-search-local` builds a Lunr index at compile time and ships it with the static bundle — search runs entirely in the browser, no external calls, works fully offline. It explicitly states "does not connect to any Algolia or third-party servers" and is confirmed compatible with Docusaurus v3. The alternative `@easyops-cn/docusaurus-search-local` is also valid; choose `@cmfcmf` for simpler configuration.
- **Confidence:** High
### Syntax Highlighting
- **Choice:** Prism (bundled with Docusaurus), theme `dracula` or `vsDark`
- **Version:** Included in Docusaurus 3 via `prism-react-renderer`
- **Rationale:** Cybersecurity writeups are code-heavy: bash commands, Python scripts, hex dumps, SQL injections, network captures. Prism handles all of these. Enable `bash`, `python`, `c`, `markup` (for HTML payloads), and `regex` in `additionalLanguages`. Dark themes (`dracula`, `vsDark`) read better for terminal-style content and align with the security aesthetic the audience expects. No additional install required.
- **Confidence:** High
### Web Server (local network)
- **Choice:** Nginx
- **Version:** 1.26.x (stable)
- **Rationale:** The build output (`/build`) is a directory of flat HTML, CSS, JS, and assets. Nginx serves this with minimal configuration: one `server {}` block pointing at the build directory, listening on port 80. It handles concurrent readers (students simultaneously accessing writeups) with an event-driven model that uses fewer resources than Apache on the same hardware. No application server needed — this is pure static file serving. Nginx is universally available on Linux (the likely INICTEL server OS) via the distribution package manager.
- **Confidence:** High
### Content Format
- **Choice:** Markdown (MDX where needed)
- **Version:** CommonMark + GFM, MDX 3 for interactive components
- **Rationale:** Writeups are text + code blocks + images — standard Markdown. Docusaurus renders `.md` files directly. MDX is available if a writeup needs a custom callout component (e.g., "Hint", "Flag revealed") but should be used sparingly. Keep 95% of content as plain `.md` to minimize toolchain coupling and allow non-developer contributors to write writeups.
- **Confidence:** High
### Diagram Support (optional, recommended)
- **Choice:** Mermaid (via `@docusaurus/theme-mermaid`)
- **Version:** Bundled plugin in Docusaurus 3
- **Rationale:** Some writeups (especially Forensics, System Hacking, Reversing) benefit from attack chain diagrams or network topology illustrations. Mermaid renders diagrams from code fences in Markdown — no external service, no image exports. Docusaurus 3.9 improved Mermaid ELK layout support. Enable with one config line; skip if writeup authors find it complex.
- **Confidence:** Medium
## Alternatives Considered
| Option | Verdict | Reason |
|--------|---------|--------|
| MkDocs + Material for MkDocs | Rejected | Confirmed maintenance mode since Nov 2024. No new features; bug fixes only until Nov 2026. Starting a greenfield project on it now means inheriting known end-of-life technical debt within the site's expected lifetime. |
| Hugo | Rejected for this use case | Excellent speed and flexibility but documentation-site ergonomics require custom theme work. No official documentation theme comparable to Docusaurus classic. Better suited for blogs or marketing sites than structured, multi-category course content. |
| Gatsby | Rejected | GraphQL-based data layer is severe overkill for static Markdown content. Build complexity and plugin churn make it harder to maintain than Docusaurus. |
| Next.js / Nuxt / SvelteKit | Rejected | Designed for app-like sites, not documentation. Would require building all navigation, search, and sidebar infrastructure from scratch. No justification for the complexity on a static doc site. |
| Jekyll | Rejected | Ruby toolchain, slower builds, much smaller plugin ecosystem in 2025. Docusaurus provides everything Jekyll would need plugins for out of the box. |
| Algolia DocSearch | Rejected | Requires internet access to external API. Non-starter for intranet deployment at 192.168.22.x. |
| Typesense (self-hosted) | Deferred | Valid offline search alternative but requires running a separate search daemon on the local server. Overkill for a site with <100 writeup pages. Use local Lunr instead. |
| GitHub Pages / Netlify / Vercel | Rejected | Public internet hosting. Project is explicitly intranet-only. |
## What NOT to Use
- **React frameworks with SSR (Next.js, Remix)** — This site has no dynamic behavior, no user accounts, no API. Server-side rendering adds operational complexity for zero benefit.
- **WordPress / Drupal / any CMS with a database** — Project explicitly forbids a backend. A database dependency breaks the "simple to maintain" constraint and introduces a server process that must stay running.
- **GitBook (cloud)** — External SaaS. Content would live on GitBook's servers, not on the local network. Privacy concern for internal course material and access breaks when off-network.
- **Algolia search (default Docusaurus)** — Do not use the default search config without replacing it. On an intranet with no internet, Algolia calls will silently fail and the search bar will return nothing, confusing users.
- **MkDocs Material** — Do not start new projects on this. The maintenance mode announcement is explicit: "the last release that will receive new features" was 9.7.0 (Nov 2024). It works today but the project should not be funded with a tool that has a known sunset.
## Local Network Considerations
## Sources
- Material for MkDocs maintenance mode confirmation: https://github.com/squidfunk/mkdocs-material/releases
- Docusaurus 3.9 release notes: https://docusaurus.io/blog/releases/3.9
- Docusaurus installation & Node requirements: https://docusaurus.io/docs/installation
- Docusaurus i18n introduction: https://docusaurus.io/docs/i18n/introduction
- Docusaurus search options: https://docusaurus.io/docs/search
- `@cmfcmf/docusaurus-search-local` (offline search): https://github.com/cmfcmf/docusaurus-search-local
- Nginx static content serving: https://docs.nginx.com/nginx/admin-guide/web-server/serving-static-content/
- MkDocs Material language config: https://squidfunk.github.io/mkdocs-material/setup/changing-the-language/
- Docusaurus deployment (self-hosting): https://docusaurus.io/docs/deployment
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
