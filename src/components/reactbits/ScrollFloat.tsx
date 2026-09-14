import { useRef, type ElementType, type ReactNode } from 'react'
import { gsap, EASE, markers } from '../../lib/animations'
import { useGsapContext } from '../../hooks/useGsapContext'
import { useReducedMotion } from '../../hooks/useMediaQuery'

interface ScrollFloatProps {
  children: string
  className?: string
  as?: ElementType
  /** Scrub distance, as a fraction of the viewport. */
  scrub?: boolean | number
  stagger?: number
}

/**
 * Display type that lifts into place letter by letter as it crosses the
 * viewport. Scrubbed, so the reader is the one moving it.
 */
export function ScrollFloat({
  children,
  className,
  as: Tag = 'span',
  scrub = 0.9,
  stagger = 0.022,
}: ScrollFloatProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const chars = Array.from(children)

  useGsapContext(
    ref,
    () => {
      if (reduced) {
        gsap.set('[data-float-char]', { autoAlpha: 1, yPercent: 0, scaleY: 1 })
        return
      }
      gsap.fromTo(
        '[data-float-char]',
        { yPercent: 108, autoAlpha: 0, scaleY: 1.25 },
        {
          yPercent: 0,
          autoAlpha: 1,
          scaleY: 1,
          ease: EASE.out,
          stagger,
          duration: 1,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 92%',
            end: 'top 44%',
            scrub,
            markers,
          },
        },
      )
    },
    [children, reduced],
  )

  return (
    <Tag ref={ref} className={className} aria-label={children}>
      {chars.map((c, i): ReactNode => (
        <span key={i} className="inline-block overflow-hidden align-bottom" aria-hidden="true">
          <span
            data-float-char
            className="inline-block will-change-transform"
            style={{ opacity: reduced ? 1 : 0 }}
          >
            {c === ' ' ? ' ' : c}
          </span>
        </span>
      ))}
    </Tag>
  )
}
