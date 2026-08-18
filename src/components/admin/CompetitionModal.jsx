import { useEffect, useState } from 'react'
import Modal from '../Modal'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api/client'

const empty = { name: '', season: '', description: '', is_active: true }

export default function CompetitionModal({ open, onClose, onSaved, editing }) {
  const { token } = useAuth()
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setForm(editing ? { name: editing.name, season: editing.season || '', description: editing.description || '', is_active: editing.is_active } : empty)
    setError(null)
  }, [editing, open])

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (editing) await api.update(token, 'competitions', editing.id, form)
      else await api.create(token, 'competitions', form)
      onSaved()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit competition' : 'Add competition'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label">Name</label>
          <input className="field-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kilifi South Sub-County League" />
        </div>
        <div>
          <label className="field-label">Season</label>
          <input className="field-input" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} placeholder="2026" />
        </div>
        <div>
          <label className="field-label">Description</label>
          <textarea className="field-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm font-heading text-pitch-700">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          Active competition
        </label>
        {error && <p className="text-sm text-loss bg-loss-100 rounded-md px-3 py-2">{error}</p>}
        <button className="btn-primary w-full justify-center disabled:opacity-60" disabled={busy}>
          {busy ? 'Saving…' : 'Save competition'}
        </button>
      </form>
    </Modal>
  )
}
