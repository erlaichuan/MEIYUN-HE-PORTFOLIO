import { RoundedBox } from '@react-three/drei'
import DetailFocusTarget from './DetailFocusTarget'
import { PngPlane } from './ScenePngProps'

const wood = '#4b2117'
const woodEdge = '#6f3823'
const trim = '#a87c4f'

function Rail({
  name,
  position,
  size,
  color = wood,
}: {
  name: string
  position: [number, number, number]
  size: [number, number, number]
  color?: string
}) {
  return (
    <RoundedBox name={name} args={size} position={position} radius={.014} smoothness={2} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={.58} metalness={.01} />
    </RoundedBox>
  )
}

export default function ProceduralPhotoFrame() {
  return (
    <DetailFocusTarget
      id="desktop-photo-frame"
      name="ProceduralPhotoFrame"
      position={[3.1, .5, .28]}
      rotation={[0, -.09, .025]}
      scale={.78}
      focusHeight={1.02}
    >
      <RoundedBox name="PhotoFrame_BackBoard" args={[.75, .93, .075]} position={[0, 0, -.005]} radius={.018} smoothness={2} castShadow>
        <meshStandardMaterial color="#6b4938" roughness={.78} />
      </RoundedBox>

      <PngPlane
        name="PhotoFrame_Artwork"
        url="/assets/objects/desktop_photo-frame.png"
        aspect={631 / 780}
        width={.7}
        position={[0, 0, .042]}
        renderOrder={3}
        tint="#ead8c7"
      />

      <Rail name="PhotoFrame_LeftRail" position={[-.35, 0, .06]} size={[.075, .92, .09]} />
      <Rail name="PhotoFrame_RightRail" position={[.35, 0, .06]} size={[.075, .92, .09]} />
      <Rail name="PhotoFrame_TopRail" position={[0, .43, .064]} size={[.75, .075, .095]} color={woodEdge} />
      <Rail name="PhotoFrame_BottomRail" position={[0, -.43, .064]} size={[.75, .075, .095]} color={woodEdge} />

      <Rail name="PhotoFrame_LeftTrim" position={[-.302, 0, .111]} size={[.014, .79, .014]} color={trim} />
      <Rail name="PhotoFrame_RightTrim" position={[.302, 0, .111]} size={[.014, .79, .014]} color={trim} />
      <Rail name="PhotoFrame_TopTrim" position={[0, .382, .111]} size={[.61, .014, .014]} color={trim} />
      <Rail name="PhotoFrame_BottomTrim" position={[0, -.382, .111]} size={[.61, .014, .014]} color={trim} />

      <mesh name="PhotoFrame_Glass" position={[0, 0, .052]} renderOrder={4}>
        <planeGeometry args={[.59, .75]} />
        <meshPhysicalMaterial
          color="#fff4e4"
          transparent
          opacity={.045}
          roughness={.08}
          clearcoat={1}
          clearcoatRoughness={.06}
          depthWrite={false}
        />
      </mesh>

      <mesh name="PhotoFrame_BackStand" position={[0, -.18, -.14]} rotation={[-.28, 0, 0]} castShadow>
        <boxGeometry args={[.2, .58, .045]} />
        <meshStandardMaterial color="#4e3428" roughness={.82} />
      </mesh>
    </DetailFocusTarget>
  )
}
