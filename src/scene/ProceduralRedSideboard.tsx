import { RoundedBox } from '@react-three/drei'

/**
 * Simplified red cabinet only, observed in the embedded preview of the supplied SKP.
 * The preview does not provide exact measurements or the hidden interior.
 * Uniform 1.6 scale: 2.976 W × 2.64 H × 1.312 D.
 * Floor=-2.34, top=0.30 > desktop=0, still below window bottom=1.5656.
 * Right edge=-4.492 clears the desk left edge=-4.4; rear face=-2.736 near wall.
 */
const RED_SIDEBOARD = {
  position: [-5.98, -2.34, -2.08] as [number, number, number],
  width: 1.86,
  height: 1.65,
  depth: 0.82,
}

const SHELL = [
  { name: 'Top', size: [1.86, .065, .82], position: [0, 1.6175, 0] },
  { name: 'Bottom', size: [1.86, .065, .82], position: [0, .3325, 0] },
  { name: 'SideLeft', size: [.055, 1.285, .82], position: [-.9025, .975, 0] },
  { name: 'SideRight', size: [.055, 1.285, .82], position: [.9025, .975, 0] },
  { name: 'Back', size: [1.75, 1.23, .035], position: [0, .975, -.3925] },
] as const

export default function ProceduralRedSideboard() {
  return (
    <group name="RedSideboard" position={RED_SIDEBOARD.position} scale={1.6}>
      {SHELL.map((part) => (
        <RoundedBox key={part.name} name={`RedSideboard_${part.name}`}
          args={[...part.size]} position={[...part.position]} radius={.006} smoothness={1}
          castShadow receiveShadow>
          <meshStandardMaterial color="#d5ba89" roughness={.67} />
        </RoundedBox>
      ))}
      {[-1, 1].map((side) => (
        <group key={side} name={`RedSideboard_Door_${side < 0 ? 'Left' : 'Right'}`}>
          <RoundedBox name="RedSideboard_RedDoor" args={[.863, 1.21, .045]}
            position={[side * .438, .975, .373]} radius={.005} smoothness={1} castShadow receiveShadow>
            <meshPhysicalMaterial color="#bd1115" roughness={.47} clearcoat={.12} clearcoatRoughness={.4} />
          </RoundedBox>
          <mesh name="RedSideboard_KnobStem" position={[side * .065, 1.50, .402]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[.009, .009, .024, 8]} />
            <meshStandardMaterial color="#24221f" roughness={.5} />
          </mesh>
          <mesh name="RedSideboard_RoundKnob" position={[side * .065, 1.50, .418]} scale={[1, 1, .65]} castShadow>
            <sphereGeometry args={[.023, 10, 6]} />
            <meshStandardMaterial color="#24221f" roughness={.5} />
          </mesh>
        </group>
      ))}
      {[-.78, .78].flatMap((x) => [-.29, .29].map((z) => (
        <mesh key={`${x}:${z}`} name={`RedSideboard_Foot_${x}_${z}`} position={[x, .165, z]} castShadow receiveShadow>
          <boxGeometry args={[.045, .33, .045]} />
          <meshStandardMaterial color="#c4a778" roughness={.72} />
        </mesh>
      )))}
    </group>
  )
}
