import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { holdSceneMusicForProject } from '../../scene/sceneAudio'
import { FUSHENG_MUSIC } from '../../scene/backgroundMusic'
import { useStore } from '../../store'
import ProjectBackButton from '../work/ProjectBackButton'
import { gamePortfolioPages, gamePortfolioSections, portfolioImage } from './gamePortfolioData'
import { gameAssets, warmGameAssets } from './gameAssetWarmup'
import './gamePortfolio.css'

const loadGame = () => import('./GameView')
const GameView = lazy(loadGame)
const pad = (n: number) => String(n).padStart(2, '0')

function Plates({ pages }: { pages: readonly number[] }) {
  return <div className="gp-plates">{pages.map(number => gamePortfolioPages[number - 1]).map(page => <figure className="gp-plate" key={page.number}>
    <a href={portfolioImage(page.number)} target="_blank" rel="noreferrer" aria-label={`查看大图：${page.title}（新标签页）`}>
      <img src={portfolioImage(page.number)} srcSet={`${portfolioImage(page.number, 960)} 960w, ${portfolioImage(page.number)} 1920w`} sizes="(max-width: 700px) calc(100vw - 70px), (max-width: 1440px) 85vw, 1232px" width="1920" height="1080" loading={page.number === 1 ? 'eager' : 'lazy'} fetchPriority={page.number === 1 ? 'high' : 'auto'} decoding="async" alt={page.title}/>
      <span className="gp-enlarge" aria-hidden="true">查看大图 ↗</span>
    </a>
    <figcaption><span><b>{pad(page.number)}</b>{page.title}</span><span aria-hidden="true">↗</span></figcaption>
  </figure>)}</div>
}

