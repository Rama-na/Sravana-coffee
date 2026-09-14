/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  PLACEHOLDER ART GENERATOR  —  run once, then replace with real photography
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Every file in src/assets/images/ is produced here. They are art-directed
 *  *textures* in the brand palette — macro bean fields, ground-coffee grain,
 *  tumbler + davara geometry — rendered in depth-sorted layers with real
 *  shading and depth of field, so the prototype reads as intentional until
 *  real Saravana Coffee photography is shot.
 *
 *  Re-run:   npm i -D sharp && node scripts/generate-placeholder-art.mjs
 *  Replace:  drop a real .webp with the same filename into src/assets/images/
 *            — no code changes needed anywhere else.
 *
 *  Deterministic: the same seed always yields the same image.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'images')
mkdirSync(OUT, { recursive: true })

/* ── deterministic RNG ─────────────────────────────────────────────────── */
const rng = (seed) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const lerp = (a, b, t) => a + (b - a) * t
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v)
const hex = (r, g, b) =>
  '#' + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('')
const parse = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
const mix = (c1, c2, t) => {
  const [a, b] = [parse(c1), parse(c2)]
  return hex(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t))
}

/* ═══════════════════════════════════════════════════════════════════════
   A COFFEE BEAN
   Drawn in a 100 × 66 unit box: gradient body, dark fissure with a lit lip,
   rim light along the top-left edge. Every bean gets its own gradient so the
   field reads as lit volume rather than flat shapes.
   ═══════════════════════════════════════════════════════════════════════ */
let uid = 0
function beanSVG(x, y, s, rot, base, { light, dark }) {
  const id = `b${uid++}`
  const hi = mix(base, light, 0.55)
  const lo = mix(base, dark, 0.62)
  const core = mix(base, dark, 0.88)
  const t = `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s.toFixed(4)})`
  return {
    def: `<radialGradient id="${id}" cx="33%" cy="26%" r="86%">
  <stop offset="0%" stop-color="${hi}"/><stop offset="42%" stop-color="${base}"/>
  <stop offset="78%" stop-color="${mix(base, dark, 0.34)}"/><stop offset="100%" stop-color="${lo}"/>
</radialGradient>`,
    body: `<g transform="${t}">
  <ellipse rx="50" ry="33" fill="url(#${id})"/>
  <path d="M-47 3C-31-11-13 11 3 0S31-9 47-4" fill="none" stroke="${core}" stroke-width="7.5" stroke-linecap="round" opacity=".9"/>
  <path d="M-45 0.5C-30-13-12 8.5 2.5-2.5S30-12 45-7" fill="none" stroke="${mix(base, light, 0.72)}" stroke-width="2.4" stroke-linecap="round" opacity=".42"/>
  <path d="M-44-13A50 33 0 0 1 14-31" fill="none" stroke="${mix(base, light, 0.85)}" stroke-width="3.2" stroke-linecap="round" opacity=".32"/>
</g>`,
    shadow: `<g transform="${t}"><ellipse rx="52" ry="35" fill="#000"/></g>`,
  }
}

/**
 * Depth-sorted bean field split into render layers so sharp can blur each one
 * separately — the cheap way to fake a fast lens.
 */
