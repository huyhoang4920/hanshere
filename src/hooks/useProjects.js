import { useState, useEffect } from 'react'

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/projects')
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch projects')
        return r.json()
      })
      .then(data => setProjects(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { projects, loading, error }
}
