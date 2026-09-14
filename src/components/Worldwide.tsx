import { useRef } from 'react'
import { gsap, revealUp, splitReveal, markers } from '../lib/animations'
import { useGsapContext, MQ } from '../hooks/useGsapContext'
import { COPY, SECTION_LABELS, MARKETS, whatsappLink } from '../data/site'
import { SectionLabel } from './ui/SectionLabel'
import { ButtonLink } from './ui/Button'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  WORLDWIDE — midnight
 * ═══════════════════════════════════════════════════════════════════════════
 *  One dotted arc, one point travelling along it. No flight-path spaghetti,
 *  and no invented geography — the arc is an abstraction, not a map.
 *  The markets list is illustrative and lives in data/site.ts.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function Worldwide() {
  const ref = useRef<HTMLElement>(null)
  const order = whatsappLink(
    "Hi Saravana Coffee, I'd like to ask about international delivery.",
  )

  useGsapContext(ref, (mm) => {
    mm.add(MQ.motion, () => {
      const head = ref.current?.querySelector('[data-world-head]')
      if (head) splitReveal(head, { start: 'top 82%' })
      revealUp('[data-reveal]', { trigger: ref.current!, start: 'top 76%', y: 30 })

      const path = ref.current?.querySelector<SVGPathElement>('[data-world-path]')
      const dot = ref.current?.querySelector('[data-world-dot]')
      if (path && dot) {
        const len = path.getTotalLength()
        gsap.set(path, { strokeDasharray: '2 10', strokeDashoffset: 0 })
        const state = { p: 0 }
        gsap.to(state, {
          p: 1,
          ease: 'none',
          onUpdate: () => {
            const pt = path.getPointAtLength(len * state.p)
            gsap.set(dot, { attr: { cx: pt.x, cy: pt.y } })
          },
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 68%',
            end: 'bottom 78%',
            scrub: 1,
            markers,
          },
        })
      }
    })
    mm.add(MQ.reduced, () => gsap.set('[data-reveal],[data-world-head]', { autoAlpha: 1, y: 0 }))
  })

  return (
    <section ref={ref} id="worldwide" className="relative overflow-hidden py-[var(--section-gap)]">
      <div className="shell">
        <SectionLabel {...SECTION_LABELS.worldwide} />

        <div className="mt-[clamp(44px,7vh,96px)] grid grid-cols-12 gap-x-8 gap-y-[clamp(40px,6vh,80px)]">
          <h2
            data-world-head
            className="col-span-12 text-[clamp(2.4rem,6.6vw,5.4rem)] lg:col-span-7"
            style={{ visibility: 'hidden' }}
          >
            {COPY.worldwide.headline.map((line, i) => (
              <span key={line} className="block" style={{ paddingLeft: `${i * 6}%` }}>
                {line}
              </span>
            ))}
          </h2>

          <p
            data-reveal
            className="col-span-12 max-w-[40ch] self-end text-[15px] leading-[1.85] lg:col-span-4 lg:col-start-9"
            style={{ color: 'var(--ink-soft)' }}
          >
            {COPY.worldwide.body}
          </p>
        </div>

        {/* the arc ---------------------------------------------------------- */}
        <div data-reveal className="mt-[clamp(48px,8vh,110px)]" aria-hidden="true">
          <svg viewBox="0 0 1200 260" className="w-full" focusable="false">
            <path
              data-world-path
              d="M90 210C330 40 870 40 1110 130"
              fill="none"
              stroke="var(--rule)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="90" cy="210" r="5" fill="var(--accent)" />
            <circle cx="1110" cy="130" r="3.5" fill="var(--ink-soft)" />
            <circle data-world-dot cx="90" cy="210" r="7" fill="var(--accent)" opacity="0.9" />
            <text x="90" y="244" className="meta" fill="var(--ink-soft)" fontSize="11" letterSpacing="3">
              CHENNAI
            </text>
            <text
              x="1128"
              y="74"
              textAnchor="end"
              className="meta"
              fill="var(--ink-faint)"
              fontSize="11"
              letterSpacing="3"
            >
              WHEREVER HOME IS
            </text>
          </svg>
        </div>

        <ul
          data-reveal
          className="mt-[clamp(32px,5vh,64px)] flex flex-wrap gap-x-[clamp(20px,3vw,48px)] gap-y-3 border-t pt-7"
          style={{ borderColor: 'var(--rule)' }}
        >
          {MARKETS.map((market) => (
            <li key={market} className="meta" style={{ color: 'var(--ink-soft)' }}>
              {market}
            </li>
          ))}
        </ul>

        <div data-reveal className="mt-[clamp(30px,4vh,52px)]">
          <ButtonLink href={order ?? undefined} variant="outline" arrow>
            {COPY.worldwide.cta}
          </ButtonLink>
          {!order && (
            <p className="meta mt-4 max-w-[34ch]" style={{ color: 'var(--ink-faint)' }}>
              Add a WhatsApp number in src/data/site.ts
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
