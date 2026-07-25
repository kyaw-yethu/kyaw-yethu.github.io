# Portfolio Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Jekyll/AcademicPages portfolio as a custom Astro static site in the "Gallery White" design, deployed to GitHub Pages.

**Architecture:** A static Astro site. Homepage (Bio) composed from small Astro components fed by YAML data files (`src/data/*`); list pages (Research, Sharing, Writing) driven by Astro **content collections** of Markdown (`src/content/*`). A shared `Base` layout supplies nav/footer/`<head>` and a 700px centered column. Pure logic (sorting, timeline side-assignment) lives in testable helper modules. The old Jekyll tree is moved to `legacy/` (kept in git history, excluded from the Astro build). Deployment is a GitHub Actions workflow that builds Astro and publishes `dist/` to Pages.

**Tech Stack:** Astro 4, TypeScript, `@fontsource/lato`, Vitest (unit tests for helpers), GitHub Actions + `actions/deploy-pages`.

## Global Constraints

- **Node:** ≥ 20 (dev machine has v22.23.1; CI pins Node 20).
- **Site URL:** `https://kyaw-yethu.github.io`, `base: "/"` (root user page — do NOT set a subpath base).
- **Palette (CSS custom props in `src/styles/tokens.css`):** `--bg:#f7f6f3`, `--ink:#1c1c1c`, `--muted:#8a857c`, `--line:#e4e0d8`, `--accent:#2b8a94`, `--stripe:#f1efe9`.
- **Type:** Lato — 300 (headings), 400 (body), 700 (bold). Fallback `"Segoe UI", system-ui, sans-serif`. Self-hosted via `@fontsource/lato` (no Google Fonts at runtime).
- **Content column:** `max-width: 700px`, centered; sticky blurred nav.
- **Timeline & News ordering:** newest entry first (top) → oldest last (bottom).
- **Dropped forever:** engineering projects. **Out of scope v1:** Album page, dark mode.
- **Commands run in WSL** (`wsl -e bash -lic '...'`) from repo root `/home/kyawgyi/projects/kyaw-yethu.github.io`. Work happens on branch `portfolio-overhaul`.
- **Copy rule:** own name rendered **bold** in author lists; preserve `*` equal-contribution markers.

---

## File Structure

```
astro.config.mjs         # site, integrations
package.json             # scripts, deps
tsconfig.json
src/
  styles/
    tokens.css           # palette + type tokens, base element styles
    global.css           # resets, link/prose styles, column, responsive
  lib/
    ordering.ts          # sortNewestFirst(), assignTimelineSides()
    ordering.test.ts
  data/
    site.yaml            # name, tagline, socials, email, cvUrl
    education.yaml
    news.yaml
    experience.yaml
  content/
    config.ts            # collection schemas
    publications/*.md
    research/*.md
    writing/*.md
    sharing/*.md
  components/
    Nav.astro  Footer.astro
    Hero.astro  SpaceToWrite.astro
    NewsRail.astro  ExperienceTimeline.astro
    ResearchList.astro  ResearchItem.astro
    SharingList.astro
  layouts/
    Base.astro           # <head> + Nav + <slot/> + Footer
    Post.astro           # article layout for writing
  pages/
    index.astro          # Bio (homepage)
    research.astro
    sharing.astro
    writing/index.astro
    writing/[...slug].astro
public/
  images/bio-photo.png   # copied from legacy images/
  files/kyawyethu-cv.pdf
.github/workflows/deploy.yml
legacy/                  # moved Jekyll tree
```

---

## Task 1: Scaffold Astro project & base tooling

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.nvmrc`
- Create: `src/pages/index.astro` (temporary placeholder)

**Interfaces:**
- Produces: a runnable Astro project (`npm run dev`, `npm run build`) with `astro`, `@fontsource/lato`, `vitest` installed.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "kyaw-yethu-portfolio",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run"
  },
  "dependencies": {
    "astro": "^4.15.0",
    "@fontsource/lato": "^5.1.0"
  },
  "devDependencies": {
    "vitest": "^2.1.0",
    "@astrojs/check": "^0.9.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 2: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kyaw-yethu.github.io',
  base: '/',
});
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "legacy"]
}
```

- [ ] **Step 4: Create `.nvmrc`**

```
20
```

- [ ] **Step 5: Create temporary `src/pages/index.astro`**

```astro
---
---
<html lang="en">
  <head><meta charset="utf-8" /><title>Kyaw Ye Thu</title></head>
  <body><h1>It builds.</h1></body>
</html>
```

- [ ] **Step 6: Install and build**

Run: `wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && npm install && npm run build'`
Expected: install completes; build prints "Complete!" and creates `dist/index.html`.

- [ ] **Step 7: Commit**

```bash
git add package.json astro.config.mjs tsconfig.json .nvmrc src/pages/index.astro
git commit -m "chore: scaffold Astro project"
```

---

## Task 2: Design tokens, global styles & Base layout

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`
- Create: `src/components/Nav.astro`, `src/components/Footer.astro`
- Create: `src/layouts/Base.astro`
- Modify: `src/pages/index.astro` (use Base)

**Interfaces:**
- Produces: `Base.astro` with props `{ title: string; description?: string }` wrapping `<slot />` in `<main class="wrap">`; imports fonts + styles; renders `Nav` and `Footer`. `Nav` highlights the current path.

- [ ] **Step 1: Create `src/styles/tokens.css`**

```css
:root{
  --bg:#f7f6f3; --ink:#1c1c1c; --muted:#8a857c; --line:#e4e0d8;
  --accent:#2b8a94; --stripe:#f1efe9;
  --col:700px;
  --font:'Lato','Segoe UI',system-ui,sans-serif;
}
```

- [ ] **Step 2: Create `src/styles/global.css`**

```css
*{box-sizing:border-box}
html,body{margin:0}
body{background:var(--bg);color:var(--ink);font-family:var(--font);font-weight:400;-webkit-font-smoothing:antialiased}
.wrap{max-width:var(--col);margin:0 auto;padding:0 24px}
a{color:var(--accent);text-decoration:none}
.slabel{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);display:block;text-align:center}
.shead{padding:42px 0 6px;border-top:1px solid var(--line)}
h1,h2,h3{font-weight:300;letter-spacing:-.01em}
@media (max-width:720px){
  .wrap{padding:0 18px}
}
```

- [ ] **Step 3: Create `src/components/Nav.astro`**

```astro
---
const { pathname } = Astro.url;
const links = [
  { href: '/', label: 'Bio' },
  { href: '/research', label: 'Research' },
  { href: '/sharing', label: 'Sharing' },
  { href: '/writing', label: 'Writing' },
];
const isOn = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href);
---
<nav class="nav">
  <div class="wrap navin">
    <a class="logo" href="/">KYAW&nbsp;YE&nbsp;THU</a>
    <div class="links">
      {links.map(l => <a href={l.href} class={isOn(l.href) ? 'on' : ''}>{l.label}</a>)}
      <a class="cv" href="/files/kyawyethu-cv.pdf">CV</a>
    </div>
  </div>
