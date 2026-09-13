import { RoundedBox } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { CanvasTexture, CatmullRomCurve3, MathUtils, SRGBColorSpace, TubeGeometry, Vector3, type Group } from 'three'
import type { DrawerHotspot } from '../store'
import SceneHotspotTarget from './SceneHotspotTarget'
import { PaperStickerBatch, type PaperStickerSpec } from './ScenePngProps'
import type { HotspotId } from './hotspotSpecs'

// 六视图量到的是一只窄体桌下柜：宽约为高度的 0.62，深度略小于高度。
// 这里保留首页可读性，按同一比例做轻微横向放宽，而不是沿用旧版近方形柜体。
const CABINET_W = 1.46
const CABINET_H = 2.28
const CABINET_D = 1.5
const FRONT_Z = CABINET_D / 2
const DRAWER_TRAVEL = 0.92

type FilingCabinetModelProps = {
  /** 0 = 关闭，1 = 完全拉出。由外部状态控制，便于与镜头和 overlay 同步。 */
  drawer1Open?: number
  drawer2Open?: number
  drawer3Open?: number
  /** 正在播放拉出与文件弹出动效的抽屉。 */
  preparedDrawer?: DrawerHotspot | null
}

const PAINT = { roughness: 0.32, metalness: 0.34 } as const
const GREEN = '#96cc88'
const GREEN_DARK = '#76a96b'
const GREEN_INNER = '#7eb472'
const CAVITY = '#17251b'
const STEEL = '#e0e5e1'

export default function FilingCabinetModel({
  drawer1Open = 0,
  drawer2Open = 0,
  drawer3Open = 0,
  preparedDrawer = null,
}: FilingCabinetModelProps) {
  // 仅开发环境使用的轴向验收角度；正常首页与生产构建恒为 0。
  const reviewYaw = import.meta.env.DEV
    ? MathUtils.degToRad(Number(new URLSearchParams(location.search).get('cabinetReview') ?? 0))
    : 0
  return (
    <group name="FilingCabinet_Root" position={[-1.54, 0, -0.22]} rotation={[0, reviewYaw, 0]}>
      <CabinetCarcass />
      <Drawer
        name="Drawer01"
        index={1}
        centerY={1.91}
        height={0.4}
        open={drawer1Open}
      >
        <ArchiveCards kind="skills" />
      </Drawer>
      <Drawer
        name="Drawer02"
        index={2}
        centerY={1.44}
        height={0.5}
        open={drawer2Open}
        hotspot="work"
        hotspotEnabled={preparedDrawer !== 'work'}
      >
        <AnimatedArchiveCards
          key={`work-${preparedDrawer === 'work' ? 'ready' : 'closed'}`}
          id="work"
          kind="work"
          ready={preparedDrawer === 'work'}
        />
      </Drawer>
      <Drawer
        name="Drawer03"
        index={3}
        centerY={0.69}
        height={0.92}
        open={drawer3Open}
        hotspot="projects"
        hotspotEnabled={preparedDrawer !== 'projects'}
      >
        <AnimatedArchiveCards
          key={`projects-${preparedDrawer === 'projects' ? 'ready' : 'closed'}`}
          id="projects"
          kind="archive"
          ready={preparedDrawer === 'projects'}
        />
      </Drawer>
    </group>
  )
}

