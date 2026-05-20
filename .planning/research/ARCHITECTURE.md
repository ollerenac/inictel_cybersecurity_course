# Architecture Research

**Domain:** Static cybersecurity course / wargame writeup site
**Researched:** 2026-05-20
**Confidence:** HIGH (based on Material for MkDocs official docs + verified CTF site examples)

---

## Content Architecture

### Directory Structure

The canonical layout for a MkDocs-based documentation site organizes all source files under `docs/`, with `mkdocs.yml` at the project root controlling build and navigation. For this project, a **category-first directory hierarchy** is the right choice: each of the 7 categories becomes a top-level directory, exercises live inside it, and difficulty is expressed via frontmatter tags — not additional nesting.

```
ciberwar/
├── mkdocs.yml                    # Build config, nav, theme, plugins
├── docs/
│   ├── index.md                  # Homepage: course overview, how to use
│   ├── como-usar.md              # How to connect to wargame server
│   ├── categorias.md             # Overview of all 7 categories
│   ├── crypto/
│   │   ├── index.md              # Category overview + exercise index
│   │   ├── ejercicio-01.md
│   │   ├── ejercicio-02.md
│   │   └── ...
│   ├── web-hacking/
│   │   ├── index.md
│   │   └── ...
│   ├── forensics/
│   │   ├── index.md
│   │   └── ...
│   ├── system-hacking/
│   │   ├── index.md
│   │   └── ...
│   ├── malware/
│   │   ├── index.md
│   │   └── ...
│   ├── isms/
│   │   ├── index.md
│   │   └── ...
│   └── reversing/
│       ├── index.md
│       └── ...
└── overrides/                    # Optional: custom HTML/CSS/JS
```

Each exercise file uses YAML frontmatter to carry metadata:

```yaml
---
title: "XOR Básico — Crypto #01"
tags:
  - basico
  - crypto
  - xor
herramientas:
  - Python
  - CyberChef
---
```

This separates structural concerns (directory = category) from filtering concerns (tags = difficulty, tools). Difficulty tags (`basico`, `intermedio`, `avanzado`) become filterable via the Material for MkDocs tags plugin, producing an auto-generated difficulty index page without requiring a separate directory tree.

### Navigation Model

Two navigation axes exist for this content:

1. **Primary axis: category** — the main nav sidebar. Users who want all Crypto exercises browse `crypto/`. This is the directory structure.
2. **Secondary axis: difficulty** — cross-cutting via tags. A `tags/` index page generated automatically by the tags plugin lets a student find all `basico` exercises across all categories.

The navigation model in `mkdocs.yml` uses **tabs** (Material for MkDocs feature) for the top-level categories, making each category accessible from the header bar. Within each tab, the sidebar shows the exercise list.

```yaml
# mkdocs.yml nav skeleton
nav:
  - Inicio: index.md
  - Cómo Usar: como-usar.md
  - Crypto:
    - crypto/index.md
    - "XOR Básico": crypto/ejercicio-01.md
    - "...": crypto/...
  - Web Hacking:
    - web-hacking/index.md
    - ...
  - Forensics:
    - forensics/index.md
    - ...
  - System Hacking:
    - system-hacking/index.md
    - ...
  - Malware:
    - malware/index.md
    - ...
  - ISMS:
    - isms/index.md
    - ...
  - Reversing:
    - reversing/index.md
    - ...
  - Por Dificultad: tags.md   # auto-generated tags index
```

This avoids a deeply nested structure (category > difficulty > exercise) that would require 21 directories (7 categories × 3 levels) and make the nav sidebar unwieldy. The flat-per-category approach means at most ~26 items in the Web Hacking sidebar — navigable without collapsing.

---

## Component Map

| Component | Responsibility | Dependencies |
|-----------|---------------|--------------|
| `mkdocs.yml` | Declares site metadata, theme, plugins, nav tree, build options | Must exist before any build command runs |
| `docs/index.md` | Course homepage: purpose, structure, how to use the wargame server | None |
| `docs/como-usar.md` | Connection instructions for `192.168.22.28`, credentials, troubleshooting | None |
| `docs/categorias.md` | Overview table of all 7 categories with exercise counts and descriptions | Category index pages |
| `docs/{categoria}/index.md` | Category landing page: what this category covers, exercise list with difficulty badges | Individual exercise files in that category |
| `docs/{categoria}/ejercicio-NN.md` | Single writeup: theory section, tools list, step-by-step solution | None (self-contained) |
| Tags index (`tags.md` or auto) | Cross-cutting difficulty index: lists all exercises tagged `basico`, `intermedio`, `avanzado` | Frontmatter tags in all exercise files |
| MkDocs build (`mkdocs build`) | Converts Markdown + config into a static `site/` directory of HTML/CSS/JS | Python env, mkdocs + Material theme installed |
| Static file server | Serves the `site/` directory over HTTP on the local network | Built `site/` directory |
| Material for MkDocs theme | Renders tabs, sidebar, search, TOC, admonitions, code highlighting | Installed via pip |

---

## Data Flow

