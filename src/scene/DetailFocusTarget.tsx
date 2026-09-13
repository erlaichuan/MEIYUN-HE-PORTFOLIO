import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState, type ReactNode } from 'react'
import { MathUtils, Vector3, type Group } from 'three'
import { useSceneCapabilities } from '../store'
import { focusDetail } from './detailFocus'
import { useObjectGlow } from './useObjectGlow'
import { playSceneSound } from './sceneAudio'

type V3 = readonly [number, number, number]
const anchorPoint = new Vector3()

/** 点击真实 3D 物件后平滑推近；再次点击或按右下角归位键返回宽景。 */
export default function DetailFocusTarget({
  id,
  name,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  anchorOffset = [0, 0, 0],
  focusHeight,
  children,
}: {
  id: string
  name: string
  position: V3
  rotation?: V3
  scale?: number
  anchorOffset?: V3
  focusHeight: number
  children: ReactNode
}) {
  const root = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const enabled = useSceneCapabilities().hotspots
  const invalidate = useThree((state) => state.invalidate)
  useObjectGlow(root, hovered && enabled)

  useFrame((_, delta) => {
    const group = root.current
    if (!group) return
    const target = scale * (hovered && enabled ? 1.035 : 1)
    const next = MathUtils.damp(group.scale.x, target, 12, delta)
    group.scale.setScalar(next)
    if (Math.abs(next - target) > 0.0005) invalidate()
  })

  const hover = (on: boolean) => {
    if (on && !enabled) return
    setHovered(on)
    document.body.style.cursor = on ? 'zoom-in' : ''
    invalidate()
  }

  return (
    <group
      ref={root}
      name={name}
      position={[position[0], position[1], position[2]]}
      rotation={[rotation[0], rotation[1], rotation[2]]}
      scale={scale}
      onPointerEnter={(event) => {
        event.stopPropagation()
        hover(true)
      }}
      onPointerLeave={() => hover(false)}
      onClick={(event) => {
        event.stopPropagation()
        if (!enabled || !root.current) return
        playSceneSound('frame')
        hover(false)
        root.current.localToWorld(
          anchorPoint.set(anchorOffset[0], anchorOffset[1], anchorOffset[2]),
        )
        focusDetail(id, [anchorPoint.x, anchorPoint.y, anchorPoint.z], focusHeight)
      }}
    >
      {children}
    </group>
  )
}
