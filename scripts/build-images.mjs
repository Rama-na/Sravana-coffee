/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  IMAGE PIPELINE  —  real photography → the site's image set
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Masters live in  src/assets/source/  and are committed as-is. This script
 *  crops, grades and compresses them into  src/assets/images/ , which is what
 *  the app imports through src/data/images.ts.
 *
 *  Run:  npm i -D sharp && node scripts/build-images.mjs
 *
 *  Adding or re-shooting a photo
 *  ─────────────────────────────
 *  1. Drop the master into src/assets/source/
 *  2. Add or edit an entry in DERIVED below — `crop` is in master pixels
 *     ({ left, top, width, height }), `out` is the delivered size
 *  3. Re-run the script, then update width/height in src/data/images.ts
 *
 *  Slots this script does NOT cover are still generated artwork; see
 *  scripts/generate-placeholder-art.mjs and the README shot list.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'src', 'assets', 'source')
const OUT = join(ROOT, 'src', 'assets', 'images')
const LOGO = join(ROOT, 'src', 'assets', 'logo')
const PUBLIC = join(ROOT, 'public')
for (const d of [OUT, LOGO, PUBLIC]) mkdirSync(d, { recursive: true })

/* ── masters ───────────────────────────────────────────────────────────── */
const SET = 'filter-coffee-set.webp' // 1536 × 1024 — tumbler, davara, filter, brass
const BED = 'bean-bed.jpg' //            1333 × 2000 — roasted beans, filling the frame
const ROAST = 'roaster.jpg' //           2000 × 1333 — drum discharging into the cooler
const BAG = 'beans-in-bag.jpg' //        1600 × 2000 — beans in an open pack

/**
 * Every delivered image. `crop` is in master pixels; `out` is what ships.
 * Nothing is upscaled beyond ~1.6×, which is where softness starts to show.
 */
const DERIVED = [
  /* ── hero: macro beans, no cup in frame ──────────────────────────────── */
  {
    name: 'hero-beans',
    from: BED,
    crop: { left: 150, top: 1300, width: 1050, height: 700 },
    out: [1680, 1120],
    grade: { brightness: 0.82, saturation: 1.04 },
    quality: 76,
  },

  /* ── heritage: the traditional set, then the modern pack ─────────────── */
  {
    name: 'heritage-then',
    from: SET,
    crop: { left: 0, top: 0, width: 500, height: 659 },
    out: [1000, 1318],
    // Warm, low-saturation grade so it reads as the archival half of the pair.
    grade: { brightness: 1.04, saturation: 0.52 },
    tint: '#8a6a3f',
    quality: 74,
  },
  {
    name: 'heritage-today',
    from: BAG,
    crop: { left: 200, top: 700, width: 1300, height: 970 },
    out: [1300, 970],
    quality: 78,
  },

  /* ── journey ─────────────────────────────────────────────────────────── */
  {
    name: 'journey-bean',
    from: BED,
    crop: { left: 800, top: 1266, width: 533, height: 734 },
    out: [853, 1174],
    quality: 78,
  },
  {
    name: 'journey-roast',
    from: ROAST,
    crop: { left: 250, top: 300, width: 1500, height: 940 },
    out: [1500, 940],
    quality: 78,
  },
  {
    name: 'journey-brew',
    from: SET,
    crop: { left: 470, top: 400, width: 620, height: 517 },
    out: [1116, 931],
    quality: 80,
  },

  /* ── brew: the full scene, cinematic ─────────────────────────────────── */
  {
    name: 'brew-hero',
    from: SET,
    crop: { left: 0, top: 40, width: 1536, height: 960 },
    out: [1843, 1152],
    quality: 76,
  },

  /* ── gallery ─────────────────────────────────────────────────────────── */
  {
    name: 'gallery-beans',
    from: BED,
    crop: { left: 400, top: 1320, width: 515, height: 680 },
    out: [760, 1003],
    quality: 78,
  },
  {
    name: 'gallery-filter',
    from: SET,
    crop: { left: 990, top: 60, width: 500, height: 638 },
    out: [800, 1021],
    quality: 80,
  },
  {
    // A tighter macro than journey-brew, which uses the same master — the two
    // must not read as the same photograph twice.
    name: 'gallery-tumbler',
    from: SET,
    crop: { left: 552, top: 432, width: 430, height: 430 },
    out: [860, 860],
    quality: 82,
  },
  {
    // The brass vessel and cloth on the counter — keeps the gallery entirely
    // photographic, so the illustrated Chennai plate is only used in the
    // Chennai section where an abstraction is the point.
    name: 'gallery-counter',
    from: SET,
    crop: { left: 60, top: 0, width: 640, height: 427 },
    out: [1100, 734],
    quality: 80,
  },
  {
    name: 'gallery-roastery',
    from: ROAST,
    crop: { left: 60, top: 87, width: 1940, height: 1246 },
    out: [1400, 899],
    quality: 76,
  },
]

async function build(spec) {
  let img = sharp(join(SRC, spec.from)).extract(spec.crop).resize(spec.out[0], spec.out[1], {
    fit: 'fill',
    kernel: 'lanczos3',
  })
  if (spec.grade) img = img.modulate(spec.grade)
  if (spec.tint) img = img.tint(spec.tint)
  const buf = await img.webp({ quality: spec.quality ?? 78, effort: 6 }).toBuffer()
  await sharp(buf).toFile(join(OUT, `${spec.name}.webp`))
  console.log(
    `  ${spec.name.padEnd(20)} ${spec.out[0]}×${spec.out[1]}  ${(buf.length / 1024).toFixed(0)} KB   ← ${spec.from}`,
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   THE SEAL
   The supplied artwork already carries an alpha channel, so it only needs
   trimming to the badge and exporting at the sizes the site asks for.
   ═══════════════════════════════════════════════════════════════════════ */
async function buildLogo() {
  const master = join(SRC, 'saravana-seal-original.webp')
  const trimmed = await sharp(master).trim({ threshold: 1 }).toBuffer()
  const { width, height } = await sharp(trimmed).metadata()
  const side = Math.max(width, height)

  // Square it up so the badge is never distorted by a non-square frame.
  const squared = await sharp({
    create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: trimmed, gravity: 'centre' }])
    .png()
    .toBuffer()

  const seal = await sharp(squared).resize(768, 768).webp({ quality: 92, effort: 6 }).toBuffer()
  await sharp(seal).toFile(join(LOGO, 'saravana-seal.webp'))
  console.log(`  ${'saravana-seal'.padEnd(20)} 768×768  ${(seal.length / 1024).toFixed(0)} KB   ← trimmed ${width}×${height}`)

  // Favicon: a flat cream disc behind the badge so it reads on any browser
  // chrome, light or dark.
  const fav = await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><circle cx="256" cy="256" r="256" fill="#FCF6E4"/></svg>`,
        ),
      },
      { input: await sharp(squared).resize(512, 512).toBuffer() },
    ])
    .png()
    .toBuffer()
  // sharp resizes before compositing, so the downscale has to be a second pass
  const favSmall = await sharp(fav)
    .resize(256, 256)
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toBuffer()
  await sharp(favSmall).toFile(join(PUBLIC, 'favicon.png'))
  console.log(`  ${'favicon'.padEnd(20)} 256×256  ${(favSmall.length / 1024).toFixed(0)} KB`)

}

console.log('\nBuilding images from src/assets/source/…\n')
await buildLogo()
for (const spec of DERIVED) await build(spec)
console.log('\nDone.\n')
