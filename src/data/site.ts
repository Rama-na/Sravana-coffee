/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  SARAVANA COFFEE — SITE CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════
 *  Everything the business owner needs to change lives in this file and in
 *  ./products.ts + ./images.ts. No component hard-codes a phone number, a URL,
 *  a price or an address.
 *
 *  ⚠️  Values marked TODO are deliberate placeholders. They are NOT invented
 *      facts — fill them in once the real details are confirmed.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const SITE_CONFIG = {
  /** Digits only, with country code, no "+" and no spaces. e.g. '919876543210' */
  whatsappNumber: '', // TODO — CONFIGURE WHATSAPP
  instagramUrl: 'https://www.instagram.com/saravana_coffee/', // TODO — confirm handle
  /** Paste the "Share → Copy link" URL from the Google Maps business listing. */
  mapsUrl: '', // TODO — ADD GOOGLE MAPS URL
  /** Optional — leave empty to hide the e-mail line in the footer. */
  email: '', // TODO — ADD EMAIL
} as const

/** Builds a WhatsApp deep link, or `null` when the number has not been set yet. */
export function whatsappLink(message: string): string | null {
  if (!SITE_CONFIG.whatsappNumber) return null
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`
}

export const BRAND = {
  name: 'Saravana Coffee',
  shortName: 'Saravana',
  established: '1995',
  tagline: 'Authentic South Indian Filter Coffee',
  badgeLine: 'Premium Taste',
  city: 'Chennai',
  neighbourhood: 'Velachery',
  /** Shown as a quiet metadata line only — never as a precise street address. */
  locality: 'Velachery · Chennai',
} as const

export const NAV_LINKS = [
  { id: 'heritage', label: 'Story' },
  { id: 'journey', label: 'Coffee' },
  { id: 'brew', label: 'Brew' },
  { id: 'shop', label: 'Order' },
] as const

export const MENU_LINKS = [
  { id: 'heritage', label: 'Story', meta: 'Since 1995' },
  { id: 'journey', label: 'Coffee', meta: 'Bean to cup' },
  { id: 'brew', label: 'Brew', meta: 'The first sip' },
  { id: 'shop', label: 'Shop', meta: 'Blends & sizes' },
  { id: 'contact', label: 'Contact', meta: 'Velachery, Chennai' },
] as const

export const SECTION_LABELS = {
  heritage: { index: '01', title: 'Our Story' },
  journey: { index: '02', title: 'The Process' },
  blends: { index: '03', title: 'The Blends' },
  shop: { index: '04', title: 'The Order' },
  brew: { index: '05', title: 'The Brew' },
  craft: { index: '06', title: 'The Craft' },
  gallery: { index: '07', title: 'The Roastery' },
  chennai: { index: '08', title: 'Find Us' },
  worldwide: { index: '09', title: 'Worldwide' },
} as const

/** Copy is centralised so it can be edited without touching components. */
export const COPY = {
  hero: {
    eyebrow: 'Saravana Coffee — Chennai',
    year: '1995',
    est: 'Est.',
    support: 'Authentic South Indian filter coffee',
    scroll: 'Scroll to discover',
  },
  heritage: {
    headline: ['Some things', "shouldn't change."],
    body: 'Since 1995, Saravana Coffee has been built around a simple idea: freshly roasted coffee, prepared with care, and made to feel like home.',
    then: 'Then',
    now: 'Today',
    closing: ['Three', 'decades', 'of coffee.'],
  },
  journey: {
    headline: ['From bean', 'to cup.'],
    support: 'Every morning begins long before the first sip.',
  },
  blends: {
    headline: ['Your coffee.', 'Your way.'],
    support:
      'One roast, two traditions. Chicory for the slow, syrupy cup South India grew up on — or pure coffee, when you want the bean and nothing else.',
  },
  shop: {
    headline: ['Find your', 'perfect cup.'],
    support: 'Choose a blend, choose a weight. We roast and grind to order.',
  },
  brew: {
    headline: 'The first sip.',
    words: ['Aroma.', 'Roast.', 'Strength.', 'Home.'],
    closing: 'Some mornings only need filter coffee.',
  },
  craft: {
    headline: ['What makes', 'filter coffee', 'different?'],
  },
  chennai: {
    headline: 'Brewed in Chennai.',
    body: 'From Vijaya Nagar, Velachery to coffee lovers everywhere.',
    cta: 'Get directions',
  },
  worldwide: {
    headline: ['A little taste', 'of home,', 'wherever you are.'],
    body: 'Freshly roasted, sealed the same week, and sent out to kitchens far from Chennai.',
    cta: 'Worldwide orders',
  },
  finalCta: {
    headline: ['Ready for', 'your morning?'],
    body: 'Freshly roasted. Freshly ground. Made to taste like home.',
    primary: 'Shop coffee',
    secondary: 'WhatsApp us',
  },
} as const

export const CRAFT_POINTS = [
  {
    index: '01',
    title: 'Coffee + chicory',
    body: 'Roasted chicory root is blended into the grounds. It draws out a darker, syrupy body and the deep colour that South Indian coffee is known for.',
  },
  {
    index: '02',
    title: 'Slow extraction',
    body: 'The decoction drips through a stainless filter for hours, not seconds. Nothing is forced, nothing is rushed — pressure never touches the grounds.',
  },
  {
    index: '03',
    title: 'Aroma that lingers',
    body: 'Ground to order rather than months ahead, so the smell that fills the kitchen when the tin is opened is still there in the cup.',
  },
] as const

/** Example markets only — edit freely. Nothing here is a shipping guarantee. */
export const MARKETS = ['India', 'UAE', 'Singapore', 'United Kingdom', 'USA', 'Australia'] as const

export const JOURNEY_STEPS = [
  {
    index: '01',
    title: 'Bean',
    caption: 'Green coffee, sorted by hand',
    body: 'It starts with the bean — checked, graded and set aside in small lots so nothing goes into the drum that should not be there.',
  },
  {
    index: '02',
    title: 'Roast',
    caption: 'The drum, twice a week',
    body: 'Roasted in small batches and pulled by colour and smell rather than by a timer. Every batch is tasted before it leaves the roastery.',
  },
  {
    index: '03',
    title: 'Grind',
    caption: 'Ground to order',
    body: 'Ground the day it is sold, at the setting your filter needs — fine enough to hold the water, coarse enough to let it through.',
  },
  {
    index: '04',
    title: 'Brew',
    caption: 'Decoction, then milk',
    body: 'Hot water on the grounds, a slow drip into the lower chamber, and a thick decoction that only needs milk and a little sugar.',
  },
] as const
