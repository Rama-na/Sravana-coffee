import { useRef } from 'react'
import { gsap, splitReveal, revealUp, drift, markers } from '../lib/animations'
import { useGsapContext, MQ } from '../hooks/useGsapContext'
import { COPY, SECTION_LABELS, BRAND } from '../data/site'
import { IMAGES } from '../data/images'
import { SectionLabel } from './ui/SectionLabel'
import { Figure } from './ui/Figure'
import { ScrollReveal } from './reactbits/ScrollReveal'
import { TiltedCard } from './reactbits/TiltedCard'
import { BeanGlyph } from './ui/Motifs'

const TIMELINE = [
  { year: '1995', note: 'The first roast' },
  { year: 'Then', note: 'One shop, one drum' },
  { year: 'Today', note: 'Same roast, wider table' },
]

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  HERITAGE — cream
 * ═══════════════════════════════════════════════════════════════════════════
 *  The year returns, this time as a watermark the copy is set over. Two
 *  photographs of the same subject thirty years apart, deliberately unequal in
 *  size, with a hairline timeline running between them.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function Heritage() {
  const ref = useRef<HTMLElement>(null)

  useGsapContext(ref, (mm) => {
    mm.add(MQ.motion, () => {
      const head = ref.current?.querySelector('[data-heritage-head]')
      if (head) splitReveal(head, { start: 'top 82%' })

      revealUp('[data-reveal]', { trigger: ref.current!, start: 'top 78%', y: 28 })

      const ghost = ref.current?.querySelector('[data-ghost]')
      if (ghost) drift(ghost, { distance: 180, trigger: ref.current! })

      const bean = ref.current?.querySelector('[data-heritage-bean]')
      if (bean) drift(bean, { distance: 230, rotate: 22, trigger: ref.current! })

      gsap.fromTo(
        '[data-timeline-rail]',
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: 'top',
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-timeline]',
            start: 'top 76%',
            end: 'bottom 70%',
            scrub: 0.8,
            markers,
          },
        },
      )
      gsap.fromTo(
        '[data-timeline-node]',
        { autoAlpha: 0, x: -12 },
        {
          autoAlpha: 1,
          x: 0,
          stagger: 0.5,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-timeline]',
            start: 'top 76%',
            end: 'bottom 72%',
            scrub: 0.8,
            markers,
          },
        },
      )
    })

    mm.add(MQ.reduced, () => {
      gsap.set('[data-reveal],[data-timeline-node],[data-heritage-head]', { autoAlpha: 1, x: 0, y: 0 })
      gsap.set('[data-timeline-rail]', { scaleY: 1 })
    })
  })

  return (
    <section ref={ref} id="heritage" className="relative overflow-hidden py-[var(--section-gap)]">
      {/* watermark year */}
      <span
        data-ghost
        aria-hidden="true"
        className="display pointer-events-none absolute left-[46%] top-[36%] select-none text-[clamp(11rem,32vw,32rem)] leading-none"
        style={{ color: 'var(--ink-faint)', fontVariantNumeric: 'lining-nums' }}
      >
        {BRAND.established}
      </span>

      <div className="shell relative">
        <SectionLabel {...SECTION_LABELS.heritage} />

        {/* headline + lead ------------------------------------------------- */}
        <div className="mt-[clamp(52px,9vh,110px)] grid grid-cols-12 gap-y-10">
          <h2
            data-heritage-head
            className="col-span-12 text-[clamp(2.6rem,7.4vw,6.4rem)] lg:col-span-7"
            style={{ visibility: 'hidden' }}
          >
            {COPY.heritage.headline[0]}
            <br />
            {COPY.heritage.headline[1]}
          </h2>

          <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:pt-4">
            <ScrollReveal
              className="max-w-[46ch] text-[15px] leading-[1.85] md:text-base"
              from={0.28}
            >
              {COPY.heritage.body}
            </ScrollReveal>
          </div>
        </div>

        {/* the pairing ------------------------------------------------------ */}
        <div className="relative mt-[clamp(56px,11vh,140px)] grid grid-cols-12 items-start gap-x-6 gap-y-12">
          {/* timeline rail */}
          <div
            data-timeline
            className="col-span-12 flex gap-8 lg:col-span-2 lg:block lg:pt-6"
          >
            <div className="relative hidden lg:block">
              <span
                data-timeline-rail
                aria-hidden="true"
                className="absolute left-[3px] top-2 block h-[calc(100%-16px)] w-px origin-top"
                style={{ background: 'var(--rule)' }}
              />
              <ul className="space-y-[clamp(48px,9vh,110px)]">
                {TIMELINE.map((t) => (
                  <li key={t.year} data-timeline-node className="relative pl-6">
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-[7px] block h-[7px] w-[7px] rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                    <span className="meta block">{t.year}</span>
                    <span
                      className="mt-1.5 block font-display text-[15px] italic"
                      style={{ color: 'var(--ink-soft)' }}
                    >
                      {t.note}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="flex w-full gap-6 lg:hidden" data-reveal>
              {TIMELINE.map((t) => (
                <li key={t.year} className="flex-1 border-t pt-3" style={{ borderColor: 'var(--rule)' }}>
                  <span className="meta block">{t.year}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* THEN — tall */}
          <div className="col-span-12 sm:col-span-7 lg:col-span-5" data-reveal>
            <TiltedCard>
              <Figure
                image={IMAGES.heritageThen}
                ratio="3 / 4.1"
                index="01"
                caption={COPY.heritage.then + ' — ' + IMAGES.heritageThen.caption}
                sizes="(max-width: 640px) 100vw, 42vw"
              />
            </TiltedCard>
          </div>

          {/* TODAY — smaller, dropped, overlapping */}
          <div
            className="col-span-12 sm:col-span-5 sm:-mt-6 lg:col-span-4 lg:col-start-9 lg:mt-[clamp(90px,18vh,240px)] lg:-ml-16"
            data-reveal
          >
            <Figure
              image={IMAGES.heritageToday}
              ratio="4 / 3"
              index="02"
              caption={COPY.heritage.now + ' — ' + IMAGES.heritageToday.caption}
              sizes="(max-width: 640px) 100vw, 34vw"
            />
          </div>

          <span
            data-heritage-bean
            aria-hidden="true"
            className="pointer-events-none absolute right-[6%] top-[2%] hidden w-14 lg:block"
          >
            <BeanGlyph className="w-full opacity-25" stroke="var(--ink)" strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </section>
  )
}
