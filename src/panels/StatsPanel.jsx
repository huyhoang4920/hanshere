const STATS = [
  [{ n: '12', l: 'Tasks done' }, { n: '3', l: 'PRs merged' }, { n: '87%', l: 'Focus' }],
  [{ n: '5', l: 'Meetings' }, { n: '24h', l: 'Deep work' }, { n: '2', l: 'Shipped' }],
]

export default function StatsPanel() {
  return (
    <>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.05em', marginBottom: 4 }}>
        THIS WEEK
      </div>
      {STATS.map((row, i) => (
        <div key={i} className="stat-row">
          {row.map(s => (
            <div key={s.l} className="stat-card">
              <div className="stat-num">{s.n}</div>
              <div className="stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>
      ))}
    </>
  )
}
