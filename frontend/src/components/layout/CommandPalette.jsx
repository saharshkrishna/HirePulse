import { BellRing, Building2, Settings2, Sparkles } from 'lucide-react'

const COMMAND_ITEMS = [
  ['Run AI scan for new jobs', Sparkles],
  ['Open alert center', BellRing],
  ['Show watched companies', Building2],
  ['Open preferences', Settings2],
]

/** @param {{ isOpen: boolean, onClose: () => void }} props */
export function CommandPalette({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div
      className="command-palette open"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="command-box">
        <div className="p-4 border-b border-[color:var(--border)]">
          <input
            id="command-search"
            className="input"
            placeholder="Search actions, jobs, companies, or filters"
            autoFocus
          />
        </div>
        <div className="p-2 max-h-[380px] overflow-auto">
          {COMMAND_ITEMS.map(([label, Icon]) => (
            <button key={label} className="command-item" onClick={onClose}>
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
