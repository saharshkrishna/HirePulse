const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ── Token helpers ─────────────────────────────────────────────────────────

/** Returns the Authorization header object for the given scope ('user' | 'admin') */
function authHeader(scope = 'user') {
  const key = scope === 'admin' ? 'hp_admin_token' : 'hp_user_token';
  // Check localStorage first (survives refresh), fall back to sessionStorage (legacy)
  const token = localStorage.getItem(key) || sessionStorage.getItem(key);
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// ── Public API calls (no auth required) ──────────────────────────────────

export async function fetchJobs(params = {}) {
  const cleanParams = {};
  Object.keys(params).forEach((key) => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== '' && val !== 'undefined') {
      cleanParams[key] = val;
    }
  });
  const queryString = new URLSearchParams(cleanParams).toString();
  const res = await fetch(`${API_BASE_URL}/jobs${queryString ? `?${queryString}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  const data = await res.json();
  // API returns { jobs: [...], pagination: {...} } — extract the array
  return Array.isArray(data) ? data : (data.jobs || []);
}

export async function fetchCompanies() {
  const res = await fetch(`${API_BASE_URL}/companies`);
  if (!res.ok) throw new Error('Failed to fetch companies');
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE_URL}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

// ── Protected API calls (require admin JWT) ────────────────────────────────

export async function createJobApi(jobData) {
  const res = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader('admin') },
    body: JSON.stringify(jobData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create job');
  }
  return res.json();
}

export async function updateJobApi(id, jobData) {
  const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader('admin') },
    body: JSON.stringify(jobData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update job');
  }
  return res.json();
}

export async function deleteJobApi(id) {
  const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader('admin') }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete job');
  }
  return res.json();
}

export async function fetchStudents() {
  const res = await fetch(`${API_BASE_URL}/admin/students`, {
    headers: { ...authHeader('admin') }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch students');
  }
  return res.json();
}
