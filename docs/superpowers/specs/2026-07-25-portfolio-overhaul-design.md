# Portfolio Overhaul — Design Spec

**Date:** 2026-07-25
**Owner:** Kyaw Ye Thu (`cns@cns.ai.kr`)
**Site:** https://kyaw-yethu.github.io
**Repo:** `kyaw-yethu/kyaw-yethu.github.io` (branch `master`)

---

## 1. Goal & Audience

Overhaul the existing AcademicPages (Jekyll) portfolio into a distinctive,
modern site. Primary audience: **graduate-school / research** (admissions
committees, professors). Secondary: **personal branding** — a blog, career
news, and (later) a photography presence.

The visual language is deliberately chosen so a **future separate photography
website can inherit it** — same palette, type, and "gallery" sensibility.

## 2. Aesthetic Direction — "Gallery White"

Airy, premium, calm. Imagery carries visual interest; the UI stays quiet.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#f7f6f3` | page background (warm off-white) |
| `--ink` | `#1c1c1c` | primary text |
| `--muted` | `#8a857c` | labels, secondary text, dates |
| `--line` | `#e4e0d8` | hairline dividers, borders |
| `--accent` | `#2b8a94` (muted teal) | links, timeline nodes, small labels |
| stripe | `#f1efe9` | alternating News row background |

- **Typeface:** **Lato** — Light (300) for headings, Regular (400) body,
  Bold (700) emphasis. Self-hosted via `@fontsource/lato` (no runtime
  dependency on Google Fonts). Fallback: `"Segoe UI", system-ui, sans-serif`.
- **Layout:** centered content column, `max-width: 700px`, generous side
  margins. Sticky translucent (blurred) top nav.
- **Density:** small type, restrained. Hairline `--line` dividers separate
  sections; each section has a small centered uppercase label.
- **Theme:** light only (Gallery White). Dark mode is out of scope for v1.

## 3. Information Architecture

**Nav:** `Bio · Research · Sharing · Writing · [CV]`

The **Bio page is the homepage** (`/`). CV is an external link to the PDF.
There is **no Album page** in v1 (photography lives on a future separate site),
though the aesthetic keeps room for it.

**Explicitly dropped:** Engineering projects — removed entirely from the site.

### 3.1 Homepage (`/`) — LOCKED

Vertical order, in the centered column:

1. **Sticky nav** — `KYAW YE THU` wordmark left; `Bio · Research · Sharing ·
   Writing` + a pill-outlined `CV` button right.
2. **Hero** (2-col: text ~1.4fr / portrait ~1fr):
   - `Kyaw Ye Thu` — H1, Lato Light 300, ~34px, name leads (no kicker above).
   - One short intro sentence: final-year CS @ KAIST; rendering,
     physics-consistent 3D reconstruction, physical AI. Inline teal links.
   - Contacts row: Scholar · GitHub · LinkedIn · Email (small uppercase).
   - **Education** block under a hairline divider: BS Computer Science, KAIST,
     2027 (expected); minor in Business & Technology Management.
   - **Portrait** image on the right (warm-toned).
3. **"Space to write"** — a small open prose block (light 300) for a personal
   note (e.g. Myanmar → Korea 2022; teaches, writes, photographs).
4. **News** — striped card-rail, **distinct** from the Experience timeline.
   Each row: right-aligned date (teal, small caps) + text. Alternating rows
   use the `#f1efe9` stripe. **Newest at top → oldest at bottom.** An italic
   muted hint reads "reserved for papers, conferences, awards." Reserved for
   genuine events: paper accepted, conference presented, award.
5. **Selected Research** — text-only list (no thumbnails). Each item: small
   teal badge (`Publication · VENUE` or `Research Project`), bold title,
   one-line description, teal links (arXiv / Award / GitHub / Slides).
   Section footer link "All research →" to `/research`.
6. **Experience** — **center-spine alternating timeline** (per reference
   image). Center vertical rail; hollow teal-ringed nodes; entries alternate
   left/right. Each entry: institution pill (white, subtle shadow) + date
   range (teal), then bold role + muted lab/advisor line. **Newest at top →
   oldest at bottom** (same direction as News).
7. **Footer** — © 2026 Kyaw Ye Thu · email. Hairline top border.

> Note: **News** and **Experience** are visually different on purpose — News =
> horizontal striped rail; Experience = vertical center spine.

### 3.2 Research (`/research`)

Single page, two stacked sections sharing the homepage type/column:

- **Publications** — full list. Each: title, full author list (own name
  bolded, `*` equal-contribution preserved), venue + date, abstract/excerpt,
  links (arXiv, PDF, Award, Code, Slides as available).
- **Research Projects** — full list. Each: title, excerpt, links
  (GitHub, Slides). Optional teaser image per project (kept subtle).

Migrated from `_publications/` (2 items) and `_researchProjects/` (3 items;
engineering projects excluded).

### 3.3 Sharing (`/sharing`)

Two stacked sections: **Teaching** and **Talks**. Simple list layout
(title, venue/host, date, optional link). Migrated from `_teaching/` (1) and
`_talks/` (5).

