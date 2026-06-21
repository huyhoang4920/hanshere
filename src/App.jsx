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
  profile:  { title: 'Profile',   w: 350, h: 325 },
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

  const playSound = useCallback(key => {
    const ctx = audioCtxRef.current
    const buf = buffersRef.current[key]
    if (!ctx || !buf) return
    const play = () => {
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.connect(ctx.destination)
      src.start(0)
    }
    ctx.state === 'suspended' ? ctx.resume().then(play) : play()
  }, [])

  const handleDockClick = useCallback(id => {
    if (!win) { playSound('tap'); doOpen(id); return }
    if (win.id === id) {
      playSound('unselect'); setLeaving(makeLeaving(win)); setWin(null)
    } else {
      playSound('tap'); setLeaving(makeLeaving(win)); doOpen(id)
    }
  }, [win, doOpen, makeLeaving, playSound])

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

  const audioCtxRef = useRef(null)
  const buffersRef = useRef({})

  useEffect(() => {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    const ctx = new AC()
    audioCtxRef.current = ctx

    const load = async (url, key) => {
      try {
        const res = await fetch(url)
        const ab = await res.arrayBuffer()
        buffersRef.current[key] = await ctx.decodeAudioData(ab)
      } catch {}
    }

    load(TAP_SFX, 'tap')
    load(UNSELECT_SFX, 'unselect')
    load(SCROLL_SFX, 'scroll')

    return () => ctx.close()
  }, [])

  const handleDockButtonHover = useCallback(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    playSound('scroll')
  }, [playSound])

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
