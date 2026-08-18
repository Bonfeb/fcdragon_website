import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api/client'
import CompetitionModal from './CompetitionModal'
import FixtureModal from './FixtureModal'
import PlayerModal from './PlayerModal'
import NewsModal from './NewsModal'
import GalleryModal from './GalleryModal'

const TABS = ['Fixtures', 'Results', 'Competitions', 'Players', 'News', 'Gallery']
const OUTCOME_BADGE = { win: 'badge-win', draw: 'badge-draw', loss: 'badge-loss' }

export default function AdminDashboard({ open, onClose, data, refresh }) {
  const { token, username } = useAuth()
  const [tab, setTab] = useState('Fixtures')
  const [modal, setModal] = useState(null) // { type, editing }

  if (!open) return null

  const { competitions, fixtures, players, news, gallery } = data
  const upcoming = fixtures.filter((f) => !f.result).sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))
  const played = fixtures.filter((f) => f.result).sort((a, b) => new Date(b.kickoff) - new Date(a.kickoff))

  async function handleDelete(type, id, label) {
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return
    await api.remove(token, type, id)
    refresh()
  }

  return (
    <div className="fixed inset-0 z-[90] bg-sand-100 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-pitch-950 text-white px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-display text-2xl tracking-wide">MANAGER DASHBOARD</p>
          <p className="text-xs font-mono text-gold">Signed in as {username || 'manager'}</p>
        </div>
        <button onClick={onClose} className="btn-ghost">Back to site</button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm font-heading font-semibold transition-colors ${
                tab === t ? 'bg-pitch-950 text-white' : 'bg-white text-pitch-700 border border-pitch-950/10'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Fixtures' && (
          <Panel title="Upcoming fixtures" onAdd={() => setModal({ type: 'fixture' })}>
            {upcoming.length === 0 && <Empty />}
            {upcoming.map((f) => (
              <Row key={f.id} onEdit={() => setModal({ type: 'fixture', editing: f })} onDelete={() => handleDelete('fixtures', f.id, `fixture vs ${f.opponent}`)}>
                <div>
                  <p className="font-heading font-semibold text-pitch-950">vs {f.opponent}</p>
                  <p className="text-xs font-mono text-pitch-700/70">
                    {new Date(f.kickoff).toLocaleString()} · {f.venue_type} · {f.competition_id ? competitions.find((c) => c.id === f.competition_id)?.name : 'Friendly'}
                  </p>
                </div>
              </Row>
            ))}
          </Panel>
        )}

        {tab === 'Results' && (
          <Panel title="Results" onAdd={() => setModal({ type: 'fixture' })} addLabel="+ Add fixture &amp; result">
            {played.length === 0 && <Empty text="No results yet — edit an upcoming fixture and tick “record the result”." />}
            {played.map((f) => (
              <Row key={f.id} onEdit={() => setModal({ type: 'fixture', editing: f })} onDelete={() => handleDelete('fixtures', f.id, `fixture vs ${f.opponent}`)}>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${OUTCOME_BADGE[f.result.outcome]}`}>{f.result.outcome.toUpperCase()}</span>
                  <div>
                    <p className="font-heading font-semibold text-pitch-950">
                      vs {f.opponent} · {f.result.dragon_fc_score}-{f.result.opponent_score}
                    </p>
                    {f.result.scorers && <p className="text-xs text-pitch-700/70">{f.result.scorers}</p>}
                  </div>
                </div>
              </Row>
            ))}
          </Panel>
        )}

        {tab === 'Competitions' && (
          <Panel title="Competitions" onAdd={() => setModal({ type: 'competition' })}>
            {competitions.length === 0 && <Empty />}
            {competitions.map((c) => (
              <Row key={c.id} onEdit={() => setModal({ type: 'competition', editing: c })} onDelete={() => handleDelete('competitions', c.id, c.name)}>
                <div>
                  <p className="font-heading font-semibold text-pitch-950">{c.name}</p>
                  <p className="text-xs font-mono text-pitch-700/70">{c.season || 'No season set'} · {c.is_active ? 'Active' : 'Past'}</p>
                </div>
              </Row>
            ))}
          </Panel>
        )}

        {tab === 'Players' && (
          <Panel title="Players" onAdd={() => setModal({ type: 'player' })}>
            {players.length === 0 && <Empty />}
            {players.map((p) => (
              <Row key={p.id} onEdit={() => setModal({ type: 'player', editing: p })} onDelete={() => handleDelete('players', p.id, p.full_name)}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sand overflow-hidden flex-shrink-0">
                    {p.photo_url && <img src={p.photo_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-pitch-950">#{p.jersey_number ?? '—'} {p.full_name}</p>
                    <p className="text-xs font-mono text-pitch-700/70">{p.position || 'Player'} {p.is_active ? '' : '· Inactive'}</p>
                  </div>
                </div>
              </Row>
            ))}
          </Panel>
        )}

        {tab === 'News' && (
          <Panel title="News" onAdd={() => setModal({ type: 'news' })}>
            {news.length === 0 && <Empty />}
            {news.map((n) => (
              <Row key={n.id} onEdit={() => setModal({ type: 'news', editing: n })} onDelete={() => handleDelete('news', n.id, n.title)}>
                <div>
                  <p className="font-heading font-semibold text-pitch-950">{n.title}</p>
                  <p className="text-xs font-mono text-pitch-700/70">/news/{n.slug}</p>
                </div>
              </Row>
            ))}
          </Panel>
        )}

        {tab === 'Gallery' && (
          <Panel title="Gallery" onAdd={() => setModal({ type: 'gallery' })}>
            {gallery.length === 0 ? (
              <Empty />
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {gallery.map((g) => (
                  <div key={g.id} className="relative group rounded-md overflow-hidden border border-pitch-950/10">
                    <img src={g.image_url} alt={g.caption || ''} className="w-full h-24 object-cover" />
                    <button
                      onClick={() => handleDelete('gallery', g.id, g.caption || 'photo')}
                      className="absolute inset-0 bg-pitch-950/60 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-heading"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        )}
      </div>

      <CompetitionModal open={modal?.type === 'competition'} editing={modal?.editing} onClose={() => setModal(null)} onSaved={refresh} />
      <FixtureModal open={modal?.type === 'fixture'} editing={modal?.editing} competitions={competitions} onClose={() => setModal(null)} onSaved={refresh} />
      <PlayerModal open={modal?.type === 'player'} editing={modal?.editing} onClose={() => setModal(null)} onSaved={refresh} />
      <NewsModal open={modal?.type === 'news'} editing={modal?.editing} onClose={() => setModal(null)} onSaved={refresh} />
      <GalleryModal open={modal?.type === 'gallery'} onClose={() => setModal(null)} onSaved={refresh} />
    </div>
  )
}

function Panel({ title, onAdd, children }) {
  return (
    <div className="bg-white rounded-xl border border-pitch-950/5 shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-lg text-pitch-950">{title}</h3>
        <button onClick={onAdd} className="btn-primary !px-4 !py-2 text-sm">+ Add</button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Row({ children, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-3 rounded-lg hover:bg-sand-100 border border-transparent hover:border-pitch-950/5">
      <div className="flex-1 min-w-0">{children}</div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={onEdit} className="text-xs font-heading font-semibold text-green px-2 py-1 rounded hover:bg-green-100">Edit</button>
        <button onClick={onDelete} className="text-xs font-heading font-semibold text-loss px-2 py-1 rounded hover:bg-loss-100">Delete</button>
      </div>
    </div>
  )
}

function Empty({ text = 'Nothing here yet.' }) {
  return <p className="text-sm text-pitch-700/70 px-3 py-4">{text}</p>
}
