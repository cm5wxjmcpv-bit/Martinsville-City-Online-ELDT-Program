# ELDT Training MVP (Functional First)

This is a minimal, function-first ELDT training website.

## What’s included
- Login (index.html)
- Modules dashboard (dashboard.html)
- Anti-skip YouTube player (module.html)
- Google Apps Script backend (`apps-script/Code.gs`)
- Logging to Google Sheets

## Quick Setup
1) Create a Google Sheet with tabs and exact headers:
- Users: `username | password | display_name`
- Modules: `id | title | youtube_id | duration_hint_seconds`
- Completions: `timestamp | username | module_id | source`
- QuizScores: `timestamp | username | score | max_score` (later)

2) Apps Script
- New project → paste `apps-script/Code.gs`
- Script Properties → `SHEET_ID = <your sheet id>`
- Deploy → Web App → Execute as: **Me**, Access: **Anyone** → Deploy
- Copy the **Web App URL**

3) Frontend
- In `/js/config.js` set `WEB_APP_URL` and `SHEET_ID`
- Push to GitHub Pages
- Open `/index.html` to login

## Notes
- This is an MVP. Use real auth later (hash+salt, tokens, HTTPS).

