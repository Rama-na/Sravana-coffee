import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from '../../lib/animations'
import { useHasHover, useReducedMotion } from '../../hooks/useMediaQuery'

interface MagnetProps {
  children: ReactNode
  className?: string
  /** How far outside the element the pull starts, in px. */
  radius?: number
  /** Fraction of the cursor offset the element follows. Keep it subtle. */
  strength?: number
}

/**
 * A very light magnetic pull on pointer proximity. Desktop pointers only —
 * disabled for touch and for reduced motion, where the child is simply static.
 */
export function Magnet({ children, className, radius = 88, strength = 0.26 }: MagnetProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const hasHover = useHasHover()
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || !hasHover || reduced) return

    const inner = el.firstElementChild as HTMLElement | null
    if (!inner) return

    const xTo = gsap.quickTo(inner, 'x', { duration: 0.7, ease: 'power3.out' })
    const yTo = gsap.quickTo(inner, 'y', { duration: 0.7, ease: 'power3.out' })

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.hypot(dx, dy)
      const reach = Math.max(r.width, r.height) / 2 + radius
      if (dist < reach) {
        const pull = 1 - dist / reach
        xTo(dx * strength * pull)
        yTo(dy * strength * pull)
      } else {
        xTo(0)
        yTo(0)
      }
    }
    const onLeave = () => {
      xTo(0)
      yTo(0)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      gsap.set(inner, { x: 0, y: 0 })
    }
  }, [hasHover, reduced, radius, strength])

  return (
    <span ref={ref} className={`inline-block ${className ?? ''}`}>
      <span className="inline-block will-change-transform">{children}</span>
    </span>
  )
}
