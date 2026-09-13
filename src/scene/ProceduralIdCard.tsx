import { RoundedBox } from '@react-three/drei'
import SceneHotspotTarget from './SceneHotspotTarget'

const TEXT_LINES = [
  { y: .105, long: true },
  { y: .035, long: true },
  { y: -.035, long: true },
  { y: -.105, long: false },
]

export default function ProceduralIdCard() {
  return (
    <SceneHotspotTarget
      id="about"
      name="IdCard_AboutTarget"
      position={[1.28, 2.38, .7]}
      scale={1.4}
      anchorOffset={[0, -.36, .06]}
      rotation={[0, .04, -.085]}
      hoverScale={1.035}
    >
      <group name="ProceduralIdCard">
        <RoundedBox name="IdCard_PinkStrap" args={[.09, .28, .045]} position={[0, -.04, -.045]} radius={.036} smoothness={3} castShadow>
          <meshPhysicalMaterial color="#d95e86" roughness={.38} clearcoat={.26} />
        </RoundedBox>
        <mesh name="IdCard_StrapLoop" position={[0, .075, -.04]}>
          <torusGeometry args={[.055, .018, 8, 18]} />
          <meshStandardMaterial color="#c84772" roughness={.44} />
        </mesh>
        <mesh name="IdCard_MetalRing" position={[0, -.13, -.016]} castShadow>
          <torusGeometry args={[.045, .012, 8, 18]} />
          <meshStandardMaterial color="#c8b58d" roughness={.26} metalness={.56} />
        </mesh>

        <group name="IdCard_Card" position={[0, -.36, 0]}>
          <RoundedBox name="IdCard_Back" args={[.56, .4, .055]} radius={.035} smoothness={3} castShadow receiveShadow>
            <meshPhysicalMaterial color="#d8c5a1" roughness={.5} clearcoat={.12} />
          </RoundedBox>
          <RoundedBox name="IdCard_Face" args={[.535, .365, .025]} position={[0, -.008, .037]} radius={.025} smoothness={3}>
            <meshStandardMaterial color="#e6d6b8" roughness={.58} />
          </RoundedBox>
          <RoundedBox name="IdCard_Header" args={[.55, .105, .045]} position={[0, .153, .052]} radius={.026} smoothness={3} castShadow>
            <meshPhysicalMaterial color="#dca382" roughness={.43} clearcoat={.2} />
          </RoundedBox>

          {TEXT_LINES.map((line, row) => (
            <group key={row} name={`IdCard_TextRow_${row + 1}`} position={[-.135, line.y - .035, .058]}>
              <RoundedBox args={[line.long ? .17 : .15, .035, .015]} position={[-.045, 0, 0]} radius={.012} smoothness={2} castShadow>
                <meshStandardMaterial color="#eee9dc" roughness={.66} />
              </RoundedBox>
              <RoundedBox args={[.075, .035, .015]} position={[.09, 0, 0]} radius={.012} smoothness={2} castShadow>
                <meshStandardMaterial color="#eee9dc" roughness={.66} />
              </RoundedBox>
            </group>
          ))}

          <RoundedBox name="IdCard_PortraitPanel" args={[.18, .235, .04]} position={[.16, -.025, .059]} radius={.025} smoothness={3} castShadow>
            <meshPhysicalMaterial color="#45a8d4" roughness={.38} clearcoat={.28} />
          </RoundedBox>
          <mesh name="IdCard_AvatarHead" position={[.16, .035, .09]} scale={[.043, .043, .022]} castShadow>
            <sphereGeometry args={[1, 16, 12]} />
            <meshStandardMaterial color="#d9ddd5" roughness={.52} />
          </mesh>
          <RoundedBox name="IdCard_AvatarBody" args={[.095, .1, .025]} position={[.16, -.075, .09]} radius={.028} smoothness={3} castShadow>
            <meshStandardMaterial color="#d9ddd5" roughness={.52} />
          </RoundedBox>
        </group>
      </group>
    </SceneHotspotTarget>
  )
}
