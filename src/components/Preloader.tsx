import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/animations'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { BRAND } from '../data/site'

/**
 * Deliberately short. The page underneath is already rendered — this only
 * covers the first paint of the hero so the seal doesn't pop in mid-layout.
 * Hard ceiling of 1.2s, and it leaves as soon as the document is ready.
 */
const MIN_MS = 520
const MAX_MS = 1200

export function Preloader({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const finish = () => {
      if (gone) return
      setGone(true)
      onDone()
    }

    if (reduced) {
      const t = window.setTimeout(finish, 200)
      return () => window.clearTimeout(t)
    }

    const start = performance.now()
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .fromTo(
          '[data-pre-letter]',
          { yPercent: 110, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.75, stagger: 0.028, ease: 'power3.out' },
        )
        .fromTo(
          '[data-pre-meta]',
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.5, ease: 'power2.out' },
          0.32,
        )
        .fromTo(
          '[data-pre-bar]',
          { scaleX: 0 },
          { scaleX: 1, duration: 0.85, ease: 'power2.inOut' },
          0.1,
        )
    }, root)

    let exited = false
    const exit = () => {
      if (exited) return
      exited = true
      const elapsed = performance.now() - start
      const wait = Math.max(0, MIN_MS - elapsed)
      gsap.delayedCall(wait / 1000, () => {
        gsap
          .timeline({ onComplete: finish })
          .to('[data-pre-inner]', { autoAlpha: 0, y: -18, duration: 0.42, ease: 'power2.in' })
          .to(root, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, 0.2)
      })
    }

    const ceiling = window.setTimeout(exit, MAX_MS)
    if (document.readyState === 'complete') exit()
    else window.addEventListener('load', exit, { once: true })

    return () => {
      window.clearTimeout(ceiling)
      window.removeEventListener('load', exit)
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  if (gone) return null

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[#031B46]"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div data-pre-inner className="flex w-full flex-col items-center px-8">
        <span className="sr-only">Loading {BRAND.name}</span>
        <span className="reveal-mask" aria-hidden="true">
          <span className="flex">
            {Array.from('SARAVANA').map((c, i) => (
              <span
                key={i}
                data-pre-letter
                className="display inline-block text-[clamp(2.2rem,9vw,5rem)] text-[#F4E5C4]"
                style={{ letterSpacing: '0.16em' }}
              >
                {c}
              </span>
            ))}
          </span>
        </span>
        <span
          data-pre-bar
          aria-hidden="true"
          className="mt-7 h-px w-[min(300px,62vw)] origin-left bg-[#F4E5C4]/40"
        />
        <span data-pre-meta className="meta mt-5 text-[#F4E5C4]/45" aria-hidden="true">
          Est. 1995 — Chennai
        </span>
      </div>
    </div>
  )
}