function beanLayers({ w, h, count, min, max, seed, light, dark, base, lightX = 0.34, lightY = 0.26 }) {
  const r = rng(seed)
  const beans = []
  for (let i = 0; i < count; i++) {
    const x = r() * w * 1.16 - w * 0.08
    const y = r() * h * 1.16 - h * 0.08
    const depth = r() // 0 = far, 1 = near
    const d = Math.hypot((x / w - lightX) * 1.2, y / h - lightY)
    const falloff = clamp(d * 1.1)
    const tone = clamp(falloff * 0.78 + (1 - depth) * 0.3 + r() * 0.16)
    const colour = mix(light, dark, tone)
    const s = (lerp(min, max, depth ** 1.35) / 100) * (0.9 + r() * 0.25)
    beans.push({ ...beanSVG(x, y, s, r() * 360, colour, { light, dark }), depth, y })
  }
  beans.sort((a, b) => a.depth - b.depth || a.y - b.y)
  const band = (lo, hi) => beans.filter((b) => b.depth >= lo && b.depth < hi)
  const wrap = (list) =>
    list.length
      ? `<defs>${list.map((b) => b.def).join('')}</defs>${list.map((b) => b.body).join('')}`
      : ''
  return {
    far: wrap(band(0, 0.34)),
    mid: wrap(band(0.34, 0.72)),
    near: wrap(band(0.72, 0.95)),
    fore: wrap(band(0.95, 1.01)),
    shadows: beans
      .filter((b) => b.depth >= 0.34)
      .map((b) => b.shadow)
      .join(''),
    base,
  }
}

/* ── ground coffee: a dense drift of irregular particles ───────────────── */
function groundsField({ w, h, count, seed, light, dark, base, lightX = 0.42, lightY = 0.3 }) {
  const r = rng(seed)
  let out = ''
  for (let i = 0; i < count; i++) {
    const x = r() * w
    const y = r() * h
    const d = Math.hypot((x / w - lightX) * 1.15, y / h - lightY)
    const c = mix(light, dark, clamp(d * 1.05 + r() * 0.42))
    const s = 2.2 + r() ** 1.8 * 9
    const a = s * (0.45 + r() * 0.85)
    out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${s.toFixed(1)}" height="${a.toFixed(1)}" rx="${(s * 0.3).toFixed(1)}" fill="${c}" transform="rotate(${(r() * 90) | 0} ${x.toFixed(1)} ${y.toFixed(1)})" opacity="${(0.62 + r() * 0.38).toFixed(2)}"/>`
  }
  return `<rect width="${w}" height="${h}" fill="${base}"/>${out}`
}

/* ── overlays ──────────────────────────────────────────────────────────── */
const vignette = (w, h, strength = 0.55, colour = '#000000', cx = 42, cy = 34) =>
  `<defs><radialGradient id="vg" cx="${cx}%" cy="${cy}%" r="84%"><stop offset="32%" stop-color="${colour}" stop-opacity="0"/><stop offset="100%" stop-color="${colour}" stop-opacity="${strength}"/></radialGradient></defs><rect width="${w}" height="${h}" fill="url(#vg)"/>`

const glow = (w, h, colour, op = 0.3, cx = 34, cy = 26, r = 62) =>
  `<defs><radialGradient id="gw" cx="${cx}%" cy="${cy}%" r="${r}%"><stop offset="0%" stop-color="${colour}" stop-opacity="${op}"/><stop offset="100%" stop-color="${colour}" stop-opacity="0"/></radialGradient></defs><rect width="${w}" height="${h}" fill="url(#gw)"/>`

