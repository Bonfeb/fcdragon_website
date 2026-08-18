function formatKickoff(iso) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
  }
}

export default function Fixtures({ fixtures }) {
  const upcoming = fixtures
    .filter((f) => !f.result)
    .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))

  return (
    <section id="fixtures" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="eyebrow mb-2">Matchday schedule</p>
          <h2 className="section-title">Fixtures</h2>
        </div>
      </div>

      {upcoming.length === 0 ? (
        <p className="text-pitch-700 font-body">No fixtures scheduled yet. Check back soon.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcoming.map((f) => {
            const { date, time } = formatKickoff(f.kickoff)
            return (
              <article key={f.id} className="bg-white rounded-xl shadow-card border border-pitch-950/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs uppercase tracking-wide text-pitch-700/70">
                    {f.competition?.name || 'Friendly'}
                  </span>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${f.venue_type === 'home' ? 'bg-green-100 text-green-600' : 'bg-sand text-pitch-700'}`}>
                    {f.venue_type === 'home' ? 'HOME' : 'AWAY'}
                  </span>
                </div>
                <p className="font-heading font-semibold text-lg text-pitch-950">Dragon FC vs {f.opponent}</p>
                <p className="mt-3 font-mono text-sm text-pitch-700">{date} · {time}</p>
                <p className="mt-1 text-sm text-pitch-700/70">{f.venue_name}</p>
                {f.notes && <p className="mt-3 text-sm text-pitch-700 border-t border-pitch-950/5 pt-3">{f.notes}</p>}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
