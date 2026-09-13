const CANOPY = [
  { position: [0, 1.35, 0] as const, scale: [.49, .49, .43] as const, color: '#5fa83d' },
  { position: [-.34, 1.08, .01] as const, scale: [.33, .36, .31] as const, color: '#559d38' },
  { position: [-.13, 1.02, .29] as const, scale: [.36, .34, .3] as const, color: '#62ad40' },
  { position: [.34, 1.09, .04] as const, scale: [.34, .37, .32] as const, color: '#67b145' },
  { position: [.07, 1.08, -.28] as const, scale: [.36, .34, .3] as const, color: '#4f9636' },
]

export default function ProceduralTreeDecor() {
  return (
    <group name="ProceduralTreeDecor" position={[3.98, .02, -.5]} rotation={[0, -.12, 0]}>
      <mesh name="TreeDecor_Base" position={[0, .055, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[.29, .29, .11, 28]} />
        <meshPhysicalMaterial color="#5a9d39" roughness={.48} clearcoat={.16} clearcoatRoughness={.34} />
      </mesh>
      <mesh name="TreeDecor_BaseLip" position={[0, .11, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[.255, .035, 10, 28]} />
        <meshStandardMaterial color="#68aa43" roughness={.54} />
      </mesh>
      <mesh name="TreeDecor_Trunk" position={[0, .49, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[.13, .2, .78, 20]} />
        <meshPhysicalMaterial color="#a74f31" roughness={.56} clearcoat={.08} clearcoatRoughness={.42} />
      </mesh>

      {CANOPY.map((part, index) => (
        <mesh
          key={index}
          name={`TreeDecor_Canopy_${index + 1}`}
          position={part.position}
          scale={part.scale}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[1, 22, 16]} />
          <meshPhysicalMaterial color={part.color} roughness={.5} clearcoat={.12} clearcoatRoughness={.38} />
        </mesh>
      ))}
    </group>
  )
}
