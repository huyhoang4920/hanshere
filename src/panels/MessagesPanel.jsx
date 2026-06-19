import { useState, useRef } from 'react'
import { SendDiagonal } from 'iconoir-react'
import { useMessages } from '../hooks/useMessages'

const AV_CLASSES = ['av-a', 'av-b', 'av-c']
const DEFAULT_MESSAGE = { id: 'default', initials: 'HN', cls: 'av-a', text: 'Hello world', time: null }

function MsgRow({ initials, cls, text, time }) {
  return (
    <div className="msg-row">
      <div className={`msg-av ${cls}`}>{initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="msg-bubble">{text}</div>
        {time && <div className="msg-time">{time}</div>}
      </div>
    </div>
  )
}

function MsgSkeleton({ widths = ['140px', '100px'] }) {
  return widths.map((w, i) => (
    <div key={i} className="msg-skeleton">
      <div className="msg-skeleton-av" style={{ animationDelay: `${i * 0.15}s` }} />
      <div className="msg-skeleton-body">
        <div className="msg-skeleton-bubble" style={{ width: w, animationDelay: `${i * 0.15}s` }} />
        <div className="msg-skeleton-time" style={{ animationDelay: `${i * 0.15 + 0.1}s` }} />
      </div>
    </div>
  ))
}

export default function MessagesPanel() {
  const { messages, loading, refetch } = useMessages()
  const [initial, setInitial] = useState('')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const avRef = useRef(null)

  const canSend = text.trim().length > 0 && !sending

  const shake = () => {
    const el = avRef.current
    if (!el) return
    el.classList.remove('is-shaking')
    void el.offsetWidth
    el.classList.add('is-shaking')
    el.addEventListener('animationend', () => el.classList.remove('is-shaking'), { once: true })
  }

  const handleSend = async () => {
    if (!canSend) return
    if (!initial.trim()) { shake(); return }
    setSending(true)
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: initial.trim(), text: text.trim() }),
      })
      setInitial('')
      setText('')
      refetch?.()
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <div className="msg-list">
        <MsgRow {...DEFAULT_MESSAGE} />
        {loading
          ? <MsgSkeleton widths={['160px', '220px', '120px']} />
          : messages.map((m, i) => (
              <MsgRow
                key={m.id}
                initials={m.initials}
                cls={AV_CLASSES[(i + 1) % AV_CLASSES.length]}
                text={m.text}
                time={m.time}
              />
            ))
        }
      </div>

      <div className="msg-compose">
        <div className="msg-compose-av" ref={avRef}>
          <input
            className="msg-compose-initial"
            placeholder="AB"
            maxLength={2}
            value={initial}
            onChange={e => setInitial(e.target.value.toUpperCase())}
          />
        </div>
        <div className="msg-compose-fields">
          <div className="msg-compose-input-row">
            <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
              <textarea
                className="msg-compose-text"
                placeholder="Leave a message…"
                maxLength={200}
                rows={2}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button
              className="msg-compose-send"
              onClick={handleSend}
              disabled={!canSend}
            >
              <SendDiagonal width={15} height={15} strokeWidth={1.8} />
            </button>
          </div>
          <span className="msg-compose-count">{text.length}/200</span>
        </div>
      </div>
    </>
  )
}
