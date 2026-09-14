# Saravana Coffee

A one-page, scroll-driven brand prototype for **Saravana Coffee** — a Chennai
filter-coffee roaster established in 1995.

The page tells a single continuous story rather than stacking disconnected
sections: 1995 → heritage → bean → roast → grind → brew → blend → cup →
Chennai → worldwide → order. One background colour is scrubbed from theme to
theme as you scroll, so the whole page reads as one surface.

This is a **frontend-only prototype**. There is no backend, no checkout and no
invented business data — see [What you still need to supply](#what-you-still-need-to-supply).

---

## Contents

- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Deploying to GitHub Pages](#deploying-to-github-pages)
- [The photography](#the-photography)
- [The logo](#the-logo)
- [The bean stream](#the-bean-stream)
- [Editing the content](#editing-the-content)
- [WhatsApp, Maps and Instagram](#whatsapp-maps-and-instagram)
- [What you still need to supply](#what-you-still-need-to-supply)
- [How the page is built](#how-the-page-is-built)
- [Accessibility](#accessibility)
- [Adding real commerce later](#adding-real-commerce-later)

---

## Tech stack

| | |
|---|---|
| Build | Vite 8 |
| UI | React 19 + TypeScript 7 (strict) |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| Motion | GSAP 3 + ScrollTrigger + SplitText |
| Smooth scroll | Lenis |
| Icons | lucide-react |
| Motion components | local adaptations of the React Bits patterns, in `src/components/reactbits/` |

Fonts (Cormorant Garamond + Manrope) are **self-hosted** in `public/fonts/` —
about 85 KB for the whole type system, and no third-party request at runtime.

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks, then builds to dist/
npm run preview    # serves the production build locally
```

Append `?debug` to any URL to switch on ScrollTrigger markers and section
outlines (see `src/lib/debug.ts`).

---

## Deploying to GitHub Pages

A project site is served from `https://<user>.github.io/<REPOSITORY>/`, so
every asset URL needs a `/<REPOSITORY>/` prefix. That is what Vite's `base`
option does.

### Automatic (recommended)

`.github/workflows/deploy.yml` is already set up. It builds on every push to
`main` and derives the base path from the repository name, so **you do not need
to edit any file** — forks and renames keep working.

One-time setup in the repository:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. Push to `main`.

The workflow can also be run by hand from the **Actions** tab.

### Manual builds

If you build locally and upload `dist/` yourself, set the base path first:

```bash
VITE_BASE=/your-repo-name/ npm run build
```

…or edit `REPOSITORY_BASE` near the top of `vite.config.ts`, which is the
fallback used when `VITE_BASE` is not set.

**Custom domain or a `<user>.github.io` user site?** Use `/` instead.

`npm run dev` always serves from `/`, so the base path never gets in your way
while developing.

---

## The photography

Real Saravana Coffee photography now carries the site. Four masters live in
`src/assets/source/` and are committed untouched:

| Master | What it is |
|---|---|
| `filter-coffee-set.webp` | Tumbler and davara, the stainless filter, brass vessel, beans on a brass plate |
| `bean-bed.jpg` | Roasted beans filling the frame |
| `roaster.jpg` | The drum discharging a finished batch into the cooler |
| `beans-in-bag.jpg` | Beans inside an opened pack |
| `saravana-seal-original.webp` | The badge artwork, with its alpha channel intact |

`scripts/build-images.mjs` crops, grades and compresses those into the twelve
delivered images in `src/assets/images/`. **Components never touch the masters**
— a re-crop is a change to that one script.

```bash
npm i -D sharp
node scripts/build-images.mjs          # photographs → delivered crops
node scripts/generate-placeholder-art.mjs   # the slots that are still artwork
```

`sharp` is deliberately **not** a saved dependency — it is only needed to
rebuild images, and leaving it out keeps CI installs small.

### Re-cropping, or adding a photo

1. Put the master in `src/assets/source/`
2. Add an entry to `DERIVED` in `scripts/build-images.mjs` — `crop` is in master
   pixels (`{ left, top, width, height }`), `out` is the delivered size
3. Re-run the script, then update `width`/`height`/`alt` in `src/data/images.ts`

Nothing is upscaled beyond about 1.6×, which is where softness starts to show.

### Still waiting on a photograph

Six slots are art-directed placeholder artwork rather than photos. They are
flagged `generated: true` in `src/data/images.ts`, so the list below can never
drift out of date:

| Slot | What to shoot |
|---|---|
| `journeyGrind` | Fresh grounds, close, square crop |
| `galleryPowder` | Ground coffee, landscape |
| `galleryChennai` | Chennai at first light — used only in the Find Us section |
| `groundsTexture` | A flat bed of grounds, used as a full-bleed wash in transitions |
| `blendClassic` / `blendPure` | The two retail packs |
| `productPack` | A hero pack shot on a warm background |

The three pack images are renders rather than photos, but they carry the real
seal, so they read as Saravana packaging until product photography exists.

To replace any of them, drop a `.webp` over the matching file in
`src/assets/images/`, update its dimensions in `src/data/images.ts`, and delete
its `generated: true` flag.

## The logo

`src/components/ui/Logo.tsx` renders the real badge artwork. The supplied file
already carries an alpha channel; `scripts/build-images.mjs` trims it to the
badge, squares the frame and exports:

* `src/assets/logo/saravana-seal.webp` — 768px, used everywhere on the page
* `public/favicon.png` — 256px on a cream disc so it reads on light and dark
  browser chrome

Three variants, all the same artwork, differing only in intent so call sites
read clearly:

* `full` — the badge at whatever size the container gives it (hero, final CTA)
* `compact` — badge plus the horizontal wordmark (navbar)
* `mark` — the badge alone (footer)

The seal is never recoloured, stretched or filtered. To swap in new artwork,
replace `src/assets/source/saravana-seal-original.webp` and re-run the script.

## The bean stream

The page has one continuous visual element running through it. Beans spill from
the bag in the hero and keep falling for the length of the site — but they do
not simply fall forever. They darken through the roast, break down into grounds
at the bean-to-grounds transition, all but disappear across the brew while the
aroma rises in their place, and return for the closing sections. It is the
making of a cup of coffee, told as one continuous motion.

### The three beats

| | Where | What happens |
|---|---|---|
| 1 | Hero | Beans emerge from the mouth of the bag |
| 2 | Roast transition | Beans thin to ~6% and grounds fill the air |
| 3 | The first sip | Grounds clear, the stream inverts and aroma rises |

### How it is put together

* **`src/components/BeanFlow.tsx`** — one instance, mounted at page level in
  `App.tsx` and never unmounted, so the stream crosses every section boundary
  rather than restarting at each one.
* **`src/components/AromaFlow.tsx`** — what the stream turns into across the
  brew. Four slow curves, screen-blended, nothing more.
* **`src/lib/flow.ts`** — the shared state. Scroll, velocity, the page-long
  path and the phase mix are computed **once per frame** and read by both
  components, so the two halves can never disagree about where the coffee is.

**Two layers, real depth.** The back layer sits at `z-index: -1` inside
`#root`: above the page background, below every piece of content, so those
beans genuinely pass behind headings and photographs. The front layer sits at
`z-index: 96`, above the content and below the navbar. Depth is not faked with
opacity alone — size, speed and opacity all track it.

**The path** is anchored to real sections rather than to fixed scroll
fractions, so it keeps following the content when a section's height changes.
Edit `ANCHORS` in `src/lib/flow.ts` to reroute it.

### Tuning

```tsx
<BeanFlow
  enabled          // false removes it entirely
  density="medium" // 'low' | 'medium' | 'high'
  speed={1}        // fall-speed multiplier
  theme="brown"    // 'brown' | 'cream'
  mobileDensity={0.62}
/>
```

Roughly 13 beans are in the air at once on desktop and 5–7 on mobile, from a
pool of 34 and 16. Nothing is created or destroyed while the page runs.

### Performance

The loop writes `translate3d` and nothing else, reads no layout, and idles
while the tab is hidden. Measured against the same page with the layers
removed, the system is **not distinguishable from baseline** in frame timing.

Two things were expensive and are worth not reintroducing:

* a `filter` on either moving layer — it forces the whole layer to re-raster
  every frame and cost about 17 ms/frame on its own. The roast darkening is a
  class toggled on a phase flip instead.
* `drop-shadow` on individual beans, for the same reason.

### Reduced motion

Under `prefers-reduced-motion: reduce` there is no loop and no falling: five
beans rest along the route as static decoration, and the aroma does not render.

### Debugging

Append `?beans` (or `?debug`) to the URL for a live readout of particle counts,
scroll velocity, path position and the phase mix, plus a path guide and a
marker on the origin point. Off in production.

## Editing the content

All copy lives in `src/data/`. No component hard-codes a sentence, a price, a
URL or an address.

| File | What's in it |
|---|---|
| `src/data/site.ts` | Brand facts, navigation, every headline and paragraph, section labels, the three "what makes filter coffee different" points, the markets list |
| `src/data/products.ts` | The two blends, their descriptions, tasting notes, sizes and prices |
| `src/data/images.ts` | The image manifest and all alt text |

### Prices

Every size currently has `price: null`, which renders as **"Price on request"**.
No price on this site is invented. To publish real prices, edit the `SIZES`
array in `src/data/products.ts`:

```ts
const SIZES = [
  { id: '250g', label: '250 g', grams: 250, price: 190 },   // ₹190
  { id: '500g', label: '500 g', grams: 500, price: 360 },
  { id: '1kg',  label: '1 kg',  grams: 1000, price: 700 },
]
```

Prices are formatted as Indian rupees by `formatPrice()` in the same file.

---

## WhatsApp, Maps and Instagram

Open `src/data/site.ts` and fill in `SITE_CONFIG`:

```ts
export const SITE_CONFIG = {
  whatsappNumber: '919876543210',   // digits only, with country code, no + or spaces
  instagramUrl: 'https://www.instagram.com/…',
  mapsUrl: 'https://maps.app.goo.gl/…',  // "Share → Copy link" from the Maps listing
  email: '',                              // optional; leave empty to hide
}
```

Until `whatsappNumber` is set, every order button renders **disabled** with a
short note saying what to configure — rather than linking to a fake number.
The same applies to the "Get directions" button and `mapsUrl`.

Order buttons open WhatsApp with the message pre-filled from the current
selection, e.g.

> Hi Saravana Coffee, I'd like to order 500 g of Classic Filter Coffee (with chicory).

That text is built by `orderMessage()` in `src/data/products.ts`.

---

## What you still need to supply

Nothing in this list was guessed. Each is a deliberate placeholder.

- [ ] **WhatsApp number** — `SITE_CONFIG.whatsappNumber`
- [ ] **Google Maps link** — `SITE_CONFIG.mapsUrl`
- [ ] **Instagram handle** — `SITE_CONFIG.instagramUrl` (currently a best guess; confirm it)
- [ ] **Prices** per blend and size — `SIZES` in `src/data/products.ts`
- [ ] **Six remaining images** — see "Still waiting on a photograph" above
- [ ] **Product photography** for the two packs, to replace the renders
- [ ] **Confirm the shop address** before showing more than "Velachery · Chennai"
- [ ] **A social preview image**, optionally — `public/og-image.jpg` is built
      from the site's own seal and bean photography; swap it for a better
      shot when you have one (1200 × 630)
- [ ] **The markets list** in `MARKETS` (`src/data/site.ts`) — the current
      countries are examples, not a shipping guarantee
- [ ] **Confirm the product descriptions** — they describe method only, and make
      no health, sourcing, award or certification claims

---

## How the page is built

```
src/
  assets/source/      photographic masters, committed untouched
  assets/images/      delivered crops (built from source/) + remaining artwork
  assets/logo/        the seal, trimmed and exported
  assets/beans/       the three bean variants used by the stream
  components/
    ui/               Logo, Button, Figure, SectionLabel, ThemeShift, Motifs
    reactbits/        BlurText, ScrollFloat, ScrollReveal, Magnet,
                      TiltedCard, FlowingMenu  (local adaptations)
    <Section>.tsx     one file per section of the page
  data/               site.ts · products.ts · images.ts
  hooks/              useLenis · useGsapContext · useMediaQuery
  lib/                animations.ts · theme.ts · debug.ts
  styles/globals.css  design tokens + base layer
```

**The colour story.** The page has one background. Sections are transparent and
`<ThemeShift>` bands scrub the root CSS variables (`--page-bg`, `--ink`,
`--rule`, `--accent`, …) from one theme to the next as the band crosses the
viewport. Every band registers itself with the registry in `src/lib/theme.ts`,
and a single scroll-driven controller in `App.tsx` resolves the correct theme
from the actual scroll position on every update — so a scroll jump, an anchor
link or a restored scroll position can never leave the page a stale colour.

**The bean stream.** One page-level system, described in full above. It has
its own shared state in `src/lib/flow.ts` rather than hooking into the section
timelines, because it has to outlive all of them.

**Motion.** `src/lib/animations.ts` holds the shared timing and the reusable
primitives (`revealUp`, `revealFade`, `splitReveal`, `imageParallax`,
`scaleOnScroll`, `drift`). Sections build their own timelines through
`useGsapContext`, which scopes everything to that section's DOM and reverts all
of it — tweens, ScrollTriggers, pins, inline styles — on unmount.

**Scroll.** One Lenis instance, created in `useLenis` and synchronised with the
GSAP ticker (`Lenis scroll → ScrollTrigger.update()`, `GSAP ticker →
lenis.raf()`). Touch keeps native momentum; reduced-motion users get native
scrolling with no smoothing layer at all.

---

## Accessibility

- Semantic landmarks and a single `<h1>`; heading order is not skipped.
- Skip link to the main content.
- Blend and weight selectors are real radio inputs, so keyboard and
  screen-reader behaviour is the platform's.
- The menu traps focus, closes on `Escape`, and returns focus to its trigger.
- Visible focus rings everywhere, in the brand's accent colour.
- Every image has alt text (decorative ones are `alt=""` and `aria-hidden`).
- Nothing depends on hover alone.
- `prefers-reduced-motion: reduce` removes Lenis, the pinned horizontal
  journey, all parallax and every scrub — the page becomes a normal vertical
  document with all content visible.

---

## Adding real commerce later

The prototype is deliberately structured so the following can be added without
restructuring anything:

- **Shopify / Razorpay** — `ProductShowcase` already holds the full selection
  state (blend + size). Replace the WhatsApp link with a cart call.
- **Real inventory** — `PRODUCTS` in `src/data/products.ts` is already shaped
  like an API response; swap the constant for a fetch.
- **Analytics / Meta Pixel** — add the script to `index.html`; the order
  buttons are the only conversion points.

None of these are implemented. There is no database, auth, API, CMS or server.

---

*Prototype only. Twelve images are real Saravana Coffee photography; six are
still placeholder artwork (flagged in `src/data/images.ts`). Prices, phone
numbers and links are unset until real values are supplied.*
