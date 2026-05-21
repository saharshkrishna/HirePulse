/** Derives a normalized role bucket from a job title string. */
export function getRoleBucket(title) {
  const value = title.toLowerCase()
  if (value.includes('frontend')) return 'frontend'
  if (value.includes('backend')) return 'backend'
  if (value.includes('full stack') || value.includes('fullstack')) return 'full stack'
  if (value.includes('devops') || value.includes('platform')) return 'devops'
  if (value.includes('ml') || value.includes('machine learning')) return 'ml'
  if (value.includes('react native')) return 'frontend'
  return 'all'
}

/** Returns up-to-2 uppercase initials from a company/person name. */
export function initials(name) {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
}
