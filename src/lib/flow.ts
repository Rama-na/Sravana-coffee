/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE FLOW — one shared, per-frame reading of where the coffee is
 * ═══════════════════════════════════════════════════════════════════════════
 *  The bean stream and the aroma are two halves of one continuous element, so
 *  they read from one state object rather than each computing scroll, page
 *  path and phase for themselves. This module owns that computation and runs
 *  it exactly once per frame, driven by a reference-counted GSAP ticker.
 *
 *  Nothing here touches the DOM per frame. Scroll comes from Lenis's own
 *  event (or a passive listener), and every section offset is measured once
 *  per ScrollTrigger refresh — so the flow never forces a layout.
 *
 *  The story the numbers tell:
 *
 *     beans      1 ─────────────╮                       ╭──── 0.85
 *                               ╰──╮              ╭─────╯
 *     grounds              ╭────╮   ╰─ 0.06 ─────╯
 *     aroma                            ╭─────╮
 *               hero   journey  roast  brew  craft   worldwide   cta
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { getLenis } from '../hooks/useLenis'
import { gsap, ScrollTrigger } from './animations'

export interface FlowState {
  /** Current scroll position, in px. */
  scroll: number
  /** Page progress, 0–1. */
  progress: number
  /** Scroll-velocity speed multiplier, smoothed. 1 at rest, up to ~1.35. */
  boost: number
  /** Where the stream sits horizontally, as a fraction of the viewport. */
  pathX: number
  /** How many beans should be in the air, 0–1. */
  beans: number
  /** How much ground coffee is in the air, 0–1. */
  grounds: number
  /** How present the aroma is, 0–1. */
  aroma: number
  /** How far into the roast the beans are — darkens them, 0–1. */
  roast: number
  vw: number
  vh: number
}

export const FLOW: FlowState = {
  scroll: 0,
  progress: 0,
  boost: 1,
  pathX: 0.62,
  beans: 1,
  grounds: 0,
  aroma: 0,
  roast: 0,
  vw: 1440,
  vh: 900,
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE PAGE-LONG PATH
   ═══════════════════════════════════════════════════════════════════════════
   Anchored to real sections rather than to fixed scroll fractions, so the
   stream keeps following the content when a section's height changes.

   x is a fraction of the viewport width. The drift is deliberately gentle —
   the reader should register one continuous system, not track a route.
   ═══════════════════════════════════════════════════════════════════════════ */
const ANCHORS: Array<{ id: string; x: number }> = [
  { id: 'top', x: 0.63 }, //        hero — under the bag, right of centre
  { id: 'heritage', x: 0.24 }, //   drifts left, past the pairing
  { id: 'journey', x: 0.78 }, //    crosses the horizontal story
  { id: 'blends', x: 0.58 }, //     back toward centre-right
  { id: 'shop', x: 0.34 }, //       left, clear of the configurator
  { id: 'brew', x: 0.66 }, //       over the tumbler, where the aroma rises
  { id: 'craft', x: 0.28 }, //      left again
  { id: 'gallery', x: 0.72 }, //    across the spread
  { id: 'contact', x: 0.76 }, //    right
  { id: 'worldwide', x: 0.34 }, //  gently across
  { id: 'order', x: 0.5 }, //       home, centre
]

interface Anchor {
  at: number
  x: number
}
let path: Anchor[] = [{ at: 0, x: 0.63 }, { at: 1, x: 0.5 }]

/** Scroll positions of the phase boundaries, measured on refresh. */
const zones = {
  journeyStart: 0,
  journeyEnd: 0,
  roastStart: 0,
  roastEnd: 0,
  brewStart: 0,
  brewEnd: 0,
  craftStart: 0,
  docHeight: 1,
}

const smoothstep = (t: number) => t * t * (3 - 2 * t)
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)
/** 0 below `a`, 1 above `b`, eased between. */
const ramp = (v: number, a: number, b: number) => (b === a ? (v < a ? 0 : 1) : smoothstep(clamp01((v - a) / (b - a))))
/** 1 at `centre`, easing to 0 at `halfWidth` either side. */
const bell = (v: number, centre: number, halfWidth: number) =>
  smoothstep(clamp01(1 - Math.abs(v - centre) / Math.max(1, halfWidth)))

function topOf(id: string): number | null {
  const el = document.getElementById(id)
  if (!el) return null
  return el.getBoundingClientRect().top + window.scrollY
}