export default function GamePortfolio() {
  const root = useRef<HTMLDivElement>(null)
  const heroHeading = useRef<HTMLDivElement>(null)
  const [heroReady, setHeroReady] = useState(false)
  const startButton = useRef<HTMLButtonElement>(null)
  const demoSection = useRef<HTMLElement>(null)
  const laptop = useRef<HTMLDivElement>(null)
  const demoScreen = useRef<HTMLDivElement>(null)
  const wasPlaying = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [fullscreenNotice, setFullscreenNotice] = useState('')
  const [active, setActive] = useState('cover')
  const setWorkView = useStore(s => s.setWorkView)
  const closeOverlay = useStore(s => s.closeOverlay)
  useEffect(() => holdSceneMusicForProject(FUSHENG_MUSIC, { cloudScrollOpening: true }), [])

  useEffect(() => {
    const section = demoSection.current
    if (!section) return
    const controller = new AbortController()
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      observer.disconnect()
      void loadGame().catch(() => { /* Lazy entry retains its normal retry path. */ })
      void warmGameAssets(gameAssets.entry, controller.signal)
    }, { root: root.current, rootMargin: '500px' })
    observer.observe(section)
    return () => { observer.disconnect(); controller.abort() }
  }, [])

  useEffect(() => {
    let cancelled = false
    const images = Array.from(heroHeading.current?.querySelectorAll('img') ?? [])
    // Unfurl only after the transparent clouds and logo can be painted together.
    void Promise.all(images.map(image => image.decode().catch(() => undefined))).then(() => {
      if (!cancelled) setHeroReady(true)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const scrollRoot = root.current
    if (!scrollRoot || !heroReady || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const items = Array.from(scrollRoot.querySelectorAll<HTMLElement>('.gp-hero-bottom, .gp-facts, .gp-cover-grid > img, .gp-section-heading, .gp-plate, .gp-goals, .gp-cluster > header, .gp-laptop'))
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('gp-entered')
        observer.unobserve(entry.target)
      }
    }, { root: scrollRoot, rootMargin: '0px 0px -3% 0px', threshold: 0 })
    for (const item of items) {
      item.classList.add('gp-enter')
      observer.observe(item)
    }
    return () => {
      observer.disconnect()
      items.forEach(item => item.classList.remove('gp-enter', 'gp-entered'))
    }
  }, [heroReady])

  useEffect(() => {
    const scrollRoot = root.current
    if (!scrollRoot) return
    // Follow the chapter crossing the upper reading area of this overlay, not the locked body.
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id)
    }, { root: scrollRoot, rootMargin: '-16% 0px -65% 0px', threshold: 0 })
    scrollRoot.querySelectorAll<HTMLElement>('[data-game-chapter]').forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Keep the existing share link useful without changing normal folder entry behavior.
    if (new URLSearchParams(location.search).get('game') === 'fusheng') demoSection.current?.scrollIntoView({ block: 'start' })
  }, [])

  useEffect(() => {
    if (wasPlaying.current && !playing) startButton.current?.focus({ preventScroll: true })
    wasPlaying.current = playing
  }, [playing])

  function jump(id: string) {
    const container = root.current
    const target = container?.querySelector<HTMLElement>(`#${id}`)
    const topInset = (container?.querySelector('.gp-nav')?.getBoundingClientRect().height ?? 0)
      + (container?.querySelector('.gp-index')?.getBoundingClientRect().height ?? 0) + 12
    if (container && target) container.scrollTo({
      top: container.scrollTop + target.getBoundingClientRect().top - container.getBoundingClientRect().top - topInset,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
    setActive(id)
  }
  function clearGameLink() {
    if (new URLSearchParams(location.search).has('game')) {
      const url = new URL(location.href)
      url.searchParams.delete('game')
      history.replaceState(null, '', url)
    }
  }
  function back() {
    clearGameLink()
    setWorkView(null)
  }
  function returnHome() {
    clearGameLink()
    closeOverlay()
  }
  function startDemo() {
    setFullscreenNotice('')
    setPlaying(true)
    // Request on the already-mounted screen in the click gesture, before the lazy game loads.
    const screen = demoScreen.current
    const unavailable = () => setFullscreenNotice('浏览器未允许自动全屏，可使用游戏内的“全屏”按钮。')
    if (screen?.requestFullscreen) void screen.requestFullscreen().catch(unavailable)
    else unavailable()
  }
  function endDemo() {
    if (document.fullscreenElement === demoScreen.current) void document.exitFullscreen().catch(() => {})
    setPlaying(false)
    setFullscreenNotice('')
  }

  return <div className="gp" ref={root}><div className="gp-surface">
    <div className="gp-ornament gp-ornament--left" aria-hidden="true" />
    <div className="gp-ornament gp-ornament--right" aria-hidden="true" />
    <header className="gp-nav">
      <ProjectBackButton placement="inline" onClick={back} />
      <span className="gp-nav-label">AVA LI <i>/</i> GAME ART</span>
      <ProjectBackButton placement="inline" className="gp-demo-link" label="滑动底部体验游戏demo" direction="down" onClick={() => jump('demo')} />
    </header>

    <main className="gp-main">
      <section id="cover" data-game-chapter className="gp-hero" data-unfold={heroReady} aria-labelledby="cover-heading">
        <p className="gp-eyebrow"><span /> SELECTED PROJECT / GAME ART</p>
        <div className="gp-hero-heading" ref={heroHeading} data-unfold={heroReady}>
          <div className="gp-clouds" aria-hidden="true">
            <span className="gp-cloud gp-cloud--title-left"><img src="/assets/game-portfolio/cloud-crest.png" alt="" draggable={false}/></span>
            <span className="gp-cloud gp-cloud--title-right"><img src="/assets/game-portfolio/cloud-ribbon.png" alt="" draggable={false}/></span>
            <span className="gp-cloud gp-cloud--logo-left"><img src="/assets/game-portfolio/cloud-trail.png" alt="" draggable={false}/></span>
            <span className="gp-cloud gp-cloud--logo-right"><img src="/assets/game-portfolio/cloud-crest.png" alt="" draggable={false}/></span>
          </div>
          <h1 id="cover-heading">浮生若梦<span>A world within a painting.</span></h1>
          <img className="gp-game-logo" src="/assets/game-portfolio/game-logo.webp" alt="浮生若梦游戏 Logo"/>
        </div>
        <div className="gp-hero-bottom">
          <p>执笔入画，唤醒山河。<br/>一段从东方幻想、角色设定到游戏界面的视觉旅程。</p>
          <div className="gp-tags"><span>国风游戏美术</span><span>角色 / 场景 / UI</span><span>精选案例 + 可玩 Demo</span></div>
        </div>
        <div className="gp-cover-grid">
          <dl className="gp-facts">
            <div><dt>项目类型</dt><dd>国风游戏视觉 / 概念项目</dd></div>
            <div><dt>个人职责</dt><dd>视觉方向、角色、场景与 UI 设计</dd></div>
            <div><dt>作品集版本</dt><dd>2026</dd></div>
            <div><dt>使用工具</dt><dd>Photoshop / Illustrator / Procreate</dd></div>
          </dl>
          <img src={portfolioImage(1)} srcSet={`${portfolioImage(1, 960)} 960w, ${portfolioImage(1)} 1920w`} sizes="(max-width:700px) calc(100vw - 70px), (max-width:1440px) 85vw, 1232px" width="1920" height="1080" alt="浮生若梦 · 龙跃山河主视觉" fetchPriority="high"/>
        </div>
      </section>

      <nav className="gp-index" aria-label="游戏作品章节">
        {gamePortfolioSections.map((section, index) => <button key={section.id} type="button" aria-current={active === section.id ? 'location' : undefined} onClick={() => jump(section.id)}>
          <span className="gp-index__measure" aria-hidden="true"><span>{pad(index + 1)}</span>{section.label}</span>
          <span className="gp-index__content"><span className="gp-index__number">{pad(index + 1)}</span><span className="gp-index__title">{section.label}</span></span>
        </button>)}
      </nav>

      <section id="overview" data-game-chapter className="gp-chapter" aria-labelledby="overview-heading">
        <header className="gp-section-heading">
          <div className="gp-section-meta"><span>02 / PROJECT OVERVIEW</span><span>CONCEPT & GOALS</span></div>
          <div className="gp-section-intro"><h2 id="overview-heading">项目背景介绍</h2><p>《浮生若梦》是一款以古画修复为核心的东方幻想游戏概念。玩家化身画境师进入残卷，与画中角色协作，让褪色、破损的山河重新完整。</p></div>
        </header>
        <div className="gp-goals">
          <article><b>01</b><h3>沉浸感</h3><p>让传统绘画语言成为世界本身，而不只是表层装饰。</p></article>
          <article><b>02</b><h3>可识别性</h3><p>在统一风格中建立清晰的角色、道具与功能辨识。</p></article>
          <article><b>03</b><h3>可操作性</h3><p>把卷轴式视觉系统转化为易理解的游戏操作层级。</p></article>
        </div>
        <Plates pages={[2]}/>
      </section>

      <section id="world" data-game-chapter className="gp-chapter" aria-labelledby="world-heading">
        <header className="gp-section-heading">
          <div className="gp-section-meta"><span>03 / WORLD & ART DIRECTION</span><span>VISUAL FOUNDATION</span></div>
          <div className="gp-section-intro"><h2 id="world-heading">宣传图设计绘制</h2><p>视觉方向取自青绿山水、古画卷轴与民间设色。低饱和纸色承载信息，朱红标记关键动作，石青与石绿建立画境的生命力。</p></div>
          <div className="gp-keywords"><span>古画修复</span><span>东方幻想</span><span>青绿山水</span><span>卷轴叙事</span><i className="gp-swatch gp-swatch--paper"/><i className="gp-swatch gp-swatch--red"/><i className="gp-swatch gp-swatch--green"/><i className="gp-swatch gp-swatch--ink"/></div>
        </header>
        <Plates pages={[3]}/>
      </section>

      <section id="production" data-game-chapter className="gp-chapter" aria-labelledby="production-heading">
        <header className="gp-section-heading">
          <div className="gp-section-meta"><span>04 / ART PRODUCTION</span><span>CHARACTER · PROP · ENVIRONMENT</span></div>
          <div className="gp-section-intro"><h2 id="production-heading">人物角色设定、道具卡牌与场景绘制</h2><p>角色、道具与场景使用同一套笔触、材质和色彩逻辑，同时在轮廓和局部装饰上形成独立识别。</p></div>
        </header>
        <div className="gp-cluster"><header><span>01 / CHARACTER DESIGN</span><h3>六人角色设定与 Q 版群像</h3><p>从角色总览展开墨婉、墨修、石峻、薛若华、苏晚晴与陆寒舟的完整设定，再展示六人的 Q 版形象。</p></header><Plates pages={[4, 6, 7, 8, 9, 10, 11, 12]}/></div>
        <div className="gp-cluster"><header><span>02 / PROP DESIGN</span><h3>道具卡牌与专属法器</h3><p>从文房雅物到人物专属法器，通过材质、造型与卡牌装饰延续世界观和角色性格。</p></header><Plates pages={[5, 13]}/></div>
        <div className="gp-cluster"><header><span>03 / ENVIRONMENT DESIGN</span><h3>从线稿到完整山河</h3><p>依次呈现构图线稿、完整设色和局部细节，说明双龙与山河两组主场景的制作过程。</p></header><Plates pages={[14, 15]}/></div>
      </section>

      <section id="interface" data-game-chapter className="gp-chapter" aria-labelledby="interface-heading">
        <header className="gp-section-heading">
          <div className="gp-section-meta"><span>05 / GAME UI</span><span>HIERARCHY & VISUAL SYSTEM</span></div>
          <div className="gp-section-intro"><h2 id="interface-heading">游戏UI界面设计</h2><p>纸本、卷轴、悬牌与印章构成统一组件语言；通过层级、留白和朱红交互色，保证复杂信息仍有明确入口。</p></div>
        </header>
        <div className="gp-cluster"><header><span>01 / MAIN INTERFACE</span><h3>整体系统、进入画面与主界面</h3><p>从组件总览、进入游戏到主城界面，展示任务、图鉴和角色入口如何嵌入山水主场景。</p></header><Plates pages={[16, 17, 18]}/></div>
        <div className="gp-cluster"><header><span>02 / CORE GAMEPLAY</span><h3>图鉴、残卷修复与每日签到</h3><p>图鉴建立选择，地图表达进度与节点，每日签到展示奖励和活动状态。</p></header><Plates pages={[19, 20, 21]}/></div>
        <div className="gp-cluster"><header><span>03 / CHARACTER SYSTEM</span><h3>从角色总览到详情阅读</h3><p>卡牌负责快速比较，石峻与薛若华的详情页展示等级、属性、技能与大幅立绘。</p></header><Plates pages={[22, 23, 24]}/></div>
      </section>

      <section id="demo" data-game-chapter ref={demoSection} className="gp-chapter gp-demo" aria-labelledby="demo-heading">
        <header className="gp-section-heading">
          <div className="gp-section-meta"><span>06 / PLAY THE EXPERIENCE</span><span>INTERACTIVE DEMO</span></div>
          <div className="gp-section-intro"><h2 id="demo-heading">游戏demo体验</h2><p>Demo 聚焦一条完整核心流程：进入游戏、选择画境师、打开修复图鉴、选择墨痕残卷并完成修复。静态设计稿作为上方补充。</p></div>
        </header>
        <div className="gp-laptop" ref={laptop}>
          <div className="gp-laptop-lid">
            <span className="gp-camera" aria-hidden="true"><i /></span>
            <div className="gp-laptop-screen" ref={demoScreen}>
              {playing ? <Suspense fallback={<div className="gp-game-loading" role="status">正在展开画卷…</div>}><GameView embedded onExit={endDemo}/></Suspense> : <div className="gp-demo-cover">
                <img src={portfolioImage(17)} width="1920" height="1080" alt="浮生若梦交互 Demo 登录画面" loading="lazy"/>
                <div className="gp-demo-start"><span>FUSHENG RUOMENG · 互动试玩</span><button ref={startButton} type="button" onClick={startDemo}><span aria-hidden="true">▶</span> 开启游戏试玩之旅</button><p>点击开启 · 自动全屏 · 无需下载</p></div>
              </div>}
            </div>
            <span className="gp-laptop-brand" aria-hidden="true">FUSHENG RUOMENG</span>
          </div>
          <div className="gp-laptop-base" aria-hidden="true"><span /></div>
          <div className="gp-laptop-foot" aria-hidden="true" />
        </div>
        <p className="gp-demo-note">点击画面内按钮操作 <span>·</span> 点击开启后自动全屏 <span>·</span> 进度保存在当前浏览器</p>
        {fullscreenNotice && <p className="gp-demo-note" role="status">{fullscreenNotice}</p>}
      </section>

      <footer className="gp-footer gp-footer--home">
        <button type="button" className="gp-home-button" onClick={returnHome} aria-label="感谢你的探索 thank you for explore 返回主页">
          <span className="gp-home-button__thanks"><span>感谢你的探索</span><span lang="en">thank you for explore</span></span>
          <span className="gp-home-button__action">返回主页 <span aria-hidden="true">↗</span></span>
        </button>
      </footer>
    </main>
  </div></div>
}
