/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE RECURRING MOTIF — coffee, travelling through the page
 * ═══════════════════════════════════════════════════════════════════════════
 *  One idea, several forms, so the same graphic is never simply repeated:
 *
 *    BeanGlyph     a single bean            heritage, transitions, final CTA
 *    FilterRings   concentric filter mesh   craft, chennai, worldwide
 *    GroundsDots   scattered particles      journey, seams
 *
 *  All are decorative: aria-hidden, and all sit behind content.
 *
 *  The rising aroma lives in AromaFlow, not here — it is part of the page-long
 *  bean system rather than a section-local decoration.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export function BeanGlyph({
  className,
  stroke = 'currentColor',
  strokeWidth = 3,
}: {
  className?: string
  stroke?: string
  strokeWidth?: number
}) {
  return (
    <svg viewBox="0 0 120 84" className={className} aria-hidden="true" focusable="false">
      <g fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round">
        <ellipse cx="60" cy="42" rx="52" ry="34" />
        <path d="M15 50C31 28 45 58 60 43S89 24 105 35" />
      </g>
    </svg>
  )
}

/** Filled, lit bean — for places where an outline would disappear. */
export function BeanSolid({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 84" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="bean-solid" cx="34%" cy="26%" r="84%">
          <stop offset="0%" stopColor="#D9A26E" />
          <stop offset="44%" stopColor="#A9683C" />
          <stop offset="100%" stopColor="#5C3319" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="42" rx="52" ry="34" fill="url(#bean-solid)" stroke="#2A180E" strokeWidth="2.5" />
      <path
        d="M15 50C31 28 45 58 60 43S89 24 105 35"
        fill="none"
        stroke="#2A180E"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M14 47C30 25 44 55 59 40S88 21 104 32"
        fill="none"
        stroke="#E0AE7E"
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".45"
      />
      <path d="M18 22A52 34 0 0 1 68 9" fill="none" stroke="#EBC59B" strokeWidth="3" strokeLinecap="round" opacity=".38" />
    </svg>
  )
}

/** Concentric hairlines — the mesh of a filter, seen from above. */
export function FilterRings({ className, rings = 7 }: { className?: string; rings?: number }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1">
        {Array.from({ length: rings }, (_, i) => (
          <circle key={i} cx="200" cy="200" r={22 + i * ((178 - 22) / (rings - 1))} />
        ))}
      </g>
    </svg>
  )
}

/** A drift of ground coffee, as dots. Deterministic, so it never re-shuffles. */
export function GroundsDots({ className, count = 90 }: { className?: string; count?: number }) {
  let s = 9
  const rand = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  return (
    <svg viewBox="0 0 400 200" className={className} aria-hidden="true" focusable="false">
      <g fill="currentColor">
        {Array.from({ length: count }, (_, i) => {
          const x = rand() * 400
          const y = rand() * 200
          const r = 0.7 + rand() * 1.9
          return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={r.toFixed(2)} opacity={(0.2 + rand() * 0.7).toFixed(2)} />
        })}
      </g>
    </svg>
  )
}
