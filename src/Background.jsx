import { useState, useEffect } from 'react'
import PHOTO from './assets/Background.png'

function pad(n) { return String(n).padStart(2, '0') }

export default function Background() {
  const [time, setTime] = useState(() => {
    const now = new Date()
    return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  })

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date()
      setTime(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const now = new Date()
  const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()

  return (
    <div className="bg-wrap">
      <div className="bg-bar">
        <div className="bg-row">
          <span>HANS NGUYEN</span>
          <span className="bg-dot" />
          <span>PRODUCT DESIGNER</span>
        </div>
        <span className="bg-dot bg-dot--sep" />
        <div className="bg-row">
          <span>HANOI, VIETNAM</span>
          <span className="bg-dot" />
          <span>{date}</span>
          <span className="bg-dot" />
          <span className="bg-time">{time}</span>
        </div>
      </div>
      <div className="bg-photo" style={{ backgroundImage: `url(${PHOTO})` }} />
    </div>
  )
}
