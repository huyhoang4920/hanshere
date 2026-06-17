import { useState, useRef, useLayoutEffect } from 'react'
import { IconArrowLeft } from '../icons'

const OPEN_DUR = 520
const BACK_DUR = 320
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)'        // decelerate — opening
const EASE_BACK = 'cubic-bezier(0.32, -0.05, 0.33, 1)'  // faint anticipation, then settles into place
const OPEN_TOTAL = 900 // open thumb + content stagger settle
const BACK_TOTAL = 700 // back thumb + card slide-in stagger settle

// Morph the hero thumbnail toward an external (card) rect, or back to its natural spot.
// It always starts from the element's CURRENT visual position (read live), so a click
// that interrupts an in-flight animation reverses smoothly instead of snapping.
// Aspects match (16/9 ↔ 16/9) so the scale stays uniform — a clean zoom, no stretch.
function morphThumb(el, ext, { open, duration, easing }) {
  if (!el || !ext) return
  // Freeze the current (possibly mid-animation) transform as the starting point.
  const current = getComputedStyle(el).transform
  el.style.transition = 'none'
  el.style.transformOrigin = 'top left'

  // Measure the untransformed layout box to compute the card-rect transform.
  el.style.transform = 'none'
  const nat = el.getBoundingClientRect()
  const extTransform = `translate(${ext.left - nat.left}px, ${ext.top - nat.top}px) scale(${ext.width / nat.width || 1}, ${ext.height / nat.height || 1})`
  const natTransform = 'none'

  // Opening always originates from the clicked card (correct anchor, even if a
  // previous transition left a stale transform behind). Going back reverses from
  // wherever the thumbnail visually is now, so an interrupted open glides back.
  const hasCurrent = current && current !== 'none'
  el.style.transform = open ? extTransform : (hasCurrent ? current : natTransform)
  el.getBoundingClientRect() // reflow

  requestAnimationFrame(() => {
    el.style.transition = `transform ${duration}ms ${easing}`
    el.style.transform = open ? natTransform : extTransform
  })
}

function clearFlip(el) {
  if (!el) return
  el.style.transform = ''
  el.style.transition = ''
  el.style.transformOrigin = ''
}

const PROJECTS = [
  {
    id: 1,
    title: 'Nebula Analytics Dashboard',
    year: '2024',
    role: 'Product Designer',
    tags: ['UI Design', 'React', 'Data Viz'],
    color: 'linear-gradient(135deg,#7c3aed 0%,#0ea5e9 100%)',
    desc: 'A real-time analytics dashboard for a SaaS platform serving 50k+ users. Designed the full information architecture, component system, and interactive data visualisations. Reduced time-on-task by 34% through progressive disclosure patterns.',
  },
  {
    id: 2,
    title: 'Orion Habit Tracker — iOS App',
    year: '2024',
    role: 'Lead Designer',
    tags: ['iOS', 'Figma', 'Prototyping'],
    color: 'linear-gradient(135deg,#ec4899 0%,#f59e0b 100%)',
    desc: 'End-to-end design of a habit-tracking iOS app. Led user research with 24 participants, defined the core loop, and shipped a design system of 80+ components. Featured on the App Store within two weeks of launch.',
  },
  {
    id: 3,
    title: 'Atlas Multi-Brand Design System',
    year: '2023',
    role: 'Design Systems',
    tags: ['Tokens', 'Storybook', 'Figma'],
    color: 'linear-gradient(135deg,#10b981 0%,#0ea5e9 100%)',
    desc: 'Built a cross-platform design system adopted by 6 product teams. Defined semantic token architecture, documented accessibility guidelines, and co-authored the contribution process that cut design-dev handoff time by half.',
  },
  {
    id: 4,
    title: 'Drift E-commerce',
    year: '2023',
    role: 'UX / Visual Design',
    tags: ['E-commerce', 'A/B Testing', 'Shopify'],
    color: 'linear-gradient(135deg,#f59e0b 0%,#ec4899 100%)',
    desc: 'Redesigned the checkout and product-detail flows for a DTC fashion brand. A/B tested 12 variants over 8 weeks. Final design lifted conversion rate by 18% and reduced cart abandonment by 22%.',
  },
  {
    id: 5,
    title: 'Pulse Patient Health Portal',
    year: '2022',
    role: 'UX Research + Design',
    tags: ['Healthcare', 'Accessibility', 'WCAG'],
    color: 'linear-gradient(135deg,#0ea5e9 0%,#10b981 100%)',
    desc: 'Redesigned a patient-facing health portal with a focus on accessibility (WCAG AA). Conducted contextual interviews with 18 patients and 6 clinicians. Delivered a fully annotated Figma spec and a custom icon library.',
  },
  {
    id: 6,
    title: 'Wren Brand Identity',
    year: '2022',
    role: 'Brand Designer',
    tags: ['Branding', 'Motion', 'Figma'],
    color: 'linear-gradient(135deg,#7c3aed 0%,#ec4899 100%)',
    desc: 'Full brand identity for an early-stage fintech startup — logo, type system, color palette, motion principles, and a 60-page brand guidelines document. Identity shipped across web, app, and physical collateral.',
  },
]

