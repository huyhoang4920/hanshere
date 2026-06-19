import { useMessages } from '../hooks/useMessages'

const AV_CLASSES = ['av-a', 'av-b', 'av-c', 'av-d']

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
  const { messages, loading } = useMessages()

  return (
    <>
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
    </>
  )
}
