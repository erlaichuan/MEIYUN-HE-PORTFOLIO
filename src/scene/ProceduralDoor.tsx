import { RoundedBox } from '@react-three/drei'

function RecessedPanel({ name, y, width, height }: { name: string; y: number; width: number; height: number }) {
  const outerWidth = width + .13
  const outerHeight = height + .13
  return (
    <group name={name} position={[0, y, .105]}>
      <mesh receiveShadow>
        <boxGeometry args={[width, height, .03]} />
        <meshStandardMaterial color="#6f0c0e" roughness={.69} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={`v-${side}`} position={[side * outerWidth * .5, 0, .035]} castShadow>
          <boxGeometry args={[.055, outerHeight, .055]} />
          <meshStandardMaterial color="#8f1819" roughness={.62} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`h-${side}`} position={[0, side * outerHeight * .5, .035]} castShadow>
          <boxGeometry args={[outerWidth, .055, .055]} />
          <meshStandardMaterial color="#861214" roughness={.64} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`iv-${side}`} position={[side * width * .5, 0, .065]} castShadow>
          <boxGeometry args={[.025, height, .035]} />
          <meshStandardMaterial color="#9b1b1d" roughness={.58} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`ih-${side}`} position={[0, side * height * .5, .065]} castShadow>
          <boxGeometry args={[width, .025, .035]} />
          <meshStandardMaterial color="#9b1b1d" roughness={.58} />
        </mesh>
      ))}
    </group>
  )
}

export default function ProceduralDoor() {
  return (
    /* 门框左缘 x≈4.62，桌面右缘 x=4.4；保留约 0.22 的开启净距。 */
    <group name="ProceduralDoor" position={[5.95, 0.63, -2.7]} scale={[1.12, 1.32, 1]}>
      <RoundedBox name="Door_FrameBack" args={[2.38, 4.5, .16]} position={[0, 0, -.08]} radius={.025} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial color="#4f090b" roughness={.76} />
      </RoundedBox>
      <RoundedBox name="Door_Leaf" args={[2.12, 4.25, .18]} position={[0, -.03, .025]} radius={.025} smoothness={2} castShadow receiveShadow>
        <meshPhysicalMaterial color="#790d10" roughness={.58} clearcoat={.08} clearcoatRoughness={.46} />
      </RoundedBox>

      {[-1.12, 1.12].map((x) => (
        <mesh key={x} name={x < 0 ? 'Door_FrameLeft' : 'Door_FrameRight'} position={[x, 0, .075]} castShadow>
          <boxGeometry args={[.14, 4.48, .19]} />
          <meshStandardMaterial color="#641012" roughness={.66} />
        </mesh>
      ))}
      <mesh name="Door_FrameTop" position={[0, 2.18, .075]} castShadow>
        <boxGeometry args={[2.38, .14, .19]} />
        <meshStandardMaterial color="#681113" roughness={.65} />
      </mesh>

      <RecessedPanel name="Door_UpperPanel" y={1.05} width={1.18} height={1.28} />
      <RecessedPanel name="Door_MiddlePanel" y={-.36} width={1.18} height={.4} />
      <RecessedPanel name="Door_LowerPanel" y={-1.38} width={1.16} height={.9} />

      <group name="Door_Peephole" position={[0, 1.08, .22]}>
        <mesh castShadow>
          <torusGeometry args={[.055, .018, 10, 20]} />
          <meshStandardMaterial color="#43626a" metalness={.72} roughness={.34} />
        </mesh>
        <mesh position={[0, 0, -.005]}>
          <circleGeometry args={[.045, 20]} />
          <meshPhysicalMaterial color="#89a6a8" metalness={.35} roughness={.24} clearcoat={.7} />
        </mesh>
        <mesh position={[0, 0, .012]}>
          <circleGeometry args={[.014, 14]} />
          <meshStandardMaterial color="#1b2426" roughness={.4} />
        </mesh>
      </group>

      <group name="Door_Handle" position={[-.82, -.42, .23]}>
        <mesh castShadow>
          <torusGeometry args={[.105, .028, 10, 22]} />
          <meshStandardMaterial color="#3e7478" metalness={.62} roughness={.3} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[.08, .09, .08, 20]} />
          <meshStandardMaterial color="#4d898b" metalness={.58} roughness={.27} />
        </mesh>
        <RoundedBox args={[.16, .04, .035]} position={[.015, 0, .092]} rotation={[0, 0, .08]} radius={.012} smoothness={2} castShadow>
          <meshStandardMaterial color="#8ab1ab" metalness={.55} roughness={.26} />
        </RoundedBox>
      </group>

      <group name="Door_Lock" position={[-.82, -.72, .225]}>
        <mesh castShadow>
          <torusGeometry args={[.072, .021, 10, 20]} />
          <meshStandardMaterial color="#37686d" metalness={.68} roughness={.31} />
        </mesh>
        <mesh position={[0, 0, .008]}>
          <circleGeometry args={[.06, 20]} />
          <meshStandardMaterial color="#4f8588" metalness={.58} roughness={.32} />
        </mesh>
        <mesh position={[0, -.005, .02]}>
          <boxGeometry args={[.012, .055, .012]} />
          <meshStandardMaterial color="#20383a" metalness={.4} roughness={.45} />
        </mesh>
      </group>
    </group>
  )
}
