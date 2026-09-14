import { useRef } from 'react'
import { gsap, revealUp, splitReveal } from '../lib/animations'
import { useGsapContext, MQ } from '../hooks/useGsapContext'
import { COPY, SECTION_LABELS, CRAFT_POINTS } from '../data/site'
import { SectionLabel } from './ui/SectionLabel'
import { BeanGlyph, FilterRings, GroundsDots } from './ui/Motifs'

const MOTIF = [
  <BeanGlyph key="a" className="h-full w-full" stroke="currentColor" strokeWidth={2.6} />,
  <FilterRings key="b" className="h-full w-full" rings={6} />,
  <GroundsDots key="c" className="h-full w-full" count={60} />,
]

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  WHAT MAKES FILTER COFFEE DIFFERENT — warm paper
 * ═══════════════════════════════════════════════════════════════════════════
 *  A short editorial explainer. Describes method only — no health claims.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function FilterCraft() {
  const ref = useRef<HTMLElement>(null)

  useGsapContext(ref, (mm) => {
    mm.add(MQ.motion, () => {
      const head = ref.current?.querySelector('[data-craft-head]')
      if (head) splitReveal(head, { start: 'top 84%' })
      revealUp('[data-reveal]', { trigger: ref.current!, start: 'top 76%', y: 34, stagger: 0.14 })
    })
    mm.add(MQ.reduced, () => gsap.set('[data-reveal],[data-craft-head]', { autoAlpha: 1, y: 0 }))
  })

  return (
    <section ref={ref} id="craft" className="relative py-[var(--section-gap)]">
      <div className="shell">
        <SectionLabel {...SECTION_LABELS.craft} />

        <h2
          data-craft-head
          className="mt-[clamp(44px,7vh,90px)] max-w-[14ch] text-[clamp(2.3rem,6.2vw,5rem)]"
          style={{ visibility: 'hidden' }}
        >
          {COPY.craft.headline.join(' ')}
        </h2>

        <ol className="mt-[clamp(48px,8vh,110px)] grid grid-cols-1 gap-x-8 gap-y-[clamp(40px,6vh,72px)] md:grid-cols-3">
          {CRAFT_POINTS.map((point, i) => (
            <li key={point.index} data-reveal className="border-t pt-7" style={{ borderColor: 'var(--rule)' }}>
              <div className="flex items-start justify-between gap-4">
                <span className="meta" style={{ color: 'var(--ink-faint)' }}>
                  {point.index}
                </span>
                <span
                  aria-hidden="true"
                  className="h-12 w-12 shrink-0"
                  style={{ color: 'var(--ink-soft)' }}
                >
                  {MOTIF[i]}
                </span>
              </div>
              <h3 className="mt-6 text-[clamp(1.35rem,2.4vw,1.85rem)]">{point.title}</h3>
              <p
                className="mt-4 max-w-[38ch] text-[14px] leading-[1.85]"
                style={{ color: 'var(--ink-soft)' }}
              >
                {point.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
