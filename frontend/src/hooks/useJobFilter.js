import { useState, useEffect } from 'react'
import { fetchJobs } from '../utils/api'

/**
 * Encapsulates job-feed filter state (role, remote, experience, sortBy).
 * Accepts an external `query` string so the global Topbar search drives filtering.
 *
 * @param {string} query - Search string owned by App-level state.
 */
export function useJobFilter(query = '') {
  const [role, setRole] = useState('all')
  const [remote, setRemote] = useState('all')
  const [experience, setExperience] = useState('all')
  const [sortBy, setSortBy] = useState('match')
  const [filteredJobs, setFilteredJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true)
      try {
        const data = await fetchJobs({ role, remote, experience, query })
        
        // Sorting still done on client side for now, or could be moved to server
        const sorted = [...data]
        if (sortBy === 'match') sorted.sort((a, b) => b.match - a.match)
        if (sortBy === 'recent') sorted.sort((a, b) => a.freshness - b.freshness)
        if (sortBy === 'company') sorted.sort((a, b) => a.company.localeCompare(b.company))
        
        setFilteredJobs(sorted)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadJobs()
  }, [query, role, remote, experience, sortBy])

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
