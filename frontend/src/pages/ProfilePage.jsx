import React, { useState, useEffect } from 'react'
import {
  User, Mail, Phone, MapPin, Briefcase, FileText, UploadCloud,
  Plus, X, Check, CheckCircle2, Sparkles, Building2, ExternalLink,
  Shield, ArrowUpRight, FileCheck, Trash2, Download, Eye, RefreshCw,
  Clock, CheckCircle, AlertCircle, ChevronRight, Send
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { fetchJobs } from '../utils/api'

const POPULAR_SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker',
  'PostgreSQL', 'TailwindCSS', 'GraphQL', 'Next.js', 'Go', 'Kubernetes',
  'React Native', 'PyTorch', 'Rust', 'Kafka', 'Redis', 'MongoDB'
]

const DEFAULT_APPLIED_JOBS = [
  {
    id: 1,
    title: 'Senior Frontend Engineer',
    company: 'Google',
    location: 'Mountain View, CA',
    salary: '$180k–$240k',
    appliedDate: 'Applied 2 days ago',
    status: 'Interview Scheduled',
    statusTone: 'success',
    matchScore: 95,
    source: 'Greenhouse'
  },
  {
    id: 2,
    title: 'Backend Engineer – Payments',
    company: 'Stripe',
    location: 'Remote',
    salary: '$140k–$180k',
    appliedDate: 'Applied 4 days ago',
    status: 'Under Review',
    statusTone: 'primary',
    matchScore: 88,
    source: 'Lever'
  },
  {
    id: 4,
    title: 'Full Stack Developer',
    company: 'Shopify',
    location: 'Remote',
    salary: '$110k–$150k',
    appliedDate: 'Applied 1 week ago',
    status: 'Screening',
    statusTone: 'warning',
    matchScore: 91,
    source: 'RemoteOK'
  }
]