export default function ProjectsPanel() {
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('gallery')  // settled target: 'gallery' | 'detail'
  const [dir, setDir] = useState(null)          // 'in' | 'out' | null (idle)
  const [heroGone, setHeroGone] = useState(false) // detail hero unmounted (after it lands on back)
  const [seq, setSeq] = useState(0)             // bumps on every action to (re)trigger

  const flipFrom = useRef(null)                 // source thumb rect captured on open
  const cardThumbRefs = useRef({})
  const heroThumbRef = useRef(null)
  const timersRef = useRef([])                  // pending settle timers (cancelled on interrupt)

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  // No lock guards: every click takes effect immediately and interrupts what's running.
  const openProject = p => {
    flipFrom.current = {
      thumb: cardThumbRefs.current[p.id]?.getBoundingClientRect(),
    }
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
    // Cancel any pending settles from a previous (now-interrupted) transition.
    clearTimers()
    setHeroGone(false)

    const isIn = dir === 'in'
    const thumbEl = heroThumbRef.current
    // The card thumb rect the hero travels from (open) or to (back).
    const extThumb = isIn
      ? flipFrom.current?.thumb
      : cardThumbRefs.current[selected?.id]?.getBoundingClientRect()

    // Only the thumbnail morphs; the title + content cross-fade via CSS.
    morphThumb(thumbEl, extThumb, {
      open: isIn,
      duration: isIn ? OPEN_DUR : BACK_DUR,
      easing: isIn ? EASE_OUT : EASE_BACK,
    })

    if (isIn) {
      timersRef.current = [
        setTimeout(() => { clearFlip(thumbEl); setDir(null) }, OPEN_TOTAL),
      ]
    } else {
      timersRef.current = [
        // After the hero lands AND the gallery card has faded in beneath it, unmount
        // the hero. The card only reveals once the thumbnail has stopped flying, so the
        // two are never visible at the same time (no overlap), and it can't hover over
        // the scrolling gallery for the rest of the stagger.
        setTimeout(() => setHeroGone(true), BACK_DUR + 90),
        // Let the staggered card slide-in finish before fully settling.
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

  return (
    <div className="projects-root">
      {showGallery && (
        <div className={galleryCls}>
          <div className="proj-gallery">
            {PROJECTS.map((p, i) => (
              <button
                key={p.id}
                className={`proj-card${dir && selected?.id === p.id ? ' is-hero' : ''}`}
                style={{ '--i': i }}
                onClick={() => openProject(p)}
              >
                <div
                  className="proj-thumb"
                  ref={el => { cardThumbRefs.current[p.id] = el }}
                  style={{ background: p.color }}
                />
                <div className="proj-card-body">
                  <div className="proj-card-title">{p.title}</div>
                  <div className="proj-card-meta">{p.year}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showDetail && (
        <div className={detailCls}>
          <button className="proj-back" onClick={goBack}>
            <IconArrowLeft />
            <span>Projects</span>
          </button>
          <div className="proj-detail-thumb" ref={heroThumbRef} style={{ background: selected.color }} />
          <div className="proj-detail-title">{selected.title}</div>
          <div className="proj-detail-fade">
            <div className="proj-detail-role">{selected.role} · {selected.year}</div>
            <div className="proj-detail-tags">
              {selected.tags.map(t => <span key={t} className="glass-tag">{t}</span>)}
            </div>
            <p className="proj-detail-desc">{selected.desc}</p>
            <div className="proj-detail-placeholder">
              <div className="proj-ph-bar" style={{ width: '100%' }} />
              <div className="proj-ph-bar" style={{ width: '80%' }} />
              <div className="proj-ph-bar" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
