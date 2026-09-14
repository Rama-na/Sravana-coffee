import { useRef } from 'react'
import { gsap, ScrollTrigger, markers, prefersReducedMotion } from '../../lib/animations'
import { useGsapContext } from '../../hooks/useGsapContext'
import { registerBand, syncTheme, themeInterpolator, type ThemeName } from '../../lib/theme'

interface ThemeShiftProps {
  from: ThemeName
  to: ThemeName
  /** Height of the transition band, in viewport units. */
  height?: number
  /** Optional quiet content — a motif, a single line. Fades through the shift. */
  children?: React.ReactNode
  className?: string
}

/**
 * The seam between two colour worlds.
 *
 * The band is deliberately quiet — the page changes temperature here and
 * almost nothing else happens, which is what keeps the whole scroll reading as
 * one continuous surface instead of a stack of coloured boxes. Any content
 * passed in fades out across the shift so contrast is never ambiguous.
 */
export function ThemeShift({ from, to, height = 48, children, className }: ThemeShiftProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGsapContext(
    ref,
    () => {
      const paint = themeInterpolator(from, to)

      const st = ScrollTrigger.create({
        trigger: ref.current,
        start: 'top 50%',
        end: 'bottom 50%',
        markers,
        // Paint only while this band actually owns the viewport. Refreshes fire
        // every trigger at once; without the guard the last one to run wins.
        onUpdate: (self) => {
          if (self.isActive) paint(self.progress)
        },
        onLeave: () => syncTheme(),
        onLeaveBack: () => syncTheme(),
        onEnter: () => syncTheme(),
        onEnterBack: () => syncTheme(),
      })

      const unregister = registerBand({
        start: () => st.start,
        end: () => st.end,
        from,
        to,
        paint,
      })
      requestAnimationFrame(() => syncTheme())

      if (children && !prefersReducedMotion()) {
        gsap.fromTo(
          '[data-shift-content]',
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 78%',
              end: 'center 62%',
              scrub: 0.7,
              markers,
            },
          },
        )
        gsap.to('[data-shift-content]', {
          autoAlpha: 0,
          y: -28,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'center 48%',
            end: 'bottom 30%',
            scrub: 0.7,
            markers,
          },
        })
      } else if (children) {
        gsap.set('[data-shift-content]', { autoAlpha: 1, y: 0 })
      }

      return () => unregister()
    },
    [from, to],
  )

  return (
    <div
      ref={ref}
      aria-hidden={!children}
      className={`relative flex items-center justify-center ${className ?? ''}`}
      style={{ minHeight: `${height}vh` }}
    >
      {children && (
        <div data-shift-content className="shell text-center">
          {children}
        </div>
      )}
    </div>
  )
}
