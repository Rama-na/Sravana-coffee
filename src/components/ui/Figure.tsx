import { useRef } from 'react'
import type { ImageAsset } from '../../data/images'
import { imageParallax } from '../../lib/animations'
import { useGsapContext } from '../../hooks/useGsapContext'

interface FigureProps {
  image: ImageAsset
  className?: string
  /** Aspect ratio of the frame, e.g. '3 / 4'. Defaults to the image's own. */
  ratio?: string
  /** Parallax travel as a fraction of frame height. 0 disables it. */
  parallax?: number
  /** Caption + index shown beneath, magazine-style. */
  caption?: string
  index?: string
  priority?: boolean
  sizes?: string
}

/**
 * Every photograph on the site goes through here: fixed frame, cover crop,
 * optional scroll parallax, optional hairline caption. Keeping the crop in one
 * place is what stops the gallery drifting into a card grid.
 */
export function Figure({
  image,
  className,
  ratio,
  parallax = 0.14,
  caption,
  index,
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw',
}: FigureProps) {
  const frameRef = useRef<HTMLDivElement>(null)

  useGsapContext(
    frameRef,
    (mm) => {
      if (!parallax) return
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const img = frameRef.current?.querySelector('img')
        if (img && frameRef.current) imageParallax(img, frameRef.current, parallax)
      })
    },
    [parallax],
  )

  const text = caption ?? image.caption

  return (
    <figure className={`m-0 ${className ?? ''}`}>
      <div
        ref={frameRef}
        className="img-frame img-hover"
        style={{ aspectRatio: ratio ?? `${image.width} / ${image.height}` }}
      >
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          sizes={sizes}
        />
      </div>
      {(text || index) && (
        <figcaption className="mt-4 flex items-baseline gap-3">
          {index && (
            <span className="meta shrink-0" style={{ color: 'var(--ink-faint)' }}>
              {index}
            </span>
          )}
          {text && (
            <span
              className="font-display text-[15px] italic leading-snug"
              style={{ color: 'var(--ink-soft)' }}
            >
              {text}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  )
}
