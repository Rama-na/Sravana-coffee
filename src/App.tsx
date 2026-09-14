import { useEffect, useState } from 'react'
import { useLenis } from './hooks/useLenis'
import { ScrollTrigger, refreshOnSettle } from './lib/animations'
import { invalidateBands, setInitialTheme, syncTheme } from './lib/theme'
import { initDebug } from './lib/debug'
import type { Product } from './data/products'

import { Preloader } from './components/Preloader'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Heritage } from './components/Heritage'
import { DecadesBridge } from './components/DecadesBridge'
import { CoffeeJourney } from './components/CoffeeJourney'
import { RoastTransition } from './components/RoastTransition'
import { BlendSelector } from './components/BlendSelector'
import { ProductShowcase } from './components/ProductShowcase'
import { BrewExperience } from './components/BrewExperience'
import { FilterCraft } from './components/FilterCraft'
import { Gallery } from './components/Gallery'
import { Chennai } from './components/Chennai'
import { Worldwide } from './components/Worldwide'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'
import { ThemeShift } from './components/ui/ThemeShift'
import { BeanGlyph } from './components/ui/Motifs'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE PAGE
 * ═══════════════════════════════════════════════════════════════════════════
 *  One continuous scroll. Sections are transparent; the single page background
 *  is scrubbed from one theme to the next by the <ThemeShift> bands sitting
 *  between them, which is what makes the colour story read as one surface:
 *
 *    midnight → cream → roast → coffee → royal → paper → coffee
 *             → paper → cream → midnight → royal → midnight
 * ═══════════════════════════════════════════════════════════════════════════
 */
export default function App() {
  const [ready, setReady] = useState(false)
  const [blend, setBlend] = useState<Product['id']>('classic')

  useLenis()

  useEffect(() => {
    initDebug()
    setInitialTheme('midnight')

    /**
     * One driver for the page colour. Relying on each band's own enter/leave
     * callbacks leaves the page a stale colour whenever a scroll jump skips
     * clean over a band — an anchor link, a restored scroll position, a
     * trackpad flick. Resolving from the actual scroll position every update
     * is cheap (the result is memoised) and cannot get out of step.
     */
    const driver = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => syncTheme(self.scroll()),
      onRefresh: () => {
        invalidateBands()
        syncTheme()
      },
    })

    refreshOnSettle(() => {
      invalidateBands()
      syncTheme()
    })

    return () => driver.kill()
  }, [])

  return (
    <>
      <a className="skip-link" href="#heritage">
        Skip to content
      </a>
      <div className="grain" aria-hidden="true" />

      {!ready && <Preloader onDone={() => setReady(true)} />}

      <Navbar />

      <main id="main">
        <Hero ready={ready} />

        <ThemeShift from="midnight" to="cream" height={38}>
          <p
            className="mx-auto max-w-[26ch] font-display text-[clamp(1.2rem,3.2vw,2.2rem)] italic leading-snug"
            style={{ color: 'var(--ink)' }}
          >
            Thirty years of the same morning.
          </p>
        </ThemeShift>

        <Heritage />
        <DecadesBridge />
        <CoffeeJourney />
        <RoastTransition />

        <ThemeShift from="coffee" to="royal" height={40} />
        <BlendSelector selected={blend} onSelect={setBlend} />

        <ThemeShift from="royal" to="paper" height={40} />
        <ProductShowcase selected={blend} onSelect={setBlend} />

        <ThemeShift from="paper" to="coffee" height={38}>
          <span className="mx-auto block w-[clamp(44px,5vw,72px)]" style={{ color: 'var(--ink)' }}>
            <BeanGlyph className="w-full opacity-40" stroke="currentColor" strokeWidth={2.6} />
          </span>
        </ThemeShift>
        <BrewExperience />

        <ThemeShift from="coffee" to="paper" height={40} />
        <FilterCraft />
        <Gallery />

        <ThemeShift from="paper" to="cream" height={38} />
        <Chennai />

        <ThemeShift from="cream" to="midnight" height={42} />
        <Worldwide />

        <ThemeShift from="midnight" to="royal" height={38} />
        <FinalCTA />

        <ThemeShift from="royal" to="midnight" height={40} />
      </main>

      <Footer />
    </>
  )
}
