# Jiyeon Park — Faculty Website

Personal academic website for [Jiyeon Park, Ph.D.](https://www.binghamton.edu), Assistant Professor of Special Education at Binghamton University, SUNY.

## Pages

| File | Content |
|------|---------|
| `index.html` | About, education, research interests |
| `research.html` | Research focus areas and recent publications |
| `publications.html` | Full publications list |
| `teaching.html` | Courses taught |
| `contact.html` | Contact information |

## AI Course Assistant

An embedded chat widget (bottom-right of every page) lets students ask questions about course syllabi. It is powered by the Google Gemini API.

- **Student view** — type a question; the assistant answers using the uploaded syllabus context.
- **Admin view** — password-protected panel to upload PDF syllabi (BUSped2025) and manage multiple courses.

### Setup

1. Copy `config.example.js` → `config.js` (or create `config.js` from scratch):

```js
const CONFIG = {
  GEMINI_API_KEY: 'YOUR_API_KEY_HERE',
  GEMINI_MODEL: 'gemini-2.0-flash-lite'   // update as needed
};
```

2. `config.js` is listed in `.gitignore` and will not be committed.

> ⚠️ **Security note:** Because this is a static site, the API key is visible in page source to anyone who views it. For production use, proxy Gemini requests through a server-side function (e.g., a Vercel Edge Function or Cloudflare Worker) so the key is never exposed to the browser.

## Local Development

No build step required. Open any HTML file directly in a browser, or use a simple local server:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## File Structure

```
.
├── index.html
├── research.html
├── publications.html
├── teaching.html
├── contact.html
├── styles.css
├── tabs.js
├── chat.js            # AI chat widget
├── config.js          # API key — gitignored, not committed
├── bu-logo.png
├── IMG_2675.png
├── jpark142.cv.pdf
└── Syllabus/
    └── SPED528_2026_syllabus.pdf
```

## Dependencies (CDN)

- [EB Garamond + DM Sans](https://fonts.google.com) — typography
- [marked.js](https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.6/marked.min.js) — Markdown rendering in chat
- [PDF.js](https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js) — syllabus PDF parsing (loaded on demand)

## Contact

jpark142@binghamton.edu · Academic Building B, Room 237 · (607) 777-9221
