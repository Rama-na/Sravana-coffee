import { useRef } from 'react'
import { gsap, ScrollTrigger, markers } from '../lib/animations'
import { useGsapContext, MQ } from '../hooks/useGsapContext'
import { registerBand, syncTheme, themeInterpolator } from '../lib/theme'
import { IMAGES } from '../data/images'
import { BeanSolid, BeanGlyph } from './ui/Motifs'

/** Fixed, deterministic scatter — no per-frame randomness, no particle system. */
const SHARDS = [
  { x: -34, y: -26, r: -38, s: 0.5 },
  { x: 30, y: -32, r: 42, s: 0.42 },
  { x: -44, y: 18, r: 16, s: 0.36 },
  { x: 40, y: 24, r: -22, s: 0.46 },
  { x: -16, y: 40, r: 58, s: 0.3 },
  { x: 18, y: 44, r: -52, s: 0.34 },
  { x: -52, y: -6, r: 74, s: 0.26 },
  { x: 54, y: -2, r: -66, s: 0.28 },
]

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  BEAN → GROUNDS
 * ═══════════════════════════════════════════════════════════════════════════
 *  One bean turns, breaks, and becomes the ground coffee that carries the next
 *  section. Faked with layers, masks and transforms — no physics, no canvas,
 *  no particle system, so it costs nothing on a phone.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function RoastTransition() {
  const ref = useRef<HTMLElement>(null)

  useGsapContext(ref, (mm) => {
    // The colour story is not motion — it holds under prefers-reduced-motion
    // too, so this sits outside the matchMedia blocks.
    let unregister: (() => void) | undefined

    const paint = themeInterpolator('roast', 'coffee')

    const themeST = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 40%',
      end: 'top -18%',
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
      start: () => themeST.start,
      end: () => themeST.end,
      from: 'roast',
      to: 'coffee',
      paint,
    })
    requestAnimationFrame(() => syncTheme())

    mm.add(MQ.motion, () => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
          invalidateOnRefresh: true,
          markers,
        },
      })

      tl.fromTo('[data-rt-bean]', { rotate: -14, scale: 0.78, autoAlpha: 1 }, { rotate: 26, scale: 1.18 }, 0)
        .to('[data-rt-bean]', { scale: 1.6, autoAlpha: 0, duration: 0.25 }, 0.42)
        .fromTo(
          '[data-rt-shard]',
          { x: 0, y: 0, rotate: 0, scale: 0.2, autoAlpha: 0 },
          {
            x: (i) => `${SHARDS[i].x}vw`,
            y: (i) => `${SHARDS[i].y}vh`,
            rotate: (i) => SHARDS[i].r,
            scale: (i) => SHARDS[i].s,
            autoAlpha: 0.42,
            duration: 0.4,
          },
          0.36,
        )
        .to('[data-rt-shard]', { autoAlpha: 0, duration: 0.22 }, 0.66)
        .fromTo(
          '[data-rt-grounds]',
          { clipPath: 'circle(0% at 50% 50%)', autoAlpha: 0 },
          { clipPath: 'circle(78% at 50% 50%)', autoAlpha: 1, duration: 0.42 },
          0.4,
        )
        .fromTo('[data-rt-caption]', { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.16 }, 0.74)
        .to('[data-rt-caption]', { autoAlpha: 0, y: -22, duration: 0.14 }, 0.92)
    })

    mm.add(MQ.reduced, () => {
      gsap.set('[data-rt-grounds]', { autoAlpha: 1, clipPath: 'circle(100% at 50% 50%)' })
      gsap.set('[data-rt-bean],[data-rt-shard]', { autoAlpha: 0 })
      gsap.set('[data-rt-caption]', { autoAlpha: 1, y: 0 })
    })

    return () => unregister?.()
  })

  return (
    <section
      ref={ref}
      aria-label="From bean to grounds"
      className="relative h-[70svh] motion-safe:h-[112svh] lg:motion-safe:h-[152svh]"
    >
      <div className="sticky top-0 flex h-[70svh] items-center justify-center overflow-hidden motion-safe:h-[100svh]">
        {/* grounds, revealed through an expanding circle */}
        <div data-rt-grounds aria-hidden="true" className="absolute inset-0 opacity-0">
          <img
            src={IMAGES.groundsTexture.src}
            alt=""
            width={IMAGES.groundsTexture.width}
            height={IMAGES.groundsTexture.height}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover opacity-80"
          />
          <span
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(80% 60% at 50% 50%, transparent, color-mix(in srgb, var(--page-bg) 88%, transparent))',
            }}
          />
        </div>

        {/* shards */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {SHARDS.map((_, i) => (
            <span
              key={i}
              data-rt-shard
              className="absolute left-1/2 top-1/2 block w-[clamp(60px,9vw,130px)] -translate-x-1/2 -translate-y-1/2 opacity-0"
            >
              <BeanGlyph className="w-full" stroke="var(--ink)" strokeWidth={3} />
            </span>
          ))}
        </div>

        {/* the bean */}
        <span
          data-rt-bean
          aria-hidden="true"
          className="relative block w-[clamp(150px,24vw,330px)] will-change-transform"
        >
          <BeanSolid className="w-full" />
        </span>

        <p
          data-rt-caption
          className="absolute inset-x-0 bottom-[14%] mx-auto max-w-[30ch] px-6 text-center font-display text-[clamp(1.2rem,3vw,2.1rem)] italic opacity-0"
          style={{ color: 'var(--ink)' }}
        >
          Ground the day it is sold.
        </p>
      </div>
    </section>
  )
}
