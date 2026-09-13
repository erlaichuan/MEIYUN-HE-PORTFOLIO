import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { Float32BufferAttribute, PlaneGeometry, SRGBColorSpace, type Texture } from 'three'

const artworks = [
  {
    name: 'WallArtwork_Wood',
    url: '/assets/objects/wall-art-wood.png',
    position: [3.784, 2.798, -2.74] as const,
    width: .48,
    height: .648,
    edge: '#6e492c',
    source: [735, 899],
    corners: [[144, 165], [591, 165], [146, 770], [590, 770]],
  },
  {
    name: 'WallArtwork_Blue',
    url: '/assets/objects/wall-art-blue.png',
    position: [-6.382, 2.842, -2.74] as const,
    width: 1.28,
    height: 1.75,
    edge: '#789c9b',
    source: [736, 920],
    corners: [[179, 200], [548, 200], [180, 705], [549, 705]],
  },
] as const

function FramedArtwork({ artwork, sourceTexture }: { artwork: typeof artworks[number]; sourceTexture: Texture }) {
  const texture = useMemo(() => {
    const map = sourceTexture.clone()
    map.colorSpace = SRGBColorSpace
    map.anisotropy = 4
    return map
  }, [sourceTexture])
  useEffect(() => () => texture.dispose(), [texture])
  const geometry = useMemo(() => {
    const plane = new PlaneGeometry(artwork.width, artwork.height)
    // Map the four photographed frame corners directly: no wall margins,
    // and no destructive cropping or changes to the supplied artwork files.
    plane.setAttribute('uv', new Float32BufferAttribute(
      artwork.corners.flatMap(([x, y]) => [x / artwork.source[0], 1 - y / artwork.source[1]]),
      2,
    ))
    return plane
  }, [artwork])
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <group name={artwork.name} position={[...artwork.position]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[artwork.width, artwork.height, .09]} />
        <meshStandardMaterial color={artwork.edge} roughness={.78} />
      </mesh>
      <mesh position={[0, 0, .046]}>
        <primitive object={geometry} attach="geometry" />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function WallArtwork() {
  const textures = useTexture(artworks.map((artwork) => artwork.url))
  const invalidate = useThree((state) => state.invalidate)
  // The room can already be resting in demand mode when the photos arrive.
  useEffect(() => { invalidate() }, [textures, invalidate])
  return artworks.map((artwork, index) => (
    <FramedArtwork key={artwork.name} artwork={artwork} sourceTexture={textures[index]} />
  ))
}
