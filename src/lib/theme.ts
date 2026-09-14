/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  PAGE THEMES
 * ═══════════════════════════════════════════════════════════════════════════
 *  The page has ONE background. Sections are transparent and simply declare
 *  which theme is in force; <ThemeShift> scrubs the root CSS variables from
 *  one theme to the next as its boundary band crosses the viewport, so the
 *  colour story is continuous instead of a stack of coloured boxes.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type ThemeName = 'midnight' | 'royal' | 'cream' | 'paper' | 'roast' | 'coffee'

export interface Theme {
  /** page background */
  bg: string
  /** primary text */
  ink: string
  /** secondary text — must stay ≥ 4.5:1 on bg */
  inkSoft: string
  /** decorative text (huge display numerals, watermarks) */
  inkFaint: string
  /** hairline rules */
  rule: string
  /** highlight colour for accents + buttons */
  accent: string
  /** low-contrast panel fill */
  surface: string
}

const rgba = (r: number, g: number, b: number, a: number) => `rgb(${r} ${g} ${b} / ${a})`

const CREAM: [number, number, number] = [244, 229, 196]
const DEEP: [number, number, number] = [5, 40, 102]
const ROAST: [number, number, number] = [33, 22, 17]

export const THEMES: Record<ThemeName, Theme> = {
  midnight: {
    bg: '#031b46',
    ink: '#f4e5c4',
    inkSoft: rgba(...CREAM, 0.68),
    inkFaint: rgba(...CREAM, 0.16),
    rule: rgba(...CREAM, 0.2),
    accent: '#f4e5c4',
    surface: rgba(...CREAM, 0.05),
  },
  royal: {
    bg: '#073c9d',
    ink: '#faf7ef',
    inkSoft: rgba(250, 247, 239, 0.76),
    inkFaint: rgba(250, 247, 239, 0.18),
    rule: rgba(250, 247, 239, 0.26),
    accent: '#f4e5c4',
    surface: rgba(250, 247, 239, 0.07),
  },
  cream: {
    bg: '#f4e5c4',
    ink: '#052866',
    inkSoft: rgba(...DEEP, 0.72),
    inkFaint: rgba(...DEEP, 0.11),
    rule: rgba(...DEEP, 0.2),
    accent: '#073c9d',
    surface: rgba(...DEEP, 0.045),
  },
  paper: {
    bg: '#faf7ef',
    ink: '#052866',
    inkSoft: rgba(...DEEP, 0.7),
    inkFaint: rgba(...DEEP, 0.1),
    rule: rgba(...DEEP, 0.16),
    accent: '#073c9d',
    surface: rgba(...DEEP, 0.04),
  },
  roast: {
    bg: '#211611',
    ink: '#f4e5c4',
    inkSoft: rgba(...CREAM, 0.66),
    inkFaint: rgba(...CREAM, 0.14),
    rule: rgba(...CREAM, 0.18),
    accent: '#f4e5c4',
    surface: rgba(...CREAM, 0.05),
  },
  coffee: {
    bg: '#6b351f',
    ink: '#f4e5c4',
    inkSoft: rgba(...CREAM, 0.78),
    inkFaint: rgba(...CREAM, 0.18),
    rule: rgba(...CREAM, 0.24),
    accent: '#f4e5c4',
    surface: rgba(...ROAST, 0.16),
  },
}

const VARS: Array<[keyof Theme, string]> = [
  ['bg', '--page-bg'],
  ['ink', '--ink'],
  ['inkSoft', '--ink-soft'],
  ['inkFaint', '--ink-faint'],
  ['rule', '--rule'],
  ['accent', '--accent'],
  ['surface', '--surface'],
]

/** Writes a theme straight onto :root — used for hard sets and on first paint. */
export function applyTheme(name: ThemeName, el: HTMLElement = document.documentElement): void {
  const theme = THEMES[name]
  for (const [key, cssVar] of VARS) el.style.setProperty(cssVar, theme[key])
  el.style.colorScheme = name === 'cream' || name === 'paper' ? 'light' : 'dark'
}

/* ── colour interpolation, for scrubbed transitions ────────────────────── */

type RGBA = [number, number, number, number]

