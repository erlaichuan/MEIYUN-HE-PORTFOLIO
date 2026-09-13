import sharp from 'sharp'
import { mkdir, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const source = process.argv[2]
if (!source) throw new Error('Usage: node scripts/import-game-portfolio.mjs /path/to/zuopinji')
const output = fileURLToPath(new URL('../public/assets/game-portfolio/', import.meta.url))
const files = (await readdir(source)).filter(name => /^\d+\.jpg$/i.test(name)).sort((a, b) => Number.parseInt(a) - Number.parseInt(b))
if (files.length !== 24 || files.some((name, i) => Number.parseInt(name) !== i + 1)) {
  throw new Error('Expected the complete, ordered set 1.jpg through 24.jpg')
}
await mkdir(output, { recursive: true })
let total = 0
for (const file of files) {
  const id = String(Number.parseInt(file)).padStart(2, '0')
  for (const width of [960, 1920]) {
    const target = path.join(output, `${id}-${width}.webp`)
    await sharp(path.join(source, file)).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 90, effort: 5 }).toFile(target)
    total += (await stat(target)).size
  }
}
console.log(`Imported ${files.length} ordered pages, 2 sizes each: ${(total / 1024 / 1024).toFixed(1)} MB`)
