# Research Summary — INICTEL Cybersecurity Course

## Recommended Stack

Build the site with **Docusaurus 3** (v3.10.1) on **Node.js 22 LTS**, configured with `defaultLocale: 'es'` for full Spanish UI without a multi-locale build. Replace Docusaurus's default Algolia search with `@cmfcmf/docusaurus-search-local` (Lunr-based, browser-only, no outbound requests) before the first deploy — this is mandatory for an intranet with no internet access. Serve the static `build/` output with **Nginx 1.26.x** on the local network; no Node.js, no build tooling, and no backend runs in production.

## Table Stakes Features

- Sidebar navigation with category hierarchy (7 categories as top-level sections)
- Breadcrumb trail (content is 3 levels deep: site > category > exercise)
- Previous / Next page links for sequential reading
- Per-page table of contents (writeups have distinct Theory / Tools / Solution sections)
- Home / landing page with course overview and wargame server connection details
- Syntax highlighting on code blocks (bash, python, hex, HTTP)
- Copy-to-clipboard button on code blocks
- Full-text client-side search that works offline (no internet required)
- Difficulty badge on each exercise (Basico / Intermedio / Avanzado)
- Consistent per-exercise structure: Title + metadata, Theory, Tools, Step-by-step solution
- Spanish-language UI throughout (navigation labels, search, all chrome)
- Dark mode
- Callout blocks: Warning, Info/Note, Tip (admonitions)

## Differentiating Features

- **Exercise index with dual-axis filtering** (category AND difficulty) — essential for navigating the full exercise set
- **Wargame connection reference panel** — server IP (192.168.22.28), credentials, connection instructions; persistent and prominent
- **"Try it first" collapsible solution** — step-by-step solution hidden behind `<details>`/`<summary>`; pedagogically meaningful
- **Terminal output visually distinct from input commands** — separating what the user types from what the terminal returns; critical for exploitation writeups
- **Dead-end annotations in writeups** — brief notes on failed approaches; high pedagogical value
- **Difficulty progression path** — editorial "start here" links and per-category prerequisite statements

## Architecture Approach

Use a **category-first directory hierarchy** under Docusaurus's `docs/` folder: each of the 7 categories becomes a top-level directory (`crypto/`, `web-hacking/`, `forensics/`, `system-hacking/`, `malware/`, `isms/`, `reversing/`), with exercises as individual `.md` files inside. Difficulty is expressed via YAML frontmatter tags (`basico`, `intermedio`, `avanzado`) — not as a nested directory level — keeping the sidebar navigable and enabling cross-cutting difficulty filtering. Each exercise file carries structured frontmatter: `title`, `tags` (difficulty + category + techniques), and `herramientas` (tool list). The build flow is: author edits Markdown locally → `npm run build` → rsync `build/` to Nginx web root.

> **Note:** ARCHITECTURE.md was researched against MkDocs; structural decisions are sound and transferable to Docusaurus but implementation details must be translated (see Conflicts).

## Top Pitfalls

1. **Wrong search backend deployed** — Default Docusaurus search hits Algolia externally, silently returning zero results on the intranet; install `@cmfcmf/docusaurus-search-local` before the first build.
2. **Answer-first writeups that teach nothing** — Enforce a mandatory writeup template before the first draft: concept first, intent-before-command, solution last.
3. **Author-centric difficulty ratings** — Experts rate "basico" too hard; validate classifications with someone at the target learner profile after initial pass.
4. **Hardcoded wargame server IP in writeup content** — Define a variable convention or DNS hostname before any writeup is written.
5. **Missing content artifacts before writing starts** — Glossary, prerequisite map, IP convention, and writeup template must exist before production; retrofitting is costly.
6. **Shared credentials causing environment collisions** — Stateful challenges collide for simultaneous users; prefer stateless challenges at basic/intermediate levels and add explicit warnings.

## Conflicts / Tensions

**Major — Stack and Architecture research used different frameworks.**

ARCHITECTURE.md was researched against MkDocs + Material for MkDocs. STACK.md explicitly rejected MkDocs Material as end-of-life and selected Docusaurus 3.

The content architecture decisions (directory structure, frontmatter, nav model) are sound and transferable. Translation table:

| MkDocs (ARCHITECTURE.md) | Docusaurus 3 (use this) |
|---|---|
| `mkdocs.yml` nav | `docusaurus.config.js` + `sidebars.js` |
| `pip install mkdocs-material` | `npm install` |
| Material tags plugin | Frontmatter tags + custom index page |
| `site/` output | `build/` output |
| `mkdocs serve` | `npm run start` |
| `mkdocs build` | `npm run build` |

**Minor — Mermaid diagram support unresolved.** Decide at project setup, not mid-production.

## Open Questions

- **Which exercises to include?** The curated subset must be selected before writeup production begins. No research addressed selection criteria.
- **Where does the site live?** Dedicated server or shared with wargame server (192.168.22.28)? Requires coordination with whoever manages that machine.
- **What is the baseUrl?** `/` if served at the root IP, `/curso/` if at a subpath. Must be decided before the first build.
- **Who are the writeup authors?** Single instructor or multiple contributors? Affects template/style guide complexity.
- **Does the build machine have internet access?** Docusaurus/npm require internet on first install; subsequent builds can be offline.
- **What is the periodic review cadence?** The wargame server is live; challenge behavior can change. A review schedule must be defined before launch.

## Research Confidence

| Area | Level | Notes |
|------|-------|-------|
| Stack | High | Docusaurus 3 choice well-grounded; MkDocs rejection based on confirmed maintenance-mode announcement |
| Features | High | Table stakes map cleanly to documented framework capabilities |
| Architecture | Medium | Content structure is sound; implementation details were researched against MkDocs — requires translation |
| Pitfalls | High | Content/pedagogy pitfalls well-evidenced; infrastructure pitfalls grounded in Docusaurus issue tracker |

## Suggested Roadmap Shape

**4 phases (coarse granularity):**

1. **Site scaffolding** — Docusaurus 3 init, offline search, `baseUrl` set, Nginx config, serving verified offline
2. **Content architecture** — Exercise selection & classification, glossary, writeup template, IP convention, tool tagging schema
3. **Writeup production** — Batched by category; difficulty calibration pass after first batch
4. **Finalization & deployment** — Exercise index/filtering, connection reference panel, final Nginx deploy, offline search verification
