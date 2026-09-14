import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { gsap, ScrollTrigger } from '../lib/animations'
import { getLenis, scrollToSection } from '../hooks/useLenis'
import { NAV_LINKS, MENU_LINKS, SITE_CONFIG } from '../data/site'
import { Logo } from './ui/Logo'
import { FlowingMenu } from './reactbits/FlowingMenu'

export function Navbar() {
  const barRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [settled, setSettled] = useState(false)
  const [active, setActive] = useState<string>('')

  /* ── surface appears once the hero is behind us ───────────────────────── */
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 'top -90',
      end: 99999,
      onToggle: (self) => setSettled(self.isActive),
    })
    return () => st.kill()
  }, [])

  /* ── which section are we in ──────────────────────────────────────────── */
  useEffect(() => {
    const ids = [...NAV_LINKS.map((l) => l.id)]
    const triggers = ids
      .map((id) => {
        const el = document.getElementById(id)
        if (!el) return null
        return ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 45%',
          onToggle: (self) => self.isActive && setActive(id),
        })
      })
      .filter(Boolean) as ScrollTrigger[]
    return () => triggers.forEach((t) => t.kill())
  }, [])

  /* ── menu open/close: lock scroll, trap focus, restore on close ───────── */
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const lenis = getLenis()

    if (open) {
      lenis?.stop()
      document.body.style.overflow = 'hidden'
      const ctx = gsap.context(() => {
        gsap
          .timeline()
          .fromTo(panel, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.72, ease: 'expo.inOut' })
          .fromTo(
            '[data-menu-row]',
            { yPercent: 55, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out' },
            0.24,
          )
          .fromTo('[data-menu-foot]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0.5)
      }, panel)

      const first = panel.querySelector<HTMLElement>('button, a')
      first?.focus()

      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setOpen(false)
          // Focus must come back to the control that opened the panel,
          // otherwise it falls to <body> and tabbing restarts from the top.
          toggleRef.current?.focus()
          return
        }
        if (e.key !== 'Tab') return
        const items = panel.querySelectorAll<HTMLElement>('button, a[href]')
        if (!items.length) return
        const list = [...items]
        const firstEl = list[0]
        const lastEl = list[list.length - 1]
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault()
          lastEl.focus()
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault()
          firstEl.focus()
        }
      }
      document.addEventListener('keydown', onKey)
      return () => {
        document.removeEventListener('keydown', onKey)
        ctx.revert()
        lenis?.start()
        document.body.style.overflow = ''
      }
    }

    lenis?.start()
    document.body.style.overflow = ''
    return undefined
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    // let the panel finish closing before the scroll starts
    window.setTimeout(() => scrollToSection(id, -12), 140)
    toggleRef.current?.focus()
  }

  return (
    <>
      <header
        ref={barRef}
        className="fixed inset-x-0 top-0 z-[120] transition-[background-color,border-color,backdrop-filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          backgroundColor: settled && !open ? 'color-mix(in srgb, var(--page-bg) 82%, transparent)' : 'transparent',
          borderBottom: `1px solid ${settled && !open ? 'var(--rule)' : 'transparent'}`,
          backdropFilter: settled && !open ? 'blur(14px) saturate(1.3)' : 'none',
        }}
      >
        <nav
          aria-label="Primary"
          className="shell flex items-center justify-between py-4 md:py-5"
          style={{ color: 'var(--ink)' }}
        >
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              getLenis()?.scrollTo(0, { duration: 1.6 }) ?? window.scrollTo({ top: 0 })
            }}
            className="shrink-0"
            aria-label="Saravana Coffee — back to top"
          >
            <Logo variant="compact" priority />
          </a>

          <ul className="hidden items-center gap-9 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => go(link.id)}
                  data-active={active === link.id}
                  className="link-underline meta py-1 transition-opacity duration-300 hover:opacity-100"
                  style={{ opacity: active === link.id ? 1 : 0.62 }}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a
              href={SITE_CONFIG.instagramUrl || undefined}
              target="_blank"
              rel="noreferrer noopener"
              className="meta hidden py-1 opacity-62 transition-opacity duration-300 hover:opacity-100 lg:block"
            >
              Instagram
            </a>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="site-menu"
              className="flex min-h-[44px] items-center gap-2.5 px-1 py-2"
            >
              <span className="meta">{open ? 'Close' : 'Menu'}</span>
              {open ? (
                <X size={17} strokeWidth={1.4} aria-hidden="true" />
              ) : (
                <Menu size={17} strokeWidth={1.4} aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>
      </header>

      <div
        id="site-menu"
        ref={panelRef}
        hidden={!open}
        className="fixed inset-0 z-[110] flex flex-col justify-between pt-24 pb-8"
        style={{
          backgroundColor: 'var(--page-bg)',
          color: 'var(--ink)',
          clipPath: 'inset(0% 0% 100% 0%)',
        }}
      >
        <div className="shell flex-1 overflow-y-auto">
          <FlowingMenu
            items={MENU_LINKS.map((l) => ({ ...l }))}
            onSelect={go}
            className="border-b"
            /* border colour comes from the row style inside the component */
          />
        </div>
        <div
          data-menu-foot
          className="shell mt-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-3"
        >
          <span className="meta" style={{ color: 'var(--ink-soft)' }}>
            Velachery · Chennai
          </span>
          <span className="meta" style={{ color: 'var(--ink-faint)' }}>
            Est. 1995
          </span>
        </div>
      </div>
    </>
  )
}
