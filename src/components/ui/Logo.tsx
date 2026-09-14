/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  SARAVANA COFFEE SEAL
 * ═══════════════════════════════════════════════════════════════════════════
 *  The real badge artwork, supplied by the business. It already carries an
 *  alpha channel; scripts/build-images.mjs trims it to the badge, squares the
 *  frame and exports it at 768px — big enough for the hero, small enough not
 *  to matter. The seal is never recoloured, stretched or filtered.
 *
 *  Variants
 *    full     the badge, at whatever size the container gives it   hero, CTA
 *    compact  badge + horizontal wordmark                          navbar
 *    mark     the badge alone, for tight spots                     footer
 *
 *  `full` and `mark` render the same artwork; they differ only in intent, so
 *  call sites read clearly and a future small-size variant has a place to go.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import sealSrc from '../../assets/logo/saravana-seal.webp'
import { BRAND } from '../../data/site'

export type LogoVariant = 'full' | 'compact' | 'mark'

interface LogoProps {
  variant?: LogoVariant
  className?: string
  title?: string
  /** Set on the one instance that is visible in the first viewport. */
  priority?: boolean
}

export function Logo({ variant = 'full', className, title, priority = false }: LogoProps) {
  const label = title ?? `${BRAND.name} — established ${BRAND.established}`

  const img = (extra: string) => (
    <img
      src={sealSrc}
      alt={label}
      width={768}
      height={768}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={extra}
    />
  )

  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
        <span className="block h-8 w-8 shrink-0 sm:h-9 sm:w-9" aria-hidden="true">
          {img('h-full w-full')}
        </span>
        <span className="flex flex-col leading-none">
          <span className="text-[13px] font-semibold tracking-[0.3em] sm:text-[14px]">SARAVANA</span>
          <span className="mt-[3px] text-[8px] font-medium tracking-[0.42em] opacity-60 sm:text-[9px]">
            EST. 1995
          </span>
        </span>
      </span>
    )
  }

  return <span className={`block ${className ?? ''}`}>{img('h-full w-full')}</span>
}
