import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { ACESFilmicToneMapping } from 'three'
import { useSceneCapabilities, useStore } from '../store'
import CameraRig from './CameraRig'
import { APPROACH_KEYS } from './cameraPath'
import DeskSurface from './DeskSurface'
import DesktopProps from './DesktopProps'
import FilingCabinetModel from './FilingCabinetModel'
import LightsAndShadows from './LightsAndShadows'
import PerformanceGovernor from './PerformanceGovernor'
import ProceduralAlarmClock from './ProceduralAlarmClock'
import ProceduralBookSet from './ProceduralBookSet'
import ProceduralCake from './ProceduralCake'
import ProceduralDoor from './ProceduralDoor'
import ProceduralHeadphonesPlayer from './ProceduralHeadphonesPlayer'
import ProceduralOfficeChair from './ProceduralOfficeChair'
import ProceduralPhotoFrame from './ProceduralPhotoFrame'
import ProceduralPlant from './ProceduralPlant'
import ProceduralRug from './ProceduralRug'
import ProceduralSwitchPanel from './ProceduralSwitchPanel'
import ProceduralTreeDecor from './ProceduralTreeDecor'
import ProceduralUnderdeskFileCart from './ProceduralUnderdeskFileCart'
import ProceduralWallGallery from './ProceduralWallGallery'
import ProceduralWallOrganizer from './ProceduralWallOrganizer'
import ProceduralWindow from './ProceduralWindow'
import ProceduralRedSideboard from './ProceduralRedSideboard'
import SideboardPhotoProps from './SideboardPhotoProps'
import WallArtwork from './WallArtwork'
import ScenePngProps from './ScenePngProps'
import { CameraReturn, WorldHotspots } from './Hotspots'
import { CAMERA_FAR, CAMERA_FOV, CAMERA_NEAR } from './sceneConfig'
import ZoomControls, { ZoomInput } from './ZoomControls'
import './hero.css'

/**
 * 首屏 3D 场景。
 *
 * 结构：Canvas + 相机 + 灯光 + 性能总管 + 柜体 + 柜内外物件 + 门上贴花 + 热点。
 */
export default function HeroSceneCanvas() {
  const caps = useSceneCapabilities()
  const activeSceneOverlay = useStore((state) => state.scene.overlay)
  const preparedDrawer = useStore((state) => state.preparedDrawer)
  const query = new URLSearchParams(location.search)

  const debugGrid = import.meta.env.DEV && query.get('grid') === '1'

  return (
    <div className="hero">
      <Canvas
        className="hero__canvas"
        /*
         * 静止时按需渲染，有动画时连续渲染。
         *
         * 这一项**必须是受控的**，不能只靠 PerformanceGovernor 里的
         * `setFrameloop`：Canvas 每次重渲染都会把 frameloop 属性重新灌一遍，
         * 把 governor 设过的值冲掉。而场景状态一变 caps 就变、Canvas 就重渲染，
         * 于是 focusing → overlayOpening → returning 这一串里 governor 的
         * effect 依赖没变、不会重跑，frameloop 被永久按回 demand，
         * 画面直接停住（实测开场 4.6s 只出了 90 帧，返回镜头一帧都不走）。
         */
        frameloop={caps.animating ? 'always' : 'demand'}
        shadows
        dpr={[0.8, 1.15]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.36,
        }}
        camera={{
          fov: CAMERA_FOV,
          near: CAMERA_NEAR,
          far: CAMERA_FAR,
          // 首帧就落在 approach 起手机位：参考里方格还没散完柜体已经在画面里，
          // 不能等揭幕结束再淡入（这会露出一段白场）
          position: [...APPROACH_KEYS[0].pos],
        }}
      >
        <color attach="background" args={['#d8c4a9']} />
        <fog attach="fog" args={['#d8c4a9', 16, 28]} />
        <PerformanceGovernor animating={caps.animating} />
        <CameraRig />
        <ZoomInput />
        <LightsAndShadows dynamic={caps.animating} />
        <DeskSurface />
        <Suspense fallback={null}>
          <WallArtwork />
        </Suspense>
        <ProceduralRug />
        <ProceduralSwitchPanel />
        <ProceduralAlarmClock />
        <ProceduralBookSet />
        <ProceduralDoor />
        <ProceduralHeadphonesPlayer />
        <ProceduralOfficeChair />
        <ProceduralPlant />
        <ProceduralTreeDecor />
        <ProceduralUnderdeskFileCart />
        <ProceduralCake />
        <ProceduralWindow />
        <ProceduralRedSideboard />
        <SideboardPhotoProps />
        <ProceduralWallGallery />
        <ProceduralWallOrganizer />
        <FilingCabinetModel
          drawer2Open={preparedDrawer === 'work' || activeSceneOverlay === 'work' ? 1 : 0}
          drawer3Open={preparedDrawer === 'projects' || activeSceneOverlay === 'projects' ? 1 : 0}
          preparedDrawer={preparedDrawer}
        />
        <Suspense fallback={null}>
          <DesktopProps />
          <ProceduralPhotoFrame />
          <ScenePngProps />
        </Suspense>
        <WorldHotspots />
        <CameraReturn />
      </Canvas>
      <ZoomControls />
      {debugGrid && <div className="hero__calib" aria-hidden />}
    </div>
  )
}
