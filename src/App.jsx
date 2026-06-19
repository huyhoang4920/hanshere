import { useState, useRef, useCallback, useEffect } from 'react'
import { IconUser, IconBriefcase, IconMail } from './icons'
import { TaskList } from 'iconoir-react'
const TaskListIcon = () => <TaskList width={20} height={20} strokeWidth={1.5} />
import './App.css'
import SCROLL_SFX from './assets/Scroll SFX.mp3'
import UNSELECT_SFX from './assets/Unselect SFX.mp3'
import TAP_SFX from './assets/Tap SFX.mp3'
import Background from './Background'
import Window from './Window'

const DOCK_ICONS = { profile: IconUser, projects: IconBriefcase, tasks: TaskListIcon, messages: IconMail }
import ProfilePanel from './panels/ProfilePanel'
import ProjectsPanel from './panels/ProjectsPanel'
import TasksPanel from './panels/TasksPanel'
import MessagesPanel from './panels/MessagesPanel'

const DOCK_H = 96

const CONFIGS = {
  profile:  { title: 'Profile',   w: 350, h: 270 },
  projects: { title: 'Projects',  w: 500, h: 520 },
  tasks:    { title: 'Tasks',     w: 350, h: 250 },
  messages: { title: 'Messages',  w: 350, h: 400 },
}

const PANELS = { profile: ProfilePanel, projects: ProjectsPanel, tasks: TasksPanel, messages: MessagesPanel }

