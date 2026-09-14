interface SectionLabelProps {
  index: string
  title: string
  className?: string
  /** Draws the hairline that the label sits on. */
  rule?: boolean
}

/** `01 — Our Story`. The same mark appears at the head of every section. */
export function SectionLabel({ index, title, className, rule = true }: SectionLabelProps) {
  return (
    <div className={`flex items-center gap-4 ${className ?? ''}`} data-reveal>
      <span className="meta shrink-0" style={{ color: 'var(--ink-soft)' }}>
        {index} — {title}
      </span>
      {rule && <span className="rule-line hidden flex-1 sm:block" aria-hidden="true" />}
    </div>
  )
}
