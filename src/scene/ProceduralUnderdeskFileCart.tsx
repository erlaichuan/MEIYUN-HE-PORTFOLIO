import { RoundedBox } from '@react-three/drei'
import { useLayoutEffect, useRef } from 'react'
import { Object3D, type InstancedMesh } from 'three'
import SceneHotspotTarget from './SceneHotspotTarget'

const CORAL = '#d85f4f'
const CORAL_EDGE = '#bc493d'
const INNER = '#703a34'

function PerforationField() {
  const mesh = useRef<InstancedMesh>(null)
  const columns = 12
  const rows = 16

  useLayoutEffect(() => {
    const target = mesh.current
    if (!target) return

    const marker = new Object3D()
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        marker.position.set(
          -.24 + column * (.48 / (columns - 1)),
          .38 + row * (.78 / (rows - 1)),
          .407,
        )
        marker.scale.setScalar(1)
        marker.updateMatrix()
        target.setMatrixAt(row * columns + column, marker.matrix)
      }
    }
    target.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <instancedMesh ref={mesh} name="FileCart_FrontPerforations" args={[undefined, undefined, columns * rows]}>
      <circleGeometry args={[.0115, 7]} />
      <meshStandardMaterial color="#512f2b" roughness={.95} />
    </instancedMesh>
  )
}

function Caster({ x, z, name }: { x: number; z: number; name: string }) {
  return (
    <group name={name} position={[x, .08, z]}>
      <mesh name="FileCart_CasterFork" position={[0, .07, 0]} castShadow>
        <boxGeometry args={[.055, .11, .06]} />
        <meshStandardMaterial color="#4d403b" roughness={.48} metalness={.25} />
      </mesh>
      <mesh name="FileCart_CasterWheel" rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[.064, .064, .055, 16]} />
        <meshStandardMaterial color="#25211f" roughness={.78} />
      </mesh>
      <mesh name="FileCart_CasterHub" position={[-.031, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[.018, .018, .012, 12]} />
        <meshStandardMaterial color="#9a8b80" roughness={.34} metalness={.52} />
      </mesh>
    </group>
  )
}

const FOLDERS = [
  { z: -.24, color: '#474846', tabX: -.16 },
  { z: -.16, color: '#5a5652', tabX: .14 },
  { z: -.08, color: '#343737', tabX: -.08 },
  { z: 0, color: '#68615b', tabX: .11 },
  { z: .08, color: '#383b3b', tabX: -.13 },
  { z: .16, color: '#77706a', tabX: .16 },
  { z: .24, color: '#454544', tabX: -.04 },
] as const

