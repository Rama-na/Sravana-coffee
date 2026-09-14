/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  IMAGE MANIFEST — the single place images are referenced from
 * ═══════════════════════════════════════════════════════════════════════════
 *  Every image on the site is imported here and referenced by a semantic key.
 *  Vite rewrites these URLs for the GitHub Pages base path automatically.
 *
 *  ⚠️  All files in src/assets/images/ are generated placeholders
 *      (see scripts/generate-placeholder-art.mjs). To use real photography:
 *
 *      1. Export the photo as .webp, ~1600–2000px on the long edge
 *      2. Save it over the matching file in src/assets/images/
 *      3. Update the `alt` text below — nothing else changes
 *
 *  Alt text is part of the manifest so it can never drift from the image.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import heroBeansSrc from '../assets/images/hero-beans.webp'
import heritageThenSrc from '../assets/images/heritage-then.webp'
import heritageTodaySrc from '../assets/images/heritage-today.webp'
import journeyBeanSrc from '../assets/images/journey-bean.webp'
import journeyRoastSrc from '../assets/images/journey-roast.webp'
import journeyGrindSrc from '../assets/images/journey-grind.webp'
import journeyBrewSrc from '../assets/images/journey-brew.webp'
import brewHeroSrc from '../assets/images/brew-hero.webp'
import blendClassicSrc from '../assets/images/blend-classic.webp'
import blendPureSrc from '../assets/images/blend-pure.webp'
import productPackSrc from '../assets/images/product-pack.webp'
import galleryBeansSrc from '../assets/images/gallery-beans.webp'
import galleryPowderSrc from '../assets/images/gallery-powder.webp'
import galleryFilterSrc from '../assets/images/gallery-filter.webp'
import galleryTumblerSrc from '../assets/images/gallery-tumbler.webp'
import galleryRoasterySrc from '../assets/images/gallery-roastery.webp'
import galleryChennaiSrc from '../assets/images/gallery-chennai.webp'
import groundsTextureSrc from '../assets/images/grounds-texture.webp'

export interface ImageAsset {
  src: string
  alt: string
  /** Intrinsic size — set on <img> to reserve space and avoid layout shift. */
  width: number
  height: number
  /** Optional editorial caption shown beside the frame. */
  caption?: string
}

export const IMAGES = {
  heroBeans: {
    src: heroBeansSrc,
    alt: 'Roasted coffee beans photographed close up, lit from one side',
    width: 1920,
    height: 1280,
  },
  heritageThen: {
    src: heritageThenSrc,
    alt: 'Faded archival image of roasted coffee beans',
    width: 1100,
    height: 1450,
    caption: 'The first roast',
  },
  heritageToday: {
    src: heritageTodaySrc,
    alt: 'Freshly roasted coffee beans today',
    width: 1100,
    height: 820,
    caption: 'The same roast, thirty years on',
  },
  journeyBean: {
    src: journeyBeanSrc,
    alt: 'Macro view of a few whole roasted coffee beans',
    width: 900,
    height: 1240,
  },
  journeyRoast: {
    src: journeyRoastSrc,
    alt: 'Coffee beans tumbling in the heat of a roasting drum',
    width: 1500,
    height: 940,
  },
  journeyGrind: {
    src: journeyGrindSrc,
    alt: 'Freshly ground coffee, close up',
    width: 1100,
    height: 1100,
  },
  journeyBrew: {
    src: journeyBrewSrc,
    alt: 'Filter coffee in a stainless steel tumbler and davara',
    width: 1200,
    height: 1000,
  },
  brewHero: {
    src: brewHeroSrc,
    alt: 'A tumbler of South Indian filter coffee resting in its davara, lit from a window',
    width: 1920,
    height: 1200,
  },
  blendClassic: {
    src: blendClassicSrc,
    alt: 'Saravana Coffee pack — classic filter blend with chicory',
    width: 1000,
    height: 1250,
  },
  blendPure: {
    src: blendPureSrc,
    alt: 'Saravana Coffee pack — pure blend without chicory',
    width: 1000,
    height: 1250,
  },
  productPack: {
    src: productPackSrc,
    alt: 'Saravana Coffee retail pack photographed on a warm background',
    width: 1400,
    height: 1500,
  },
  galleryBeans: {
    src: galleryBeansSrc,
    alt: 'Roasted beans filling the frame',
    width: 1000,
    height: 1320,
    caption: 'Whole bean',
  },
  galleryPowder: {
    src: galleryPowderSrc,
    alt: 'Ground coffee powder',
    width: 1000,
    height: 760,
    caption: 'Ground to order',
  },
  galleryFilter: {
    src: galleryFilterSrc,
    alt: 'A traditional stainless steel South Indian coffee filter',
    width: 900,
    height: 1150,
    caption: 'The filter',
  },
  galleryTumbler: {
    src: galleryTumblerSrc,
    alt: 'Filter coffee in a tumbler and davara',
    width: 1000,
    height: 1000,
    caption: 'Tumbler & davara',
  },
  galleryRoastery: {
    src: galleryRoasterySrc,
    alt: 'The roastery interior at night',
    width: 1400,
    height: 900,
    caption: 'The roastery',
  },
  galleryChennai: {
    src: galleryChennaiSrc,
    alt: 'Chennai rooftops at first light',
    width: 1200,
    height: 800,
    caption: 'Chennai, 6 a.m.',
  },
  groundsTexture: {
    src: groundsTextureSrc,
    alt: '',
    width: 1600,
    height: 1000,
  },
} satisfies Record<string, ImageAsset>

export type ImageKey = keyof typeof IMAGES
