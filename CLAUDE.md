# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`sesisenai.inf.br` is the **portal de entrada** (entry portal) for a family of independent
"inteligência educacional" products built by the **Coordenação de Recursos Tecnológicos e
Inteligência Educacional** of the **Diretoria de Educação e Tecnologia do SESI SENAI Goiás**.

The model is a **directory of products**:

- The root `index.html` is the landing page — a directory that links out to each product.
- Each product is a **self-contained subdirectory** served at `sesisenai.inf.br/<produto>/`,
  using only paths relative to its own folder.
- The first (and currently only) product is the **Painel Executivo** at `painel-executivo/`.

Hosted on **Cloudflare Pages**. No build tools, no package manager, no framework — pure HTML,
CSS, and vanilla JavaScript. There are no tests, linters, or CI.

## Running Locally

```bash
python3 -m http.server 8080
# or
npx serve .
```

Landing page: `http://localhost:8080`. A product: `http://localhost:8080/painel-executivo/`.
Serving over HTTP (not `file://`) matters — the products load CDN scripts and fetch local
assets (e.g. `marca-fieg.svg`) that the `file://` protocol blocks.

## Adding a New Product

1. `mkdir nome-do-produto`, then add `nome-do-produto/index.html` as the entry point, with all
   assets (CSS, JS, images) inside that same directory using **relative paths**
   (`href="styles.css"`, never `href="nome-do-produto/styles.css"`).
2. Link it from the root `index.html` (see "Landing page" below for the two layout options).
3. If the product loads from CDNs not already whitelisted, **extend the matching directive in
   `_headers`** — do not weaken the policy globally. The current CSP already allows: scripts from
   `unpkg.com`, `cdn.tailwindcss.com`, `cdn.jsdelivr.net`, `cdnjs.cloudflare.com`; styles from
   `fonts.googleapis.com` + `cdn.tailwindcss.com`; fonts from `fonts.gstatic.com` + `unpkg.com`;
   images from `data:`, `blob:`, `images.unsplash.com`, `i.postimg.cc`. `'unsafe-inline'` is
   enabled for scripts because the Painel injects inline `onclick` handlers via `innerHTML`.

## Landing Page — two layouts exist, only one is wired in

There is an **active** layout and a **dormant** one. Know which you are editing:

- **`index.html` (active)** is fully self-contained: inline `<style>`, SESI SENAI brand colors as
  CSS custom properties, and a **single primary button** linking to `painel-executivo/`. As more
  products ship, this is the file that actually renders, so new product links go here.
- **`styles.css` (dormant)** is a richer **card-directory design system** — `.page`, `.hero`,
  `.cards`, `.card`, `.panel`, with auto-cycling card-icon colors via `nth-child` (blue → green →
  orange → dark-blue, repeating; rules cover up to 6 cards). **`index.html` does not link it.**
  It is the intended directory layout for when there are several products. If you migrate the
  landing page to the multi-card directory, wire `styles.css` in and build cards against these
  classes rather than reinventing them.

Brand tokens (consistent across both): `--azul-sesi-senai #15499B`, `--azul-profundo #0E3578`,
`--laranja #F04B16`, `--verde #58B031`.

## `painel-executivo` Product

A single-file vanilla-JS SPA (`painel-executivo/index.html`, ~810 lines: markup, then one
`<script>`) that turns Word reports into a styled "Informe Executivo" newsletter and exports it
to PDF. CDN dependencies, all loaded in `<head>`:

- **Tailwind CSS** (`cdn.tailwindcss.com`) — styling; brand palette configured inline in
  `tailwind.config` (`brand.blue #003A70`, `brand.red #E31937`, etc.) plus Google Fonts
  Montserrat (sans) / Merriweather (serif).
- **mammoth.js** — converts uploaded `.docx` files to HTML in the browser.
- **html2pdf.js** — renders the dashboard to PDF.
- **Phosphor Icons** (`@phosphor-icons/web`) — `<i class="ph ...">` icon font, hydrated by being
  on the page (no init call needed).
- **Chart.js** is loaded but currently unused — do not assume charts are rendered.

### Data model and persistence

State is the module-scoped `reports` array, persisted to `localStorage` under the single key
**`sesiSenaiReportsV4`** (note the `V4` suffix — bumping the schema means bumping this key).
A report record: `{ id, unit, title, date, type, content, image }`.

- `type` is one of four fixed "eixos": `Educação e Qualificação`, `Saúde e Segurança`,
  `Indústria 4.0 e Inovação`, `Relações Institucionais` (see `inferCategory`).
- `date` is ISO `YYYY-MM-DD`.
- `image` is a base64 JPEG data URL, compressed client-side via Canvas (`compressImageString`,
  max 600px, quality 0.6) before saving — `localStorage` quota overflow is caught and surfaced
  to the user, rolling back the just-added batch.

### Import pipeline (the core feature)

`.docx` files → `processWordFiles` → mammoth HTML → heuristic splitter. The splitter treats a
short line containing `SESI`/`SENAI`/`FATEC` as a **unit header** that starts a new report;
following nodes accumulate as `content`, with `extractDate` / `inferCategory` / `generateTitle`
filling missing fields and `cleanAndImproveText` normalizing prose. Parsed reports land in
`parsedReportsCache` and render as **editable review cards** (`renderReviewCards`) so the user
can correct them before `saveAllParsedReports` commits them to `reports` + `localStorage`.

### Render and filter

`applyFilters` filters `reports` by unit text, eixo, and a date range (driven by month pickers
via `onMonthChange`, which derive start/end dates), then calls `renderNewsFeed`, which rebuilds
the feed with `innerHTML` (newest first). Any state change re-runs `applyFilters`; `window.onload`
calls it once to paint the initial feed.

### PDF export — the fragile part

`exportToPDF` adds a `pdf-mode` class to `<body>` that swaps the on-screen UI for print styling
via CSS: `.hide-on-pdf` (controls/buttons) is hidden, the on-page `#header-logo` is hidden, and
cards toggled off via the per-card checkbox (`togglePdfInclusion` → `.exclude-from-pdf`) are
dropped. After html2pdf builds the doc, a post-pass loops every page to draw the header rule, the
"Pág. X de Y" footer, and the **FIEG brand mark** (`marca-fieg.svg`, drawn to canvas → PNG, with a
fixed `LOGO_ASPECT` to avoid NaN sizing). `pdf-mode` is removed in the final `.then()`. When
touching PDF output, verify against the real export path — the print classes, the page-loop
overlays, and the relative `marca-fieg.svg` fetch are easy to break silently (recent commit
history is dominated by PDF logo/footer regressions).