function CabinetCarcass() {
  return (
    <group name="FilingCabinet_Carcass">
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          name={side < 0 ? 'Cabinet_LeftSide' : 'Cabinet_RightSide'}
          position={[side * (CABINET_W / 2 - 0.032), (CABINET_H - 0.1) / 2, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.064, CABINET_H - 0.1, CABINET_D]} />
          <meshStandardMaterial color={GREEN_DARK} {...PAINT} />
        </mesh>
      ))}
      <RoundedBox
        name="Cabinet_Top"
        args={[CABINET_W, 0.1, CABINET_D + 0.035]}
        position={[0, CABINET_H - 0.05, 0.012]}
        radius={0.018}
        smoothness={2}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={GREEN} {...PAINT} />
      </RoundedBox>
      <mesh name="Cabinet_Base" position={[0, 0.045, 0]} castShadow receiveShadow>
        <boxGeometry args={[CABINET_W, 0.09, CABINET_D]} />
        <meshStandardMaterial color={GREEN_DARK} {...PAINT} />
      </mesh>
      <mesh name="Cabinet_Back" position={[0, (CABINET_H - 0.2) / 2 + 0.05, -CABINET_D / 2 + 0.035]} castShadow receiveShadow>
        <boxGeometry args={[CABINET_W - 0.1, CABINET_H - 0.2, 0.055]} />
        <meshStandardMaterial color={GREEN_DARK} {...PAINT} />
      </mesh>
      {[1.165, 1.69, 2.12].map((y, index) => (
        <mesh key={y} name={`Cabinet_Rail_${index + 1}`} position={[0, y, FRONT_Z - 0.015]} castShadow receiveShadow>
          <boxGeometry args={[CABINET_W - 0.09, 0.045, 0.08]} />
          <meshStandardMaterial color={GREEN_DARK} {...PAINT} />
        </mesh>
      ))}
      {/* 抽屉拉出后看到的深色内腔；不做黑色贴片，而是放在壳体内部。 */}
      {[
        [1.91, 0.35],
        [1.44, 0.45],
        [0.69, 0.87],
      ].map(([y, height], index) => (
        <mesh key={index} name={`Cabinet_Cavity_${index + 1}`} position={[0, y, FRONT_Z - 0.1]} receiveShadow>
          <boxGeometry args={[CABINET_W - 0.12, height, 0.08]} />
          <meshStandardMaterial color={CAVITY} roughness={0.74} metalness={0.18} />
        </mesh>
      ))}
    </group>
  )
}

