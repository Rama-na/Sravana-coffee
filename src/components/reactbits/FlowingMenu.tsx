import { useRef } from 'react'
import { gsap } from '../../lib/animations'
import { useHasHover, useReducedMotion } from '../../hooks/useMediaQuery'

export interface FlowingMenuItem {
  id: string
  label: string
  meta?: string
}

interface FlowingMenuProps {
  items: readonly FlowingMenuItem[]
  onSelect: (id: string) => void
  className?: string
}

/**
 * Full-screen menu rows. On hover a cream band wipes in from the direction the
 * pointer arrived and the label inverts — one gesture, no bouncing.
 * Keyboard and touch users get the same states without the wipe.
 */
export function FlowingMenu({ items, onSelect, className }: FlowingMenuProps) {
  const hasHover = useHasHover()
  const reduced = useReducedMotion()
  const rowsRef = useRef<Map<string, HTMLElement>>(new Map())

  const edge = (el: HTMLElement, e: React.PointerEvent) => {
    const r = el.getBoundingClientRect()
    return e.clientY - r.top < r.height / 2 ? -101 : 101
  }

  const enter = (id: string) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!hasHover || reduced) return
    const row = rowsRef.current.get(id)
    const band = row?.querySelector('[data-band]')
    if (!row || !band) return
    gsap.killTweensOf(band)
    gsap.fromTo(
      band,
      { yPercent: edge(row, e) },
      { yPercent: 0, duration: 0.52, ease: 'power3.out' },
    )
  }

  const leave = (id: string) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!hasHover || reduced) return
    const row = rowsRef.current.get(id)
    const band = row?.querySelector('[data-band]')
    if (!row || !band) return
    gsap.killTweensOf(band)
    gsap.to(band, { yPercent: edge(row, e), duration: 0.42, ease: 'power3.in' })
  }

  return (
    <ul className={className}>
      {items.map((item, i) => (
        <li
          key={item.id}
          ref={(el) => {
            if (el) rowsRef.current.set(item.id, el)
            else rowsRef.current.delete(item.id)
          }}
          className="relative isolate overflow-hidden border-t"
          style={{ borderColor: 'var(--rule)' }}
        >
          <span
            data-band
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 translate-y-full"
            style={{ background: 'var(--accent)' }}
          />
          <button
            type="button"
            onClick={() => onSelect(item.id)}
            onPointerEnter={enter(item.id)}
            onPointerLeave={leave(item.id)}
            className="group flex w-full items-baseline justify-between gap-6 py-[clamp(14px,2.6vh,30px)] text-left transition-colors duration-300 hover:text-[var(--page-bg)] focus-visible:text-[var(--page-bg)]"
          >
            <span className="flex items-baseline gap-4 sm:gap-7">
              <span className="meta opacity-45">{String(i + 1).padStart(2, '0')}</span>
              <span className="display text-[clamp(2.9rem,11vw,5.5rem)]">{item.label}</span>
            </span>
            {item.meta && (
              <span className="meta hidden shrink-0 opacity-55 sm:block">{item.meta}</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  )
}
