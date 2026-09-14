/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  SARAVANA COFFEE SEAL
 * ═══════════════════════════════════════════════════════════════════════════
 *  A vector reconstruction of the existing circular badge — same structure,
 *  same colours, same wording. Drawn inline (not as an <img>) so it inherits
 *  the site's typeface and stays crisp at every size.
 *
 *  ⚠️  If the original vector artwork (.ai / .svg) exists, replace the body of
 *      <Seal> with it. Keep the square viewBox and the variants intact —
 *      nothing else in the codebase needs to change.
 *
 *  Variants
 *    full     complete badge with the arc lettering    → hero, footer
 *    compact  small mark + horizontal wordmark         → navbar
 *    mark     badge without lettering                  → favicon, tight spots
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { BRAND } from '../../data/site'

export type LogoVariant = 'full' | 'compact' | 'mark'

interface LogoProps {
  variant?: LogoVariant
  className?: string
  /** Overrides the blue — used where the seal sits on a blue ground. */
  ink?: string
  /** Overrides the cream field. */
  field?: string
  title?: string
}

const BLUE = '#073C9D'
const CREAM = '#F4E5C4'

/* ── one illustrated coffee bean, unit box 100 × 66 ────────────────────── */
function Bean({ x, y, r, s }: { x: number; y: number; r: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <ellipse rx="50" ry="33" fill="url(#sc-bean)" stroke="#2E1C11" strokeWidth="5.5" />
      <path
        d="M-43 2C-28-12-11 10 4-1S30-9 43-4"
        fill="none"
        stroke="#2E1C11"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M-34-15C-23-22-9-21 0-17"
        fill="none"
        stroke="#D09A6C"
        strokeWidth="4"
        strokeLinecap="round"
        opacity=".75"
      />
      <path
        d="M14 16C24 12 32 10 38 11"
        fill="none"
        stroke="#2E1C11"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity=".5"
      />
    </g>
  )
}

function Seal({ showText, ink, field }: { showText: boolean; ink: string; field: string }) {
  return (
    <>
      <defs>
        <linearGradient id="sc-bean" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#C08B5E" />
          <stop offset="52%" stopColor="#A9683C" />
          <stop offset="100%" stopColor="#8A5430" />
        </linearGradient>
        {/* Text baselines. The top arc runs clockwise and the bottom arc
            counter-clockwise, so both read left-to-right the right way up. */}
        <path id="sc-arc-top" d="M115.1 199.1A152 152 0 0 1 396.9 199.1" fill="none" />
        <path id="sc-arc-bottom" d="M96.3 319.7A170 170 0 0 0 415.7 319.7" fill="none" />
      </defs>

      <circle cx="256" cy="256" r="250" fill={field} />
      <circle cx="256" cy="256" r="237" fill="none" stroke={ink} strokeWidth="26" />
      <circle cx="256" cy="256" r="208" fill="none" stroke={ink} strokeWidth="8" />

      {/* bracket arcs at 3 and 9 o'clock */}
      <path d="M430.8 192.4A186 186 0 0 1 430.8 319.6" fill="none" stroke={ink} strokeWidth="17" />
      <path d="M81.2 319.6A186 186 0 0 1 81.2 192.4" fill="none" stroke={ink} strokeWidth="17" />

      {showText && (
        <g fill={ink} fontFamily="var(--font-sans)" fontWeight={700}>
          <text fontSize="61" letterSpacing="1.5">
            <textPath href="#sc-arc-top" startOffset="50%" textAnchor="middle">
              SARAVANA
            </textPath>
          </text>
          <text fontSize="74" letterSpacing="1.5">
            <textPath href="#sc-arc-bottom" startOffset="50%" textAnchor="middle">
              COFFEE
            </textPath>
          </text>
        </g>
      )}

      <circle cx="256" cy="244" r="118" fill={ink} />

      {/* bean cluster — sits slightly proud of the disc, as on the original */}
      <g>
        <ellipse cx="262" cy="290" rx="104" ry="26" fill="#021230" opacity=".28" />
        <Bean x={196} y={194} r={-28} s={1.05} />
        <Bean x={330} y={210} r={28} s={1.05} />
        <Bean x={274} y={176} r={-6} s={1.18} />
        <Bean x={222} y={248} r={-14} s={1.22} />
        <Bean x={308} y={256} r={10} s={1.12} />
      </g>

      {showText && (
        <g fill={field} fontFamily="var(--font-sans)" fontWeight={700} textAnchor="middle">
          <text x="256" y="321" fontSize="21" letterSpacing="1.6">
            PREMIUM TASTE
          </text>
          <text x="256" y="350" fontSize="21" letterSpacing="2.6">
            EST 1995
          </text>
        </g>
      )}
    </>
  )
}

export function Logo({ variant = 'full', className, ink = BLUE, field = CREAM, title }: LogoProps) {
  const label = title ?? `${BRAND.name} — established ${BRAND.established}`

  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
        <svg
          viewBox="0 0 512 512"
          className="h-7 w-7 shrink-0 sm:h-8 sm:w-8"
          role="img"
          aria-label={label}
          focusable="false"
        >
          <title>{label}</title>
          <Seal showText={false} ink={ink} field={field} />
        </svg>
        <span className="flex flex-col leading-none">
          <span className="text-[13px] font-semibold tracking-[0.3em] sm:text-[14px]">SARAVANA</span>
          <span className="mt-[3px] text-[8px] font-medium tracking-[0.42em] opacity-60 sm:text-[9px]">
            EST. 1995
          </span>
        </span>
      </span>
    )
  }

  return (
    <svg viewBox="0 0 512 512" className={className} role="img" aria-label={label} focusable="false">
      <title>{label}</title>
      <Seal showText={variant === 'full'} ink={ink} field={field} />
    </svg>
  )
}