</nav>
<style>
  .nav{position:sticky;top:0;z-index:5;background:rgba(247,246,243,.85);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
  .navin{display:flex;justify-content:space-between;align-items:center;padding:16px 24px}
  .logo{font-size:12px;letter-spacing:.2em;font-weight:700;color:var(--ink)}
  .links{display:flex;gap:20px;font-size:11px;letter-spacing:.06em;color:var(--muted);align-items:center}
  .links a{color:var(--muted)} .links a.on{color:var(--ink)}
  .cv{border:1px solid var(--ink);color:var(--ink)!important;padding:5px 13px;border-radius:20px;font-size:10px;letter-spacing:.08em;text-transform:uppercase}
  @media (max-width:720px){ .links{gap:13px} .logo{font-size:11px} }
</style>
```

- [ ] **Step 4: Create `src/components/Footer.astro`**

```astro
---
import siteData from '../data/site.yaml';
---
<footer class="foot wrap">
  <span>© 2026 Kyaw Ye Thu</span>
  <span>{siteData?.email ?? 'kyawyethu@kaist.ac.kr'}</span>
</footer>
<style>
  .foot{padding:40px 24px;border-top:1px solid var(--line);margin-top:22px;display:flex;justify-content:space-between;font-size:10.5px;letter-spacing:.05em;color:var(--muted)}
</style>
```

> Note: `import ... from '*.yaml'` requires the YAML loader added in Task 3. Until then `Footer` uses the fallback; wire the import in Task 3.

- [ ] **Step 5: Create `src/layouts/Base.astro`**

```astro
---
import '@fontsource/lato/300.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import '../styles/tokens.css';
import '../styles/global.css';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
const { title, description } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    <link rel="canonical" href={Astro.url.href} />
  </head>
  <body>
    <Nav />
    <main><slot /></main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 6: Replace `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="Kyaw Ye Thu">
  <div class="wrap"><p style="padding:60px 0">Layout works.</p></div>
</Base>
```

- [ ] **Step 7: Build to verify**

Run: `wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && npm run build'`
Expected: "Complete!"; `dist/index.html` contains `KYAW&nbsp;YE&nbsp;THU` and a `<title>Kyaw Ye Thu</title>`.

- [ ] **Step 8: Commit**

```bash
git add src/styles src/components/Nav.astro src/components/Footer.astro src/layouts/Base.astro src/pages/index.astro
git commit -m "feat: base layout, nav, footer, design tokens"
```

---

## Task 3: YAML data support + site/education/news/experience data

**Files:**
- Modify: `astro.config.mjs` (add YAML import support)
- Create: `src/data/site.yaml`, `src/data/education.yaml`, `src/data/news.yaml`, `src/data/experience.yaml`
- Create: `src/lib/ordering.ts`, `src/lib/ordering.test.ts`

**Interfaces:**
- Produces:
  - `sortNewestFirst<T>(items: T[], key: (t:T)=>string): T[]` — sorts by a parseable date string descending (newest first).
  - `assignTimelineSides<T>(items: T[]): Array<T & { side: 'left'|'right' }>` — first item `right`, then alternating.
  - YAML files importable as JS objects/arrays in `.astro` frontmatter.

- [ ] **Step 1: Add YAML support to `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import yaml from '@rollup/plugin-yaml';

export default defineConfig({
  site: 'https://kyaw-yethu.github.io',
  base: '/',
  vite: { plugins: [yaml()] },
});
```

Run: `wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && npm install -D @rollup/plugin-yaml'`
Expected: package installs.

- [ ] **Step 2: Write failing test `src/lib/ordering.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { sortNewestFirst, assignTimelineSides } from './ordering';

describe('sortNewestFirst', () => {
  it('orders ISO-ish dates newest first', () => {
    const out = sortNewestFirst(
      [{ d: '2024-08-01' }, { d: '2026-01-01' }, { d: '2025-06-01' }],
      x => x.d
    );
    expect(out.map(x => x.d)).toEqual(['2026-01-01', '2025-06-01', '2024-08-01']);
  });
});

describe('assignTimelineSides', () => {
  it('starts right and alternates', () => {
    const out = assignTimelineSides([{ n: 1 }, { n: 2 }, { n: 3 }]);
    expect(out.map(x => x.side)).toEqual(['right', 'left', 'right']);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && npm test'`
Expected: FAIL — cannot find module `./ordering`.

- [ ] **Step 4: Implement `src/lib/ordering.ts`**

```ts
export function sortNewestFirst<T>(items: T[], key: (t: T) => string): T[] {
  return [...items].sort(
    (a, b) => new Date(key(b)).getTime() - new Date(key(a)).getTime()
  );
}

export function assignTimelineSides<T>(items: T[]): Array<T & { side: 'left' | 'right' }> {
  return items.map((item, i) => ({ ...item, side: i % 2 === 0 ? 'right' : 'left' }));
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && npm test'`
Expected: PASS (2 tests).

- [ ] **Step 6: Create `src/data/site.yaml`**

```yaml
name: "Kyaw Ye Thu"
email: "kyawyethu@kaist.ac.kr"
cvUrl: "/files/kyawyethu-cv.pdf"
intro: >-
  Final-year CS undergraduate at [KAIST](https://kaist.ac.kr), working on
  **rendering**, physics-consistent **3D reconstruction**, and **physical AI**
  for agents in 3D space.
note: >-
  Grew up in Myanmar, moved to Korea in 2022. Beyond research I teach, write,
  and photograph — always drawn to *stories worth telling.*
socials:
  - { label: "Scholar", href: "https://scholar.google.com/citations?hl=en&user=fAgaSHsAAAAJ" }
  - { label: "GitHub", href: "https://github.com/kyaw-yethu" }
  - { label: "LinkedIn", href: "#" }
  - { label: "Email", href: "mailto:kyawyethu@kaist.ac.kr" }
```

> Fill the real LinkedIn URL before launch (Task 12 checklist).

- [ ] **Step 7: Create `src/data/education.yaml`**

```yaml
- degree: "BS, Computer Science"
  place: "KAIST, School of Computing · Feb 2027 (expected)"
  detail: "Minor in Business & Technology Management · Semi-minor in Artificial Intelligence"
```

- [ ] **Step 8: Create `src/data/news.yaml`** (newest first)

```yaml
# newest first — add papers, conferences, awards here
- date: "2025-02-01"
  label: "Feb 2025"
  text: "**MixCuBe** received the **Outstanding Paper Award** at the C3NLP workshop, NAACL 2025."
```

- [ ] **Step 9: Create `src/data/experience.yaml`** (newest first)

```yaml
# newest first — research + industry combined
- date: "2026-08-01"
  institution: "KAIST"
  dates: "Aug 2026 – Present"
  role: "Research Intern"
  detail: "GLOW Lab · advised by Prof. Seung-Wook Kim"
- date: "2026-06-01"
  institution: "C&S"
  dates: "Jun – Aug 2026"
  role: "Drone Software Engineer"
  detail: "South Korea"
- date: "2026-01-01"
  institution: "KAIST"
  dates: "Jan – Jun 2026"
  role: "Student Researcher (URP)"
  detail: "SGVR Lab · advised by Prof. Sung-Eui Yoon"
- date: "2025-06-01"
  institution: "Axinvent"
  dates: "Jun – Dec 2025"
  role: "IoT Developer"
  detail: "South Korea"
- date: "2024-08-01"
  institution: "KAIST"
  dates: "Aug 2024 – Feb 2025"
  role: "Research Intern"
  detail: "U&I Lab · advised by Prof. Alice Oh"
```

- [ ] **Step 10: Wire the real YAML import in `Footer.astro`**

Confirm `import siteData from '../data/site.yaml';` resolves (loader now present). Build must still pass.

- [ ] **Step 11: Build + test**

Run: `wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && npm test && npm run build'`
Expected: tests PASS; build "Complete!".

- [ ] **Step 12: Commit**

```bash
git add astro.config.mjs package.json src/data src/lib
git commit -m "feat: yaml data loader, ordering helpers, homepage data"
```

---

## Task 4: Hero + SpaceToWrite + inline-markdown helper

**Files:**
- Create: `src/lib/inline.ts`, `src/lib/inline.test.ts`
- Create: `src/components/Hero.astro`, `src/components/SpaceToWrite.astro`
- Create: `public/images/bio-photo.jpg` (copy from `legacy` source in Task 11; for now copy from existing `images/`)
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces: `renderInline(md: string): string` — converts a minimal subset (`**bold**`, `*italic*`, `[text](url)`) to HTML; escapes other `<`/`>`/`&`. Used for intro/note/news text. `Hero` reads `site.yaml` + `education.yaml`; `SpaceToWrite` reads `site.note`.

- [ ] **Step 1: Copy the portrait into `public/`**

Run: `wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && mkdir -p public/images public/files && cp images/bio-photo.jpg public/images/bio-photo.jpg && cp files/kyawyethu-cv.pdf public/files/kyawyethu-cv.pdf'`
Expected: files copied (no output).

- [ ] **Step 2: Write failing test `src/lib/inline.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { renderInline } from './inline';

describe('renderInline', () => {
  it('renders bold, italic, links', () => {
    expect(renderInline('a **b** c')).toBe('a <strong>b</strong> c');
    expect(renderInline('*x*')).toBe('<em>x</em>');
    expect(renderInline('[K](https://k)')).toBe('<a href="https://k">K</a>');
  });
  it('escapes stray angle brackets', () => {
    expect(renderInline('1 < 2')).toBe('1 &lt; 2');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && npm test'`
Expected: FAIL — cannot find `./inline`.

- [ ] **Step 4: Implement `src/lib/inline.ts`**

```ts
export function renderInline(md: string): string {
  let s = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return s;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && npm test'`
Expected: PASS.

- [ ] **Step 6: Create `src/components/Hero.astro`**

```astro
---
import site from '../data/site.yaml';
import education from '../data/education.yaml';
import { renderInline } from '../lib/inline';
---
<section class="hero">
  <div>
    <h1 class="h1">Kyaw&nbsp;Ye&nbsp;Thu</h1>
    <p class="intro" set:html={renderInline(site.intro)} />
    <div class="contacts">
      {site.socials.map((s) => <a href={s.href}>{s.label}</a>)}
    </div>
    <div class="edu">
      <div class="edulabel">Education</div>
      {education.map((e) => (
        <div class="edurow"><b>{e.degree}</b> · <span>{e.place}</span><br /><span>{e.detail}</span></div>
      ))}
    </div>
  </div>
  <div class="portrait"><img src="/images/bio-photo.jpg" alt="Kyaw Ye Thu" /><span>Daejeon, Korea</span></div>
</section>
<style>
  .hero{display:grid;grid-template-columns:1.4fr 1fr;gap:30px;padding:52px 0 32px;align-items:start}
  .h1{font-size:34px;line-height:1.08;font-weight:300;margin:0 0 18px}
  .intro{font-size:13px;line-height:1.72;color:#3a3a3a}
  .intro :global(a){border-bottom:1px solid rgba(43,138,148,.35)}
  .intro :global(b),.intro :global(strong){font-weight:700}
  .contacts{display:flex;gap:14px;margin-top:18px;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
  .contacts a{color:var(--muted)}
  .edu{margin-top:22px;padding-top:16px;border-top:1px solid var(--line)}
  .edulabel{font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:7px}
  .edurow{font-size:11.5px;line-height:1.5} .edurow b{font-weight:700} .edurow span{color:#6a655c}
  .portrait{position:relative}
  .portrait img{width:100%;height:250px;object-fit:cover;border-radius:6px;display:block}
  .portrait span{position:absolute;bottom:10px;left:12px;font-size:8.5px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.9)}
  @media (max-width:720px){ .hero{grid-template-columns:1fr} .portrait img{height:220px} }
</style>
```

- [ ] **Step 7: Create `src/components/SpaceToWrite.astro`**

```astro
---
import site from '../data/site.yaml';
import { renderInline } from '../lib/inline';
---
<section class="space"><p set:html={renderInline(site.note)} /></section>
<style>
  .space{padding:30px 0}
  .space p{font-size:14px;line-height:1.8;color:#4a463e;font-weight:300;margin:0}
  .space :global(em){color:var(--accent);font-style:normal}
</style>
```

- [ ] **Step 8: Update `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import SpaceToWrite from '../components/SpaceToWrite.astro';
---
<Base title="Kyaw Ye Thu" description="Final-year CS undergraduate at KAIST — computer graphics and physical AI.">
  <div class="wrap">
    <Hero />
    <SpaceToWrite />
  </div>
</Base>
```

- [ ] **Step 9: Build + visual check**

Run: `wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && npm test && npm run build'`
Expected: tests PASS; build "Complete!"; `dist/index.html` contains `Kyaw&nbsp;Ye&nbsp;Thu`, `Education`, and `/images/bio-photo.jpg`.

- [ ] **Step 10: Commit**

```bash
git add src/lib/inline.ts src/lib/inline.test.ts src/components/Hero.astro src/components/SpaceToWrite.astro src/pages/index.astro public/images public/files
git commit -m "feat: hero, space-to-write, inline markdown helper, assets"
```

---

## Task 5: News rail

**Files:**
- Create: `src/components/NewsRail.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `sortNewestFirst` (Task 3), `renderInline` (Task 4), `news.yaml` (items: `{date,label,text}`).
- Produces: a `<section>` with striped rows; newest first; centered hint line.

- [ ] **Step 1: Create `src/components/NewsRail.astro`**

```astro
---
import news from '../data/news.yaml';
import { sortNewestFirst } from '../lib/ordering';
import { renderInline } from '../lib/inline';
const items = sortNewestFirst(news, (n) => n.date);
---
<div class="shead"><span class="slabel">News</span></div>
<section class="news">
  {items.map((n) => (
    <div class="ev">
      <div class="date">{n.label}</div>
      <div class="text" set:html={renderInline(n.text)} />
    </div>
  ))}
</section>
<div class="hint">— reserved for papers, conferences, awards —</div>
<style>
  .news{max-width:560px;margin:20px auto 6px}
  .ev{display:grid;grid-template-columns:96px 1fr;gap:16px;padding:13px 16px;align-items:start;border-radius:8px}
  .ev:nth-child(odd){background:var(--stripe)}
  .date{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);font-weight:700;padding-top:2px;text-align:right}
  .text{font-size:12.5px;line-height:1.55;color:#2e2b26}
  .text :global(strong){font-weight:700}
  .hint{font-size:10.5px;color:#b3ada2;text-align:center;margin-top:8px;font-style:italic}
  @media (max-width:720px){ .ev{grid-template-columns:70px 1fr;gap:10px} }
</style>
```

- [ ] **Step 2: Add `<NewsRail />` to `index.astro`** (after `SpaceToWrite`)

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import SpaceToWrite from '../components/SpaceToWrite.astro';
import NewsRail from '../components/NewsRail.astro';
---
<Base title="Kyaw Ye Thu" description="Final-year CS undergraduate at KAIST — computer graphics and physical AI.">
  <div class="wrap">
    <Hero />
    <SpaceToWrite />
    <NewsRail />
  </div>
</Base>
```

- [ ] **Step 3: Build + check**

Run: `wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && npm run build'`
Expected: "Complete!"; `dist/index.html` shows "May 2025" before "Mar 2025".

- [ ] **Step 4: Commit**

```bash
git add src/components/NewsRail.astro src/pages/index.astro
git commit -m "feat: homepage news rail"
```

---

## Task 6: Content collections + migrate publications/research

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/publications/mixcube.md`, `src/content/research/renderformer.md`, `src/content/research/dynamic-brain.md`
- Test: `src/content/config.ts` validated via `astro check`

**Interfaces:**
- Produces collections:
  - `publications`: `{ title, authors, date(Date), venue, excerpt, links?: {label,href}[], featured?: boolean }`
  - `research`: `{ title, date(Date), excerpt, links?: {label,href}[], featured?: boolean }`
  - `writing`: `{ title, date(Date), excerpt? }` (Task 10)
  - `sharing`: `{ title, kind: 'teaching'|'talk', date(Date), host?, href? }` (Task 9)

- [ ] **Step 1: Create `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

const link = z.object({ label: z.string(), href: z.string() });

const publications = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    authors: z.string(),
    date: z.coerce.date(),
    venue: z.string(),
    excerpt: z.string(),
    links: z.array(link).optional(),
    featured: z.boolean().default(false),
  }),
});