export function ProfilePage() {
  const { user, updateUserProfile } = useAuth()
  
  // Skills state
  const defaultSkills = user?.skills || [
    'React', 'TypeScript', 'Node.js', 'CSS', 'PostgreSQL', 'AWS'
  ]
  const [skills, setSkills] = useState(defaultSkills)
  const [newSkillInput, setNewSkillInput] = useState('')
  
  // Applied Jobs State
  const defaultApplied = user?.appliedJobs || DEFAULT_APPLIED_JOBS
  const [appliedJobs, setAppliedJobs] = useState(defaultApplied)
  const [appliedFilter, setAppliedFilter] = useState('all')

  // Resume state
  const defaultResume = user?.resume || {
    filename: user?.profileDetails?.cvFile || 'alex_developer_resume_2026.pdf',
    uploadDate: 'July 24, 2026',
    fileSize: '1.4 MB',
    status: 'Verified'
  }
  const [resume, setResume] = useState(defaultResume)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Matching Jobs State
  const [matchingJobs, setMatchingJobs] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [notification, setNotification] = useState('')

  // Bio state
  const [bio, setBio] = useState(user?.bio || 'Full-stack software engineer passionate about modern web performance, cloud infrastructure, and AI systems.')
  const [isEditingBio, setIsEditingBio] = useState(false)

  // Notification helper
  const showNotification = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 3500)
  }

  // Load live jobs and compute matching percentage
  useEffect(() => {
    const loadJobsAndMatch = async () => {
      setLoadingJobs(true)
      try {
        const allJobs = await fetchJobs()
        
        const evaluatedJobs = allJobs.map(job => {
          const jobTags = job.tags || []
          const matched = jobTags.filter(tag => 
            skills.some(skill => skill.toLowerCase() === tag.toLowerCase())
          )
          
          let computedMatch = job.match || 75
          if (jobTags.length > 0) {
            const overlapRatio = matched.length / jobTags.length
            computedMatch = Math.min(99, Math.max(50, Math.round(overlapRatio * 100)))
          }

          return {
            ...job,
            matchedTags: matched,
            missingTags: jobTags.filter(tag => !matched.includes(tag)),
            calculatedMatch: computedMatch,
            isApplied: appliedJobs.some(a => a.title.toLowerCase() === job.title.toLowerCase() && a.company.toLowerCase() === job.company.toLowerCase())
          }
        })

        evaluatedJobs.sort((a, b) => b.calculatedMatch - a.calculatedMatch)
        setMatchingJobs(evaluatedJobs)
      } catch (err) {
        console.error('Failed to load matching jobs:', err)
      } finally {
        setLoadingJobs(false)
      }
    }

    loadJobsAndMatch()
  }, [skills, appliedJobs])

  // Skill Handlers
  const handleAddSkill = (skillToAdd) => {
    const trimmed = skillToAdd.trim()
    if (!trimmed) return

    if (skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      showNotification(`"${trimmed}" is already in your skills list!`)
      return
    }

    const updated = [...skills, trimmed]
    setSkills(updated)
    updateUserProfile({ skills: updated })
    setNewSkillInput('')
    showNotification(`Added "${trimmed}" to your skills. Job match scores updated!`)
  }

  const handleRemoveSkill = (skillToRemove) => {
    const updated = skills.filter(s => s !== skillToRemove)
    setSkills(updated)
    updateUserProfile({ skills: updated })
    showNotification(`Removed "${skillToRemove}".`)
  }

  // Handle Quick Application from Matching Jobs
  const handleQuickApply = (job) => {
    if (appliedJobs.some(a => a.title.toLowerCase() === job.title.toLowerCase() && a.company.toLowerCase() === job.company.toLowerCase())) {
      showNotification(`You have already applied for ${job.title} at ${job.company}!`)
      return
    }

    const newApplication = {
      id: Date.now(),
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      appliedDate: 'Applied Just Now',
      status: 'Under Review',
      statusTone: 'primary',
      matchScore: job.calculatedMatch,
      source: job.source || 'Direct'
    }

    const updated = [newApplication, ...appliedJobs]
    setAppliedJobs(updated)
    updateUserProfile({ appliedJobs: updated })
    showNotification(`🎉 Application submitted successfully for ${job.title} at ${job.company}!`)
  }

  // Withdraw Application
  const handleWithdrawApplication = (id, title) => {
    const updated = appliedJobs.filter(a => a.id !== id)
    setAppliedJobs(updated)
    updateUserProfile({ appliedJobs: updated })
    showNotification(`Withdrew application for ${title}.`)
  }

  // Resume File Upload Simulation
  const handleResumeUpload = (file) => {
    if (!file) return
    setIsUploading(true)
    setUploadProgress(0)

    let progress = 0
    const interval = setInterval(() => {
      progress += 25
      setUploadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setIsUploading(false)
        const updatedResume = {
          filename: file.name,
          uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
          status: 'Verified'
        }
        setResume(updatedResume)
        updateUserProfile({ resume: updatedResume })
        showNotification('Resume updated and verified successfully!')
      }
    }, 200)
  }

  const handleSaveBio = () => {
    setIsEditingBio(false)
    updateUserProfile({ bio })
    showNotification('Profile bio updated!')
  }

  // Filtered Applied Jobs list
  const filteredAppliedJobs = appliedJobs.filter(item => {
    if (appliedFilter === 'interviewing') return item.status === 'Interview Scheduled'
    if (appliedFilter === 'review') return item.status === 'Under Review' || item.status === 'Screening'
    return true
  })

  const getStatusBadgeClass = (tone) => {
    if (tone === 'success') return 'bg-success/15 text-success border-success/30'
    if (tone === 'warning') return 'bg-warning/15 text-warning border-warning/30'
    return 'bg-primary/15 text-primary border-primary/30'
  }

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white text-sm px-4 py-3 rounded-xl shadow-lg border border-primary/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Sparkles size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* Profile Header Banner */}
      <div className="panel p-6 md:p-8 backdrop-blur-md relative overflow-hidden border-t-4 border-t-primary">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent text-primary flex items-center justify-center font-bold text-3xl border-2 border-primary/30 shadow-inner flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-textmain">
                  {user?.name || 'Candidate Account'}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {user?.role === 'admin' ? 'Administrator' : user?.profileType || 'Full Stack Engineer'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20 flex items-center gap-1">
                  <Shield size={12} /> Verified Profile
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-textmuted">
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-primary" />
                  {user?.email || 'alex.dev@hirepulse.com'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-primary" />
                  {user?.phone || '+1 (555) 234-5678'}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary" />
                  San Francisco, CA (Remote & Hybrid)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 bg-surface-2/60 p-4 rounded-xl border border-border/80 text-center self-stretch md:self-auto justify-around">
            <div>
              <div className="text-2xl font-bold font-display text-primary">{skills.length}</div>
              <div className="text-xs text-textmuted font-medium">Active Skills</div>
            </div>
            <div className="w-px h-8 bg-border/60" />
            <div>
              <div className="text-2xl font-bold font-display text-warning">{appliedJobs.length}</div>
              <div className="text-xs text-textmuted font-medium">Applied Jobs</div>
            </div>
            <div className="w-px h-8 bg-border/60" />
            <div>
              <div className="text-2xl font-bold font-display text-success">{matchingJobs.filter(j => j.calculatedMatch >= 75).length}</div>
              <div className="text-xs text-textmuted font-medium">High Match Roles</div>
            </div>
            <div className="w-px h-8 bg-border/60" />
            <div>
              <div className="text-2xl font-bold font-display text-textmain">95%</div>
              <div className="text-xs text-textmuted font-medium">Profile Fit</div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-6 pt-6 border-t border-border/60 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-sm text-textmuted uppercase tracking-wide">About / Summary</h3>
            {!isEditingBio ? (
              <button
                type="button"
                onClick={() => setIsEditingBio(true)}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Edit Bio
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveBio}
                className="text-xs bg-primary text-white px-2.5 py-1 rounded-lg hover:opacity-90 font-semibold"
              >
                Save Changes
              </button>
            )}
          </div>

          {!isEditingBio ? (
            <p className="text-sm text-textmain leading-relaxed">
              {bio}
            </p>
          ) : (
            <textarea
              className="input w-full text-sm min-h-[80px]"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          )}
        </div>
      </div>

      {/* Main Grid: Skills, Applied Jobs & Resume */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Applied Jobs Tracker & Skills Management */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* --- NEW: APPLIED JOBS TRACKER SECTION --- */}
          <div className="panel p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <h2 className="font-display text-lg font-bold flex items-center gap-2">
                  <Briefcase size={20} className="text-primary" />
                  Applied Jobs Tracker
                </h2>
                <p className="text-xs text-textmuted mt-0.5">
                  Track your active job applications, interview schedules, and recruiter status updates.
                </p>
              </div>
              
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-surface-2 p-1 rounded-xl border border-border/80 text-xs font-semibold self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setAppliedFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    appliedFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'text-textmuted hover:text-textmain'
                  }`}
                >
                  All ({appliedJobs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAppliedFilter('interviewing')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    appliedFilter === 'interviewing' ? 'bg-primary text-white shadow-sm' : 'text-textmuted hover:text-textmain'
                  }`}
                >
                  Interviewing ({appliedJobs.filter(a => a.status === 'Interview Scheduled').length})
                </button>
                <button
                  type="button"
                  onClick={() => setAppliedFilter('review')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    appliedFilter === 'review' ? 'bg-primary text-white shadow-sm' : 'text-textmuted hover:text-textmain'
                  }`}
                >
                  In Review ({appliedJobs.filter(a => a.status === 'Under Review' || a.status === 'Screening').length})
                </button>
              </div>
            </div>

            {/* Applied Jobs Cards List */}
            {filteredAppliedJobs.length === 0 ? (
              <div className="text-center py-10 space-y-3 bg-surface-2/30 rounded-xl border border-dashed border-border p-6">
                <Briefcase className="mx-auto text-textmuted" size={32} />
                <p className="text-sm font-semibold text-textmain">No applications match your filter.</p>
                <p className="text-xs text-textmuted">Explore matching roles below to quick-apply!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppliedJobs.map((item) => (
                  <div
                    key={item.id}
                    className="panel p-5 surface-sub hover:border-primary/40 transition-all rounded-xl space-y-3 border border-border/80"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center border border-primary/20 flex-shrink-0 mt-0.5">
                          {item.company.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-display font-semibold text-base text-textmain">
                              {item.title}
                            </h3>
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(item.statusTone)}`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-textmuted mt-1">
                            <span className="font-semibold text-textmain flex items-center gap-1">
                              <Building2 size={13} /> {item.company}
                            </span>
                            <span>•</span>
                            <span>{item.location}</span>
                            <span>•</span>
                            <span className="text-success font-medium">{item.salary}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action Options */}
                      <div className="flex items-center gap-3 sm:self-center self-end pt-2 sm:pt-0">
                        <span className="text-xs text-textmuted font-medium flex items-center gap-1">
                          <Clock size={12} /> {item.appliedDate}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleWithdrawApplication(item.id, item.title)}
                          title="Withdraw Application"
                          className="p-1.5 text-textmuted hover:text-warning hover:bg-warning/10 rounded-lg transition-colors text-xs font-medium"
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills Management Panel */}
          <div className="panel p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h2 className="font-display text-lg font-bold flex items-center gap-2">
                  <Sparkles size={20} className="text-primary" />
                  Your Skills & Competencies
                </h2>
                <p className="text-xs text-textmuted mt-0.5">
                  Manage your technical skills. Matching job roles and compatibility scores automatically recalculate.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {skills.length} Skills Listed
              </span>
            </div>

            {/* Active Skills List */}
            <div className="flex flex-wrap gap-2.5 min-h-[60px] items-center p-4 bg-surface-2/40 rounded-xl border border-border/60">
              {skills.length === 0 ? (
                <p className="text-xs text-textmuted italic">No skills added yet. Add your technical stack below!</p>
              ) : (
                skills.map((skill) => (
                  <div
                    key={skill}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold bg-surface border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-textmain shadow-sm"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      title={`Remove ${skill}`}
                      className="text-textmuted hover:text-warning hover:bg-warning/10 p-0.5 rounded-md transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Custom Skill Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAddSkill(newSkillInput)
              }}
              className="flex items-center gap-3"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Enter a new skill (e.g., Python, Kubernetes, GraphQL)..."
                  className="input pr-10"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary px-5 py-2.5 bg-primary text-white font-semibold rounded-xl flex items-center gap-1.5 hover:opacity-90 active:scale-[0.98]"
              >
                <Plus size={18} />
                Add Skill
              </button>
            </form>

            {/* Popular Skills Quick Add Chips */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-textmuted uppercase tracking-wide">
                Suggested Popular Skills:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.filter(s => !skills.some(userS => userS.toLowerCase() === s.toLowerCase())).map((popular) => (
                  <button
                    key={popular}
                    type="button"
                    onClick={() => handleAddSkill(popular)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-surface-2 hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 transition-all font-medium text-textmuted flex items-center gap-1"
                  >
                    <Plus size={12} />
                    {popular}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Skill-Matching Job Roles Section */}
          <div className="panel p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h2 className="font-display text-lg font-bold flex items-center gap-2">
                  <Briefcase size={20} className="text-primary" />
                  Matching Job Roles
                </h2>
                <p className="text-xs text-textmuted mt-0.5">
                  Job openings matched in real-time against your {skills.length} configured skills.
                </p>
              </div>
              <span className="text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
                {matchingJobs.length} Matched Roles
              </span>
            </div>

            {/* Roles List */}
            {loadingJobs ? (
              <div className="text-center py-12 text-sm text-textmuted space-y-3">
                <RefreshCw className="animate-spin mx-auto text-primary" size={24} />
                <p>Analyzing job dataset against your skill profile...</p>
              </div>
            ) : matchingJobs.length === 0 ? (
              <div className="text-center py-8 text-sm text-textmuted">
                No matching jobs found. Try adding more skills above!
              </div>
            ) : (
              <div className="space-y-4">
                {matchingJobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="panel p-5 surface-sub hover:border-primary/40 transition-all rounded-xl space-y-3 border border-border/80"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-semibold text-base text-textmain hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                            {job.calculatedMatch}% Match
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-textmuted mt-1">
                          <span className="font-semibold text-textmain flex items-center gap-1">
                            <Building2 size={13} /> {job.company}
                          </span>
                          <span>•</span>
                          <span>{job.location}</span>
                          <span>•</span>
                          <span className="text-success font-medium">{job.salary}</span>
                        </div>
                      </div>

                      {job.isApplied ? (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-success/15 text-success border border-success/30 inline-flex items-center gap-1 flex-shrink-0">
                          <CheckCircle2 size={14} /> Applied
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuickApply(job)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:opacity-90 transition-all inline-flex items-center gap-1 flex-shrink-0 active:scale-[0.98]"
                        >
                          <Send size={13} /> Quick Apply
                        </button>
                      )}
                    </div>

                    {/* Skill Breakdown: Matched vs Missing */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40 text-xs">
                      <span className="text-textmuted font-semibold">Matched Skills:</span>
                      {job.matchedTags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-success/10 text-success border border-success/20 font-medium flex items-center gap-1">
                          <Check size={11} /> {tag}
                        </span>
                      ))}

                      {job.missingTags.length > 0 && (
                        <>
                          <span className="text-textmuted font-semibold ml-2">Missing:</span>
                          {job.missingTags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded bg-warning/10 text-warning border border-warning/20 font-medium">
                              + {tag}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (1 Col): Resume Upload & Document Management */}
        <div className="space-y-8">
          
          {/* Resume Card */}
          <div className="panel p-6 space-y-6">
            <div className="border-b border-border/60 pb-4">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Resume & CV Management
              </h2>
              <p className="text-xs text-textmuted mt-0.5">
                Upload your updated CV for recruiter indexers and auto-parsing.
              </p>
            </div>

            {/* Current Active Resume Card */}
            <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <FileCheck size={28} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display font-semibold text-sm text-textmain truncate">
                    {resume.filename}
                  </div>
                  <div className="text-xs text-textmuted mt-0.5">
                    {resume.fileSize} • Uploaded {resume.uploadDate}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/25 flex items-center gap-1">
                      <CheckCircle2 size={12} /> {resume.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => showNotification(`Opening preview for ${resume.filename}`)}
                  className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-surface border border-border hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye size={14} /> Preview
                </button>
                <button
                  type="button"
                  onClick={() => showNotification(`Downloading ${resume.filename}...`)}
                  className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-surface border border-border hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-1.5"
                >
                  <Download size={14} /> Download
                </button>
              </div>
            </div>

            {/* Replace / Upload New Resume Dropzone */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-textmuted uppercase tracking-wide">
                Replace Resume Document
              </label>

              {!isUploading ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (e.dataTransfer.files?.length > 0) {
                      handleResumeUpload(e.dataTransfer.files[0])
                    }
                  }}
                  className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/60 transition-all bg-surface-2/30 cursor-pointer relative group"
                >
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => {
                      if (e.target.files?.length > 0) {
                        handleResumeUpload(e.target.files[0])
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud size={32} className="mx-auto mb-2 text-textmuted group-hover:text-primary transition-colors" />
                  <p className="text-sm font-semibold text-textmain">Upload New Resume</p>
                  <p className="text-xs text-textmuted mt-1">PDF or DOCX format (Max 10MB)</p>
                </div>
              ) : (
                <div className="p-4 border border-primary/30 rounded-xl bg-primary/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-primary">
                    <span>Uploading & Parsing Resume...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-border/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Quick Help & Recruiter Visibility Card */}
          <div className="panel p-5 bg-gradient-to-br from-primary/5 via-transparent to-transparent border-primary/20 space-y-3">
            <div className="flex items-center gap-2 font-display font-semibold text-sm text-textmain">
              <Shield size={18} className="text-primary" />
              Recruiter Indexer Active
            </div>
            <p className="text-xs text-textmuted leading-relaxed">
              Your profile skills and verified resume are currently indexed for automated matching across 5+ source ATS databases (Greenhouse, Lever, Workable).
            </p>
          </div>

        </div>

      </div>

    </div>
  )
}
