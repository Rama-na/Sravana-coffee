import { useLayoutEffect, useRef, type RefObject } from 'react'
import { gsap, ScrollTrigger } from '../lib/animations'

/**
 * Scopes every animation a section creates to that section's DOM, and reverts
 * all of it — tweens, ScrollTriggers, pins, inline styles — on unmount.
 *
 * `setup` receives a matchMedia so responsive variants can be declared inline:
 *
 *   useGsapContext(ref, (mm) => {
 *     mm.add('(min-width: 1024px)', () => { … desktop only … })
 *   })
 *
 * A setup may return a cleanup function; gsap.context runs it on revert.
 * Never call ctx.add() from inside the setup — that nests the context inside
 * itself and GSAP recurses forever walking it.
 */
export function useGsapContext(
  scope: RefObject<HTMLElement | null>,
  setup: (mm: gsap.MatchMedia, ctx: gsap.Context) => void | (() => void),
  deps: unknown[] = [],
): void {
  const setupRef = useRef(setup)
  setupRef.current = setup

  useLayoutEffect(() => {
    if (!scope.current) return
    const mm = gsap.matchMedia()
    const ctx = gsap.context((self) => setupRef.current(mm, self), scope.current)
    return () => {
      mm.revert()
      ctx.revert()
      ScrollTrigger.refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** Conventional media queries for gsap.matchMedia(), used across sections. */
export const MQ = {
  desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
  belowDesktop: '(max-width: 1023px), (prefers-reduced-motion: reduce)',
  motion: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
} as const
