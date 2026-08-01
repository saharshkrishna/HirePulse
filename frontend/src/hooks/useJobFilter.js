import { useState, useEffect } from 'react'
import { fetchJobs } from '../utils/api'

/**
 * Encapsulates job-feed filter state (role, remote, experience, sortBy).
 * Accepts an external `query` string so the global Topbar search drives filtering.
 * Includes a 300ms debounce on input queries to prevent API thrashing.
 *
 * @param {string} query - Search string owned by App-level state.
 */
export function useJobFilter(query = '') {
  const [role, setRole] = useState('all')
  const [remote, setRemote] = useState('all')
  const [experience, setExperience] = useState('all')
  const [sortBy, setSortBy] = useState('match')
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const [filteredJobs, setFilteredJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Debounce external search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 250)
    return () => clearTimeout(handler)
  }, [query])

  useEffect(() => {
    let isCancelled = false
    const loadJobs = async () => {
      setLoading(true)
      try {
        const data = await fetchJobs({
          role: role !== 'all' ? role : undefined,
          remote: remote !== 'all' ? remote : undefined,
          experience: experience !== 'all' ? experience : undefined,
          query: debouncedQuery.trim() || undefined
        })
        
        if (isCancelled) return

        const sorted = [...(data || [])]
        if (sortBy === 'match') sorted.sort((a, b) => (b.match || 0) - (a.match || 0))
        if (sortBy === 'recent') sorted.sort((a, b) => (a.freshness || 0) - (b.freshness || 0))
        if (sortBy === 'company') sorted.sort((a, b) => (a.company || '').localeCompare(b.company || ''))
        
        setFilteredJobs(sorted)
        setError(null)
      } catch (err) {
        if (!isCancelled) setError(err.message)
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    loadJobs()
    return () => { isCancelled = true }
  }, [debouncedQuery, role, remote, experience, sortBy])

  return {
    role, setRole,
    remote, setRemote,
    experience, setExperience,
    sortBy, setSortBy,
    filteredJobs,
    loading,
    error
  }
}
