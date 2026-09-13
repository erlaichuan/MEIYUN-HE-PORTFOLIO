import { RoundedBox } from '@react-three/drei'

const SWITCH_X = [-0.51, -0.17, 0.17, 0.51] as const
const PLASTIC = '#eee6d9'
const PLASTIC_EDGE = '#d4c9b9'
const SEAM = '#8e8378'

function Fastener({ x, y }: { x: number; y: number }) {
  return (
    <group name="SwitchPanel_Fastener" position={[x, y, 0.052]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.026, 0.026, 0.018, 16]} />
        <meshPhysicalMaterial
          color="#e4ddd1"
          roughness={0.28}
          metalness={0.28}
          clearcoat={0.24}
          clearcoatRoughness={0.3}
        />
      </mesh>
      <RoundedBox
        name="SwitchPanel_FastenerSlot"
        args={[0.035, 0.006, 0.006]}
        position={[0, 0, 0.013]}
        radius={0.002}
        smoothness={1}
      >
        <meshStandardMaterial color="#8e867d" roughness={0.58} metalness={0.18} />
      </RoundedBox>
    </group>
  )
}

function RockerSwitch({ x, index }: { x: number; index: number }) {
  return (
    <group name={`SwitchPanel_Rocker_${index + 1}`} position={[x, -0.015, 0]}>
      <RoundedBox
        name="SwitchPanel_RockerSeam"
        args={[0.255, 0.405, 0.038]}
        position={[0, 0, 0.061]}
        radius={0.022}
        smoothness={2}
        castShadow
      >
        <meshStandardMaterial color={SEAM} roughness={0.62} />
      </RoundedBox>
      <RoundedBox
        name="SwitchPanel_RockerBezel"
        args={[0.235, 0.385, 0.052]}
        position={[0, 0, 0.082]}
        radius={0.019}
        smoothness={2}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={PLASTIC_EDGE}
          roughness={0.34}
          metalness={0}
          clearcoat={0.4}
          clearcoatRoughness={0.3}
        />
      </RoundedBox>
      <RoundedBox
        name="SwitchPanel_RockerPaddle"
        args={[0.19, 0.33, 0.055]}
        position={[0, 0.008, 0.119]}
        rotation={[index === 2 ? -0.025 : 0.018, 0, 0]}
        radius={0.014}
        smoothness={2}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={PLASTIC}
          roughness={0.3}
          metalness={0}
          clearcoat={0.46}
          clearcoatRoughness={0.28}
        />
      </RoundedBox>

      {index === 2 && [-0.036, 0.036].map((notchX) => (
        <RoundedBox
          key={notchX}
          name="SwitchPanel_ThirdRockerLowerNotch"
          args={[0.045, 0.037, 0.026]}
          position={[notchX, -0.191, 0.111]}
          radius={0.007}
          smoothness={2}
          castShadow
        >
          <meshStandardMaterial color={PLASTIC_EDGE} roughness={0.38} />
        </RoundedBox>
      ))}
    </group>
  )
}

/**
 * Reference-based low-poly four-gang rocker panel.
 * The hidden wiring box is intentionally reduced to one shallow mounting block.
 */
export default function ProceduralSwitchPanel() {
  return (
    // Center is 3.99 units above the floor (desk height 2.34), roughly a 1.28 m reach.
    // The four-gang plate is now 0.60 × 0.27 units, about 18 × 8 cm at desk scale.
    <group name="ProceduralSwitchPanel" position={[3.65, 1.65, -2.785]} scale={0.42}>
      <RoundedBox
        name="SwitchPanel_RearMount"
        args={[1.38, 0.59, 0.06]}
        position={[0, 0, -0.045]}
        radius={0.045}
        smoothness={2}
        castShadow
      >
        <meshStandardMaterial color="#b9ad9d" roughness={0.68} />
      </RoundedBox>
      <RoundedBox
        name="SwitchPanel_Faceplate"
        args={[1.42, 0.64, 0.07]}
        radius={0.052}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={PLASTIC}
          roughness={0.32}
          metalness={0}
          clearcoat={0.42}
          clearcoatRoughness={0.32}
        />
      </RoundedBox>

      {SWITCH_X.map((x, index) => (
        <RockerSwitch key={x} x={x} index={index} />
      ))}
      {SWITCH_X.flatMap((x) => [-0.245, 0.245].map((y) => (
        <Fastener key={`${x}-${y}`} x={x} y={y} />
      )))}
    </group>
  )
}
