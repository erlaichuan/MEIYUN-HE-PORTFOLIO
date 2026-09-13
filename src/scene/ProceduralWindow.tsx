import { RoundedBox } from '@react-three/drei'

const WOOD = '#d5aa74'
const WOOD_LIGHT = '#e2bf8b'
const WOOD_DARK = '#ad7e4f'
const BLIND = '#dedbd4'

export default function ProceduralWindow() {
  return (
    <group name="ProceduralWindow" position={[-3.94, 2.78, -2.68]} scale={1.38}>
      <RoundedBox name="Window_BackRecess" args={[1.76, 1.76, .1]} radius={.075} smoothness={3} receiveShadow>
        <meshPhysicalMaterial color={WOOD} roughness={.54} clearcoat={.12} clearcoatRoughness={.38} />
      </RoundedBox>

      <RoundedBox name="Window_Glass" args={[1.4, 1.4, .035]} position={[0, -.01, .075]} radius={.018} smoothness={2} receiveShadow>
        <meshPhysicalMaterial color="#9bc9da" roughness={.2} clearcoat={.72} clearcoatRoughness={.1} transparent opacity={.82} />
      </RoundedBox>
      <mesh name="Window_GlassReflection" position={[.3, -.43, .1]} rotation={[0, 0, -.45]}>
        <planeGeometry args={[.025, .55]} />
        <meshBasicMaterial color="#d8f1f4" transparent opacity={.22} depthWrite={false} />
      </mesh>

      {[-.79, .79].map((x) => (
        <RoundedBox key={x} name={x < 0 ? 'Window_FrameLeft' : 'Window_FrameRight'} args={[.18, 1.72, .15]} position={[x, 0, .105]} radius={.045} smoothness={3} receiveShadow>
          <meshPhysicalMaterial color={WOOD_LIGHT} roughness={.48} clearcoat={.16} />
        </RoundedBox>
      ))}
      {[-.79, .79].map((y) => (
        <RoundedBox key={y} name={y < 0 ? 'Window_FrameBottom' : 'Window_FrameTop'} args={[1.72, .18, .15]} position={[0, y, .105]} radius={.045} smoothness={3} receiveShadow>
          <meshPhysicalMaterial color={WOOD_LIGHT} roughness={.48} clearcoat={.16} />
        </RoundedBox>
      ))}

      {[-.69, .69].map((x) => (
        <RoundedBox key={x} name="Window_InnerVerticalBevel" args={[.055, 1.43, .08]} position={[x, -.01, .155]} radius={.012} smoothness={2}>
          <meshStandardMaterial color={WOOD_DARK} roughness={.62} />
        </RoundedBox>
      ))}
      {[-.69, .69].map((y) => (
        <RoundedBox key={y} name="Window_InnerHorizontalBevel" args={[1.42, .055, .08]} position={[0, y, .155]} radius={.012} smoothness={2}>
          <meshStandardMaterial color={y < 0 ? WOOD_DARK : WOOD_LIGHT} roughness={.6} />
        </RoundedBox>
      ))}

      {Array.from({ length: 8 }, (_, index) => {
        const y = .5 - index * .105
        return (
          <RoundedBox
            key={index}
            name={`Window_Blind_${index + 1}`}
            args={[1.38, .072, .085]}
            position={[0, y, .22 + index * .003]}
            rotation={[.16, 0, 0]}
            radius={.018}
            smoothness={2}
          >
            <meshPhysicalMaterial color={index % 2 ? '#d5d2cb' : BLIND} roughness={.52} clearcoat={.08} />
          </RoundedBox>
        )
      })}

      <RoundedBox name="Window_BlindRoll" args={[1.45, .14, .145]} position={[0, .67, .24]} radius={.055} smoothness={4}>
        <meshPhysicalMaterial color="#e2dfd8" roughness={.45} clearcoat={.12} />
      </RoundedBox>
      <mesh name="Window_BlindRollCap" position={[.715, .67, .24]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[.07, .07, .035, 18]} />
        <meshStandardMaterial color="#c7c3bc" roughness={.55} />
      </mesh>

      {[-.5, .48].map((x) => (
        <mesh key={x} name="Window_LadderCord" position={[x, .16, .285]}>
          <cylinderGeometry args={[.009, .009, .88, 8]} />
          <meshStandardMaterial color="#cac6bd" roughness={.72} />
        </mesh>
      ))}

      <mesh name="Window_PullCord" position={[.64, .05, .29]}>
        <cylinderGeometry args={[.008, .008, 1.06, 8]} />
        <meshStandardMaterial color="#d4d0c8" roughness={.72} />
      </mesh>
      <mesh name="Window_PullWeight" position={[.64, -.54, .29]} scale={[.055, .1, .035]}>
        <capsuleGeometry args={[1, 1.05, 5, 10]} />
        <meshPhysicalMaterial color="#dedbd4" roughness={.48} clearcoat={.1} />
      </mesh>
    </group>
  )
}
