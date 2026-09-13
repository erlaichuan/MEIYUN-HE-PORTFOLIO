import { RoundedBox } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  CanvasTexture,
  CatmullRomCurve3,
  DoubleSide,
  SRGBColorSpace,
  TubeGeometry,
  Vector3,
} from 'three'
import { useReducedMotion } from '../hooks/useReducedMotion'
import ProceduralIdCard from './ProceduralIdCard'
import { PngPlane } from './ScenePngProps'
import SceneHotspotTarget from './SceneHotspotTarget'
import ApplePeelSticker from './ApplePeelSticker'

function useCrtTexture() {
  const screen = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 720
    canvas.height = 480
    const ctx = canvas.getContext('2d')
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 4
    if (ctx) drawPixelGhost(ctx, 0)
    return { ctx, texture }
  }, [])
  const invalidate = useThree((state) => state.invalidate)
  const reduced = useReducedMotion()
  const lastFrame = useRef(-1)
  const textureRef = useRef(screen.texture)

  useEffect(() => {
    if (reduced) return
    // CRT 本身只需约 15fps；每个 tick 唤醒 demand frameloop 一帧，
    // 不把整个 Three 场景永久切回 always。
    const timer = window.setInterval(invalidate, 1000 / 15)
    return () => window.clearInterval(timer)
  }, [invalidate, reduced])

  useFrame(({ clock }) => {
    const ctx = screen.ctx
    if (!ctx) return
    const frame = reduced ? 0 : Math.floor(clock.elapsedTime * 15)
    if (frame === lastFrame.current) return
    lastFrame.current = frame
    drawPixelGhost(ctx, frame / 15)
    textureRef.current.needsUpdate = true
  })

  useEffect(() => () => screen.texture.dispose(), [screen])
  return screen.texture
}