### 3.4 Writing (`/writing`)

- **Index:** list of posts — date + title + short excerpt, newest first.
- **Post page:** article layout — centered prose column, Lato body, teal
  links, generous line-height. Supports headings, images, code.
- Consolidates existing `_posts/` and `_essays/`. Career "news" stays on the
  homepage timeline; longer-form writing lives here.

### 3.5 CV

External nav link opening the PDF (`/files/kyawyethu-cv.pdf`). No dedicated
page in v1.

## 4. Responsive Behavior

- **≤ ~720px (mobile/tablet):**
  - Hero stacks: portrait above or below the text.
  - Nav collapses to a hamburger / simple menu.
  - **Experience timeline** collapses from center-spine to a **single
    left-rail** layout (all entries left-aligned, nodes on a left line) —
    alternating sides don't work on narrow screens.
  - News rows: date stacks above text if needed.
- Column gains horizontal padding so text never touches the edge.

## 5. Tech Stack & Structure

- **Framework:** **Astro** (static output). Component-based; excellent for
  content collections + Markdown; ships minimal JS.
- **Fonts:** `@fontsource/lato` (self-hosted, weights 300/400/700).
- **Hosting:** GitHub Pages, same repo, via a GitHub Actions workflow that
  builds Astro and deploys `dist/`. (Replaces the current Jekyll Pages build.)
- **Deploy note:** because the site is a **project/user page at the domain
  root** (`kyaw-yethu.github.io`), Astro `base` stays `/` and `site` is set to
  the full URL for correct canonical/OG links.

Proposed project layout:

```
src/
  pages/
    index.astro          # Bio (homepage)
    research.astro
    sharing.astro
    writing/index.astro  # blog index
    writing/[...slug].astro
  layouts/
    Base.astro           # nav + footer + <head>, shared column
    Post.astro           # article layout for writing
  components/
    Nav.astro  Hero.astro  NewsRail.astro
    ExperienceTimeline.astro  ResearchList.astro  Footer.astro
  content/
    publications/*.md    # migrated from _publications
    research/*.md         # migrated from _researchProjects
    writing/*.md          # migrated from _posts + _essays
    sharing/*.md          # migrated from _teaching + _talks
  data/
    news.yaml            # homepage News entries
    experience.yaml      # homepage Experience timeline
    education.yaml       # homepage Education block
    site.yaml            # name, tagline, socials, email, CV link
  styles/
    tokens.css           # the color/type tokens above
public/
  files/kyawyethu-cv.pdf
  images/…               # portrait, teasers
```

## 6. Content-Editing Workflow (how you change things later)

This directly answers "if I later want to change the contents, how do I
manually do that?"

- **News / Experience / Education / socials** → edit the small **YAML data
  files** in `src/data/`. One block per entry. Example — add a news item:

  ```yaml
  # src/data/news.yaml  (newest first)
  - date: "Aug 2026"
    text: "New paper accepted at **SIGGRAPH Asia 2026**."
  ```

  Example — add an experience entry:

  ```yaml
  # src/data/experience.yaml  (newest first)
  - institution: "KAIST"
    dates: "Jan 2026 – Present"
    role: "Student Researcher"
    detail: "SGVR Lab · advised by Prof. Sungeui Yoon"
  ```

- **Publications / Research / Writing / Sharing** → add or edit a **Markdown
  file** in the matching `src/content/` folder. Front-matter at the top
  (title, date, venue, links), prose below — same mental model as the current
  Jekyll `.md` files.

- **How to publish an edit:** edit the file on **GitHub in the browser**
  (or locally), commit. The Actions workflow rebuilds and redeploys in ~1 min.
  No design tools, no build knowledge required for routine content changes.

## 7. Migration Map

| Existing (Jekyll) | New (Astro) |
|---|---|
| `_pages/about.md` (home) | `src/pages/index.astro` + `data/*.yaml` |
| `_publications/*` (2) | `src/content/publications/*` |
| `_researchProjects/*` (3) | `src/content/research/*` |
| `_engineeringProjects/*` (4) | **dropped** |
| `_posts/*` + `_essays/*` | `src/content/writing/*` |
| `_teaching/*` + `_talks/*` | `src/content/sharing/*` |
| `files/kyawyethu-cv.pdf` | `public/files/kyawyethu-cv.pdf` |
| `images/*` | `public/images/*` |

The old Jekyll files remain in git history; the new build replaces the
served site. (Decision for the plan: keep old files in a `legacy/` folder
during transition, or remove once parity is confirmed.)

## 8. Out of Scope (v1)

- Album / photography page (separate future site).
- Dark mode.
- Engineering projects.
- CMS / admin UI (editing is via data files + Markdown).

## 9. Open Items to Resolve in Planning

1. Confirm **Lato** is the exact font in the reference (high confidence, but
   verify against `@fontsource/lato`).
2. Portrait photo source (reuse `images/bio-photo.jpg` or a new one).
3. Whether to keep old Jekyll files in `legacy/` or remove after parity.
4. Exact News seed entries (real papers/talks vs. the sample used in mockups).
