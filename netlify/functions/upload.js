const { putFile, purgeCdn, env } = require('./_utils/github')
const { requireAdmin, json } = require('./_utils/auth')

const ALLOWED_FOLDERS = new Set(['players', 'news', 'gallery'])
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_BYTES = 3 * 1024 * 1024 // 3MB - keeps the repo (and git history) small

/**
 * Commits an uploaded image straight into content/images/<folder>/ in the repo
 * and returns its public jsDelivr CDN URL. No Cloudinary, no object storage
 * bill - the image just becomes a file in the same git repo as everything else.
 */
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(204, {})
  if (event.httpMethod !== 'POST') return json(405, { detail: 'Method not allowed' })

  try {
    requireAdmin(event)
  } catch (e) {
    return json(e.statusCode || 401, { detail: e.message })
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { detail: 'Invalid JSON body' })
  }

  const { folder, filename, contentType, base64 } = body
  if (!ALLOWED_FOLDERS.has(folder)) return json(400, { detail: 'Invalid folder' })
  if (!ALLOWED_MIME.has(contentType)) return json(400, { detail: 'Only JPEG, PNG, WEBP or GIF images are allowed' })
  if (!base64) return json(400, { detail: 'Missing image data' })

  const approxBytes = Math.ceil((base64.length * 3) / 4)
  if (approxBytes > MAX_BYTES) return json(400, { detail: 'Image must be under 3MB' })

  const ext = (filename && filename.split('.').pop()) || 'jpg'
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const path = `content/images/${folder}/${safeName}`

  try {
    await putFile(path, base64, `content: upload ${folder} image ${safeName}`)
    await purgeCdn(path)
    const { owner, repo, branch } = env()
    const url = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${path}`
    return json(201, { url })
  } catch (e) {
    return json(500, { detail: e.message })
  }
}
