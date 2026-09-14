import { useRef } from 'react'
import { gsap, ScrollTrigger, markers } from '../lib/animations'
import { useGsapContext, MQ } from '../hooks/useGsapContext'
import { registerBand, syncTheme, themeInterpolator } from '../lib/theme'
import { COPY } from '../data/site'
import { IMAGES } from '../data/images'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  HERITAGE → JOURNEY  ·  cream turning to dark roast
 * ═══════════════════════════════════════════════════════════════════════════
 *  The seam between the two halves of the page. The cream cools into roast
 *  first; only once it has settled do the three words arrive, so the type is
 *  always cream-on-dark and never sits at a low-contrast midpoint.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function DecadesBridge() {
  const ref = useRef<HTMLElement>(null)

  useGsapContext(ref, (mm) => {
    // The colour story is not motion — it holds under prefers-reduced-motion
    // too, so this sits outside the matchMedia blocks.
    let unregister: (() => void) | undefined

    const paint = themeInterpolator('cream', 'roast')

    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 46%',
      end: 'top 2%',
      markers,
      onUpdate: (self) => {
        if (self.isActive) paint(self.progress)
      },
      onEnter: () => syncTheme(),
      onEnterBack: () => syncTheme(),
      onLeave: () => syncTheme(),
      onLeaveBack: () => syncTheme(),
    })
    unregister = registerBand({
      start: () => st.start,
      end: () => st.end,
      from: 'cream',
      to: 'roast',
      paint,
    })
    requestAnimationFrame(() => syncTheme())

    mm.add(MQ.motion, () => {
      gsap.fromTo(
        '[data-bridge-plate]',
        { autoAlpha: 0, scale: 1.32 },
        {
          autoAlpha: 0.5,
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top 55%', end: 'bottom bottom', scrub: 0.9, markers },
        },
      )

      gsap.fromTo(
        '[data-bridge-line] > span',
        { yPercent: 118, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 1.3,
          stagger: 0.13,
          ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 30%', once: true, markers },
        },
      )

      gsap.to('[data-bridge-copy]', {
        yPercent: -22,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'bottom 88%', end: 'bottom 30%', scrub: 0.8, markers },
      })
    })

    mm.add(MQ.reduced, () => {
      gsap.set('[data-bridge-line] > span', { autoAlpha: 1, yPercent: 0 })
      gsap.set('[data-bridge-plate]', { autoAlpha: 0.4 })
    })

    return () => unregister?.()
  })

  return (
    <section
      ref={ref}
      aria-label="Three decades of coffee"
      className="relative h-auto py-[var(--section-gap)] motion-safe:h-[104svh] motion-safe:py-0 lg:motion-safe:h-[132svh]"
    >
      <div className="motion-safe:sticky motion-safe:top-0 motion-safe:flex motion-safe:h-[100svh] motion-safe:items-center">
        <div
          data-bridge-plate
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-0"
        >
          <img
            src={IMAGES.groundsTexture.src}
            alt=""
            width={IMAGES.groundsTexture.width}
            height={IMAGES.groundsTexture.height}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <span
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(100% 72% at 50% 50%, color-mix(in srgb, var(--page-bg) 62%, transparent), color-mix(in srgb, var(--page-bg) 94%, transparent))',
            }}
          />
        </div>

        <div data-bridge-copy className="shell relative w-full">
          <p
            data-bridge-line
            className="display text-[clamp(3rem,13vw,11rem)] leading-[0.88]"
            style={{ color: 'var(--ink)' }}
          >
            {COPY.heritage.closing.map((line, i) => (
              <span key={line} className="reveal-mask">
                <span
                  className="block"
                  style={{ paddingLeft: `${i * 8}%`, opacity: 1 - i * 0.16 }}
                >
                  {line}
                </span>
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  )
}
