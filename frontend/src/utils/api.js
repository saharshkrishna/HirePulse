const API_BASE_URL = 'http://localhost:5000/api';

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
  return res.json();
}

export async function createJobApi(jobData) {
  const res = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData)
  });
  if (!res.ok) throw new Error('Failed to create job');
  return res.json();
}

export async function updateJobApi(id, jobData) {
  const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData)
  });
  if (!res.ok) throw new Error('Failed to update job');
  return res.json();
}

export async function deleteJobApi(id) {
  const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete job');
  return res.json();
}

export async function fetchCompanies() {
  const res = await fetch(`${API_BASE_URL}/companies`);
  if (!res.ok) throw new Error('Failed to fetch companies');
  return res.json();
}

export async function fetchSourceHealth() {
  const res = await fetch(`${API_BASE_URL}/source-health`);
  if (!res.ok) throw new Error('Failed to fetch source health');
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE_URL}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchStudents() {
  const res = await fetch(`${API_BASE_URL}/admin/students`);
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}
