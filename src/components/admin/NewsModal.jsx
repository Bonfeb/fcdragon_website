import { useEffect, useState } from 'react'
import Modal from '../Modal'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api/client'

const empty = { title: '', summary: '', content: '', author: 'Dragon FC Media', cover_image_url: '' }

function previewSlug(title) {
  return title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

export default function NewsModal({ open, onClose, onSaved, editing }) {
  const { token } = useAuth()
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setForm(
      editing
        ? { title: editing.title, summary: editing.summary || '', content: editing.content, author: editing.author, cover_image_url: editing.cover_image_url || '' }
        : empty
    )
    setError(null)
  }, [editing, open])

  async function handleCoverChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const { url } = await api.uploadImage(token, file, 'news')
      setForm((f) => ({ ...f, cover_image_url: url }))
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
      if (editing) await api.update(token, 'news', editing.id, form)
      else await api.create(token, 'news', form)
      onSaved()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit article' : 'Add article'} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label">Title</label>
          <input className="field-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <p className="text-xs text-pitch-700/60 mt-1">
            Public URL: <span className="font-mono">/news/{form.title ? previewSlug(form.title) : 'your-title'}</span>
          </p>
        </div>
        <div>
          <label className="field-label">Summary (shown on the news card)</label>
          <input className="field-input" maxLength={400} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Cover image</label>
          <input type="file" accept="image/*" onChange={handleCoverChange} className="text-sm" />
          {uploading && <p className="text-xs text-pitch-700 mt-1">Uploading…</p>}
          {form.cover_image_url && <img src={form.cover_image_url} alt="" className="mt-2 h-28 rounded-md object-cover" />}
        </div>
        <div>
          <label className="field-label">Full article content</label>
          <textarea className="field-input" rows={8} required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Byline</label>
          <input className="field-input" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        </div>
        {error && <p className="text-sm text-loss bg-loss-100 rounded-md px-3 py-2">{error}</p>}
        <button className="btn-primary w-full justify-center disabled:opacity-60" disabled={busy || uploading}>
          {busy ? 'Publishing…' : 'Publish article'}
        </button>
      </form>
    </Modal>
  )
}
