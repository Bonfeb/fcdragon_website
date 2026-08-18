function ageFromDob(dob) {
  if (!dob) return null
  const diff = Date.now() - new Date(dob).getTime()
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000))
}

export default function Players({ players }) {
  const active = players.filter((p) => p.is_active)

  return (
    <section id="squad" className="bg-pitch-950 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="eyebrow mb-2">First team</p>
        <h2 className="section-title text-white mb-8">The Squad</h2>

        {active.length === 0 ? (
          <p className="text-white/60 font-body">Squad list coming soon.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {active.map((p) => {
              const age = ageFromDob(p.date_of_birth)
              return (
                <article key={p.id} className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden group">
                  <div className="aspect-[3/4] bg-pitch-800 overflow-hidden">
                    {p.photo_url ? (
                      <img
                        src={p.photo_url}
                        alt={p.full_name}
                        className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-white/30 font-display text-4xl">
                        {p.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-heading font-semibold text-white text-sm leading-tight">{p.full_name}</p>
                      {p.jersey_number != null && (
                        <span className="font-display text-2xl text-gold leading-none">{p.jersey_number}</span>
                      )}
                    </div>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-white/50">
                      {p.position || 'Player'}{age ? ` · ${age} yrs` : ''}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
