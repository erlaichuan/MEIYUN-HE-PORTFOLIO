#!/usr/bin/env node

import { mkdir, readdir } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'
import sharp from 'sharp'

const sourceDir = process.argv[2]
if (!sourceDir) {
  console.error('用法：node scripts/import-selected-posters.mjs <包含 JPG 的目录>')
  process.exit(1)
}

const root = resolve(new URL('..', import.meta.url).pathname)
const outputDir = join(root, 'public/assets/posters')
const files = (await readdir(sourceDir))
  .filter((name) => /^\d{3}\.jpe?g$/i.test(name))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))

const expectedFiles = Array.from({ length: files.length }, (_, index) => `${String(index + 1).padStart(3, '0')}.jpg`)
const hasCompleteSequence = files.every((file, index) => file.toLowerCase() === expectedFiles[index])

if (!files.length || !hasCompleteSequence) {
  console.error('海报文件必须从 001.jpg 开始连续编号，不能缺号。')
  process.exit(1)
}

await mkdir(outputDir, { recursive: true })

for (const file of files) {
  const number = basename(file).replace(/\.jpe?g$/i, '')
  const stem = `selected-${number}`
  const input = join(sourceDir, file)

  for (const width of [1000, 700, 400]) {
    const suffix = width === 1000 ? '' : `-${width}`
    const output = join(outputDir, `${stem}${suffix}.webp`)
    await sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: false })
      .webp({ quality: width === 1000 ? 86 : 82, effort: 6, smartSubsample: true })
      .toFile(output)
  }

  console.log(`${file} → ${stem}.webp + 400/700 variants`)
}
