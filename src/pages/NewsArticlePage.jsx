import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'

/**
 * The full article page a "Read more" link opens in a new tab, at /news/:slug.
 * Standalone so it works as a shareable, bookmarkable URL on its own.
 */
export default function NewsArticlePage() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getNewsBySlug(slug).then(setArticle).catch((e) => setError(e.message))
  }, [slug])

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="font-display text-4xl text-pitch-950">Article not found</p>
        <p className="mt-3 text-pitch-700">{error}</p>
        <Link to="/" className="btn-primary inline-flex mt-6">Back to Dragon FC</Link>
      </div>
    )
  }

  if (!article) {
    return <div className="max-w-2xl mx-auto px-6 py-24 text-center text-pitch-700">Loading…</div>
  }

  return (
    <article className="min-h-screen bg-sand-100">
      {article.cover_image_url && (
        <div className="w-full aspect-[21/9] bg-pitch-950 overflow-hidden">
          <img src={article.cover_image_url} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link to="/" className="text-sm font-heading text-flame">← Dragon FC home</Link>
        <p className="font-mono text-xs text-pitch-700/60 mt-6">
          {new Date(article.published_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
          {' · '}{article.author}
        </p>
        <h1 className="font-display text-4xl sm:text-5xl text-pitch-950 mt-3 leading-[0.95]">{article.title}</h1>
        <div className="mt-8 prose-none font-body text-pitch-950/85 text-base leading-relaxed whitespace-pre-wrap">
          {article.content}
        </div>
      </div>
    </article>
  )
}
