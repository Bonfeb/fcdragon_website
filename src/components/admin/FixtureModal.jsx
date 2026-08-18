import { useEffect, useState } from 'react'
import Modal from '../Modal'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api/client'

const emptyFixture = { opponent: '', competition_id: '', kickoff: '', venue_type: 'home', venue_name: 'Gandini Pry School Pitch', notes: '' }
const emptyScore = { dragon_fc_score: 0, opponent_score: 0, scorers: '', match_report: '' }

function toLocalInputValue(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function deriveOutcome(dragonScore, opponentScore) {
  if (dragonScore > opponentScore) return 'win'
  if (dragonScore < opponentScore) return 'loss'
  return 'draw'
}

/** Handles both fixture details and (optionally) its result in one modal -
 * a fixture and its score are really one record, stored together in
 * content/fixtures.json, so there's no separate "results" collection. */
export default function FixtureModal({ open, onClose, onSaved, editing, competitions }) {
  const { token } = useAuth()
  const [form, setForm] = useState(emptyFixture)
  const [recordResult, setRecordResult] = useState(false)
  const [score, setScore] = useState(emptyScore)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setForm(
      editing
        ? {
            opponent: editing.opponent,
            competition_id: editing.competition_id || '',
            kickoff: toLocalInputValue(editing.kickoff),
            venue_type: editing.venue_type,
            venue_name: editing.venue_name,
            notes: editing.notes || '',
          }
        : emptyFixture
    )
    setRecordResult(!!editing?.result)
    setScore(
      editing?.result
        ? {
            dragon_fc_score: editing.result.dragon_fc_score,
            opponent_score: editing.result.opponent_score,
            scorers: editing.result.scorers || '',
            match_report: editing.result.match_report || '',
          }
        : emptyScore
    )
    setError(null)
  }, [editing, open])

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const payload = {
        ...form,
        competition_id: form.competition_id ? Number(form.competition_id) : null,
        kickoff: new Date(form.kickoff).toISOString(),
        result: recordResult
          ? {
              dragon_fc_score: Number(score.dragon_fc_score),
              opponent_score: Number(score.opponent_score),
              outcome: deriveOutcome(Number(score.dragon_fc_score), Number(score.opponent_score)),
              scorers: score.scorers,
              match_report: score.match_report,
            }
          : null,
      }
      if (editing) await api.update(token, 'fixtures', editing.id, payload)
      else await api.create(token, 'fixtures', payload)
      onSaved()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit fixture' : 'Add fixture'} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label">Opponent</label>
          <input className="field-input" required value={form.opponent} onChange={(e) => setForm({ ...form, opponent: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Competition</label>
          <select className="field-input" value={form.competition_id} onChange={(e) => setForm({ ...form, competition_id: e.target.value })}>
            <option value="">Friendly / not listed</option>
            {competitions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Kickoff</label>
            <input type="datetime-local" className="field-input" required value={form.kickoff} onChange={(e) => setForm({ ...form, kickoff: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Venue type</label>
            <select className="field-input" value={form.venue_type} onChange={(e) => setForm({ ...form, venue_type: e.target.value })}>
              <option value="home">Home</option>
              <option value="away">Away</option>
            </select>
          </div>
        </div>
        <div>
          <label className="field-label">Venue name</label>
          <input className="field-input" required value={form.venue_name} onChange={(e) => setForm({ ...form, venue_name: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Notes (optional)</label>
          <textarea className="field-input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <div className="border-t border-pitch-950/10 pt-4">
          <label className="flex items-center gap-2 text-sm font-heading font-semibold text-pitch-950">
            <input type="checkbox" checked={recordResult} onChange={(e) => setRecordResult(e.target.checked)} />
            This match has been played — record the result
          </label>

          {recordResult && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Dragon FC score</label>
                  <input type="number" min="0" className="field-input" value={score.dragon_fc_score} onChange={(e) => setScore({ ...score, dragon_fc_score: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">Opponent score</label>
                  <input type="number" min="0" className="field-input" value={score.opponent_score} onChange={(e) => setScore({ ...score, opponent_score: e.target.value })} />
                </div>
              </div>
              <p className="text-xs text-pitch-700/70 -mt-2">Win / draw / loss is worked out automatically from the score.</p>
              <div>
                <label className="field-label">Goal scorers (optional)</label>
                <input className="field-input" value={score.scorers} onChange={(e) => setScore({ ...score, scorers: e.target.value })} placeholder="e.g. Kai 12', Baraka 60'" />
              </div>
              <div>
                <label className="field-label">Match report (optional)</label>
                <textarea className="field-input" rows={3} value={score.match_report} onChange={(e) => setScore({ ...score, match_report: e.target.value })} />
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-loss bg-loss-100 rounded-md px-3 py-2">{error}</p>}
        <button className="btn-primary w-full justify-center disabled:opacity-60" disabled={busy}>
          {busy ? 'Saving…' : 'Save fixture'}
        </button>
      </form>
    </Modal>
  )
}
