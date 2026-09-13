import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

if (!process.argv[2]) throw new Error('Supply the game logo path')
const output = fileURLToPath(new URL('../public/assets/game-portfolio/game-logo.webp', import.meta.url))

// Preserve transparency and the complete composition while removing empty canvas.
await sharp(process.argv[2])
  .rotate()
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .resize({ width: 720, withoutEnlargement: true })
  .webp({ quality: 92, alphaQuality: 100, effort: 5 })
  .toFile(output)

console.log(output)