const research = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    links: z.array(link).optional(),
    featured: z.boolean().default(false),
  }),
});

const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string().optional(),
  }),
});

const sharing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    kind: z.enum(['teaching', 'talk']),
    date: z.coerce.date(),
    host: z.string().optional(),
    href: z.string().optional(),
  }),
});

export const collections = { publications, research, writing, sharing };
```

- [ ] **Step 2: Create `src/content/publications/mixcube.md`**

```md
---
title: "When Tom Eats Kimchi: Evaluating Cultural Bias of Multimodal Large Language Models in Cultural Mixture Contexts"
authors: "Jun Seong Kim*, **Kyaw Ye Thu***, Javad Ismayilzada, Junyeong Park, Eunsu Kim, Huzama Ahmad, Na Min An, James Thorne, Alice Oh"
date: 2025-02-01
venue: "C3NLP Workshop @ NAACL 2025 · Outstanding Paper Award"
excerpt: "MixCuBe — a cross-cultural VQA benchmark built via a novel image-augmentation pipeline, used to evaluate the cultural bias of SOTA multimodal LLMs in mixed-cultural settings."
featured: true
links:
  - { label: "arXiv", href: "https://arxiv.org/abs/2503.16826" }
  - { label: "Award", href: "https://drive.google.com/file/d/1Gat0qzlafEvTtvGqp5_1MfdsS9PyOE91/view" }
