const MESSAGES = [
  { av: 'HH', cls: 'av-a', text: 'Hello world', time: '10:32 AM' },
  { av: 'DP', cls: 'av-b', text: 'Touch the grass! Love the vibe', time: '11:05 AM' },
  { av: 'AM', cls: 'av-c', text: 'Your portfolio looks great! The GemPages case study is really solid.', time: '2:18 PM' },
]

export default function MessagesPanel() {
  return (
    <>
      {MESSAGES.map((m, i) => (
        <div key={i} className="msg-row">
          <div className={`msg-av ${m.cls}`}>{m.av}</div>
          <div>
            <div className="msg-bubble">{m.text}</div>
            <div className="msg-time">{m.time}</div>
          </div>
        </div>
      ))}
    </>
  )
}
