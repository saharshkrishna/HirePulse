export function Panel({ children, className = '', id }) {
  return (
    <section id={id} className={`panel ${className}`}>
      {children}
    </section>
  )
}
