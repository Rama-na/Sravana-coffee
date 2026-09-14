import { useRef } from 'react'
import { gsap, markers } from '../lib/animations'
import { useGsapContext, MQ } from '../hooks/useGsapContext'
import { COPY, SECTION_LABELS, JOURNEY_STEPS } from '../data/site'
import { IMAGES, type ImageAsset } from '../data/images'
import { SectionLabel } from './ui/SectionLabel'
import { Figure } from './ui/Figure'

const STEP_IMAGES: ImageAsset[] = [
  IMAGES.journeyBean,
  IMAGES.journeyRoast,
  IMAGES.journeyGrind,
  IMAGES.journeyBrew,
]

/** Deliberately unequal panels — a gallery, not a carousel of identical cards. */
const PANEL = [
  { w: 'lg:w-[26vw]', ratio: '3 / 4.2', shift: 'lg:-translate-y-[5%]' },
  { w: 'lg:w-[44vw]', ratio: '16 / 10', shift: 'lg:translate-y-[7%]' },
  { w: 'lg:w-[30vw]', ratio: '1 / 1', shift: 'lg:-translate-y-[2%]' },
  { w: 'lg:w-[34vw]', ratio: '6 / 5', shift: 'lg:translate-y-[5%]' },
]

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  FROM BEAN TO CUP — the signature interaction
 * ═══════════════════════════════════════════════════════════════════════════
 *  Desktop: the section pins and the track moves sideways under a vertical
 *  scroll — four unequal plates passing the viewport like a reel.
 *  Below 1024px, or with reduced motion, exactly the same content stacks
 *  vertically. The horizontal mode is never forced on touch.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function CoffeeJourney() {
  const ref = useRef<HTMLElement>(null)

  useGsapContext(ref, (mm) => {
    /* ── desktop: pin + horizontal scrub ──────────────────────────────── */
    mm.add(MQ.desktop, () => {
      const track = ref.current?.querySelector<HTMLElement>('[data-track]')
      const viewport = ref.current?.querySelector<HTMLElement>('[data-viewport]')
      if (!track || !viewport) return

      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth)

      const horizontal = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: () => '+=' + distance(),
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          markers,
          onUpdate: (self) => {
            gsap.set('[data-journey-progress]', { scaleX: self.progress })
            const i = Math.min(
              JOURNEY_STEPS.length - 1,
              Math.floor(self.progress * JOURNEY_STEPS.length + 0.18),
            )
            const counter = document.querySelector('[data-journey-count]')
            if (counter) counter.textContent = JOURNEY_STEPS[i].index
          },
        },
      })

      // each panel lifts a little as it reaches the middle of the screen
      gsap.utils.toArray<HTMLElement>('[data-panel]').forEach((panel) => {
        gsap.fromTo(
          panel,
          { autoAlpha: 0.35 },
          {
            autoAlpha: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: horizontal,
              start: 'left 92%',
              end: 'left 46%',
              scrub: true,
              markers: false,
            },
          },
        )
      })
    })

    /* ── stacked: reveal each step as it enters ───────────────────────── */
    mm.add(MQ.belowDesktop, () => {
      gsap.utils.toArray<HTMLElement>('[data-panel]').forEach((panel) => {
        gsap.fromTo(
          panel,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: panel, start: 'top 84%', once: true, markers },
          },
        )
      })
    })

    mm.add(MQ.reduced, () => {
      gsap.set('[data-panel]', { autoAlpha: 1, y: 0 })
    })
  })

  return (
    <section ref={ref} id="journey" className="relative">
      <div data-viewport className="relative lg:h-[100svh] lg:overflow-hidden">
        <div
          data-track
          className="flex flex-col gap-[clamp(56px,9vh,104px)] py-[var(--section-gap)] lg:h-full lg:flex-row lg:flex-nowrap lg:items-center lg:gap-[clamp(40px,4.4vw,90px)] lg:py-[clamp(78px,10vh,104px)] lg:pr-[10vw] lg:will-change-transform"
        >
          {/* intro panel -------------------------------------------------- */}
          <div className="w-full shrink-0 px-[var(--page-padding)] lg:w-[40vw] lg:pr-0">
            <SectionLabel {...SECTION_LABELS.journey} />
            <h2 className="mt-8 text-[clamp(2.6rem,7vw,5.6rem)]">
              {COPY.journey.headline[0]}
              <br />
              {COPY.journey.headline[1]}
            </h2>
            <p
              className="mt-7 max-w-[38ch] font-display text-[clamp(1.05rem,2vw,1.4rem)] italic leading-snug"
              style={{ color: 'var(--ink-soft)' }}
            >
              {COPY.journey.support}
            </p>
            <p className="meta mt-9 hidden lg:block" style={{ color: 'var(--ink-faint)' }}>
              Scroll →
            </p>
          </div>

          {/* the four steps ----------------------------------------------- */}
          {JOURNEY_STEPS.map((step, i) => (
            <article
              key={step.index}
              data-panel
              className={`w-full shrink-0 px-[var(--page-padding)] lg:px-0 ${PANEL[i].w} ${PANEL[i].shift}`}
            >
              <Figure
                image={STEP_IMAGES[i]}
                ratio={PANEL[i].ratio}
                parallax={0}
                maxHeight="56svh"
                sizes="(max-width: 1023px) 100vw, 45vw"
              />
              <div className="mt-6 flex items-start gap-5 border-t pt-5" style={{ borderColor: 'var(--rule)' }}>
                <span className="meta shrink-0 pt-1" style={{ color: 'var(--ink-faint)' }}>
                  {step.index}
                </span>
                <div>
                  <h3 className="text-[clamp(1.75rem,3.4vw,2.6rem)]">{step.title}</h3>
                  <p
                    className="mt-1 font-display text-[15px] italic"
                    style={{ color: 'var(--ink-soft)' }}
                  >
                    {step.caption}
                  </p>
                  <p
                    className="mt-4 max-w-[42ch] text-[14px] leading-[1.8]"
                    style={{ color: 'var(--ink-soft)' }}
                  >
                    {step.body}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* progress rail — desktop only ----------------------------------- */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden items-center gap-5 px-[var(--page-padding)] pb-7 lg:flex"
        >
          <span className="meta" style={{ color: 'var(--ink-soft)' }}>
            <span data-journey-count>01</span> / 0{JOURNEY_STEPS.length}
          </span>
          <span className="relative h-px flex-1" style={{ background: 'var(--rule)' }}>
            <span
              data-journey-progress
              className="absolute inset-0 block origin-left scale-x-0"
              style={{ background: 'var(--accent)' }}
            />
          </span>
          <span className="meta" style={{ color: 'var(--ink-faint)' }}>
            Bean → Cup
          </span>
        </div>
      </div>
    </section>
  )
}