function Drawer({
  name,
  index,
  centerY,
  height,
  open,
  hotspot,
  hotspotEnabled = true,
  lock = false,
  children,
}: {
  name: string
  index: 1 | 2 | 3
  centerY: number
  height: number
  open: number
  hotspot?: HotspotId
  hotspotEnabled?: boolean
  lock?: boolean
  children: ReactNode
}) {
  const depth = CABINET_D - 0.13
  const innerW = CABINET_W - 0.13
  const sideH = Math.max(0.16, height - 0.1)
  const amount = Math.min(1, Math.max(0, open))
  const motion = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const invalidate = useThree((state) => state.invalidate)

  useFrame((_, delta) => {
    const group = motion.current
    if (!group) return
    // 关闭时 hover 只预拉 4.5cm（约抽屉深度的 4%）；点击后完整拉出 76cm。
    const hoverPreview = amount < 0.01 && hovered ? 0.045 : 0
    const target = amount * DRAWER_TRAVEL + hoverPreview
    group.position.z = MathUtils.damp(group.position.z, target, amount > 0 ? 7.5 : 9, delta)
    if (Math.abs(group.position.z - target) > 0.0007) invalidate()
  })

  const content = (
    <>
      {/* 抽屉箱体：底板、两侧、后挡板都随前板一起拉出。 */}
      <mesh name={`${name}_Bottom`} position={[0, -height / 2 + 0.035, FRONT_Z - depth / 2 - 0.01]} castShadow receiveShadow>
        <boxGeometry args={[innerW, 0.045, depth]} />
        <meshStandardMaterial color={CAVITY} roughness={0.62} metalness={0.22} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          name={`${name}_Side_${side < 0 ? 'L' : 'R'}`}
          position={[side * (innerW / 2 - 0.026), -0.01, FRONT_Z - depth / 2 - 0.01]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.052, sideH, depth]} />
          <meshStandardMaterial color={GREEN_INNER} roughness={0.4} metalness={0.3} />
        </mesh>
      ))}
      <mesh name={`${name}_Back`} position={[0, -0.015, FRONT_Z - depth + 0.02]} castShadow receiveShadow>
        <boxGeometry args={[innerW, sideH, 0.052]} />
        <meshStandardMaterial color={GREEN_INNER} roughness={0.42} metalness={0.28} />
      </mesh>

      {/* 产品侧视图里可见的折边滑轨和冲孔。 */}
      {[-1, 1].map((side) => (
        <group key={`slide-${side}`} position={[side * (innerW / 2 - 0.055), -height * 0.18, FRONT_Z - depth * 0.48]}>
          <mesh castShadow>
            <boxGeometry args={[0.035, 0.075, depth * 0.8]} />
            <meshStandardMaterial color="#8aa98a" roughness={0.3} metalness={0.52} />
          </mesh>
          {[-0.28, 0.05, 0.34].map((z) => (
            <mesh key={z} position={[side * 0.019, 0, z]} rotation={[0, Math.PI / 2, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.006, 10]} />
              <meshBasicMaterial color={CAVITY} />
            </mesh>
          ))}
        </group>
      ))}

      <RoundedBox
        name={`${name}_Front`}
        args={[CABINET_W - 0.095, height - 0.022, 0.09]}
        position={[0, 0, FRONT_Z + 0.026]}
        radius={0.014}
        smoothness={2}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={GREEN} {...PAINT} />
      </RoundedBox>
      <DrawerHandle y={height * 0.12} />
      <LabelHolder index={index} y={-height * 0.24} />
      {lock && <DrawerLock position={[CABINET_W * 0.34, height * 0.32, FRONT_Z + 0.083]} />}
      <group
        name={`${name}_Contents`}
        position={[0, -height / 2 + 0.05, FRONT_Z - depth * 0.46]}
        scale={index === 1 ? 0.62 : index === 2 ? 0.82 : 1}
      >
        {children}
      </group>
    </>
  )

  return hotspot ? (
    <group ref={motion} name={`${name}_Motion`} position={[0, centerY, 0]}>
      <SceneHotspotTarget
        id={hotspot}
        name={name}
        clickEnabled={hotspotEnabled}
        anchorOffset={[0, 0, FRONT_Z + 0.1]}
        onHoverChange={(on) => {
          setHovered(on)
          invalidate()
        }}
      >
        {content}
      </SceneHotspotTarget>
      <CabinetStickers drawer={index} frontZ={FRONT_Z + 0.104} />
    </group>
  ) : (
    <group ref={motion} name={name} position={[0, centerY, 0]}>
      {content}
    </group>
  )
}

function CabinetStickers({ drawer, frontZ }: { drawer: 1 | 2 | 3; frontZ: number }) {
  const layouts: Record<1 | 2 | 3, readonly PaperStickerSpec[]> = {
    1: [
      { width: .2, height: .15, position: [-.57, .08, frontZ], rotation: [0, 0, -.08], color: '#d7b35c' },
      { width: .19, height: .14, position: [.58, .07, frontZ], rotation: [0, 0, .07], color: '#d7876f' },
    ],
    2: [
      { width: .18, height: .16, position: [-.59, .09, frontZ], rotation: [0, 0, .05], color: '#8aa6c1' },
      { width: .22, height: .15, position: [.58, .08, frontZ], rotation: [0, 0, -.07], color: '#e1c469' },
    ],
    3: [
      { width: .2, height: .23, position: [-.59, .19, frontZ], rotation: [0, 0, -.07], color: '#d9896f' },
      { width: .25, height: .13, position: [.52, .18, frontZ], rotation: [0, 0, .06], color: '#e2c56c' },
      { width: .18, height: .2, position: [-.55, -.23, frontZ], rotation: [0, 0, .04], color: '#7fa98e' },
    ],
  }
  return (
    <group name={`Drawer${drawer}_Stickers`}>
      <PaperStickerBatch items={layouts[drawer]} name={`Drawer${drawer}_StickerBatch`} />
    </group>
  )
}

