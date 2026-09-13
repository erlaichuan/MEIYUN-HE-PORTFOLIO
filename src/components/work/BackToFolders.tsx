import { useStore } from '../../store'
import { sweepBackToFolders } from './workTransition'
import ProjectBackButton from './ProjectBackButton'

/** 作品子页面左上角的返回入口；返回时播放米黄色径向遮罩过渡 */
export default function BackToFolders() {
  const setWorkView = useStore((s) => s.setWorkView)
  return (
    <ProjectBackButton
      onClick={() => {
        sweepBackToFolders(() => setWorkView(null))
      }}
    />
  )
}
