import { RoundedBox } from '@react-three/drei'

type V3 = readonly [number, number, number]

const BLUE = '#4d91bd'
const BLUE_LIGHT = '#65a8d0'
const BLUE_DARK = '#306d96'

function Pocket({ name, position, size }: { name: string; position: V3; size: V3 }) {
  const [width, height, depth] = size
  const wall = Math.min(.05, width * .1)
  const frontHeight = height * .78
  const frontY = -(height - frontHeight) / 2
  const frontZ = depth / 2 + .025
  const rimY = -height / 2 + frontHeight

  return (
    <group name={name} position={position}>
      <RoundedBox
        name={`${name}_BackLiner`}
        args={[width - wall * .7, height - wall * .7, .035]}
        position={[0, 0, -depth / 2 + .018]}
        radius={.045}
        smoothness={2}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={BLUE_DARK} roughness={.42} metalness={.04} />
      </RoundedBox>

      <RoundedBox
        name={`${name}_Front`}
        args={[width, frontHeight, .055]}
        position={[0, frontY, frontZ]}
        radius={.05}
        smoothness={2}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial color={BLUE_LIGHT} roughness={.28} clearcoat={.55} clearcoatRoughness={.24} />
      </RoundedBox>

      <RoundedBox
        name={`${name}_LeftWall`}
        args={[wall, height * .92, depth]}
        position={[-width / 2 + wall / 2, -height * .02, 0]}
        radius={.025}
        smoothness={2}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial color={BLUE_LIGHT} roughness={.3} clearcoat={.45} clearcoatRoughness={.28} />
      </RoundedBox>

      <RoundedBox
        name={`${name}_RightWall`}
        args={[wall, height * .92, depth]}
        position={[width / 2 - wall / 2, -height * .02, 0]}
        radius={.025}
        smoothness={2}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial color={BLUE_LIGHT} roughness={.3} clearcoat={.45} clearcoatRoughness={.28} />
      </RoundedBox>

      <RoundedBox
        name={`${name}_Bottom`}
        args={[width - wall * .5, .045, depth]}
        position={[0, -height / 2 + .023, 0]}
        radius={.02}
        smoothness={2}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={BLUE_DARK} roughness={.4} metalness={.04} />
      </RoundedBox>

      <RoundedBox name={`${name}_Opening`} args={[width * .84, .032, .022]} position={[0, rimY, frontZ + .034]} radius={.012} smoothness={2}>
        <meshStandardMaterial color={BLUE_DARK} roughness={.58} />
      </RoundedBox>
    </group>
  )
}

function Rod({ name, position, height, color, rotation = [0, 0, 0] }: { name: string; position: V3; height: number; color: string; rotation?: V3 }) {
  return (
    <mesh name={name} position={position} rotation={rotation} castShadow>
      <cylinderGeometry args={[.025, .025, height, 10]} />
      <meshStandardMaterial color={color} roughness={.46} metalness={color === '#c8ced1' ? .72 : .04} />
    </mesh>
  )
}

function Spoon({ x, y, rotation = 0 }: { x: number; y: number; rotation?: number }) {
  return (
    <group position={[x, y, .24]} rotation={[0, 0, rotation]}>
      <Rod name="Organizer_SpoonHandle" position={[0, -.13, 0]} height={.28} color="#dedbd3" />
      <mesh name="Organizer_SpoonBowl" position={[0, .075, 0]} scale={[.075, .12, .025]} castShadow>
        <sphereGeometry args={[1, 14, 10]} />
        <meshPhysicalMaterial color="#e8e4dc" roughness={.3} clearcoat={.42} />
      </mesh>
    </group>
  )
}

function Pencil({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <group position={[x, y, .06]}>
      <Rod name="Organizer_Pencil" position={[0, 0, 0]} height={.48} color={color} />
      <mesh position={[0, .265, 0]} castShadow>
        <coneGeometry args={[.027, .08, 8]} />
        <meshStandardMaterial color="#d8b47a" roughness={.65} />
      </mesh>
      <mesh position={[0, .306, 0]} castShadow>
        <coneGeometry args={[.012, .025, 8]} />
        <meshStandardMaterial color="#303338" roughness={.55} />
      </mesh>
    </group>
  )
}

