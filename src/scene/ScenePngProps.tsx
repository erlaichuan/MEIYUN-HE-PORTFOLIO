import { useTexture } from '@react-three/drei'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import {
  Color,
  DoubleSide,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  LinearFilter,
  Object3D,
  PlaneGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  type InstancedMesh,
} from 'three'
import ProceduralDeskLamp from './ProceduralDeskLamp'
import atlasData from './pngAtlasData.json'

type V3 = readonly [number, number, number]
type AtlasEntry = { x: number; y: number; w: number; h: number }
export type AtlasPlaneSpec = {
  url: string
  aspect: number
  width: number
  position: V3
  rotation?: V3
  flipX?: boolean
}

export type PaperStickerSpec = {
  width: number
  height: number
  position: V3
  rotation?: V3
  color: string
}

export function PaperStickerBatch({ items, name, renderOrder = 4, depthTest = true }: { items: readonly PaperStickerSpec[]; name: string; renderOrder?: number; depthTest?: boolean }) {
  const mesh = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    const target = mesh.current
    if (!target) return
    const object = new Object3D()
    items.forEach((item, index) => {
      object.position.set(...item.position)
      object.rotation.set(...(item.rotation ?? [0, 0, 0]))
      object.scale.set(item.width, item.height, 1)
      object.updateMatrix()
      target.setMatrixAt(index, object.matrix)
    })
    target.instanceMatrix.needsUpdate = true
  }, [items])
  return (
    <instancedMesh ref={mesh} name={name} args={[undefined, undefined, items.length]} renderOrder={renderOrder} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color={items[0]?.color ?? '#ead8a8'} side={DoubleSide} depthTest={depthTest} depthWrite={false} toneMapped={false} polygonOffset polygonOffsetFactor={-1} />
    </instancedMesh>
  )
}

export function PngPlane({
  url,
  aspect,
  width,
  position,
  rotation = [0, 0, 0],
  renderOrder = 2,
  depthWrite = true,
  name,
  tint = '#ffffff',
}: {
  url: string
  aspect: number
  width: number
  position: V3
  rotation?: V3
  renderOrder?: number
  depthWrite?: boolean
  name?: string
  tint?: string
}) {
  const atlas = url.includes('/surfaces/')
    ? atlasData.surfaces
    : url.includes('/sticker/')
      ? atlasData.sticker
      : atlasData.objects
  const entry = (atlas.entries as Record<string, AtlasEntry>)[url]
  const texture = useTexture(atlas.url)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  texture.generateMipmaps = false
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter

  const geometry = useMemo(() => {
    const output = new PlaneGeometry(width, width / aspect)
    if (!entry) return output
    const u0 = entry.x / atlas.width
    const u1 = (entry.x + entry.w) / atlas.width
    const v1 = 1 - entry.y / atlas.height
    const v0 = 1 - (entry.y + entry.h) / atlas.height
    output.setAttribute('uv', new Float32BufferAttribute([u0, v1, u1, v1, u0, v0, u1, v0], 2))
    return output
  }, [aspect, atlas.height, atlas.width, entry, width])
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh name={name} position={[...position]} rotation={[...rotation]} renderOrder={renderOrder}>
      <primitive object={geometry} attach="geometry" />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.025}
        depthWrite={depthWrite}
        side={DoubleSide}
        toneMapped={false}
        color={tint}
        polygonOffset
        polygonOffsetFactor={-1}
      />
    </mesh>
  )
}

export function AtlasPlanes({
  items,
  kind,
  name,
  depthWrite = true,
  renderOrder = 2,
}: {
  items: readonly AtlasPlaneSpec[]
  kind: 'objects' | 'sticker'
  name: string
  depthWrite?: boolean
  renderOrder?: number
}) {
  const atlas = atlasData[kind]
  const texture = useTexture(atlas.url)
  texture.colorSpace = SRGBColorSpace
  texture.generateMipmaps = false
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter

  const mesh = useRef<InstancedMesh>(null)
  const geometry = useMemo(() => {
    const output = new PlaneGeometry(1, 1)
    const rects = new Float32Array(items.length * 4)
    items.forEach((item, index) => {
      const entry = (atlas.entries as Record<string, AtlasEntry>)[item.url]
      if (!entry) return
      rects.set([
        entry.x / atlas.width,
        1 - (entry.y + entry.h) / atlas.height,
        entry.w / atlas.width,
        entry.h / atlas.height,
      ], index * 4)
    })
    output.setAttribute('atlasRect', new InstancedBufferAttribute(rects, 4))
    return output
  }, [atlas.entries, atlas.height, atlas.width, items])

  const material = useMemo(() => new ShaderMaterial({
    uniforms: {
      atlasMap: { value: texture },
      atlasTint: { value: new Color(kind === 'objects' ? '#e2cfb5' : '#ffffff') },
    },
    vertexShader: `
      attribute vec4 atlasRect;
      varying vec2 vAtlasUv;
      void main() {
        vAtlasUv = atlasRect.xy + uv * atlasRect.zw;
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D atlasMap;
      uniform vec3 atlasTint;
      varying vec2 vAtlasUv;
      void main() {
        vec4 color = texture2D(atlasMap, vAtlasUv);
        if (color.a < 0.025) discard;
        gl_FragColor = vec4(color.rgb * atlasTint, color.a);
      }
    `,
    transparent: true,
    depthWrite,
    side: DoubleSide,
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  }), [depthWrite, kind, texture])

  useLayoutEffect(() => {
    const target = mesh.current
    if (!target) return
    const object = new Object3D()
    items.forEach((item, index) => {
      object.position.set(...item.position)
      object.rotation.set(...(item.rotation ?? [0, 0, 0]))
      object.scale.set(item.flipX ? -item.width : item.width, item.width / item.aspect, 1)
      object.updateMatrix()
      target.setMatrixAt(index, object.matrix)
    })
    target.instanceMatrix.needsUpdate = true
  }, [items])

  useEffect(() => () => {
    geometry.dispose()
    material.dispose()
  }, [geometry, material])

  return <instancedMesh ref={mesh} name={name} args={[geometry, material, items.length]} renderOrder={renderOrder} />
}

export default function ScenePngProps() {
  return (
    <group name="ReferencePngProps">
      <ProceduralDeskLamp />
    </group>
  )
}
