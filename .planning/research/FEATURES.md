# Features Research

**Domain:** Static cybersecurity course / wargame writeup documentation site
**Researched:** 2026-05-20
**Context:** Spanish-language, intranet-only, no backend, 87-exercise wargame, 3 difficulty levels, 7 categories

---

## Table Stakes

Features users expect from a documentation or learning site. Missing any of these and the site feels incomplete or hard to use.

### Navigation

- **Sidebar navigation with hierarchy** — complexity: low — Users expect to browse by category (Crypto, Web Hacking, etc.) and drill into exercises. Without it, the site is just a pile of pages.
- **Breadcrumb trail** — complexity: low — Shows where the user is inside the hierarchy (e.g., Curso > Criptografía > Básico > Ejercicio 3). Critical when content is 3 levels deep.
- **Previous / Next page links** — complexity: low — Users reading sequentially need these. Standard on every documentation framework.
- **Table of contents per page** — complexity: low — Each writeup has multiple sections (teoría, herramientas, solución). An in-page TOC lets users jump to what they need.
- **Home / landing page** — complexity: low — Entry point that orients the user: what the course is, how to navigate it, how to connect to the wargame server.

### Content Legibility

- **Syntax highlighting for code blocks** — complexity: low — Writeups will contain shell commands, Python scripts, hex dumps, HTTP requests. Unhighlighted code is painful to read.
- **Copy-to-clipboard button on code blocks** — complexity: low — Users will copy commands and scripts to run them. This is expected on any technical site.
- **Inline code formatting** — complexity: low — Tool names, file paths, flags, and options must be visually distinct from prose.
- **Line numbers on code blocks** — complexity: low — Useful when writeup prose refers to "line 14 of the script."
- **Readable typography and line length** — complexity: low — Long lines of prose in a full-width container are hard to read. Max-width body, good line height.

### Content Structure Per Writeup

- **Title and metadata block** — complexity: low — Exercise name, category, difficulty level, tools used. Users need to assess relevance before reading.
- **Theory section** — complexity: low — The "why" behind the technique. Core pedagogical value of the course.
- **Tools section** — complexity: low — Named tools with brief descriptions before they appear in commands.
- **Step-by-step solution** — complexity: low — Numbered steps with commands, screenshots or terminal output, and explanations of what each step does.

### Callout Blocks (Admonitions)

- **Warning / danger callouts** — complexity: low — Signal when a command is destructive or a step is irreversible.
- **Info / note callouts** — complexity: low — Surface related concepts or background without breaking the narrative.
- **Tip callouts** — complexity: low — Shortcuts, alternative tools, edge cases the reader might encounter.

### Search

- **Full-text client-side search** — complexity: low — Intranet deployment means no external search service. Tools like Lunr.js or the built-in Material for MkDocs search generate a pre-built index that runs in the browser with no backend. Users must be able to search across all writeups by tool name, concept, or category.
- **Search that works offline / without internet** — complexity: low — Required for intranet use. The search index must be bundled with the static build.

### Visual Orientation

- **Difficulty badge on each exercise** — complexity: low — Basic / Intermediate / Advanced must be immediately visible on exercise pages and in the index. Users self-select based on their level.
- **Category labeling** — complexity: low — Each exercise is visually tagged with its category. Essential when users browse by subject area.
- **Dark mode** — complexity: low — Standard expectation for any technical site used by developers or security practitioners. Material for MkDocs ships this out of the box.

---

## Differentiators

Features that go beyond the standard documentation template and are specifically valuable for this course's pedagogical mission.

- **Exercise index with dual-axis filtering (category + difficulty)** — A master index page listing all exercises, browsable by category (Crypto, Forense, etc.) AND by difficulty (Básico, Intermedio, Avanzado). Most generic documentation sites do not provide this. For a course with 7 categories and 3 levels, users need to find "all basic Web Hacking exercises" without reading every page. Implementable as a static HTML table with JavaScript filter, no backend needed.

- **Wargame connection reference panel** — A persistent, prominently placed block (sidebar widget or landing page section) showing the server IP (192.168.22.28), credentials (user1/user1), and any connection instructions (SSH, HTTP, etc.). Users must connect to the wargame server to practice; this removes friction from the "read, then try" loop.

- **"Try it first" spoiler / collapsible solution** — The step-by-step solution hidden behind a disclosure element (`<details>`/`<summary>` in HTML, or a collapsible admonition). Users who want to attempt the exercise before reading the answer can. This is a pedagogically meaningful feature that aligns with the course's self-paced learning model. Standard HTML5, no JavaScript required.

