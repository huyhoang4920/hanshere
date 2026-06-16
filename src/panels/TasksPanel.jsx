import { useState } from 'react'

const INITIAL = [
  { t: 'Design MCP feature banner', done: true },
  { t: 'Review portfolio case study', done: true },
  { t: 'Update CV for Product Designer role', done: false },
  { t: 'Finish Next.js portfolio site', done: false },
  { t: 'Write GemPages changelog entry', done: false },
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
