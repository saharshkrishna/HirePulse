const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchJobs(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/jobs?${query}`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
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
