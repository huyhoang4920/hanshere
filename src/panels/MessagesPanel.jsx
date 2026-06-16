const MESSAGES = [
  { av: 'LM', cls: 'av-a', text: 'Hey, can you review the MCP banner copy before we publish?', time: '10:32 AM' },
  { av: 'PL', cls: 'av-b', text: 'Mobile sprint review moved to Thursday, FYI.', time: '11:05 AM' },
  { av: 'TR', cls: 'av-c', text: 'Your portfolio looks great! The GemPages case study is really solid.', time: '2:18 PM' },
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
