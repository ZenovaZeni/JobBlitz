'use strict'

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Try each selector in order; return the first non-empty innerText match. */
function first(selectors) {
  for (const sel of selectors) {
    const text = document.querySelector(sel)?.innerText?.trim()
    if (text) return text
  }
  return null
}

// ── Site extractors ───────────────────────────────────────────────────────────

function extractLinkedIn() {
  const role = first([
    '.jobs-unified-top-card__job-title h1',
    '.job-details-jobs-unified-top-card__job-title h1',
    // Older LinkedIn layout
    'h1.t-24.t-bold',
    'h1.t-24',
  ])

  const company = first([
    '.jobs-unified-top-card__company-name a',
    '.job-details-jobs-unified-top-card__company-name a',
    '.jobs-unified-top-card__company-name',
    '.job-details-jobs-unified-top-card__company-name',
  ])

  // LinkedIn often hides JD behind a "Show more" button.
  // Grab whatever is visible; if the user expands it first we get everything.
  const jdEl =
    document.querySelector('.jobs-description__content .jobs-box__html-content') ||
    document.querySelector('#job-details') ||
    document.querySelector('.jobs-description__content') ||
    document.querySelector('.jobs-description-content__text--stretch') ||
    document.querySelector('.jobs-description-content__text')

  return { role, company, jd: jdEl?.innerText?.trim() || null }
}

function extractGreenhouse() {
  const role = first([
    'h1.app-title',
    '.app-title',
    'h1',
  ])

  // Company name lives in the logo image alt text or a dedicated element.
  // Fall back to extracting from page <title> ("Role at Company — Greenhouse").
  const companyFromTitle = document.title.match(/(?:at|@)\s+(.+?)(?:\s+[-–—]|$)/i)?.[1]?.trim()
  const company = first(['.company-name']) || companyFromTitle || null

  const jdEl =
    document.querySelector('#content .job__description') ||
    document.querySelector('.job__description') ||
    document.querySelector('#content')

  return { role, company, jd: jdEl?.innerText?.trim() || null }
}

function extractLever() {
  const role = first([
    '.posting-headline h2',
    'h2[data-qa="posting-name"]',
    '.posting h2',
  ])

  // Lever pages show the company name in the header logo area.
  // Most reliable fallback: the first path segment of the URL is the company slug.
  const companyFromUrl = window.location.pathname.split('/').filter(Boolean)[0]
  const company = first([
    '.main-header .logo-text',
    '.site-header .company-name',
  ]) || (companyFromUrl
    // Convert slug to title case: "acme-corp" → "Acme Corp"
    ? companyFromUrl.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : null)

  const jdEl =
    document.querySelector('.section.description .content') ||
    document.querySelector('[data-qa="posting-description"]') ||
    document.querySelector('.posting-description') ||
    document.querySelector('.posting-content')

  return { role, company, jd: jdEl?.innerText?.trim() || null }
}

// ── Main ──────────────────────────────────────────────────────────────────────

function extractJobData() {
  const host = window.location.hostname
  let raw = null

  if (host.includes('linkedin.com'))   raw = extractLinkedIn()
  else if (host.includes('greenhouse.io')) raw = extractGreenhouse()
  else if (host.includes('lever.co'))  raw = extractLever()

  if (!raw) return { success: false }

  const hasAnything = raw.role || raw.company || raw.jd
  return {
    success:   !!hasAnything,
    role:      raw.role      || '',
    company:   raw.company   || '',
    jd:        raw.jd        || '',
    sourceUrl: window.location.href,
  }
}

// ── Message listener ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'EXTRACT_JOB') {
    sendResponse(extractJobData())
  }
  // Return false — response is synchronous.
  return false
})
