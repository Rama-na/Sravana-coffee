import { useRef, type ElementType } from 'react'
import { gsap, EASE, markers } from '../../lib/animations'
import { useGsapContext } from '../../hooks/useGsapContext'
import { useReducedMotion } from '../../hooks/useMediaQuery'

interface ScrollRevealProps {
  children: string
  className?: string
  as?: ElementType
  /** Starting opacity of each word — keep it high enough to stay readable. */
  from?: number
}

/**
 * Body copy that warms up word by word as the section is read. Words never
 * fall below `from` opacity, so the paragraph is legible at every scroll
 * position rather than appearing out of nothing.
 */
export function ScrollReveal({
  children,
  className,
  as: Tag = 'p',
  from = 0.36,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const words = children.split(' ')

  useGsapContext(
    ref,
    () => {
      if (reduced) {
        gsap.set('[data-reveal-word]', { autoAlpha: 1, filter: 'none' })
        return
      }
      gsap.fromTo(
        '[data-reveal-word]',
        { opacity: from, filter: 'blur(3px)' },
        {
          opacity: 1,
          filter: 'blur(0px)',
          ease: EASE.scrub,
          stagger: 0.22,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 88%',
            end: 'bottom 74%',
            scrub: 1,
            markers,
          },
        },
      )
    },
    [children, reduced],
  )

  return (
    <Tag ref={ref} className={className}>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          data-reveal-word
          className="inline-block"
          style={{ opacity: reduced ? 1 : from }}
        >
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}
