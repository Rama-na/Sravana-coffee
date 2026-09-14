/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  MOTION LANGUAGE
 * ═══════════════════════════════════════════════════════════════════════════
 *  Slow, organic, warm. Coffee aroma drifting through air — never bouncy,
 *  never fast, never decorative for its own sake.
 *
 *  Sections build their own timelines; these are the shared primitives and
 *  the shared timing so nothing drifts out of character.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DEBUG_ANIMATIONS } from './debug'

gsap.registerPlugin(ScrollTrigger, SplitText)

export { gsap, ScrollTrigger, SplitText }

/* ── shared timing ─────────────────────────────────────────────────────── */
export const DUR = { fast: 0.36, medium: 0.7, slow: 1.2, xslow: 1.6 } as const
export const EASE = {
  out: 'power3.out',
  outSoft: 'power2.out',
  inOut: 'power2.inOut',
  /** For anything scrubbed to the scrollbar — must be linear. */
  scrub: 'none',
} as const

/** Markers only ever appear when DEBUG_ANIMATIONS is on. */
export const markers = DEBUG_ANIMATIONS

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

type Target = gsap.TweenTarget

interface RevealOptions {
  trigger?: Element | string
  start?: string
  y?: number
  duration?: number
  stagger?: number
  delay?: number
  ease?: string
  once?: boolean
}

/**
 * The workhorse: rise + fade as the element enters. Elements are expected to
 * carry `data-reveal` so their pre-animation state is set in one place.
 */
export function revealUp(targets: Target, o: RevealOptions = {}): gsap.core.Tween {
  const {
    trigger,
    start = 'top 86%',
    y = 42,
    duration = DUR.slow,
    stagger = 0.09,
    delay = 0,
    ease = EASE.out,
    once = true,
  } = o
  return gsap.fromTo(
    targets,
    { y, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: 1,
      duration,
      stagger,
      delay,
      ease,
      scrollTrigger: trigger ? { trigger, start, once, markers } : undefined,
    },
  )
}

/** Fade only — for things that shouldn't move (large imagery, rules). */
export function revealFade(targets: Target, o: RevealOptions = {}): gsap.core.Tween {
  const { trigger, start = 'top 88%', duration = DUR.xslow, stagger = 0.1, once = true } = o
  return gsap.fromTo(
    targets,
    { autoAlpha: 0 },
    {
      autoAlpha: 1,
      duration,
      stagger,
      ease: EASE.outSoft,
      scrollTrigger: trigger ? { trigger, start, once, markers } : undefined,
    },
  )
}

/**
 * Line-by-line masked reveal. Each line sits inside its own clipped wrapper
 * and slides up from behind it — the single most "editorial" move on the site.
 *
 * Returns a cleanup that reverts the DOM split.
 */
export function splitReveal(
  el: Element,
  o: RevealOptions & { scale?: boolean } = {},
): () => void {
  const { trigger = el, start = 'top 84%', duration = DUR.slow, stagger = 0.11, delay = 0 } = o

  if (prefersReducedMotion()) {
    gsap.set(el, { autoAlpha: 1 })
    return () => {}
  }

  const split = new SplitText(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'split-line',
    autoSplit: true,
    onSplit(self) {
      return gsap.fromTo(
        self.lines,
        { yPercent: 116, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration,
          stagger,
          delay,
          ease: EASE.out,
          scrollTrigger: { trigger, start, once: true, markers },
        },
      )
    },
  })

  gsap.set(el, { autoAlpha: 1 })
  return () => split.revert()
}

/**
 * Parallax for a full-bleed image inside an overflow-hidden frame.
 * `strength` is the total travel as a fraction of the frame height.
 */
export function imageParallax(
  img: Element,
  frame: Element,
  strength = 0.16,
): ScrollTrigger | undefined {
  if (prefersReducedMotion()) return undefined
  const shift = strength * 100
  gsap.set(img, { scale: 1 + strength * 1.35, transformOrigin: 'center center' })
  const tween = gsap.fromTo(
    img,
    { yPercent: -shift / 2 },
    {
      yPercent: shift / 2,
      ease: EASE.scrub,
      scrollTrigger: {
        trigger: frame,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        markers,
      },
    },
  )
  return tween.scrollTrigger
}

/** Slow scale-up tied to scroll — used for hero and full-bleed plates. */
export function scaleOnScroll(
  el: Element,
  o: { from?: number; to?: number; trigger?: Element; start?: string; end?: string } = {},
): ScrollTrigger | undefined {
  if (prefersReducedMotion()) return undefined
  const { from = 1, to = 1.14, trigger = el, start = 'top bottom', end = 'bottom top' } = o
  const tween = gsap.fromTo(
    el,
    { scale: from },
    {
      scale: to,
      ease: EASE.scrub,
      transformOrigin: 'center center',
      scrollTrigger: { trigger, start, end, scrub: true, markers },
    },
  )
  return tween.scrollTrigger
}

/** Gentle vertical drift for decorative motifs (beans, seals, numerals). */
export function drift(
  el: Element,
  o: { distance?: number; trigger?: Element; rotate?: number } = {},
): ScrollTrigger | undefined {
  if (prefersReducedMotion()) return undefined
  const { distance = 120, trigger = el, rotate = 0 } = o
  const tween = gsap.fromTo(
    el,
    { y: distance * 0.5, rotate: -rotate },
    {
      y: -distance * 0.5,
      rotate,
      ease: EASE.scrub,
      scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: 1.1, markers },
    },
  )
  return tween.scrollTrigger
}

/** Counts a numeral up as it enters — used once, for "1995". */
export function countTo(el: HTMLElement, to: number, from = 0): gsap.core.Tween {
  const state = { v: from }
  return gsap.to(state, {
    v: to,
    duration: DUR.xslow,
    ease: EASE.out,
    snap: { v: 1 },
    onUpdate: () => {
      el.textContent = String(Math.round(state.v))
    },
    scrollTrigger: { trigger: el, start: 'top 85%', once: true, markers },
  })
}

/**
 * Keeps ScrollTrigger honest once fonts and images have settled.
 * Fonts change line-box heights, which changes every pinned distance.
 */
export function refreshOnSettle(onSettled?: () => void): void {
  // 'refresh' fires *after* a refresh completes; the rAF pushes the callback
  // out of the refresh cycle entirely so it can never re-enter it.
  if (onSettled) {
    ScrollTrigger.addEventListener('refresh', () => requestAnimationFrame(onSettled))
  }
  const refresh = () => {
    ScrollTrigger.refresh()
    if (onSettled) requestAnimationFrame(onSettled)
  }
  if (typeof document !== 'undefined' && 'fonts' in document) {
    void document.fonts.ready.then(refresh)
  }
  window.addEventListener('load', refresh, { once: true })
}
