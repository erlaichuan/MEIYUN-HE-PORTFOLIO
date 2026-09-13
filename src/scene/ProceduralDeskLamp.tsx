import { RoundedBox } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import {
  CatmullRomCurve3,
  DoubleSide,
  Quaternion,
  TubeGeometry,
  Vector3,
} from 'three'

type V3 = readonly [number, number, number]

const GREEN = '#9ab315'
const GREEN_DARK = '#657918'
const STEEL = '#c8cbc5'
const BLACK = '#282923'

function Beam({ from, to, z, name }: { from: V3; to: V3; z: number; name: string }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new Vector3(from[0], from[1], z)
    const b = new Vector3(to[0], to[1], z)
    const direction = b.clone().sub(a)
    return {
      position: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize()),
      length: direction.length(),
    }
  }, [from, to, z])

  return (
    <group name={name} position={position} quaternion={quaternion}>
      <RoundedBox args={[0.055, length, 0.045]} radius={0.018} smoothness={2} castShadow receiveShadow>
        <meshPhysicalMaterial color={GREEN} roughness={0.28} metalness={0.18} clearcoat={0.45} clearcoatRoughness={0.3} />
      </RoundedBox>
    </group>
  )
}

function CoilSpring({ from, to, z, name }: { from: V3; to: V3; z: number; name: string }) {
  const geometry = useMemo(() => {
    const a = new Vector3(from[0], from[1], z)
    const b = new Vector3(to[0], to[1], z)
    const direction = b.clone().sub(a)
    const side = new Vector3(-direction.y, direction.x, 0).normalize()
    const depth = new Vector3(0, 0, 1)
    const points = Array.from({ length: 49 }, (_, index) => {
      const t = index / 48
      const angle = t * Math.PI * 22
      return a.clone().lerp(b, t)
        .addScaledVector(side, Math.sin(angle) * 0.018)
        .addScaledVector(depth, Math.cos(angle) * 0.018)
    })
    return new TubeGeometry(new CatmullRomCurve3(points), 72, 0.009, 5, false)
  }, [from, to, z])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <mesh name={name} geometry={geometry} castShadow>
      <meshStandardMaterial color={STEEL} roughness={0.22} metalness={0.62} />
    </mesh>
  )
}

function Cable() {
  const geometry = useMemo(() => {
    const points = [
      new Vector3(-0.52, 1.58, 0.06),
      new Vector3(-0.68, 1.79, 0.08),
      new Vector3(-0.38, 1.86, 0.08),
      new Vector3(-0.25, 1.61, 0.07),
      new Vector3(0.15, 1.43, 0.065),
      new Vector3(0.63, 1.19, 0.06),
      new Vector3(0.83, 1.25, 0.055),
      new Vector3(0.91, 1.07, 0.05),
      new Vector3(0.56, 0.73, 0.045),
      new Vector3(0.45, 0.33, 0.035),
      new Vector3(0.72, 0.16, 0.02),
      new Vector3(1.08, 0.11, 0),
    ]
    return new TubeGeometry(new CatmullRomCurve3(points), 70, 0.012, 6, false)
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <mesh name="Lamp_PowerCable" geometry={geometry} castShadow>
      <meshStandardMaterial color="#c8c62b" roughness={0.54} />
    </mesh>
  )
}

function Pivot({ position, name, large = false }: { position: V3; name: string; large?: boolean }) {
  return (
    <group name={name} position={[...position]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[large ? 0.105 : 0.085, large ? 0.105 : 0.085, 0.18, 20]} />
        <meshStandardMaterial color={GREEN_DARK} roughness={0.32} metalness={0.22} />
      </mesh>
      <mesh position={[0, 0, 0.095]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.033, 0.033, 0.012, 16]} />
        <meshStandardMaterial color={BLACK} roughness={0.38} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0, -0.095]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.012, 16]} />
        <meshStandardMaterial color={STEEL} roughness={0.2} metalness={0.6} />
      </mesh>
    </group>
  )
}

