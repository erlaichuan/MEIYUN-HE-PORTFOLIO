import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { prefersReducedMotion } from '../hooks/useReducedMotion'

/** 兜底：动画事件因标签页隐藏等原因没到齐时的强制收尾余量 */
const GUARD_PAD_MS = 320
/** 普通模式与 Reduced Motion 都只做整幅透明度过渡，不再使用方块粒子 */
const FADE_MS = 320
const REDUCED_FADE_MS = 160

/**
 * 红色整屏淡出揭幕层。
 *
 * 要点：
 * - 生命周期只由自己的播放进度决定。
 * - 收尾时优先调用 onDone（供场景状态机接线）；没传就退回旧的 setPhase('scene')。
 * - 起播前先等主场景画满一帧，避免遮罩淡出时露出白底。
 * - 全程只改变透明度，不再创建方块或粒子节点。
 */
export default function Reveal({ onDone }: { onDone?: () => void }) {
  const setPhase = useStore((s) => s.setPhase)

  // 开场序列是一次性的，只在挂载时读一次；播到一半切系统设置不该打断它
  const [reduced] = useState(prefersReducedMotion)
  /** 主场景画满一帧之前不起播 */
  const [armed, setArmed] = useState(false)
  /** 播完并收尾后卸载遮罩 */
  const [cleared, setCleared] = useState(false)

  const revealRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef(false)
  const onDoneRef = useRef(onDone)
  const setPhaseRef = useRef(setPhase)
  // 回调只在收尾时读，渲染期间不碰 ref
  useEffect(() => {
    onDoneRef.current = onDone
    setPhaseRef.current = setPhase
  })

  /** 收尾：只会执行一次 */
  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    // 此刻遮罩已经是 opacity 0，卸载不会有任何可见跳变
    requestAnimationFrame(() => setCleared(true))
    if (onDoneRef.current) onDoneRef.current()
    else setPhaseRef.current('scene')
  }, [])

  /* 起播闸门：连等两帧，确保底下的主场景已经完成首帧绘制 */
  useEffect(() => {
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setArmed(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [])

  /* 整幅遮罩淡出。用 WAAPI 保证 Reduced Motion 下仍有一个不突兀的短过渡。 */
  useEffect(() => {
    if (!armed) return
    const el = revealRef.current
    if (!el) {
      finish()
      return
    }
    const duration = reduced ? REDUCED_FADE_MS : FADE_MS
    const anim = el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration,
      easing: reduced ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards',
    })
    anim.onfinish = finish
    const guard = window.setTimeout(finish, duration + GUARD_PAD_MS)
    return () => {
      window.clearTimeout(guard)
      anim.onfinish = null
    }
  }, [reduced, armed, finish])

  if (cleared) return null

  return <div ref={revealRef} className="reveal" aria-hidden />
}
