import { lazy, Suspense } from 'react'
import { GAME_DRAWER_FOLDERS, POSTER_DRAWER_FOLDERS, PROJECT_FOLDERS, SELECTED_WORK_FOLDERS } from '../../data/content'
import { useStore, type WorkView } from '../../store'
import CloseButton from './CloseButton'
import './overlay.css'
import './folders.css'

const GamePortfolio = lazy(() => import('../game/GamePortfolio'))
const DesignView = lazy(() => import('../work/DesignView'))
const LongDramaView = lazy(() => import('../work/LongDramaView'))
const AigcView = lazy(() => import('../work/AigcView'))
const VideoList = lazy(() => import('../work/VideoList'))
const WebsiteCarousel = lazy(() => import('../work/WebsiteCarousel'))

/* 751×752 的批注尺寸换算成容器百分比，宽屏继续按同一比例放大 */
const POS: Record<string, { l: number; t: number; w: number; h: number; rot: number }> = {
  longdrama: { l: 8, t: 10, w: 31, h: 37, rot: -8 },
  game: { l: 59, t: 57, w: 29, h: 38, rot: 4 },
  video: { l: 16.7, t: 47.0, w: 19.3, h: 30.4, rot: -6 },
  design: { l: 25, t: 40, w: 43, h: 51, rot: -5 },
  photograph: { l: 57, t: 14, w: 29, h: 40, rot: 5 },
  website: { l: 56.8, t: 63.5, w: 22.3, h: 31.8, rot: 2 },
}

const PROJECT_POS: typeof POS = {
  game: { l: 32, t: 25, w: 36, h: 56, rot: -4 },
}
const GAME_DRAWER_POS: typeof POS = {
  game: { l: 32, t: 25, w: 36, h: 56, rot: -4 },
}
const POSTER_DRAWER_POS: typeof POS = {
  longdrama: { ...POS.longdrama, t: 23, h: 34 },
  design: { ...POS.design, t: 49, h: 45 },
  photograph: { ...POS.photograph, t: 26, h: 38 },
}
// Skills subsets are composed around their own center, not gaps in the three-folder layout.
const SKILL_POS: typeof POS = {
  longdrama: { l: 12, t: 29, w: 34, h: 46, rot: -6 },
  design: { l: 54, t: 29, w: 34, h: 46, rot: 6 },
  photograph: { l: 32, t: 27, w: 36, h: 50, rot: -4 },
  game: { l: 32, t: 27, w: 36, h: 50, rot: -4 },
}

export default function WorkFolders() {
  return <FolderCollection collection="work" />
}

/** PROJECTS 与 SELECTED WORK 只复用外观组件，不共享栏目数据。 */
export function ProjectFolders() {
  return <FolderCollection collection="projects" />
}

function FolderCollection({ collection }: { collection: 'work' | 'projects' }) {
  const workView = useStore((s) => s.workView)
  const setWorkView = useStore((s) => s.setWorkView)
  const fromObject = useStore((s) => s.scene.source === 'hotspot')
  const skillEntry = useStore((s) => s.skillProjectEntry)
  const openOverlay = useStore((s) => s.openOverlay)
  // 物件入口各有自己的内容集合，顶部导航继续保留原栏目。
  const folders = skillEntry
    ? skillEntry === 'game' ? GAME_DRAWER_FOLDERS : SELECTED_WORK_FOLDERS.filter(f => skillEntry === 'aigc' ? f.id === 'photograph' : f.id !== 'photograph')
    : fromObject
    ? collection === 'projects' ? GAME_DRAWER_FOLDERS : POSTER_DRAWER_FOLDERS
    : collection === 'projects' ? PROJECT_FOLDERS : SELECTED_WORK_FOLDERS
  const positions = skillEntry ? SKILL_POS : fromObject
    ? collection === 'projects' ? GAME_DRAWER_POS : POSTER_DRAWER_POS
    : collection === 'projects' ? PROJECT_POS : POS

  if (workView) {
    return (
      <Suspense fallback={<div className="wv wv--loading" />}>
        {workView === 'game' && <GamePortfolio />}
        {workView === 'design' && <DesignView />}
        {workView === 'longdrama' && <LongDramaView />}
        {workView === 'photograph' && <AigcView />}
        {workView === 'video' && <VideoList />}
        {workView === 'website' && <WebsiteCarousel />}
      </Suspense>
    )
  }

  return (
    <div className="ov">
      <CloseButton projectReturn onClose={skillEntry ? () => openOverlay('skills') : undefined} />
      <div className="fw" data-collection={collection} data-skill-entry={skillEntry ?? undefined}>
        {fromObject && (
          <header className="fw__intro">
            <h3>{collection === 'projects' ? '游戏作品' : '影视海报作品'}</h3>
            <p>{collection === 'projects' ? '浮生若梦 · 角色、场景与界面设计，点击文件夹浏览作品与交互 Demo。' : '真人剧与 AI 剧的主视觉、人物与宣发海报，点击文件夹查看。'}</p>
          </header>
        )}
        <Star className="fw__star fw__star--yellow" points={12} color="#f6dc86" />
        <Star className="fw__star fw__star--lime" points={10} color="#c8f322" />

        {folders.map((f, i) => {
          const p = positions[f.id]
          return (
            <button
              key={f.id}
              type="button"
              className="fold"
              data-folder={f.id}
              aria-label={`${f.en.join(' ')} ${f.cn}`}
              onClick={() => setWorkView(f.id as WorkView)}
              style={
                {
                  left: `${p.l}%`,
                  top: `${p.t}%`,
                  width: `${p.w}%`,
                  height: `${p.h}%`,
                  zIndex: f.z,
                  '--rot': `${p.rot}deg`,
                  '--bg': f.bg,
                  '--fg': f.fg,
                  '--cnfg': f.cnFg,
                  animationDelay: `${0.06 * i}s`,
                } as React.CSSProperties
              }
            >
              <span className="fold__back" />
              <span className="fold__papers">
                <i />
                <i />
                <i />
              </span>
              <span className="fold__front">
                <span className="fold__en">
                  {f.en.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </span>
                <span className="fold__cn">{f.cn}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Star({ points, color, className }: { points: number; color: string; className?: string }) {
  const pts: string[] = []
  const n = points * 2
  for (let i = 0; i < n; i++) {
    const r = i % 2 === 0 ? 50 : 30
    const a = (Math.PI * 2 * i) / n - Math.PI / 2
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`)
  }
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden>
      <polygon points={pts.join(' ')} fill={color} />
    </svg>
  )
}
