import { useEffect, useMemo } from 'react'
import { ExtrudeGeometry, Shape } from 'three'

const BLUEBERRIES = [
  { position: [-.18, .43, .2] as const, scale: .085 },
  { position: [-.02, .46, .23] as const, scale: .095 },
  { position: [.15, .43, .21] as const, scale: .082 },
]

const STRAWBERRY_SEEDS = [
  [-.06, .07, .095], [.02, .09, .104], [.08, .035, .096],
  [-.09, -.01, .094], [0, .005, .11], [.07, -.045, .096],
] as const

function makeOrangeSlice(radius: number, depth: number) {
  const shape = new Shape()
  shape.moveTo(-radius, 0)
  shape.lineTo(radius, 0)
  shape.absarc(0, 0, radius, 0, Math.PI, false)
  shape.closePath()
  const geometry = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSize: .006,
    bevelThickness: .006,
    bevelSegments: 2,
    curveSegments: 24,
  })
  geometry.translate(0, 0, -depth / 2)
  return geometry
}

export default function ProceduralCake() {
  const orangeRind = useMemo(() => makeOrangeSlice(.145, .046), [])
  const orangeFlesh = useMemo(() => makeOrangeSlice(.118, .052), [])

  useEffect(
    () => () => {
      orangeRind.dispose()
      orangeFlesh.dispose()
    },
    [orangeFlesh, orangeRind],
  )

  return (
    <group name="ProceduralCake" position={[2.55, .025, 1.38]} rotation={[0, -.08, 0]} scale={.92}>
      <mesh name="Cake_Plate" position={[0, .035, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[.43, .39, .055, 36]} />
        <meshPhysicalMaterial color="#c8c0b5" roughness={.38} clearcoat={.22} clearcoatRoughness={.3} />
      </mesh>
      <mesh name="Cake_PlateRim" position={[0, .064, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[.365, .055, 10, 36]} />
        <meshStandardMaterial color="#ded5c8" roughness={.4} />
      </mesh>

      <mesh name="Cake_Sponge" position={[0, .18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[.31, .32, .23, 36]} />
        <meshPhysicalMaterial color="#dd8a2c" roughness={.66} clearcoat={.04} />
      </mesh>
      <mesh name="Cake_CreamBody" position={[0, .32, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[.305, .31, .12, 36]} />
        <meshPhysicalMaterial color="#ead8bd" roughness={.54} clearcoat={.08} />
      </mesh>

      {[
        { y: .29, radius: .305 },
        { y: .355, radius: .285 },
        { y: .415, radius: .25 },
        { y: .47, radius: .205 },
      ].map((ring, index) => (
        <mesh key={index} name={`Cake_CreamSwirl_${index + 1}`} position={[0, ring.y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[ring.radius, .052, 9, 32]} />
          <meshPhysicalMaterial color="#f0dfc5" roughness={.48} clearcoat={.08} />
        </mesh>
      ))}
      <mesh name="Cake_CreamPeak" position={[0, .51, 0]} scale={[.19, .13, .19]} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
        <meshPhysicalMaterial color="#f2e3cc" roughness={.48} clearcoat={.08} />
      </mesh>

      <group name="Cake_Strawberry" position={[-.13, .59, .015]} rotation={[0, -.1, .18]}>
        <mesh name="Cake_StrawberryFruit" scale={[.12, .16, .11]} castShadow>
          <sphereGeometry args={[1, 22, 16]} />
          <meshPhysicalMaterial color="#e73b27" roughness={.48} clearcoat={.14} clearcoatRoughness={.3} />
        </mesh>
        {STRAWBERRY_SEEDS.map((seed, index) => (
          <mesh key={index} name={`Cake_StrawberrySeed_${index + 1}`} position={seed} scale={[.009, .014, .006]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color="#ffd34b" roughness={.55} />
          </mesh>
        ))}
        {[-.085, -.028, .03, .086].map((x, index) => (
          <mesh key={index} name={`Cake_StrawberryLeaf_${index + 1}`} position={[x, .145, 0]} rotation={[0, 0, (index - 1.5) * .4]} scale={[.065, .018, .12]} castShadow>
            <sphereGeometry args={[1, 12, 8]} />
            <meshStandardMaterial color={index % 2 ? '#4f9e32' : '#65b543'} roughness={.58} />
          </mesh>
        ))}
      </group>

      {BLUEBERRIES.map((berry, index) => (
        <group key={index} name={`Cake_Blueberry_${index + 1}`} position={berry.position}>
          <mesh scale={berry.scale} castShadow>
            <sphereGeometry args={[1, 18, 12]} />
            <meshPhysicalMaterial color="#294f7d" roughness={.4} clearcoat={.16} clearcoatRoughness={.3} />
          </mesh>
          <mesh position={[0, berry.scale * .82, berry.scale * .48]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[berry.scale * .18, berry.scale * .055, 6, 8]} />
            <meshStandardMaterial color="#152e4e" roughness={.6} />
          </mesh>
        </group>
      ))}

      {[
        { position: [.13, .49, -.085] as const, rotation: [-.06, -.18, -.18] as const },
        { position: [.25, .475, -.025] as const, rotation: [.04, .12, .2] as const },
      ].map((slice, index) => (
        <group key={index} name={`Cake_OrangeSlice_${index + 1}`} position={slice.position} rotation={slice.rotation}>
          <mesh geometry={orangeRind} castShadow receiveShadow>
            <meshPhysicalMaterial color="#ed891b" roughness={.5} clearcoat={.1} />
          </mesh>
          <mesh geometry={orangeFlesh} position={[0, .008, .004]} castShadow>
            <meshPhysicalMaterial color="#ffb13a" roughness={.55} clearcoat={.06} />
          </mesh>
          {[-.052, 0, .052].map((x) => (
            <mesh key={x} position={[x, .058, .034]} rotation={[0, 0, x * 3.4]} castShadow>
              <boxGeometry args={[.008, .11, .008]} />
              <meshStandardMaterial color="#ffd064" roughness={.62} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}
