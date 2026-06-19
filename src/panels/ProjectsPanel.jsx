import { useState, useRef, useLayoutEffect } from 'react'
import { IconArrowLeft } from '../icons'
import { useProjects } from '../hooks/useProjects'
import { useProject } from '../hooks/useProject'
import NotionRenderer from '../components/NotionRenderer'

const OPEN_DUR = 520
const BACK_DUR = 320
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)'
const EASE_BACK = 'cubic-bezier(0.32, -0.05, 0.33, 1)'
const OPEN_TOTAL = 900
const BACK_TOTAL = 700

const PALETTE = [
  'linear-gradient(135deg,#7c3aed 0%,#0ea5e9 100%)',
  'linear-gradient(135deg,#ec4899 0%,#f59e0b 100%)',
  'linear-gradient(135deg,#10b981 0%,#0ea5e9 100%)',
  'linear-gradient(135deg,#f59e0b 0%,#ec4899 100%)',
  'linear-gradient(135deg,#0ea5e9 0%,#10b981 100%)',
  'linear-gradient(135deg,#7c3aed 0%,#ec4899 100%)',
]

const thumbBg = (project, index) =>
  project.cover
    ? `url(${project.cover}) center/cover no-repeat`
    : PALETTE[index % PALETTE.length]

function morphThumb(el, ext, { open, duration, easing }) {
  if (!el || !ext) return
  const current = getComputedStyle(el).transform
  el.style.transition = 'none'
  el.style.transformOrigin = 'top left'
  el.style.transform = 'none'
  const nat = el.getBoundingClientRect()
  const extTransform = `translate(${ext.left - nat.left}px, ${ext.top - nat.top}px) scale(${ext.width / nat.width || 1}, ${ext.height / nat.height || 1})`
  const hasCurrent = current && current !== 'none'
  el.style.transform = open ? extTransform : (hasCurrent ? current : 'none')
  el.getBoundingClientRect()
  requestAnimationFrame(() => {
    el.style.transition = `transform ${duration}ms ${easing}`
    el.style.transform = open ? 'none' : extTransform
  })
}

function clearFlip(el) {
  if (!el) return
  el.style.transform = ''
  el.style.transition = ''
  el.style.transformOrigin = ''
}

function ProjectDetailContent({ id, scopeOfWork }) {
  const { project, loading } = useProject(id)
  return (
    <>
      <div className="proj-detail-tags">
        {scopeOfWork?.map(s => <span key={s} className="glass-tag">{s}</span>)}
      </div>
      {loading ? (
        <div className="proj-detail-placeholder">
          <div className="proj-ph-bar" style={{ width: '100%' }} />
          <div className="proj-ph-bar" style={{ width: '80%' }} />
          <div className="proj-ph-bar" style={{ width: '60%' }} />
        </div>
      ) : (
        <NotionRenderer blocks={project?.blocks} />
      )}
    </>
  )
}

export default function ProjectsPanel() {
  const { projects, loading: projectsLoading } = useProjects()

  const [selected, setSelected] = useState(null)
  const [view, setView]         = useState('gallery')
  const [dir, setDir]           = useState(null)
  const [heroGone, setHeroGone] = useState(false)
  const [seq, setSeq]           = useState(0)

  const flipFrom      = useRef(null)
  const cardThumbRefs = useRef({})
  const heroThumbRef  = useRef(null)
  const timersRef     = useRef([])

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  const openProject = p => {
    flipFrom.current = { thumb: cardThumbRefs.current[p.id]?.getBoundingClientRect() }
    setSelected(p)
    setDir('in')
    setView('detail')
    setSeq(s => s + 1)
  }

  const goBack = () => {
    setDir('out')
    setView('gallery')
    setSeq(s => s + 1)
  }

  useLayoutEffect(() => {
    if (!dir) return
    clearTimers()
    setHeroGone(false)

    const isIn    = dir === 'in'
    const thumbEl = heroThumbRef.current
    const extThumb = isIn
      ? flipFrom.current?.thumb
      : cardThumbRefs.current[selected?.id]?.getBoundingClientRect()

    morphThumb(thumbEl, extThumb, {
      open: isIn,
      duration: isIn ? OPEN_DUR : BACK_DUR,
      easing:   isIn ? EASE_OUT  : EASE_BACK,
    })

    if (isIn) {
      timersRef.current = [
        setTimeout(() => { clearFlip(thumbEl); setDir(null) }, OPEN_TOTAL),
      ]
    } else {
      timersRef.current = [
        setTimeout(() => setHeroGone(true), BACK_DUR + 90),
        setTimeout(() => { setDir(null); setSelected(null) }, BACK_TOTAL),
      ]
    }
  }, [seq]) // eslint-disable-line react-hooks/exhaustive-deps

  const showGallery = view === 'gallery' || dir === 'in'
  const showDetail  = (view === 'detail' || (dir === 'out' && !heroGone)) && selected

  const galleryCls = `projects-view proj-gallery-layer${
    dir === 'in' ? ' is-exiting' : dir === 'out' ? ' is-entering' : ''
  }`
  const detailCls = `projects-view projects-view--detail${
    dir === 'in' ? ' is-entering' : dir === 'out' ? ' is-exiting' : ''
  }`

  // Find the index of the selected project for consistent thumbnail color
  const selectedIndex = projects.findIndex(p => p.id === selected?.id)

  return (
    <div className="projects-root">
      {showGallery && (
        <div className={galleryCls}>
          <div className="proj-gallery">
            {projectsLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="proj-card proj-card--skeleton" style={{ '--i': i }}>
                    <div className="proj-sk-thumb" />
                  </div>
                ))
              : projects.map((p, i) => (
                  <button
                    key={p.id}
                    className={`proj-card${dir && selected?.id === p.id ? ' is-hero' : ''}`}
                    style={{ '--i': i }}
                    onClick={() => openProject(p)}
                  >
                    <div
                      className="proj-thumb"
                      ref={el => { cardThumbRefs.current[p.id] = el }}
                      style={{ background: thumbBg(p, i) }}
                    />
                    <div className="proj-card-body">
                      <div className="proj-card-title">{p.title}</div>
                      <div className="proj-card-meta">{p.year}</div>
                    </div>
                  </button>
                ))
            }
          </div>
        </div>
      )}

      {showDetail && (
        <div className={detailCls}>
          <button className="proj-back" onClick={goBack}>
            <IconArrowLeft />
            <span>Projects</span>
          </button>
          <div
            className="proj-detail-thumb"
            ref={heroThumbRef}
            style={{ background: thumbBg(selected, selectedIndex) }}
          />
          <div className="proj-detail-title">{selected.title}</div>
          <div className="proj-detail-fade">
            <ProjectDetailContent
              id={selected.id}
              scopeOfWork={selected.scopeOfWork}
            />
          </div>
        </div>
      )}
    </div>
  )
}
