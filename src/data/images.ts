/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  IMAGE MANIFEST — the single place images are referenced from
 * ═══════════════════════════════════════════════════════════════════════════
 *  Every image on the site is imported here and referenced by a semantic key.
 *  Vite rewrites these URLs for the GitHub Pages base path automatically.
 *
 *  Most entries are now real Saravana Coffee photography. The masters live in
 *  src/assets/source/ and scripts/build-images.mjs crops and compresses them
 *  into src/assets/images/ — so a re-crop is a change to that script, never to
 *  a component.
 *
 *  Entries marked `generated: true` are still art-directed placeholder
 *  artwork from scripts/generate-placeholder-art.mjs. They are the remaining
 *  shot list; see the README.
 *
 *  Replacing one: drop a .webp over the matching file in src/assets/images/
 *  (or add it to src/assets/source/ and give it a crop in build-images.mjs),
 *  then update `width`, `height` and `alt` below. Nothing else changes.
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
import galleryCounterSrc from '../assets/images/gallery-counter.webp'
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
  /** True while this slot is still placeholder artwork rather than a photo. */
  generated?: true
}

export const IMAGES = {
  heroBeans: {
    src: heroBeansSrc,
    alt: 'Roasted coffee beans filling the frame',
    width: 1680,
    height: 1120,
  },
  heritageThen: {
    src: heritageThenSrc,
    alt: 'A brass vessel, a striped cotton cloth and a brass plate of roasted coffee beans',
    width: 1000,
    height: 1318,
    caption: 'The way it has always been made',
  },
  heritageToday: {
    src: heritageTodaySrc,
    alt: 'Freshly roasted coffee beans inside an opened pack',
    width: 1300,
    height: 970,
    caption: 'The same roast, packed today',
  },
  journeyBean: {
    src: journeyBeanSrc,
    alt: 'Roasted coffee beans, close up',
    width: 853,
    height: 1174,
  },
  journeyRoast: {
    src: journeyRoastSrc,
    alt: 'Roasted beans falling from the drum into the cooling tray',
    width: 1500,
    height: 940,
  },
  journeyGrind: {
    src: journeyGrindSrc,
    alt: 'Freshly ground coffee, close up',
    width: 1100,
    height: 1100,
    generated: true,
  },
  journeyBrew: {
    src: journeyBrewSrc,
    alt: 'A stainless steel tumbler of filter coffee, frothed, resting in its davara',
    width: 1116,
    height: 931,
  },
  brewHero: {
    src: brewHeroSrc,
    alt: 'A tumbler of filter coffee, a stainless steel coffee filter and a brass vessel on a table',
    width: 1843,
    height: 1152,
  },
  blendClassic: {
    src: blendClassicSrc,
    alt: 'Saravana Coffee pack — classic filter blend with chicory',
    width: 1000,
    height: 1250,
    generated: true,
  },
  blendPure: {
    src: blendPureSrc,
    alt: 'Saravana Coffee pack — pure blend without chicory',
    width: 1000,
    height: 1250,
    generated: true,
  },
  productPack: {
    src: productPackSrc,
    alt: 'Saravana Coffee retail pack on a warm background',
    width: 1400,
    height: 1500,
    generated: true,
  },
  galleryBeans: {
    src: galleryBeansSrc,
    alt: 'Roasted beans filling the frame',
    width: 760,
    height: 1003,
    caption: 'Whole bean',
  },
  galleryPowder: {
    src: galleryPowderSrc,
    alt: 'Ground coffee powder',
    width: 1000,
    height: 760,
    caption: 'Ground to order',
    generated: true,
  },
  galleryFilter: {
    src: galleryFilterSrc,
    alt: 'A traditional stainless steel South Indian coffee filter',
    width: 800,
    height: 1021,
    caption: 'The filter',
  },
  galleryTumbler: {
    src: galleryTumblerSrc,
    alt: 'The frothed surface of filter coffee in a steel tumbler',
    width: 860,
    height: 860,
    caption: 'Tumbler & davara',
  },
  galleryRoastery: {
    src: galleryRoasterySrc,
    alt: 'The roasting drum discharging a finished batch',
    width: 1400,
    height: 899,
    caption: 'The roastery',
  },
  galleryCounter: {
    src: galleryCounterSrc,
    alt: 'A brass vessel and a striped cotton cloth on the counter',
    width: 1100,
    height: 734,
    caption: 'The counter',
  },
  galleryChennai: {
    src: galleryChennaiSrc,
    alt: 'Chennai rooftops at first light',
    width: 1200,
    height: 800,
    caption: 'Chennai, 6 a.m.',
    generated: true,
  },
  groundsTexture: {
    src: groundsTextureSrc,
    alt: '',
    width: 1600,
    height: 1000,
    generated: true,
  },
} satisfies Record<string, ImageAsset>

export type ImageKey = keyof typeof IMAGES

/** Slots still waiting on real photography — used by the README shot list. */
export const PENDING_PHOTOGRAPHY = (Object.keys(IMAGES) as ImageKey[]).filter(
  (k) => 'generated' in IMAGES[k],
)
