# Pitfalls Research

**Domain:** Cybersecurity course site built from wargame exercises (CTF writeups, static docs, internal LAN)
**Researched:** 2026-05-20
**Confidence:** HIGH for content/pedagogy pitfalls (strong community evidence); MEDIUM for infra/network pitfalls (pattern-based reasoning); HIGH for Spanish-language pitfalls (peer-reviewed sources)

---

## Content Quality Pitfalls

### Pitfall: Answer-First Writeups That Teach Nothing

Writeups that show the flag or the working exploit without explaining the reasoning chain reduce the learner to copy-pasting commands. The learner leaves knowing the answer to this specific challenge but unable to approach the next one. This is the single most common failure mode in public CTF writeup culture.

- **Warning signs:** A writeup reads as a command log — tool invoked, output pasted, flag shown. No sentence answers "why did I run this command?" or "what was I looking for in this output?" The author would not be able to reconstruct their reasoning from the writeup six months later.
- **Prevention:** Enforce a mandatory structure per writeup: (1) what concept this challenge tests, (2) what the learner should observe at each step and why, (3) what the tool is doing internally (not just the invocation). The solution section is last, not first. Every command must have a prose sentence explaining intent before the code block.
- **Phase:** Content creation phase (writeup production). Define the template before the first writeup is written, not after.

---

### Pitfall: Missing Prerequisite Map

A writeup assumes the reader already knows what it does not teach. A "básico" writeup that opens with `openssl enc -d -base64` without explaining what Base64 encoding is, or why it is reversible, leaves the learner stranded. The learner cannot tell whether they are missing general knowledge or challenge-specific knowledge.

- **Warning signs:** The theory section of the writeup consists of a one-paragraph definition copied from Wikipedia. There is no statement of "before attempting this exercise you should understand X." The writeup requires knowledge from a higher difficulty level than the one it is classified under.
- **Prevention:** Each writeup must include an explicit prerequisites block: what concepts the learner is assumed to know before reaching this exercise. Cross-link to earlier exercises where those concepts are introduced. Design the content map — what each level teaches and assumes — before writing any individual writeup.
- **Phase:** Content architecture phase (before writeup production begins). The prerequisite map is a planning artifact, not something added during editing.

---

### Pitfall: Theory Section That Is Decorative, Not Functional

A writeup organized as "Theory / Tools / Solution" can still fail if the theory section is a copy of the Wikipedia article for the attack and bears no relationship to the specific challenge. The learner reads the theory, cannot connect it to what they see in the challenge, and skips to the solution anyway.

- **Warning signs:** The theory section could be swapped between two different writeups in the same category without anyone noticing. It contains no forward references to the specific artifact (file, URL, binary, cipher) in the challenge.
- **Prevention:** The theory section must contain at least one sentence that directly references the challenge: "In this exercise, the server is using X mechanism, which is vulnerable because Y — you will see this manifest as Z in the response." The theory earns its place by making the solution section predictable, not surprising.
- **Phase:** Content creation phase. Reviewable during a writeup review pass before the site is published.

---

### Pitfall: Rabbit Holes Without Annotation

In real CTF practice the solver goes down wrong paths. If the writeup omits these entirely, the learner who follows the same wrong path has no map and thinks they are failing. If the writeup describes rabbit holes in excessive detail without labeling them as wrong paths, the learner follows them too.

- **Warning signs:** The writeup has no section on "what didn't work and why" or all failed approaches are silently removed. Alternatively, the writeup describes failed tools at length and the learner cannot tell if the failure is expected or a sign they misconfigured something.
- **Prevention:** Brief, annotated dead-end notes: "I tried X first because Y — this fails because Z. You can skip this if you notice W early." These have high pedagogical value and low word count. They are a deliberate structural choice, not filler.
- **Phase:** Content creation phase. Include as a template field: "Dead ends worth noting (optional, max 2-3 bullets)."

---

## Difficulty Calibration Pitfalls

### Pitfall: Author-Centric Difficulty Rating

The person classifying exercises has already solved them. What feels "básico" to an expert is the exercise they understand immediately — not necessarily the exercise that requires only one concept. Expert-blind difficulty ratings routinely misclassify exercises that require a non-obvious observation as easy, and exercises that involve familiar but multi-step tooling as advanced.

