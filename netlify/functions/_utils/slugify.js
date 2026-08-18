function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100)
}

function uniqueSlug(title, existingArticles, ignoreId) {
  const base = slugify(title) || 'article'
  let slug = base
  let n = 1
  const taken = (s) => existingArticles.some((a) => a.slug === s && a.id !== ignoreId)
  while (taken(slug)) {
    n += 1
    slug = `${base}-${n}`
  }
  return slug
}

module.exports = { slugify, uniqueSlug }
