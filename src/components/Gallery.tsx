import { useRef } from 'react'
import { gsap, revealUp } from '../lib/animations'
import { useGsapContext, MQ } from '../hooks/useGsapContext'
import { SECTION_LABELS } from '../data/site'
import { IMAGES, type ImageAsset } from '../data/images'
import { SectionLabel } from './ui/SectionLabel'
import { Figure } from './ui/Figure'

/** Three columns of unequal rhythm — an editorial spread, not a card grid. */
const COLUMNS: { image: ImageAsset; ratio: string; index: string }[][] = [
  [
    { image: IMAGES.galleryBeans, ratio: '3 / 4', index: '01' },
    { image: IMAGES.galleryRoastery, ratio: '16 / 10', index: '04' },
  ],
  [
    { image: IMAGES.galleryPowder, ratio: '4 / 3', index: '02' },
    { image: IMAGES.galleryFilter, ratio: '3 / 4.2', index: '05' },
  ],
  [
    { image: IMAGES.galleryTumbler, ratio: '1 / 1', index: '03' },
    { image: IMAGES.galleryChennai, ratio: '3 / 2', index: '06' },
  ],
]

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE ROASTERY — a restrained editorial gallery
 * ═══════════════════════════════════════════════════════════════════════════
 *  Columns are offset rather than aligned, and each frame keeps its own aspect
 *  ratio, so the spread never settles into a grid. One column on phones.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function Gallery() {
  const ref = useRef<HTMLElement>(null)

  useGsapContext(ref, (mm) => {
    mm.add(MQ.motion, () => {
      revealUp('[data-reveal]', { trigger: ref.current!, start: 'top 80%', y: 40, stagger: 0.09 })
    })
    mm.add(MQ.reduced, () => gsap.set('[data-reveal]', { autoAlpha: 1, y: 0 }))
  })

  return (
    <section ref={ref} id="gallery" className="relative py-[var(--section-gap)]">
      <div className="shell">
        <SectionLabel {...SECTION_LABELS.gallery} />

        <div className="mt-[clamp(40px,7vh,84px)] grid grid-cols-1 gap-x-[clamp(16px,2.4vw,40px)] gap-y-[clamp(28px,4vh,56px)] sm:grid-cols-2 lg:grid-cols-3">
          {COLUMNS.map((column, ci) => (
            <div
              key={ci}
              className="flex flex-col gap-[clamp(28px,4vh,56px)]"
              style={{ marginTop: `calc(${[0, 1, 0.45][ci]} * clamp(0px, 5vw, 84px))` }}
            >
              {column.map((item) => (
                <div key={item.index} data-reveal>
                  <Figure
                    image={item.image}
                    ratio={item.ratio}
                    index={item.index}
                    parallax={0.1}
                    sizes="(max-width: 640px) 92vw, (max-width: 1023px) 46vw, 30vw"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
