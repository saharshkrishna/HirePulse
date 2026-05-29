import React, { useState, useEffect } from 'react'
import {
  GraduationCap, Briefcase, Search, Filter, Plus, Trash2, Edit3,
  Calendar, MapPin, DollarSign, Clock, ShieldCheck, ShieldAlert,
  Loader2, Check, X, AlertCircle, Sparkles, Building
} from 'lucide-react'
import { Badge, Panel, MatchBar } from '../components/ui'

const API_BASE_URL = 'http://localhost:5000/api'

export function AdminDashboardPage({ currentTab }) {
  // Students state
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')

  // Jobs state
  const [jobs, setJobs] = useState([])
  const [jobsLoading, setJobsLoading] = useState(false)

  // Job Filters
  const [jobFilters, setJobFilters] = useState({
    query: '',
    domain: 'all',
    place: '',
    type: 'all',
    experience: 'all',
    salary: 'all',
    sort: 'date'
  })

  // Modal / Form state for Add/Edit Job
  const [showJobModal, setShowJobModal] = useState(false)
  const [editingJob, setEditingJob] = useState(null) // null if adding new job
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    remote: 'Remote',
    experience: 'experienced',
    salary: '',
    tagsString: '',
    source: 'HirePulse Admin'
  })
  const [formError, setFormError] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)

  // ----------------------------------------------------
  // DATA FETCHING: Students & Jobs
  // ----------------------------------------------------
  
  const fetchStudentsData = async () => {
    setStudentsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/admin/students`)
      if (res.ok) {
        const data = await res.json()
        setStudents(data)
      } else {
        throw new Error('Failed to fetch students from DB')
      }
    } catch (err) {
      console.warn('Backend students fetch failed, loading fallback data:', err)
      // Fallback local mock data
      const mockStudents = [
        {
          id: 'mock-s1',
          name: 'Aarav Mehta',
          email: 'aarav.mehta@stanford.edu',
          phone: '+91 98765 43210',
          profileType: 'student',
          completionPercentage: 80,
          kycStatus: 'Unverified',
          pendingItems: ['Student ID Card photo upload']
        },
        {
          id: 'mock-s2',
          name: 'Sarah Jenkins',
          email: 'sarah.j@mit.edu',
          phone: '+1 (555) 420-1122',
          profileType: 'student',
          completionPercentage: 100,
          kycStatus: 'Verified',
          pendingItems: ['None (Profile Complete)']
        },
        {
          id: 'mock-s3',
          name: 'Rohan Sharma',
          email: 'rohan.sharma@gmail.com',
          phone: '+91 91234 56789',
          profileType: 'fresher',
          completionPercentage: 65,
          kycStatus: 'Unverified',
          pendingItems: ['CV / Resume document upload']
        },
        {
          id: 'mock-s4',
          name: 'Priya Nair',
          email: 'priya.nair@microsoft.com',
          phone: '+91 88888 77777',
          profileType: 'experienced',
          completionPercentage: 100,
          kycStatus: 'Verified',
          pendingItems: ['None (Profile Complete)']
        }
      ]
      setStudents(mockStudents)
    } finally {
      setStudentsLoading(false)
    }
  }

  const fetchJobsData = async () => {
    setJobsLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (jobFilters.query) queryParams.append('query', jobFilters.query)
      if (jobFilters.domain !== 'all') queryParams.append('domain', jobFilters.domain)
      if (jobFilters.place) queryParams.append('place', jobFilters.place)
      if (jobFilters.type !== 'all') queryParams.append('type', jobFilters.type)
      if (jobFilters.experience !== 'all') queryParams.append('experience', jobFilters.experience)
      if (jobFilters.salary !== 'all') queryParams.append('salary', jobFilters.salary)
      queryParams.append('sort', jobFilters.sort)

      const res = await fetch(`${API_BASE_URL}/jobs?${queryParams.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setJobs(data)
      } else {
        throw new Error('Failed to fetch jobs from DB')
      }
    } catch (err) {
      console.warn('Backend jobs fetch failed, loading fallback data:', err)
      // Fallback local mock jobs
      const mockJobs = [
        {
          _id: 'mock-j1',
          title: 'Frontend Engineer',
          company: 'Greenhouse Inc.',
          location: 'Bangalore, IN',
          remote: 'Hybrid',
          experience: 'experienced',
          salary: '$80k - $100k',
          tags: ['React', 'TypeScript', 'Tailwind'],
          source: 'Greenhouse Direct',
          posted: '2 hours ago',
          isRecent: true
        },
        {
          _id: 'mock-j2',
          title: 'QA Automation Tester',
          company: 'Lever Tech',
          location: 'Remote',
          remote: 'Remote',
          experience: 'fresher',
          salary: '₹6 - ₹8 LPA',
          tags: ['Selenium', 'Java', 'Python'],
          source: 'Lever API',
          posted: '1 day ago',
          isRecent: false
        },
        {
          _id: 'mock-j3',
          title: 'DevOps Cloud Engineer',
          company: 'Ashby',
          location: 'Hyderabad, IN',
          remote: 'Onsite',
          experience: 'experienced',
          salary: '₹18 - ₹24 LPA',
          tags: ['AWS', 'Docker', 'Kubernetes'],
          source: 'Ashby Boards',
          posted: 'Just now',
          isRecent: true
        }
      ]
      
      // Perform local mock filtering
      let filtered = [...mockJobs]
      if (jobFilters.query) {
        const q = jobFilters.query.toLowerCase()
        filtered = filtered.filter(j => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q))
      }
      if (jobFilters.domain !== 'all') {
        const d = jobFilters.domain.toLowerCase()
        filtered = filtered.filter(j => j.tags.some(t => t.toLowerCase().includes(d)) || j.title.toLowerCase().includes(d))
      }
      if (jobFilters.place) {
        const p = jobFilters.place.toLowerCase()
        filtered = filtered.filter(j => j.location.toLowerCase().includes(p))
      }
      if (jobFilters.type !== 'all') {
        filtered = filtered.filter(j => j.remote.toLowerCase() === jobFilters.type.toLowerCase())
      }
      if (jobFilters.experience !== 'all') {
        filtered = filtered.filter(j => j.experience.toLowerCase() === jobFilters.experience.toLowerCase())
      }
      setJobs(filtered)
    } finally {
      setJobsLoading(false)
    }
  }

  // Load data based on current tab
  useEffect(() => {
    if (currentTab === 'students') {
      fetchStudentsData()
    } else {
      fetchJobsData()
    }
  }, [currentTab, jobFilters])

  // ----------------------------------------------------
  // JOB CRUD OPERATIONS
  // ----------------------------------------------------
  
  const handleOpenAddModal = () => {
    setEditingJob(null)
    setJobForm({
      title: '',
      company: '',
      location: '',
      remote: 'Remote',
      experience: 'experienced',
      salary: '',
      tagsString: '',
      source: 'HirePulse Admin'
    })
    setFormError('')
    setShowJobModal(true)
  }

  const handleOpenEditModal = (job) => {
    setEditingJob(job)
    setJobForm({
      title: job.title,
      company: job.company,
      location: job.location,
      remote: job.remote || 'Remote',
      experience: job.experience || 'experienced',
      salary: job.salary,
      tagsString: job.tags ? job.tags.join(', ') : '',
      source: job.source || 'HirePulse Admin'
    })
    setFormError('')
    setShowJobModal(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!jobForm.title || !jobForm.company) {
      setFormError('Job Title and Company are required.')
      return
    }

    setFormSubmitting(true)
    const payload = {
      title: jobForm.title,
      company: jobForm.company,
      location: jobForm.location || 'Remote',
      remote: jobForm.remote,
      experience: jobForm.experience,
      salary: jobForm.salary || 'Competitive',
      tags: jobForm.tagsString.split(',').map(t => t.trim()).filter(Boolean),
      source: jobForm.source
    }

    try {
      let res
      if (editingJob) {
        // Edit Operation
        res = await fetch(`${API_BASE_URL}/jobs/${editingJob._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        // Add Operation
        res = await fetch(`${API_BASE_URL}/jobs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (res.ok) {
        setShowJobModal(false)
        fetchJobsData() // Refresh jobs list
      } else {
        const errData = await res.json()
        throw new Error(errData.error || 'Request failed')
      }
    } catch (err) {
      console.warn('Backend CRUD failed, falling back to local memory simulation:', err)
      // Fallback logic inside state
      if (editingJob) {
        setJobs(jobs.map(j => j._id === editingJob._id ? { ...j, ...payload } : j))
      } else {
        const newMockJob = {
          _id: 'mock-' + Math.random().toString(36).substr(2, 9),
          ...payload,
          posted: 'Just now',
          isRecent: true
        }
        setJobs([newMockJob, ...jobs])
      }
      setShowJobModal(false)
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDeleteJob = async (id) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return

    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setJobs(jobs.filter(j => j._id !== id))
      } else {
        throw new Error('Delete request failed on DB')
      }
    } catch (err) {
      console.warn('Backend DELETE failed, executing local state filter:', err)
      // Fallback
      setJobs(jobs.filter(j => j._id !== id))
    }
  }

  // Filter students by search term
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
    s.email.toLowerCase().includes(studentSearch.toLowerCase())
  )

  // ----------------------------------------------------
  // SUB-VIEW RENDERERS
  // ----------------------------------------------------

  const renderStudentsView = () => {
    return (
      <div className="space-y-6">
        {/* Header / Search bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Students Directory</h1>
            <p className="text-sm text-textmuted">Verify user profile completeness and check KYC documents.</p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textmuted" size={18} />
            <input
              type="text"
              placeholder="Search students by name or email..."
              className="input pl-10"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Directory Table */}
        <Panel className="p-0 overflow-hidden">
          {studentsLoading ? (
            <div className="p-12 text-center text-textmuted flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-primary" size={32} />
              <span>Fetching student records...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-textmuted">
              No student profiles found matching your search.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Profile Type</th>
                    <th>Completion %</th>
                    <th>KYC Status</th>
                    <th>What's Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm leading-tight">{s.name}</div>
                            <div className="text-xs text-textmuted mt-0.5">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="capitalize text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-2 border border-border">
                          {s.profileType}
                        </span>
                      </td>
                      <td className="w-44">
                        <div className="flex items-center gap-3">
                          <div className="w-20">
                            <MatchBar value={s.completionPercentage} />
                          </div>
                          <span className="text-xs font-bold">{s.completionPercentage}%</span>
                        </div>
                      </td>
                      <td>
                        {s.kycStatus === 'Verified' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-full border border-success/20">
                            <ShieldCheck size={12} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning bg-warning/10 px-2 py-1 rounded-full border border-warning/20">
                            <ShieldAlert size={12} /> Unverified
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {s.pendingItems.map((item, idx) => (
                            <span 
                              key={idx} 
                              className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                                s.completionPercentage === 100 
                                  ? 'bg-success/5 text-success/80 border border-success/20' 
                                  : 'bg-warning/5 text-warning/80 border border-warning/20'
                              }`}
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    )
  }

  const renderJobsView = () => {
    return (
      <div className="space-y-6">
        {/* Header / Create button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Job Listings</h1>
            <p className="text-sm text-textmuted">Add, update, or remove job listings from the system index.</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="btn btn-primary bg-primary text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-95 self-start md:self-auto"
          >
            <Plus size={18} />
            Add New Job
          </button>
        </div>

        {/* Filter Toolbar Panel */}
        <Panel className="p-4 space-y-4">
          <div className="flex items-center gap-2 font-display text-sm font-semibold border-b border-border/60 pb-2 text-primary">
            <Filter size={16} />
            <span>Search & Filter Listings</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Query */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textmuted">Keyword Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textmuted" size={14} />
                <input
                  type="text"
                  placeholder="Title or Company..."
                  className="input pl-8 text-xs py-2"
                  value={jobFilters.query}
                  onChange={(e) => setJobFilters({ ...jobFilters, query: e.target.value })}
                />
              </div>
            </div>

            {/* Job Domain */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textmuted">Job Domain</label>
              <select
                className="select text-xs py-2"
                value={jobFilters.domain}
                onChange={(e) => setJobFilters({ ...jobFilters, domain: e.target.value })}
              >
                <option value="all">All Domains</option>
                <option value="React">React</option>
                <option value="Node">Node.js</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Python">Python</option>
                <option value="AWS">AWS / Cloud</option>
                <option value="Selenium">QA Automation</option>
              </select>
            </div>

            {/* Place / Location */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textmuted">Place / Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-textmuted" size={14} />
                <input
                  type="text"
                  placeholder="e.g. Bangalore, Remote..."
                  className="input pl-8 text-xs py-2"
                  value={jobFilters.place}
                  onChange={(e) => setJobFilters({ ...jobFilters, place: e.target.value })}
                />
              </div>
            </div>

            {/* Remote Type */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textmuted">Job Type</label>
              <select
                className="select text-xs py-2"
                value={jobFilters.type}
                onChange={(e) => setJobFilters({ ...jobFilters, type: e.target.value })}
              >
                <option value="all">All Types</option>
                <option value="Remote">Remote Only</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">Onsite</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Experience Level */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textmuted">Experience Level</label>
              <select
                className="select text-xs py-2"
                value={jobFilters.experience}
                onChange={(e) => setJobFilters({ ...jobFilters, experience: e.target.value })}
              >
                <option value="all">All Experience Levels</option>
                <option value="fresher">Fresher</option>
                <option value="experienced">Experienced</option>
              </select>
            </div>

            {/* Salary Range */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textmuted">Salary Range</label>
              <select
                className="select text-xs py-2"
                value={jobFilters.salary}
                onChange={(e) => setJobFilters({ ...jobFilters, salary: e.target.value })}
              >
                <option value="all">All Salaries</option>
                <option value="LPA">LPA (INR Listings)</option>
                <option value="$">$ (USD Listings)</option>
                <option value="Competitive">Competitive Only</option>
              </select>
            </div>

            {/* Sort by date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textmuted">Sort Order</label>
              <select
                className="select text-xs py-2"
                value={jobFilters.sort}
                onChange={(e) => setJobFilters({ ...jobFilters, sort: e.target.value })}
              >
                <option value="date">Listed Date: Newest First</option>
              </select>
            </div>
          </div>
        </Panel>

        {/* Jobs List Grid */}
        {jobsLoading ? (
          <div className="p-12 text-center text-textmuted flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-primary" size={32} />
            <span>Fetching job listings...</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-textmuted border border-border border-dashed rounded-2xl bg-surface/20">
            No job listings found matching the specified filter criteria.
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <article key={job._id} className="job-card p-5 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Job Info */}
                  <div className="flex gap-4 items-start flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border text-primary flex items-center justify-center font-bold text-sm uppercase">
                      {job.company.charAt(0)}
                    </div>
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-lg leading-tight text-text">{job.title}</h3>
                        {job.isRecent && <Badge tone="success">New</Badge>}
                        <Badge>{job.source}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-textmuted">
                        <span className="flex items-center gap-1"><Building size={14} />{job.company}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><MapPin size={14} />{job.location} ({job.remote})</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><DollarSign size={14} />{job.salary}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 capitalize"><Clock size={14} />{job.experience}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {job.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-surface-2 border border-border px-2 py-0.5 rounded-full text-textmuted">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Admin Action buttons */}
                  <div className="flex md:flex-col items-center md:items-stretch gap-2 justify-end self-end md:self-auto min-w-[130px]">
                    <button
                      onClick={() => handleOpenEditModal(job)}
                      className="btn font-semibold hover:border-primary/50 text-xs py-2 flex items-center gap-1.5 flex-1 md:flex-none justify-center"
                    >
                      <Edit3 size={14} />
                      Edit Job
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="btn text-xs py-2 border-warning/30 hover:border-warning/60 hover:bg-warning/10 text-warning flex items-center gap-1.5 flex-1 md:flex-none justify-center"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ----------------------------------------------------
  // RENDER FORM MODAL (Add/Edit Job)
  // ----------------------------------------------------
  
  const renderJobModal = () => {
    if (!showJobModal) return null

    return (
      <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="panel max-w-lg w-full p-6 md:p-8 space-y-6 backdrop-blur-md relative border border-border">
          <button
            onClick={() => setShowJobModal(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-surface-2 border border-border hover:bg-border/20 text-textmuted"
          >
            <X size={16} />
          </button>

          <div>
            <h2 className="font-display text-xl font-bold">
              {editingJob ? 'Edit Job Listing' : 'Create Job Listing'}
            </h2>
            <p className="text-xs text-textmuted mt-1">
              {editingJob ? 'Modify parameters for the listed career posting.' : 'Add a new software career listing to the matching engine.'}
            </p>
          </div>

          {formError && (
            <div className="p-3 bg-warning/10 border border-warning/20 text-warning text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-textmuted">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior React Developer"
                  className="input"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-textmuted">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Microsoft"
                  className="input"
                  value={jobForm.company}
                  onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-textmuted">Place / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore, IN"
                  className="input"
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-textmuted">Salary Range</label>
                <input
                  type="text"
                  placeholder="e.g. $120k - $140k or ₹12 - ₹16 LPA"
                  className="input"
                  value={jobForm.salary}
                  onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-textmuted">Job Type</label>
                <select
                  className="select"
                  value={jobForm.remote}
                  onChange={(e) => setJobForm({ ...jobForm, remote: e.target.value })}
                >
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>Onsite</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-textmuted">Experience Required</label>
                <select
                  className="select"
                  value={jobForm.experience}
                  onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                >
                  <option value="fresher">Fresher (Entry Level)</option>
                  <option value="experienced">Experienced (Mid/Senior)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-textmuted">Skill Tags (Comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, AWS, Testing"
                className="input"
                value={jobForm.tagsString}
                onChange={(e) => setJobForm({ ...jobForm, tagsString: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-textmuted">Source Platform / Channel</label>
              <input
                type="text"
                placeholder="e.g. Greenhouse API, Ashby Board"
                className="input"
                value={jobForm.source}
                onChange={(e) => setJobForm({ ...jobForm, source: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setShowJobModal(false)}
                className="btn font-semibold"
                disabled={formSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary bg-primary text-white font-semibold rounded-xl flex items-center gap-1.5 px-6"
                disabled={formSubmitting}
              >
                {formSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {editingJob ? 'Save Changes' : 'Create Listing'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // MAIN BODY RENDERER
  // ----------------------------------------------------

  return (
    <div className="page-wrap px-4 lg:px-8 py-6 lg:py-8 space-y-6">
      {currentTab === 'students' ? renderStudentsView() : renderJobsView()}
      {renderJobModal()}
    </div>
  )
}
