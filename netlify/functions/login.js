const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { json } = require('./_utils/auth')

/**
 * Single-admin login. There is no /register - the club's one manager account
 * is set once via Netlify environment variables (ADMIN_USERNAME,
 * ADMIN_PASSWORD_HASH). See README for how to generate the hash.
 */
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(204, {})
  if (event.httpMethod !== 'POST') return json(405, { detail: 'Method not allowed' })

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { detail: 'Invalid JSON body' })
  }

  const { username, password } = body
  if (!username || !password) return json(400, { detail: 'Username and password are required' })

  const { ADMIN_USERNAME, ADMIN_PASSWORD_HASH, JWT_SECRET } = process.env
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH || !JWT_SECRET) {
    return json(500, { detail: 'Server misconfigured: admin credentials not set' })
  }

  if (username !== ADMIN_USERNAME) {
    return json(401, { detail: 'Incorrect username or password' })
  }

  const valid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
  if (!valid) return json(401, { detail: 'Incorrect username or password' })

  const token = jwt.sign({ sub: username }, JWT_SECRET, { expiresIn: '8h' })
  return json(200, { access_token: token, token_type: 'bearer' })
}
