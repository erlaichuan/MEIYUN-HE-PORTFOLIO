import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

if (!process.argv[2]) throw new Error('Supply the background image path')
const output = fileURLToPath(new URL('../public/assets/game-portfolio/scroll-background.webp', import.meta.url))
// Keep the complete original scroll and its proportions; soften it only in CSS.
await sharp(process.argv[2]).rotate().webp({ quality: 85, effort: 5 }).toFile(output)
console.log(output)
