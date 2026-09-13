import { RoundedBox } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

function useHerringboneFloorTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const context = canvas.getContext('2d')
    if (!context) return new CanvasTexture(canvas)

    context.fillStyle = '#c99658'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.lineWidth = 4
    context.strokeStyle = 'rgba(104, 65, 31, .23)'

    const span = 128
    for (let row = -1; row < 6; row += 1) {
      for (let column = -1; column < 6; column += 1) {
        const x = column * span
        const y = row * span
        context.beginPath()
        context.moveTo(x, y + span)
        context.lineTo(x + span, y)
        context.lineTo(x + span * 2, y + span)
        context.stroke()
        context.beginPath()
        context.moveTo(x + span, y)
        context.lineTo(x + span, y + span)
        context.stroke()
      }
    }

    context.lineWidth = 2
    context.strokeStyle = 'rgba(255, 225, 174, .22)'
    for (let index = -4; index < 12; index += 1) {
      context.beginPath()
      context.moveTo(index * 64, 0)
      context.lineTo(index * 64 + 512, 512)
      context.stroke()
    }

    const output = new CanvasTexture(canvas)
    output.colorSpace = SRGBColorSpace
    output.wrapS = RepeatWrapping
    output.wrapT = RepeatWrapping
    // Extended floor coverage, preserving the original plank texture density.
    output.repeat.set(7.6, 9.7714)
    return output
  }, [])

  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

const WOOD = '#bd8547'
const WOOD_EDGE = '#a56b33'

/** 参考图中的浅木桌、暖白墙面与人字纹木地板。 */
export default function DeskSurface() {
  const floorTexture = useHerringboneFloorTexture()

  return (
    <group name="DeskSurface">
      <mesh name="Room_Floor" position={[0, -2.34, 2.35]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 36]} />
        <meshStandardMaterial map={floorTexture} color="#d4a56c" roughness={0.88} metalness={0} />
      </mesh>

      <mesh name="Room_BackWall" position={[0, 2.55, -2.82]} receiveShadow>
        <planeGeometry args={[24, 9.6]} />
        <meshStandardMaterial color="#d8c9ba" roughness={0.99} metalness={0} />
      </mesh>

      <mesh name="Room_Baseboard" position={[0, -2.12, -2.72]} castShadow receiveShadow>
        <boxGeometry args={[20, 0.18, 0.12]} />
        <meshStandardMaterial color="#b98a5d" roughness={0.86} />
      </mesh>

      <RoundedBox name="Desk_Top" args={[8.8, 0.2, 4.7]} position={[0, -0.1, 0]} radius={0.045} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial color={WOOD} roughness={0.72} metalness={0.01} />
      </RoundedBox>

      {[-1.48, -0.42, 0.66, 1.72].map((z) => (
        <mesh key={z} position={[0, 0.006, z]} receiveShadow>
          <boxGeometry args={[8.46, 0.009, 0.016]} />
          <meshStandardMaterial color="#d2a16a" roughness={0.9} />
        </mesh>
      ))}

      <RoundedBox name="Desk_FrontApron" args={[8.42, 0.2, 0.16]} position={[0, -0.25, 2.08]} radius={0.035} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial color={WOOD_EDGE} roughness={0.8} />
      </RoundedBox>

      {/* 参考图右侧的宽支撑板：圆形凹口是正视图中最显眼的桌体识别特征。 */}
      <RoundedBox name="Desk_PerforatedSupport" args={[1.35, 2.15, 0.22]} position={[2.2, -1.18, 1.35]} radius={0.035} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial color="#b77c3d" roughness={0.78} />
      </RoundedBox>
      {[-0.38, 0.38].flatMap((x) => [-0.72, -0.24, 0.24, 0.72].map((y) => (
        <mesh key={`${x}-${y}`} name="Desk_SupportHole" position={[2.2 + x, -1.18 + y, 1.472]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.025, 24]} />
          <meshStandardMaterial color="#76502f" roughness={0.96} />
        </mesh>
      )))}

      {[-3.62, 3.62].map((x) => (
        <RoundedBox key={x} name={x < 0 ? 'Desk_Leg_Left' : 'Desk_Leg_Right'} args={[0.2, 2.12, 0.28]} position={[x, -1.26, 0.62]} radius={0.035} smoothness={2} castShadow receiveShadow>
          <meshStandardMaterial color={WOOD_EDGE} roughness={0.8} />
        </RoundedBox>
      ))}

      {/* 保留桌面承载区域，但改成参考图中接近纸张的暖灰白色。 */}
      <RoundedBox name="Desk_Mat" args={[4.4, 0.012, 2.22]} position={[1.08, 0.012, 0.95]} radius={0.005} smoothness={2} receiveShadow>
        <meshStandardMaterial color="#d7cfb3" roughness={0.94} metalness={0} />
      </RoundedBox>
    </group>
  )
}
