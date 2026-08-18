/**
 * Reads go straight to jsDelivr's free CDN, serving content/*.json and
 * content/images/* directly out of the GitHub repo - no server involved,
 * no per-read cost, ever.
 *
 * Writes go through small Netlify Functions (/api/...), which verify the
 * admin's JWT and commit the change back to the repo via the GitHub API.
 *
 * Set these in index.html's build env or a .env used by Vite - see
 * VITE_GH_OWNER / VITE_GH_REPO / VITE_GH_BRANCH in .env.example.
 */
const GH_OWNER = import.meta.env.VITE_GH_OWNER
const GH_REPO = import.meta.env.VITE_GH_REPO
const GH_BRANCH = import.meta.env.VITE_GH_BRANCH || 'main'
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${GH_OWNER}/${GH_REPO}@${GH_BRANCH}`

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function cdnGetJson(path) {
  // Cache-bust so a manager's own edits show up immediately for them, even
  // if jsDelivr's edge cache hasn't rolled over yet.
  const res = await fetch(`${CDN_BASE}/${path}?t=${Date.now()}`, { cache: 'no-store' })
  if (!res.ok) {
    if (res.status === 404) return [] // file doesn't exist yet (e.g. brand-new site)
    throw new ApiError(`Failed to load ${path}`, res.status)
  }
  return res.json()
}

async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  let data = null
  try { data = await res.json() } catch { /* no body */ }
  if (!res.ok) throw new ApiError(data?.detail || res.statusText || 'Request failed', res.status)
  return data
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1]) // strip data: prefix
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const api = {
  // ---------- Auth ----------
  login: (username, password) => apiRequest('/login', { method: 'POST', body: { username, password } }),

  // ---------- Public reads (CDN, no auth) ----------
  getCompetitions: () => cdnGetJson('content/competitions.json'),
  getFixtures: () => cdnGetJson('content/fixtures.json'),
  getPlayers: () => cdnGetJson('content/players.json'),
  getNews: () => cdnGetJson('content/news.json'),
  getGallery: () => cdnGetJson('content/gallery.json'),
  getNewsBySlug: async (slug) => {
    const all = await cdnGetJson('content/news.json')
    const found = all.find((n) => n.slug === slug)
    if (!found) throw new ApiError('Article not found', 404)
    return found
  },

  // ---------- Admin writes (Netlify Functions) ----------
  create: (token, type, body) => apiRequest(`/content/${type}`, { method: 'POST', token, body }),
  update: (token, type, id, body) => apiRequest(`/content/${type}/${id}`, { method: 'PUT', token, body }),
  remove: (token, type, id) => apiRequest(`/content/${type}/${id}`, { method: 'DELETE', token }),

  // ---------- Image upload ----------
  uploadImage: async (token, file, folder) => {
    const base64 = await fileToBase64(file)
    return apiRequest('/upload', {
      method: 'POST',
      token,
      body: { folder, filename: file.name, contentType: file.type, base64 },
    })
  },
}

export { ApiError }
