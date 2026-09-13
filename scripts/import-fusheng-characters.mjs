import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
const source = process.argv[2] || '/Users/erlaichuan/Downloads/游戏'
const out = 'public/assets/fusheng/characters'
await mkdir(out, { recursive: true })
for (const [id, name] of [['moxiu','墨修'],['mowan','墨婉'],['xueruohua','薛若华'],['luhanzhou','陆寒舟'],['shijun','石峻'],['suwanqing','苏晚晴']]) {
  const file = `${source}/${name}.png`
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject:true })
  let left=info.width, top=info.height, right=-1, bottom=-1
  for (let y=0; y<info.height; y++) for (let x=0; x<info.width; x++) {
    if(data[(y*info.width+x)*4+3] > 0) { left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y) }
  }
  if(right<left) throw new Error(`${name}: no visible artwork`)
  // Trim transparent margins only; preserve every nontransparent pixel and the source alpha.
  const crop={left,top,width:right-left+1,height:bottom-top+1}
  await sharp(file).extract(crop).resize({height:1600,withoutEnlargement:true}).webp({quality:94,alphaQuality:100}).toFile(`${out}/${id}.webp`)
  console.log(name, JSON.stringify(crop))
}
