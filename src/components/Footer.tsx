import { BRAND, SITE_CONFIG, whatsappLink } from '../data/site'
import { scrollToSection } from '../hooks/useLenis'
import { Logo } from './ui/Logo'

const COLUMNS = [
  {
    title: 'Explore',
    items: [
      { label: 'Story', section: 'heritage' },
      { label: 'Coffee', section: 'journey' },
      { label: 'Brew', section: 'brew' },
    ],
  },
  {
    title: 'Order',
    items: [
      { label: 'Shop coffee', section: 'shop' },
      { label: 'Worldwide', section: 'worldwide' },
    ],
  },
] as const

/** The back page of the magazine. */
export function Footer() {
  const wa = whatsappLink("Hi Saravana Coffee, I'd like to place an order.")

  return (
    <footer className="relative pb-10 pt-[clamp(72px,12vh,150px)]">
      <div className="shell">
        <div className="grid grid-cols-12 gap-x-8 gap-y-[clamp(44px,7vh,80px)]">
          {/* wordmark ------------------------------------------------------- */}
          <div className="col-span-12 lg:col-span-6">
            <h2 className="display text-[clamp(3rem,10vw,7.5rem)] leading-[0.86]">
              Saravana
              <br />
              Coffee
            </h2>
            <p className="meta mt-6" style={{ color: 'var(--ink-faint)' }}>
              Est. {BRAND.established} — {BRAND.tagline}
            </p>
          </div>

          {/* columns -------------------------------------------------------- */}
          <nav
            aria-label="Footer"
            className="col-span-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-5 lg:col-start-8 lg:pt-4"
          >
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="meta" style={{ color: 'var(--ink-faint)' }}>
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <button
                        type="button"
                        onClick={() => scrollToSection(item.section, -12)}
                        className="link-underline py-1 text-[14px]"
                        style={{ color: 'var(--ink-soft)' }}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h3 className="meta" style={{ color: 'var(--ink-faint)' }}>
                Visit
              </h3>
              <ul className="mt-4 space-y-2.5 text-[14px]" style={{ color: 'var(--ink-soft)' }}>
                <li>{BRAND.neighbourhood}</li>
                <li>{BRAND.city}</li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('contact', -12)}
                    className="link-underline py-1"
                  >
                    Directions
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="meta" style={{ color: 'var(--ink-faint)' }}>
                Social
              </h3>
              <ul className="mt-4 space-y-2.5 text-[14px]" style={{ color: 'var(--ink-soft)' }}>
                <li>
                  <a
                    href={SITE_CONFIG.instagramUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="link-underline inline-flex items-center gap-2 py-1"
                  >
                    Instagram
                  </a>
                </li>
                {wa && (
                  <li>
                    <a
                      href={wa}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="link-underline py-1"
                    >
                      WhatsApp
                    </a>
                  </li>
                )}
                {SITE_CONFIG.email && (
                  <li>
                    <a href={`mailto:${SITE_CONFIG.email}`} className="link-underline py-1">
                      {SITE_CONFIG.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </nav>
        </div>

        {/* baseline --------------------------------------------------------- */}
        <div
          className="mt-[clamp(52px,9vh,110px)] flex flex-wrap items-center justify-between gap-6 border-t pt-7"
          style={{ borderColor: 'var(--rule)' }}
        >
          <div className="flex items-center gap-4">
            <Logo variant="mark" className="h-9 w-9" ink="#F4E5C4" field="#031B46" />
            <span className="meta" style={{ color: 'var(--ink-faint)' }}>
              © {new Date().getFullYear()} {BRAND.name}
            </span>
          </div>
          <span className="meta" style={{ color: 'var(--ink-faint)' }}>
            {BRAND.locality}
          </span>
        </div>
      </div>
    </footer>
  )
}
