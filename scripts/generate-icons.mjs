import { readFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = resolve(ROOT, 'scripts/icon-source.svg')
const ICONS_DIR = resolve(ROOT, 'public/icons')
const FAVICON = resolve(ROOT, 'public/favicon.png')

const TARGETS = [
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-512-maskable.png', size: 512, maskable: true },
]

const MASKABLE_BG = '#0F172A'
const MASKABLE_INNER_RATIO = 0.8

async function main() {
  const svg = await readFile(SOURCE)
  await mkdir(ICONS_DIR, { recursive: true })

  for (const target of TARGETS) {
    if (target.maskable) {
      const inner = Math.round(target.size * MASKABLE_INNER_RATIO)
      const padding = Math.round((target.size - inner) / 2)
      const innerBuffer = await sharp(svg).resize(inner, inner).png().toBuffer()
      await sharp({
        create: {
          width: target.size,
          height: target.size,
          channels: 4,
          background: MASKABLE_BG,
        },
      })
        .composite([{ input: innerBuffer, top: padding, left: padding }])
        .png()
        .toFile(resolve(ICONS_DIR, target.name))
    }
    else {
      await sharp(svg)
        .resize(target.size, target.size)
        .png()
        .toFile(resolve(ICONS_DIR, target.name))
    }
  }

  await sharp(svg).resize(64, 64).png().toFile(FAVICON)

  console.log('icons generated:')
  for (const target of TARGETS) {
    console.log(`  ${ICONS_DIR}/${target.name}`)
  }
  console.log(`  ${FAVICON}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
