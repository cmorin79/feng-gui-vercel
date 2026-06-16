# Feng-GUI Analyzer (Vercel)

A tiny serverless endpoint that calls the **Feng-GUI ImageAttention** API server-side
and returns the attention maps + metrics. It exists because some environments (like
Cowork) can't reach `feng-gui.com` directly — Vercel's servers can, and they keep your
API token safe as an environment variable.

## What's here
- `api/analyze.js` — serverless function. `GET /api/analyze?image=<public-url>`
- `public/index.html` — a simple tester page (served at the site root)
- `.env.example` — the one variable you need to set (`FENGGUI_TOKEN`)

## Deploy (GitHub → Vercel, auto-deploy)

1. **Create a new GitHub repo** and push this folder to it:
   ```bash
   cd feng-gui-vercel
   git init
   git add .
   git commit -m "Feng-GUI analyzer"
   git branch -M main
   git remote add origin https://github.com/<you>/feng-gui-vercel.git
   git push -u origin main
   ```
2. **Import the repo into Vercel** (vercel.com → Add New → Project → pick the repo).
3. **Add the environment variable** in Vercel → Settings → Environment Variables:
   - `FENGGUI_TOKEN` = your Feng-GUI API token
4. **Deploy.** Every future `git push` redeploys automatically.

## Use it

- Host an image: drop it into `public/` and push, then it's live at
  `https://<your-app>.vercel.app/<filename>`.
- Analyze: open `https://<your-app>.vercel.app/api/analyze?image=https://<your-app>.vercel.app/<filename>`
- Or use the tester page at `https://<your-app>.vercel.app/`.

The JSON response (maps + metrics) feeds straight into the NeuroMap report builder.

## Notes
- Your token is **never** in the code or the browser — only in Vercel env vars.
- The `dashboard` link in the response is only valid for images already stored in
  your Feng-GUI user folder; the `result` payload is the reliable output.