/** 轻量桌下吊挂文件车：薄板箱体、前板孔阵列、文件夹与四只脚轮。 */
export default function ProceduralUnderdeskFileCart() {
  return (
    <SceneHotspotTarget
      id="contact"
      name="ProceduralUnderdeskFileCart"
      position={[-3.12, -2.34, 2.1]}
      rotation={[0, -.025, 0]}
      anchorOffset={[0, 1.12, .36]}
      hoverScale={1.025}
    >
      <group name="FileCart_StretchedBody" scale={[1, 1.38, 1]}>
      <group name="FileCart_Casters" scale={[1, 1 / 1.38, 1]}>
        <Caster name="FileCart_CasterFrontLeft" x={-.27} z={.3} />
        <Caster name="FileCart_CasterFrontRight" x={.27} z={.3} />
        <Caster name="FileCart_CasterRearLeft" x={-.27} z={-.27} />
        <Caster name="FileCart_CasterRearRight" x={.27} z={-.27} />
      </group>

      <RoundedBox name="FileCart_Bottom" args={[.66, .055, .75]} position={[0, .19, 0]} radius={.018} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial color={CORAL_EDGE} roughness={.55} metalness={.24} />
      </RoundedBox>
      <RoundedBox name="FileCart_FrontPanel" args={[.68, 1.24, .045]} position={[0, .81, .39]} radius={.026} smoothness={2} castShadow receiveShadow>
        <meshPhysicalMaterial color={CORAL} roughness={.42} metalness={.2} clearcoat={.16} clearcoatRoughness={.36} />
      </RoundedBox>
      <RoundedBox name="FileCart_BackPanel" args={[.68, 1.24, .045]} position={[0, .81, -.39]} radius={.026} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial color={CORAL_EDGE} roughness={.5} metalness={.2} />
      </RoundedBox>
      {[-.34, .34].map((x) => (
        <RoundedBox key={x} name={x < 0 ? 'FileCart_LeftPanel' : 'FileCart_RightPanel'} args={[.045, 1.24, .75]} position={[x, .81, 0]} radius={.024} smoothness={2} castShadow receiveShadow>
          <meshPhysicalMaterial color={CORAL} roughness={.43} metalness={.2} clearcoat={.14} clearcoatRoughness={.38} />
        </RoundedBox>
      ))}

      <mesh name="FileCart_InnerShadow" position={[0, .225, 0]} receiveShadow>
        <boxGeometry args={[.59, .02, .66]} />
        <meshStandardMaterial color={INNER} roughness={.82} />
      </mesh>
      <PerforationField />

      {[-1, 1].map((side) => (
        <group key={side} name={side < 0 ? 'FileCart_LeftHandle' : 'FileCart_RightHandle'}>
          <RoundedBox args={[.018, .13, .28]} position={[side * .365, 1.17, -.04]} radius={.05} smoothness={3} castShadow>
            <meshStandardMaterial color="#552f2b" roughness={.85} />
          </RoundedBox>
          <RoundedBox args={[.021, .055, .17]} position={[side * .376, 1.17, -.04]} radius={.025} smoothness={2}>
            <meshStandardMaterial color="#2c2927" roughness={.92} />
          </RoundedBox>
        </group>
      ))}

      <group name="FileCart_TopRim">
        {[-.365, .365].map((x) => (
          <RoundedBox key={x} args={[.035, .035, .81]} position={[x, 1.43, 0]} radius={.012} smoothness={2} castShadow>
            <meshStandardMaterial color={CORAL_EDGE} roughness={.44} metalness={.24} />
          </RoundedBox>
        ))}
        {[-.39, .39].map((z) => (
          <RoundedBox key={z} args={[.73, .035, .035]} position={[0, 1.43, z]} radius={.012} smoothness={2} castShadow>
            <meshStandardMaterial color={CORAL_EDGE} roughness={.44} metalness={.24} />
          </RoundedBox>
        ))}
      </group>

      <group name="FileCart_HangingRails">
        {[-.28, .28].map((x) => (
          <mesh key={x} position={[x, 1.36, 0]} castShadow>
            <boxGeometry args={[.022, .025, .66]} />
            <meshStandardMaterial color="#aba39a" roughness={.28} metalness={.7} />
          </mesh>
        ))}
      </group>

      <group name="FileCart_Folders">
        {FOLDERS.map((folder, index) => (
          <group key={folder.z} name={`FileCart_Folder_${index + 1}`} position={[0, 0, folder.z]}>
            <RoundedBox args={[.57, .38, .035]} position={[0, 1.17, 0]} radius={.012} smoothness={2} castShadow receiveShadow>
              <meshStandardMaterial color={folder.color} roughness={.82} metalness={.03} />
            </RoundedBox>
            <RoundedBox args={[.16, .06, .04]} position={[folder.tabX, 1.385, 0]} radius={.008} smoothness={2} castShadow>
              <meshStandardMaterial color={index % 2 ? '#cfc4b8' : '#8c837b'} roughness={.76} />
            </RoundedBox>
            {[-.305, .305].map((x) => (
              <mesh key={x} position={[x, 1.35, 0]} castShadow>
                <boxGeometry args={[.06, .025, .055]} />
                <meshStandardMaterial color="#b6ada4" roughness={.4} metalness={.35} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      </group>
    </SceneHotspotTarget>
  )
}
