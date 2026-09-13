import { CREDIT } from '../data/content'
import './credit.css'

/**
 * 出处与源码。
 *
 * 本站是复刻练习，原作的视觉创意不属于本仓库，所以出处必须**出现在页面上**，
 * 而不只是写在 README 里。位置取左下角：不挡柜体、不与顶部导航和右下角缩放
 * 控件冲突；层级低于浮层，打开任意内容浮层时会被自然盖住。
 */
export default function Credit() {
  return (
    <aside className="cr" aria-label="出处与源码">
      <p className="cr__line">
        <span className="cr__k">Recreation of</span>
        <a
          className="cr__a u-tap-target"
          href={CREDIT.originUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {CREDIT.author} · {CREDIT.platform}原作
        </a>
      </p>
      <p className="cr__line">
        <span className="cr__k">Source</span>
        <a
          className="cr__a u-tap-target"
          href={CREDIT.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub 开源仓库
        </a>
      </p>
    </aside>
  )
}