function Shade() {
  const { position, quaternion, length } = useMemo(() => {
    const neck = new Vector3(-0.48, 1.5, 0)
    const opening = new Vector3(-0.93, 1.24, 0)
    const direction = opening.clone().sub(neck)
    return {
      position: neck.clone().add(opening).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize()),
      length: direction.length(),
    }
  }, [])

  return (
    <group name="Lamp_ShadeAssembly" position={position} quaternion={quaternion}>
      <mesh name="Lamp_ShadeOuter" castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.13, length, 32, 1, true]} />
        <meshPhysicalMaterial color={GREEN} roughness={0.23} metalness={0.18} clearcoat={0.55} clearcoatRoughness={0.24} side={DoubleSide} />
      </mesh>
      <mesh name="Lamp_ShadeInner">
        <cylinderGeometry args={[0.315, 0.115, length * 0.94, 32, 1, true]} />
        <meshStandardMaterial color="#fff0c5" emissive="#ffc96a" emissiveIntensity={0.24} roughness={0.62} side={DoubleSide} />
      </mesh>
      <mesh name="Lamp_ShadeRim" position={[0, length / 2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.338, 0.018, 8, 32]} />
        <meshStandardMaterial color="#a6be1b" roughness={0.27} metalness={0.16} />
      </mesh>
      <mesh name="Lamp_Bulb" position={[0, length * 0.2, 0]} castShadow>
        <sphereGeometry args={[0.09, 18, 12]} />
        <meshStandardMaterial color="#fff2cb" emissive="#ffcf78" emissiveIntensity={1.25} roughness={0.25} />
      </mesh>
      <pointLight name="Lamp_WarmLight" color="#ffd29a" intensity={0.65} distance={2.1} decay={2} position={[0, length * 0.45, 0]} />
    </group>
  )
}

export default function ProceduralDeskLamp() {
  const lower: [V3, V3] = [[0.42, 0.34, 0], [0.82, 1.06, 0]]
  const upper: [V3, V3] = [[0.82, 1.06, 0], [-0.48, 1.5, 0]]
  return (
    <group name="ProceduralDeskLamp" position={[3.55, 0.025, 0.5]} scale={0.9}>
      <mesh name="Lamp_Base" position={[0.42, 0.07, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.31, 0.42, 0.14, 32]} />
        <meshPhysicalMaterial color={GREEN} roughness={0.3} metalness={0.18} clearcoat={0.45} clearcoatRoughness={0.28} />
      </mesh>
      <mesh name="Lamp_BaseFoot" position={[0.42, 0.018, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.41, 0.035, 32]} />
        <meshStandardMaterial color={GREEN_DARK} roughness={0.48} />
      </mesh>
      <mesh name="Lamp_Pedestal" position={[0.42, 0.24, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.15, 0.28, 22]} />
        <meshPhysicalMaterial color={GREEN} roughness={0.29} metalness={0.16} clearcoat={0.4} />
      </mesh>

      {[-0.055, 0.055].map((z, index) => (
        <Beam key={`lower-${z}`} name={`Lamp_LowerArm_${index + 1}`} from={lower[0]} to={lower[1]} z={z} />
      ))}
      {[-0.055, 0.055].map((z, index) => (
        <Beam key={`upper-${z}`} name={`Lamp_UpperArm_${index + 1}`} from={upper[0]} to={upper[1]} z={z} />
      ))}

      <CoilSpring name="Lamp_LowerSpring" from={[0.47, 0.43, 0]} to={[0.73, 0.93, 0]} z={0.105} />
      <CoilSpring name="Lamp_UpperSpring" from={[0.68, 1.11, 0]} to={[-0.28, 1.43, 0]} z={0.105} />
      <Pivot name="Lamp_BasePivot" position={lower[0]} />
      <Pivot name="Lamp_ElbowPivot" position={lower[1]} large />
      <Pivot name="Lamp_ShadePivot" position={upper[1]} />

      <RoundedBox name="Lamp_BaseBracket" args={[0.23, 0.23, 0.17]} position={[0.42, 0.34, 0]} radius={0.035} smoothness={2} castShadow>
        <meshStandardMaterial color={GREEN_DARK} roughness={0.31} metalness={0.2} />
      </RoundedBox>
      <RoundedBox name="Lamp_ElbowBracket" args={[0.24, 0.2, 0.17]} position={[0.82, 1.06, 0]} radius={0.032} smoothness={2} castShadow>
        <meshStandardMaterial color={GREEN_DARK} roughness={0.3} metalness={0.2} />
      </RoundedBox>
      <RoundedBox name="Lamp_ShadeBracket" args={[0.23, 0.18, 0.17]} position={[-0.48, 1.5, 0]} radius={0.03} smoothness={2} castShadow>
        <meshStandardMaterial color={GREEN_DARK} roughness={0.3} metalness={0.2} />
      </RoundedBox>

      <Shade />
      <Cable />
    </group>
  )
}
