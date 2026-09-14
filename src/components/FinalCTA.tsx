import { useRef } from 'react'
import { gsap, splitReveal, drift } from '../lib/animations'
import { useGsapContext, MQ } from '../hooks/useGsapContext'
import { COPY, BRAND, whatsappLink } from '../data/site'
import { scrollToSection } from '../hooks/useLenis'
import { Logo } from './ui/Logo'
import { Button, ButtonLink } from './ui/Button'
import { BeanGlyph } from './ui/Motifs'

const BEANS = [
  'left-[4%] top-[14%] w-12 rotate-[-28deg] lg:w-20',
  'right-[6%] top-[22%] w-10 rotate-[36deg] lg:w-16',
  'left-[12%] bottom-[16%] w-9 rotate-[12deg] lg:w-14',
  'right-[14%] bottom-[12%] w-11 rotate-[-18deg] lg:w-[68px]',
]

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  READY FOR YOUR MORNING? — brand blue
 * ═══════════════════════════════════════════════════════════════════════════
 *  The seal comes back, the beans drift in at the margins, and the page makes
 *  its one direct ask.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function FinalCTA() {
  const ref = useRef<HTMLElement>(null)
  const wa = whatsappLink("Hi Saravana Coffee, I'd like to place an order.")

  useGsapContext(ref, (mm) => {
    mm.add(MQ.motion, () => {
      const head = ref.current?.querySelector('[data-cta-head]')
      if (head) splitReveal(head, { start: 'top 80%' })

      gsap.fromTo(
        '[data-cta-reveal]',
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 66%', once: true },
        },
      )
      gsap.fromTo(
        '[data-cta-seal]',
        { autoAlpha: 0, scale: 0.86 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: ref.current, start: 'top 70%', once: true },
        },
      )
      gsap.utils.toArray<HTMLElement>('[data-cta-bean]').forEach((bean, i) => {
        drift(bean, { distance: 90 + i * 28, rotate: i % 2 ? 16 : -16, trigger: ref.current! })
      })
    })
    mm.add(MQ.reduced, () =>
      gsap.set('[data-cta-reveal],[data-cta-seal],[data-cta-head]', { autoAlpha: 1, y: 0, scale: 1 }),
    )
  })

  return (
    <section
      ref={ref}
      id="order"
      className="relative overflow-hidden py-[clamp(110px,20vh,240px)] text-center"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {BEANS.map((cls, i) => (
          <span key={i} data-cta-bean className={`absolute block ${cls}`}>
            <BeanGlyph className="w-full opacity-[0.16]" stroke="var(--ink)" strokeWidth={2.6} />
          </span>
        ))}
      </div>

      <div className="shell-narrow relative">
        <span data-cta-seal className="mx-auto block w-[clamp(96px,11vw,142px)] opacity-0">
          <Logo variant="full" className="w-full" ink="#073C9D" field="#F4E5C4" />
        </span>

        <h2
          data-cta-head
          className="mt-[clamp(32px,5vh,60px)] text-[clamp(2.8rem,8.4vw,7rem)]"
          style={{ visibility: 'hidden' }}
        >
          {COPY.finalCta.headline[0]}
          <br />
          {COPY.finalCta.headline[1]}
        </h2>

        <p
          data-cta-reveal
          className="mx-auto mt-[clamp(24px,4vh,44px)] max-w-[34ch] font-display text-[clamp(1.1rem,2.3vw,1.5rem)] italic leading-snug opacity-0"
          style={{ color: 'var(--ink-soft)' }}
        >
          {COPY.finalCta.body}
        </p>

        <div
          data-cta-reveal
          className="mt-[clamp(34px,5vh,60px)] flex flex-wrap items-center justify-center gap-3 opacity-0"
        >
          <Button variant="primary" arrow onClick={() => scrollToSection('shop', -12)}>
            {COPY.finalCta.primary}
          </Button>
          <ButtonLink href={wa ?? undefined} variant="outline" arrow>
            {COPY.finalCta.secondary}
          </ButtonLink>
        </div>

        <p
          data-cta-reveal
          className="meta mt-[clamp(48px,8vh,96px)] opacity-0"
          style={{ color: 'var(--ink-faint)' }}
        >
          {BRAND.name} — Est. {BRAND.established}
        </p>
      </div>
    </section>
  )
}
