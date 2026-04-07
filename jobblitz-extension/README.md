# JobBlitz Chrome Extension

Sends any job posting to JobBlitz with company, role, and job description pre-filled.

## Supported sites (V1)
- LinkedIn (`linkedin.com/jobs/view/*`)
- Greenhouse (`boards.greenhouse.io/*/jobs/*`)
- Lever (`jobs.lever.co/*/*`)

## Setup

### 1. Set your app URL
Open `popup/popup.js` and update the first constant:
```js
const JOBBLITZ_APP_URL = 'https://your-vercel-url.vercel.app'
```

### 2. Generate icons
Open `icons/generate-icons.html` in Chrome.
Click each Download button. Move the three files into `icons/`:
```
icons/icon16.png
icons/icon48.png
icons/icon128.png
```

### 3. Load in Chrome
1. Go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select this `jobblitz-extension/` folder

## How it works

```
Job page (LinkedIn / Greenhouse / Lever)
  └─ content/content.js  (injected at document_idle)
       extracts: company, role, job description, source URL

User clicks extension icon
  └─ popup/popup.js
       ① queries active tab URL — checks if supported site
       ② sends EXTRACT_JOB message to content script
       ③ displays: company · role · JD char count
       ④ "Build My Packet" → opens:
            /app/tailor?company=X&role=Y&jd=Z&source_url=W

JobBlitz app (JobTailoring.jsx)
  └─ reads query params on mount → prefills form state → cleans URL
```

## V2 ideas
- `workday.com`, `ashbyhq.com`, `careers.google.com`, `icims.com` extractor support
- Show match score preview before opening app (requires auth token)
- "Save for later" — store jobs without immediately building a packet
- One-click "Quick Apply" shortcut from the extension
- Badge on extension icon showing saved job count
