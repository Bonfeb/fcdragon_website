/**
 * One-time helper: generates the bcrypt hash you put in the
 * ADMIN_PASSWORD_HASH Netlify environment variable.
 *
 * Usage:
 *   npm run hash-password -- "your-chosen-password"
 */
const bcrypt = require('bcryptjs')

const password = process.argv[2]
if (!password) {
  console.error('Usage: npm run hash-password -- "your-chosen-password"')
  process.exit(1)
}

const hash = bcrypt.hashSync(password, 10)
console.log('\nAdd this as the ADMIN_PASSWORD_HASH environment variable in Netlify:\n')
console.log(hash)
console.log('')