const svgBuf = (w, h, body) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`)

const render = (w, h, body, blur = 0) => {
  const s = sharp(svgBuf(w, h, body))
  return blur ? s.blur(blur).png().toBuffer() : s.png().toBuffer()
}

/** Tile-free film grain — sharp's own noise generator, not feTurbulence. */
const grain = (w, h, sigma) =>
  sharp({ create: { width: w, height: h, channels: 3, noise: { type: 'gaussian', mean: 128, sigma } } })
    .png()
    .toBuffer()

async function save(name, w, h, layers, { quality = 78, grainSigma = 9, modulate } = {}) {
  let img = sharp({ create: { width: w, height: h, channels: 4, background: '#000' } })
  img = img.composite(layers)
  let buf = await img.png().toBuffer()
  if (modulate) buf = await sharp(buf).modulate(modulate).png().toBuffer()
  buf = await sharp(buf)
    .composite([{ input: await grain(w, h, grainSigma), blend: 'overlay' }])
    .webp({ quality, effort: 6, smartSubsample: true })
    .toBuffer()
  await sharp(buf).toFile(join(OUT, `${name}.webp`))
  console.log(`  ${name.padEnd(20)} ${w}×${h}  ${(buf.length / 1024).toFixed(0)} KB`)
}

/** Assembles a photographic bean plate: far → shadows → mid → near → fore. */
async function beanPlate(name, w, h, opts, extras = {}) {
  const L = beanLayers({ w, h, ...opts })
  const layers = [
    { input: await render(w, h, `<rect width="${w}" height="${h}" fill="${L.base}"/>`) },
    { input: await render(w, h, L.far, 9) },
    { input: await render(w, h, `<g transform="translate(${w * 0.012} ${h * 0.018})" opacity=".55">${L.shadows}</g>`, 18), blend: 'multiply' },
    { input: await render(w, h, L.mid, 2.6) },
    { input: await render(w, h, L.near, 0) },
    { input: await render(w, h, L.fore, 16) },
  ]
  if (extras.glow) layers.push({ input: await render(w, h, extras.glow), blend: 'screen' })
  if (extras.over) layers.push({ input: await render(w, h, extras.over) })
  layers.push({ input: await render(w, h, extras.vignette ?? vignette(w, h, 0.66)) })
  await save(name, w, h, layers, extras.opts)
}

/* ═══════════════════════════════════════════════════════════════════════
   STAINLESS TUMBLER + DAVARA
   ═══════════════════════════════════════════════════════════════════════ */
function tumblerSVG(w, h, { x = 0, y = 0 } = {}) {
  const cx = x + w * 0.5
  const steel = (id, stops) =>
    `<linearGradient id="${id}" x1="0" x2="1">${stops.map(([o, c]) => `<stop offset="${o}%" stop-color="${c}"/>`).join('')}</linearGradient>`
  const rimY = y + h * 0.3
  const botY = y + h * 0.72
  const davY = y + h * 0.775
  const davBase = y + h * 0.875
  const tRx = w * 0.168
  const bRx = w * 0.132
  const dRx = w * 0.305
  return `<defs>
  ${steel('st', [[0, '#4a453e'], [9, '#9d978e'], [20, '#e9e4dc'], [33, '#8b857c'], [48, '#cfcac1'], [63, '#767068'], [79, '#dad5cc'], [92, '#615c55'], [100, '#3b3732']])}
  ${steel('sd', [[0, '#3d3a34'], [12, '#8e887f'], [28, '#d5d0c7'], [50, '#7b756d'], [72, '#c4bfb6'], [88, '#565149'], [100, '#332f2b']])}
  <linearGradient id="cof" x1="0" y1="0" x2="0.4" y2="1">
    <stop offset="0%" stop-color="#e3b075"/><stop offset="55%" stop-color="#b87c42"/><stop offset="100%" stop-color="#8a5526"/>
  </linearGradient>
