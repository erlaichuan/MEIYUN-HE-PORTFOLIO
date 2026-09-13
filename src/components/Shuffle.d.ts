import type { CSSProperties, ElementType } from 'react'

/** Typed interface for the user-supplied React Bits JavaScript component. */
export default function Shuffle(props: {
  text: string
  className?: string
  style?: CSSProperties
  tag?: ElementType
  duration?: number
  shuffleTimes?: number
  shuffleDirection?: 'left' | 'right' | 'up' | 'down'
  animationMode?: 'evenodd' | 'random'
  ease?: string
  stagger?: number
  loop?: boolean
  loopDelay?: number
  triggerOnce?: boolean
  triggerOnHover?: boolean
  respectReducedMotion?: boolean
  colorFrom?: string
  colorTo?: string
}): import('react').ReactElement