function DrawerHandle({ y }: { y: number }) {
  const geometry = useMemo(() => new TubeGeometry(new CatmullRomCurve3([
    new Vector3(-0.21, 0.055, 0),
    new Vector3(-0.11, -0.005, 0.025),
    new Vector3(0, -0.028, 0.038),
    new Vector3(0.11, -0.005, 0.025),
    new Vector3(0.21, 0.055, 0),
  ]), 28, 0.021, 8, false), [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <group name="Drawer_Handle" position={[0, y, FRONT_Z + 0.085]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color={STEEL} roughness={0.18} metalness={0.55} />
      </mesh>
      {[-0.21, 0.21].map((x) => (
        <mesh key={x} position={[x, 0.055, -0.027]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.027, 0.027, 0.06, 12]} />
          <meshStandardMaterial color={STEEL} roughness={0.18} metalness={0.55} />
        </mesh>
      ))}
    </group>
  )
}

function LabelHolder({ index, y }: { index: number; y: number }) {
  const labels = ['SKILLS', 'WORK', 'PROJECTS']
  const label = labels[index - 1]
  const labelMap = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 144
    const context = canvas.getContext('2d')
    if (context) {
      context.fillStyle = '#e7dfc7'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.fillStyle = '#493b2f'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.font = index === 1 ? '800 74px monospace' : index === 3 ? '700 42px monospace' : '700 58px monospace'
      context.fillText(label, canvas.width / 2, canvas.height / 2 + 2)
    }
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    return texture
  }, [index, label])
  useEffect(() => () => labelMap.dispose(), [labelMap])

  return (
    <group position={[0, y, FRONT_Z + 0.081]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.125, 0.018]} />
        <meshStandardMaterial color="#c4c9c2" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.016]}>
        <planeGeometry args={[0.33, 0.082]} />
        <meshBasicMaterial map={labelMap} toneMapped={false} />
      </mesh>
      <group name={`Drawer_Label_${label}`} />
    </group>
  )
}

function DrawerLock({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.065, 0.03, 22]} />
        <meshStandardMaterial color={STEEL} roughness={0.18} metalness={0.58} />
      </mesh>
      <mesh position={[0, 0, 0.025]}>
        <torusGeometry args={[0.052, 0.008, 8, 20]} />
        <meshStandardMaterial color="#f1f3f1" roughness={0.16} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.021]}>
        <boxGeometry args={[0.012, 0.055, 0.008]} />
        <meshBasicMaterial color="#302f29" />
      </mesh>
    </group>
  )
}

