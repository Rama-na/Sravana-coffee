import { useEffect, useRef } from 'react'
import bean01 from '../assets/beans/coffee-bean-01.svg'
import bean02 from '../assets/beans/coffee-bean-02.svg'
import bean03 from '../assets/beans/coffee-bean-03.svg'
import { gsap } from '../lib/animations'
import { FLOW, startFlow } from '../lib/flow'
import { DEBUG_BEANS } from '../lib/debug'
import { useIsDesktop, useReducedMotion } from '../hooks/useMediaQuery'

const VARIANTS = [bean01, bean02, bean03]

export interface BeanFlowProps {
  enabled?: boolean
  density?: 'low' | 'medium' | 'high'
  /** Multiplies fall speed. 1 is the tuned default. */
  speed?: number
  theme?: 'brown' | 'cream'
  /** Fraction of the desktop density used below 1024px. */
  mobileDensity?: number
}

/* ── tuning ─────────────────────────────────────────────────────────────── */
const DENSITY_SCALE = { low: 0.6, medium: 1, high: 1.5 } as const

/**
 * Three depth tiers. Background beans sit in the layer behind the page, so
 * they pass under headings and photographs; midground and foreground sit in
 * the layer above it and cross in front. Size, speed and opacity all track
 * depth, which is what sells it as distance rather than as three opacities.
 */
const TIERS = [
  { layer: 'back', weight: 0.44, scale: [0.3, 0.46], speed: [26, 40], alpha: [0.25, 0.45] },
  { layer: 'front', weight: 0.4, scale: [0.42, 0.6], speed: [40, 62], alpha: [0.6, 0.9] },
  { layer: 'front', weight: 0.16, scale: [0.66, 0.88], speed: [64, 92], alpha: [0.9, 1] },
] as const

/** Picks a depth tier by weight, so the foreground stays the rare one. */
function pickTier(): number {
  const r = Math.random()
  let acc = 0
  for (let i = 0; i < TIERS.length; i++) {
    acc += TIERS[i].weight
    if (r <= acc) return i
  }
  return 0
}

