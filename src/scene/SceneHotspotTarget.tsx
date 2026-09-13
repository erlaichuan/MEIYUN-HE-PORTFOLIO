import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MathUtils, Vector3, type Group } from 'three'
import { useSceneCapabilities } from '../store'
import {
  activateHotspot,
  registerHotspotAnchor,
  setHotspotActive,
} from './hotspotActions'
import type { HotspotId } from './hotspotSpecs'
import { useObjectGlow } from './useObjectGlow'

type V3 = readonly [number, number, number]
const _anchor = new Vector3()

/**
 * 把任意真实 3D 物件接到现有热点动作总线。
 *
 * 指针命中仍由实体 mesh 自己完成；这里只登记动态世界锚点、统一 hover 反馈和
 * 点击动作。键盘与读屏入口仍由 Hotspots.tsx 的 HTML button 提供。
 */
export default function SceneHotspotTarget({
  id,
  name,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  anchorOffset = [0, 0, 0],
  hoverScale = 1.025,
  hoverRotation = [0, 0, 0],
  onHoverChange,
  clickEnabled = true,
  children,
}: {
  id: HotspotId
  name: string
  position?: V3
  rotation?: V3
  scale?: number
  anchorOffset?: V3
  hoverScale?: number
  hoverRotation?: V3
  onHoverChange?: (on: boolean) => void
  /** 关闭实体 mesh 的指针点击，但保留 hover 与统一的键盘热点。 */
  clickEnabled?: boolean
  children: ReactNode
}) {
  const root = useRef<Group>(null)
  const caps = useSceneCapabilities()
  const enabled = caps.hotspots
  const invalidate = useThree((state) => state.invalidate)
  const [hovered, setHovered] = useState(false)
  const active = hovered && enabled
  useObjectGlow(root, active)

  useFrame((_, delta) => {
    const group = root.current
    if (!group) return
    const targetScale = scale * (active ? Math.max(1.025, hoverScale) : 1)
    const nextScale = MathUtils.damp(group.scale.x, targetScale, 12, delta)
    group.scale.setScalar(nextScale)
    group.rotation.x = MathUtils.damp(
      group.rotation.x,
      rotation[0] + (hovered ? hoverRotation[0] : 0),
      12,
      delta,
    )
    group.rotation.y = MathUtils.damp(
      group.rotation.y,
      rotation[1] + (hovered ? hoverRotation[1] : 0),
      12,
      delta,
    )
    group.rotation.z = MathUtils.damp(
      group.rotation.z,
      rotation[2] + (hovered ? hoverRotation[2] : 0),
      12,
      delta,
    )
    if (
      Math.abs(nextScale - targetScale) > 0.0005 ||
      Math.abs(group.rotation.x - (rotation[0] + (hovered ? hoverRotation[0] : 0))) > 0.0005 ||
      Math.abs(group.rotation.y - (rotation[1] + (hovered ? hoverRotation[1] : 0))) > 0.0005 ||
      Math.abs(group.rotation.z - (rotation[2] + (hovered ? hoverRotation[2] : 0))) > 0.0005
    ) {
      invalidate()
    }
  })

  useEffect(
    () =>
      registerHotspotAnchor(id, () => {
        const group = root.current
        if (!group) return [position[0], position[1], position[2]]
        group.localToWorld(_anchor.set(anchorOffset[0], anchorOffset[1], anchorOffset[2]))
        return [_anchor.x, _anchor.y, _anchor.z]
      }),
    [anchorOffset, id, position],
  )

  const hover = (on: boolean) => {
    if (on && !enabled) return
    setHovered(on)
    invalidate()
    document.body.style.cursor = on ? 'pointer' : ''
    setHotspotActive(id, on)
    onHoverChange?.(on)
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
        if (!enabled || !clickEnabled) return
        hover(false)
        activateHotspot(id)
      }}
    >
      {children}
    </group>
  )
}
