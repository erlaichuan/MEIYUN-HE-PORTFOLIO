import { useState, type CSSProperties } from 'react'
import './longDramaIntro.css'

const ART = '/work/changjuhaibao/intro/'
const PORTRAITS = [6961, 6960, 6959, 6958, 6956] as const
const BALLAD_GIFS = [
  [6969, '隼与绪风 · 打架'], [5308, '乐嫣聪明 · 成长'], [6970, '长歌吐血 · 受伤'],
  [6971, '长歌与阿隼 · 争吵'], [5307, '隼救长歌 · 保护'], [5313, '长歌悟道 · 盛世大唐'],
] as const
const PROMOTION_POSTERS = [
  { file: 'promotion-group.webp', name: '群像主海报', label: '<<<群像海报', x: 17, y: 58, width: 407, ratio: 2 / 3 },
  { file: 'promotion-couple.webp', name: '主 CP 主题海报', label: '<<<主题海报', x: 514, y: 53, width: 407, ratio: 2 / 3 },
  { file: 'promotion-banner.jpg', name: '平台横版宣传海报', label: '<<<平台首页宣传图', x: 1085, y: 9, width: 949, ratio: 1500 / 410 },
  { file: 'promotion-blue.jpg', name: '爱青春蓝色横版海报', x: 981, y: 296, width: 477, ratio: 644 / 322 },
  { file: 'promotion-green.jpg', name: '绿色横版海报', x: 1483, y: 296, width: 551, ratio: 1200 / 520 },
  { file: 'promotion-bus.jpg', name: '公交站开播宣传海报', x: 1167, y: 564, width: 695, ratio: 1920 / 810 },
] as const

