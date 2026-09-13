import { RoundedBox } from '@react-three/drei'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { CanvasTexture, Object3D, SRGBColorSpace, type InstancedMesh } from 'three'

const RUG_WIDTH = 9.25
const RUG_DEPTH = 5.35
const RUG_CENTER_Z = 0.24
const RUG_TOP_Y = -2.327

function RugBorderTiles() {
  const instances = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const target = instances.current
    if (!target) return

    const marker = new Object3D()
    const horizontalCount = 12
    const sideCount = 6
    const margin = .28
    const bandDepth = .42
    const gap = .08
    const usableWidth = RUG_WIDTH - margin * 2
    const tileWidth = (usableWidth - gap * (horizontalCount - 1)) / horizontalCount
    const horizontalZ = RUG_DEPTH / 2 - margin - bandDepth / 2
    const sideX = RUG_WIDTH / 2 - margin - bandDepth / 2
    const usableSideDepth = RUG_DEPTH - (margin + bandDepth + gap) * 2
    const sideTileDepth = (usableSideDepth - gap * (sideCount - 1)) / sideCount
    let instance = 0

    for (let row = -1; row <= 1; row += 2) {
      for (let index = 0; index < horizontalCount; index += 1) {
        marker.position.set(
          -usableWidth / 2 + tileWidth / 2 + index * (tileWidth + gap),
          RUG_TOP_Y + .0015,
          row * horizontalZ,
        )
        marker.scale.set(tileWidth, .002, bandDepth)
        marker.updateMatrix()
        target.setMatrixAt(instance, marker.matrix)
        instance += 1
      }
    }

    for (let side = -1; side <= 1; side += 2) {
      for (let index = 0; index < sideCount; index += 1) {
        marker.position.set(
          side * sideX,
          RUG_TOP_Y + .0015,
          -usableSideDepth / 2 + sideTileDepth / 2 + index * (sideTileDepth + gap),
        )
        marker.scale.set(bandDepth, .002, sideTileDepth)
        marker.updateMatrix()
        target.setMatrixAt(instance, marker.matrix)
        instance += 1
      }
    }

    target.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <instancedMesh ref={instances} name="Rug_BorderTiles" args={[undefined, undefined, 36]} receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#b5b276" roughness={.96} metalness={0} />
    </instancedMesh>
  )
}

function seededNoise(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

function useRugTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 594
    const context = canvas.getContext('2d')
    if (!context) return new CanvasTexture(canvas)

    const random = seededNoise(1847)

    context.fillStyle = '#556236'
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = '#747a43'
    context.fillRect(88, 88, canvas.width - 176, canvas.height - 176)
    context.strokeStyle = 'rgba(48, 58, 29, .72)'
    context.lineWidth = 6
    context.strokeRect(88, 88, canvas.width - 176, canvas.height - 176)

    // Soft, deterministic value variation suggests a woven pile without a heavy texture asset.
    for (let index = 0; index < 760; index += 1) {
      const x = 76 + random() * (canvas.width - 152)
      const y = 76 + random() * (canvas.height - 152)
      const radiusX = 3 + random() * 24
      const radiusY = 2 + random() * 14
      const alpha = 0.012 + random() * 0.035
      context.fillStyle = random() > 0.48
        ? `rgba(186, 184, 119, ${alpha})`
        : `rgba(45, 54, 31, ${alpha})`
      context.beginPath()
      context.ellipse(x, y, radiusX, radiusY, random() * Math.PI, 0, Math.PI * 2)
      context.fill()
    }

    const drawTile = (x: number, y: number, width: number, height: number, index: number) => {
      const lightness = 184 + (index % 3) * 5
      context.fillStyle = `rgb(${lightness}, ${lightness + 1}, ${Math.round(lightness * .68)})`
      context.fillRect(x, y, width, height)
      context.strokeStyle = 'rgba(63, 70, 36, .64)'
      context.lineWidth = 3
      context.strokeRect(x + 1.5, y + 1.5, width - 3, height - 3)
    }

    const horizontalCount = 12
    const horizontalGap = 10
    const horizontalInset = 50
    const horizontalTileWidth = (canvas.width - horizontalInset * 2 - horizontalGap * (horizontalCount - 1)) / horizontalCount
    for (let index = 0; index < horizontalCount; index += 1) {
      const x = horizontalInset + index * (horizontalTileWidth + horizontalGap)
      drawTile(x, 32, horizontalTileWidth, 54, index)
      drawTile(x, canvas.height - 86, horizontalTileWidth, 54, index + 1)
    }

    const verticalCount = 6
    const verticalGap = 10
    const verticalInset = 102
    const verticalTileHeight = (canvas.height - verticalInset * 2 - verticalGap * (verticalCount - 1)) / verticalCount
    for (let index = 0; index < verticalCount; index += 1) {
      const y = verticalInset + index * (verticalTileHeight + verticalGap)
      drawTile(32, y, 54, verticalTileHeight, index + 2)
      drawTile(canvas.width - 86, y, 54, verticalTileHeight, index)
    }

    // Very fine perpendicular strands keep the surface matte and textile-like at grazing angles.
    context.lineWidth = 1
    for (let x = 0; x < canvas.width; x += 5) {
      context.strokeStyle = x % 10 === 0 ? 'rgba(226, 221, 157, .025)' : 'rgba(35, 42, 27, .02)'
      context.beginPath()
      context.moveTo(x, 0)
      context.lineTo(x, canvas.height)
      context.stroke()
    }
    for (let y = 0; y < canvas.height; y += 5) {
      context.strokeStyle = y % 10 === 0 ? 'rgba(226, 221, 157, .02)' : 'rgba(35, 42, 27, .018)'
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(canvas.width, y)
      context.stroke()
    }

    const output = new CanvasTexture(canvas)
    output.colorSpace = SRGBColorSpace
    output.needsUpdate = true
    return output
  }, [])

  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

/** Low-profile landscape rug, sized slightly beyond the desk footprint. */
export default function ProceduralRug() {
  const rugTexture = useRugTexture()

  return (
    <group name="ProceduralRug" position={[0, 0, RUG_CENTER_Z]}>
      <RoundedBox
        name="Rug_BoundBacking"
        args={[RUG_WIDTH, .012, RUG_DEPTH]}
        position={[0, RUG_TOP_Y - .006, 0]}
        radius={.07}
        smoothness={3}
        receiveShadow
      >
        <meshStandardMaterial color="#5c653c" roughness={.98} metalness={0} />
      </RoundedBox>

      <mesh name="Rug_WovenTop" position={[0, RUG_TOP_Y + .001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[RUG_WIDTH - .035, RUG_DEPTH - .035]} />
        <meshStandardMaterial map={rugTexture} color="#ffffff" roughness={.97} metalness={0} />
      </mesh>

      <RugBorderTiles />
    </group>
  )
}
