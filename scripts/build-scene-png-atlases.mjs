import { mkdir, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()

const stickerDir = path.join(root, 'public/assets/sticker')
const surfaceDir = path.join(root, 'public/assets/surfaces')

const surfaces = {
  'corkboard-collage.png': {
    size: [512, 320],
    items: [
      ['corkboard_stickers1.png', 28, 24, 92, -7], ['corkboard_sticker2.png', 126, 20, 116, 5],
      ['corkboard_sticker3.png', 270, 22, 82, -4], ['corkboard_sticker4.png', 384, 22, 88, 7],
      ['corkboard_sticker5.png', 62, 126, 78, -6], ['corkboard_sticker6.png', 164, 120, 108, 4],
      ['corkboard_sticker7.png', 300, 115, 72, -8], ['corkboard_sticker8.png', 402, 116, 64, 6],
      ['corkboard_sticker9.png', 30, 224, 72, -4], ['corkboard_sticker10.png', 118, 228, 116, 7],
      ['corkboard_post-it-note1.png', 252, 216, 72, -5], ['corkboard_post-it-note2.png', 342, 218, 92, 6],
      ['corkboard_post-it-note3.png', 450, 207, 54, -3],
    ],
  },
  'map-collage.png': {
    size: [512, 310],
    items: [
      ['map_post-it-note1.png', 54, 36, 98, -5], ['map_sticker1.png', 352, 38, 92, 7],
      ['map_sticker2.png', 92, 170, 78, 4], ['map_sticker3.png', 330, 164, 76, -7],
    ],
  },
  'drawer-1-collage.png': { size: [512, 150], items: [
    ['filing_cabinet_sticker1.png', 22, 20, 94, -7], ['filing_cabinet_sticker2.png', 368, 18, 88, 6], ['filing_cabinet_sticker3.png', 446, 70, 56, -4],
  ] },
  'drawer-2-collage.png': { size: [512, 150], items: [
    ['filing_cabinet_sticker4.png', 18, 18, 76, 5], ['filing_cabinet_sticker5.png', 362, 18, 102, -6], ['filing_cabinet_sticker6.png', 8, 78, 54, -4],
  ] },
  'drawer-3-collage.png': { size: [512, 210], items: [
    ['filing_cabinet_sticker7.png', 26, 28, 82, -7], ['filing_cabinet_sticker8.png', 342, 28, 126, 6], ['filing_cabinet_sticker9.png', 30, 120, 76, 4],
  ] },
}

async function buildStickerSurfaces() {
  await mkdir(surfaceDir, { recursive: true })
  for (const [name, spec] of Object.entries(surfaces)) {
    const layers = []
    for (const [source, left, top, width, angle] of spec.items) {
      const input = await sharp(path.join(stickerDir, source)).resize({ width }).rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
      layers.push({ input, left, top })
    }
    await sharp({ create: { width: spec.size[0], height: spec.size[1], channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite(layers).png({ compressionLevel: 9 }).toFile(path.join(surfaceDir, name))
  }
}

async function build(kind, cell, columns, extras = []) {
  const inputDir = path.join(root, 'public/assets', kind)
  const names = (await readdir(inputDir)).filter((name) => name.endsWith('.png')).sort()
  const inputs = [
    ...names.map((name) => ({ input: path.join(inputDir, name), url: `/assets/${kind}/${name}` })),
    ...extras,
  ]
  const rows = Math.ceil(inputs.length / columns)
  const width = cell * columns
  const height = cell * rows
  const entries = {}
  const composite = []

  for (const [index, source] of inputs.entries()) {
    const image = sharp(source.input).resize(cell, cell, { fit: 'inside', withoutEnlargement: true })
    const { data, info } = await image.png().toBuffer({ resolveWithObject: true })
    const column = index % columns
    const row = Math.floor(index / columns)
    const left = column * cell + Math.floor((cell - info.width) / 2)
    const top = row * cell + Math.floor((cell - info.height) / 2)
    composite.push({ input: data, left, top })
    entries[source.url] = { x: left, y: top, w: info.width, h: info.height }
  }

  const atlasName = `${kind}-atlas.png`
  await sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(composite)
    .png({ compressionLevel: 9 })
    .toFile(path.join(root, 'public/assets', atlasName))
  return { url: `/assets/${atlasName}?v=3`, width, height, entries }
}

await buildStickerSurfaces()

const data = {
  objects: await build('objects', 256, 4),
  sticker: await build('sticker', 128, 8),
  surfaces: await build('surfaces', 256, 4),
}

await writeFile(path.join(root, 'src/scene/pngAtlasData.json'), `${JSON.stringify(data)}\n`)