/** 将 Uiverse 像素幽灵的网格、跳动、眼球和交替闪烁脚部重绘到 CRT 纹理。 */
function drawPixelGhost(ctx: CanvasRenderingContext2D, time: number) {
  const width = ctx.canvas.width
  const height = ctx.canvas.height
  const cell = 24
  const ghostWidth = cell * 14
  const left = Math.round((width - ghostWidth) / 2)
  const bob = Math.floor(time * 2) % 2 === 0 ? 0 : -10
  const top = 68 + bob

  ctx.fillStyle = '#11131b'
  ctx.fillRect(0, 0, width, height)

  const glow = ctx.createRadialGradient(width / 2, height * .42, 30, width / 2, height * .45, 280)
  glow.addColorStop(0, 'rgba(238, 48, 42, .18)')
  glow.addColorStop(1, 'rgba(238, 48, 42, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)

  // 阴影随 0.5 秒的跳动节奏同步收放。
  ctx.save()
  ctx.filter = 'blur(18px)'
  ctx.fillStyle = bob === 0 ? 'rgba(0, 0, 0, .48)' : 'rgba(0, 0, 0, .22)'
  ctx.beginPath()
  ctx.ellipse(width / 2, 423, bob === 0 ? 150 : 130, 24, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  const fillCells = (row: number, start: number, end: number, color = '#ef332f') => {
    ctx.fillStyle = color
    ctx.fillRect(left + start * cell, top + row * cell, (end - start + 1) * cell, cell)
  }
  ;[
    [0, 5, 8],
    [1, 3, 10],
    [2, 2, 11],
    [3, 1, 12],
    [4, 1, 12],
    [5, 1, 12],
    ...Array.from({ length: 6 }, (_, index) => [index + 6, 0, 13]),
  ].forEach(([row, start, end]) => fillCells(row, start, end))

  // 交替闪烁的像素裙摆，复现 flicker0 / flicker1。
  const phase = Math.floor(time * 2) % 2
  const feetA = phase === 0 ? [0, 1, 3, 5, 7, 8, 10, 12, 13] : [2, 4, 6, 9, 11]
  const feetB = phase === 0 ? [1, 3, 4, 6, 8, 9, 11, 13] : [0, 2, 5, 7, 10, 12]
  feetA.forEach((column) => fillCells(12, column, column))
  feetB.forEach((column) => fillCells(13, column, column))

  // 十字形白眼和每 3 秒横移一次的蓝色瞳孔。
  const pupilShift = Math.floor((time % 3) / 1.5) * 10
  const drawEye = (x: number) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(x + 10, top + 3 * cell, 20, 50)
    ctx.fillRect(x, top + 3 * cell + 10, 40, 30)
    ctx.fillStyle = '#2447ff'
    ctx.fillRect(x + 10 + pupilShift, top + 3 * cell + 20, 20, 20)
  }
  drawEye(left + cell * 2)
  drawEye(left + cell * 9)

  // 保留轻微扫描线，让像素动画仍属于这台老 CRT。
  ctx.fillStyle = 'rgba(0, 0, 0, .13)'
  for (let y = 0; y < height; y += 4) ctx.fillRect(0, y, width, 1)
}

function useCalendarTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 960
    canvas.height = 700
    const ctx = canvas.getContext('2d')
    if (!ctx) return new CanvasTexture(canvas)

    ctx.fillStyle = '#eee7d4'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#493829'
    ctx.font = '700 58px Georgia, serif'
    ctx.fillText('September', 56, 88)
    ctx.fillStyle = '#a06a39'
    ctx.font = '800 29px monospace'
    ctx.fillText('2026', 784, 84)
    ctx.strokeStyle = '#9b8165'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(55, 122)
    ctx.lineTo(905, 122)
    ctx.stroke()

    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    ctx.font = '700 22px monospace'
    ctx.textAlign = 'center'
    weekdays.forEach((day, index) => {
      ctx.fillStyle = index === 0 ? '#a2553e' : '#5e5448'
      ctx.fillText(day, 92 + index * 129, 176)
    })

    // 2026-09-01 是星期二，因此前两格留空；共五周，30 日为星期三。
    const dates: (number | null)[][] = [
      [null, null, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, null, null, null],
    ]
    ctx.font = '600 35px Georgia, serif'
    dates.forEach((week, row) => {
      week.forEach((date, column) => {
        if (date === null) return
        ctx.fillStyle = column === 0 ? '#a2553e' : '#352f29'
        ctx.fillText(String(date), 92 + column * 129, 250 + row * 93)
      })
    })
    ctx.textAlign = 'left'
    ctx.fillStyle = '#9e8c73'
    ctx.font = 'italic 20px Georgia, serif'
    ctx.fillText('late shift / archive desk', 58, 656)

    const output = new CanvasTexture(canvas)
    output.colorSpace = SRGBColorSpace
    output.anisotropy = 4
    return output
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

export default function DesktopProps() {
  return (
    <group name="DesktopProps">
      <CRTComputer />
      <FileOrganizer />
      <DeskCalendar />
      <Mug />
    </group>
  )
}

function CRTComputer() {
  const screen = useCrtTexture()
  const plastic = '#dcd8c8'
  const keyColors = ['#ded9ca', '#d8d3c5', '#d1ccbe', '#c9c4b8']
  return (
    <SceneHotspotTarget
      id="skills"
      name="CRTComputer"
      position={[1.15, 0.02, -0.48]}
      anchorOffset={[0, 1.3, .45]}
      hoverScale={1.012}
    >
      <RoundedBox
        name="CRT_Casing"
        args={[2.25, 2.08, 1.08]}
        position={[0, 1.22, -0.08]}
        radius={0.115}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial color={plastic} roughness={0.66} metalness={0.01} clearcoat={0.08} />
      </RoundedBox>
      <RoundedBox name="CRT_RearShell" args={[1.88, 1.62, 1.2]} position={[0.03, 1.43, -0.29]} radius={0.14} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color="#c8c3b4" roughness={0.76} />
      </RoundedBox>
      {[-0.72, 0.72].map((x) => (
        <RoundedBox key={x} name="CRT_TopShoulder" args={[0.62, 0.075, 0.7]} position={[x, 2.285, -0.12]} radius={0.035} smoothness={2} castShadow>
          <meshStandardMaterial color="#e3dfcf" roughness={0.65} />
        </RoundedBox>
      ))}
      <RoundedBox
        name="CRT_Bezel"
        args={[2.02, 1.32, 0.13]}
        position={[0, 1.58, 0.49]}
        radius={0.075}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial color="#b9b4a6" roughness={0.72} />
      </RoundedBox>
      <RoundedBox name="CRT_ScreenGlass" args={[1.79, 1.08, 0.055]} position={[0, 1.59, 0.56]} radius={0.095} smoothness={5}>
        <meshStandardMaterial color="#101614" roughness={0.28} metalness={0.05} />
      </RoundedBox>
      <mesh name="CRT_Screen" position={[0, 1.59, 0.591]}>
        <planeGeometry args={[1.7, 0.99]} />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
      <ComputerPostIt />
      <ProceduralIdCard />
      <RoundedBox name="CRT_LowerFoot" args={[2.02, 0.18, 0.94]} position={[0, 0.18, -0.02]} radius={0.05} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color="#c8c3b5" roughness={0.76} />
      </RoundedBox>
      <RoundedBox
        name="CRT_DriveBay"
        args={[0.78, 0.12, 0.045]}
        position={[0.48, 0.61, 0.485]}
        radius={0.018}
        smoothness={2}
        castShadow
      >
        <meshStandardMaterial color="#c3beaf" roughness={0.72} />
      </RoundedBox>
      <mesh name="CRT_DriveSlot" position={[0.4, 0.62, 0.512]}>
        <boxGeometry args={[0.58, 0.026, 0.012]} />
        <meshStandardMaterial color="#3b3b36" roughness={0.72} />
      </mesh>
      <RoundedBox name="CRT_EjectButton" args={[0.14, 0.075, 0.035]} position={[0.83, 0.62, 0.515]} radius={0.012} smoothness={2} castShadow>
        <meshStandardMaterial color="#8e8b81" roughness={0.55} />
      </RoundedBox>

      <group name="CRT_RainbowBadge" position={[-0.86, 0.57, 0.515]}>
        {['#4da758', '#e4c43b', '#e89035', '#d55343', '#6a63a5'].map((color, index) => (
          <mesh key={color} position={[0, (index - 2) * 0.017, 0]}>
            <boxGeometry args={[0.13, 0.018, 0.012]} />
            <meshBasicMaterial color={color} />
          </mesh>
        ))}
        <mesh position={[0.035, 0.064, 0]} rotation={[0, 0, -0.45]}>
          <boxGeometry args={[0.04, 0.027, 0.012]} />
          <meshBasicMaterial color="#5a6948" />
        </mesh>
      </group>
      <ComputerYesSticker />
      <mesh name="CRT_PowerPort" position={[0.82, 0.24, 0.47]}>
        <boxGeometry args={[0.16, 0.12, 0.02]} />
        <meshStandardMaterial color="#4a4a43" roughness={0.7} />
      </mesh>

      <RoundedBox
        name="CRT_Keyboard"
        args={[2.25, 0.17, 0.76]}
        position={[-0.02, 0.09, 1.2]}
        rotation={[-0.045, 0, 0]}
        radius={0.055}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#d9d5c8" roughness={0.77} />
      </RoundedBox>
      <RoundedBox args={[2.03, 0.028, 0.61]} position={[-0.02, 0.188, 1.2]} radius={0.02} smoothness={2} receiveShadow>
        <meshStandardMaterial color="#bdb8ad" roughness={0.86} />
      </RoundedBox>
      <group name="CRT_Keys" position={[-0.02, 0.215, 1.2]}>
        {Array.from({ length: 4 }, (_, row) =>
          Array.from({ length: 13 }, (_, column) => (
            <mesh key={`${row}-${column}`} position={[(column - 6) * 0.14, 0, (row - 1.5) * 0.122]} castShadow>
              <boxGeometry args={[0.104, 0.038, 0.08]} />
              <meshStandardMaterial color={column > 10 ? '#aaa59a' : keyColors[row]} roughness={0.78} />
            </mesh>
          )),
        )}
        <mesh position={[0.02, 0, 0.265]} castShadow>
          <boxGeometry args={[0.78, 0.037, 0.075]} />
          <meshStandardMaterial color="#aaa59a" roughness={0.8} />
        </mesh>
      </group>

      <group name="CRT_Mouse" position={[-1.32, 0.09, 1.48]} rotation={[0, 0.09, 0]}>
        <RoundedBox args={[0.39, 0.17, 0.53]} radius={0.065} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#d5d1c5" roughness={0.7} />
        </RoundedBox>
        <RoundedBox name="CRT_MouseButton" args={[0.27, 0.032, 0.2]} position={[0, 0.1, -0.1]} radius={0.025} smoothness={3} castShadow>
          <meshStandardMaterial color="#bdb9ae" roughness={0.62} />
        </RoundedBox>
        <mesh position={[0, 0.09, 0.02]}>
          <boxGeometry args={[0.31, 0.012, 0.014]} />
          <meshStandardMaterial color="#88857d" roughness={0.7} />
        </mesh>
      </group>

      <ComputerCable
        name="CRT_MouseCable"
        points={[[-0.86, 0.3, 0.34], [-1.28, 0.21, 0.55], [-1.62, 0.14, 0.88], [-1.52, 0.13, 1.24], [-1.32, 0.15, 1.33]]}
        radius={0.014}
      />
      <ComputerCable
        name="CRT_KeyboardCable"
        points={[[0.2, 0.27, 0.42], [0.14, 0.19, 0.66], [-0.04, 0.14, 0.86], [-0.02, 0.14, 0.92]]}
        radius={0.022}
      />
    </SceneHotspotTarget>
  )
}

function ComputerPostIt() {
  return (
    <group name="ComputerPostIt" position={[-1.08, 1.76, .64]} rotation={[0, .035, .025]}>
      <RoundedBox name="ComputerPostIt_PaperThickness" args={[.41, .43, .014]} position={[0, -.018, 0]} radius={.006} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial color="#438fc5" roughness={.92} metalness={0} />
      </RoundedBox>
      <PngPlane
        name="ComputerPostIt_Artwork"
        url="/assets/sticker/computer_post-it-note1.png"
        aspect={412 / 429}
        width={.5}
        position={[0, 0, .014]}
        renderOrder={6}
      />
      <RoundedBox name="ComputerPostIt_Tape" args={[.21, .075, .012]} position={[.015, .235, .031]} rotation={[0, 0, -.018]} radius={.012} smoothness={2} castShadow>
        <meshStandardMaterial color="#ded8c9" roughness={.96} transparent opacity={.72} depthWrite={false} />
      </RoundedBox>
    </group>
  )
}

function ComputerYesSticker() {
  return (
    <group name="ComputerYesSticker" position={[-.8, .64, .54]} rotation={[0, .02, -.025]}>
      <RoundedBox name="ComputerYesSticker_PaperThickness" args={[.57, .27, .012]} radius={.01} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial color="#ead3d1" roughness={.96} metalness={0} />
      </RoundedBox>
      <PngPlane
        name="ComputerYesSticker_Artwork"
        url="/assets/sticker/computer_sticker2.png"
        aspect={448 / 234}
        width={.64}
        position={[0, 0, .012]}
        renderOrder={7}
      />
    </group>
  )
}

function ComputerCable({ name, points, radius }: { name: string; points: readonly (readonly [number, number, number])[]; radius: number }) {
  const geometry = useMemo(() => new TubeGeometry(
    new CatmullRomCurve3(points.map((point) => new Vector3(...point))),
    44,
    radius,
    6,
    false,
  ), [points, radius])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <mesh name={name} geometry={geometry} castShadow>
      <meshStandardMaterial color="#9f9b90" roughness={0.72} />
    </mesh>
  )
}

