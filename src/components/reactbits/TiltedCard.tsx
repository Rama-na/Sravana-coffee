import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from '../../lib/animations'
import { useHasHover, useReducedMotion } from '../../hooks/useMediaQuery'

interface TiltedCardProps {
  children: ReactNode
  className?: string
  /** Maximum rotation in degrees. Small numbers only — this is not a toy. */
  max?: number
  /** Lift on hover, in px. */
  lift?: number
}

/**
 * A restrained parallax tilt. Two or three degrees, enough to suggest the
 * image is a physical print being turned, not a spinning card.
 */
export function TiltedCard({ children, className, max = 3.2, lift = 6 }: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const hasHover = useHasHover()
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || !hasHover || reduced) return
    const inner = el.firstElementChild as HTMLElement | null
    if (!inner) return

    const set = {
      rx: gsap.quickTo(inner, 'rotationX', { duration: 0.8, ease: 'power3.out' }),
      ry: gsap.quickTo(inner, 'rotationY', { duration: 0.8, ease: 'power3.out' }),
      y: gsap.quickTo(inner, 'y', { duration: 0.8, ease: 'power3.out' }),
    }

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      set.rx(-py * max * 2)
      set.ry(px * max * 2)
      set.y(-lift)
    }
    const onLeave = () => {
      set.rx(0)
      set.ry(0)
      set.y(0)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      gsap.set(inner, { rotationX: 0, rotationY: 0, y: 0 })
    }
  }, [hasHover, reduced, max, lift])

  return (
    <div ref={ref} className={className} style={{ perspective: '1200px' }}>
      <div className="h-full w-full will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </div>
  )
}
