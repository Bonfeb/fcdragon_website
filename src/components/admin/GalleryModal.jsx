import { useState } from 'react'
import Modal from '../Modal'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api/client'

export default function GalleryModal({ open, onClose, onSaved }) {
  const { token } = useAuth()
  const [caption, setCaption] = useState('')
  const [album, setAlbum] = useState('General')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  function reset() {
    setCaption('')
    setAlbum('General')
    setFile(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) {
      setError('Choose an image to upload')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const { url } = await api.uploadImage(token, file, 'gallery')
      await api.create(token, 'gallery', { image_url: url, caption, album })
      reset()
      onSaved()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={() => { reset(); onClose() }} title="Add gallery photo">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label">Image</label>
          <input type="file" accept="image/*" required onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
        </div>
        <div>
          <label className="field-label">Album</label>
          <input className="field-input" value={album} onChange={(e) => setAlbum(e.target.value)} placeholder="Matchday, Training, Community…" />
        </div>
        <div>
          <label className="field-label">Caption (optional)</label>
          <input className="field-input" value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>
        {error && <p className="text-sm text-loss bg-loss-100 rounded-md px-3 py-2">{error}</p>}
        <button className="btn-primary w-full justify-center disabled:opacity-60" disabled={busy}>
          {busy ? 'Uploading…' : 'Add to gallery'}
        </button>
      </form>
    </Modal>
  )
}
