const OUTCOME_STYLE = {
  win: { chip: 'chip-win', badge: 'badge-win', label: 'WIN' },
  draw: { chip: 'chip-draw', badge: 'badge-draw', label: 'DRAW' },
  loss: { chip: 'chip-loss', badge: 'badge-loss', label: 'LOSS' },
}

export default function Results({ fixtures }) {
  const played = fixtures
    .filter((f) => f.result)
    .sort((a, b) => new Date(b.kickoff) - new Date(a.kickoff))

  return (
    <section id="results" className="bg-sand py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="eyebrow mb-2">Full time</p>
        <h2 className="section-title mb-8">Results</h2>

        {played.length === 0 ? (
          <p className="text-pitch-700 font-body">No results recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {played.map((f) => {
              const style = OUTCOME_STYLE[f.result.outcome]
              return (
                <div
                  key={f.id}
                  className="flex flex-wrap items-center gap-4 bg-white rounded-xl border border-pitch-950/5 shadow-card px-5 py-4"
                >
                  <span className={style.chip}>{style.label[0]}</span>
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-heading font-semibold text-pitch-950">Dragon FC vs {f.opponent}</p>
                    <p className="text-xs font-mono text-pitch-700/70">
                      {new Date(f.kickoff).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}{f.competition?.name || 'Friendly'}
                    </p>
                  </div>
                  <span className="font-mono text-2xl font-semibold text-pitch-950">
                    {f.result.dragon_fc_score} – {f.result.opponent_score}
                  </span>
                  <span className={`text-xs font-mono font-semibold px-3 py-1 rounded-full ${style.badge}`}>
                    {style.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