export default function ProceduralWallOrganizer() {
  return (
    <group name="ProceduralWallOrganizer" position={[1.25, 2.72, -2.66]}>
      <RoundedBox name="Organizer_BackPanel" args={[3.2, 2.7, .11]} radius={.085} smoothness={3} castShadow receiveShadow>
        <meshPhysicalMaterial color={BLUE} roughness={.3} clearcoat={.5} clearcoatRoughness={.27} />
      </RoundedBox>

      {[
        [-1.47, 1.2], [1.47, 1.2], [-1.47, -1.2], [1.47, -1.2],
      ].map(([x, y], index) => (
        <group key={index} position={[x, y, .075]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[.045, .045, .028, 16]} />
            <meshStandardMaterial color="#aab2b5" roughness={.22} metalness={.72} />
          </mesh>
          <mesh position={[0, 0, .018]}>
            <boxGeometry args={[.008, .05, .01]} />
            <meshStandardMaterial color="#4f585c" roughness={.4} metalness={.5} />
          </mesh>
        </group>
      ))}

      <Pocket name="Organizer_PocketSpoons" position={[-1.14, .84, .17]} size={[.56, .58, .22]} />
      <Spoon x={-1.32} y={1.22} rotation={-.32} />
      <Spoon x={-1.18} y={1.25} rotation={-.1} />
      <Spoon x={-1.02} y={1.25} rotation={.12} />
      <Spoon x={-.87} y={1.2} rotation={.34} />

      <Pocket name="Organizer_PocketSquareTop" position={[-.38, .78, .15]} size={[.56, .55, .18]} />
      <mesh name="Organizer_FoldedPaper" position={[-.53, 1.18, .24]} rotation={[0, 0, -.18]} castShadow>
        <coneGeometry args={[.12, .28, 3]} />
        <meshPhysicalMaterial color="#d9d9d5" roughness={.32} metalness={.12} clearcoat={.25} />
      </mesh>

      <Pocket name="Organizer_PocketTiny" position={[
        .35, .91, .15,
      ]} size={[.38, .34, .2]} />
      <mesh name="Organizer_CatHead" position={[.35, 1.18, .23]} scale={[.09, .085, .055]} castShadow>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#6b6259" roughness={.68} />
      </mesh>

      <Pocket name="Organizer_PocketEnvelope" position={[1.05, .86, .15]} size={[.78, .4, .2]} />
      <RoundedBox name="Organizer_NotebookNavy" args={[.56, .39, .04]} position={[1.04, 1.13, .18]} rotation={[0, 0, .04]} radius={.015} smoothness={2} castShadow>
        <meshStandardMaterial color="#17264f" roughness={.5} />
      </RoundedBox>
      <RoundedBox name="Organizer_NoteYellow" args={[.34, .25, .025]} position={[.92, 1.08, .22]} radius={.012} smoothness={2} castShadow>
        <meshStandardMaterial color="#e9cd62" roughness={.7} />
      </RoundedBox>

      <Pocket name="Organizer_PocketRulers" position={[-1.29, .13, .16]} size={[.52, .68, .2]} />
      {[-1.42, -1.35, -1.28].map((x, index) => (
        <Rod key={index} name={`Organizer_Ruler_${index + 1}`} position={[x, .62, .23]} height={.7} color={index === 1 ? '#d69b2d' : '#b97c27'} rotation={[0, 0, -.16]} />
      ))}
      <RoundedBox name="Organizer_PhotoStrip" args={[.2, .53, .02]} position={[-1.1, .53, .24]} radius={.01} smoothness={1} castShadow>
        <meshStandardMaterial color="#e7e3dc" roughness={.7} />
      </RoundedBox>
      {[.68, .51, .34].map((y) => (
        <mesh key={y} position={[-1.1, y, .256]}>
          <circleGeometry args={[.045, 10]} />
          <meshStandardMaterial color="#363638" roughness={.72} />
        </mesh>
      ))}

      <Pocket name="Organizer_PocketCenter" position={[.34, .13, .17]} size={[.6, .65, .23]} />
      {[-.05, .09].map((x, index) => (
        <Rod key={index} name={`Organizer_Chopstick_${index + 1}`} position={[x, .62, .25]} height={.7} color="#9e5d2d" rotation={[0, 0, index ? -.07 : .08]} />
      ))}
      {[.22, .29, .36].map((x, index) => (
        <mesh key={index} name={`Organizer_WhiskLoop_${index + 1}`} position={[x, .7, .25]} rotation={[0, 0, (index - 1) * .13]} scale={[.12 + index * .018, .33, 1]}>
          <torusGeometry args={[.23, .012, 5, 18]} />
          <meshStandardMaterial color="#c8ced1" roughness={.22} metalness={.78} />
        </mesh>
      ))}
      <Rod name="Organizer_WhiskHandle" position={[.29, .28, .25]} height={.38} color="#34393c" />

      <group name="Organizer_Scissors" position={[.8, .32, .25]} rotation={[0, 0, -.15]}>
        {[-.1, .1].map((x) => (
          <mesh key={x} position={[x, .18, 0]}>
            <torusGeometry args={[.1, .028, 8, 20]} />
            <meshPhysicalMaterial color="#df6e25" roughness={.38} clearcoat={.22} />
          </mesh>
        ))}
        <RoundedBox args={[.065, .53, .03]} position={[-.05, -.14, 0]} rotation={[0, 0, -.14]} radius={.008} smoothness={1} castShadow>
          <meshStandardMaterial color="#aeb6b8" roughness={.22} metalness={.75} />
        </RoundedBox>
        <RoundedBox args={[.065, .53, .03]} position={[.05, -.14, 0]} rotation={[0, 0, .14]} radius={.008} smoothness={1} castShadow>
          <meshStandardMaterial color="#aeb6b8" roughness={.22} metalness={.75} />
        </RoundedBox>
      </group>

      <Pocket name="Organizer_PocketTimer" position={[1.28, -.05, .17]} size={[.48, .7, .22]} />
      <group name="Organizer_Timer" position={[1.27, .34, .25]}>
        <mesh scale={[.18, .2, .08]} castShadow>
          <sphereGeometry args={[1, 18, 12]} />
          <meshPhysicalMaterial color="#e6ae22" roughness={.34} clearcoat={.38} />
        </mesh>
        {[-.07, 0, .07].flatMap((x) => [-.05, .04].map((y) => (
          <mesh key={`${x}-${y}`} position={[x, y, .085]}>
            <circleGeometry args={[.012, 8]} />
            <meshStandardMaterial color="#2b2b29" roughness={.55} />
          </mesh>
        )))}
      </group>

      <Pocket name="Organizer_PocketStrainer" position={[-.45, -.13, .16]} size={[.56, .44, .2]} />
      <group name="Organizer_Strainer" position={[-.45, .18, .25]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[.18, .18, .035, 24]} />
          <meshStandardMaterial color="#aeb7ba" roughness={.3} metalness={.65} wireframe />
        </mesh>
        <Rod name="Organizer_StrainerHandle" position={[0, .2, 0]} height={.22} color="#c8ced1" />
      </group>

      <Pocket name="Organizer_PocketPlates" position={[.5, -.52, .16]} size={[.73, .3, .19]} />
      <mesh name="Organizer_PlatePink" position={[.38, -.3, .23]} scale={[.26, .26, .04]} castShadow>
        <sphereGeometry args={[1, 18, 10]} />
        <meshStandardMaterial color="#d7a6a0" roughness={.48} />
      </mesh>
      <mesh name="Organizer_PlateRed" position={[.65, -.28, .21]} scale={[.23, .23, .04]} castShadow>
        <sphereGeometry args={[1, 18, 10]} />
        <meshStandardMaterial color="#a93627" roughness={.44} />
      </mesh>

      <group name="Organizer_PencilCups" position={[-1.13, -.68, .16]}>
        {[-.22, 0, .22].map((x) => (
          <Pocket key={x} name={`Organizer_PencilCup_${x}`} position={[x, 0, 0]} size={[.22, .42, .2]} />
        ))}
        <Pencil x={-.22} y={.33} color="#e7bd28" />
        <Pencil x={0} y={.34} color="#315d98" />
        <Pencil x={.2} y={.33} color="#b9342f" />
      </group>

      <Pocket name="Organizer_PocketBottomLeft" position={[-1.05, -1.05, .15]} size={[.78, .31, .18]} />
      <RoundedBox name="Organizer_RedTool" args={[.56, .07, .045]} position={[-1.05, -.97, .23]} rotation={[0, 0, -.25]} radius={.02} smoothness={2} castShadow>
        <meshStandardMaterial color="#a8242d" roughness={.42} />
      </RoundedBox>

      <Pocket name="Organizer_PocketBottomCenter" position={[-.13, -1.02, .16]} size={[.75, .43, .2]} />
      <group name="Organizer_Flashlight" position={[-.12, -.8, .26]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[.07, .07, .46, 16]} />
          <meshStandardMaterial color="#22272a" roughness={.46} metalness={.2} />
        </mesh>
        <mesh position={[0, .25, 0]} castShadow>
          <cylinderGeometry args={[.11, .08, .12, 16]} />
          <meshStandardMaterial color="#161a1c" roughness={.42} />
        </mesh>
      </group>

      <Pocket name="Organizer_PocketBottomRight" position={[1.05, -1.02, .16]} size={[.44, .38, .2]} />
      <Rod name="Organizer_MeasuringSpoonHandle" position={[1.05, -.71, .25]} height={.42} color="#c8ced1" />
      <mesh name="Organizer_MeasuringSpoonBowl" position={[1.05, -.47, .25]} scale={[.09, .12, .025]} castShadow>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#bfc6c9" roughness={.22} metalness={.72} />
      </mesh>
    </group>
  )
}
