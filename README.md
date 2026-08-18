# Dragon FC — Website

A single Netlify site (frontend + tiny serverless functions) for Dragon FC,
Gandini-Chonyi. No database, no Cloudinary — content lives as JSON in this
same GitHub repo and is served to visitors for free via the jsDelivr CDN.

## How it works

- **Reads** (fixtures, results, players, news, gallery) — the site fetches
  `content/*.json` directly from `cdn.jsdelivr.net/gh/<owner>/<repo>@main/...`.
  No function call, no server, no cost, cached at the edge worldwide.
- **Writes** — the manager logs in (JWT, single admin account) and every
  add/edit/delete goes through a small Netlify Function
  (`netlify/functions/content.js`), which commits the change straight to
  `content/*.json` in this repo via the GitHub API. That commit *is* the
  database write. jsDelivr's cache is purged immediately after, so the
  public site updates within seconds.
- **Images** (player passports, news covers, gallery photos) — uploaded
  through `netlify/functions/upload.js`, committed into
  `content/images/<players|news|gallery>/`, served the same CDN way.
- **Auth** — one admin account, credentials set as Netlify environment
  variables (not stored in the repo, not in a database). No public
  registration endpoint exists.

Because everything is just files in git, you get free version history of
every edit for free (`git log content/fixtures.json`), and there is nothing
running — and nothing to pay for — when no one is editing the site.

## One-time setup

### 1. Push this repo to GitHub
This must be a repo you control, since the functions commit to it directly.

### 2. Create a GitHub token
Settings → Developer settings → **Fine-grained personal access tokens** →
generate one scoped to *only this repository*, with **Contents: Read and
write** permission. Copy the token — you won't see it again.

### 3. Generate your admin password hash
```bash
npm install
npm run hash-password -- "choose-a-strong-password"
```
Copy the printed hash.

### 4. Set Netlify environment variables
Site settings → Environment variables, add:

| Key | Value |
|---|---|
| `GITHUB_TOKEN` | the fine-grained PAT from step 2 |
| `GITHUB_OWNER` | your GitHub username or org |
| `GITHUB_REPO` | this repo's name |
| `GITHUB_BRANCH` | `main` (or whichever branch Netlify deploys) |
| `ADMIN_USERNAME` | whatever username you want to log in with |
| `ADMIN_PASSWORD_HASH` | the hash from step 3 |
| `JWT_SECRET` | any long random string (e.g. `openssl rand -hex 32`) |
| `VITE_GH_OWNER` | same as `GITHUB_OWNER` |
| `VITE_GH_REPO` | same as `GITHUB_REPO` |
| `VITE_GH_BRANCH` | same as `GITHUB_BRANCH` |

### 5. Deploy
Connect the repo in Netlify (build command `npm run build`, publish
directory `dist` — already set in `netlify.toml`). Push to `main` and it
deploys itself from here on.

## Local development
```bash
npm install
npm install -g netlify-cli   # once
netlify dev                  # runs Vite + the functions together on one port
```
Create a `.env` (copy `.env.example`) for the `VITE_*` values, and either
export the function env vars in your shell or add them via `netlify env:set`
so `netlify dev` can see them too.

## Hidden manager access
There's no visible "Login" link.
- **Desktop**: `Ctrl+Alt+L` (or `Cmd+Alt+L` on Mac) anywhere on the site
- **Mobile**: 5 quick taps on the club crest (top-left of the navbar), or a
  ~0.7s long-press on it

See `src/hooks/useAdminAccessTrigger.js`.

## On fixture/result colour coding
Win = green, draw = blue, loss = red — computed automatically from the score
you enter (`netlify/functions/content.js` and `FixtureModal.jsx`), not
something the admin sets by hand.

## A note on scale
This is intentionally built for a small club's volume of edits (a few
fixtures/news posts a week, a modest photo gallery). GitHub API rate limits
(5,000 requests/hour on the token) and jsDelivr's free CDN comfortably cover
that. If Dragon FC ever needs many admins editing concurrently, or a gallery
of thousands of photos, that's the point to revisit and introduce a real
database — not before.
