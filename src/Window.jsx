import { useRef } from 'react'
import { IconArrowDownRight } from './icons'

export default function Window({ id, title, x, y, width, height, status, genieX, genieY, openDelayed, onClose, onMinimizeEnd, onOpenEnd, onMove, onResize, children }) {
  const winRef = useRef(null)
  const dragState = useRef(null)
  const resizeState = useRef(null)
  const onMoveRef = useRef(onMove)
  const onResizeRef = useRef(onResize)
  onMoveRef.current = onMove
  onResizeRef.current = onResize

  const onMouseMove = useRef(null)
  const onMouseUp = useRef(null)

  if (!onMouseMove.current) {
    onMouseMove.current = e => {
      if (dragState.current) {
        const { startX, startY, origLeft, origTop, deskRect } = dragState.current
        const el = winRef.current
        const maxX = deskRect.width - el.offsetWidth
        const maxY = deskRect.height - el.offsetHeight
        el.style.left = Math.max(0, Math.min(origLeft + e.clientX - startX, maxX)) + 'px'
        el.style.top  = Math.max(0, Math.min(origTop  + e.clientY - startY, maxY)) + 'px'
      }
      if (resizeState.current) {
        const { startX, startY, origW, origH } = resizeState.current
        const el = winRef.current
        el.style.width  = Math.max(220, origW + e.clientX - startX) + 'px'
        el.style.height = Math.max(140, origH + e.clientY - startY) + 'px'
      }
    }
    onMouseUp.current = () => {
      if (dragState.current) {
        const el = winRef.current
        onMoveRef.current(parseInt(el.style.left) || 0, parseInt(el.style.top) || 0)
        dragState.current = null
      }
      if (resizeState.current) {
        const el = winRef.current
        onResizeRef.current(el.offsetWidth, el.offsetHeight)
        resizeState.current = null
      }
    }
    document.addEventListener('mousemove', onMouseMove.current)
    document.addEventListener('mouseup', onMouseUp.current)
  }

  const onBarMouseDown = e => {
    if (e.target.closest('.dots')) return
    e.preventDefault()
    const el = winRef.current
    const desk = el.parentElement
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origLeft: parseInt(el.style.left) || 0,
      origTop:  parseInt(el.style.top)  || 0,
      deskRect: desk.getBoundingClientRect(),
    }
  }

  const onResizeMouseDown = e => {
    e.preventDefault()
    const el = winRef.current
    resizeState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origW: el.offsetWidth,
      origH: el.offsetHeight,
    }
  }

  const handleAnimEnd = () => {
    if (status === 'minimizing') onMinimizeEnd()
    if (status === 'opening')    onOpenEnd()
  }

  const animClass =
    status === 'opening'    ? ` win--opening${openDelayed ? ' win--open-delayed' : ''}` :
    status === 'minimizing' ? ' win--minimizing' : ''

  const extraStyle = genieY != null ? { '--genie-x': `${genieX ?? 0}px`, '--genie-y': `${genieY}px` } : {}

  return (
    <div
      ref={winRef}
      className={`window active${animClass}`}
      style={{ left: x, top: y, width, height, ...extraStyle }}
      onAnimationEnd={handleAnimEnd}
    >
      <div className="win-bar" onMouseDown={onBarMouseDown}>
        <div className="dots">
          <div className="dot dot-r" onClick={e => { e.stopPropagation(); onClose() }} title="Close" />
          <div className="dot dot-y" title="Minimise" />
          <div className="dot dot-g" title="Expand" />
        </div>
        <div className="win-title">{title}</div>
      </div>
      <div className="win-body">{children}</div>
      <div className="resize-handle" onMouseDown={onResizeMouseDown}>
        <IconArrowDownRight />
      </div>
    </div>
  )
}
