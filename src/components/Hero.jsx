export default function Hero({ nextFixture }) {
  return (
    <section className="relative overflow-hidden bg-pitch-950 text-white">
      <div className="absolute inset-0 bg-pitch-lines" aria-hidden="true" />
      <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-flame/20 blur-3xl" aria-hidden="true" />
      <div className="absolute -left-16 bottom-0 w-72 h-72 rounded-full bg-green/20 blur-3xl" aria-hidden="true" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <p className="eyebrow mb-4">Kilifi South Sub-County League &amp; Local Tournaments</p>
        <h1 className="font-display text-6xl sm:text-8xl leading-[0.88] max-w-3xl">
          FORGED IN GANDINI-CHONYI. <span className="text-flame">EARNED</span> ON THE PITCH.
        </h1>
        <p className="mt-6 max-w-xl text-white/70 font-body text-base sm:text-lg">
          The home of Dragon FC — playing every match at the Gandini Primary School pitch,
          carrying the coast with us into every fixture.
        </p>

        <div className="mt-9 flex flex-wrap gap-4">
          <a href="#fixtures" className="btn-primary">See fixtures</a>
          <a href="#squad" className="btn-ghost">Meet the squad</a>
        </div>

        {nextFixture && (
          <div className="mt-14 inline-flex flex-wrap items-center gap-4 sm:gap-6 rounded-xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur-sm">
            <span className="eyebrow !text-white/60">Next up</span>
            <span className="font-heading font-semibold text-lg">Dragon FC vs {nextFixture.opponent}</span>
            <span className="font-mono text-sm text-gold">
              {new Date(nextFixture.kickoff).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
              {' · '}
              {new Date(nextFixture.kickoff).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="font-mono text-sm text-white/60">
              {nextFixture.venue_type === 'home' ? 'Home' : 'Away'} · {nextFixture.venue_name}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
