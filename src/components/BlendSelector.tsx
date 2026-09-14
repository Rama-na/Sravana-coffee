import { useEffect, useRef } from 'react'
import { gsap, revealUp, splitReveal } from '../lib/animations'
import { useGsapContext, MQ } from '../hooks/useGsapContext'
import { COPY, SECTION_LABELS } from '../data/site'
import { PRODUCTS, type Product } from '../data/products'
import { SectionLabel } from './ui/SectionLabel'
import { Figure } from './ui/Figure'

interface Props {
  selected: Product['id']
  onSelect: (id: Product['id']) => void
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE BLENDS — royal blue
 * ═══════════════════════════════════════════════════════════════════════════
 *  Two panels, one choice. Built on real radio inputs so the keyboard and
 *  screen-reader behaviour is the platform's, not a re-implementation — the
 *  GSAP crossfade sits on top of that rather than replacing it.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function BlendSelector({ selected, onSelect }: Props) {
  const ref = useRef<HTMLElement>(null)
  const first = useRef(true)

  useGsapContext(ref, (mm) => {
    mm.add(MQ.motion, () => {
      const head = ref.current?.querySelector('[data-blend-head]')
      if (head) splitReveal(head, { start: 'top 82%' })
      revealUp('[data-reveal]', { trigger: ref.current!, start: 'top 76%', y: 30 })
    })
    mm.add(MQ.reduced, () => {
      gsap.set('[data-reveal],[data-blend-head]', { autoAlpha: 1, y: 0 })
    })
  })

  // crossfade the copy when the choice changes (never on first paint)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const el = ref.current?.querySelector('[data-blend-detail]')
    if (!el) return
    const tween = gsap.fromTo(
      el,
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out' },
    )
    return () => {
      tween.kill()
    }
  }, [selected])

  const active = PRODUCTS.find((p) => p.id === selected) ?? PRODUCTS[0]

  return (
    <section ref={ref} id="blends" className="relative py-[var(--section-gap)]">
      <div className="shell">
        <SectionLabel {...SECTION_LABELS.blends} />

        <div className="mt-[clamp(48px,8vh,96px)] grid grid-cols-12 gap-y-8">
          <h2
            data-blend-head
            className="col-span-12 text-[clamp(2.5rem,7vw,5.8rem)] lg:col-span-6"
            style={{ visibility: 'hidden' }}
          >
            {COPY.blends.headline[0]}
            <br />
            {COPY.blends.headline[1]}
          </h2>
          <p
            data-reveal
            className="col-span-12 max-w-[46ch] self-end text-[15px] leading-[1.85] lg:col-span-5 lg:col-start-8"
            style={{ color: 'var(--ink-soft)' }}
          >
            {COPY.blends.support}
          </p>
        </div>

        <fieldset className="mt-[clamp(48px,8vh,104px)] border-0 p-0" data-reveal>
          <legend className="sr-only">Choose a blend</legend>
          <div className="grid grid-cols-1 gap-[clamp(20px,3vw,40px)] md:grid-cols-2">
            {PRODUCTS.map((product, i) => {
              const isActive = product.id === selected
              return (
                <div key={product.id} className="relative">
                  <input
                    type="radio"
                    name="blend"
                    id={`blend-${product.id}`}
                    value={product.id}
                    checked={isActive}
                    onChange={() => onSelect(product.id)}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor={`blend-${product.id}`}
                    className="group block cursor-pointer border p-[clamp(18px,2.4vw,32px)] transition-[opacity,border-color,background-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[var(--accent)]"
                    style={{
                      borderColor: isActive ? 'var(--accent)' : 'var(--rule)',
                      backgroundColor: isActive ? 'var(--surface)' : 'transparent',
                      opacity: isActive ? 1 : 0.58,
                    }}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="meta">{product.subtitle}</span>
                      <span className="meta" style={{ color: 'var(--ink-faint)' }}>
                        0{i + 1}
                      </span>
                    </div>

                    <Figure
                      image={product.image}
                      ratio="4 / 5"
                      parallax={0}
                      className="mt-5"
                      sizes="(max-width: 767px) 92vw, 44vw"
                    />

                    <h3 className="mt-6 text-[clamp(1.6rem,3vw,2.35rem)]">{product.name}</h3>
                    <p
                      className="mt-1.5 font-display text-[15px] italic"
                      style={{ color: 'var(--ink-soft)' }}
                    >
                      {product.tagline}
                    </p>

                    <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                      {product.notes.map((note) => (
                        <li key={note} className="meta" style={{ color: 'var(--ink-faint)' }}>
                          {note}
                        </li>
                      ))}
                    </ul>

                    <span
                      aria-hidden="true"
                      className="meta mt-6 block transition-opacity duration-500"
                      style={{ opacity: isActive ? 1 : 0.5 }}
                    >
                      {isActive ? '● Selected' : '○ Select'}
                    </span>
                  </label>
                </div>
              )
            })}
          </div>
        </fieldset>

        {/* the chosen blend, in full ---------------------------------------- */}
        <div
          data-blend-detail
          className="mt-[clamp(40px,6vh,72px)] grid grid-cols-12 gap-y-6 border-t pt-[clamp(28px,4vh,52px)]"
          style={{ borderColor: 'var(--rule)' }}
        >
          <p className="meta col-span-12 lg:col-span-3" style={{ color: 'var(--ink-faint)' }}>
            {active.subtitle}
          </p>
          <p
            className="col-span-12 max-w-[62ch] text-[clamp(1rem,1.7vw,1.2rem)] leading-[1.8] lg:col-span-8 lg:col-start-5"
            aria-live="polite"
          >
            {active.description}
          </p>
        </div>
      </div>
    </section>
  )
}