/** Shared layered composition for the supplied 2077 × 1080 project pages. */
export default function LongDramaIntro({ active, entering, variant = 'construction' }: {
  active: boolean; entering: boolean; variant?: 'construction' | 'color' | 'promotion' | 'characters' | 'publicity' | 'ballad' | 'ballad-gif'
}) {
  const colorPage = variant === 'color'
  const promotionPage = variant === 'promotion'
  const characterPage = variant === 'characters'
  const publicityPage = variant === 'publicity'
  const balladPage = variant === 'ballad'
  const gifPage = variant === 'ballad-gif'
  const imageDate = colorPage || promotionPage || characterPage || publicityPage || balladPage || gifPage
  const [loaded, setLoaded] = useState(0)
  const [failed, setFailed] = useState(false)
  const ready = loaded >= (gifPage || promotionPage ? 10 : publicityPage ? 8 : characterPage || balladPage ? 9 : imageDate ? 5 : 4)
  const imageEvents = {
    onLoad: () => setLoaded(value => value + 1),
    onError: () => setFailed(true),
  }
  const zoomProps = (rotate = true) => ({
    'data-zoom': rotate ? 'rotate' : 'plain',
    role: 'button', tabIndex: active && !entering ? 0 : -1, 'aria-description': '点击可查看大图',
  })

  return (
    <div className="ld-intro" data-variant={variant} data-ready={ready} data-reveal={ready && active && !entering}
      data-waiting={active && entering}>
      <div className="ld-intro__layer ld-intro__background">
        <img src={`${ART}${promotionPage || characterPage || publicityPage || balladPage || gifPage ? 'background-3.png' : colorPage ? 'background-2.png' : 'background.png?v=aa58052e'}`} width={2077} height={1080}
          alt={colorPage ? '恋爱生物钟黑白字形与网格规范' : ''} draggable={false} {...imageEvents} />
      </div>
      <div className="ld-intro__layer ld-intro__date">
        {imageDate ? <img src={`${ART}date-label.png`} width={451} height={163}
          alt="DATE: 2021 · 长剧海报" draggable={false} {...imageEvents} /> : <>
          <span>DATE: 2021</span>
          <strong>影视视觉</strong>
        </>}
      </div>
      <div className="ld-intro__layer ld-intro__heading">
        <img src={`${ART}${gifPage ? 'ballad-gif-heading.png' : balladPage ? 'ballad-heading.png' : publicityPage ? 'publicity-heading.png' : characterPage ? 'character-heading.png' : promotionPage ? 'promotion-heading.png' : 'project-heading.png'}`} width={1198} height={158}
          alt={gifPage ? 'TITLE：长歌行 GIF 动图海报 · GRAPHIC & PHOTOSHOP' : balladPage ? 'TITLE：长歌行宣发 / 破 15 亿海报 · GRAPHIC & PHOTOSHOP' : publicityPage ? 'TITLE：宣发物料 · GRAPHIC & PHOTOSHOP' : characterPage ? 'TITLE：人物宣传海报 · GRAPHIC & PHOTOSHOP' : promotionPage ? 'TITLE：主题宣传海报 · GRAPHIC & PHOTOSHOP' : 'TITLE：恋爱生物钟片名 logo · GRAPHIC & PHOTOSHOP'} draggable={false} {...imageEvents} />
      </div>
      {promotionPage ? <div className="ld-intro__layer ld-intro__promotion">
        {PROMOTION_POSTERS.map((poster) => (
          <div key={poster.file} className="ld-intro__promotion-item" style={{
            left: `${poster.x / 2046 * 100}%`, top: `${poster.y / 881 * 100}%`,
            width: `${poster.width / 2046 * 100}%`, aspectRatio: poster.ratio,
          }}>
            <img src={`${ART}${poster.file}`} alt={`恋爱生物钟 · ${poster.name}`} draggable={false}
              {...imageEvents} {...zoomProps()} />
            {'label' in poster && <span className="ld-intro__promotion-label" aria-hidden="true">{poster.label}</span>}
          </div>
        ))}
      </div> : gifPage ? <div className="ld-intro__gif-grid">
        {BALLAD_GIFS.map(([id, title], i) => (
          <img key={id} className="ld-intro__layer ld-intro__gif-card"
            style={{ '--intro-delay': `${280 + i * 80}ms` } as CSSProperties}
            src={`${ART}ballad-${id}.gif`} width={id === 5308 || id === 5307 ? 700 : 1000}
            height={id === 5308 || id === 5307 ? 695 : 1000}
            alt={`长歌行动态海报 · ${title}`} draggable={false} {...imageEvents} {...zoomProps(false)} />
        ))}
      </div> : balladPage ? <>
        {[1, 2, 3, 4].map((id, i) => (
          <div key={id} className="ld-intro__layer ld-intro__ballad-portrait" style={{
            '--portrait-index': i, '--intro-delay': `${280 + i * 80}ms`,
          } as CSSProperties}>
            <img src={`${ART}ballad-${id}.png`} width={494} height={705}
              alt={`长歌行人物卷轴宣传海报 ${id}`} draggable={false} {...imageEvents} {...zoomProps()} />
          </div>
        ))}
        <div className="ld-intro__layer ld-intro__ballad-milestone">
          <img src={`${ART}ballad-milestone.webp`} width={5395} height={7861}
            alt="长歌行 · 腾讯视频播放量破十五亿宣传海报" draggable={false} {...imageEvents} {...zoomProps()} />
        </div>
      </> : publicityPage ? <div className="ld-intro__publicity">
        {(['down', 'up'] as const).map((direction, i) => (
          <div className="ld-intro__layer ld-intro__strip" key={direction}
            style={{ '--intro-delay': `${280 + i * 80}ms` } as CSSProperties}>
            <div className="ld-intro__strip-track" data-direction={direction}>
              <img src={`${ART}publicity-${direction}.png`} width={300} height={1552}
                alt={`恋爱生物钟人物宣发长图 · ${direction === 'up' ? '向上' : '向下'}缓慢滑动`}
                draggable={false} {...imageEvents} {...zoomProps(false)} />
              <img src={`${ART}publicity-${direction}.png`} width={300} height={1552}
                alt={`恋爱生物钟人物宣发长图 · ${direction === 'up' ? '向上' : '向下'}缓慢滑动`}
                aria-hidden="true" draggable={false} data-zoom="plain" />
            </div>
          </div>
        ))}
        <div className="ld-intro__layer ld-intro__publicity-poster ld-intro__publicity-poster--calendar" style={{ '--intro-delay': '440ms' } as CSSProperties}>
          <img src={`${ART}publicity-calendar.jpg`} width={1080} height={2669}
            alt="恋爱生物钟 · 追剧日历" draggable={false} {...imageEvents} {...zoomProps()} />
        </div>
        <div className="ld-intro__layer ld-intro__publicity-poster ld-intro__publicity-poster--events" style={{ '--intro-delay': '520ms' } as CSSProperties}>
          <img src={`${ART}publicity-events.gif`} width={600} height={1578}
            alt="恋爱生物钟 · 高能事件大猜想动态宣发海报" draggable={false} {...imageEvents} {...zoomProps()} />
        </div>
      </div> : characterPage ? PORTRAITS.map((id, i) => (
        <div className="ld-intro__portrait-slot" key={id} style={{
          '--portrait-index': i,
          '--portrait-ratio': 1080 / (id === 6956 ? 1920 : 1620),
          '--intro-delay': `${280 + i * 80}ms`,
        } as CSSProperties}>
          <div className="ld-intro__layer ld-intro__portrait">
            <img src={`${ART}character-${id}.webp`} width={1080} height={id === 6956 ? 1920 : 1620}
              alt={`恋爱生物钟${id === 6956 ? '双人' : '人物'}宣传海报 ${i + 1}`} draggable={false} {...imageEvents} {...zoomProps()} />
          </div>
        </div>
      )) : <div className="ld-intro__layer ld-intro__logo">
        <img src={`${ART}${colorPage ? 'logo-2.png' : 'logo.png'}`}
          width={colorPage ? 798 : 1024} height={colorPage ? 486 : 577}
          alt={colorPage ? '恋爱生物钟 Logo 紫色、蓝色及双色方案' : '恋爱生物钟 Logo 字形与比例设计'} draggable={false} {...imageEvents} />
      </div>}
      <div className="ld-intro__layer ld-intro__title">
        <img src={`${ART}${balladPage || gifPage ? 'ballad-title.png' : 'drama-title.png'}`} width={491} height={140}
          alt={balladPage || gifPage ? 'CHINESE DRAMA SERIES THE LONG BALLAD · 长歌行' : 'CHINESE WEB DRAMA LOVE O’ CLOCK · 恋爱生物钟'} draggable={false} {...imageEvents} />
      </div>
      {!ready && <p className="ld-intro__status" role="status">
        {failed ? '素材未能载入，请刷新页面重试。' : '画面载入中…'}
      </p>}
    </div>
  )
}
