import { useEffect, useRef, useState } from 'react'
import { gsap, revealUp, splitReveal } from '../lib/animations'
import { useGsapContext, MQ } from '../hooks/useGsapContext'
import { COPY, SECTION_LABELS, whatsappLink } from '../data/site'
import {
  PRODUCTS,
  ALL_WEIGHTS,
  CUSTOM_WEIGHT_NOTE,
  formatPrice,
  orderMessage,
  type Product,
} from '../data/products'
import { IMAGES } from '../data/images'
import { SectionLabel } from './ui/SectionLabel'
import { Figure } from './ui/Figure'
import { ButtonLink } from './ui/Button'

interface Props {
  selected: Product['id']
  onSelect: (id: Product['id']) => void
}

const SECONDARY = [IMAGES.galleryBeans, IMAGES.galleryPowder, IMAGES.galleryFilter, IMAGES.galleryTumbler]

/** Small segmented control used for both blend and weight. */
function Choice({
  name,
  label,
  options,
  value,
  onChange,
}: {
  name: string
  label: string
  options: readonly { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="meta mb-4" style={{ color: 'var(--ink-faint)' }}>
        {label}
      </legend>
      <div className="flex flex-wrap gap-2.5">
        {options.map((o) => {
          const active = o.id === value
          return (
            <div key={o.id}>
              <input
                type="radio"
                name={name}
                id={`${name}-${o.id}`}
                checked={active}
                onChange={() => onChange(o.id)}
                className="peer sr-only"
              />
              <label
                htmlFor={`${name}-${o.id}`}
                className="meta flex min-h-[46px] cursor-pointer items-center border px-5 transition-[background-color,color,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-[var(--accent)]"
                style={{
                  borderColor: active ? 'var(--ink)' : 'var(--rule)',
                  backgroundColor: active ? 'var(--ink)' : 'transparent',
                  color: active ? 'var(--page-bg)' : 'var(--ink-soft)',
                }}
              >
                {o.label}
              </label>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  FIND YOUR PERFECT CUP — warm paper
 * ═══════════════════════════════════════════════════════════════════════════
 *  One product, presented once — not a grid of cards. Blend and weight on the
 *  left, the pack on the right, and a running summary underneath that becomes
 *  the WhatsApp order message.
 *
 *  No price is invented anywhere: until `price` is filled in per size in
 *  data/products.ts the summary reads "Price on request".
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function ProductShowcase({ selected, onSelect }: Props) {
  const ref = useRef<HTMLElement>(null)
  const [sizeId, setSizeId] = useState('500g')
  const first = useRef(true)

  const product = PRODUCTS.find((p) => p.id === selected) ?? PRODUCTS[0]
  const size = product.sizes.find((s) => s.id === sizeId) ?? product.sizes[1]
  const order = whatsappLink(orderMessage(product, size))

  useGsapContext(ref, (mm) => {
    mm.add(MQ.motion, () => {
      const head = ref.current?.querySelector('[data-shop-head]')
      if (head) splitReveal(head, { start: 'top 82%' })
      revealUp('[data-reveal]', { trigger: ref.current!, start: 'top 74%', y: 30 })
    })
    mm.add(MQ.reduced, () => gsap.set('[data-reveal],[data-shop-head]', { autoAlpha: 1, y: 0 }))
  })

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const el = ref.current?.querySelector('[data-summary]')
    if (!el) return
    const tween = gsap.fromTo(el, { autoAlpha: 0.3, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' })
    return () => {
      tween.kill()
    }
  }, [selected, sizeId])

  return (
    <section ref={ref} id="shop" className="relative py-[var(--section-gap)]">
      <div className="shell">
        <SectionLabel {...SECTION_LABELS.shop} />

        <div className="mt-[clamp(48px,8vh,96px)] grid grid-cols-12 gap-y-8">
          <h2
            data-shop-head
            className="col-span-12 text-[clamp(2.5rem,7vw,5.8rem)] lg:col-span-6"
            style={{ visibility: 'hidden' }}
          >
            {COPY.shop.headline[0]}
            <br />
            {COPY.shop.headline[1]}
          </h2>
          <p
            data-reveal
            className="col-span-12 max-w-[42ch] self-end text-[15px] leading-[1.85] lg:col-span-4 lg:col-start-9"
            style={{ color: 'var(--ink-soft)' }}
          >
            {COPY.shop.support}
          </p>
        </div>

        {/* pack + configurator --------------------------------------------- */}
        <div className="mt-[clamp(48px,8vh,104px)] grid grid-cols-12 items-start gap-x-8 gap-y-12">
          <div className="col-span-12 lg:col-span-6" data-reveal>
            <Figure
              image={IMAGES.productPack}
              ratio="1 / 1.06"
              parallax={0.08}
              sizes="(max-width: 1023px) 100vw, 48vw"
            />
          </div>

          <div className="col-span-12 lg:col-span-5 lg:col-start-8 lg:pt-6" data-reveal>
            <div className="space-y-[clamp(28px,4vh,44px)]">
              <Choice
                name="shop-blend"
                label="Blend"
                value={selected}
                onChange={(id) => onSelect(id as Product['id'])}
                options={PRODUCTS.map((p) => ({ id: p.id, label: p.subtitle }))}
              />
              <Choice
                name="shop-weight"
                label="Weight"
                value={sizeId}
                onChange={setSizeId}
                options={product.sizes.map((s) => ({ id: s.id, label: s.label }))}
              />
              <p className="meta" style={{ color: 'var(--ink-faint)' }}>
                {CUSTOM_WEIGHT_NOTE}
              </p>
            </div>

            {/* summary ---------------------------------------------------- */}
            <div
              data-summary
              className="mt-[clamp(34px,5vh,56px)] border-t pt-[clamp(22px,3vh,34px)]"
              style={{ borderColor: 'var(--rule)' }}
            >
              <p className="meta" style={{ color: 'var(--ink-faint)' }}>
                Your selection
              </p>
              <p className="mt-4 font-display text-[clamp(1.6rem,3.2vw,2.4rem)] leading-tight">
                {product.name}
              </p>
              <p className="mt-1 text-[14px]" style={{ color: 'var(--ink-soft)' }} aria-live="polite">
                {product.subtitle} · {size.label}
              </p>
              <p className="mt-6 text-[clamp(1.15rem,2.2vw,1.5rem)]">{formatPrice(size.price)}</p>

              <div className="mt-7">
                <ButtonLink href={order ?? undefined} variant="primary" arrow>
                  Order now
                </ButtonLink>
                {!order && (
                  <p className="meta mt-4 max-w-[34ch]" style={{ color: 'var(--ink-faint)' }}>
                    Add a WhatsApp number in src/data/site.ts to enable ordering
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* every weight carried, as quiet metadata -------------------------- */}
        <div
          className="mt-[clamp(44px,7vh,86px)] border-t pt-6"
          style={{ borderColor: 'var(--rule)' }}
          data-reveal
        >
          <p className="meta mb-4" style={{ color: 'var(--ink-faint)' }}>
            Packed in
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {ALL_WEIGHTS.map((w) => (
              <li key={w} className="meta" style={{ color: 'var(--ink-soft)' }}>
                {w}
              </li>
            ))}
          </ul>
        </div>

        {/* secondary strip -------------------------------------------------- */}
        <div className="mt-[clamp(40px,6vh,72px)] grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4" data-reveal>
          {SECONDARY.map((img) => (
            <Figure
              key={img.src}
              image={img}
              ratio="1 / 1"
              parallax={0}
              sizes="(max-width: 640px) 46vw, 22vw"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