- **Warning signs:** All exercises in a category cluster at the same difficulty level. No one outside the author team has attempted to complete a "básico" exercise without help. The criterion "básico = one concept" is documented but was applied by someone who already knows all concepts.
- **Prevention:** Apply difficulty ratings using the stated criterion (básico = single concept, avanzado = chained techniques) rigorously before solving, not after. After classification, have a second person with the target learner profile (student or professional new to this category) attempt the "básico" set and record where they get stuck. Recalibrate based on observed time-to-flag, not expert intuition.
- **Phase:** Exercise selection and classification phase. Budget time for at least one round of recalibration after a test reader attempts the first batch.

---

### Pitfall: Category-Blind Difficulty Comparison

Comparing difficulty across categories (Crypto vs. Web Hacking vs. Reversing) without accounting for baseline tool familiarity. A "básico" Reversing exercise requires understanding of binary formats, assembly reading, and a disassembler — all assumed prerequisites — while a "básico" Web Hacking exercise may require only browser developer tools. The two "básico" labels imply the same skill floor, which is false.

- **Warning signs:** The site presents all "básico" exercises across categories as equivalent entry points. A learner completes all Crypto básico exercises and then cannot start the first Reversing básico exercise.
- **Prevention:** Add a per-category prerequisite statement at the category landing page: what foundational knowledge a learner must have before the first exercise in this category, regardless of difficulty level. The three-level system applies within a category, not across categories.
- **Phase:** Site architecture and content organization phase (information architecture, not writeup production).

---

### Pitfall: Single-Exercise Validation of a Concept

Classifying an exercise as the authoritative coverage of a concept when only one exercise covers that concept. If the learner does not "get it" from that single exercise, there is no alternative path. Thin coverage at any level creates dead ends in the learning path.

- **Warning signs:** Reviewing the content map reveals concepts that appear in only one exercise. The curated subset has fewer than two exercises at básico level for a category with a large concept surface area (e.g., Web Hacking has 26 exercises available — selecting only 3-4 at básico risks single-exercise concept coverage).
- **Prevention:** During exercise selection, map each selected exercise to the concept it primarily teaches. Flag any concept covered by only one exercise for either adding a second exercise or adding a "further practice" external reference in the writeup.
- **Phase:** Exercise selection phase, before content production starts.

---

## Static Site Pitfalls

### Pitfall: Search That Silently Breaks on Internal Network

If the site is served via the `file://` protocol (opening HTML directly from a folder), MkDocs Material's search index fails silently in Chromium-based browsers. Web Workers cannot start under `file://`, which means search initialization blocks the main thread. The learner sees the search box but searches return nothing, with no error message. This is confirmed behavior in MkDocs Material's own issue tracker.