interface Bean {
  el: HTMLImageElement
  /** Last opacity written, so the style is only touched when it changes. */
  shown: number
  live: boolean
  x: number
  y: number
  vy: number
  drift: number
  waveAmp: number
  waveFreq: number
  wavePhase: number
  rot: number
  vrot: number
  scale: number
  alpha: number
  tier: number
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const pick = <T,>(arr: readonly T[]) => arr[(Math.random() * arr.length) | 0]

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  BEAN FLOW — the page's one continuous visual element
 * ═══════════════════════════════════════════════════════════════════════════
 *  Beans spill from the bag in the hero and keep falling for the length of the
 *  page, drifting along a route anchored to the sections. Through the roast
 *  they darken and break down into grounds; across the brew they all but
 *  disappear and the aroma takes over; afterwards they return.
 *
 *  One instance, mounted at page level and never unmounted, so the stream
 *  survives every section boundary — that continuity is the whole point.
 *
 *  Implementation notes
 *  ────────────────────
 *  · Two fixed layers, one behind the page content and one in front, which is
 *    what puts beans genuinely behind headings rather than faking depth with
 *    opacity alone.
 *  · A fixed pool of <img> elements, recycled. Nothing is created or destroyed
 *    while the page is running.
 *  · One loop on the GSAP ticker (already synced to Lenis). It writes only
 *    transforms, and reads no layout: scroll comes from the shared flow state
 *    and the bag's position is sampled a few times a second, then carried
 *    between samples by the scroll delta.
 *  · Idle when the tab is hidden.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function BeanFlow({
  enabled = true,
  density = 'medium',
  speed = 1,
  theme = 'brown',
  mobileDensity = 0.62,
}: BeanFlowProps) {
  const backRef = useRef<HTMLDivElement>(null)
  const frontRef = useRef<HTMLDivElement>(null)
  const debugRef = useRef<HTMLDivElement>(null)
  const isDesktop = useIsDesktop()
  const reduced = useReducedMotion()

  useEffect(() => {
    const back = backRef.current
    const front = frontRef.current
    if (!enabled || reduced || !back || !front) return

    const scale = DENSITY_SCALE[density] * (isDesktop ? 1 : mobileDensity)
    const poolSize = Math.round((isDesktop ? 34 : 16) * (density === 'high' ? 1.15 : 1))
    // Visible at once: 9–16 on desktop, 5–9 on mobile, before phase scaling.
    const targetVisible = (isDesktop ? 13 : 7) * scale

    /* ── build the pool once ──────────────────────────────────────────── */
    const beans: Bean[] = []
    for (let i = 0; i < poolSize; i++) {
      const tier = pickTier()
      const el = document.createElement('img')
      el.src = pick(VARIANTS)
      el.alt = ''
      el.decoding = 'async'
      el.setAttribute('aria-hidden', 'true')
      el.className = 'beanflow__bean'
      el.style.visibility = 'hidden'
      ;(TIERS[tier].layer === 'back' ? back : front).appendChild(el)
      beans.push({
        el,
        live: false,
        x: 0, y: 0, vy: 0, drift: 0,
        waveAmp: 0, waveFreq: 0, wavePhase: 0,
        rot: 0, vrot: 0, scale: 1, alpha: 1, shown: -1,
        tier,
      })
    }

    /* ── grounds: the beans' own dust, only in the air around the roast ── */
    const groundsPool: Bean[] = []
    const groundsCount = isDesktop ? 64 : 28
    for (let i = 0; i < groundsCount; i++) {
      const el = document.createElement('span')
      el.className = 'beanflow__ground'
      el.setAttribute('aria-hidden', 'true')
      el.style.visibility = 'hidden'
      ;(i % 2 === 0 ? back : front).appendChild(el)
      groundsPool.push({
        el: el as unknown as HTMLImageElement,
        live: false,
        x: 0, y: 0, vy: 0, drift: 0,
        waveAmp: 0, waveFreq: 0, wavePhase: 0,
        rot: 0, vrot: 0, scale: 1, alpha: 1, shown: -1,
        tier: 0,
      })
    }

    /* ── the origin: the mouth of the bag in the hero ─────────────────── */
    const originEl = document.querySelector<HTMLElement>('[data-bean-origin]')
    let originX = FLOW.vw * 0.63
    let originY = FLOW.vh * 0.5
    let originLive = false
    let lastSample = 0
    let lastScrollAtSample = 0

    const sampleOrigin = (now: number) => {
      // Re-read the bag a few times a second and carry it between samples with
      // the scroll delta — accurate, and it keeps layout reads off the frame.
      if (!originEl) {
        originLive = false
        return
      }
      if (now - lastSample > 110) {
        const r = originEl.getBoundingClientRect()
        if (r.width > 0) {
          originX = r.left + r.width * 0.36
          originY = r.top + r.height * 0.84
          originLive = r.bottom > -200 && r.top < FLOW.vh * 1.4
        } else {
          originLive = false
        }
        lastSample = now
        lastScrollAtSample = FLOW.scroll
      } else if (originLive) {
        originY -= FLOW.scroll - lastScrollAtSample
        lastScrollAtSample = FLOW.scroll
        if (originY < -260) originLive = false
      }
    }

    /* ── spawning ─────────────────────────────────────────────────────── */
    function spawn(b: Bean, initial: boolean) {
      const t = TIERS[b.tier]
      b.live = true
      b.scale = rand(t.scale[0], t.scale[1])
      b.alpha = rand(t.alpha[0], t.alpha[1])
      b.vy = rand(t.speed[0], t.speed[1])
      b.drift = rand(-11, 11)
      b.waveAmp = rand(6, 26) * b.scale
      b.waveFreq = rand(0.22, 0.55)
      b.wavePhase = Math.random() * Math.PI * 2
      b.rot = Math.random() * 360
      b.vrot = rand(-26, 26)
      b.el.src = pick(VARIANTS)
      // Roast darkening is a class set once per spawn. A filter on the moving
      // layer would look the same and cost a full re-raster every frame.
      b.el.classList.toggle('beanflow__bean--roasted', roasted)

      if (originLive) {
        // Out of the bag: tight spread, a little sideways carry.
        b.x = originX + rand(-26, 26) * b.scale
        b.y = originY + rand(-10, 24)
        b.drift += rand(-6, 6)
      } else {
        // Past the hero the stream enters from above, on the page-long path.
        const spread = FLOW.vw * (0.1 + 0.06 * b.scale)
        b.x = FLOW.pathX * FLOW.vw + rand(-spread, spread)
        b.y = -60 - Math.random() * 140
      }
      if (initial) b.y = rand(-FLOW.vh * 0.2, FLOW.vh * 0.9)
      b.shown = -1
      b.el.style.visibility = 'visible'
    }

    function spawnGround(g: Bean) {
      g.live = true
      g.scale = rand(0.5, 1.5)
      g.alpha = rand(0.55, 1)
      g.vy = rand(70, 150)
      g.drift = rand(-18, 18)
      g.waveAmp = rand(3, 12)
      g.waveFreq = rand(0.4, 0.9)
      g.wavePhase = Math.random() * Math.PI * 2
      g.rot = 0
      g.vrot = 0
      const spread = FLOW.vw * 0.2
      g.x = FLOW.pathX * FLOW.vw + rand(-spread, spread)
      g.y = -40 - Math.random() * 180
      g.shown = -1
      g.el.style.visibility = 'visible'
    }

    function retire(b: Bean) {
      b.live = false
      b.el.style.visibility = 'hidden'
    }

    /* ── the loop ─────────────────────────────────────────────────────── */
    let elapsed = 0
    let lastTime = 0
    let sinceSpawn = 0
    let roasted = false
    let hidden = document.visibilityState === 'hidden'
    const onVisibility = () => {
      hidden = document.visibilityState === 'hidden'
      lastTime = 0
    }
    document.addEventListener('visibilitychange', onVisibility)

    const stopFlow = startFlow()

    const loop = (time: number) => {
      if (hidden) return
      const now = time * 1000
      const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0.016
      lastTime = now
      elapsed += dt

      sampleOrigin(now)

      const boost = FLOW.boost * speed
      const wantBeans = targetVisible * FLOW.beans
      const wantGrounds = groundsCount * FLOW.grounds * 0.9

      let liveBeans = 0
      for (const b of beans) {
        if (!b.live) continue
        liveBeans++
        b.y += b.vy * boost * dt
        b.x += b.drift * dt
        b.rot += b.vrot * dt
        const wave = Math.sin(elapsed * b.waveFreq + b.wavePhase) * b.waveAmp
        // Beans shrink away as they turn into grounds rather than blinking out.
        const shrink = 1 - FLOW.grounds * 0.55
        const op = b.alpha * Math.min(1, FLOW.beans * 1.6)
        if (Math.abs(op - b.shown) > 0.015) {
          b.el.style.opacity = op.toFixed(3)
          b.shown = op
        }
        b.el.style.transform = `translate3d(${(b.x + wave).toFixed(1)}px, ${b.y.toFixed(1)}px, 0) rotate(${b.rot.toFixed(1)}deg) scale(${(b.scale * shrink).toFixed(3)})`
        if (b.y > FLOW.vh + 120 || b.x < -220 || b.x > FLOW.vw + 220) retire(b)
      }

      let liveGrounds = 0
      for (const g of groundsPool) {
        if (!g.live) continue
        liveGrounds++
        g.y += g.vy * boost * dt
        g.x += g.drift * dt
        const wave = Math.sin(elapsed * g.waveFreq + g.wavePhase) * g.waveAmp
        const gop = g.alpha * FLOW.grounds
        if (Math.abs(gop - g.shown) > 0.02) {
          g.el.style.opacity = gop.toFixed(3)
          g.shown = gop
        }
        g.el.style.transform = `translate3d(${(g.x + wave).toFixed(1)}px, ${g.y.toFixed(1)}px, 0) scale(${g.scale.toFixed(2)})`
        if (g.y > FLOW.vh + 60) retire(g)
      }

      // The roast darkens the beans. Applied on the flip only — beans already
      // in the air have to change too, and a filter on the moving layer would
      // cost a full re-raster every frame to achieve the same thing.
      const nowRoasted = FLOW.roast > 0.45
      if (nowRoasted !== roasted) {
        roasted = nowRoasted
        for (const b of beans) b.el.classList.toggle('beanflow__bean--roasted', roasted)
      }

      // Emit on a stagger so the stream stays organic rather than pulsing.
      sinceSpawn += dt
      if (liveBeans < wantBeans && sinceSpawn > 0.18 / Math.max(0.3, boost)) {
        const free = beans.find((b) => !b.live)
        if (free) spawn(free, false)
        sinceSpawn = 0
      }
      if (liveGrounds < wantGrounds) {
        const free = groundsPool.find((g) => !g.live)
        if (free) spawnGround(free)
      }

      if (DEBUG_BEANS && debugRef.current) {
        debugRef.current.textContent = `beans ${liveBeans}/${beans.length} · grounds ${liveGrounds} · boost ${FLOW.boost.toFixed(2)} · pathX ${FLOW.pathX.toFixed(2)} · b ${FLOW.beans.toFixed(2)} g ${FLOW.grounds.toFixed(2)} a ${FLOW.aroma.toFixed(2)} r ${FLOW.roast.toFixed(2)}`
        debugRef.current.style.setProperty('--dbg-x', `${(FLOW.pathX * 100).toFixed(1)}%`)
        debugRef.current.style.setProperty('--dbg-oy', originLive ? `${originY.toFixed(0)}px` : '-100px')
        debugRef.current.style.setProperty('--dbg-ox', `${originX.toFixed(0)}px`)
      }
    }

    // Seed the stream so the hero is never momentarily empty.
    for (let i = 0; i < Math.min(beans.length, Math.round(targetVisible)); i++) spawn(beans[i], true)

    gsap.ticker.add(loop)

    return () => {
      gsap.ticker.remove(loop)
      document.removeEventListener('visibilitychange', onVisibility)
      stopFlow()
      back.replaceChildren()
      front.replaceChildren()
    }
  }, [enabled, density, speed, mobileDensity, isDesktop, reduced])

  /* ── reduced motion: a few beans resting along the route, nothing moving ── */
  if (reduced || !enabled) {
    if (!enabled) return null
    return (
      <div className="beanflow-static" aria-hidden="true">
        {[
          { top: '14%', left: '68%', s: 1, r: -18 },
          { top: '31%', left: '18%', s: 0.8, r: 24 },
          { top: '52%', left: '74%', s: 0.9, r: -8 },
          { top: '71%', left: '26%', s: 0.7, r: 32 },
          { top: '88%', left: '58%', s: 0.85, r: -26 },
        ].map((b, i) => (
          <img
            key={i}
            src={VARIANTS[i % VARIANTS.length]}
            alt=""
            className="beanflow-static__bean"
            style={{ top: b.top, left: b.left, transform: `rotate(${b.r}deg) scale(${b.s})` }}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <div ref={backRef} className="beanflow beanflow--back" data-theme={theme} aria-hidden="true" />
      <div ref={frontRef} className="beanflow beanflow--front" data-theme={theme} aria-hidden="true" />
      {DEBUG_BEANS && <div ref={debugRef} className="beanflow-debug" aria-hidden="true" />}
    </>
  )
}
