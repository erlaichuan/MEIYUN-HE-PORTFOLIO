import type { ComponentProps } from 'react'
import './projectBackButton.css'

type Props = Omit<ComponentProps<'button'>, 'children'> & {
  placement?: 'fixed' | 'local' | 'inline'
  label?: string
  direction?: 'left' | 'down'
}

/** A persistent, pill-shaped return affordance; navigation remains with the caller. */
export default function ProjectBackButton({ className = '', placement = 'fixed', label = '返回上一页', direction = 'left', ...props }: Props) {
  return (
    <button {...props} type="button" className={`project-back ${className}`} data-placement={placement} data-direction={direction} aria-label={label}>
      <span className="project-back__wash" aria-hidden="true" />
      <span className="project-back__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d={direction === 'down' ? 'm5 13 7 7 7-7M12 4v16' : 'm11 5-7 7 7 7M4 12h16'} />
        </svg>
      </span>
      <span className="project-back__labels">
        <span className="project-back__label">{label}</span>
        <span className="project-back__label-hover" aria-hidden="true">{label}</span>
      </span>
    </button>
  )
}
