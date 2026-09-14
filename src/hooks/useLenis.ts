/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  GLOBAL SCROLL
 * ═══════════════════════════════════════════════════════════════════════════
 *      Lenis → scroll event → ScrollTrigger.update()
 *      GSAP ticker → lenis.raf()
 *
 *  One instance for the whole app, created once and torn down cleanly.
 *  Touch devices keep native momentum (syncTouch off) so mobile scrolling
 *  feels normal, and reduced-motion users get native scrolling entirely.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/animations'
import { logAnim } from '../lib/debug'

let instance: Lenis | null = null

export function getLenis(): Lenis | null {
  return instance
}

/** Smoothly scrolls to a section id. Falls back to native when Lenis is off. */
export function scrollToSection(id: string, offset = 0): void {
  const target = document.getElementById(id)
  if (!target) return
  if (instance) {
    instance.scrollTo(target, { offset, duration: 1.5 })
  } else {
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    if (offset) window.scrollBy({ top: offset })
  }
  // Move keyboard focus with the viewport so tabbing continues from here.
  target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}

export function useLenis(): void {
  useEffect(() => {
    if (instance) return // never create a second one

    // Reduced motion → no smoothing layer at all, just native scroll.
    if (prefersReducedMotion()) {
      logAnim('Lenis skipped (prefers-reduced-motion)')
      return
    }

    const lenis = new Lenis({
      duration: 1.15,
      // Long, settling ease — the scroll should coast, never snap.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false, // native momentum on touch
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
      autoRaf: false,
    })
    instance = lenis

    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // Anchors inside the document should route through Lenis too.
    ScrollTrigger.refresh()
    logAnim('Lenis initialised')

    return () => {
      gsap.ticker.remove(raf)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.off('scroll', onScroll)
      lenis.destroy()
      instance = null
    }
  }, [])
}