function FileOrganizer() {
  const blueSlots = ['#327fbd', '#3b8cc9', '#4396d1', '#4ba0d8', '#55a8dc']
  const magnets = [
    { x: -0.38, y: 1.13, color: '#e76835' },
    { x: -0.03, y: 0.98, color: '#287bc1' },
    { x: 0.25, y: 1.09, color: '#36a99d' },
    { x: 0.63, y: 1.31, color: '#a7c580' },
  ]
  return (
    <group name="FileOrganizer" position={[-3.52, 0.02, 0.72]} rotation={[0, 0.08, 0]} scale={0.74}>
      <RoundedBox name="Organizer_Base" args={[1.72, 0.19, 1.03]} position={[0, 0.095, 0]} radius={0.09} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color="#d8cec7" roughness={0.48} metalness={0.01} />
      </RoundedBox>
      <RoundedBox name="Organizer_OrangeLip" args={[1.77, 0.055, 1.07]} position={[0, 0.205, 0]} radius={0.045} smoothness={3} castShadow>
        <meshStandardMaterial color="#d96a37" roughness={0.4} />
      </RoundedBox>
      <RoundedBox name="Organizer_InnerTray" args={[1.57, 0.075, 0.9]} position={[0, 0.235, 0]} radius={0.045} smoothness={2} receiveShadow>
        <meshStandardMaterial color="#744894" roughness={0.52} />
      </RoundedBox>

      <RoundedBox name="Organizer_Backboard" args={[1.61, 1.18, 0.075]} position={[0, 0.81, -0.45]} radius={0.035} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial color="#cfc1bb" roughness={0.58} />
      </RoundedBox>
      {magnets.map((magnet, index) => (
        <RoundedBox key={magnet.color} name={`Organizer_Magnet_${index + 1}`} args={[0.12, 0.12, 0.055]} position={[magnet.x, magnet.y, -0.395]} radius={0.035} smoothness={3} castShadow>
          <meshPhysicalMaterial color={magnet.color} roughness={0.3} clearcoat={0.35} clearcoatRoughness={0.35} />
        </RoundedBox>
      ))}
      <mesh name="Organizer_Note" position={[0.56, 1.05, -0.39]} rotation={[0, 0, -0.08]} castShadow>
        <planeGeometry args={[0.43, 0.46]} />
        <meshStandardMaterial color="#e9e58a" roughness={0.88} side={DoubleSide} />
        <ApplePeelSticker />
      </mesh>

      <group name="Organizer_PenCup" position={[-0.53, 0.68, -0.04]}>
        <RoundedBox args={[0.6, 0.88, 0.055]} position={[0, 0, 0.28]} radius={0.028} smoothness={2} castShadow>
          <meshStandardMaterial color="#9cc66f" roughness={0.46} />
        </RoundedBox>
        <RoundedBox args={[0.6, 0.88, 0.055]} position={[0, 0, -0.28]} radius={0.028} smoothness={2} castShadow>
          <meshStandardMaterial color="#8db85f" roughness={0.48} />
        </RoundedBox>
        {[-1, 1].map((side) => (
          <RoundedBox key={side} args={[0.055, 0.88, 0.51]} position={[side * 0.275, 0, 0]} radius={0.026} smoothness={2} castShadow>
            <meshStandardMaterial color={side < 0 ? '#96be68' : '#7ea956'} roughness={0.47} />
          </RoundedBox>
        ))}
        <mesh position={[0, -0.405, 0]} receiveShadow>
          <boxGeometry args={[0.5, 0.04, 0.46]} />
          <meshStandardMaterial color="#678b46" roughness={0.62} />
        </mesh>
        <mesh position={[0, 0.445, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.285, 0.025, 8, 28, Math.PI]} />
          <meshStandardMaterial color="#b1d484" roughness={0.38} />
        </mesh>
      </group>

      <group name="Organizer_FileSlots" position={[0.5, 0, 0.04]}>
        {blueSlots.map((color, index) => (
          <RoundedBox
            key={color}
            name={`Organizer_FileSlot_${index + 1}`}
            args={[0.58, 0.56 + index * 0.04, 0.07]}
            position={[0, 0.49 + index * 0.018, -0.25 + index * 0.13]}
            radius={0.045}
            smoothness={3}
            castShadow
          >
            <meshStandardMaterial color={color} roughness={0.35} />
          </RoundedBox>
        ))}
      </group>

      <group name="Organizer_Accessories">
        <mesh name="Organizer_PencilTube" position={[0.12, 0.58, 0.1]} castShadow>
          <cylinderGeometry args={[0.075, 0.085, 0.68, 20, 1, true]} />
          <meshStandardMaterial color="#df6332" roughness={0.4} side={DoubleSide} />
        </mesh>
        <mesh position={[0.12, 0.92, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.075, 0.012, 8, 20]} />
          <meshStandardMaterial color="#f07a43" roughness={0.34} />
        </mesh>
        <RoundedBox name="Organizer_YellowBox" args={[0.36, 0.3, 0.34]} position={[0.5, 0.39, 0.34]} radius={0.075} smoothness={3} castShadow>
          <meshStandardMaterial color="#e5a735" roughness={0.36} />
        </RoundedBox>
        <RoundedBox name="Organizer_YellowLid" args={[0.38, 0.09, 0.36]} position={[0.5, 0.55, 0.34]} radius={0.06} smoothness={3} castShadow>
          <meshPhysicalMaterial color="#f0bc52" roughness={0.28} clearcoat={0.25} />
        </RoundedBox>
        <RoundedBox name="Organizer_RedTray" args={[0.72, 0.16, 0.28]} position={[-0.1, 0.32, 0.36]} radius={0.07} smoothness={3} castShadow>
          <meshStandardMaterial color="#db5b62" roughness={0.38} />
        </RoundedBox>
        {[-0.24, 0.08].map((x) => (
          <mesh key={x} position={[x, 0.407, 0.37]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.09, 24]} />
            <meshStandardMaterial color="#c44d55" roughness={0.48} />
          </mesh>
        ))}
        <RoundedBox name="Organizer_GreenRack" args={[0.6, 0.12, 0.27]} position={[-0.43, 0.33, 0.06]} radius={0.035} smoothness={2} castShadow>
          <meshStandardMaterial color="#36a88f" roughness={0.43} />
        </RoundedBox>
        {Array.from({ length: 8 }, (_, index) => (
          <mesh key={index} position={[-0.43, 0.4, -0.04 + index * 0.028]} castShadow>
            <boxGeometry args={[0.57, 0.025, 0.012]} />
            <meshStandardMaterial color="#69c4ab" roughness={0.36} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function DeskCalendar() {
  const calendar = useCalendarTexture()
  return (
    <group name="DeskCalendar" position={[2.28, 0.02, 0.42]} rotation={[0, -0.02, 0]} scale={0.82}>
      <mesh name="Calendar_Back" position={[0, 0.5, -0.075]} rotation={[-0.08, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.29, 0.93, 0.07]} />
        <meshStandardMaterial color="#73513a" roughness={0.88} />
      </mesh>
      <mesh name="Calendar_Page" position={[0, 0.53, -0.024]} rotation={[-0.08, 0, 0]} castShadow receiveShadow>
        <planeGeometry args={[1.18, 0.82]} />
        <meshStandardMaterial map={calendar} roughness={0.96} />
      </mesh>
      <mesh name="Calendar_Base" position={[0, 0.065, -0.18]} rotation={[-0.18, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.33, 0.08, 0.62]} />
        <meshStandardMaterial color="#61432f" roughness={0.9} />
      </mesh>
      {[-0.35, 0, 0.35].map((x) => (
        <mesh key={x} position={[x, 0.97, 0.005]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.065, 0.012, 8, 20]} />
          <meshStandardMaterial color="#9d9686" roughness={0.28} metalness={0.78} />
        </mesh>
      ))}
    </group>
  )
}

function Mug() {
  return (
    <group
      name="Mug"
      position={[1.78, 0.03, 1.47]}
      rotation={[0, -0.12, 0]}
    >
      <mesh name="Mug_Body" position={[0, 0.27, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.24, 0.2, 0.5, 30, 1, true]} />
        <meshStandardMaterial color="#d9a423" roughness={0.6} metalness={0.02} side={DoubleSide} />
      </mesh>
      <mesh position={[0, 0.515, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.205, 0.022, 10, 30]} />
        <meshStandardMaterial color="#e2ae2d" roughness={0.55} />
      </mesh>
      <mesh name="Mug_Coffee" position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.188, 30]} />
        <meshStandardMaterial color="#3a2115" roughness={0.38} />
      </mesh>
      <mesh name="Mug_Handle" position={[0.235, 0.29, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow receiveShadow>
        <torusGeometry args={[0.145, 0.035, 10, 28]} />
        <meshStandardMaterial color="#d9a423" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.025, 0]} receiveShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 30]} />
        <meshStandardMaterial color="#c58d15" roughness={0.65} />
      </mesh>
    </group>
  )
}
