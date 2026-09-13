import { useEffect, useMemo } from 'react'
import {
  DoubleSide,
  ExtrudeGeometry,
  MeshStandardMaterial,
  Quaternion,
  Shape,
  Vector3,
} from 'three'

type Vec3 = [number, number, number]

type LeafSpec = {
  base: Vec3
  direction: Vec3
  length: number
  width: number
  twist: number
  tone: 0 | 1 | 2
}

const LEAVES: readonly LeafSpec[] = [
  { base: [-.07, .88, .02], direction: [-.15, .99, -.03], length: 1.62, width: 1.02, twist: -.15, tone: 1 },
  { base: [.08, .89, -.02], direction: [.18, .98, -.05], length: 1.48, width: .96, twist: .12, tone: 0 },
  { base: [-.12, .86, .08], direction: [-.48, .84, .12], length: 1.48, width: 1.08, twist: -.34, tone: 2 },
  { base: [.12, .86, .08], direction: [.5, .82, .1], length: 1.42, width: 1.06, twist: .28, tone: 1 },
  { base: [-.05, .85, -.05], direction: [-.42, .83, -.36], length: 1.35, width: 1.03, twist: .2, tone: 0 },
  { base: [.05, .85, -.05], direction: [.44, .81, -.38], length: 1.36, width: 1.03, twist: -.2, tone: 2 },
  { base: [-.18, .84, .08], direction: [-.72, .62, .12], length: 1.3, width: 1.08, twist: -.4, tone: 0 },
  { base: [.18, .84, .1], direction: [.74, .6, .15], length: 1.28, width: 1.08, twist: .38, tone: 1 },
  { base: [-.15, .82, -.05], direction: [-.7, .56, -.34], length: 1.23, width: 1.02, twist: .15, tone: 1 },
  { base: [.15, .82, -.05], direction: [.7, .57, -.32], length: 1.24, width: 1.02, twist: -.18, tone: 0 },
  { base: [-.2, .82, .12], direction: [-.85, .43, .2], length: 1.16, width: 1.12, twist: -.28, tone: 2 },
  { base: [.2, .82, .13], direction: [.85, .42, .22], length: 1.15, width: 1.12, twist: .3, tone: 2 },
  { base: [-.12, .81, .02], direction: [-.65, .42, .62], length: 1.16, width: 1.08, twist: -.18, tone: 0 },
  { base: [.12, .81, .02], direction: [.64, .42, .63], length: 1.14, width: 1.08, twist: .18, tone: 1 },
  { base: [0, .86, .02], direction: [-.08, .92, .38], length: 1.35, width: .92, twist: .05, tone: 2 },
  { base: [.02, .85, -.02], direction: [.08, .94, -.32], length: 1.25, width: .9, twist: -.05, tone: 1 },
]

function makeLeafGeometry() {
  const shape = new Shape()
  shape.moveTo(0, 0)
  shape.bezierCurveTo(-.17, .1, -.34, .58, -.23, 1.08)
  shape.bezierCurveTo(-.19, 1.27, -.08, 1.4, 0, 1.42)
  shape.bezierCurveTo(.08, 1.4, .19, 1.27, .23, 1.08)
  shape.bezierCurveTo(.34, .58, .17, .1, 0, 0)

  const geometry = new ExtrudeGeometry(shape, {
    depth: .045,
    steps: 1,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: .026,
    bevelThickness: .018,
    curveSegments: 10,
  })
  geometry.translate(0, 0, -.0225)
  geometry.computeVertexNormals()
  return geometry
}

function quaternionAlong(direction: Vec3) {
  const vector = new Vector3(...direction).normalize()
  return new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), vector)
}

function Stem({ start, end }: { start: Vec3; end: Vec3 }) {
  const { midpoint, quaternion, length } = useMemo(() => {
    const a = new Vector3(...start)
    const b = new Vector3(...end)
    const delta = b.clone().sub(a)
    return {
      midpoint: a.add(b).multiplyScalar(.5),
      quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), delta.clone().normalize()),
      length: delta.length(),
    }
  }, [start, end])

  return (
    <mesh position={midpoint} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[.027, .04, length, 8]} />
      <meshStandardMaterial color="#28732e" roughness={.63} />
    </mesh>
  )
}

export default function ProceduralPlant() {
  const leafGeometry = useMemo(makeLeafGeometry, [])
  const leafMaterials = useMemo(() => [
    new MeshStandardMaterial({ color: '#3e9c38', roughness: .47, side: DoubleSide }),
    new MeshStandardMaterial({ color: '#55b747', roughness: .43, side: DoubleSide }),
    new MeshStandardMaterial({ color: '#76c95a', roughness: .4, side: DoubleSide }),
  ], [])

  useEffect(() => () => {
    leafGeometry.dispose()
    leafMaterials.forEach((material) => material.dispose())
  }, [leafGeometry, leafMaterials])

  return (
    <group name="ProceduralPlant" position={[-3.28, .02, -.24]} rotation={[0, .18, 0]} scale={.8}>
      <mesh name="Plant_Pot" position={[0, .4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[.61, .46, .78, 32]} />
        <meshStandardMaterial color="#c88755" roughness={.66} />
      </mesh>
      <mesh name="Plant_PotRim" position={[0, .78, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[.59, .105, 12, 32]} />
        <meshStandardMaterial color="#d89a66" roughness={.59} />
      </mesh>
      <mesh name="Plant_Soil" position={[0, .815, 0]} receiveShadow>
        <cylinderGeometry args={[.53, .53, .055, 28]} />
        <meshStandardMaterial color="#433024" roughness={1} />
      </mesh>

      {[
        [-.34, .852, .06, .1], [-.18, .855, -.26, .12], [.03, .856, .27, .11],
        [.23, .854, -.17, .13], [.34, .852, .12, .1], [-.06, .86, -.08, .12],
      ].map(([x, y, z, scale], index) => (
        <mesh key={index} name={`Plant_Pebble_${index + 1}`} position={[x, y, z]} scale={[scale, scale * .55, scale]} castShadow>
          <sphereGeometry args={[1, 10, 6]} />
          <meshStandardMaterial color={index % 2 ? '#655044' : '#796054'} roughness={.94} />
        </mesh>
      ))}

      {LEAVES.map((leaf, index) => {
        const direction = new Vector3(...leaf.direction).normalize()
        const stemEnd = new Vector3(...leaf.base).addScaledVector(direction, leaf.length * .22)
        return (
          <group key={index} name={`Plant_LeafAssembly_${index + 1}`}>
            <Stem start={[leaf.base[0] * .24, .82, leaf.base[2] * .24]} end={stemEnd.toArray() as Vec3} />
            <group position={leaf.base} quaternion={quaternionAlong(leaf.direction)}>
              <mesh
                name={`Plant_Leaf_${index + 1}`}
                geometry={leafGeometry}
                material={leafMaterials[leaf.tone]}
                rotation={[0, leaf.twist, 0]}
                scale={[leaf.width, leaf.length / 1.42, 1]}
                castShadow
                receiveShadow
              />
              <mesh position={[0, leaf.length * .48, .038]} rotation={[0, leaf.twist, 0]} scale={[1, leaf.length, 1]}>
                <boxGeometry args={[.015, .62, .012]} />
                <meshStandardMaterial color="#2f862e" roughness={.58} />
              </mesh>
            </group>
          </group>
        )
      })}
    </group>
  )
}
