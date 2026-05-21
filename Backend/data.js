const companies = [
  { id: 1, name: 'Google', logo: 'GO', location: 'Mountain View, CA', open: 12, focus: 'Frontend · Cloud' },
  { id: 2, name: 'Microsoft', logo: 'MS', location: 'Redmond, WA', open: 18, focus: 'AI · Platform' },
  { id: 3, name: 'Amazon', logo: 'AM', location: 'Seattle, WA', open: 21, focus: 'DevOps · Infra' },
  { id: 4, name: 'Meta', logo: 'ME', location: 'Menlo Park, CA', open: 9, focus: 'Mobile · Product' },
  { id: 5, name: 'Stripe', logo: 'ST', location: 'Remote', open: 7, focus: 'Backend · Fintech' },
  { id: 6, name: 'Vercel', logo: 'VE', location: 'Remote', open: 6, focus: 'Frontend · Edge' },
];

const jobs = [
  { id: 1, title: 'Senior Frontend Engineer', company: 'Google', location: 'Mountain View, CA', remote: 'hybrid', experience: 'senior', salary: '$180k–$240k', tags: ['React', 'TypeScript', 'CSS'], source: 'Greenhouse', posted: '2h ago', freshness: 2, match: 95, isNew: true },
  { id: 2, title: 'Backend Engineer – Payments', company: 'Stripe', location: 'Remote', remote: 'remote', experience: 'mid', salary: '$140k–$180k', tags: ['Node.js', 'Go', 'Kafka'], source: 'Lever', posted: '4h ago', freshness: 4, match: 88, isNew: true },
  { id: 3, title: 'ML Engineer', company: 'Microsoft', location: 'Redmond, WA', remote: 'on-site', experience: 'senior', salary: '$200k–$260k', tags: ['Python', 'PyTorch', 'Azure'], source: 'Workable', posted: '6h ago', freshness: 6, match: 72, isNew: true },
  { id: 4, title: 'Full Stack Developer', company: 'Shopify', location: 'Remote', remote: 'remote', experience: 'mid', salary: '$110k–$150k', tags: ['React', 'Ruby', 'Rails'], source: 'RemoteOK', posted: '1d ago', freshness: 24, match: 91, isNew: false },
  { id: 5, title: 'DevOps Engineer', company: 'Amazon', location: 'Seattle, WA', remote: 'hybrid', experience: 'senior', salary: '$170k–$220k', tags: ['AWS', 'Kubernetes', 'Terraform'], source: 'Greenhouse', posted: '1d ago', freshness: 24, match: 67, isNew: false },
  { id: 6, title: 'React Native Engineer', company: 'Meta', location: 'Menlo Park, CA', remote: 'on-site', experience: 'mid', salary: '$160k–$210k', tags: ['React Native', 'JavaScript', 'GraphQL'], source: 'Ashby', posted: '2d ago', freshness: 48, match: 97, isNew: false },
  { id: 7, title: 'Platform Engineer', company: 'Vercel', location: 'Remote', remote: 'remote', experience: 'senior', salary: '$150k–$200k', tags: ['Next.js', 'Rust', 'Edge'], source: 'Vercel Careers', posted: '2d ago', freshness: 48, match: 84, isNew: false },
  { id: 8, title: 'Software Engineer II', company: 'Atlassian', location: 'Austin, TX', remote: 'hybrid', experience: 'mid', salary: '$130k–$170k', tags: ['Java', 'Kotlin', 'REST'], source: 'SmartRecruiters', posted: '3d ago', freshness: 72, match: 59, isNew: false },
  { id: 9, title: 'Design Engineer', company: 'Figma', location: 'San Francisco, CA', remote: 'hybrid', experience: 'mid', salary: '$145k–$190k', tags: ['React', 'CSS', 'Figma API'], source: 'Greenhouse', posted: '3d ago', freshness: 72, match: 76, isNew: false },
  { id: 10, title: 'Product Engineer', company: 'Notion', location: 'Remote', remote: 'remote', experience: 'mid', salary: '$120k–$160k', tags: ['TypeScript', 'Node.js', 'PostgreSQL'], source: 'Ashby', posted: '4d ago', freshness: 96, match: 82, isNew: false },
  { id: 11, title: 'Staff Engineer', company: 'Linear', location: 'Remote', remote: 'remote', experience: 'staff', salary: '$200k–$260k', tags: ['TypeScript', 'GraphQL', 'Distributed'], source: 'Linear Careers', posted: '5d ago', freshness: 120, match: 73, isNew: false },
  { id: 12, title: 'Backend Engineer', company: 'Supabase', location: 'Remote', remote: 'remote', experience: 'mid', salary: '$110k–$150k', tags: ['Go', 'PostgreSQL', 'Supabase'], source: 'Remotive', posted: '5d ago', freshness: 120, match: 89, isNew: false },
];

const sourceHealth = [
  { source: 'Greenhouse', status: 'Healthy', freshness: '4 min ago', records: 482, confidence: '98%' },
  { source: 'Lever', status: 'Healthy', freshness: '7 min ago', records: 351, confidence: '97%' },
  { source: 'RemoteOK', status: 'Healthy', freshness: '11 min ago', records: 198, confidence: '94%' },
  { source: 'Ashby', status: 'Verify', freshness: '34 min ago', records: 142, confidence: '89%' },
  { source: 'Career Pages', status: 'Healthy', freshness: '9 min ago', records: 621, confidence: '91%' },
];

module.exports = { companies, jobs, sourceHealth };
