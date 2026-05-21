export function MatchBar({ value }) {
  return (
    <div className="match-bar">
      <div className="match-fill" style={{ width: `${value}%` }} />
    </div>
  )
}
