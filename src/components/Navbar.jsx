import { useState } from 'react'
import { useAdminAccessTrigger } from '../hooks/useAdminAccessTrigger'

const LINKS = [
  { href: '#fixtures', label: 'Fixtures' },
  { href: '#results', label: 'Results' },
  { href: '#competitions', label: 'Competitions' },
  { href: '#squad', label: 'Squad' },
  { href: '#news', label: 'News' },
  { href: '#gallery', label: 'Gallery' },
]

export default function Navbar({ onOpenAuth, isAuthenticated, onOpenDashboard, onLogout }) {
  const [open, setOpen] = useState(false)
  const crestRef = useAdminAccessTrigger(onOpenAuth)

  return (
    <header className="sticky top-0 z-50 bg-pitch-950/95 backdrop-blur border-b border-white/10">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 select-none">
          {/* Hidden admin trigger: 5 quick taps (mobile) or long-press on the crest.
              Desktop shortcut: Ctrl/Cmd + Alt + L, works anywhere on the page. */}
          <button
            ref={crestRef}
            aria-label="Dragon FC"
            className="w-10 h-10 rounded-full bg-green grid place-items-center font-display text-xl text-white shadow-card"
            title="Dragon FC"
          >
            DFC
          </button>
          <div>
            <p className="font-display text-xl leading-none text-white tracking-wide">DRAGON FC</p>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold">Gandini-Chonyi</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-7">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-heading text-white/80 hover:text-gold transition-colors">
              {l.label}
            </a>
          ))}
          {isAuthenticated && (
            <div className="flex items-center gap-3 pl-4 border-l border-white/15">
              <button onClick={onOpenDashboard} className="text-sm font-heading text-gold hover:text-white">Dashboard</button>
              <button onClick={onLogout} className="text-sm font-heading text-white/60 hover:text-white">Log out</button>
            </div>
          )}
        </div>

        <button className="md:hidden text-white text-2xl" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? '✕' : '☰'}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-pitch-950 border-t border-white/10 px-4 py-4 flex flex-col gap-3">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-white/85 font-heading py-1">
              {l.label}
            </a>
          ))}
          {isAuthenticated && (
            <>
              <button onClick={() => { setOpen(false); onOpenDashboard() }} className="text-left text-gold font-heading py-1">Dashboard</button>
              <button onClick={() => { setOpen(false); onLogout() }} className="text-left text-white/60 font-heading py-1">Log out</button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
