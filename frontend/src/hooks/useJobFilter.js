import { useState, useEffect } from 'react'
import { fetchJobs } from '../utils/api'

/**
 * Encapsulates job-feed filter state (role, remote, experience, sortBy, page).
 * Accepts an external `query` string so the global Topbar search drives filtering.
 * Includes a 250ms debounce on input queries to prevent API thrashing.
 *
 * @param {string} query - Search string owned by App-level state.
 */
export function useJobFilter(query = '') {
  const [role, setRole] = useState('all')
  const [remote, setRemote] = useState('all')
  const [experience, setExperience] = useState('all')
  const [sortBy, setSortBy] = useState('deadline') // Default to deadline (expiring soonest first)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const [filteredJobs, setFilteredJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedQuery, role, remote, experience, sortBy])

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
        const response = await fetchJobs({
          role: role !== 'all' ? role : undefined,
          remote: remote !== 'all' ? remote : undefined,
          experience: experience !== 'all' ? experience : undefined,
          query: debouncedQuery.trim() || undefined,
          sort: sortBy,
          page,
          limit: 10
        })
        
        if (isCancelled) return

        // Handle both new paginated response format { jobs, pagination } and legacy array fallback
        const jobsList = Array.isArray(response) ? response : (response.jobs || [])
        const pagination = response.pagination || {}

        setFilteredJobs(jobsList)
        setTotalPages(pagination.totalPages || 1)
        setTotalJobs(pagination.total || jobsList.length)
        setError(null)
      } catch (err) {
        if (!isCancelled) setError(err.message)
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    loadJobs()
    return () => { isCancelled = true }
  }, [debouncedQuery, role, remote, experience, sortBy, page])

  return {
    role, setRole,
    remote, setRemote,
    experience, setExperience,
    sortBy, setSortBy,
    page, setPage,
    totalPages,
    totalJobs,
    filteredJobs,
    loading,
    error
  }
}

