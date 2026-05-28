# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-project static hosting environment for **SESI SENAI Goiás** at `sesisenai.inf.br`, hosted on **Cloudflare Pages**. Each project lives in its own subdirectory and is accessible at `sesisenai.inf.br/<nome-do-projeto>/`. The root `index.html` is the portal/landing page that links to all projects.

No build tools, no package manager, no framework — pure HTML, CSS, and vanilla JavaScript throughout.

## Running Locally

```bash
python3 -m http.server 8080
# or
npx serve .
```

Open `http://localhost:8080` for the landing page. Each project is accessible at its subdirectory, e.g. `http://localhost:8080/acoes-diretores/`.

There are no tests, no linters, and no CI configuration.

## Adding a New Project

1. Create a subdirectory: `mkdir nome-do-projeto`
2. Add `nome-do-projeto/index.html` as the project entry point, with all assets (CSS, JS, images) inside the same directory using **relative paths** (e.g. `href="styles.css"`, not `href="nome-do-projeto/styles.css"`).
3. Add a card in the root `index.html` pointing to `nome-do-projeto/`:

```html
<a href="nome-do-projeto/" class="card">
  <div class="icon" aria-hidden="true">N</div>
  <div>
    <strong>Nome do Projeto</strong>
    <span>Descrição curta do projeto.</span>
  </div>
</a>
```

4. The card icon colour cycles automatically via `nth-child` in `styles.css` (blue → green → orange → dark-blue, repeating). No CSS change needed for up to 6 cards; beyond that, add more `nth-child` rules following the same pattern.

5. If the project uses external CDNs not listed in `_headers`, add those origins to the `Content-Security-Policy` in `_headers`.

## Repository Structure

```
/                        ← root of the Cloudflare Pages deployment
├── index.html           ← portal landing page
├── styles.css           ← CSS for the landing page (light theme, SESI SENAI brand)
├── _headers             ← Cloudflare Pages security headers (applies to all routes)
├── CLAUDE.md
├── marca_*.png          ← SESI SENAI brand logo
└── acoes-diretores/     ← first sub-project (directors' strategic actions panel)
    ├── index.html
    ├── styles.css
    └── app.js
```

Each project is **self-contained**: its `index.html` must use paths relative to its own directory.

## Cloudflare Pages Configuration

`_headers` sets security headers for all routes (`/*`). Current policy allows:

- Scripts from `'self'` and `unpkg.com` (Lucide icons CDN)
- Styles from `'self'` and `fonts.googleapis.com`
- Fonts from `fonts.gstatic.com`
- Images from `'self'`, `data:`, `blob:`, and `images.unsplash.com` (demo data)
- `'unsafe-inline'` is required for scripts because `acoes-diretores` injects inline `onclick` handlers via `innerHTML`

When adding a project that loads from additional CDNs, extend the relevant directive in `_headers` rather than weakening the policy globally.

## Landing Page (`index.html` + `styles.css`)

Light-themed portal. CSS tokens are in `styles.css`:

| Token | Value | Use |
|---|---|---|
| `--azul-sesi-senai` | `#15499B` | Primary blue |
| `--laranja` | `#F04B16` | Accent orange |
| `--verde` | `#58B031` | Accent green |
| `--azul-profundo` | `#0E3578` | Dark blue (headings) |

## `acoes-diretores` Sub-application

Directors' strategic actions panel — vanilla JS SPA.

### State and persistence

All state lives in a single global `state` object. Persistence is via `localStorage`:

- `acoes_estrategicas_db` — JSON array of action records
- `diretor_nome`, `diretor_escola` — director profile

Action record shape: `{ id, titulo, assunto, data, status, sumario, escola, diretor, evidencia }`  
`evidencia` is a base64 data URL — photos are compressed client-side via Canvas API (max 900 px, JPEG 70%).

### Render pattern

`render()` rebuilds the entire actions grid via `innerHTML` replacement. It is called after every state change. KPI counters are recalculated at the top of `render()` before secondary filters run.

After every `render()` call, `lucide.createIcons()` must be called to hydrate the newly injected icon elements.

### Print / PDF system

`.no-print` / `.show-print` CSS classes control what appears in `@media print`. Individual card print works by appending a temporary `div.temp-print-area` to `<body>`, calling `window.print()`, then removing it.

CSV export uses `;` delimiter and a UTF-8 BOM (`﻿`) prefix for Brazilian Windows Excel compatibility.
