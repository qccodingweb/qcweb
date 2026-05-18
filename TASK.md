# QCWEB — Work Handoff

Static marketing site for **Quadra Code FZCO** (Dubai). Hosted on GitHub Pages:
`https://qccodingweb.github.io/qcweb/`. No build step; plain HTML/CSS/JS.
Pages: `index.html`, `about.html`, `services.html`, `contact.html`.

## How to run / verify locally
```bash
cd qcweb
python3 -m http.server 8732
# open http://localhost:8732/index.html
```
Verification so far used a local Playwright MCP browser driving `window._lenis.scrollTo(...)`
and measuring `getComputedStyle(el).opacity` on `.reveal` elements. In a Cowork/remote VM
the local server + local Playwright are NOT available — use the environment's own browser
tools or manual checks instead.

## STATUS

### ✅ P1 — Reveal race-condition — DONE & VERIFIED (this commit)
**Bug:** On `about/services/contact` (pages.js), content uses `.reveal` (CSS
`opacity:0`, see `css/pages.css:535`). Old code revealed via
`ScrollTrigger.batch('.reveal',{once:true})`. `batch` uses IntersectionObserver and
**permanently skips elements on fast scroll / anchor jumps** (scrollbar drag, End key,
landing on `services.html#engine` from the homepage "Learn more →" links). `once:true`
= no retry → sections stay blank forever. Worked on slow scroll only (why it looked fine).

**Fix (`js/pages.js`):**
1. Replaced `ScrollTrigger.batch('.reveal')` with per-element `ScrollTrigger` (same
   robust pattern as the working `.fade-up` in `js/shared.js`); stagger preserved via
   a `revealDelay()` helper reading existing `reveal-delay-1..4` classes.
2. Added `window.load` + `document.fonts.ready` → `ScrollTrigger.refresh()` (Tailwind
   CDN + fonts shift layout AFTER ScrollTrigger caches trigger positions; without a
   refresh, a fresh load at an `#anchor` left positions stale and reveals never fired).

**Verified (Playwright):** about.html instant-jump-to-bottom & rapid multi-jump → 0/21
hidden (was 7/21). services.html fresh load at `#engine` → 0/8 (was 3/8). `#rescue` →
only the below-the-fold closing quote hidden, which correctly reveals on scroll. Slow
scroll 0 hidden everywhere. 0 console errors. Mobile (390px) unaffected.

### ✅ P3a — SRI hashes — DONE & VERIFIED (commit 145cbe6, pushed)
`integrity` + `crossorigin="anonymous"` added to the 3 classic CDN `<script>` tags in
all 4 HTML files; three.js covered via `<link rel="modulepreload" integrity>` in
index.html `<head>`. Verified in browser: all libs load, 0 console errors, P1 still
passes. Hashes used (recorded for reference / re-verification):

- gsap 3.12.5 → `sha384-g4NTh/Iv5PPU4xPyhEWqPcwtNXOvdaDI8LLnyYfyNZOjKJeYQyjzQ9X5275eBjpt`
- ScrollTrigger 3.12.5 → `sha384-Z3REaz79l2IaAZqJsSABtTbhjgOUYyV3p90XNnAPCSHg3EMTz1fouunq9WZRtj3d`
- lenis 1.1.13 → `sha384-B2WBjDzEjJpYvhmi2UyEn7rektqkf5suS6sNoyyrf0EBAwBHdkiXxIlU0V5Ru2ed`
- three 0.158.0 → `sha384-iuC3I0bVuCDzGoJi9KmCkGzEwo7vYFG/gBa7C/1D7mp8ZTt1CgTJ8C57dTDqqpfM`

three.js is an ESM `import` in `index.html` — SRI cannot go on a bare import. Add
`<link rel="modulepreload" href="https://unpkg.com/three@0.158.0/build/three.module.js"
integrity="sha384-iuC3I0bVuCDzGoJi9KmCkGzEwo7vYFG/gBa7C/1D7mp8ZTt1CgTJ8C57dTDqqpfM"
crossorigin="anonymous">` to `index.html` `<head>`.

### ✅ P3b — Tailwind CDN → static CSS — DONE & VERIFIED
`cdn.tailwindcss.com` + inline `tailwind.config` removed from all 4 HTML files,
replaced with `<link rel="stylesheet" href="css/tailwind.css">`. Static CSS built
with Tailwind v3; build source kept in repo: `tailwind.config.js` (ports the exact
ink/mint palette + Inter/JetBrains fonts; `content` = `./*.html`, `./js/**/*.js`)
and `tailwind.input.css`. Output `css/tailwind.css` ≈ 8.9 KB (was ~100 KB+ JS
runtime). **Rebuild after changing utility classes:**
```
npx tailwindcss@3 -i ./tailwind.input.css -o ./css/tailwind.css --minify
```
Verified in browser (Playwright): index/about/contact desktop+mobile visual parity,
Inter/JetBrains fonts, mint-500 = rgb(20,232,156), arbitrary values + md: responsive
work, no horizontal overflow, P1 still 0/21, **0 console errors AND 0 warnings**
(the Tailwind production warning is gone). GitHub Pages serves the committed
`css/tailwind.css` — no CI/build pipeline required.

### ✅ P2 — Privacy Policy + Terms pages — DONE & VERIFIED
Created `privacy.html` (12 sections) and `terms.html` (11 sections) in the site's
design (mirrors contact.html: page-hero + page-section + `.reveal` blocks, SRI
scripts, static tailwind.css). Added a minimal `.legal` block to `css/pages.css`.
Final wording (no placeholders), UAE/Dubai context: Quadra Code FZCO, IFZA, Licence
65349, TRN 105088941700001, UAE PDPL Federal Decree-Law No. 45 of 2021, Dubai
jurisdiction, "last updated 18 May 2026". Contact email left as the current Gmail
(user will swap to a domain address later). Full EN + SK via the existing i18n
system (`data-i18n` keys added to both `en` and `sk` blocks in `js/i18n.js`; ~29
privacy + ~27 terms keys per language; `node -c` syntax-checked). Dead footer
`href="#"` replaced with `privacy.html` / `terms.html` on all 4 original pages.
Verified (Playwright): both pages 0 console errors/warnings, EN↔SK toggle swaps
title+meta+content, reveal robust (0/12 and 0/11 on instant jump-to-bottom), no
horizontal overflow, footer link click from index → `privacy.html?lang=en`.
NOTE: text is a solid draft — user intends to have it reviewed by UAE counsel.

### Decided / parked
- Gmail contact (`invoicingquadracode@gmail.com`, also formsubmit recipient): user
  chose to **leave as-is for now**. Off-brand but not technical.
- Dead JS in `js/index.js` (~lines 144-223: dashboard/sparkline targeting elements
  that don't exist in current `index.html`): harmless, leftover. Not in scope.

## Status: P1, P3a, P3b, P2 all DONE & verified.
Open items only: swap Gmail → domain email when ready; legal text to be
reviewed by UAE counsel; optional SK localization is already in place.
