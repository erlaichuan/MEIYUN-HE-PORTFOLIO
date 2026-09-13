import type { CSSProperties } from 'react'

// Native fill endpoints measured from each supplied 669 × 495 PNG, not replacement stats.
const endpoints = {
  luhanzhou: [455, 433, 516, 490, 462],
  shijun: [570, 339, 364, 283, 322],
  xueruohua: [455, 515, 410, 438, 379],
  suwanqing: [410, 505, 446, 418, 392],
  painter: [454, 505, 417, 438, 392],
}
const tracks = [
  { x: 237, y: 140, height: 14 },
  { x: 236, y: 200, height: 14 },
  { x: 236, y: 257, height: 14 },
  { x: 237, y: 324, height: 14 },
  { x: 237, y: 388, height: 14 },
]

/** Temporary masks uncover the original painted bars; no source artwork is changed. */
export function DetailStats({ src, alt, style, character }: {
  src: string; alt: string; style: CSSProperties; character: keyof typeof endpoints
}) {
  return <svg className="lh-art" style={style} viewBox="0 0 669 495" role="img" aria-label={alt}>
    <image href={src} width="669" height="495"/>
    {tracks.map((track, index) => <rect key={index} className="lh-stat-cover"
      {...track} width={endpoints[character][index] - track.x}
      fill={index === 2 ? '#e2d0b8' : '#e3d1b8'}/>)}
  </svg>
}