function ArchiveCards({
  kind,
  interactive = false,
}: {
  kind: 'skills' | 'work' | 'archive'
  interactive?: boolean
}) {
  const palette =
    kind === 'skills'
      ? ['#f6ad12', '#f2bf31', '#ffb510', '#e99917', '#f5c338']
      : kind === 'work'
        ? ['#e59c18', '#f5b92a', '#d98922', '#f0aa1a', '#f5c543']
        : ['#d99128', '#e9b33b', '#d8832d', '#efaa2d', '#e5bd55']
  const tabX = [-0.36, -0.18, 0.03, 0.22, 0.38]
  const paperColors = ['#f3efdc', '#fff9e8', '#ddd8c3']
  const raycastProps = interactive ? {} : { raycast: () => undefined }
  return (
    <group
      name={`ArchiveCards_${kind}`}
      userData={{
        sculptRuntime: {
          clickable: interactive,
          explodable: true,
          explodeMode: 'local-depth-spread',
        },
      }}
    >
      {palette.map((color, index) => (
        <group
          key={color}
          name={`HangingFolder_${kind}_${index + 1}`}
          position={[0, 0.17 + index * 0.019, -index * 0.105]}
          rotation={[-0.028 + index * 0.006, 0, (index - 2) * 0.008]}
          userData={{
            partId: `folder-${kind}-${index + 1}`,
            clickable: interactive,
            explodeAxis: [0, 0.12, -0.35 - index * 0.08],
          }}
        >
          <RoundedBox
            name={`Folder_${index + 1}_Back`}
            args={[1.16, 0.5, 0.024]}
            position={[0, 0.035, -0.018]}
            radius={0.018}
            smoothness={2}
            {...raycastProps}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={color} roughness={0.62} />
          </RoundedBox>
          <RoundedBox
            name={`Folder_${index + 1}_Front`}
            args={[1.16, 0.43, 0.024]}
            position={[0, -0.005, 0.026]}
            radius={0.018}
            smoothness={2}
            {...raycastProps}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={color} roughness={0.67} />
          </RoundedBox>
          <RoundedBox
            name={`Folder_${index + 1}_Tab`}
            args={[0.32, 0.13, 0.03]}
            position={[tabX[index] ?? 0, 0.315, -0.004]}
            radius={0.018}
            smoothness={2}
            {...raycastProps}
            castShadow
          >
            <meshStandardMaterial color={color} roughness={0.6} />
          </RoundedBox>

          {/* 悬挂杆收在文件夹轮廓内，只在两端留下短挂钩，避免白色横杆凸出。 */}
          <mesh name={`Folder_${index + 1}_HangingRail`} position={[0, 0.252, 0.024]} {...raycastProps} castShadow>
            <boxGeometry args={[1.06, 0.025, 0.028]} />
            <meshStandardMaterial color="#b7aa91" roughness={0.48} metalness={0.08} />
          </mesh>
          {[-0.51, 0.51].map((x) => (
            <RoundedBox key={x} position={[x, 0.25, 0.024]} args={[0.04, 0.043, 0.034]} radius={0.009} smoothness={2} {...raycastProps} castShadow>
              <meshStandardMaterial color="#a99d88" roughness={0.5} />
            </RoundedBox>
          ))}

          {index < palette.length - 1 && (
            <group name={`Folder_${index + 1}_Papers`} position={[0, -0.025, 0.004]}>
              {paperColors.map((paperColor, paper) => (
                <mesh key={paperColor} position={[(paper - 1) * 0.022, paper * 0.009, 0.004 + paper * 0.007]} rotation={[0, 0, (paper - 1) * 0.008]} {...raycastProps} castShadow>
                  <boxGeometry args={[0.99 - paper * 0.014, 0.35 + paper * 0.008, 0.006]} />
                  <meshStandardMaterial color={paperColor} roughness={0.93} />
                </mesh>
              ))}
            </group>
          )}

          <mesh name={`Folder_${index + 1}_FoldRidge`} position={[0, -0.185, 0.046]} {...raycastProps} castShadow>
            <boxGeometry args={[1.04, 0.02, 0.017]} />
            <meshStandardMaterial color={index % 2 === 0 ? '#d57b19' : '#c56e1c'} roughness={0.75} />
          </mesh>

          {kind === 'skills' && index === 2 && (
            <RoundedBox position={[-0.34, -0.02, 0.052]} args={[0.34, 0.085, 0.012]} radius={0.01} smoothness={2} {...raycastProps}>
              <meshBasicMaterial color="#f3edcf" />
            </RoundedBox>
          )}
        </group>
      ))}
    </group>
  )
}

function AnimatedArchiveCards({
  id,
  kind,
  ready,
}: {
  id: DrawerHotspot
  kind: 'skills' | 'work' | 'archive'
  ready: boolean
}) {
  const motion = useRef<Group>(null)
  const invalidate = useThree((state) => state.invalidate)

  useFrame((_, delta) => {
    const group = motion.current
    if (!group) return
    // 文件与抽屉同时升起；第三抽屉前板更高，需要额外抬升以露出文件。
    const projectLift = id === 'projects' ? 0.29 : 0
    const target = ready ? 0.31 + projectLift : 0
    group.position.y = MathUtils.damp(group.position.y, target, 13, delta)
    group.rotation.x = MathUtils.damp(group.rotation.x, ready ? -0.02 : 0, 11, delta)
    if (Math.abs(group.position.y - target) > 0.0005) invalidate()
  })

  return (
    <group ref={motion} name={`${id}_AnimatedFiles`}>
      <ArchiveCards kind={kind} />
    </group>
  )
}
