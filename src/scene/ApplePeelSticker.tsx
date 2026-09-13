import { useTexture } from '@react-three/drei'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { DoubleSide, MathUtils, MeshStandardMaterial, SRGBColorSpace, Vector3, type Group } from 'three'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { APPLE_STICKER_ROTATION, createAppleStickerGeometry, curlAppleSticker } from './appleStickerGeometry'

type CaptureTarget = { setPointerCapture: (id: number) => void; releasePointerCapture: (id: number) => void; hasPointerCapture: (id: number) => boolean }

// Interaction references React Bits StickerPeel; this is a native 3D paper implementation.
export default function ApplePeelSticker() {
  const texture = useTexture('/assets/sticker/apple-cat-sticker.png')
  const invalidate = useThree((state) => state.invalidate)
  const canvas = useThree((state) => state.gl.domElement)
  const reduced = useReducedMotion()
  const group = useRef<Group>(null)
  const gesture = useRef({ hover: false, pressed: false, amount: 0, x: 0, y: 0, start: new Vector3() })
  const geometry = useMemo(() => createAppleStickerGeometry(), [])
  const material = useMemo(() => {
    // Three texture/DOM resources are intentionally mutable, not React state.
    /* oxlint-disable react/immutability */
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 4
    const paper = new MeshStandardMaterial({
      map: texture, transparent: true, alphaTest: 0.08, side: DoubleSide,
      roughness: 0.64, metalness: 0, polygonOffset: true, polygonOffsetFactor: -1,
    })
    paper.onBeforeCompile = (shader) => {
      // Keep the PNG's alpha silhouette on both sides, but do not mirror the front art onto the reverse.
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
        #include <map_fragment>
        if (!gl_FrontFacing) diffuseColor.rgb = vec3(0.87, 0.82, 0.69);
      `)
    }
    paper.customProgramCacheKey = () => 'apple-sticker-ivory-reverse-v1'
    return paper
  }, [texture])

  useEffect(() => {
    const reset = () => {
      gesture.current.pressed = false
      gesture.current.hover = false
      gesture.current.x = 0
      gesture.current.y = 0
      canvas.style.cursor = ''
      invalidate()
    }
    window.addEventListener('blur', reset)
    canvas.addEventListener('pointercancel', reset)
    canvas.addEventListener('lostpointercapture', reset)
    return () => {
      reset()
      window.removeEventListener('blur', reset)
      canvas.removeEventListener('pointercancel', reset)
      canvas.removeEventListener('lostpointercapture', reset)
      geometry.dispose()
      material.dispose()
    }
  }, [canvas, geometry, invalidate, material])

  useFrame((_, delta) => {
    const state = gesture.current
    const target = reduced ? 0 : state.pressed ? 0.14 : state.hover ? 0.10 : 0
    const next = MathUtils.damp(state.amount, target, 12, Math.min(delta, 0.05))
    const settled = Math.abs(next - target) < 0.00005
    const amount = settled ? target : next
    if (amount !== state.amount) {
      state.amount = amount
      curlAppleSticker(geometry, amount)
    }
    const root = group.current
    if (root) {
      root.position.x = MathUtils.damp(root.position.x, state.x, 16, Math.min(delta, 0.05))
      root.position.y = MathUtils.damp(root.position.y, state.y, 16, Math.min(delta, 0.05))
      if (Math.abs(root.position.x - state.x) + Math.abs(root.position.y - state.y) > 0.00001) invalidate()
    }
    if (!settled) invalidate()
  })

  const release = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    gesture.current.pressed = false
    gesture.current.hover = event.pointerType === 'mouse'
    gesture.current.x = gesture.current.y = 0
    const target = event.target as unknown as CaptureTarget
    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId)
    canvas.style.cursor = gesture.current.hover ? 'grab' : ''
    invalidate()
  }

  return (
    <group ref={group} name="Organizer_ApplePeelSticker" position={[0, 0, 0.006]} rotation={[0, 0, APPLE_STICKER_ROTATION]}>
      {/* Stable hit surface prevents flicker when the paper curls away from the pointer. */}
      <mesh
        name="AppleSticker_Interaction"
        position={[0, 0, 0.001]}
        onPointerOver={(event) => {
          event.stopPropagation()
          gesture.current.hover = true
          canvas.style.cursor = 'grab'
          invalidate()
        }}
        onPointerOut={() => {
          gesture.current.hover = false
          if (!gesture.current.pressed) canvas.style.cursor = ''
          invalidate()
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) return
          event.stopPropagation()
          gesture.current.pressed = true
          gesture.current.start.copy(event.point)
          ;(event.target as unknown as CaptureTarget).setPointerCapture(event.pointerId)
          canvas.style.cursor = 'grabbing'
          invalidate()
        }}
        onPointerMove={(event) => {
          if (!gesture.current.pressed) return
          event.stopPropagation()
          const distance = event.point.clone().sub(gesture.current.start)
          gesture.current.x = reduced ? 0 : MathUtils.clamp(distance.x, -0.008, 0.008)
          gesture.current.y = reduced ? 0 : MathUtils.clamp(distance.y, -0.008, 0.008)
          invalidate()
        }}
        onPointerUp={release}
        onClick={(event) => event.stopPropagation()}
      >
        <planeGeometry args={[0.40, 0.42]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      <mesh name="AppleSticker_PrintedPaper" geometry={geometry} material={material} dispose={null} />
    </group>
  )
}
