import { RoundedBox } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three'
import DetailFocusTarget from './DetailFocusTarget'

type Point = readonly [number, number, number]

function CableTube({
  name,
  points,
  radius,
  color,
  metalness = 0,
  roughness = .62,
}: {
  name: string
  points: readonly Point[]
  radius: number
  color: string
  metalness?: number
  roughness?: number
}) {
  const geometry = useMemo(() => {
    const curve = new CatmullRomCurve3(points.map(([x, y, z]) => new Vector3(x, y, z)))
    return new TubeGeometry(curve, Math.max(24, points.length * 7), radius, 7, false)
  }, [points, radius])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh name={name} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  )
}

const HEADBAND_PATH: readonly Point[] = [
  [-.48, .085, .24],
  [-.62, .09, -.02],
  [-.62, .095, -.36],
  [-.43, .1, -.62],
  [0, .105, -.73],
  [.43, .1, -.62],
  [.62, .095, -.36],
  [.62, .09, -.02],
  [.48, .085, .24],
]

const LEFT_YOKE_PATH: readonly Point[] = [
  [-.49, .1, .19],
  [-.53, .12, .29],
  [-.48, .145, .39],
]

const RIGHT_YOKE_PATH: readonly Point[] = [
  [.49, .1, .19],
  [.53, .12, .29],
  [.48, .145, .39],
]

const MAIN_CABLE_PATH: readonly Point[] = [
  [-2.08, .075, 2.02],
  [-1.84, .058, 2.17],
  [-1.49, .052, 2.15],
  [-1.25, .05, 1.94],
  [-1.25, .05, 1.58],
  [-1.47, .05, 1.27],
  [-1.78, .05, 1.19],
  [-1.98, .052, 1.38],
  [-1.94, .054, 1.68],
  [-1.7, .056, 1.93],
  [-1.4, .06, 1.93],
  [-1.31, .066, 1.67],
  [-1.5, .095, 1.08],
]

function EarCup({ side }: { side: -1 | 1 }) {
  const x = side * .47
  return (
    <group name={side < 0 ? 'Headphones_LeftEarcup' : 'Headphones_RightEarcup'} position={[x, 0, .4]} rotation={[0, side * .14, 0]}>
      <mesh name="Headphones_SilverCup" position={[0, .105, 0]} scale={[1, .56, .88]} castShadow>
        <sphereGeometry args={[.185, 20, 12]} />
        <meshStandardMaterial color="#b7b3aa" roughness={.3} metalness={.62} />
      </mesh>
      <mesh name="Headphones_BlackCushion" position={[0, .17, .018]} scale={[1, .38, .86]} castShadow receiveShadow>
        <sphereGeometry args={[.205, 22, 14]} />
        <meshPhysicalMaterial color="#252321" roughness={.78} clearcoat={.04} />
      </mesh>
      <mesh name="Headphones_CushionSeam" position={[0, .197, .022]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, .88, 1]}>
        <torusGeometry args={[.145, .014, 7, 22]} />
        <meshStandardMaterial color="#151413" roughness={.86} />
      </mesh>
      <mesh name="Headphones_CupPivot" position={[side * .19, .12, -.015]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[.034, .034, .055, 14]} />
        <meshStandardMaterial color="#d0cdc6" roughness={.24} metalness={.7} />
      </mesh>
    </group>
  )
}

function Headphones() {
  return (
    <group name="RetroHeadphones" position={[-1.4, .02, 1.6]} rotation={[0, -.08, 0]}>
      <CableTube name="Headphones_PaddedHeadband" points={HEADBAND_PATH} radius={.05} color="#4c4844" roughness={.72} />
      <CableTube name="Headphones_LeftYoke" points={LEFT_YOKE_PATH} radius={.014} color="#c9c5bd" metalness={.74} roughness={.24} />
      <CableTube name="Headphones_RightYoke" points={RIGHT_YOKE_PATH} radius={.014} color="#c9c5bd" metalness={.74} roughness={.24} />
      <CableTube
        name="Headphones_LeftSlider"
        points={[
          [-.53, .105, .12],
          [-.56, .115, .25],
          [-.52, .13, .36],
        ]}
        radius={.009}
        color="#d5d1c9"
        metalness={.78}
        roughness={.2}
      />
      <CableTube
        name="Headphones_RightSlider"
        points={[
          [.53, .105, .12],
          [.56, .115, .25],
          [.52, .13, .36],
        ]}
        radius={.009}
        color="#d5d1c9"
        metalness={.78}
        roughness={.2}
      />
      <EarCup side={-1} />
      <EarCup side={1} />
    </group>
  )
}

function PocketPlayer() {
  return (
    <DetailFocusTarget
      id="mp3-player"
      name="PocketMusicPlayer"
      position={[-1.5, .025, 1.46]}
      rotation={[0, -.12, 0]}
      anchorOffset={[0, .1, 0]}
      focusHeight={.56}
    >
      <RoundedBox name="Player_Body" args={[.44, .075, .7]} radius={.045} smoothness={3} position={[0, .045, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#171719" roughness={.35} clearcoat={.32} clearcoatRoughness={.28} />
      </RoundedBox>

      <RoundedBox name="Player_ScreenBezel" args={[.34, .014, .22]} radius={.018} smoothness={2} position={[0, .091, -.19]} castShadow>
        <meshStandardMaterial color="#333538" roughness={.5} metalness={.08} />
      </RoundedBox>
      <mesh name="Player_Screen" position={[0, .1, -.19]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[.3, .18]} />
        <meshPhysicalMaterial color="#899394" roughness={.42} clearcoat={.22} />
      </mesh>
      <mesh name="Player_AlbumThumbnail" position={[-.095, .105, -.192]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[.065, .1]} />
        <meshStandardMaterial color="#4b5050" roughness={.68} />
      </mesh>
      {[-.015, .025, .065].map((z, index) => (
        <mesh key={z} name={`Player_ScreenLine_${index + 1}`} position={[.06, .106, -.23 + z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[index === 0 ? .12 : .095, .009]} />
          <meshStandardMaterial color={index === 0 ? '#d2d5d1' : '#b3bab7'} roughness={.58} />
        </mesh>
      ))}

      <mesh name="Player_ClickWheel" position={[0, .1, .145]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[.105, .022, 10, 28]} />
        <meshStandardMaterial color="#2e2e30" roughness={.48} />
      </mesh>
      <mesh name="Player_ClickWheelCenter" position={[0, .101, .145]}>
        <cylinderGeometry args={[.05, .05, .012, 22]} />
        <meshStandardMaterial color="#242426" roughness={.5} />
      </mesh>
      {[
        [0, -.01, 'Player_MenuMark'],
        [0, .3, 'Player_PlayMark'],
        [-.105, .145, 'Player_BackMark'],
        [.105, .145, 'Player_ForwardMark'],
      ].map(([x, z, name]) => (
        <mesh key={String(name)} name={String(name)} position={[Number(x), .112, Number(z)]} rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[.025, .012, .008]} />
          <meshStandardMaterial color="#c2c2bf" roughness={.56} />
        </mesh>
      ))}

      <mesh name="Player_Jack" position={[0, .1, -.378]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[.025, .025, .075, 14]} />
        <meshStandardMaterial color="#222224" roughness={.54} />
      </mesh>
    </DetailFocusTarget>
  )
}

export default function ProceduralHeadphonesPlayer() {
  return (
    <group name="ProceduralHeadphonesPlayer">
      <Headphones />
      <CableTube name="Headphones_MainCable" points={MAIN_CABLE_PATH} radius={.012} color="#171719" roughness={.64} />
      <PocketPlayer />
    </group>
  )
}