- **Consistent per-exercise template** — Every writeup follows the same structure (Concepto → Herramientas → Solución). Not just a writing convention — enforced by the site structure so readers know exactly where each section appears. This is differentiating because most writeup collections are ad-hoc.

- **Tool cross-reference** — A page or sidebar listing tools (e.g., `netcat`, `Wireshark`, `hashcat`) and which exercises use them. Allows users learning a specific tool to find all relevant writeups. Medium complexity: requires consistent tool tagging at authoring time and a build-time index.

- **Difficulty progression path** — Explicit guidance on which order to read exercises across difficulty levels: "start here if you're a beginner," linking Basic exercises as the recommended path before Intermediate. Not a gamification feature — just editorial navigation links.

- **Spanish-language interface throughout** — Navigation labels, callout headings, search placeholder, 404 page, and all UI chrome in Spanish. Most documentation frameworks default to English. This requires explicit configuration but is essential for the stated audience (INICTEL, Peru). Low complexity once framework is chosen.

- **Terminal output blocks visually distinct from input commands** — A clear visual distinction between what the user types (commands) and what the terminal returns (output). This matters in step-by-step exploitation writeups where the difference between input and output is load-bearing for comprehension. Can be done with custom CSS or different code block annotations.

---

## Anti-Features

Features that would be wrong to build for a static documentation course on an intranet with no backend.

- **User accounts / login system** — The project scope explicitly excludes authentication. A static site has no session management. Even if wanted, it would require a backend, which is out of scope. Adds maintenance burden with zero educational value.

- **Progress tracking / "mark as complete"** — Out of scope per PROJECT.md. Without a backend, progress cannot be persisted across sessions (localStorage is fragile and per-device). The course's value is in reading comprehension, not completion metrics. Gamification theater that distracts from the writing quality.

- **Interactive quizzes or embedded challenges** — The wargame server already provides the interactive challenge environment. Duplicating this inside the static site would require a backend and creates a parallel system to maintain. Users practice on the wargame server; they read on the static site.

- **Comments / discussion system** — Disqus and similar services require external network access, which is unavailable on an intranet. Building a custom system requires a backend. The audience (internal INICTEL students) has other communication channels. Not worth the complexity.

- **Video embeds** — Writeups are text-based by design. Video requires hosting infrastructure not available on the intranet. The step-by-step format with terminal output is more copy-paste friendly than video.

- **Versioned docs** — The course is a point-in-time artifact tied to 87 specific wargame exercises on a fixed server. There is no product API to version. Versioned documentation adds navigation complexity for no benefit.

- **Social sharing buttons** — The site is intranet-only. There is no public URL to share. These buttons would be dead links.

- **Downloadable PDF per exercise** — High complexity (requires a separate build pipeline), rarely used in practice, and inferior to reading on screen for technical content with code blocks. The site itself is the reading artifact.

- **Full-text edit-in-browser (CMS)** — A static site's content is maintained via Markdown files in a repository. An in-browser editor would require a backend. Overkill for a course maintained by a small team.

---

## Feature Dependencies

Features that require other features to be present first.

- **Exercise index with filtering** requires **consistent difficulty badge and category labeling** on every exercise page — the index can only filter what is tagged.
- **Full-text search** requires **all pages to be indexed at build time** — the search index is generated during the static site build, so search scope equals build scope.
- **Tool cross-reference page** requires **consistent tool tagging in writeup metadata** — tools must be named uniformly at authoring time (e.g., always "Wireshark", never "wireshark" or "tshark interchangeably") for the index to be accurate.
- **"Try it first" spoiler** requires **step-by-step solution to be a discrete, bounded section** in each writeup — the spoiler only works if the solution is cleanly separated from theory and tools sections.
- **Difficulty progression path** requires **difficulty badges to be assigned to all exercises** before editorial linking makes sense.
- **Spanish-language UI** requires **framework-level i18n configuration** before content authoring begins — retrofitting language after content is written risks inconsistency in UI chrome.
- **Per-page table of contents** requires **consistent use of heading hierarchy within writeups** (H2 for major sections, H3 for subsections) — a flat or inconsistently headed page produces a useless TOC.
- **Terminal output visually distinct from commands** requires **a CSS convention or code block annotation scheme decided before the first writeup is authored** — retrofitting this across dozens of pages is high-effort.