---

Full abstract and details go here (migrate body from `legacy/_publications`).
```

- [ ] **Step 3: Create `src/content/research/renderformer.md`**

```md
---
title: "RenderFormer with Linear Attention"
date: 2025-01-01
excerpt: "Bringing a transformer-based rendering pipeline (Microsoft's RenderFormer) from O(N²) to linear time complexity via Performer (FAVOR++) attention."
featured: true
links:
  - { label: "GitHub", href: "https://github.com/kyaw-yethu/renderformer" }
  - { label: "Slides", href: "https://docs.google.com/presentation/d/1I7wcdrXZ9zz2HwnHLaQPYCvSGV0oPWOd7iFZ3wE5N0w/edit" }
---

Details (migrate from `legacy/_researchProjects/4-project-renderformer.md`).
```

- [ ] **Step 4: Create `src/content/research/dynamic-brain.md`**

```md
---
title: "Dynamic Brain Connectome Learning"
date: 2024-06-01
excerpt: "A novel graph-ML architecture learning temporal and spatial patterns of brain activation from fMRI images, with two downstream tasks: brain-activation link prediction during language tasks, and performance prediction from neural patterns (graph regression)."
featured: false
links:
  - { label: "GitHub", href: "https://github.com/kyaw-yethu" }
  - { label: "Poster", href: "#" }
