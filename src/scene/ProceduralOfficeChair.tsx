import { RoundedBox } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three'

type V3 = readonly [number, number, number]

const PLYWOOD = '#b9782e'
const PLYWOOD_EDGE = '#8d5422'
const UPHOLSTERY = '#252525'
const CHROME = '#aeb2ad'

function ChairTube({ points, radius = 0.026, name }: { points: readonly V3[]; radius?: number; name: string }) {
  const geometry = useMemo(() => new TubeGeometry(
    new CatmullRomCurve3(points.map((point) => new Vector3(...point))),
    28,
    radius,
    8,
    false,
  ), [points, radius])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh name={name} geometry={geometry} castShadow receiveShadow>
      <meshPhysicalMaterial color={CHROME} roughness={0.2} metalness={0.78} clearcoat={0.36} clearcoatRoughness={0.18} />
    </mesh>
  )
}

/** 轻量木背会议椅：弯木背板、黑色软垫、镀铬管架与扶手。 */
export default function ProceduralOfficeChair() {
  return (
    <group name="ProceduralOfficeChair" position={[-0.66, -2.375, 2.68]} rotation={[0, 0.035, 0]} scale={0.82}>
      <group name="Chair_Frame">
        <ChairTube name="Chair_Leg_FrontLeft" points={[[ -0.58, 1.08, 0.38], [-0.65, 0.55, 0.53], [-0.76, 0.04, 0.67]]} />
        <ChairTube name="Chair_Leg_FrontRight" points={[[0.58, 1.08, 0.38], [0.65, 0.55, 0.53], [0.76, 0.04, 0.67]]} />
        <ChairTube name="Chair_Leg_BackLeft" points={[[-0.58, 1.08, -0.38], [-0.63, 0.52, -0.51], [-0.72, 0.04, -0.62]]} />
        <ChairTube name="Chair_Leg_BackRight" points={[[0.58, 1.08, -0.38], [0.63, 0.52, -0.51], [0.72, 0.04, -0.62]]} />
        <ChairTube name="Chair_BackRail_Left" points={[[-0.58, 1.08, -0.34], [-0.58, 1.62, -0.29], [-0.56, 2.34, -0.18]]} />
        <ChairTube name="Chair_BackRail_Right" points={[[0.58, 1.08, -0.34], [0.58, 1.62, -0.29], [0.56, 2.34, -0.18]]} />
        <ChairTube name="Chair_ArmSupport_Left" points={[[-0.62, 1.08, 0.28], [-0.72, 1.5, 0.18], [-0.73, 1.72, -0.16]]} />
        <ChairTube name="Chair_ArmSupport_Right" points={[[0.62, 1.08, 0.28], [0.72, 1.5, 0.18], [0.73, 1.72, -0.16]]} />
      </group>

      <RoundedBox name="Chair_Seat" args={[1.42, 0.18, 1.02]} position={[0, 1.12, 0]} radius={0.11} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color={UPHOLSTERY} roughness={0.9} metalness={0} />
      </RoundedBox>
      <RoundedBox name="Chair_SeatUnderlay" args={[1.36, 0.07, 0.96]} position={[0, 1.02, 0]} radius={0.06} smoothness={2} castShadow>
        <meshStandardMaterial color="#111211" roughness={0.62} metalness={0.12} />
      </RoundedBox>

      <RoundedBox name="Chair_PlywoodBack" args={[1.5, 1.3, 0.13]} position={[0, 1.98, -0.13]} rotation={[-0.08, 0, 0]} radius={0.1} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={PLYWOOD} roughness={0.68} metalness={0} />
      </RoundedBox>
      <RoundedBox name="Chair_BackEdge" args={[1.42, 0.05, 0.14]} position={[0, 2.6, -0.075]} radius={0.025} smoothness={2} castShadow>
        <meshStandardMaterial color={PLYWOOD_EDGE} roughness={0.75} />
      </RoundedBox>

      {[-0.48, 0.48].map((x) => (
        <mesh key={x} name="Chair_BackBolt" position={[x, 1.45, -0.052]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.018, 16]} />
          <meshStandardMaterial color="#c4c7c2" roughness={0.2} metalness={0.78} />
        </mesh>
      ))}

      {[-0.73, 0.73].map((x) => (
        <RoundedBox key={x} name="Chair_ArmPad" args={[0.14, 0.1, 0.72]} position={[x, 1.77, 0.12]} radius={0.05} smoothness={3} castShadow receiveShadow>
          <meshStandardMaterial color="#222323" roughness={0.72} metalness={0.02} />
        </RoundedBox>
      ))}
    </group>
  )
}
