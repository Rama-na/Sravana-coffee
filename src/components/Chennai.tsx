import { useRef } from 'react'
import { gsap, revealUp, splitReveal } from '../lib/animations'
import { useGsapContext, MQ } from '../hooks/useGsapContext'
import { COPY, SECTION_LABELS, BRAND, SITE_CONFIG } from '../data/site'
import { IMAGES } from '../data/images'
import { SectionLabel } from './ui/SectionLabel'
import { Figure } from './ui/Figure'
import { ButtonLink } from './ui/Button'
import { FilterRings } from './ui/Motifs'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  BREWED IN CHENNAI — cream
 * ═══════════════════════════════════════════════════════════════════════════
 *  Deliberately not a map. A filter-mesh motif with a single marker and the
 *  city's coordinates stands in for geography, so nothing on the page implies
 *  a precise location that has not been confirmed. The street address is not
 *  shown; the directions link is the source of truth once it is configured.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function Chennai() {
  const ref = useRef<HTMLElement>(null)

  useGsapContext(ref, (mm) => {
    mm.add(MQ.motion, () => {
      const head = ref.current?.querySelector('[data-chennai-head]')
      if (head) splitReveal(head, { start: 'top 84%' })
      revealUp('[data-reveal]', { trigger: ref.current!, start: 'top 76%', y: 32 })
      gsap.to('[data-chennai-rings]', {
        rotate: 26,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 1.4 },
      })
    })
    mm.add(MQ.reduced, () => gsap.set('[data-reveal],[data-chennai-head]', { autoAlpha: 1, y: 0 }))
  })

  return (
    <section ref={ref} id="contact" className="relative overflow-hidden py-[var(--section-gap)]">
      <div className="shell">
        <SectionLabel {...SECTION_LABELS.chennai} />

        <div className="mt-[clamp(44px,7vh,96px)] grid grid-cols-12 items-center gap-x-8 gap-y-[clamp(40px,6vh,72px)]">
          <div className="col-span-12 lg:col-span-6">
            <h2
              data-chennai-head
              className="text-[clamp(2.6rem,7.4vw,5.8rem)]"
              style={{ visibility: 'hidden' }}
            >
              {COPY.chennai.headline}
            </h2>
            <p
              data-reveal
              className="mt-8 max-w-[40ch] font-display text-[clamp(1.15rem,2.4vw,1.6rem)] italic leading-snug"
              style={{ color: 'var(--ink-soft)' }}
            >
              {COPY.chennai.body}
            </p>

            <dl data-reveal className="mt-[clamp(32px,5vh,56px)] flex flex-wrap gap-x-12 gap-y-6">
              <div>
                <dt className="meta" style={{ color: 'var(--ink-faint)' }}>
                  Roastery
                </dt>
                <dd className="mt-2 font-display text-[clamp(1.3rem,2.6vw,1.85rem)]">
                  {BRAND.locality}
                </dd>
              </div>
              <div>
                <dt className="meta" style={{ color: 'var(--ink-faint)' }}>
                  Coordinates
                </dt>
                <dd className="mt-2 font-display text-[clamp(1.3rem,2.6vw,1.85rem)]">
                  13.08° N · 80.27° E
                </dd>
              </div>
            </dl>

            <div data-reveal className="mt-[clamp(30px,4vh,48px)]">
              <ButtonLink href={SITE_CONFIG.mapsUrl || undefined} variant="outline" arrow>
                {COPY.chennai.cta}
              </ButtonLink>
              {!SITE_CONFIG.mapsUrl && (
                <p className="meta mt-4 max-w-[34ch]" style={{ color: 'var(--ink-faint)' }}>
                  Add a Google Maps URL in src/data/site.ts
                </p>
              )}
            </div>
          </div>

          <div className="relative col-span-12 lg:col-span-5 lg:col-start-8" data-reveal>
            <span
              data-chennai-rings
              aria-hidden="true"
              className="pointer-events-none absolute -inset-[12%] z-10"
              style={{ color: 'var(--rule)' }}
            >
              <FilterRings className="h-full w-full" rings={9} />
            </span>
            <Figure image={IMAGES.galleryChennai} ratio="4 / 3" sizes="(max-width: 1023px) 100vw, 40vw" />
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 z-20 block h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: 'var(--accent)', boxShadow: '0 0 0 6px color-mix(in srgb, var(--accent) 22%, transparent)' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
