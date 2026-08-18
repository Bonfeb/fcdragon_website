const { getJson, putJson, purgeCdn } = require('./_utils/github')
const { requireAdmin, json } = require('./_utils/auth')
const { uniqueSlug } = require('./_utils/slugify')

const ALLOWED_TYPES = new Set(['competitions', 'fixtures', 'players', 'news', 'gallery'])

/**
 * Generic authenticated CRUD over content/<type>.json in the repo.
 * Routes (via netlify.toml redirects): /api/content/:type and /api/content/:type/:id
 * Public reads never hit this function - the site fetches content/*.json
 * straight from jsDelivr's CDN. This function only handles writes.
 */
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(204, {})

  // event.path looks like /.netlify/functions/content/fixtures/2001
  const parts = event.path.split('/').filter(Boolean)
  const idx = parts.indexOf('content')
  const type = parts[idx + 1]
  const idParam = parts[idx + 2]

  if (!ALLOWED_TYPES.has(type)) return json(404, { detail: `Unknown content type "${type}"` })

  try {
    requireAdmin(event)
  } catch (e) {
    return json(e.statusCode || 401, { detail: e.message })
  }

  let body = {}
  if (event.body) {
    try { body = JSON.parse(event.body) } catch { return json(400, { detail: 'Invalid JSON body' }) }
  }

  const filePath = `content/${type}.json`

  try {
    const items = await getJson(filePath)

    if (event.httpMethod === 'POST') {
      const item = { id: Date.now(), ...body }
      if (type === 'news') item.slug = uniqueSlug(body.title || 'article', items)
      items.unshift(item)
      await putJson(filePath, items, `content: add ${type} ${item.id}`)
      await purgeCdn(filePath)
      return json(201, item)
    }

    if (event.httpMethod === 'PUT') {
      const id = Number(idParam)
      const index = items.findIndex((i) => i.id === id)
      if (index === -1) return json(404, { detail: `${type} ${id} not found` })
      const merged = { ...items[index], ...body, id }
      if (type === 'news' && body.title && body.title !== items[index].title) {
        merged.slug = uniqueSlug(body.title, items, id)
      }
      items[index] = merged
      await putJson(filePath, items, `content: update ${type} ${id}`)
      await purgeCdn(filePath)
      return json(200, merged)
    }

    if (event.httpMethod === 'DELETE') {
      const id = Number(idParam)
      const next = items.filter((i) => i.id !== id)
      if (next.length === items.length) return json(404, { detail: `${type} ${id} not found` })
      await putJson(filePath, next, `content: delete ${type} ${id}`)
      await purgeCdn(filePath)
      return json(204, {})
    }

    return json(405, { detail: 'Method not allowed' })
  } catch (e) {
    return json(500, { detail: e.message })
  }
}
