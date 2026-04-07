'use strict'

// ── Config ────────────────────────────────────────────────────────────────────
// TODO: Update this to your deployed Vercel URL before publishing.
const JOBBLITZ_APP_URL = 'https://app.jobblitz.ai'

// Must match JD_MAX_CHARS in src/config/constants.js
const JD_MAX_CHARS = 15_000

// ── Supported site patterns ───────────────────────────────────────────────────
const SUPPORTED_SITES = [
  { pattern: /linkedin\.com\/jobs\/view\//,         label: 'LinkedIn'    },
  { pattern: /boards\.greenhouse\.io\/.+\/jobs\//,  label: 'Greenhouse'  },
  { pattern: /jobs\.lever\.co\//,                   label: 'Lever'       },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function showState(id) {
  document.querySelectorAll('.state').forEach(el => el.classList.add('hidden'))
  document.getElementById(id)?.classList.remove('hidden')
}

function getSite(url) {
  for (const { pattern, label } of SUPPORTED_SITES) {
    if (pattern.test(url)) return label
  }
  return null
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function init() {
  showState('state-loading')

  // Get the active tab.
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.url) {
    showState('state-unsupported')
    return
  }

  const site = getSite(tab.url)
  if (!site) {
    showState('state-unsupported')
    return
  }

  // Ask the content script to extract job data.
  let data
  try {
    data = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_JOB' })
  } catch {
    // Content script not reachable — tab was open before extension installed.
    showState('state-refresh')
    return
  }

  // Normalise: treat missing / falsy data as partial.
  if (!data) data = { success: false, role: '', company: '', jd: '', sourceUrl: tab.url }

  // ── Populate detected state ──
  document.getElementById('source-badge').textContent = site

  document.getElementById('job-company').textContent =
    data.company || 'Company not detected'

  document.getElementById('job-role').textContent =
    data.role || 'Role not detected'

  const jdRow = document.getElementById('jd-row')
  if (data.jd) {
    jdRow.className = 'jd-row jd-ok'
    jdRow.textContent = `✓ Job description captured (${data.jd.length.toLocaleString()} chars)`
  } else {
    jdRow.className = 'jd-row jd-warn'
    jdRow.textContent = "⚠ No JD detected — you'll paste it in JobBlitz"
  }

  // ── CTA ──
  document.getElementById('send-btn').addEventListener('click', () => {
    const params = new URLSearchParams()
    if (data.company)   params.set('company',    data.company)
    if (data.role)      params.set('role',        data.role)
    if (data.jd)        params.set('jd',          data.jd.slice(0, JD_MAX_CHARS))
    if (data.sourceUrl) params.set('source_url',  data.sourceUrl)

    chrome.tabs.create({ url: `${JOBBLITZ_APP_URL}/app/tailor?${params.toString()}` })
    window.close()
  })

  showState('state-detected')
}

document.addEventListener('DOMContentLoaded', init)
