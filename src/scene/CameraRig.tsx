import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { MathUtils, PerspectiveCamera, Vector3 } from 'three'
import { introTime } from '../experience/experienceClock'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useSceneCapabilities } from '../store'
import { distanceScaleFor, introPose, type CameraPose } from './cameraPath'
import { cameraDirected, directedPose, noteCurrentPose } from './cameraDirector'
import { stepZoom, zoomSettled } from './userZoom'
import { CAMERA_FOV } from './sceneConfig'
import { detailMusicProximity } from './detailFocus'
import { setSceneMusicProximity } from './sceneAudio'

const _pos = new Vector3()
const _tgt = new Vector3()
const _visualPose: { pos: [number, number, number]; target: [number, number, number] } = {
  pos: [0, 0, 0],
  target: [0, 0, 0],
}

/**
 * 稳定构图里的鼠标视差。
 *
 * 数值有意压得很低：它模拟的是正视静物摄影里身体轻微侧移后的透视变化，
 * 不是可自由旋转的游戏镜头。热点聚焦、返回、开场和 Reduced Motion 下都回到 0，
 * 因而不会和既有 cameraDirector / flyTo 抢相机控制权。
 */
const PARALLAX_X = 0.23
const PARALLAX_Y = 0.105
const TARGET_X = 0.035
const TARGET_Y = 0.018
const PARALLAX_EPSILON = 0.00035

/**
 * 相机机位控制器。
 *
 * 每帧从主时间线读一个时刻，插值出机位写进相机。
 * 相机自己不持有任何动画状态、不读 DOM、也不写 React state ——
 * 时钟每帧都在变，写进 store 会把整棵场景树重渲染。
 */
export default function CameraRig({ pose }: { pose?: CameraPose }) {
  const invalidate = useThree((s) => s.invalidate)
  const canvas = useThree((s) => s.gl.domElement)
  const width = useThree((s) => s.size.width)
  const height = useThree((s) => s.size.height)
  const caps = useSceneCapabilities()
  const reduced = useReducedMotion()
  const scale = distanceScaleFor(width / Math.max(1, height))
  const pointer = useRef({ x: 0, y: 0, inside: false })
  const offset = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return
      pointer.current.x = MathUtils.clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1)
      pointer.current.y = MathUtils.clamp(1 - ((event.clientY - rect.top) / rect.height) * 2, -1, 1)
      pointer.current.inside = true
      invalidate()
    }
    const onLeave = () => {
      pointer.current.inside = false
      invalidate()
    }
    canvas.addEventListener('pointermove', onMove, { passive: true })
    canvas.addEventListener('pointerleave', onLeave, { passive: true })
    return () => {
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [canvas, invalidate])

  useFrame(({ camera: cam }, dt) => {
    // FOV 是标定出来的常量，只在被别处改动过时纠回来。
    // 写在这里而不是 useEffect 里：相机是 useThree 返回的对象，
    // 在 effect 里改它属于「修改 hook 返回值」，lint 会拦。
    if (cam instanceof PerspectiveCamera && cam.fov !== CAMERA_FOV) {
      cam.fov = CAMERA_FOV
      cam.updateProjectionMatrix()
    }
    // 镜头只有三个来源，优先级从高到低：显式传入 > 镜头调度器 > 开场时间线。
    // 调度器接管的是开场之后的局部聚焦与返回。
    const directed = directedPose(performance.now())
    const p = pose ?? directed ?? introPose(introTime())
    _tgt.set(p.target[0], p.target[1], p.target[2])
    _pos.set(p.pos[0], p.pos[1], p.pos[2])
    // 以注视点为中心按比例后撤：窄屏补偿 × 用户缩放。
    // 两者都是「乘在半径上的标量」，与机位来源正交 —— 不管这一帧的 pose 来自
    // 开场时间线还是镜头调度器，用户的缩放都照样叠加，不会互相抹掉（见 userZoom.ts）
    const zoom = stepZoom(dt)
    // cameraDirector 里的机位已经以当前肉眼画面为坐标系：起点来自
    // noteCurrentPose，热点终点也按垂直 FOV 直接解出。再次乘窄屏补偿会让
    // 返回镜头先过度后撤，再在 releaseCamera 时闪回。只有开场/稳定宽景
    // 需要在这里应用画幅补偿与用户缩放。
    if (!directed && !pose) _pos.sub(_tgt).multiplyScalar(scale * zoom).add(_tgt)

    const parallaxOn = caps.freeCamera && !reduced && pointer.current.inside && !cameraDirected()
    const px = MathUtils.damp(offset.current.x, parallaxOn ? pointer.current.x : 0, 6.5, dt)
    const py = MathUtils.damp(offset.current.y, parallaxOn ? pointer.current.y : 0, 6.5, dt)
    offset.current.x = px
    offset.current.y = py
    _pos.x += px * PARALLAX_X
    _pos.y += py * PARALLAX_Y
    _tgt.x += px * TARGET_X
    _tgt.y += py * TARGET_Y

    cam.position.copy(_pos)
    cam.lookAt(_tgt)
    // flyTo 被中途触发时必须从这一帧肉眼看到的机位出发，包括鼠标视差，
    // 否则点击热点的一刻会先跳回未偏移的基础机位。
    _visualPose.pos[0] = _pos.x
    _visualPose.pos[1] = _pos.y
    _visualPose.pos[2] = _pos.z
    _visualPose.target[0] = _tgt.x
    _visualPose.target[1] = _tgt.y
    _visualPose.target[2] = _tgt.z
    noteCurrentPose(_visualPose)
    setSceneMusicProximity(detailMusicProximity(_visualPose.pos))
    // 局部聚焦、返回、用户缩放都可能发生在 caps.animating 为 false 的
    // 稳定态里，不能只指望 frameloop 开着，这里自己续帧
    const parallaxSettling =
      Math.abs(px - (parallaxOn ? pointer.current.x : 0)) > PARALLAX_EPSILON ||
      Math.abs(py - (parallaxOn ? pointer.current.y : 0)) > PARALLAX_EPSILON
    if (cameraDirected() || !zoomSettled() || parallaxSettling) invalidate()
  })

  return null
}
