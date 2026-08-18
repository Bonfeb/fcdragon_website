const jwt = require('jsonwebtoken')

function requireAdmin(event) {
  const header = event.headers.authorization || event.headers.Authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    const err = new Error('Missing token')
    err.statusCode = 401
    throw err
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    const err = new Error('Invalid or expired token')
    err.statusCode = 401
    throw err
  }
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

module.exports = { requireAdmin, json }
