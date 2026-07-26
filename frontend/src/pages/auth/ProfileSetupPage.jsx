import React, { useState } from 'react'
import {
  GraduationCap, Briefcase, FileText, UploadCloud, Shield, Check,
  ArrowRight, ArrowLeft, Loader2, FileCheck, CheckCircle2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function ProfileSetupPage() {
  const { user, completeProfileSetup } = useAuth()
  const [step, setStep] = useState(1) // 1: Type Selection, 2: Details Form, 3: Success Screen
  const [profileType, setProfileType] = useState('') // 'student', 'fresher', 'experienced'

  // Student specific state
  const [studentDetails, setStudentDetails] = useState({
    institutionName: '',
    universityName: '',
    yearOfStudy: '1st Year',
    studyPeriodStart: '2024',
    studyPeriodEnd: '2028',
    branch: '',
  })
  const [studentIdFile, setStudentIdFile] = useState(null)
  const [studentIdProgress, setStudentIdProgress] = useState(0)

  // Fresher & Experienced common details
  const [educationDetails, setEducationDetails] = useState({
    degree: '',
    college: '',
    gradYear: '2026',
  })
  const [cvFile, setCvFile] = useState(null)
  const [cvProgress, setCvProgress] = useState(0)

  const [kycDetails, setKycDetails] = useState({
    idType: 'Aadhaar Card',
    idNumber: '',
  })
  const [kycFile, setKycFile] = useState(null)
  const [kycProgress, setKycProgress] = useState(0)

  // Experienced specific details
  const [experienceDetails, setExperienceDetails] = useState({
    pastJobDomain: 'Frontend Development',
    yearsOfExperience: '2',
  })

  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Mock File Upload Simulator
  const simulateUpload = (file, setFileState, setProgressState) => {
    setFileState({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' })
    setProgressState(0)
    
    let current = 0
    const interval = setInterval(() => {
      current += 20
      setProgressState(current)
      if (current >= 100) {
        clearInterval(interval)
      }
    }, 150)
  }

  // Handle Drag & Drop Uploads
  const handleFileDrop = (e, setFileState, setProgressState) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      simulateUpload(files[0], setFileState, setProgressState)
    }
  }

  const handleFileInput = (e, setFileState, setProgressState) => {
    const files = e.target.files
    if (files.length > 0) {
      simulateUpload(files[0], setFileState, setProgressState)
    }
  }

  const handleNextStep1 = () => {
    if (!profileType) {
      setFormError('Please select a profile type.')
      return
    }
    setFormError('')
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    // Validation
    if (profileType === 'student') {
      const { institutionName, universityName, branch } = studentDetails
      if (!institutionName || !universityName || !branch) {
        setFormError('Please fill in all student details.')
        return
      }
      if (!studentIdFile || studentIdProgress < 100) {
        setFormError('Please upload and complete student ID verification.')
        return
      }
    } else {
      // Fresher / Experienced
      const { degree, college } = educationDetails
      if (!degree || !college) {
        setFormError('Please fill in all education details.')
        return
      }
      if (!cvFile || cvProgress < 100) {
        setFormError('Please upload and complete your CV upload.')
        return
      }
      if (!kycDetails.idNumber || !kycFile || kycProgress < 100) {
        setFormError('Please enter KYC number and upload ID verification documents.')
        return
      }

      if (profileType === 'experienced') {
        if (!experienceDetails.yearsOfExperience) {
          setFormError('Please enter your years of experience.')
          return
        }
      }
    }

    setSubmitting(true)
    try {
      // Mock submit latency
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Compile final data
      let compiledDetails = {}
      if (profileType === 'student') {
        compiledDetails = {
          ...studentDetails,
          studentIdFile: studentIdFile.name,
        }
      } else if (profileType === 'fresher') {
        compiledDetails = {
          ...educationDetails,
          cvFile: cvFile.name,
          kyc: { ...kycDetails, kycFile: kycFile.name },
        }
      } else {
        compiledDetails = {
          ...educationDetails,
          ...experienceDetails,
          cvFile: cvFile.name,
          kyc: { ...kycDetails, kycFile: kycFile.name },
        }
      }

      await completeProfileSetup(profileType, compiledDetails)
      setStep(3)
      
      // Redirect after success screen delay
      setTimeout(() => {
        window.location.hash = '#/dashboard'
      }, 2500)

    } catch (err) {
      setFormError('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Render Step 1: Selection Panel
  const renderSelection = () => {
    const types = [
      {
        id: 'student',
        title: 'I am a Student',
        desc: 'Enrolled in an institution or university seeking internships or junior roles.',
        icon: GraduationCap,
        color: 'border-primary bg-primary/5 text-primary',
      },
      {
        id: 'fresher',
        title: 'I am a Fresher',
        desc: 'Graduate with no past job experience looking for entry-level positions.',
        icon: FileText,
        color: 'border-success bg-success/5 text-success',
      },
      {
        id: 'experienced',
        title: 'Experienced Professional',
        desc: 'Worked in the industry and seeking mid-to-senior engineering roles.',
        icon: Briefcase,
        color: 'border-warning bg-warning/5 text-warning',
      },
    ]

    return (
      <div className="space-y-6">
        <div className="text-center max-w-md mx-auto">
          <h2 className="font-display text-2xl font-bold">Select Profile Type</h2>
          <p className="text-sm text-textmuted mt-2">
            Choose the path that fits you best. We will customize your dashboard, alerts, and job matching scores.
          </p>
        </div>

        <div className="grid gap-4 max-w-2xl mx-auto">
          {types.map((type) => {
            const Icon = type.icon
            const isSelected = profileType === type.id
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setProfileType(type.id)}
                className={`panel p-5 text-left flex items-start gap-4 transition-all duration-200 active:scale-[0.99] border-2 cursor-pointer ${
                  isSelected ? type.color : 'border-border hover:border-text/40'
                }`}
              >
                <div className={`p-3 rounded-xl flex-shrink-0 ${
                  isSelected ? 'bg-current/10' : 'bg-surface-2 border border-border text-textmuted'
                }`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="font-display font-semibold text-lg flex items-center justify-between">
                    <span>{type.title}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-current text-white flex items-center justify-center text-xs">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-textmuted">{type.desc}</p>
                </div>
              </button>
            )
          })}
        </div>

        {formError && <p className="text-warning text-center text-sm">{formError}</p>}

        <div className="flex justify-end max-w-2xl mx-auto pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleNextStep1}
            className="btn btn-primary px-6 py-2.5 bg-primary text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-95"
          >
            Continue
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  // Helper file upload card rendering
  const renderUploader = ({ label, fileState, progressState, setFileState, setProgressState, accept = '*' }) => {
    return (
      <div className="space-y-2">
        <label className="text-sm font-semibold text-textmuted">{label}</label>
        {!fileState ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleFileDrop(e, setFileState, setProgressState)}
            className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors bg-surface-2/40 cursor-pointer relative"
          >
            <input
              type="file"
              accept={accept}
              onChange={(e) => handleFileInput(e, setFileState, setProgressState)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <UploadCloud className="mx-auto mb-2 text-textmuted" size={32} />
            <p className="text-sm text-text">Drag & drop here or click to browse</p>
            <p className="text-xs text-textmuted mt-1">PDF, PNG, JPG (Max 5MB)</p>
          </div>
        ) : (
          <div className="border border-border rounded-xl p-4 bg-surface-2 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              {progressState < 100 ? <Loader2 className="animate-spin" size={20} /> : <FileCheck size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{fileState.name}</p>
              <p className="text-xs text-textmuted">{fileState.size}</p>
              
              {progressState < 100 && (
                <div className="w-full bg-border/40 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-150" 
                    style={{ width: `${progressState}%` }}
                  />
                </div>
              )}
            </div>
            {progressState === 100 ? (
              <span className="text-success text-xs font-semibold flex items-center gap-1 bg-success/10 px-2 py-1 rounded-full border border-success/20">
                <Check size={12} strokeWidth={2.5} /> Verified
              </span>
            ) : (
              <span className="text-textmuted text-xs font-medium">{progressState}%</span>
            )}
            <button 
              type="button" 
              onClick={() => { setFileState(null); setProgressState(0); }} 
              className="text-xs text-warning hover:underline ml-2"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    )
  }

  // Render Step 2: Input Details Form
  const renderDetailsForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 rounded-lg bg-surface-2 border border-border hover:bg-border/20 text-textmuted"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="font-display text-xl font-bold">Profile Details</h2>
            <p className="text-xs text-textmuted">Enter details for {profileType.toUpperCase()}</p>
          </div>
        </div>

        {formError && (
          <div className="p-3 bg-warning/10 border border-warning/20 text-warning text-sm rounded-lg flex items-center gap-2">
            <Check size={14} className="hidden" /> {/* Alignment padding spacer */}
            <span>{formError}</span>
          </div>
        )}

        {/* --- STUDENT BRANCH --- */}
        {profileType === 'student' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-textmuted">Institution Name</label>
                <input
                  type="text"
                  placeholder="e.g. Stanford University"
                  className="input"
                  value={studentDetails.institutionName}
                  onChange={(e) => setStudentDetails({ ...studentDetails, institutionName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-textmuted">University Affiliation</label>
                <input
                  type="text"
                  placeholder="e.g. Stanford Board"
                  className="input"
                  value={studentDetails.universityName}
                  onChange={(e) => setStudentDetails({ ...studentDetails, universityName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-textmuted">Year of Study</label>
                <select
                  className="select"
                  value={studentDetails.yearOfStudy}
                  onChange={(e) => setStudentDetails({ ...studentDetails, yearOfStudy: e.target.value })}
                >
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                  <option>Postgraduate / Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-textmuted">Study Period (Start - End)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="2024"
                    className="input text-center"
                    value={studentDetails.studyPeriodStart}
                    onChange={(e) => setStudentDetails({ ...studentDetails, studyPeriodStart: e.target.value })}
                    required
                  />
                  <span className="text-textmuted">-</span>
                  <input
                    type="number"
                    placeholder="2028"
                    className="input text-center"
                    value={studentDetails.studyPeriodEnd}
                    onChange={(e) => setStudentDetails({ ...studentDetails, studyPeriodEnd: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-textmuted">Branch of Study / Major</label>
              <input
                type="text"
                placeholder="e.g. Computer Science & Engineering"
                className="input"
                value={studentDetails.branch}
                onChange={(e) => setStudentDetails({ ...studentDetails, branch: e.target.value })}
                required
              />
            </div>

            {/* Student ID Verification */}
            {renderUploader({
              label: 'Upload Student ID Card / Enrollment Letter',
              fileState: studentIdFile,
              progressState: studentIdProgress,
              setFileState: setStudentIdFile,
              setProgressState: setStudentIdProgress,
              accept: '.pdf,.png,.jpg,.jpeg'
            })}
          </div>
        )}

        {/* --- FRESHER BRANCH --- */}
        {profileType === 'fresher' && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-sm text-primary uppercase tracking-wide">Academic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-textmuted">Degree / Course</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech in CSE"
                  className="input"
                  value={educationDetails.degree}
                  onChange={(e) => setEducationDetails({ ...educationDetails, degree: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-textmuted">College / University</label>
                <input
                  type="text"
                  placeholder="e.g. MIT, Cambridge"
                  className="input"
                  value={educationDetails.college}
                  onChange={(e) => setEducationDetails({ ...educationDetails, college: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-textmuted">Graduation Year</label>
              <select
                className="select"
                value={educationDetails.gradYear}
                onChange={(e) => setEducationDetails({ ...educationDetails, gradYear: e.target.value })}
              >
                <option>2026</option>
                <option>2025</option>
                <option>2024</option>
                <option>2023</option>
                <option>2022 & prior</option>
              </select>
            </div>

            {/* CV Upload */}
            {renderUploader({
              label: 'Upload CV / Resume',
              fileState: cvFile,
              progressState: cvProgress,
              setFileState: setCvFile,
              setProgressState: setCvProgress,
              accept: '.pdf,.docx'
            })}

            <div className="border-t border-border/60 my-4 pt-4" />
            <h3 className="font-display font-semibold text-sm text-primary uppercase tracking-wide flex items-center gap-1.5">
              <Shield size={16} />
              Identity KYC Verification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-textmuted">ID Proof Document Type</label>
                <select
                  className="select"
                  value={kycDetails.idType}
                  onChange={(e) => setKycDetails({ ...kycDetails, idType: e.target.value })}
                >
                  <option>Aadhaar Card</option>
                  <option>PAN Card</option>
                  <option>Passport</option>
                  <option>Driver License</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-textmuted">Document ID Number</label>
                <input
                  type="text"
                  placeholder="Enter Document number"
                  className="input"
                  value={kycDetails.idNumber}
                  onChange={(e) => setKycDetails({ ...kycDetails, idNumber: e.target.value })}
                  required
                />
              </div>
            </div>

            {renderUploader({
              label: 'Upload Front Photo of ID Document',
              fileState: kycFile,
              progressState: kycProgress,
              setFileState: setKycFile,
              setProgressState: setKycProgress,
              accept: '.pdf,.png,.jpg,.jpeg'
            })}
          </div>
        )}

        {/* --- EXPERIENCED BRANCH --- */}
        {profileType === 'experienced' && (
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-sm text-primary uppercase tracking-wide">Academic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-textmuted">Degree / Course</label>
                <input
                  type="text"
                  placeholder="e.g. B.Sc in Software Science"
                  className="input"
                  value={educationDetails.degree}
                  onChange={(e) => setEducationDetails({ ...educationDetails, degree: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-textmuted">College / University</label>
                <input
                  type="text"
                  placeholder="e.g. Georgia Tech"
                  className="input"
                  value={educationDetails.college}
                  onChange={(e) => setEducationDetails({ ...educationDetails, college: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-textmuted">Graduation Year</label>
              <select
                className="select"
                value={educationDetails.gradYear}
                onChange={(e) => setEducationDetails({ ...educationDetails, gradYear: e.target.value })}
              >
                <option>2025</option>
                <option>2024</option>
                <option>2023</option>
                <option>2022</option>
                <option>2021</option>
                <option>2020 & prior</option>
              </select>
            </div>

            {/* CV Upload */}
            {renderUploader({
              label: 'Upload CV / Resume',
              fileState: cvFile,
              progressState: cvProgress,
              setFileState: setCvFile,
              setProgressState: setCvProgress,
              accept: '.pdf,.docx'
            })}

            <div className="border-t border-border/60 my-4 pt-4" />
            <h3 className="font-display font-semibold text-sm text-primary uppercase tracking-wide">Industry Experience</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-textmuted">Core Job Domain</label>
                <select
                  className="select"
                  value={experienceDetails.pastJobDomain}
                  onChange={(e) => setExperienceDetails({ ...experienceDetails, pastJobDomain: e.target.value })}
                >
                  <option>Frontend Development</option>
                  <option>Backend Development</option>
                  <option>Fullstack Engineering</option>
                  <option>Mobile Dev (iOS/Android)</option>
                  <option>QA & Automation Testing</option>
                  <option>DevOps & Cloud Engineering</option>
                  <option>AI / Data Science</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-textmuted">Total Experience (Years)</label>
                <input
                  type="number"
                  placeholder="e.g. 3"
                  className="input"
                  min="0"
                  max="40"
                  value={experienceDetails.yearsOfExperience}
                  onChange={(e) => setExperienceDetails({ ...experienceDetails, yearsOfExperience: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="border-t border-border/60 my-4 pt-4" />
            <h3 className="font-display font-semibold text-sm text-primary uppercase tracking-wide flex items-center gap-1.5">
              <Shield size={16} />
              Identity KYC Verification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-textmuted">ID Proof Document Type</label>
                <select
                  className="select"
                  value={kycDetails.idType}
                  onChange={(e) => setKycDetails({ ...kycDetails, idType: e.target.value })}
                >
                  <option>Aadhaar Card</option>
                  <option>PAN Card</option>
                  <option>Passport</option>
                  <option>Driver License</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-textmuted">Document ID Number</label>
                <input
                  type="text"
                  placeholder="Enter Document number"
                  className="input"
                  value={kycDetails.idNumber}
                  onChange={(e) => setKycDetails({ ...kycDetails, idNumber: e.target.value })}
                  required
                />
              </div>
            </div>

            {renderUploader({
              label: 'Upload Front Photo of ID Document',
              fileState: kycFile,
              progressState: kycProgress,
              setFileState: setKycFile,
              setProgressState: setKycProgress,
              accept: '.pdf,.png,.jpg,.jpeg'
            })}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-border">
          <button
            type="button"
            onClick={handleBack}
            className="btn font-semibold hover:bg-surface-2"
            disabled={submitting}
          >
            Back
          </button>
          <button
            type="submit"
            className="btn btn-primary px-8 py-3 bg-primary text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Submitting Profile...
              </>
            ) : (
              <>
                Complete Setup
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    )
  }

  // Render Step 3: Success Screen
  const renderSuccess = () => {
    return (
      <div className="text-center max-w-md mx-auto py-12 space-y-6">
        <div className="inline-flex p-4 bg-success/15 text-success rounded-full border border-success/30 animate-bounce">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold">Profile Setup Complete!</h2>
          <p className="text-sm text-textmuted">
            Welcome to HirePulse, <strong>{user?.name || 'Candidate'}</strong>. Your credentials and documents have been securely processed.
          </p>
        </div>
        <div className="panel p-4 surface-sub flex items-center gap-3 justify-center text-xs text-textmuted border border-border/80">
          <Shield size={14} className="text-success" />
          <span>Verification is pending (typically takes less than 24 hours).</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={24} />
          <p className="text-xs text-textmuted">Generating your personalized dashboard feed...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-basebg px-4 py-8 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-success/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="panel max-w-3xl w-full p-6 md:p-10 backdrop-blur-md relative z-10 space-y-8">
        
        {/* Wizard Header Progress Bar */}
        {step < 3 && (
          <div className="relative">
            <div className="flex justify-between items-center max-w-sm mx-auto text-xs font-semibold">
              <div className="flex flex-col items-center gap-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold ${
                  step >= 1 ? 'bg-primary border-primary text-white' : 'bg-surface-2 border-border text-textmuted'
                }`}>
                  1
                </span>
                <span className={step >= 1 ? 'text-primary font-bold' : 'text-textmuted'}>Profile Type</span>
              </div>
              <div className={`flex-1 h-0.5 mx-2 bg-border ${step > 1 ? 'bg-primary' : ''}`} />
              <div className="flex flex-col items-center gap-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold ${
                  step >= 2 ? 'bg-primary border-primary text-white' : 'bg-surface-2 border-border text-textmuted'
                }`}>
                  2
                </span>
                <span className={step >= 2 ? 'text-primary font-bold' : 'text-textmuted'}>Details & KYC</span>
              </div>
            </div>
          </div>
        )}

        {/* Content Screens */}
        {step === 1 && renderSelection()}
        {step === 2 && renderDetailsForm()}
        {step === 3 && renderSuccess()}
      </div>
    </div>
  )
}