export default function App() {
  const [win, setWin] = useState(null)
  const [leaving, setLeaving] = useState(null)
  const desktopRef = useRef(null)

  const doOpen = useCallback(id => {
    const cfg = CONFIGS[id]
    const dw = desktopRef.current?.clientWidth  ?? 900
    const dh = desktopRef.current?.clientHeight ?? 620
    const isMobile = dw < 640
    const w = (id === 'projects' && isMobile) ? dw - 40 : cfg.w
    const h = cfg.h
    const gap = isMobile ? 16 : 24
    setWin({
      id,
      title: cfg.title,
      x: Math.round((dw - w) / 2),
      y: Math.max(16, dh - DOCK_H - h - gap),
      width: w,
      height: h,
      status: 'opening',
    })
  }, [])

  const makeLeaving = useCallback(w => {
    const dw = desktopRef.current?.clientWidth  ?? 900
    const dh = desktopRef.current?.clientHeight ?? 620
    const genieX = dw / 2 - (w.x + w.width / 2)
    const genieY = (dh - DOCK_H) - w.y - w.height + 16
    return { ...w, genieX, genieY }
  }, [])

  const playTap = useCallback(() => {
    const a = tapAudioRef.current
    if (!a) return
    a.currentTime = 0
    a.play().catch(() => {})
  }, [])

  const handleDockClick = useCallback(id => {
    if (!win) { playTap(); doOpen(id); return }
    if (win.id === id) {
      setLeaving(makeLeaving(win)); setWin(null)
    } else {
      isSwitchingRef.current = true; playTap(); setLeaving(makeLeaving(win)); doOpen(id)
    }
  }, [win, doOpen, makeLeaving, playTap])

  const handleLeavingEnd = useCallback(() => setLeaving(null), [])
  const handleOpenEnd    = useCallback(() => setWin(prev => prev ? { ...prev, status: 'open' } : prev), [])
  const handleClose      = useCallback(() => { setLeaving(makeLeaving(win)); setWin(null) }, [win, makeLeaving])
  const handleMove       = useCallback((x, y) => setWin(prev => prev ? { ...prev, x, y } : prev), [])
  const handleResize     = useCallback((w, h) => setWin(prev => prev ? { ...prev, width: w, height: h } : prev), [])

  const activeId = win?.status !== 'minimizing' ? win?.id : null

  // Track the button that just lost active so we can play the return slot animation
  const [returningId, setReturningId] = useState(null)
  const prevActiveIdRef = useRef(null)
  useEffect(() => {
    const prev = prevActiveIdRef.current
    prevActiveIdRef.current = activeId
    if (prev && prev !== activeId) {
      setReturningId(prev)
      const t = setTimeout(() => setReturningId(null), 400)
      return () => clearTimeout(t)
    }
  }, [activeId])

  // Keep pill mounted during exit animation, freeze position on exit
  const [pillMounted, setPillMounted] = useState(false)
  const pillExiting = pillMounted && !activeId
  const lastPillIndexRef = useRef(0)
  if (activeId) {
    const items = Object.keys(CONFIGS)
    const idx = items.indexOf(activeId)
    if (idx >= 0) lastPillIndexRef.current = idx
  }
  useEffect(() => {
    if (activeId) {
      setPillMounted(true)
    } else if (pillMounted) {
      const t = setTimeout(() => setPillMounted(false), 300)
      return () => clearTimeout(t)
    }
  }, [activeId])

  const scrollAudioRef = useRef(null)
  const unselectAudioRef = useRef(null)
  const tapAudioRef = useRef(null)
  const isSwitchingRef = useRef(false)

  useEffect(() => {
    scrollAudioRef.current = new Audio(SCROLL_SFX)
    unselectAudioRef.current = new Audio(UNSELECT_SFX)
    tapAudioRef.current = new Audio(TAP_SFX)

    const unlock = () => {
      [scrollAudioRef.current, unselectAudioRef.current, tapAudioRef.current].forEach(a => {
        if (!a) return
        a.volume = 0
        a.play().then(() => { a.pause(); a.currentTime = 0; a.volume = 1 }).catch(() => {})
      })
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchstart', unlock)
    }
    document.addEventListener('click', unlock)
    document.addEventListener('touchstart', unlock)
    return () => {
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchstart', unlock)
    }
  }, [])

  useEffect(() => {
    if (!returningId) return
    if (isSwitchingRef.current) { isSwitchingRef.current = false; return }
    const a = unselectAudioRef.current
    if (!a) return
    a.currentTime = 0
    a.play().catch(() => {})
  }, [returningId])

  const handleDockButtonHover = useCallback(() => {
    const a = scrollAudioRef.current
    if (!a) return
    a.currentTime = 0
    a.play().catch(() => {})
  }, [])

  const glowRef = useRef(null)
  const dockRef = useRef(null)
  const dockBtnWidth = useCallback(() => {
    const btn = dockRef.current?.querySelector('.dock-btn')
    return btn ? btn.offsetWidth : 100
  }, [])

  const handleZoneMouseMove = useCallback(e => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const glow = glowRef.current
    const dock = dockRef.current
    if (!glow || !dock) return

    // Glow follows cursor relative to dock
    const dockRect = dock.getBoundingClientRect()
    glow.style.left = (e.clientX - dockRect.left) + 'px'
    glow.style.top  = (e.clientY - dockRect.top)  + 'px'

    // Dock shifts ±10px based on cursor offset from zone center
    const zoneRect = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - (zoneRect.left + zoneRect.width  / 2)) / (zoneRect.width  / 2)
    const ny = (e.clientY - (zoneRect.top  + zoneRect.height / 2)) / (zoneRect.height / 2)
    dock.style.transform = `translate(${nx * 10}px, ${ny * 10}px)`
  }, [])

  const handleZoneMouseEnter = useCallback(() => {
    if (glowRef.current) glowRef.current.style.opacity = '1'
  }, [])

  const handleZoneMouseLeave = useCallback(() => {
    if (glowRef.current) glowRef.current.style.opacity = '0'
    if (dockRef.current) dockRef.current.style.transform = 'translate(0, 0)'
  }, [])

  return (
    <div ref={desktopRef} className="desktop" aria-label="Liquid glass desktop">
      <Background />

      {leaving && (() => {
        const Panel = PANELS[leaving.id]
        return (
          <Window key={leaving.id} {...leaving} status="minimizing"
            onClose={() => {}} onMinimizeEnd={handleLeavingEnd} onOpenEnd={() => {}} onMove={() => {}} onResize={() => {}}
            bodyClass={leaving.id === 'messages' ? 'win-body--messages' : undefined}>
            <Panel />
          </Window>
        )
      })()}

      {win && (() => {
        const Panel = PANELS[win.id]
        return (
          <Window key={win.id} {...win} openDelayed={!!leaving}
            onClose={handleClose} onMinimizeEnd={() => {}} onOpenEnd={handleOpenEnd} onMove={handleMove} onResize={handleResize}
            bodyClass={win.id === 'messages' ? 'win-body--messages' : undefined}>
            <Panel />
          </Window>
        )
      })()}

      <div className="dock-zone" onMouseMove={handleZoneMouseMove} onMouseEnter={handleZoneMouseEnter} onMouseLeave={handleZoneMouseLeave}>
      <div ref={dockRef} className="dock">
        {(() => {
          const items = Object.entries(CONFIGS)
          const activeIndex = items.findIndex(([id]) => id === activeId)
          return (
            <>
              <div ref={glowRef} className="dock-glow" />
              {pillMounted && (
                <div
                  className={`dock-pill${pillExiting ? ' dock-pill--exit' : ''}`}
                  style={{ left: 6 + lastPillIndexRef.current * dockBtnWidth() + 'px' }}
                />
              )}
              {items.map(([id, cfg], i) => (
                <button key={id}
                  className={`dock-btn${activeId === id ? ' dock-btn--active' : ''}${returningId === id ? ' dock-btn--returning' : ''}`}
                  onClick={() => handleDockClick(id)}
                  onMouseEnter={handleDockButtonHover}
>
                  <div className="dock-btn-scroll">
                    <span className="dock-btn-icon">{(() => { const Icon = DOCK_ICONS[id]; return <Icon /> })()}</span>
                    <span className="dock-btn-label">{cfg.title}</span>
                  </div>
                </button>
              ))}
            </>
          )
        })()}
      </div>
      </div>
    </div>
  )
}
