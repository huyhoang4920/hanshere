import { useState, useEffect } from 'react'

export function useProject(id) {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)

    fetch(`/api/projects/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch project')
        return r.json()
      })
      .then(data => setProject(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  return { project, loading, error }
}
