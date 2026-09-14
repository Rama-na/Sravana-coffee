import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Magnet } from '../reactbits/Magnet'

type Variant = 'primary' | 'outline' | 'ghost'

interface BaseProps {
  children: ReactNode
  variant?: Variant
  className?: string
  /** Shows the small diagonal arrow. */
  arrow?: boolean
  magnetic?: boolean
}

const BASE =
  'group relative inline-flex min-h-[52px] items-center justify-center gap-3 px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] transition-[background-color,color,border-color,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:cursor-not-allowed disabled:opacity-45'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-[var(--accent)] text-[var(--page-bg)] hover:opacity-88 border border-[var(--accent)]',
  outline:
    'border border-[var(--rule)] text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--surface)]',
  ghost: 'text-[var(--ink-soft)] hover:text-[var(--ink)] px-0',
}

function Inner({ children, arrow }: { children: ReactNode; arrow?: boolean }) {
  return (
    <>
      <span>{children}</span>
      {arrow && (
        <ArrowUpRight
          size={15}
          strokeWidth={1.5}
          aria-hidden="true"
          className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      )}
    </>
  )
}

export function Button({
  children,
  variant = 'primary',
  className,
  arrow,
  magnetic = true,
  ...rest
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const node = (
    <button type="button" className={`${BASE} ${VARIANTS[variant]} ${className ?? ''}`} {...rest}>
      <Inner arrow={arrow}>{children}</Inner>
    </button>
  )
  return magnetic ? <Magnet>{node}</Magnet> : node
}

export function ButtonLink({
  children,
  variant = 'primary',
  className,
  arrow,
  magnetic = true,
  href,
  ...rest
}: BaseProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  /**
   * With no URL configured yet there is nothing to link to. Rather than ship a
   * dead link or a fake number, the control renders disabled and says so.
   */
  if (!href) {
    return (
      <span
        className={`${BASE} ${VARIANTS[variant]} cursor-not-allowed opacity-45 ${className ?? ''}`}
        title="Not configured yet — see SITE_CONFIG in src/data/site.ts"
        aria-disabled="true"
      >
        <Inner arrow={arrow}>{children}</Inner>
      </span>
    )
  }

  const node = (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={`${BASE} ${VARIANTS[variant]} ${className ?? ''}`}
      {...rest}
    >
      <Inner arrow={arrow}>{children}</Inner>
    </a>
  )
  return magnetic ? <Magnet>{node}</Magnet> : node
}
