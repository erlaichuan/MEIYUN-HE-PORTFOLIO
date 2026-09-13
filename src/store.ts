import { create } from 'zustand'
import {
  INITIAL_CONTEXT,
  isSceneVisible,
  reduce,
  type Capabilities,
  type OverlaySource,
  type SceneContext,
  type SceneEvent,
  type SceneState,
  CAPABILITIES,
} from './experience/experienceMachine'

/** 主场景之上叠加的模态层 */
export type Overlay = null | 'about' | 'skills' | 'work' | 'projects' | 'contact'

/** SELECTED WORK 内部的子视图 */
export type WorkView = null | 'design' | 'photograph' | 'video' | 'website' | 'game' | 'longdrama'
export type DrawerHotspot = 'work' | 'projects'
export type SkillProjectEntry = 'game' | 'film' | 'aigc'

/**
 * 旧的三段式阶段。
 *
 * 已经不再是事实来源了 —— 真正的状态在 `scene`（见 experienceMachine）。
 * 这里保留成派生值，只为让 Loader / Reveal / App 这些还没迁移的模块继续工作。
 * 新代码请读 `scene.state`，不要读 `phase`。
 */
export type Phase = 'loading' | 'reveal' | 'scene'

function phaseOf(state: SceneState): Phase {
  if (!isSceneVisible(state)) return 'loading'
  return state === 'reveal' ? 'reveal' : 'scene'
}

type State = {
  /** 场景状态机的完整 context */
  scene: SceneContext
  /** 派生自 scene.state 的旧阶段值，见上面的说明 */
  phase: Phase
  progress: number
  overlay: Overlay
  workView: WorkView
  skillProjectEntry: SkillProjectEntry | null
  /** 正在拉出并弹出文件的抽屉；动效完成后自动进入，同一时间只准备一层。 */
  preparedDrawer: DrawerHotspot | null

  /** 往状态机投一个事件；这是推进场景的**唯一**方式 */
  send: (e: SceneEvent) => void
  /** 告诉状态机用户的 Reduced Motion 偏好 */
  setReducedMotion: (reduced: boolean) => void
  /** 兼容旧接口：内部翻译成对应的状态机事件 */
  setPhase: (p: Phase) => void
  setProgress: (n: number) => void
  prepareDrawer: (id: DrawerHotspot) => void
  openOverlay: (o: Overlay, source?: OverlaySource) => void
  openSkillProjects: (entry: SkillProjectEntry) => void
  closeOverlay: () => void
  setWorkView: (v: WorkView) => void
}

export const useStore = create<State>((set, get) => ({
  scene: INITIAL_CONTEXT,
  phase: phaseOf(INITIAL_CONTEXT.state),
  progress: 0,
  overlay: null,
  workView: null,
  skillProjectEntry: null,
  preparedDrawer: null,

  /**
   * 往状态机投事件，并把「浮层什么时候真正挂上 / 卸掉」跟着状态走。
   *
   * 顺序是：镜头先到位 → 浮层再挂载 → 进入动画播完才交焦点。
   * 所以从柜内热点进入时 `openOverlay` 只投 REQUEST_OVERLAY（状态机进 focusing），
   * 真正把 `overlay` 写进 store 是在收到 FOCUS_DONE、状态变成 overlayOpening 之后 ——
   * 也就是这里。顶部导航进入不需要局部推近，REQUEST_OVERLAY 直接落到
   * overlayOpening，同一段代码同一帧就把浮层挂上。
   */
  send: (event) =>
    set((s) => {
      const next = reduce(s.scene, event)
      if (next === s.scene) return s
      const patch: Partial<State> = { scene: next, phase: phaseOf(next.state) }
      const mounting = next.state === 'overlayOpening' || next.state === 'overlayOpen'
      if (mounting && s.overlay !== next.overlay) {
        patch.overlay = next.overlay
        patch.workView = null
      }
      if (!mounting && next.overlay === null && s.overlay !== null) {
        patch.overlay = null
        patch.workView = null
      }
      if (event.type === 'REQUEST_OVERLAY' || event.type === 'OVERLAY_EXITED') {
        patch.preparedDrawer = null
      }
      return patch
    }),

  setReducedMotion: (reduced) =>
    set((s) => (s.scene.reduced === reduced ? s : { scene: { ...s.scene, reduced } })),

  // 兼容层：把旧的 setPhase 泵成一串状态机事件，直到达到目标阶段
  setPhase: (p) => {
    const { send } = get()
    if (p === 'reveal') {
      send({ type: 'ASSETS_READY' })
      return
    }
    if (p !== 'scene') return
    // 开发期直达（?v=about）会从 loading 一步跳到 scene
    send({ type: 'ASSETS_READY' })
    send({ type: 'REVEAL_DONE' })
    if (get().scene.state === 'approach') send({ type: 'SKIP_INTRO' })
  },

  setProgress: (progress) => set({ progress }),

  prepareDrawer: (id) => set({ preparedDrawer: id }),

  openOverlay: (overlay, source = 'nav') => {
    if (!overlay) {
      get().closeOverlay()
      return
    }
    set({ skillProjectEntry: null })
    get().send({ type: 'REQUEST_OVERLAY', overlay, source })
    // 顶部导航进入时上面这一发已经落到 overlayOpening 并挂好浮层，
    // 这里补一发 OVERLAY_ENTERED 让状态推进到 overlayOpen；
    // 热点进入还停在 focusing，要等镜头到位，这一发会被状态机忽略。
    get().send({ type: 'OVERLAY_ENTERED' })
  },

  openSkillProjects: (entry) => {
    get().openOverlay(entry === 'game' ? 'projects' : 'work')
    set({ skillProjectEntry: entry, workView: null })
  },

  /** 关闭浮层；真正的 OVERLAY_EXITED 由 OverlayHost 在退场动画完成后回报。 */
  closeOverlay: () => {
    get().send({ type: 'CLOSE_OVERLAY' })
    // UI 先进入 closing；此时相机仍保持聚焦，不会在半透明浮层背后提前回退。
    set({ overlay: null })
  },

  setWorkView: (workView) => set({ workView }),
}))

/** 当前状态允许哪些输入：状态机那张输入规则表的读取入口。
 *  注意别和 components/fallback/capabilities.ts 的设备能力探测混淆。 */
export function useSceneCapabilities(): Capabilities {
  return useStore((s) => CAPABILITIES[s.scene.state])
}

/** 组件里读场景状态的推荐入口 */
export function useSceneState(): SceneState {
  return useStore((s) => s.scene.state)
}
