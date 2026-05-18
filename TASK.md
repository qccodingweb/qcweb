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

### 🔄 P3a — SRI hashes — IN PROGRESS (not yet applied)
Add `integrity` + `crossorigin="anonymous"` to the 3 classic CDN `<script>` tags in
ALL 4 HTML files. Hashes already computed from the exact pinned URLs (do NOT recompute):

- gsap 3.12.5 → `sha384-g4NTh/Iv5PPU4xPyhEWqPcwtNXOvdaDI8LLnyYfyNZOjKJeYQyjzQ9X5275eBjpt`
- ScrollTrigger 3.12.5 → `sha384-Z3REaz79l2IaAZqJsSABtTbhjgOUYyV3p90XNnAPCSHg3EMTz1fouunq9WZRtj3d`
- lenis 1.1.13 → `sha384-B2WBjDzEjJpYvhmi2UyEn7rektqkf5suS6sNoyyrf0EBAwBHdkiXxIlU0V5Ru2ed`
- three 0.158.0 → `sha384-iuC3I0bVuCDzGoJi9KmCkGzEwo7vYFG/gBa7C/1D7mp8ZTt1CgTJ8C57dTDqqpfM`

three.js is an ESM `import` in `index.html` — SRI cannot go on a bare import. Add
`<link rel="modulepreload" href="https://unpkg.com/three@0.158.0/build/three.module.js"
integrity="sha384-iuC3I0bVuCDzGoJi9KmCkGzEwo7vYFG/gBa7C/1D7mp8ZTt1CgTJ8C57dTDqqpfM"
crossorigin="anonymous">` to `index.html` `<head>`.

### ⏳ P3b — Tailwind CDN → static CSS — NOT STARTED
Replace `<script src="https://cdn.tailwindcss.com"></script>` + the inline
`tailwind.config = {...}` block (all 4 HTML files) with `<link rel="stylesheet"
href="css/tailwind.css">`. Build with Tailwind **v3** (`npx tailwindcss@3`); config
`theme.extend` must port the exact palette (`ink` 950-700, `mint` 300-700) and
`fontFamily` (Inter / JetBrains Mono) from the inline config; `content` globs = the 4
HTML + `js/**`. Then verify visual parity vs CDN version (screenshots, key pages,
mobile). Watch arbitrary-value classes (`text-[clamp(...)]`, `border-mint-500/30`,
`text-white/65`).

### ⏳ P2 — Privacy Policy + Terms text — NOT STARTED
Footer "Privacy Policy" / "Terms of Service" link to `href="#"` on all 4 pages (dead).
User wants DRAFT text delivered in chat first (UAE/Dubai context: Quadra Code FZCO,
IFZA Dubai Silicon Oasis, License 65349, TRN 105088941700001; reference UAE PDPL —
Federal Decree-Law No. 45 of 2021; must carry a "review by UAE-qualified lawyer"
disclaimer). Build `privacy.html` / `terms.html` and fix the footer links ONLY after
the user approves the text.

### Decided / parked
- Gmail contact (`invoicingquadracode@gmail.com`, also formsubmit recipient): user
  chose to **leave as-is for now**. Off-brand but not technical.
- Dead JS in `js/index.js` (~lines 144-223: dashboard/sparkline targeting elements
  that don't exist in current `index.html`): harmless, leftover. Not in scope.

## Next step
Apply P3a (hashes above), then P3b, then deliver P2 draft text in chat for approval.
