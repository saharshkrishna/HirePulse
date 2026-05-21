/**
 * @param {{
 *   role: string, onRole: (v:string)=>void,
 *   remote: string, onRemote: (v:string)=>void,
 *   experience: string, onExperience: (v:string)=>void,
 *   sortBy: string, onSortBy: (v:string)=>void,
 * }} props
 */
export function JobFilters({ role, onRole, remote, onRemote, experience, onExperience, sortBy, onSortBy }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full xl:w-auto xl:min-w-[560px]">
      <select id="filter-role" className="select" value={role} onChange={(e) => onRole(e.target.value)}>
        <option value="all">All roles</option>
        <option value="frontend">Frontend</option>
        <option value="backend">Backend</option>
        <option value="full stack">Full Stack</option>
        <option value="devops">DevOps</option>
        <option value="ml">ML</option>
      </select>

      <select id="filter-remote" className="select" value={remote} onChange={(e) => onRemote(e.target.value)}>
        <option value="all">Any location</option>
        <option value="remote">Remote</option>
        <option value="hybrid">Hybrid</option>
        <option value="on-site">On-site</option>
      </select>

      <select id="filter-experience" className="select" value={experience} onChange={(e) => onExperience(e.target.value)}>
        <option value="all">Any level</option>
        <option value="mid">Mid</option>
        <option value="senior">Senior</option>
        <option value="staff">Staff</option>
      </select>

      <select id="filter-sort" className="select" value={sortBy} onChange={(e) => onSortBy(e.target.value)}>
        <option value="match">Sort by match</option>
        <option value="recent">Sort by recent</option>
        <option value="company">Sort by company</option>
      </select>
    </div>
  )
}
