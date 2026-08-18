import { useEffect, useRef, useState } from 'react'
import Modal from '../Modal'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api/client'

const empty = { full_name: '', jersey_number: '', position: '', date_of_birth: '', nationality: 'Kenyan', bio: '', is_active: true, photo_url: '' }
const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']

export default function PlayerModal({ open, onClose, onSaved, editing }) {
  const { token } = useAuth()
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    setForm(
      editing
        ? {
            full_name: editing.full_name,
            jersey_number: editing.jersey_number ?? '',
            position: editing.position || '',
            date_of_birth: editing.date_of_birth || '',
            nationality: editing.nationality || 'Kenyan',
            bio: editing.bio || '',
            is_active: editing.is_active,
            photo_url: editing.photo_url || '',
          }
        : empty
    )
    setError(null)
  }, [editing, open])

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const { url } = await api.uploadImage(token, file, 'players')
      setForm((f) => ({ ...f, photo_url: url }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const payload = {
        ...form,
        jersey_number: form.jersey_number === '' ? null : Number(form.jersey_number),
        date_of_birth: form.date_of_birth || null,
      }
      if (editing) await api.update(token, 'players', editing.id, payload)
      else await api.create(token, 'players', payload)
      onSaved()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit player' : 'Add player'} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-24 h-28 rounded-lg bg-sand border border-pitch-950/10 overflow-hidden flex-shrink-0">
            {form.photo_url ? (
              <img src={form.photo_url} alt="Passport" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center text-pitch-700/40 text-xs text-center px-2">No photo</div>
            )}
          </div>
          <div>
            <label className="field-label">Passport / profile photo</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm" />
            {uploading && <p className="text-xs text-pitch-700 mt-1">Uploading…</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="field-label">Full name</label>
            <input className="field-input" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Jersey number</label>
            <input type="number" min="1" max="99" className="field-input" value={form.jersey_number} onChange={(e) => setForm({ ...form, jersey_number: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Position</label>
            <select className="field-input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
              <option value="">Select…</option>
              {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Date of birth</label>
            <input type="date" className="field-input" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Nationality</label>
            <input className="field-input" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="field-label">Bio (optional)</label>
          <textarea className="field-input" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm font-heading text-pitch-700">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          Active in first team squad
        </label>
        {error && <p className="text-sm text-loss bg-loss-100 rounded-md px-3 py-2">{error}</p>}
        <button className="btn-primary w-full justify-center disabled:opacity-60" disabled={busy || uploading}>
          {busy ? 'Saving…' : 'Save player'}
        </button>
      </form>
    </Modal>
  )
}