/** Re-measures every anchor. Cheap, and only ever called on refresh. */
export function measureFlow(): void {
  FLOW.vw = window.innerWidth
  FLOW.vh = window.innerHeight
  const max = Math.max(1, document.documentElement.scrollHeight - FLOW.vh)
  zones.docHeight = max

  const measured: Anchor[] = []
  for (const a of ANCHORS) {
    const top = topOf(a.id)
    if (top === null) continue
    measured.push({ at: clamp01(top / max), x: a.x })
  }
  if (measured.length >= 2) {
    measured.sort((p, q) => p.at - q.at)
    path = measured
  }

  const journey = topOf('journey')
  const journeyEl = document.getElementById('journey')
  const roast = topOf('roast-transition')
  const roastEl = document.getElementById('roast-transition')
  const brew = topOf('brew')
  const brewEl = document.getElementById('brew')
  const craft = topOf('craft')

  zones.journeyStart = journey ?? 0
  zones.journeyEnd = (journey ?? 0) + (journeyEl?.offsetHeight ?? 0)
  zones.roastStart = roast ?? zones.journeyEnd
  zones.roastEnd = (roast ?? zones.journeyEnd) + (roastEl?.offsetHeight ?? FLOW.vh)
  zones.brewStart = brew ?? zones.roastEnd
  zones.brewEnd = (brew ?? zones.roastEnd) + (brewEl?.offsetHeight ?? FLOW.vh)
  zones.craftStart = craft ?? zones.brewEnd
}

function pathAt(progress: number): number {
  if (progress <= path[0].at) return path[0].x
  const last = path[path.length - 1]
  if (progress >= last.at) return last.x
  for (let i = 1; i < path.length; i++) {
    const b = path[i]
    if (progress <= b.at) {
      const a = path[i - 1]
      const span = b.at - a.at
      const t = span <= 0 ? 1 : smoothstep((progress - a.at) / span)
      return a.x + (b.x - a.x) * t
    }
  }
  return last.x
}

/* ═══════════════════════════════════════════════════════════════════════════
   PHASES
   ═══════════════════════════════════════════════════════════════════════════ */
function phasesAt(scroll: number): void {
  const { vh } = FLOW
  // Measured against the middle of the viewport, not its top, so each phase
  // peaks when its section is actually the thing being looked at.
  const view = scroll + vh / 2

  // Grounds belong to the roast transition and nowhere else; aroma belongs to
  // the brew. Anchoring each to its own section — rather than to a span
  // between two landmarks — keeps them from bleeding into whatever happens to
  // sit in between, which is several thousand pixels of blends and shop.
  FLOW.grounds = bell(view, (zones.roastStart + zones.roastEnd) / 2, (zones.roastEnd - zones.roastStart) / 2 + vh * 0.5)
  FLOW.aroma = bell(view, (zones.brewStart + zones.brewEnd) / 2, (zones.brewEnd - zones.brewStart) / 2 + vh * 0.6)

  // The stream thins out as the beans break down and again as they brew, then
  // comes back on its own. One expression, so the three can never disagree.
  FLOW.beans = clamp01(1 - FLOW.grounds * 0.92 - FLOW.aroma * 0.94)

  // Beans darken through the roast and stay dark once roasted.
  FLOW.roast = ramp(scroll, zones.journeyStart, zones.journeyEnd)
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE TICKER
   ═══════════════════════════════════════════════════════════════════════════ */
let listeners = 0
let rawScroll = 0
let rawVelocity = 0
let detachScroll: (() => void) | null = null

function tick(): void {
  FLOW.scroll = rawScroll
  FLOW.progress = clamp01(rawScroll / zones.docHeight)
  FLOW.pathX = pathAt(FLOW.progress)

  // Fast scrolling stretches the stream a little; it settles back on its own.
  // Velocity has to bleed off here rather than only in the scroll handler —
  // once scrolling stops no more events arrive, so the last value would stick
  // and the stream would never return to 1×.
  rawVelocity *= 0.86
  const target = 1 + Math.min(0.35, Math.abs(rawVelocity) / 3200)
  FLOW.boost += (target - FLOW.boost) * 0.08

  phasesAt(rawScroll)
}

/**
 * Starts the shared loop. Reference-counted, so BeanFlow and AromaFlow can
 * each call it without either having to own the other's lifetime.
 */
export function startFlow(): () => void {
  listeners += 1
  if (listeners === 1) {
    rawScroll = window.scrollY

    const onScroll = () => {
      const next = window.scrollY
      rawVelocity = (next - rawScroll) * 60
      rawScroll = next
    }
    // Lenis reports its own velocity, already smoothed; fall back to a passive
    // listener when Lenis is off (reduced motion).
    const lenis = getLenis()
    if (lenis) {
      const onLenis = (d: { scroll: number; velocity: number }) => {
        rawScroll = d.scroll
        rawVelocity = d.velocity * 60
      }
      lenis.on('scroll', onLenis)
      detachScroll = () => lenis.off('scroll', onLenis)
    } else {
      window.addEventListener('scroll', onScroll, { passive: true })
      detachScroll = () => window.removeEventListener('scroll', onScroll)
    }

    measureFlow()
    ScrollTrigger.addEventListener('refresh', measureFlow)
    window.addEventListener('resize', measureFlow)
    gsap.ticker.add(tick)
  }

  return () => {
    listeners -= 1
    if (listeners === 0) {
      gsap.ticker.remove(tick)
      ScrollTrigger.removeEventListener('refresh', measureFlow)
      window.removeEventListener('resize', measureFlow)
      detachScroll?.()
      detachScroll = null
    }
  }
}
