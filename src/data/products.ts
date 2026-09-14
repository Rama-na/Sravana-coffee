/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  PRODUCTS
 * ═══════════════════════════════════════════════════════════════════════════
 *  ⚠️  `price: null` is intentional. No price on this site is invented —
 *      the UI renders "Price on request" until real figures are supplied.
 *      To publish prices, fill in `price` (a number, in rupees) per size.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { IMAGES, type ImageAsset } from './images'

export interface SizeOption {
  id: string
  label: string
  /** Grams — used for sorting and for the WhatsApp order message. */
  grams: number
  /** null → "Price on request". Set a number (₹) once pricing is confirmed. */
  price: number | null
}

export interface Product {
  id: 'classic' | 'pure'
  name: string
  subtitle: string
  /** One-line positioning used on the selector card. */
  tagline: string
  description: string
  /** Short tasting notes — three words max each. */
  notes: readonly string[]
  image: ImageAsset
  sizes: readonly SizeOption[]
}

const SIZES: readonly SizeOption[] = [
  { id: '250g', label: '250 g', grams: 250, price: null },
  { id: '500g', label: '500 g', grams: 500, price: null },
  { id: '1kg', label: '1 kg', grams: 1000, price: null },
] as const

export const PRODUCTS: readonly Product[] = [
  {
    id: 'classic',
    name: 'Classic Filter Blend',
    subtitle: 'With chicory',
    tagline: 'The cup South India grew up on',
    description:
      'Roasted coffee blended with chicory — the way filter coffee has been made in South Indian kitchens for generations. Slower to drip, darker in the tumbler, and built to stand up to hot milk without thinning out.',
    notes: ['Dark', 'Syrupy', 'Full-bodied'],
    image: IMAGES.blendClassic,
    sizes: SIZES,
  },
  {
    id: 'pure',
    name: 'Pure Coffee Blend',
    subtitle: 'Without chicory',
    tagline: 'The bean, and nothing else',
    description:
      'Coffee on its own, with no chicory in the blend. Cleaner and brighter through the middle, with the roast character sitting further forward. For anyone who wants to taste the bean itself.',
    notes: ['Clean', 'Aromatic', 'Bright'],
    image: IMAGES.blendPure,
    sizes: SIZES,
  },
] as const

/**
 * The full weight range carried in store. Online ordering is presented from
 * 250 g upward; everything below is available over WhatsApp or at the counter.
 */
export const ALL_WEIGHTS = [
  '50g', '100g', '150g', '200g', '250g', '300g',
  '400g', '500g', '700g', '800g', '900g', '1kg',
] as const

export const CUSTOM_WEIGHT_NOTE = 'Custom weights from 50 g available on request'

export function formatPrice(price: number | null): string {
  return price === null ? 'Price on request' : `₹${price.toLocaleString('en-IN')}`
}

export function orderMessage(product: Product, size: SizeOption): string {
  return `Hi Saravana Coffee, I'd like to order ${size.label} of ${product.name} (${product.subtitle.toLowerCase()}).`
}
