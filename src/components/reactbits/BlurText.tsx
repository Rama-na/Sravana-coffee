import { useRef, type ElementType } from 'react'
import { gsap, EASE, markers } from '../../lib/animations'
import { useGsapContext } from '../../hooks/useGsapContext'
import { useReducedMotion } from '../../hooks/useMediaQuery'

interface BlurTextProps {
  text: string
  className?: string
  as?: ElementType
  /** Seconds between each word. */
  stagger?: number
  delay?: number
  /** 'scroll' waits for the element to enter, 'load' plays immediately. */
  trigger?: 'scroll' | 'load'
  by?: 'word' | 'char'
}

/**
 * Copy resolves out of a soft blur, word by word — like something coming into
 * focus rather than sliding in. Used for supporting lines, never for headings.
 */
export function BlurText({
  text,
  className,
  as: Tag = 'p',
  stagger = 0.055,
  delay = 0,
  trigger = 'scroll',
  by = 'word',
}: BlurTextProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const pieces = by === 'word' ? text.split(' ') : Array.from(text)

  useGsapContext(
    ref,
    () => {
      if (reduced) {
        gsap.set('[data-blur-piece]', { autoAlpha: 1, filter: 'none', y: 0 })
        return
      }
      gsap.fromTo(
        '[data-blur-piece]',
        { autoAlpha: 0, filter: 'blur(9px)', y: '0.35em' },
        {
          autoAlpha: 1,
          filter: 'blur(0px)',
          y: 0,
          duration: 1.1,
          ease: EASE.out,
          stagger,
          delay,
          scrollTrigger:
            trigger === 'scroll'
              ? { trigger: ref.current, start: 'top 88%', once: true, markers }
              : undefined,
        },
      )
    },
    [text, reduced, trigger],
  )

  return (
    <Tag ref={ref} className={className}>
      {pieces.map((piece, i) => (
        <span
          key={`${piece}-${i}`}
          data-blur-piece
          className="inline-block will-change-[filter,opacity,transform]"
          style={{ opacity: reduced ? 1 : 0 }}
        >
          {piece}
          {by === 'word' && i < pieces.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}