</defs>
<ellipse cx="${cx}" cy="${davBase + h * 0.012}" rx="${dRx * 1.12}" ry="${h * 0.028}" fill="#000" opacity=".55"/>
<path d="M${cx - dRx} ${davY}q${dRx * 0.18} ${h * 0.09} ${dRx * 0.58} ${h * 0.1}h${dRx * 0.84}q${dRx * 0.4} -${h * 0.01} ${dRx * 0.58} -${h * 0.1}z" fill="url(#sd)"/>
<ellipse cx="${cx}" cy="${davY}" rx="${dRx}" ry="${h * 0.052}" fill="#b9b4ab"/>
<ellipse cx="${cx}" cy="${davY}" rx="${dRx * 0.87}" ry="${h * 0.042}" fill="#4e4a44"/>
<ellipse cx="${cx}" cy="${davY + h * 0.004}" rx="${dRx * 0.85}" ry="${h * 0.04}" fill="#6d6861"/>
<path d="M${cx - bRx} ${botY}h${bRx * 2}l${tRx - bRx} -${h * 0.42}h-${tRx * 2}z" fill="url(#st)"/>
<ellipse cx="${cx}" cy="${botY}" rx="${bRx}" ry="${h * 0.022}" fill="#57524b"/>
<ellipse cx="${cx}" cy="${rimY}" rx="${tRx}" ry="${h * 0.03}" fill="#e4dfd6"/>
<ellipse cx="${cx}" cy="${rimY + h * 0.004}" rx="${tRx * 0.86}" ry="${h * 0.024}" fill="url(#cof)"/>
<ellipse cx="${cx - tRx * 0.22}" cy="${rimY + h * 0.001}" rx="${tRx * 0.44}" ry="${h * 0.011}" fill="#f0d4a8" opacity=".55"/>
<path d="M${cx - tRx} ${rimY}a${tRx} ${h * 0.03} 0 0 0 ${tRx * 0.5} ${h * 0.026}" fill="none" stroke="#fffaf0" stroke-width="${w * 0.004}" opacity=".5"/>`
}


/* ── the Saravana seal, simplified for pack artwork ────────────────────── */
function sealSVG(cx, cy, r, ink, field) {
  const k = r / 250
  const bean = (x, y, rot, sc) =>
    `<g transform="translate(${cx + x * k} ${cy + y * k}) rotate(${rot}) scale(${(sc * k).toFixed(4)})">
      <ellipse rx="50" ry="33" fill="#A9683C" stroke="#2E1C11" stroke-width="5.5"/>
      <path d="M-43 2C-28-12-11 10 4-1S30-9 43-4" fill="none" stroke="#2E1C11" stroke-width="6" stroke-linecap="round"/>
    </g>`
  return `<g>
    <circle cx="${cx}" cy="${cy}" r="${250 * k}" fill="${field}"/>
    <circle cx="${cx}" cy="${cy}" r="${237 * k}" fill="none" stroke="${ink}" stroke-width="${26 * k}"/>
    <circle cx="${cx}" cy="${cy}" r="${208 * k}" fill="none" stroke="${ink}" stroke-width="${8 * k}"/>
    <circle cx="${cx}" cy="${cy - 12 * k}" r="${118 * k}" fill="${ink}"/>
    ${bean(-60, -62, -26, 1.05)}${bean(74, -46, 26, 1.05)}${bean(18, -80, -6, 1.18)}
    ${bean(-34, -8, -14, 1.22)}${bean(52, 0, 10, 1.12)}
  </g>`
}

/* ═══════════════════════════════════════════════════════════════════════
   PALETTE + RENDER LIST
   ═══════════════════════════════════════════════════════════════════════ */
const C = {
  blue: '#073c9d',
  blueDeep: '#052866',
  blueDark: '#031b46',
  cream: '#f4e5c4',
  roast: '#211611',
  coffee: '#6b351f',
  beanLight: '#d59a63',
  beanDark: '#241509',
}

console.log('\nGenerating Saravana Coffee placeholder art…\n')

/* 1 — HERO: macro beans, one hard light from upper-left, deep falloff */
await beanPlate(
  'hero-beans',
  1920,
  1280,
  { count: 520, min: 62, max: 215, seed: 7, base: '#120b06', light: C.beanLight, dark: C.beanDark, lightX: 0.31, lightY: 0.24 },
  { glow: glow(1920, 1280, '#ffcf92', 0.34, 31, 24, 52), vignette: vignette(1920, 1280, 0.92, '#000000', 38, 32), opts: { grainSigma: 9, quality: 74 } },
)

/* 2 — HERITAGE / THEN: archival, faded, soft focus */
await beanPlate(
  'heritage-then',
  1100,
  1450,
  { count: 120, min: 190, max: 460, seed: 21, base: '#241a12', light: '#c49a6c', dark: '#33251a', lightX: 0.42, lightY: 0.2 },
  {
    glow: glow(1100, 1450, '#f5dcae', 0.3, 42, 20, 62),
    vignette: vignette(1100, 1450, 0.85, '#150e08'),
    opts: { grainSigma: 14, quality: 68, modulate: { saturation: 0.46, brightness: 1.04 } },
  },
)

/* 3 — HERITAGE / TODAY: the same subject, clean and current */
await beanPlate(
  'heritage-today',
  1100,
  820,
  { count: 150, min: 110, max: 280, seed: 33, base: '#2a1a10', light: '#e0a76d', dark: '#2c1b0f', lightX: 0.62, lightY: 0.3 },
  { glow: glow(1100, 820, '#ffe4bb', 0.26, 62, 28, 60), vignette: vignette(1100, 820, 0.52) },
)

/* 4 — JOURNEY 01 · BEAN — tall crop, few beans, extreme macro */
await beanPlate(
  'journey-bean',
  900,
  1240,
  { count: 52, min: 300, max: 700, seed: 101, base: '#160e07', light: C.beanLight, dark: C.beanDark, lightX: 0.3, lightY: 0.22 },
  { glow: glow(900, 1240, '#ffd7a0', 0.28, 30, 22, 58), vignette: vignette(900, 1240, 0.74) },
)

/* 5 — JOURNEY 02 · ROAST — wide, drum heat from below */
await beanPlate(
  'journey-roast',
  1500,
  940,
  { count: 200, min: 80, max: 240, seed: 202, base: '#120a05', light: '#e9a765', dark: '#1d1108', lightX: 0.5, lightY: 0.78 },
  {
    glow:
      `<defs><radialGradient id="gw" cx="50%" cy="92%" r="78%"><stop offset="0%" stop-color="#ff9a3c" stop-opacity=".62"/><stop offset="52%" stop-color="#a24c14" stop-opacity=".26"/><stop offset="100%" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient></defs><rect width="1500" height="940" fill="url(#gw)"/>`,
    over: `<g opacity=".55"><circle cx="750" cy="1330" r="720" fill="none" stroke="#080402" stroke-width="54"/></g>`,
    vignette: vignette(1500, 940, 0.8, '#000000', 50, 78),
    opts: { grainSigma: 12 },
  },
)

/* 6 — JOURNEY 03 · GRIND — square, a mound of fresh grounds */
await save(
  'journey-grind',
  1100,
  1100,
  [
    { input: await render(1100, 1100, groundsField({ w: 1100, h: 1100, count: 30000, seed: 303, light: '#c28a55', dark: '#170d05', base: '#31200f' }), 1.1) },
    { input: await render(1100, 1100, groundsField({ w: 1100, h: 1100, count: 9000, seed: 304, light: '#dba36a', dark: '#241407', base: '#00000000' }).replace(`<rect width="1100" height="1100" fill="#00000000"/>`, '')) },
    { input: await render(1100, 1100, glow(1100, 1100, '#ffd9a4', 0.3, 40, 28, 56)), blend: 'screen' },
    { input: await render(1100, 1100, vignette(1100, 1100, 0.68)) },
  ],
  { grainSigma: 13 },
)

/* 7 — JOURNEY 04 · BREW — tumbler + davara, warm kitchen light */
await save(
  'journey-brew',
  1200,
  1000,
  [
    { input: await render(1200, 1000, `<rect width="1200" height="1000" fill="#1b120c"/>`) },
    { input: await render(1200, 1000, glow(1200, 1000, '#ffcb8c', 0.5, 30, 22, 68)), blend: 'screen' },
    { input: await render(1200, 1000, tumblerSVG(1200, 1000)) },
    { input: await render(1200, 1000, vignette(1200, 1000, 0.72, '#000000', 44, 40)) },
  ],
  { grainSigma: 9 },
)

/* 8 — BREW HERO — wide cinematic plate for the full-bleed brew section */
await save(
  'brew-hero',
  1920,
  1200,
  [
    { input: await render(1920, 1200, `<rect width="1920" height="1200" fill="#16100b"/>`) },
    { input: await render(1920, 1200, glow(1920, 1200, '#ffd39c', 0.55, 20, 16, 64)), blend: 'screen' },
    { input: await render(1920, 1200, beanLayers({ w: 1920, h: 1200, count: 40, min: 70, max: 150, seed: 909, base: '#16100b', light: '#a06c40', dark: '#1d120a', lightX: 0.18, lightY: 0.2 }).mid, 5) },
    { input: await render(1920, 1200, tumblerSVG(880, 1080, { x: 520, y: 60 })) },
    { input: await render(1920, 1200, vignette(1920, 1200, 0.82, '#000000', 46, 40)) },
  ],
  { grainSigma: 10, quality: 76 },
)

/* 9 / 10 — BLEND PACKS */
const pack = (w, h, bag, band) => `
  <defs><linearGradient id="bagg" x1="0" x2="1">
    <stop offset="0%" stop-color="${mix(bag, '#000000', 0.42)}"/><stop offset="20%" stop-color="${bag}"/>
    <stop offset="58%" stop-color="${mix(bag, '#ffffff', 0.12)}"/><stop offset="100%" stop-color="${mix(bag, '#000000', 0.5)}"/>
  </linearGradient></defs>
  <ellipse cx="${w * 0.5}" cy="${h * 0.855}" rx="${w * 0.27}" ry="${h * 0.026}" fill="#000" opacity=".5"/>
  <g transform="translate(${w * 0.5} ${h * 0.5})">
    <path d="M${-w * 0.2} ${-h * 0.3}l${w * 0.06} -${h * 0.036}h${w * 0.28}l${w * 0.06} ${h * 0.036}v${h * 0.65}h${-w * 0.4}z" fill="url(#bagg)"/>
    <path d="M${-w * 0.2} ${-h * 0.3}l${w * 0.06} -${h * 0.036}h${w * 0.28}l${w * 0.06} ${h * 0.036}z" fill="${mix(bag, '#000000', 0.55)}"/>
    <rect x="${-w * 0.2}" y="${h * 0.155}" width="${w * 0.4}" height="${h * 0.0016}" fill="${band}" opacity=".4"/>
    <rect x="${-w * 0.2}" y="${h * 0.205}" width="${w * 0.4}" height="${h * 0.0016}" fill="${band}" opacity=".22"/>
  </g>
  ${sealSVG(w * 0.5, h * 0.42, w * 0.115, bag === '#e8dcc0' ? C.blueDeep : C.blueDark, band)}
  <g fill="${band}" font-family="sans-serif" text-anchor="middle">
    <text x="${w * 0.5}" y="${h * 0.605}" font-size="${w * 0.026}" font-weight="700" letter-spacing="${w * 0.008}">SARAVANA COFFEE</text>
    <text x="${w * 0.5}" y="${h * 0.64}" font-size="${w * 0.0155}" opacity=".65" letter-spacing="${w * 0.005}">FRESHLY ROASTED &amp; GROUND</text>
  </g>`

await save('blend-classic', 1000, 1250, [
  { input: await render(1000, 1250, `<rect width="1000" height="1250" fill="#07132e"/>`) },
  { input: await render(1000, 1250, glow(1000, 1250, '#7fa6ff', 0.22, 34, 24, 60)), blend: 'screen' },
  { input: await render(1000, 1250, beanLayers({ w: 1000, h: 1250, count: 30, min: 80, max: 180, seed: 44, base: '#07132e', light: '#8a5c36', dark: '#1b1108', lightX: 0.2, lightY: 0.9 }).near, 3) },
  { input: await render(1000, 1250, pack(1000, 1250, C.blue, C.cream)) },
  { input: await render(1000, 1250, vignette(1000, 1250, 0.62)) },
])
await save('blend-pure', 1000, 1250, [
  { input: await render(1000, 1250, `<rect width="1000" height="1250" fill="#1a120c"/>`) },
  { input: await render(1000, 1250, glow(1000, 1250, '#ffd6a2', 0.3, 66, 24, 60)), blend: 'screen' },
  { input: await render(1000, 1250, beanLayers({ w: 1000, h: 1250, count: 30, min: 80, max: 180, seed: 55, base: '#1a120c', light: '#c08a56', dark: '#2b1a12', lightX: 0.8, lightY: 0.9 }).near, 3) },
  { input: await render(1000, 1250, pack(1000, 1250, '#e8dcc0', C.blueDeep)) },
  { input: await render(1000, 1250, vignette(1000, 1250, 0.58)) },
])

/* 11 — PRODUCT HERO: the pack on warm paper, studio-lit */
await save('product-pack', 1400, 1500, [
  { input: await render(1400, 1500, `<rect width="1400" height="1500" fill="#e7d9bb"/>`) },
  { input: await render(1400, 1500, glow(1400, 1500, '#fffaf0', 0.85, 40, 26, 66)), blend: 'screen' },
  { input: await render(1400, 1500, `<ellipse cx="700" cy="1225" rx="330" ry="40" fill="#6b5836" opacity=".42"/>`, 22) },
  { input: await render(1400, 1500, pack(1400, 1500, C.blue, C.cream).replace(/<ellipse[^/]*\/>/, '')) },
  { input: await render(1400, 1500, vignette(1400, 1500, 0.3, '#4a3a22')) },
], { grainSigma: 7 })

/* 12-17 — GALLERY + SUPPORTING PLATES */
await beanPlate('gallery-beans', 1000, 1320, { count: 150, min: 110, max: 280, seed: 501, base: '#180f08', light: C.beanLight, dark: C.beanDark, lightX: 0.3, lightY: 0.24 }, { glow: glow(1000, 1320, '#ffd29a', 0.24), vignette: vignette(1000, 1320, 0.66) })

await save('gallery-powder', 1000, 760, [
  { input: await render(1000, 760, groundsField({ w: 1000, h: 760, count: 20000, seed: 502, light: '#c08a55', dark: '#170d05', base: '#3a2412', lightX: 0.62, lightY: 0.34 }), 0.8) },
  { input: await render(1000, 760, glow(1000, 760, '#ffd9a4', 0.24, 62, 30, 54)), blend: 'screen' },
  { input: await render(1000, 760, vignette(1000, 760, 0.6, '#000000', 62, 34)) },
], { grainSigma: 12 })

/* Filter drum — the tall stainless South Indian coffee filter */
await save('gallery-filter', 900, 1150, [
  { input: await render(900, 1150, `<rect width="900" height="1150" fill="#15100c"/>`) },
  { input: await render(900, 1150, glow(900, 1150, '#ffcf94', 0.42, 30, 20, 62)), blend: 'screen' },
  {
    input: await render(
      900,
      1150,
      `<defs><linearGradient id="ft" x1="0" x2="1">
        <stop offset="0%" stop-color="#413d37"/><stop offset="14%" stop-color="#a49e95"/><stop offset="30%" stop-color="#e7e2d9"/>
        <stop offset="50%" stop-color="#857f77"/><stop offset="70%" stop-color="#d3cec5"/><stop offset="88%" stop-color="#5d5850"/><stop offset="100%" stop-color="#38342f"/>
      </linearGradient></defs>
      <ellipse cx="450" cy="960" rx="215" ry="30" fill="#000" opacity=".6"/>
      <path d="M262 300h376v600q0 34-40 40H302q-40-6-40-40z" fill="url(#ft)"/>
      <ellipse cx="450" cy="300" rx="188" ry="34" fill="#cbc6bd"/>
      <path d="M272 296h356v-52q0-26-34-26H306q-34 0-34 26z" fill="url(#ft)"/>
      <ellipse cx="450" cy="218" rx="178" ry="30" fill="#b6b1a8"/>
      <ellipse cx="450" cy="212" rx="150" ry="24" fill="#4c4841"/>
      <circle cx="450" cy="196" r="30" fill="#a8a29a"/>
      <rect x="436" y="150" width="28" height="54" rx="10" fill="#8d8880"/>
      <path d="M286 320a1 1 0 0 0 0 560" fill="none" stroke="#fffaf0" stroke-width="4" opacity=".22"/>`,
    ),
  },
  { input: await render(900, 1150, vignette(900, 1150, 0.72)) },
], { grainSigma: 9 })

await save('gallery-tumbler', 1000, 1000, [
  { input: await render(1000, 1000, `<rect width="1000" height="1000" fill="#1a120d"/>`) },
  { input: await render(1000, 1000, glow(1000, 1000, '#ffd2a0', 0.46, 32, 22, 64)), blend: 'screen' },
  { input: await render(1000, 1000, tumblerSVG(1000, 1000)) },
  { input: await render(1000, 1000, vignette(1000, 1000, 0.68, '#000000', 44, 40)) },
], { grainSigma: 9 })

/* Roastery interior — lamplit machinery silhouettes */
await save('gallery-roastery', 1400, 900, [
  { input: await render(1400, 900, `<rect width="1400" height="900" fill="#101728"/>`) },
  { input: await render(1400, 900, glow(1400, 900, '#ffcf8f', 0.6, 72, 18, 58)), blend: 'screen' },
  {
    input: await render(
      1400,
      900,
      `<g fill="#080c18" opacity=".92">
        <rect x="60" y="380" width="290" height="520" rx="8"/>
        <rect x="404" y="250" width="236" height="650" rx="8"/>
        <circle cx="522" cy="430" r="118"/>
        <rect x="700" y="440" width="268" height="460" rx="8"/>
        <rect x="1024" y="300" width="300" height="600" rx="8"/>
        <rect x="0" y="866" width="1400" height="40"/>
      </g>
      <g fill="#e8b877" opacity=".3"><circle cx="522" cy="430" r="62"/><rect x="1070" y="356" width="200" height="120" rx="4"/><rect x="120" y="440" width="160" height="90" rx="4"/></g>`,
      1.2,
    ),
  },
  { input: await render(1400, 900, vignette(1400, 900, 0.74, '#02050d')) },
], { grainSigma: 12 })

/* Chennai dawn — abstracted skyline, no real geography implied */
await save('gallery-chennai', 1200, 800, [
  {
    input: await render(
      1200,
      800,
      `<defs><linearGradient id="dawn" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#f0b878" stop-opacity=".85"/><stop offset="34%" stop-color="#9c6a72" stop-opacity=".5"/>
        <stop offset="72%" stop-color="#243c73" stop-opacity=".8"/><stop offset="100%" stop-color="#0a1a3f"/>
      </linearGradient></defs>
      <rect width="1200" height="800" fill="#0a1a3f"/><rect width="1200" height="800" fill="url(#dawn)"/>
      <circle cx="330" cy="520" r="52" fill="#ffe2b4" opacity=".75"/>`,
    ),
  },
  {
    input: await render(
      1200,
      800,
      `<g fill="#050d22" opacity=".95">
        <rect x="0" y="620" width="1200" height="180"/>
        <rect x="52" y="540" width="96" height="90"/><rect x="186" y="496" width="128" height="134"/>
        <rect x="352" y="566" width="74" height="64"/><rect x="470" y="470" width="150" height="160"/>
        <rect x="660" y="540" width="100" height="90"/><rect x="800" y="500" width="138" height="130"/>
        <rect x="978" y="556" width="86" height="74"/><rect x="1096" y="512" width="90" height="118"/>
        <path d="M536 470l38-64 38 64z"/><path d="M848 500l30-52 30 52z"/>
      </g>`,
    ),
  },
  { input: await render(1200, 800, vignette(1200, 800, 0.6, '#02060f')) },
], { grainSigma: 11 })

/* 18 — GROUNDS TEXTURE for the bean → grounds transition */
await save('grounds-texture', 1600, 1000, [
  { input: await render(1600, 1000, groundsField({ w: 1600, h: 1000, count: 36000, seed: 777, light: '#a8733f', dark: '#150c04', base: '#2a1a0e' }), 0.6) },
  { input: await render(1600, 1000, vignette(1600, 1000, 0.5)) },
], { grainSigma: 13, quality: 74 })

console.log('\nDone — src/assets/images/\n')
