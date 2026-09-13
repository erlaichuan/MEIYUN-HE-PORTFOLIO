import { RoundedBox } from '@react-three/drei'

type BookSpec = {
  color: string
  height: number
  lean: number
  titleColor: string
  x: number
  yaw: number
}

const BOOKS: readonly BookSpec[] = [
  { x: -.22, height: .78, color: '#aa4939', titleColor: '#d9b26b', lean: .015, yaw: -.02 },
  { x: -.11, height: .75, color: '#d8b85b', titleColor: '#563a25', lean: -.008, yaw: .015 },
  { x: 0, height: .74, color: '#899178', titleColor: '#282821', lean: .012, yaw: -.01 },
  { x: .11, height: .79, color: '#62788a', titleColor: '#d8d5c7', lean: -.018, yaw: .018 },
  { x: .22, height: .77, color: '#3f4849', titleColor: '#191b1b', lean: -.08, yaw: .025 },
]

function UprightBook({ book, index }: { book: BookSpec; index: number }) {
  const width = .105
  const depth = .42
  const pageHeight = book.height - .052

  return (
    <group
      name={`DeskBook_${index + 1}`}
      position={[book.x, 0, 0]}
      rotation={[0, book.yaw, book.lean]}
    >
      <RoundedBox
        name={`DeskBook_${index + 1}_Pages`}
        args={[width - .026, pageHeight, depth - .045]}
        position={[0, pageHeight * .5 + .017, -.004]}
        radius={.009}
        smoothness={2}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#d8d1bd" roughness={.9} />
      </RoundedBox>

      {[-1, 1].map((side) => (
        <RoundedBox
          key={side}
          name={`DeskBook_${index + 1}_${side < 0 ? 'LeftCover' : 'RightCover'}`}
          args={[.014, book.height, depth]}
          position={[side * width * .5, book.height * .5, 0]}
          radius={.006}
          smoothness={2}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial color={book.color} roughness={.67} clearcoat={.04} clearcoatRoughness={.5} />
        </RoundedBox>
      ))}

      <RoundedBox
        name={`DeskBook_${index + 1}_Spine`}
        args={[width + .012, book.height, .035]}
        position={[0, book.height * .5, depth * .5]}
        radius={.012}
        smoothness={3}
        castShadow
      >
        <meshPhysicalMaterial color={book.color} roughness={.64} clearcoat={.045} clearcoatRoughness={.5} />
      </RoundedBox>

      <group name={`DeskBook_${index + 1}_SpineTitle`} position={[0, book.height * .56, depth * .5 + .021]}>
        {[0, .043, .086, .129].map((offset, markIndex) => (
          <mesh key={offset} position={[markIndex % 2 ? .008 : -.005, -offset, 0]} castShadow>
            <boxGeometry args={[markIndex === 3 ? .045 : .057, .012, .006]} />
            <meshStandardMaterial color={book.titleColor} roughness={.72} />
          </mesh>
        ))}
      </group>

      <group name={`DeskBook_${index + 1}_PageRidges`} position={[0, book.height - .02, -.01]}>
        {[-.095, 0, .095].map((z) => (
          <mesh key={z} position={[0, 0, z]}>
            <boxGeometry args={[width - .033, .006, .045]} />
            <meshStandardMaterial color="#bdb59f" roughness={.95} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** 评论标记处的五本窄幅布面硬壳书。 */
export default function ProceduralBookSet() {
  return (
    <group name="ProceduralBookSet" position={[-.48, .025, .47]} rotation={[0, -.025, 0]}>
      {BOOKS.map((book, index) => (
        <UprightBook key={book.color} book={book} index={index} />
      ))}
    </group>
  )
}
