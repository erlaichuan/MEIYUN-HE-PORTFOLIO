import { useState } from 'react'
import { SKILLS } from '../../data/content'
import { useStore, type SkillProjectEntry } from '../../store'
import CloseButton from './CloseButton'
import './overlay.css'
import './skills.css'

/**
 * SKILLS —— 三张纸质能力卡。
 *
 * 浮层出现时就直接把三张卡平铺在同一层级，不再先显示一摞卡片、再要求用户
 * 点击「展开全部」。卡片可通过鼠标或键盘进入对应项目集合。
 */
const PROJECT_ENTRIES: Record<string, { entry: SkillProjectEntry; label: string }> = {
  '02': { entry: 'game', label: '查看 GAME ART 项目' },
  '01': { entry: 'film', label: '查看影视海报项目' },
  '03': { entry: 'aigc', label: '查看 AI 剧海报项目' },
}

export default function SkillsDeck() {
  const [selected, setSelected] = useState(1)
  const openSkillProjects = useStore(s => s.openSkillProjects)

  return (
    <div className="ov ov--skills">
      <CloseButton />
      <div
        className="sk"
        role="group"
        data-flat
        aria-label={`技能卡组，共 ${SKILLS.length} 张，已全部平铺`}
      >
        <p className="sk__sr" aria-live="polite">
          当前强调：{SKILLS[selected].no} {SKILLS[selected].title}
        </p>

        {SKILLS.map((card, index) => (
          <button
            key={card.no}
            type="button"
            className="sk__card"
            data-slot={index}
            data-card={card.no}
            data-selected={selected === index || undefined}
            aria-label={`${card.title}：${PROJECT_ENTRIES[card.no].label}`}
            onPointerEnter={() => setSelected(index)}
            onFocus={() => setSelected(index)}
            onClick={() => openSkillProjects(PROJECT_ENTRIES[card.no].entry)}
            style={{
              zIndex: selected === index ? 12 : 10,
              background: card.bg,
              color: card.fg,
              ['--in-delay' as string]: `${index * 0.085}s`,
            }}
          >
            <span className="sk__arc" aria-hidden />
            <span className="sk__kicker">{card.kicker}</span>
            <span className="sk__title">{card.title}</span>
            <span className="sk__desc">{card.desc}</span>
            <span className="sk__spacer" />
            <span className="sk__rows">
              {card.rows.map((row) => (
                <span key={row.k} className="sk__row">
                  <span className="sk__k">{row.k}</span>
                  <span className="sk__v">{row.v}</span>
                </span>
              ))}
            </span>
            <span className="sk__project-entry">
              {PROJECT_ENTRIES[card.no].label}<span aria-hidden="true">↗</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