- **Warning signs:** The site is served by pointing a browser directly at an HTML file rather than through a local HTTP server. The search box appears to work but returns no results. Developer console shows a CORS error or a Web Worker registration failure.
- **Prevention:** Serve the static site through a minimal HTTP server (nginx, Caddy, Python's `http.server`, or a Raspberry Pi running a simple server on the LAN). This is required, not optional. Document the serving method in the project's deployment notes from the beginning. Do not rely on `file://` access for anything beyond static image viewing.
- **Phase:** Infrastructure setup phase (before content production, so writers can validate the site as they build it). Also: the offline plugin for MkDocs Material requires disabling instant loading, analytics, and versioning — disable these in `mkdocs.yml` from the start.

---

### Pitfall: Navigation Structure That Does Not Reflect Learning Order

Static documentation sites default to alphabetical or file-system-based navigation. A cybersecurity course has a learning dependency graph — some exercises must come before others — but alphabetical or category-first navigation exposes the learner to advanced content before they have the prerequisites.

- **Warning signs:** The sidebar lists exercises sorted by challenge ID or name within each category. A learner can click on an "avanzado" exercise from the home page without any friction. There is no "start here" path.
- **Prevention:** Design navigation around the learning path, not the file system. MkDocs Material supports explicit `nav:` configuration in `mkdocs.yml` — use it to manually sequence exercises within each level rather than letting the plugin auto-generate from directory structure. Add a "recommended path" page as the entry point.
- **Phase:** Site architecture phase (mkdocs.yml configuration and IA design), before content is populated.

---

### Pitfall: Code Blocks Without Context for the Target Environment

Commands in writeups are copied from a Linux environment with specific tool versions, paths, and flags. A learner on a different machine or a slightly different tool version gets a different output and cannot tell whether their deviation is expected. Static sites cannot adapt code examples to the reader's environment.

- **Warning signs:** Commands reference absolute paths that are specific to one machine (e.g., `/home/kali/tools/custom_script.py`). Tool versions are not stated. Commands include flags that changed behavior between tool versions without a note.
- **Prevention:** Every command block includes (as a comment or inline note) the tool version used. Commands use relative paths or clearly documented variables. Add a "Tools Setup" page to the site that specifies the exact tool versions and installation instructions so the learner's environment matches the writeup environment.
- **Phase:** Content creation phase. Enforce in writeup template as a required metadata field: tool name + version + source (package manager or URL).

---

### Pitfall: Hardcoded IP Addresses in Site Content

The wargame server is at 192.168.22.28. If writeups hardcode this IP in commands and prose, and the server's IP changes (network reconfiguration, DHCP lease change, machine replaced), every writeup becomes incorrect simultaneously. Finding and updating all occurrences across a static site requires a full rebuild.

- **Warning signs:** Commands in writeups contain `192.168.22.28` as a literal string rather than a variable or placeholder. The site has no single "configuration" or "environment" page where the server IP is defined once.
- **Prevention:** Use a MkDocs variable or a site-wide substitution mechanism (MkDocs Macros plugin or a simple find-replace in the build step) to define the wargame server IP in one place. In writeup prose, refer to it as `WARGAME_IP` or `[server]` and note on the first-use page how to resolve it. Alternatively, define a LAN hostname for the wargame server and use the hostname throughout, making IP changes transparent.
- **Phase:** Site architecture phase (before any writeup is written). Establish the IP reference convention and document it in the content authoring guide.

---

## Live Server Dependency Pitfalls

### Pitfall: The Course Is Unusable When the Wargame Server Is Down

The stated core value is: "read the concept, attempt the exercise on the wargame server, verify with the writeup." If the server at 192.168.22.28 is offline (maintenance, hardware failure, network change), steps 2 and 3 collapse. The course site exists but cannot deliver its central value. This is a structural SPOF with no current mitigation.

- **Warning signs:** No monitoring exists for the wargame server's availability. Learners encounter the course site, attempt to connect to 192.168.22.28, and get a timeout with no explanation on the site. There is no documented fallback or status page.
- **Prevention:** (1) Add a visible note on the course landing page with the server's expected availability and who to contact if it is down. (2) Where possible, include enough context in writeups that learners can follow the solution logic even without access to the live challenge (screenshots of key steps, captured output of key commands). (3) Work with the infrastructure team to get a documented maintenance window and display it on the site. Full redundancy is out of scope, but learner expectation-setting costs nothing.
- **Phase:** Site architecture phase (landing page and server status information). Writeup production phase (screenshot policy for key steps).

---

### Pitfall: Shared Credentials Create Collisions Between Learners

The wargame server uses `user1`/`user1` as shared credentials. Multiple learners working simultaneously on challenges that modify state (file creation, privilege escalation leaving artifacts, web challenge session cookies, service restarts) will interfere with each other without knowing it. A learner's environment will not match the writeup because a previous learner left the system in a modified state.

- **Warning signs:** Challenges involve writing files, escalating privileges, or modifying service configurations. Learners report that the steps in the writeup produce different output than what they see. Two learners are working on the same challenge at the same time.
- **Prevention:** (1) Identify during exercise selection which challenges have side effects on shared state — prefer stateless or read-only challenges for "básico" and "intermedio" levels. (2) Add a note in affected writeups: "If your environment does not match step X, the system may have been modified by another user. Connect at [time] or ask the administrator to reset the challenge." (3) If the wargame platform supports per-session sandboxing (isolated environments per login), document how to use it.
- **Phase:** Exercise selection phase (filter for state-safe challenges). Content creation phase (add warnings to stateful writeups).

---

### Pitfall: Writeup-Server Divergence Over Time

The wargame server is a live system. Challenge behavior may change: a CTF organizer updates a challenge, modifies its configuration, changes the flag format, or adds/removes hints. The static site writeup documents the challenge as it existed when the writeup was written. Over time, the site diverges from reality and learners cannot complete steps that the writeup describes.

- **Warning signs:** A writeup describes a specific banner, error message, or intermediate value that no longer appears on the server. The flag format in the writeup does not match the format the server expects. A tool that the writeup depends on behaves differently because the challenge service was updated.
- **Prevention:** (1) When writing each writeup, record the specific challenge version or state (e.g., a screenshot of the challenge description, the exact flag format expected). (2) During exercise selection, prefer challenges marked as stable or frozen by the wargame platform. (3) Schedule a periodic review (e.g., once per academic term) where each published writeup is verified against the live server by running through the steps.
- **Phase:** Content creation phase (versioning convention). Ongoing maintenance (periodic validation schedule — define it before launch, not after problems appear).

---

## Spanish-Language Technical Content Pitfalls

### Pitfall: Inconsistent Terminology (Anglicism vs. Spanish Equivalent)

Spanish-language cybersecurity content exists on a spectrum: some sources use full Spanish translations ("cortafuegos," "phishing" as-is, "inyección de código"), others use English terms throughout, and most mix both inconsistently. A course that is inconsistent within itself forces the learner to map between terms that refer to the same thing. Worse, if the writeup uses one term and the server's challenge UI uses another, the learner cannot identify the connection.

- **Warning signs:** The same attack technique is called "buffer overflow," "desbordamiento de búfer," and "desbordamiento de buffer" across different writeups. The theory section uses Spanish terms but the tools section uses English terms without cross-reference. A learner searches for a term from the writeup on the server's challenge page and finds no match.
- **Prevention:** Before writing any content, create a project glossary that fixes the term to use for each concept (with the English original noted). Apply it consistently. For terms where Spanish translation is ambiguous or uncommon in practice (e.g., "payload," "exploit," "shellcode"), use the English term with a parenthetical Spanish explanation on first use per writeup. The glossary is a shared authoring artifact, not a publishable appendix.
- **Phase:** Content architecture phase (before writeup production). The glossary must exist before the first writeup is written, not extracted from finished writeups afterward.

---

### Pitfall: Commands and Tool Output Are Always in English, Prose Is in Spanish — No Bridge

Tools like `nmap`, `openssl`, `strings`, `gdb`, and `volatility` produce English output. Writeup prose is in Spanish. When the learner reads Spanish instructions followed by English tool output, they must mentally context-switch at every step. This is manageable but becomes a barrier if the writeup does not explicitly connect Spanish prose to English output terms.

- **Warning signs:** The writeup says "verifica el resultado" and then shows 40 lines of raw tool output with no annotation identifying which part of the output is the relevant result. A learner who reads Spanish at a professional level but is not fluent in English cannot reliably extract the relevant output line.
- **Prevention:** In every writeup, annotate command output explicitly: either inline comments in the code block (using `#`) or a prose sentence immediately after the code block that says "the relevant line is X — it tells us Y." Do not assume the learner can identify the signal from noise in English-language tool output.
- **Phase:** Content creation phase. Enforce in the writeup template as a required element after every significant code block: one prose sentence (in Spanish) identifying the key output.

---

### Pitfall: Assuming a Single Spanish Dialect for Idiomatic Expression

INICTEL is in Peru. Spanish technical prose uses regionalized vocabulary. If content is reviewed or co-authored by people using different regional Spanish, inconsistency in phrasing can emerge. This is a minor pitfall compared to the others, but it creates a jarring reading experience.

- **Warning signs:** Some writeups use "ordenador" while others use "computadora" or "equipo." Register inconsistency (some writeups are formal, others colloquial) makes the course feel like a collection of independent documents rather than a unified product.
- **Prevention:** Fix the register (formal technical, suitable for university + professional audience) and two or three key regional term choices in the writing guide before production begins. This takes 30 minutes to document and saves significant editing time.
- **Phase:** Content architecture phase (authoring guide, alongside glossary creation).

---

## Phase-Specific Warning Summary

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Exercise selection and classification | Author-centric difficulty rating; category-blind comparison; thin concept coverage | Test classification with a second person at the target learner profile |
| Content architecture (before writing) | Missing prerequisite map; no glossary; no IP variable convention | Produce glossary, prereq map, and IP convention as planning artifacts |
| Writeup production | Answer-first structure; decorative theory; no tool version pinning; English output not annotated | Writeup template with mandatory fields enforced before first draft |
| Site build configuration | Search breaking on file://; navigation reflecting file system not learning order | Serve via HTTP from day one; configure `nav:` in mkdocs.yml explicitly |
| Infrastructure setup | Hardcoded IPs; no server status communication; no fallback for server downtime | Define WARGAME_IP variable; add server status note to landing page |
| Exercise-level QA | Shared credentials causing state collisions; writeup-server divergence | Identify stateful challenges; add collision warnings; schedule periodic verification |
| Ongoing maintenance | Writeup-server divergence as server updates | Periodic review cycle defined before launch |