---

Details (migrate body from `legacy/_researchProjects/3-dynamicbrain.md`; set the real GitHub/Poster URLs).
```

> Research projects come from the resume's Highlighted Projects: **Linear RenderFormer** (Step 3) and **Dynamic Brain Connectome** (this step). The legacy "passage retrieval" project is not in the resume — omit it unless the user asks to keep it.

- [ ] **Step 5: Validate schemas**

Run: `wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && npm run check'`
Expected: no content-collection errors.

- [ ] **Step 6: Commit**

```bash
git add src/content
git commit -m "feat: content collections + migrate publications and research"
```

---

## Task 7: Selected Research (homepage) + Research page

**Files:**
- Create: `src/components/ResearchItem.astro`, `src/components/ResearchList.astro`
- Create: `src/pages/research.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `publications`, `research` collections; `sortNewestFirst`.
- Produces: `ResearchItem` props `{ badge:string, title:string, excerpt:string, links?:{label,href}[], authors?:string }`. `ResearchList` renders a titled section given items. Homepage shows only `featured` items under "Selected Research" with an "All research →" link.

- [ ] **Step 1: Create `src/components/ResearchItem.astro`**

```astro
---
const { badge, title, excerpt, links = [], authors } = Astro.props;
import { renderInline } from '../lib/inline';
---
<div class="item">
  <div class="badge">{badge}</div>
  <div class="h">{title}</div>
  {authors && <div class="authors" set:html={renderInline(authors)} />}
  <div class="p">{excerpt}</div>
  {links.length > 0 && (
    <div class="links">{links.map((l, i) => (<>{i > 0 && ' · '}<a href={l.href}>{l.label}</a></>))}</div>
  )}