function parse(colour: string): RGBA {
  if (colour.startsWith('#')) {
    const h = colour.slice(1)
    const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
    return [
      parseInt(n.slice(0, 2), 16),
      parseInt(n.slice(2, 4), 16),
      parseInt(n.slice(4, 6), 16),
      1,
    ]
  }
  const nums = colour.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 1]
  return [nums[0] ?? 0, nums[1] ?? 0, nums[2] ?? 0, nums[3] ?? 1]
}

function format([r, g, b, a]: RGBA): string {
  const round = (n: number) => Math.round(n)
  return a >= 1
    ? `rgb(${round(r)} ${round(g)} ${round(b)})`
    : `rgb(${round(r)} ${round(g)} ${round(b)} / ${a.toFixed(3)})`
}

/** Pre-parses a theme pair so the scroll handler only does cheap maths. */
export function themeInterpolator(from: ThemeName, to: ThemeName) {
  const pairs = VARS.map(([key, cssVar]) => ({
    cssVar,
    a: parse(THEMES[from][key]),
    b: parse(THEMES[to][key]),
  }))
  const light = (n: ThemeName) => n === 'cream' || n === 'paper'
  const fromLight = light(from)
  const toLight = light(to)

  return (t: number, el: HTMLElement = document.documentElement) => {
    const p = t < 0 ? 0 : t > 1 ? 1 : t
    for (const { cssVar, a, b } of pairs) {
      el.style.setProperty(
        cssVar,
        format([
          a[0] + (b[0] - a[0]) * p,
          a[1] + (b[1] - a[1]) * p,
          a[2] + (b[2] - a[2]) * p,
          a[3] + (b[3] - a[3]) * p,
        ]),
      )
    }
    el.style.colorScheme = (p < 0.5 ? fromLight : toLight) ? 'light' : 'dark'
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   THEME REGISTRY
   ═══════════════════════════════════════════════════════════════════════════
   Every colour boundary registers itself here instead of painting whenever its
   own ScrollTrigger happens to fire. One function then decides what the page
   should look like at a given scroll position, which makes the result the same
   whether you scrolled there, reloaded there, or a refresh re-ran every
   trigger at once. Without this the last trigger to fire during a refresh wins
   and the page can settle on the wrong colour entirely.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ThemeBand {
  /** Scroll position where the shift begins / ends, in px. */
  start: () => number
  end: () => number
  from: ThemeName
  to: ThemeName
  paint: (t: number) => void
}

const bands: ThemeBand[] = []
/** Theme in force above the first band. */
let initialTheme: ThemeName = 'midnight'

export function setInitialTheme(name: ThemeName): void {
  initialTheme = name
  applyTheme(name)
}

export function registerBand(band: ThemeBand): () => void {
  bands.push(band)
  sorted = null
  return () => {
    const i = bands.indexOf(band)
    if (i >= 0) bands.splice(i, 1)
    sorted = null
    lastPainted = ''
  }
}

/** Call after a ScrollTrigger refresh — band positions have moved. */
export function invalidateBands(): void {
  sorted = null
  lastPainted = ''
}

let syncing = false
/** Last painted state, so repeated resolutions cost nothing. */
let lastPainted = ''
/** Bands change rarely; the sorted copy is rebuilt only when they do. */
let sorted: ThemeBand[] | null = null

/** Resolves and paints the correct theme for the current scroll position. */
export function syncTheme(scroll = window.scrollY): void {
  // Reading a trigger's start/end can itself provoke a refresh, which would
  // call straight back in here. One pass at a time.
  if (syncing || !bands.length) return
  syncing = true
  try {
    resolve(scroll)
  } finally {
    syncing = false
  }
}

function resolve(scroll: number): void {
  if (!sorted) sorted = [...bands].sort((a, b) => a.start() - b.start())

  let settled: ThemeName = initialTheme
  for (const band of sorted) {
    const start = band.start()
    const end = band.end()
    if (scroll >= end) {
      settled = band.to
      continue
    }
    if (scroll > start) {
      // Mid-shift: paint the interpolation and stop — nothing below matters.
      const t = (scroll - start) / Math.max(1, end - start)
      const key = `${band.from}>${band.to}:${t.toFixed(3)}`
      if (key !== lastPainted) {
        lastPainted = key
        band.paint(t)
      }
      return
    }
    break
  }
  if (settled !== lastPainted) {
    lastPainted = settled
    applyTheme(settled)
  }
}
