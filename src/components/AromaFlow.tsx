import { useEffect, useRef } from 'react'
import { gsap } from '../lib/animations'
import { FLOW, startFlow } from '../lib/flow'
import { useIsDesktop, useReducedMotion } from '../hooks/useMediaQuery'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  AROMA FLOW — what the bean stream turns into
 * ═══════════════════════════════════════════════════════════════════════════
 *  The continuous element is not "falling beans forever". Through the roast
 *  the beans break into grounds; across the brew they stop falling and this
 *  rises in their place, on the same page-long path, so the direction of the
 *  page's motion inverts for one section and then resumes.
 *
 *  Four slow curves, nothing else. Steam, not smoke — the paths are thin, the
 *  opacity is low, and each drifts on its own cycle so the group never pulses
 *  together. Opacity is driven by the shared flow state, so the aroma only
 *  exists where the story says it should.
 * ═══════════════════════════════════════════════════════════════════════════
 */
const CURVES = [
  { d: 'M60 300C60 236 28 214 46 156S78 66 62 8', w: 1.4, delay: 0 },
  { d: 'M100 306C100 232 132 210 114 152S86 58 104 2', w: 1.1, delay: 2.3 },
  { d: 'M140 300C140 240 168 218 152 164S128 78 144 20', w: 1.3, delay: 4.1 },
  { d: 'M20 296C20 248 0 230 14 184S38 108 26 62', w: 0.9, delay: 6.2 },
]

export function AromaFlow() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const isDesktop = useIsDesktop()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return

    const stopFlow = startFlow()

    const ctx = gsap.context(() => {
      gsap.utils.toArray<SVGPathElement>('[data-aroma-path]').forEach((path, i) => {
        gsap.set(path, { transformOrigin: '50% 100%' })
        gsap
          .timeline({ repeat: -1, delay: CURVES[i].delay })
          .fromTo(
            path,
            { autoAlpha: 0, yPercent: 16, scaleX: 0.82, scaleY: 0.88 },
            { autoAlpha: 1, duration: 3.2, ease: 'sine.out' },
          )
          .to(path, { yPercent: -26, scaleX: 1.22, scaleY: 1.14, duration: 9.6, ease: 'sine.inOut' }, 0)
          .to(path, { autoAlpha: 0, duration: 4, ease: 'sine.in' }, 4.6)
      })
    }, el)

    // Opacity and horizontal position both come from the shared flow, so the
    // aroma rises exactly where the bean stream stopped falling.
    let shown = -1
    const follow = () => {
      const a = FLOW.aroma
      if (Math.abs(a - shown) > 0.004) {
        el.style.opacity = a.toFixed(3)
        el.style.visibility = a < 0.01 ? 'hidden' : 'visible'
        shown = a
      }
      if (a > 0.01) {
        el.style.transform = `translate3d(${(FLOW.pathX * FLOW.vw - FLOW.vw * 0.11).toFixed(0)}px, 0, 0)`
      }
    }
    gsap.ticker.add(follow)

    return () => {
      gsap.ticker.remove(follow)
      ctx.revert()
      stopFlow()
    }
  }, [reduced, isDesktop])

  if (reduced) return null

  return (
    <div ref={ref} className="aromaflow" aria-hidden="true" style={{ opacity: 0, visibility: 'hidden' }}>
      <svg viewBox="0 0 160 320" preserveAspectRatio="xMidYMax meet" focusable="false">
        <g fill="none" stroke="#F4E5C4" strokeLinecap="round">
          {CURVES.map((c, i) => (
            <path key={i} data-aroma-path d={c.d} strokeWidth={c.w} opacity="0.55" />
          ))}
        </g>
      </svg>
    </div>
  )
}