</div>
<style>
  .item{padding:16px 0;border-bottom:1px solid var(--line)}
  .badge{font-size:9.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--accent);font-weight:700}
  .h{font-size:15.5px;font-weight:700;line-height:1.3;margin:5px 0 5px}
  .authors{font-size:11px;color:#6a655c;margin-bottom:5px}
  .authors :global(strong){color:var(--ink)}
  .p{font-size:12px;line-height:1.55;color:#5a564e}
  .links{font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-top:7px}
</style>
```

- [ ] **Step 2: Create `src/components/ResearchList.astro`**

```astro
---
import ResearchItem from './ResearchItem.astro';
const { label, items } = Astro.props;
---
<div class="shead"><span class="slabel">{label}</span></div>
<section>
  {items.map((it) => <ResearchItem {...it} />)}
</section>
```

- [ ] **Step 3: Add Selected Research to `index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import SpaceToWrite from '../components/SpaceToWrite.astro';
import NewsRail from '../components/NewsRail.astro';
import ResearchItem from '../components/ResearchItem.astro';
import { getCollection } from 'astro:content';
import { sortNewestFirst } from '../lib/ordering';

const pubs = await getCollection('publications');
const proj = await getCollection('research');
const featured = sortNewestFirst(
  [
    ...pubs.filter(p => p.data.featured).map(p => ({
      badge: `Publication · ${p.data.venue}`, title: p.data.title,
      excerpt: p.data.excerpt, links: p.data.links ?? [], date: p.data.date.toISOString(),
    })),
    ...proj.filter(p => p.data.featured).map(p => ({
      badge: 'Research Project', title: p.data.title,
      excerpt: p.data.excerpt, links: p.data.links ?? [], date: p.data.date.toISOString(),
    })),
  ],
  x => x.date
);
---
<Base title="Kyaw Ye Thu" description="Final-year CS undergraduate at KAIST — computer graphics and physical AI.">
  <div class="wrap">
    <Hero />
    <SpaceToWrite />
    <NewsRail />
    <div class="shead"><span class="slabel">Selected Research</span></div>
    <section>
      {featured.map((it) => <ResearchItem {...it} />)}
    </section>
    <p style="text-align:center;margin:14px 0 0"><a href="/research" style="font-size:11px;letter-spacing:.07em;text-transform:uppercase">All research →</a></p>
  </div>
</Base>
```

> Experience timeline is added in Task 8 (after this section).

- [ ] **Step 4: Create `src/pages/research.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import ResearchList from '../components/ResearchList.astro';
import { getCollection } from 'astro:content';
import { sortNewestFirst } from '../lib/ordering';

const pubs = sortNewestFirst(await getCollection('publications'), p => p.data.date.toISOString())
  .map(p => ({ badge: `Publication · ${p.data.venue}`, title: p.data.title, authors: p.data.authors, excerpt: p.data.excerpt, links: p.data.links ?? [] }));
const proj = sortNewestFirst(await getCollection('research'), p => p.data.date.toISOString())
  .map(p => ({ badge: 'Research Project', title: p.data.title, excerpt: p.data.excerpt, links: p.data.links ?? [] }));
---
<Base title="Research — Kyaw Ye Thu">
  <div class="wrap">
    <h1 style="font-size:30px;padding:52px 0 0">Research</h1>
    <ResearchList label="Publications" items={pubs} />
    <ResearchList label="Research Projects" items={proj} />
  </div>
</Base>
```

- [ ] **Step 5: Build + check**

Run: `wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && npm run build'`
Expected: "Complete!"; `dist/research/index.html` exists and contains "Publications" and "Research Projects"; `dist/index.html` contains "Selected Research" and "All research".

- [ ] **Step 6: Commit**

```bash
git add src/components/ResearchItem.astro src/components/ResearchList.astro src/pages/research.astro src/pages/index.astro
git commit -m "feat: selected research on home + research page"
```

---

## Task 8: Experience timeline

**Files:**
- Create: `src/components/ExperienceTimeline.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `experience.yaml`, `sortNewestFirst`, `assignTimelineSides`.
- Produces: center-spine alternating timeline; collapses to single left-rail ≤720px.

- [ ] **Step 1: Create `src/components/ExperienceTimeline.astro`**

```astro
---
import experience from '../data/experience.yaml';
import { sortNewestFirst, assignTimelineSides } from '../lib/ordering';
const items = assignTimelineSides(sortNewestFirst(experience, (e) => e.date));
---
<div class="shead"><span class="slabel">Experience</span></div>
<div class="tl">
  {items.map((e) => (
    <div class:list={["tl-item", e.side]}>
      <div class="tl-node"></div>
      <div class="tl-c">
        <div class="tl-head">
          {e.side === 'left'
            ? (<><span class="tl-date">{e.dates}</span><span class="tl-inst">{e.institution}</span></>)
            : (<><span class="tl-inst">{e.institution}</span><span class="tl-date">{e.dates}</span></>)}
        </div>
        <div class="tl-role"><b>{e.role}</b><br /><span>{e.detail}</span></div>
      </div>
    </div>
  ))}
</div>
<style>
  .tl{position:relative;margin:28px 0 10px;padding:6px 0}
  .tl:before{content:"";position:absolute;left:50%;top:0;bottom:0;width:2px;background:#cfc9bf;transform:translateX(-1px)}
  .tl-item{position:relative;padding:13px 0;min-height:50px}
  .tl-node{position:absolute;left:50%;top:17px;width:14px;height:14px;border-radius:50%;background:#fff;border:3px solid var(--accent);transform:translateX(-50%);z-index:2}
  .tl-c{width:50%}
  .tl-item.right .tl-c{margin-left:50%;padding-left:32px;text-align:left}
  .tl-item.left .tl-c{margin-right:50%;padding-right:32px;text-align:right}
  .tl-head{display:flex;align-items:center;gap:8px;margin-bottom:7px}
  .tl-item.left .tl-head{justify-content:flex-end}
  .tl-inst{font-size:13.5px;font-weight:700;background:#fff;border:1px solid var(--line);padding:3px 10px;border-radius:6px;box-shadow:0 2px 6px rgba(0,0,0,.05)}
  .tl-date{font-size:10px;color:var(--accent);font-weight:700;white-space:nowrap}
  .tl-role b{font-size:12px;font-weight:700} .tl-role span{font-size:11.5px;color:#6a655c}
  @media (max-width:720px){
    .tl:before{left:6px}
    .tl-node{left:6px}
    .tl-item.left .tl-c,.tl-item.right .tl-c{width:auto;margin:0;padding-left:28px;padding-right:0;text-align:left}
    .tl-item.left .tl-head{justify-content:flex-start}
    .tl-item.left .tl-head{flex-direction:row-reverse;justify-content:flex-end}
  }
</style>
```

- [ ] **Step 2: Add `<ExperienceTimeline />` to `index.astro`** (after the Selected Research block / "All research" link)

Add the import `import ExperienceTimeline from '../components/ExperienceTimeline.astro';` and place `<ExperienceTimeline />` as the last child inside `.wrap`.

- [ ] **Step 3: Build + check**

Run: `wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && npm run build'`
Expected: "Complete!"; `dist/index.html` shows the three institutions in order KAIST → Axinvent → KAIST, first item side `right`.

- [ ] **Step 4: Commit**

```bash
git add src/components/ExperienceTimeline.astro src/pages/index.astro
git commit -m "feat: homepage experience timeline"
```

---

## Task 9: Sharing page + migrate teaching/talks

**Files:**
- Create: `src/content/sharing/*.md` (1 teaching + 5 talks migrated)
- Create: `src/components/SharingList.astro`, `src/pages/sharing.astro`

**Interfaces:**
- Consumes: `sharing` collection (Task 6 schema), `sortNewestFirst`.
- Produces: two sections (Teaching, Talks); each a simple list of `{title, host, date, href}`.

- [ ] **Step 1: Migrate sharing entries**

For each file in `legacy/_teaching/` (1) and `legacy/_talks/` (5), create `src/content/sharing/<slug>.md` with front-matter:

```md
---
title: "AI for Teenagers"
kind: "teaching"
date: 2023-06-01
host: "Thate Pan Hub"
href: ""
---
```

Set `kind: "talk"` for talks. Infer `date` from the legacy file's date field or filename; if unknown, use a reasonable placeholder date and flag it in the Task 12 checklist.

- [ ] **Step 2: Create `src/components/SharingList.astro`**

```astro
---
const { label, items } = Astro.props;
---
<div class="shead"><span class="slabel">{label}</span></div>
<section>
  {items.map((it) => (
    <div class="row">
      <div class="rmeta">{it.date}{it.host ? ` · ${it.host}` : ''}</div>
      <div class="rtitle">{it.href ? <a href={it.href}>{it.title}</a> : it.title}</div>
    </div>
  ))}
</section>
<style>
  .row{padding:14px 0;border-bottom:1px solid var(--line)}
  .rmeta{font-size:10.5px;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin-bottom:4px}
  .rtitle{font-size:14px;font-weight:700}
</style>
```

- [ ] **Step 3: Create `src/pages/sharing.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import SharingList from '../components/SharingList.astro';
import { getCollection } from 'astro:content';
import { sortNewestFirst } from '../lib/ordering';

const all = await getCollection('sharing');
const fmt = (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
const pick = (kind) => sortNewestFirst(all.filter(s => s.data.kind === kind), s => s.data.date.toISOString())
  .map(s => ({ title: s.data.title, host: s.data.host, href: s.data.href, date: fmt(s.data.date) }));
---
<Base title="Sharing — Kyaw Ye Thu">
  <div class="wrap">
    <h1 style="font-size:30px;padding:52px 0 0">Sharing</h1>
    <SharingList label="Teaching" items={pick('teaching')} />
    <SharingList label="Talks" items={pick('talk')} />
  </div>
</Base>
```

- [ ] **Step 4: Build + check**

Run: `wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && npm run build'`
Expected: "Complete!"; `dist/sharing/index.html` contains "Teaching" and "Talks".

- [ ] **Step 5: Commit**

```bash
git add src/content/sharing src/components/SharingList.astro src/pages/sharing.astro
git commit -m "feat: sharing page + migrate teaching and talks"
```

---

## Task 10: Writing index + post pages

**Files:**
- Create: `src/content/writing/*.md` (migrated from `legacy/_posts` + `legacy/_essays`)
- Create: `src/layouts/Post.astro`, `src/pages/writing/index.astro`, `src/pages/writing/[...slug].astro`

**Interfaces:**
- Consumes: `writing` collection (Task 6 schema), `sortNewestFirst`.
- Produces: `/writing` index (date + title + excerpt, newest first) and `/writing/<slug>` article pages.

- [ ] **Step 1: Migrate writing entries**

For each real post in `legacy/_posts/` and `legacy/_essays/`, create `src/content/writing/<slug>.md`:

```md
---
title: "Post title"
date: 2025-01-01
excerpt: "One-line summary."
---

Body in Markdown.
```

> The current Jekyll files are placeholder demo posts (`blog-post-1..3`). Migrate any real ones; for demo placeholders, create a single starter post so the page renders, and note in Task 12 that real content is pending.

- [ ] **Step 2: Create `src/layouts/Post.astro`**

```astro
---
import Base from './Base.astro';
const { title, date } = Astro.props;
---
<Base title={`${title} — Kyaw Ye Thu`}>
  <article class="wrap post">
    <h1>{title}</h1>
    <div class="date">{date}</div>
    <div class="body"><slot /></div>
  </article>
</Base>
<style>
  .post{padding:52px 0}
  .post h1{font-size:30px;margin:0 0 8px}
  .date{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:26px}
  .body{font-size:15px;line-height:1.8;color:#2e2b26}
  .body :global(h2){font-size:20px;margin:28px 0 8px}
  .body :global(p){margin:0 0 16px}
  .body :global(img){max-width:100%;border-radius:6px}
</style>
```

- [ ] **Step 3: Create `src/pages/writing/index.astro`**

```astro
---
import Base from '../../layouts/Base.astro';
import { getCollection } from 'astro:content';
import { sortNewestFirst } from '../../lib/ordering';
const posts = sortNewestFirst(await getCollection('writing'), p => p.data.date.toISOString());
const fmt = (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
---
<Base title="Writing — Kyaw Ye Thu">
  <div class="wrap">
    <h1 style="font-size:30px;padding:52px 0 0">Writing</h1>
    <section style="margin-top:20px">
      {posts.map((p) => (
        <a class="post-row" href={`/writing/${p.slug}`}>
          <div class="pr-date">{fmt(p.data.date)}</div>
          <div class="pr-title">{p.data.title}</div>
          {p.data.excerpt && <div class="pr-ex">{p.data.excerpt}</div>}
        </a>
      ))}
    </section>
  </div>
</Base>
<style>
  .post-row{display:block;padding:18px 0;border-bottom:1px solid var(--line);color:var(--ink)}
  .pr-date{font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
  .pr-title{font-size:17px;font-weight:700;margin:4px 0}
  .pr-ex{font-size:12.5px;color:#5a564e}
</style>
```

- [ ] **Step 4: Create `src/pages/writing/[...slug].astro`**

```astro
---
import { getCollection } from 'astro:content';
import Post from '../../layouts/Post.astro';
export async function getStaticPaths() {
  const posts = await getCollection('writing');
  return posts.map((p) => ({ params: { slug: p.slug }, props: { post: p } }));
}
const { post } = Astro.props;
const { Content } = await post.render();
const fmt = (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
---
<Post title={post.data.title} date={fmt(post.data.date)}>
  <Content />
</Post>
```

- [ ] **Step 5: Build + check**

Run: `wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && npm run build'`
Expected: "Complete!"; `dist/writing/index.html` exists; at least one `dist/writing/<slug>/index.html` generated.

- [ ] **Step 6: Commit**

```bash
git add src/content/writing src/layouts/Post.astro src/pages/writing
git commit -m "feat: writing index and post pages"
```

---

## Task 11: Move Jekyll to legacy/ + reconcile assets

**Files:**
- Move: Jekyll source dirs/files → `legacy/`
- Verify: `public/` has all assets the new site references

**Interfaces:**
- Produces: a repo whose root is the Astro project; old Jekyll files preserved under `legacy/` and excluded from the build (`tsconfig` already excludes it; Astro only builds `src/` + `public/`).

- [ ] **Step 1: Move Jekyll files into `legacy/`**

Run:
```bash
wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && mkdir -p legacy && git mv _config.yml _config_docker.yml Gemfile Dockerfile docker-compose.yaml _data _drafts _engineeringProjects _essays _includes _layouts _pages _posts _publications _researchProjects _sass _talks _teaching markdown_generator talkmap talkmap.ipynb talkmap.py vendor .bundle assets images files legacy/ 2>&1 | tail -5; echo done'
```
Expected: files moved; `done` printed. (If any path is missing, drop it from the list.)

> `vendor .bundle assets` MUST be moved (or removed): `astro check` scans the
> leftover Jekyll `vendor/` Ruby bundle and reports ~16 errors in vendor JS,
> which fails the CI `npm run check` gate (Task 12). `images/` and `files/`
> are moved too because the assets the Astro site needs were already copied
> into `public/` (Task 4). `tsconfig.json` already excludes `legacy/`.

- [ ] **Step 2: Remove stale build/theme dirs no longer used**

Run: `wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && git rm -r --quiet _site .sass-cache 2>/dev/null; rm -rf _site .sass-cache; echo done'`
Expected: `done`.

- [ ] **Step 3: Confirm assets present**

Run: `wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && ls public/images/bio-photo.jpg public/files/kyawyethu-cv.pdf'`
Expected: both paths listed.

- [ ] **Step 4: Full build from clean tree**

Run: `wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && rm -rf dist && npm run build'`
Expected: "Complete!"; `dist/` contains `index.html`, `research/`, `sharing/`, `writing/`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: move Jekyll site to legacy/, Astro at repo root"
```

---

## Task 12: GitHub Actions deploy + launch checklist

**Files:**
- Create: `.github/workflows/deploy.yml`
- Verify: end-to-end

**Interfaces:**
- Produces: CI that builds Astro and deploys to GitHub Pages on push to `master`.

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [master]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Generate `package-lock.json`** (required by `npm ci`)

Run: `wsl -e bash -lic 'cd /home/kyawgyi/projects/kyaw-yethu.github.io && npm install && git add package-lock.json'`
Expected: lockfile created/updated. (It is currently git-ignored — remove the `package-lock.json` line from `.gitignore` so CI can use it.)

- [ ] **Step 3: Un-ignore the lockfile**

Edit `.gitignore`: delete the `package-lock.json` line. `git add .gitignore package-lock.json`.

- [ ] **Step 4a: Add ambient YAML module declaration** (so `astro check` resolves `import x from '*.yaml'`)

Create `src/yaml.d.ts`:

```ts
declare module '*.yaml' {
  const value: any;
  export default value;
}
```

- [ ] **Step 4: Run the launch checklist (fix each)**

- [ ] `npm run check` passes (no TS/content errors — after Step 4a and after Task 11 removed `vendor/`).
- [ ] `npm test` passes.
- [ ] Real **LinkedIn URL** set in `src/data/site.yaml`.
- [ ] Any **placeholder dates** in `sharing`/`writing` replaced with real ones.
- [ ] Real writing content migrated (or a deliberate starter post kept).
- [ ] Spot-check `dist/` pages in `npm run preview` at mobile width (≤720px): nav wraps, hero stacks, timeline collapses to left rail.

- [ ] **Step 5: Commit the workflow**

```bash
git add .github/workflows/deploy.yml .gitignore package-lock.json
git commit -m "ci: build and deploy Astro to GitHub Pages"
```

- [ ] **Step 6: Merge & enable Pages (manual, user-run)**

1. Merge `portfolio-overhaul` → `master` (PR or fast-forward).
2. In GitHub repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `master`; watch the Actions run; verify https://kyaw-yethu.github.io.

> Deploying to the live site is user-initiated (Global Constraints: push only when the user asks). Do not push to `master` without explicit go-ahead.

---

## Self-Review

**Spec coverage:**
- Gallery White palette/type/column → Task 2 tokens/global ✓
- Bio homepage sections (hero+edu, space, news, selected research, experience) → Tasks 4,5,7,8 ✓
- News newest-first + reserved hint → Task 5 ✓
- Experience center-spine, newest-first, mobile collapse → Task 8 ✓
- Research page (pubs + research projects; eng dropped) → Tasks 6,7 ✓
- Sharing (teaching+talks) → Task 9 ✓
- Writing index + post → Task 10 ✓
- CV external link → Nav (Task 2) ✓
- YAML-data + Markdown editing workflow → Tasks 3,6 (matches spec §6) ✓
- Astro + GitHub Actions + self-hosted Lato → Tasks 1,2,12 ✓
- Migration map incl. legacy/ move → Task 11 ✓
- Responsive → Tasks 2,5,8 + Task 12 checklist ✓

**Placeholder scan:** Migration steps (Tasks 6/9/10) intentionally reference reading legacy front-matter; each gives the exact target schema and an example, so no blind "TBD". Unknown legacy dates are surfaced in the Task 12 checklist rather than hidden.

**Type consistency:** `sortNewestFirst(items, key)` and `assignTimelineSides(items)` used consistently (Tasks 3,5,7,8,9,10). `renderInline` signature stable (Tasks 4,5,7). Collection field names (`venue`,`authors`,`excerpt`,`links`,`featured`,`kind`,`host`,`href`) match between `config.ts` (Task 6) and every consumer.
