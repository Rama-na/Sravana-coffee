import { useRef } from 'react'
import { gsap, markers } from '../lib/animations'
import { useGsapContext, MQ } from '../hooks/useGsapContext'
import { COPY, SECTION_LABELS } from '../data/site'
import { IMAGES } from '../data/images'
import { SectionLabel } from './ui/SectionLabel'
import { Steam } from './ui/Motifs'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE FIRST SIP — full bleed, coffee brown
 * ═══════════════════════════════════════════════════════════════════════════
 *  The tumbler rises, aroma drifts off it, and four words arrive one at a time
 *  and stay. Accumulating rather than flashing keeps it readable and keeps the
 *  section calm.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function BrewExperience() {
  const ref = useRef<HTMLElement>(null)

  useGsapContext(ref, (mm) => {
    mm.add(MQ.motion, () => {
      gsap.fromTo(
        '[data-brew-img]',
        { scale: 1.18, yPercent: 5 },
        {
          scale: 1,
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom bottom', scrub: 0.9, markers },
        },
      )

      gsap.fromTo(
        '[data-brew-word] > span',
        { yPercent: 115, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          ease: 'none',
          stagger: 0.9,
          scrollTrigger: { trigger: ref.current, start: 'top 42%', end: 'bottom 82%', scrub: 0.9, markers },
        },
      )

      gsap.fromTo(
        '[data-brew-close]',
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: '[data-brew-close]', start: 'top 88%', once: true, markers },
        },
      )

      gsap.fromTo(
        '[data-brew-steam]',
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 2.2,
          ease: 'power2.out',
          scrollTrigger: { trigger: ref.current, start: 'top 55%', once: true, markers },
        },
      )
    })

    mm.add(MQ.reduced, () => {
      gsap.set('[data-brew-word] > span,[data-brew-close],[data-brew-steam]', {
        autoAlpha: 1,
        y: 0,
        yPercent: 0,
      })
    })
  })

  return (
    <section ref={ref} id="brew" className="relative overflow-hidden">
      {/* full-bleed plate ------------------------------------------------- */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <img
          data-brew-img
          src={IMAGES.brewHero.src}
          alt=""
          width={IMAGES.brewHero.width}
          height={IMAGES.brewHero.height}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover opacity-[0.88] will-change-transform"
        />
        {/* Directional, not uniform: heavy over the type column on the left,
            almost clear over the tumbler on the right, so the photograph is
            visible and the copy still clears contrast. */}
        <span
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(96deg, color-mix(in srgb, var(--page-bg) 94%, transparent) 0%, color-mix(in srgb, var(--page-bg) 86%, transparent) 38%, color-mix(in srgb, var(--page-bg) 34%, transparent) 74%, color-mix(in srgb, var(--page-bg) 52%, transparent) 100%)',
          }}
        />
        <span
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--page-bg) 72%, transparent) 0%, transparent 22%, transparent 74%, color-mix(in srgb, var(--page-bg) 78%, transparent) 100%)',
          }}
        />
      </div>

      <div
        data-brew-steam
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[16%] h-[44vh] w-[30vw] -translate-x-1/2 opacity-0 lg:left-[64%]"
      >
        <Steam className="h-full w-full" opacity={0.42} />
      </div>

      <div className="shell relative py-[clamp(96px,18vh,220px)]">
        <SectionLabel {...SECTION_LABELS.brew} />

        <div className="mt-[clamp(40px,7vh,90px)] grid grid-cols-12">
          <div className="col-span-12 lg:col-span-7">
            <h2 className="text-[clamp(2.8rem,8vw,6.6rem)]">{COPY.brew.headline}</h2>

            <ul data-brew-word className="mt-[clamp(40px,7vh,88px)] space-y-[0.06em]">
              {COPY.brew.words.map((word) => (
                <li key={word} className="reveal-mask">
                  <span
                    className="display block text-[clamp(2.4rem,7vw,5.4rem)] leading-[1.08]"
                    style={{ color: 'var(--ink)' }}
                  >
                    {word}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-[clamp(64px,12vh,150px)] flex lg:justify-end">
          <p
            data-brew-close
            className="max-w-[22ch] font-display text-[clamp(1.5rem,4vw,3rem)] italic leading-[1.25] opacity-0 lg:text-right"
            style={{ color: 'var(--ink)' }}
          >
            {COPY.brew.closing}
          </p>
        </div>
      </div>
    </section>
  )
}
