function newsUrl(slug) {
  return `${window.location.origin}/news/${slug}`
}

export default function News({ news }) {
  const latest = [...news]
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    .slice(0, 6)

  return (
    <section id="news" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
      <p className="eyebrow mb-2">From the touchline</p>
      <h2 className="section-title mb-8">Club News</h2>

      {latest.length === 0 ? (
        <p className="text-pitch-700 font-body">No news posted yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {latest.map((n) => (
            <article key={n.id} className="bg-white rounded-xl shadow-card border border-pitch-950/5 overflow-hidden flex flex-col">
              {n.cover_image_url && (
                <div className="aspect-[16/9] bg-sand overflow-hidden">
                  <img src={n.cover_image_url} alt={n.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5 flex flex-col flex-1">
                <p className="font-mono text-[11px] text-pitch-700/60 mb-2">
                  {new Date(n.published_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <h3 className="font-heading font-semibold text-lg text-pitch-950 leading-snug">{n.title}</h3>
                {n.summary && <p className="mt-2 text-sm text-pitch-700 flex-1">{n.summary}</p>}
                {/* Constructs a real, shareable article URL (/news/{slug}) and opens it
                    in a new tab so readers keep the homepage open behind them. */}
                <a
                  href={newsUrl(n.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-heading font-semibold text-flame hover:text-flame-600"
                >
                  Read more <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
