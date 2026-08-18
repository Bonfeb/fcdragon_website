/**
 * Thin wrapper around the GitHub Contents API. This is how admin edits get
 * persisted: every write reads the current file (for its sha), applies the
 * change, and commits straight back to the repo. No database involved -
 * the git repo IS the database, and it's free.
 */
const GITHUB_API = 'https://api.github.com'

function env() {
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = process.env
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    throw new Error('Server misconfigured: GITHUB_TOKEN / GITHUB_OWNER / GITHUB_REPO not set')
  }
  return { token: GITHUB_TOKEN, owner: GITHUB_OWNER, repo: GITHUB_REPO, branch: GITHUB_BRANCH || 'main' }
}

async function ghFetch(path, options = {}) {
  const { token } = env()
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`GitHub API ${res.status}: ${body.slice(0, 300)}`)
  }
  return res.status === 204 ? null : res.json()
}

/** Reads a file's content (decoded) and its sha (needed to update it). */
async function getFile(path) {
  const { owner, repo, branch } = env()
  try {
    const data = await ghFetch(`/repos/${owner}/${repo}/contents/${path}?ref=${branch}`)
    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    return { content, sha: data.sha }
  } catch (e) {
    if (String(e.message).includes('404')) return { content: null, sha: null }
    throw e
  }
}

/** Reads and JSON-parses a content/*.json file. Returns [] if it doesn't exist yet. */
async function getJson(path) {
  const { content } = await getFile(path)
  if (!content) return []
  return JSON.parse(content)
}

/** Creates or updates a file. base64Content is raw base64 (for binary/images) or
 * a base64-encoded JSON string (for content files). */
async function putFile(path, base64Content, message, sha) {
  const { owner, repo, branch } = env()
  return ghFetch(`/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: base64Content,
      branch,
      ...(sha ? { sha } : {}),
    }),
  })
}

/** Writes a JS value as pretty JSON back to a content/*.json file, retrying
 * once on a sha conflict (rare, since there's a single admin). */
async function putJson(path, value, message) {
  const { sha } = await getFile(path)
  const base64 = Buffer.from(JSON.stringify(value, null, 2)).toString('base64')
  try {
    return await putFile(path, base64, message, sha)
  } catch (e) {
    if (!String(e.message).includes('409') && !String(e.message).includes('422')) throw e
    const retry = await getFile(path)
    return putFile(path, base64, message, retry.sha)
  }
}

/** Asks jsDelivr to drop its cached copy of a file so the public site sees
 * the new content within seconds instead of waiting out the CDN's TTL. */
async function purgeCdn(path) {
  const { owner, repo, branch } = env()
  const url = `https://purge.jsdelivr.net/gh/${owner}/${repo}@${branch}/${path}`
  try {
    await fetch(url)
  } catch {
    // Non-fatal - the CDN cache will still expire naturally within a few minutes.
  }
}

module.exports = { getFile, getJson, putFile, putJson, purgeCdn, env }
