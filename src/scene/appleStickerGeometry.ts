import { PlaneGeometry } from 'three'

export const APPLE_STICKER_SIZE = 0.44
export const APPLE_STICKER_ROTATION = -7 * Math.PI / 180
const direction = 235 * Math.PI / 180
const dx = Math.sin(direction)
const dy = Math.cos(direction)
// Opaque silhouette support, measured from the original PNG alpha channel.
const edge = 0.501748 * APPLE_STICKER_SIZE
const span = 0.914924 * APPLE_STICKER_SIZE

export function createAppleStickerGeometry() {
  return new PlaneGeometry(APPLE_STICKER_SIZE, APPLE_STICKER_SIZE, 32, 32)
}

/** Bend a continuous sheet around an in-plane crease; the printed face never dips into the note. */
export function curlAppleSticker(geometry: PlaneGeometry, amount: number) {
  const positions = geometry.getAttribute('position')
  const uv = geometry.getAttribute('uv')
  const length = span * Math.max(0, Math.min(0.14, amount))
  const crease = edge - length
  const radius = Math.max(length / 2.6, 0.00001)
  for (let i = 0; i < positions.count; i++) {
    const x = (uv.getX(i) - 0.5) * APPLE_STICKER_SIZE
    const y = (uv.getY(i) - 0.5) * APPLE_STICKER_SIZE
    const distance = x * dx + y * dy - crease
    if (length < 0.00001 || distance <= 0) {
      positions.setXYZ(i, x, y, 0)
    } else {
      // Transparent padding beyond the silhouette continues tangentially, never winds into a spiral.
      const arc = Math.min(distance, length)
      const tail = Math.max(0, distance - length)
      const angle = arc / radius
      const along = radius * Math.sin(angle) + tail * Math.cos(angle)
      const lift = radius * (1 - Math.cos(angle)) + tail * Math.sin(angle)
      positions.setXYZ(i, x + dx * (along - distance), y + dy * (along - distance), lift)
    }
  }
  positions.needsUpdate = true
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
}