```
Author workstation
      |
      | writes Markdown in docs/
      | edits mkdocs.yml nav when adding exercises
      v
mkdocs build
      |
      | reads all .md files
      | applies frontmatter metadata
      | resolves nav tree from mkdocs.yml
      | renders HTML via Material theme
      | generates tags index
      | generates search index (lunr.js, client-side)
      v
site/           <- static output: HTML + CSS + JS + search index
      |
      | copied to server, or served in-place
      v
HTTP server (nginx or python -m http.server)
      |
      | bound to 0.0.0.0:80 (or :8000)
      v
Students on 192.168.x.x network
      |
      | browser fetches static files
      | search runs client-side (no server query needed)
      | no database, no auth, no backend
```

Key properties of this flow:

- **No dynamic server required.** Search is client-side (bundled lunr.js). No API calls leave the browser.
- **Author workflow is local.** `mkdocs serve --dev-addr=0.0.0.0:8000` during authoring lets the author preview on any device on the network in real time.
- **Production serving is trivial.** `mkdocs build` produces a `site/` directory that any static file server can host. nginx is preferred for production; `python -m http.server` is acceptable for a classroom-only network.
- **Incremental authoring.** Adding a new exercise is: create the `.md` file, add one line to `mkdocs.yml` nav, rebuild.

---

## Build Order

1. **Python environment + MkDocs + Material theme** — Must exist before anything else can be built or previewed. Install once on the author's machine. This is the only real dependency chain gate.

2. **`mkdocs.yml` skeleton** — Establishes site name, language (`es`), theme, and plugins (tags, search). Categories declared in nav as empty stubs. Unlocks `mkdocs serve` for live preview from this point forward.

3. **Homepage and orientation pages** (`index.md`, `como-usar.md`) — No exercise content needed. Defines the course framing and server connection instructions. Students can read these immediately.

4. **Category index pages** (`{categoria}/index.md` for all 7) — Establishes the nav structure. Each is a short description page that will accumulate exercise links. Build all 7 stubs early so the tab navigation is complete from the start.

5. **Exercise writeups, batch by category** — The bulk of the work. Each writeup is independent; no writeup depends on another. Recommended order: start with the category that has the most curated exercises ready (likely Crypto or Forensics, which are more self-contained), then proceed through remaining categories.

6. **Tags index page** — Auto-generated by Material for MkDocs tags plugin once exercises have frontmatter tags. No manual authoring needed; only requires that exercise frontmatter is correctly written.

7. **Final build + server deployment** — `mkdocs build` produces `site/`. Copy to server or configure nginx to serve from the build output path.

---

## Local Network Serving

### Development (authoring phase)

```bash
mkdocs serve --dev-addr=0.0.0.0:8000
```

Binds the MkDocs dev server to all network interfaces. Any machine on the local network can access `http://192.168.22.X:8000` (where X is the author's machine IP). Hot-reloads on file save. Not suitable for production because it is single-threaded.

### Production (classroom use)

**Option A: nginx (recommended)**

nginx is the standard for serving static files on a LAN. Low resource usage, handles concurrent students, easy to restart as a service.

```nginx
server {
    listen 80;
    server_name _;

    root /path/to/site;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

Start with `nginx -s reload` after config change. Accessible at `http://192.168.22.X/`.

**Option B: Python (fallback, no install needed)**

```bash
cd /path/to/site
python3 -m http.server 8080 --bind 0.0.0.0
```

Adequate for 5-20 concurrent users. No config file needed. Not a daemon — requires an open terminal or a process manager like `screen` or `nohup`.

**Option C: serve `mkdocs build` output in-place on the wargame server**

If the wargame server at `192.168.22.28` has nginx already running (likely, as it serves the wargame platform), the `site/` directory can be dropped into a virtual host there. Students access both the wargame and the course writeups from the same server. This is architecturally clean and avoids maintaining a separate server.

### URL structure after build

MkDocs generates clean URLs. An exercise at `docs/crypto/ejercicio-01.md` is served at:

```
http://192.168.22.28/crypto/ejercicio-01/
```

Search, navigation, and internal links all work without JavaScript routing — each page is a real HTML file at that path.

---

## Sources

- [MkDocs — Writing Your Docs (directory structure, frontmatter)](https://www.mkdocs.org/user-guide/writing-your-docs/)
- [MkDocs — Configuration (nav structure)](https://www.mkdocs.org/user-guide/configuration/)
- [Material for MkDocs — Setting up Navigation (tabs, sections, instant loading)](https://squidfunk.github.io/mkdocs-material/setup/setting-up-navigation/)
- [Material for MkDocs — Built-in Tags Plugin (cross-cutting tag index, frontmatter syntax)](https://squidfunk.github.io/mkdocs-material/plugins/tags/)
- [Team-Shakti CTF-Write-ups (real CTF site using category-first directory layout + MkDocs Material)](https://github.com/Team-Shakti/CTF-Write-ups)
- [nginx — Serving Static Content](https://docs.nginx.com/nginx/admin-guide/web-server/serving-static-content/)
- [MkDocs serve local network — --dev-addr flag](https://github.com/mkdocs/mkdocs/discussions/3706)
