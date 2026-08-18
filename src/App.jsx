import { useCallback, useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import AdminDashboard from './components/admin/AdminDashboard'
import HomePage from './pages/HomePage'
import NewsArticlePage from './pages/NewsArticlePage'
import { useAuth } from './context/AuthContext'
import { api } from './api/client'

const emptyData = { competitions: [], fixtures: [], players: [], news: [], gallery: [] }

export default function App() {
  const { isAuthenticated, logout } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [dashboardOpen, setDashboardOpen] = useState(false)
  const [data, setData] = useState(emptyData)
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const [competitions, fixtures, players, news, gallery] = await Promise.all([
        api.getCompetitions(), api.getFixtures(), api.getPlayers(), api.getNews(), api.getGallery(),
      ])
      setData({ competitions, fixtures, players, news, gallery })
    } catch (e) {
      console.error('Failed to load site data', e)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        onOpenAuth={() => (isAuthenticated ? setDashboardOpen(true) : setAuthOpen(true))}
        isAuthenticated={isAuthenticated}
        onOpenDashboard={() => setDashboardOpen(true)}
        onLogout={() => { logout(); setDashboardOpen(false) }}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={loaded ? <HomePage data={data} /> : <LoadingScreen />} />
          <Route path="/news/:slug" element={<NewsArticlePage />} />
        </Routes>
      </main>

      <Footer />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => setDashboardOpen(true)} />
      {isAuthenticated && (
        <AdminDashboard open={dashboardOpen} onClose={() => setDashboardOpen(false)} data={data} refresh={refresh} />
      )}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-[60vh] grid place-items-center text-pitch-700 font-heading">
      Loading Dragon FC…
    </div>
  )
}
