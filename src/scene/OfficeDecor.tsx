import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { PaperStickerBatch } from './ScenePngProps'

function useMapTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 760
    const ctx = canvas.getContext('2d')
    if (!ctx) return new CanvasTexture(canvas)
    ctx.fillStyle = '#e8bf77'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = 'rgba(92, 53, 31, .28)'
    ctx.lineWidth = 2
    for (let x = 80; x < canvas.width; x += 150) {
      ctx.beginPath(); ctx.moveTo(x, 55); ctx.lineTo(x, 705); ctx.stroke()
    }
    for (let y = 80; y < canvas.height; y += 120) {
      ctx.beginPath(); ctx.moveTo(55, y); ctx.lineTo(1145, y); ctx.stroke()
    }
    const islands = [
      [[110, 160], [210, 105], [315, 145], [280, 240], [150, 260]],
      [[390, 130], [570, 95], [650, 180], [580, 285], [430, 250]],
      [[735, 120], [920, 105], [1050, 205], [960, 310], [770, 270]],
      [[210, 410], [380, 340], [500, 425], [420, 590], [250, 560]],
      [[620, 380], [820, 330], [995, 430], [900, 610], [700, 570]],
    ]
    ctx.strokeStyle = '#674126'
    ctx.lineWidth = 10
    ctx.lineJoin = 'round'
    for (const points of islands) {
      ctx.beginPath()
      points.forEach(([x, y], index) => index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y))
      ctx.closePath(); ctx.stroke()
    }
    ctx.setLineDash([18, 16])
    ctx.strokeStyle = '#a35335'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(165, 330); ctx.bezierCurveTo(370, 280, 425, 510, 625, 365)
    ctx.bezierCurveTo(785, 250, 890, 420, 1040, 350); ctx.stroke()
    ctx.setLineDash([])
    ctx.strokeStyle = '#56351f'
    ctx.lineWidth = 8
    ctx.beginPath(); ctx.arc(1015, 590, 70, 0, Math.PI * 2); ctx.stroke()
    for (let i = 0; i < 8; i += 1) {
      const a = (Math.PI * 2 * i) / 8
      ctx.beginPath(); ctx.moveTo(1015, 590)
      ctx.lineTo(1015 + Math.cos(a) * (i % 2 ? 48 : 68), 590 + Math.sin(a) * (i % 2 ? 48 : 68))
      ctx.stroke()
    }
    ctx.fillStyle = '#56351f'
    ctx.font = '700 42px Georgia, serif'
    ctx.fillText('ARCHIVE MAP', 70, 70)
    ctx.font = '600 24px monospace'
    ctx.fillText('FIELD NOTES / 2026', 70, 715)
    const output = new CanvasTexture(canvas)
    output.colorSpace = SRGBColorSpace
    output.anisotropy = 4
    return output
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

export default function OfficeDecor() {
  return (
    <group name="OfficeDecor">
      <WallMap />
    </group>
  )
}

function WallMap() {
  const map = useMapTexture()
  return (
    <group name="WallMap" position={[-2.45, 3.02, -2.73]} rotation={[0, 0, -0.025]}>
      <mesh castShadow receiveShadow>
        <planeGeometry args={[3.08, 1.86]} />
        <meshStandardMaterial map={map} roughness={0.94} />
      </mesh>
      {[-1.36, 1.36].map((x) => (
        <mesh key={x} position={[x, 0.78, 0.028]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.03, 18]} />
          <meshStandardMaterial color="#a84632" roughness={0.5} />
        </mesh>
      ))}
      <group position={[0, 0, 0.035]}>
        <PaperStickerBatch name="MapStickerBatch" items={[
          { width: .56, height: .42, position: [-.76, .34, 0], rotation: [0, 0, -.05], color: '#e8d66f' },
          { width: .5, height: .5, position: [.78, .3, 0], rotation: [0, 0, .08], color: '#9dbf9b' },
          { width: .44, height: .54, position: [-.72, -.34, 0], rotation: [0, 0, .04], color: '#d68b76' },
          { width: .42, height: .52, position: [.62, -.34, 0], rotation: [0, 0, -.07], color: '#8ea7c5' },
        ]} />
      </group>
    </group>
  )
}
