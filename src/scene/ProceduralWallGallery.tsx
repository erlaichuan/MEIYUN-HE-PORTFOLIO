import { RoundedBox } from '@react-three/drei'
import type { ReactNode } from 'react'

type V3 = readonly [number, number, number]

function PhotoBoothArt({ width, height }: { width: number; height: number }) {
  return (
    <group name="WallGallery_PhotoBoothArt">
      <mesh position={[0, 0, .082]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#7e9195" roughness={.84} />
      </mesh>
      {[-.085, .085].flatMap((x) => [.115, 0, -.115].map((y, index) => (
        <group key={`${x}-${y}`} position={[x, y, .09]}>
          <mesh>
            <planeGeometry args={[.105, .095]} />
            <meshStandardMaterial color="#e4dfd4" roughness={.9} />
          </mesh>
          <mesh position={[0, .018, .006]}>
            <circleGeometry args={[.021, 10]} />
            <meshStandardMaterial color={index % 2 ? '#67645f' : '#3f4140'} roughness={.86} />
          </mesh>
          <mesh position={[0, -.025, .006]}>
            <planeGeometry args={[.055, .035]} />
            <meshStandardMaterial color="#77756f" roughness={.86} />
          </mesh>
        </group>
      )))}
    </group>
  )
}

function PortraitArt({
  width,
  height,
  red = false,
  oval = false,
}: {
  width: number
  height: number
  red?: boolean
  oval?: boolean
}) {
  return (
    <group name="WallGallery_PortraitArt">
      <mesh position={[0, 0, .082]} scale={oval ? [width / 2, height / 2, 1] : [1, 1, 1]}>
        {oval ? <circleGeometry args={[1, 32]} /> : <planeGeometry args={[width, height]} />}
        <meshStandardMaterial color="#e9dfc9" roughness={.9} />
      </mesh>
      <mesh position={[0, height * .13, .09]}>
        <circleGeometry args={[Math.min(width, height) * .13, 14]} />
        <meshStandardMaterial color="#644a3f" roughness={.82} />
      </mesh>
      <mesh position={[0, -height * .1, .091]}>
        <planeGeometry args={[width * .34, height * .32]} />
        <meshStandardMaterial color={red ? '#a23f35' : '#776b57'} roughness={.84} />
      </mesh>
    </group>
  )
}

function LandscapeArt({ width, height, oval = false }: { width: number; height: number; oval?: boolean }) {
  return (
    <group name="WallGallery_LandscapeArt">
      <mesh position={[0, 0, .082]} scale={oval ? [width / 2, height / 2, 1] : [1, 1, 1]}>
        {oval ? <circleGeometry args={[1, 32]} /> : <planeGeometry args={[width, height]} />}
        <meshStandardMaterial color="#9cb9bd" roughness={.88} />
      </mesh>
      <mesh position={[0, -height * .19, .09]} scale={oval ? [width * .39, height * .24, 1] : [1, 1, 1]}>
        {oval ? <circleGeometry args={[1, 28]} /> : <planeGeometry args={[width, height * .52]} />}
        <meshStandardMaterial color="#718153" roughness={.92} />
      </mesh>
      <mesh position={[-width * .12, -height * .02, .094]} scale={[1.2, .7, 1]}>
        <circleGeometry args={[Math.min(width, height) * .13, 12]} />
        <meshStandardMaterial color="#425d3d" roughness={.9} />
      </mesh>
    </group>
  )
}

function DogArt({ width, height }: { width: number; height: number }) {
  return (
    <group name="WallGallery_DogArt">
      <mesh position={[0, 0, .082]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#e5dcc8" roughness={.91} />
      </mesh>
      <mesh position={[0, .02, .09]} scale={[.85, 1, 1]}>
        <circleGeometry args={[Math.min(width, height) * .16, 14]} />
        <meshStandardMaterial color="#aa865c" roughness={.94} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * width * .13, .055, .091]} rotation={[0, 0, side * .45]}>
          <circleGeometry args={[Math.min(width, height) * .09, 10]} />
          <meshStandardMaterial color="#806044" roughness={.94} />
        </mesh>
      ))}
      <mesh position={[0, -height * .22, .09]}>
        <planeGeometry args={[width * .3, height * .28]} />
        <meshStandardMaterial color="#ad8a61" roughness={.94} />
      </mesh>
    </group>
  )
}

