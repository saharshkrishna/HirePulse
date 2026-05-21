import { Chip, Panel } from '../components/ui'

const SAVED_SEARCHES = [
  'Remote React roles',
  'Node.js + PostgreSQL',
  'Fintech engineering',
  'Developer tools',
  'React Native',
]

/** Reusable filter presets for faster screening. */
export function SavedSearchesSection() {
  return (
    <Panel className="p-5" id="saved">
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold">Saved searches</h2>
        <p className="text-sm text-textmuted">Reusable filters for faster screening.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {SAVED_SEARCHES.map((item) => <Chip key={item}>{item}</Chip>)}
      </div>
    </Panel>
  )
}
