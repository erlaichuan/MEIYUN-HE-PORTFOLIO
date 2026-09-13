import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  PROJECT_BOOKS,
  projectBookImage,
  type ProjectBook,
} from '../../data/projectBooks.generated'
import { releaseImages } from './imageSources'
import ProjectBackButton from './ProjectBackButton'

/** 当前跨页前后各保留几张纸的高分辨率解码结果 */
const KEEP = 1

type BookFace =
  | { kind: 'cover'; image: string | null }
  | { kind: 'page'; image: string; page: number }

function ProjectCover({ project, compact = false }: { project: ProjectBook; compact?: boolean }) {
  return (
    <span className="mb__cover" data-blank={!project.cover} data-compact={compact}>
      {project.cover && (
        <img
          {...projectBookImage(project.cover)}
          sizes={compact ? '(max-width: 820px) 18vw, 120px' : '(max-width: 820px) 43vw, 330px'}
          alt=""
          decoding="async"
          draggable={false}
        />
      )}
    </span>
  )
}

function FaceContent({ face, project }: { face: BookFace | null; project: ProjectBook }) {
  if (!face) return null
  if (face.kind === 'cover') return <ProjectCover project={project} />
  return (
    <img
      {...projectBookImage(face.image)}
      sizes="(max-width: 820px) 43vw, min(35vh, 27vw, 380px)"
      alt={`${project.sourceName}, page ${face.page}`}
      decoding="async"
      draggable={false}
    />
  )
}

/** DESIGN › 02 PROJECTS —— 九宫格项目书与逐本翻页预览 */
export default function MagazineBook({ active }: { active: boolean }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [flipped, setFlipped] = useState(0)
  const bookRef = useRef<HTMLDivElement>(null)

  const project = selected === null ? null : PROJECT_BOOKS[selected]
  const sheets = useMemo(() => {
    if (!project) return []
    const faces: BookFace[] = [
      { kind: 'cover', image: project.cover },
      ...project.pages.map((image, index) => ({ kind: 'page' as const, image, page: index + 1 })),
    ]
    const result: { front: BookFace; back: BookFace | null }[] = []
    for (let index = 0; index < faces.length; index += 2) {
      result.push({ front: faces[index], back: faces[index + 1] ?? null })
    }
    return result
  }, [project])

  const totalSheets = sheets.length
  const lastSheetHasBack = totalSheets > 0 && sheets[totalSheets - 1].back !== null
  const maxFlipped = Math.max(0, totalSheets - (lastSheetHasBack ? 0 : 1))
  const opened = flipped > 0
  const atEnd = flipped >= maxFlipped

  const turn = (direction: number) => {
    setFlipped((current) => Math.max(0, Math.min(maxFlipped, current + direction)))
  }

  const openBook = (index: number) => {
    setSelected(index)
    setFlipped(0)
  }

  const closeBook = () => {
    setSelected(null)
    setFlipped(0)
  }

  useEffect(() => {
    if (selected === null) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeBook()
      if (event.key === 'ArrowRight') {
        setFlipped((current) => Math.max(0, Math.min(maxFlipped, current + 1)))
      }
      if (event.key === 'ArrowLeft') {
        setFlipped((current) => Math.max(0, Math.min(maxFlipped, current - 1)))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selected, maxFlipped])

  useEffect(() => {
    const book = bookRef.current
    return () => releaseImages(book)
  }, [selected])

  const progress = !project
    ? ''
    : flipped === 0
      ? `COVER · ${project.pages.length} PAGES`
      : (() => {
          const left = flipped * 2 - 1
          const right = Math.min(flipped * 2, project.pages.length)
          return `${left === right ? left : `${left}–${right}`} / ${project.pages.length}`
        })()

  return (
    <div className="mb" data-active={active}>
      <span className="wv__ghost mb__ghost">PROJECTS</span>

      <div className="mb__grid" aria-label="Nine project books">
        {PROJECT_BOOKS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className="mb__tile"
            style={{ '--book-index': index } as CSSProperties}
            onClick={() => openBook(index)}
            aria-label={`Open project ${index + 1}, ${item.pages.length} pages`}
          >
            <span className="mb__miniBook">
              <ProjectCover project={item} compact />
              <span className="mb__viewHint" aria-hidden="true">点击查看</span>
            </span>
            <span className="mb__tileMeta">
              <span>PROJECT {String(index + 1).padStart(2, '0')}</span>
              <span>{String(item.pages.length).padStart(2, '0')} PAGES</span>
            </span>
          </button>
        ))}
      </div>

      {project && (
        <div className="mb__focus" role="dialog" aria-modal="true" aria-label={`Project ${selected! + 1}`}>
          <button type="button" className="mb__focusBackdrop" onClick={closeBook} aria-label="Close project" />
          <ProjectBackButton placement="local" onClick={closeBook} />

          <div className="mb__stage" data-open={opened} data-end={atEnd}>
            <div ref={bookRef} className="mb__book">
              <div className="mb__left" data-show={opened} />
              {sheets.map((sheet, index) => {
                const isFlipped = index < flipped
                const near = index >= flipped - 1 - KEEP && index <= flipped + KEEP
                return (
                  <div
                    key={index}
                    className="mb__sheet"
                    data-flipped={isFlipped}
                    style={{ zIndex: isFlipped ? index : totalSheets - index }}
                  >
                    <button
                      type="button"
                      className="mb__face mb__face--front"
                      onClick={() => turn(1)}
                      aria-label={index === 0 && !opened ? '点击翻开项目书' : atEnd && !isFlipped ? 'Last page' : 'Next page'}
                    >
                      {near && <FaceContent face={sheet.front} project={project} />}
                      {index === 0 && !opened && <span className="mb__openHint" aria-hidden="true">点击翻开</span>}
                    </button>
                    <button
                      type="button"
                      className="mb__face mb__face--back"
                      onClick={() => turn(-1)}
                      aria-label="Previous page"
                    >
                      {near && <FaceContent face={sheet.back} project={project} />}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <p className="mb__hint">
            <span>PROJECT {String(selected! + 1).padStart(2, '0')}</span>
            <span>{progress}</span>
            <span>{atEnd ? 'CLICK LEFT PAGE TO GO BACK' : 'CLICK PAGES TO TURN'}</span>
          </p>
        </div>
      )}
    </div>
  )
}
