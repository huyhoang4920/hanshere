import { useState, useEffect, useCallback } from 'react'

export function useMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMessages = useCallback(() => {
    setLoading(true)
    fetch('/api/messages')
      .then(r => { if (!r.ok) throw new Error('Failed to fetch messages'); return r.json() })
      .then(data => setMessages(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  return { messages, loading, error, refetch: fetchMessages }
}
