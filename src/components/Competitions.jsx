export default function Competitions({ competitions }) {
  if (!competitions.length) return null
  return (
    <section id="competitions" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
      <p className="eyebrow mb-2">Where we compete</p>
      <h2 className="section-title mb-8">Competitions</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {competitions.map((c) => (
          <article key={c.id} className="rounded-xl bg-pitch-950 text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-pitch-lines opacity-40" aria-hidden="true" />
            <div className="relative">
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${c.is_active ? 'bg-gold text-pitch-950' : 'bg-white/10 text-white/60'}`}>
                {c.is_active ? 'ACTIVE' : 'PAST'}
              </span>
              <h3 className="mt-4 font-heading font-semibold text-xl">{c.name}</h3>
              {c.season && <p className="font-mono text-sm text-gold mt-1">{c.season} season</p>}
              {c.description && <p className="mt-3 text-sm text-white/70">{c.description}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
