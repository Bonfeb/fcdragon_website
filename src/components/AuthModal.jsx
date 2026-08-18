import { useState } from 'react'
import Modal from './Modal'
import { useAuth } from '../context/AuthContext'

/**
 * Manager sign-in. There's no register flow here on purpose - the club's
 * single admin account is set once via Netlify environment variables
 * (see the project README), which keeps the attack surface small.
 * Opened only via the hidden keyboard shortcut / crest tap-sequence
 * (see useAdminAccessTrigger) - there is deliberately no visible nav link.
 */
export default function AuthModal({ open, onClose, onSuccess }) {
  const { login, error, clearError, loading } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  function close() {
    clearError()
    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const ok = await login(username, password)
    if (ok) {
      setUsername('')
      setPassword('')
      onSuccess?.()
      close()
    }
  }

  return (
    <Modal open={open} onClose={close} title="Manager sign in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="username">Username</label>
          <input id="username" className="field-input" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
        </div>
        <div>
          <label className="field-label" htmlFor="password">Password</label>
          <input id="password" type="password" className="field-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-loss bg-loss-100 rounded-md px-3 py-2">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </Modal>
  )
}