function TextArt({ width, height }: { width: number; height: number }) {
  return (
    <group name="WallGallery_TextArt">
      <mesh position={[0, 0, .082]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#eee7d6" roughness={.91} />
      </mesh>
      {[.045, .015, -.015, -.045].map((y, index) => (
        <mesh key={y} position={[index % 2 ? -.012 : 0, y, .09]}>
          <planeGeometry args={[width * (index === 2 ? .52 : .68), .008]} />
          <meshStandardMaterial color="#6f6255" roughness={.88} />
        </mesh>
      ))}
    </group>
  )
}

function RectFrame({
  name,
  position,
  rotation = 0,
  size,
  frameColor,
  art,
}: {
  name: string
  position: V3
  rotation?: number
  size: readonly [number, number]
  frameColor: string
  art: ReactNode
}) {
  const [width, height] = size
  const rim = Math.min(width, height) * .12
  return (
    <group name={name} position={position} rotation={[0, 0, rotation]}>
      <RoundedBox args={[width, height, .055]} position={[0, 0, 0]} radius={.016} smoothness={2} receiveShadow>
        <meshStandardMaterial color="#3b2a21" roughness={.66} />
      </RoundedBox>
      <RoundedBox args={[width - rim * 1.25, height - rim * 1.25, .035]} position={[0, 0, .038]} radius={.008} smoothness={2}>
        <meshStandardMaterial color="#d7c9b7" roughness={.87} />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <mesh key={`v-${side}`} position={[side * (width - rim) * .5, 0, .067]}>
          <boxGeometry args={[rim, height, .055]} />
          <meshPhysicalMaterial color={frameColor} roughness={.46} clearcoat={.22} clearcoatRoughness={.36} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`h-${side}`} position={[0, side * (height - rim) * .5, .068]}>
          <boxGeometry args={[width - rim * 1.35, rim, .058]} />
          <meshPhysicalMaterial color={frameColor} roughness={.46} clearcoat={.22} clearcoatRoughness={.36} />
        </mesh>
      ))}
      {art}
    </group>
  )
}

function OvalFrame({
  name,
  position,
  size,
  art,
}: {
  name: string
  position: V3
  size: readonly [number, number]
  art: ReactNode
}) {
  const [width, height] = size
  return (
    <group name={name} position={position}>
      <mesh position={[0, 0, .035]} scale={[width / 2.28, height / 2.28, .28]}>
        <torusGeometry args={[1, .14, 10, 28]} />
        <meshPhysicalMaterial color="#b9994d" roughness={.32} metalness={.5} clearcoat={.2} />
      </mesh>
      <mesh position={[0, 0, .02]} scale={[width * .38, height * .38, 1]}>
        <circleGeometry args={[1, 28]} />
        <meshStandardMaterial color="#d8c7a4" roughness={.84} />
      </mesh>
      {art}
    </group>
  )
}

/** 窗户与蓝色墙面收纳板之间的复古迷你挂画组合。 */
export default function ProceduralWallGallery() {
  return (
    <group name="ProceduralWallGallery" position={[-1.72, 2.83, -2.66]} scale={1.55}>
      <RectFrame
        name="WallGallery_CentralPhotoBooth"
        position={[.07, .14, .01]}
        size={[.45, .5]}
        frameColor="#75401f"
        art={<PhotoBoothArt width={.3} height={.35} />}
      />
      <OvalFrame
        name="WallGallery_TopLeftOval"
        position={[-.3, .37, .015]}
        size={[.25, .31]}
        art={<PortraitArt width={.16} height={.22} oval />}
      />
      <RectFrame
        name="WallGallery_TopRightPortrait"
        position={[.41, .38, .018]}
        rotation={.018}
        size={[.23, .32]}
        frameColor="#76421f"
        art={<PortraitArt width={.14} height={.22} red />}
      />
      <RectFrame
        name="WallGallery_BottomLeftDog"
        position={[-.32, -.15, .012]}
        rotation={-.012}
        size={[.29, .36]}
        frameColor="#6c341e"
        art={<DogArt width={.18} height={.24} />}
      />
      <OvalFrame
        name="WallGallery_RightLandscape"
        position={[.4, -.1, .02]}
        size={[.23, .31]}
        art={<LandscapeArt width={.15} height={.22} oval />}
      />
      <RectFrame
        name="WallGallery_BottomText"
        position={[.08, -.3, .025]}
        rotation={-.015}
        size={[.34, .2]}
        frameColor="#7b251f"
        art={<TextArt width={.23} height={.11} />}
      />
    </group>
  )
}
