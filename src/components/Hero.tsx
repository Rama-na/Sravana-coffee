import { useRef } from 'react'
import { gsap, markers, DUR, EASE } from '../lib/animations'
import { useGsapContext, MQ } from '../hooks/useGsapContext'
import { scrollToSection } from '../hooks/useLenis'
import { COPY, BRAND } from '../data/site'
import { IMAGES } from '../data/images'
import { Logo } from './ui/Logo'
import { BlurText } from './reactbits/BlurText'
import { BeanGlyph } from './ui/Motifs'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  HERO
 * ═══════════════════════════════════════════════════════════════════════════
 *  A stamp on a deep blue field. The year sits behind the seal like a
 *  watermark; on scroll the seal shrinks and lifts, the year swells and
 *  recedes, and the bean plate behind both comes up out of the dark — the
 *  hero transforms into the next section rather than sliding away from it.
 *
 *  Built on `position: sticky` rather than a ScrollTrigger pin, so the layout
 *  stays in normal flow and the section below can never show through it.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null)

  useGsapContext(
    ref,
    (mm) => {
      /* ── entrance ─────────────────────────────────────────────────────── */
      mm.add(MQ.motion, () => {
        if (!ready) return
        gsap
          .timeline({ defaults: { ease: EASE.out } })
          .fromTo('[data-hero-plate]', { autoAlpha: 0, scale: 1.16 }, { autoAlpha: 1, scale: 1.06, duration: 2.4 })
          .fromTo(
            '[data-hero-year] span',
            { yPercent: 108, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 1.25, stagger: 0.085 },
            0.12,
          )
          .fromTo('[data-hero-est]', { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.9 }, 0.5)
          .fromTo(
            '[data-hero-seal]',
            { autoAlpha: 0, scale: 0.82, rotate: -7 },
            { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.8, ease: 'power2.out' },
            0.42,
          )
          .fromTo('[data-hero-eyebrow]', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: DUR.medium }, 0.2)
          .fromTo('[data-hero-meta]', { autoAlpha: 0 }, { autoAlpha: 1, duration: DUR.medium }, 0.9)
          .fromTo('[data-hero-cue]', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: DUR.medium }, 1.15)
          .fromTo('[data-hero-drift]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 2, stagger: 0.2 }, 1)

        // the scroll cue breathes, slowly, forever
        gsap.to('[data-cue-line]', {
          scaleY: 1,
          transformOrigin: 'top',
          duration: 1.5,
          repeat: -1,
          repeatDelay: 0.35,
          ease: 'power2.inOut',
          yoyo: true,
          delay: 2,
        })
      })

      mm.add(MQ.reduced, () => {
        gsap.set(
          '[data-hero-plate],[data-hero-year] span,[data-hero-est],[data-hero-seal],[data-hero-eyebrow],[data-hero-meta],[data-hero-cue],[data-hero-drift]',
          { autoAlpha: 1, y: 0, x: 0, yPercent: 0, scale: 1, rotate: 0 },
        )
      })

      /* ── the transformation ───────────────────────────────────────────── */
      mm.add(MQ.motion, () => {
        const tl = gsap.timeline({
          // Without immediateRender:false these .to() tweens latch onto the
          // pre-entrance state and undo the intro the moment Lenis fires its
          // first scroll event.
          defaults: { immediateRender: false },
          scrollTrigger: {
            trigger: ref.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.9,
            invalidateOnRefresh: true,
            markers,
          },
        })

        // Explicit from-values (not implicit capture) so the scrub can never
        // latch onto the pre-entrance state and undo the intro.
        tl.fromTo('[data-hero-seal]', { scale: 1, yPercent: 0, autoAlpha: 1 }, { scale: 0.34, yPercent: -58, autoAlpha: 0.5, ease: 'none' }, 0)
          .fromTo('[data-hero-year]', { scale: 1, yPercent: 0, autoAlpha: 1 }, { scale: 1.3, autoAlpha: 0, yPercent: 12, ease: 'none' }, 0)
          .fromTo('[data-hero-est]', { autoAlpha: 1, x: 0 }, { autoAlpha: 0, x: -30, ease: 'none', duration: 0.35 }, 0)
          .fromTo('[data-hero-plate]', { scale: 1.06, autoAlpha: 1 }, { scale: 1.18, autoAlpha: 1, ease: 'none' }, 0)
          .fromTo('[data-hero-plate] img', { opacity: 0.42 }, { opacity: 0.66, ease: 'none' }, 0)
          .fromTo('[data-hero-wash]', { autoAlpha: 1 }, { autoAlpha: 0.82, ease: 'none' }, 0)
          .fromTo('[data-hero-eyebrow],[data-hero-meta]', { autoAlpha: 1 }, { autoAlpha: 0, ease: 'none', duration: 0.28 }, 0)
          .fromTo('[data-hero-support]', { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -24, ease: 'none', duration: 0.4 }, 0)
          .fromTo('[data-hero-cue]', { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: 24, ease: 'none', duration: 0.22 }, 0)
          .fromTo('[data-hero-drift]', { yPercent: 0, autoAlpha: 1 }, { yPercent: -140, autoAlpha: 0, ease: 'none', stagger: 0.08 }, 0)
      })
    },
    [ready],
  )

  return (
    <section
      ref={ref}
      id="top"
      aria-label="Saravana Coffee"
      className="relative h-[100svh] motion-safe:h-[152svh]"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        {/* bean plate ------------------------------------------------------ */}
        <div data-hero-plate className="absolute inset-0 -z-20 opacity-0 will-change-transform">
          <img
            src={IMAGES.heroBeans.src}
            alt=""
            width={IMAGES.heroBeans.width}
            height={IMAGES.heroBeans.height}
            fetchPriority="high"
            decoding="sync"
            className="h-full w-full object-cover opacity-[0.42]"
          />
        </div>
        {/* wash: keeps the centre dark so the seal always has its ground --- */}
        <div
          data-hero-wash
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(120% 85% at 50% 46%, color-mix(in srgb, var(--page-bg) 92%, transparent) 0%, color-mix(in srgb, var(--page-bg) 78%, transparent) 42%, color-mix(in srgb, var(--page-bg) 42%, transparent) 100%)',
          }}
        />

        {/* drifting beans -------------------------------------------------- */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <span data-hero-drift className="absolute left-[7%] top-[26%] block w-14 rotate-[-24deg] opacity-0 lg:w-20">
            <BeanGlyph className="w-full opacity-[0.14]" stroke="var(--ink)" strokeWidth={2.4} />
          </span>
          <span data-hero-drift className="absolute right-[9%] top-[62%] block w-11 rotate-[32deg] opacity-0 lg:w-16">
            <BeanGlyph className="w-full opacity-[0.12]" stroke="var(--ink)" strokeWidth={2.6} />
          </span>
        </div>

        {/* top rail -------------------------------------------------------- */}
        <div className="shell flex items-start justify-between pt-[clamp(84px,13vh,132px)]">
          <p data-hero-eyebrow className="meta opacity-0" style={{ color: 'var(--ink-soft)' }}>
            {COPY.hero.eyebrow}
          </p>
          <p
            data-hero-meta
            className="meta hidden text-right opacity-0 sm:block"
            style={{ color: 'var(--ink-faint)' }}
          >
            13.08° N
            <br />
            80.27° E
          </p>
        </div>

        {/* the stamp ------------------------------------------------------- */}
        <div className="shell relative flex min-h-0 flex-1 flex-col items-center justify-center pb-[clamp(44px,7vh,86px)]">
          <h1 className="relative flex w-full flex-col items-center">
            <span className="sr-only">
              {BRAND.name} — {BRAND.tagline.toLowerCase()} in {BRAND.city}, established{' '}
              {BRAND.established}
            </span>

            {/* seal sits above the year and dips into its cap line, so the
                numerals stay fully readable underneath the stamp */}
            <span
              data-hero-seal
              className="relative z-10 block w-[clamp(138px,19vw,236px)] opacity-0 will-change-transform"
            >
              <span
                aria-hidden="true"
                className="absolute inset-[-26%] -z-10 rounded-full"
                style={{
                  background:
                    'radial-gradient(closest-side, color-mix(in srgb, var(--page-bg) 88%, transparent), transparent 72%)',
                }}
              />
              <Logo variant="full" className="w-full" ink="#073C9D" field="#F4E5C4" />
            </span>

            <span
              data-hero-year
              aria-hidden="true"
              className="display relative -mt-[0.07em] flex whitespace-nowrap pb-[0.06em] text-[clamp(7.5rem,24vw,21rem)] leading-[0.9] will-change-transform"
              style={{ color: 'var(--ink)', fontVariantNumeric: 'lining-nums' }}
            >
              <span
                data-hero-est
                className="meta absolute right-[calc(100%+clamp(12px,2vw,28px))] top-[17%] hidden opacity-0 md:block"
                style={{ color: 'var(--ink-soft)' }}
              >
                Est.
              </span>
              {Array.from(COPY.hero.year).map((d, i) => (
                <span key={i} className="inline-block opacity-[0.2]" style={{ letterSpacing: '-0.035em' }}>
                  {d}
                </span>
              ))}
            </span>
          </h1>

          <div data-hero-support className="absolute inset-x-0 bottom-0 mx-auto max-w-2xl px-6 text-center">
            <BlurText
              text={COPY.hero.support}
              trigger="load"
              delay={1.05}
              className="font-display text-[clamp(1.05rem,2.4vw,1.55rem)] italic leading-snug"
              stagger={0.07}
            />
          </div>
        </div>

        {/* bottom rail ------------------------------------------------------ */}
        <div className="shell pb-[clamp(24px,4vh,52px)]">
          <div className="flex items-end justify-between gap-6">
            <button
              data-hero-cue
              type="button"
              onClick={() => scrollToSection('heritage', -12)}
              className="group flex items-center gap-3 opacity-0"
            >
              <span className="meta" style={{ color: 'var(--ink-soft)' }}>
                {COPY.hero.scroll}
              </span>
              <span className="relative block h-8 w-px overflow-hidden" aria-hidden="true">
                <span
                  className="absolute inset-0 block"
                  style={{ background: 'var(--rule)' }}
                />
                <span
                  data-cue-line
                  className="absolute inset-x-0 top-0 block h-full origin-top scale-y-0"
                  style={{ background: 'var(--ink)' }}
                />
              </span>
            </button>

            <p className="meta hidden opacity-40 sm:block" style={{ color: 'var(--ink)' }}>
              {BRAND.badgeLine}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
