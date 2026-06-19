import { useState } from 'react'

const INITIAL = [
  { t: 'Finalize the case studies', done: true },
  { t: 'Publish the site!', done: true },
  { t: 'Use hosting for faster content loading', done: false },
  { t: 'ADHD mode for website', done: false },
  { t: 'Random fact generator', done: false },
]

export default function TasksPanel() {
  const [tasks, setTasks] = useState(INITIAL)

  const toggle = i =>
    setTasks(prev => prev.map((task, idx) => idx === i ? { ...task, done: !task.done } : task))

  return (
    <>
      {tasks.map((task, i) => (
        <div key={i} className="task-row">
          <div
            className={`chk${task.done ? ' done' : ''}`}
            onClick={() => toggle(i)}
            role="checkbox"
            aria-checked={task.done}
            aria-label={task.t}
          >
            {task.done && <i className="ti ti-check" style={{ fontSize: 10, color: '#fff' }} />}
          </div>
          <span className={`task-lbl${task.done ? ' done' : ''}`}>{task.t}</span>
        </div>
      ))}
    </>
  )
}
