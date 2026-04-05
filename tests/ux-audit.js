/**
 * JobBlitz UX Audit — fixed render-wait version
 * Waits for React to actually mount before capturing.
 */
import { chromium } from '@playwright/test'
import { mkdirSync } from 'fs'
import { join } from 'path'

const BASE = 'http://localhost:5173'
const OUT  = join(process.cwd(), 'tests/audit-screenshots')
mkdirSync(OUT, { recursive: true })

const DESKTOP = { width: 1440, height: 900 }
const MOBILE  = { width: 390,  height: 844 }
const NARROW  = { width: 375,  height: 812 }

async function goto(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'load' })
  // Wait for React root to populate — nav is always present on every page
  await page.waitForSelector('nav, main, #root > *', { timeout: 15000 })
  // Extra settle time for fonts + animations
  await page.waitForTimeout(1200)
}

async function shot(page, name) {
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: false })
  console.log(`  ✓ ${name}.png`)
}

async function scrollTo(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (el) el.scrollIntoView({ behavior: 'instant' })
  }, selector)
  await page.waitForTimeout(500)
}

async function scrollPx(page, px) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), px)
  await page.waitForTimeout(400)
}

;(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--font-render-hinting=none', '--disable-font-subpixel-positioning'],
  })

  console.log('\n📸 JobBlitz UX Audit\n')

  // ── LANDING — DESKTOP ──────────────────────────────────────────────────────
  {
    const ctx  = await browser.newContext({ viewport: DESKTOP })
    const page = await ctx.newPage()
    console.log('Landing — Desktop 1440px')
    await goto(page, '/')

    await shot(page, '01-landing-desktop-hero')

    await scrollPx(page, 500)
    await shot(page, '02-landing-desktop-trust-bar')

    await scrollTo(page, '#live-demo')
    await shot(page, '03-landing-desktop-demo')

    await scrollTo(page, '#packet')
    await shot(page, '04-landing-desktop-packet')

    await scrollTo(page, '#how-it-works')
    await shot(page, '05-landing-desktop-how-it-works')

    // FAQ section — scroll near bottom
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight - 1600, behavior: 'instant' }))
    await page.waitForTimeout(400)
    await shot(page, '06-landing-desktop-faq')

    // Open first FAQ item
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')]
      const faq = btns.find(b => b.textContent?.includes("Won't it sound"))
      if (faq) faq.click()
    })
    await page.waitForTimeout(400)
    await shot(page, '07-landing-desktop-faq-open')

    // CTA block
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
    await page.waitForTimeout(400)
    await shot(page, '08-landing-desktop-cta')

    await ctx.close()
  }

  // ── LANDING — MOBILE 390px ─────────────────────────────────────────────────
  {
    const ctx  = await browser.newContext({ viewport: MOBILE, isMobile: true, hasTouch: true })
    const page = await ctx.newPage()
    console.log('\nLanding — Mobile 390px')
    await goto(page, '/')

    await shot(page, '09-landing-mobile-hero')

    await scrollPx(page, 480)
    await shot(page, '10-landing-mobile-below-fold')

    await scrollTo(page, '#live-demo')
    await shot(page, '11-landing-mobile-demo')

    // Demo textarea interaction
    const ta = page.locator('textarea').first()
    if (await ta.count() > 0) {
      await ta.fill('Senior Software Engineer at Stripe. We are looking for 5+ years experience with distributed systems, Go or Python, and experience with payment infrastructure. Strong candidates will have built high-throughput APIs and worked cross-functionally.')
      await page.waitForTimeout(300)
      await shot(page, '12-landing-mobile-demo-filled')
    }

    await scrollTo(page, '#packet')
    await shot(page, '13-landing-mobile-packet')

    await scrollTo(page, '#how-it-works')
    await shot(page, '14-landing-mobile-how-it-works')

    await ctx.close()
  }

  // ── LANDING — 375px narrow ─────────────────────────────────────────────────
  {
    const ctx  = await browser.newContext({ viewport: NARROW, isMobile: true, hasTouch: true })
    const page = await ctx.newPage()
    console.log('\nLanding — 375px (iPhone SE)')
    await goto(page, '/')
    await shot(page, '15-landing-375-hero')

    await scrollTo(page, '#live-demo')
    await shot(page, '16-landing-375-demo')

    await scrollTo(page, '#packet')
    await shot(page, '17-landing-375-packet')

    await ctx.close()
  }

  // ── SIGNUP ─────────────────────────────────────────────────────────────────
  {
    const ctx  = await browser.newContext({ viewport: DESKTOP })
    const page = await ctx.newPage()
    console.log('\nSignup — Desktop')
    await goto(page, '/auth/signup')
    await shot(page, '18-signup-desktop')
    await ctx.close()
  }
  {
    const ctx  = await browser.newContext({ viewport: MOBILE, isMobile: true, hasTouch: true })
    const page = await ctx.newPage()
    console.log('Signup — Mobile')
    await goto(page, '/auth/signup')
    await shot(page, '19-signup-mobile')
    // Scroll down to see button
    await scrollPx(page, 400)
    await shot(page, '20-signup-mobile-scrolled')
    await ctx.close()
  }

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  {
    const ctx  = await browser.newContext({ viewport: DESKTOP })
    const page = await ctx.newPage()
    console.log('\nLogin — Desktop')
    await goto(page, '/auth/login')
    await shot(page, '21-login-desktop')
    await ctx.close()
  }

  // ── PRICING ───────────────────────────────────────────────────────────────
  {
    const ctx  = await browser.newContext({ viewport: DESKTOP })
    const page = await ctx.newPage()
    console.log('\nPricing — Desktop')
    await goto(page, '/pricing')
    await shot(page, '22-pricing-desktop-top')
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'instant' }))
    await page.waitForTimeout(400)
    await shot(page, '23-pricing-desktop-mid')
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
    await page.waitForTimeout(400)
    await shot(page, '24-pricing-desktop-bottom')
    await ctx.close()
  }
  {
    const ctx  = await browser.newContext({ viewport: MOBILE, isMobile: true, hasTouch: true })
    const page = await ctx.newPage()
    console.log('Pricing — Mobile')
    await goto(page, '/pricing')
    await shot(page, '25-pricing-mobile-top')
    await scrollPx(page, 600)
    await shot(page, '26-pricing-mobile-mid')
    await ctx.close()
  }

  // ── AUTH REDIRECT (unauthenticated app access) ─────────────────────────────
  {
    const ctx  = await browser.newContext({ viewport: DESKTOP })
    const page = await ctx.newPage()
    console.log('\nAuth guard redirect')
    await page.goto(`${BASE}/app/dashboard`, { waitUntil: 'load' })
    await page.waitForTimeout(2500) // let AuthGuard redirect
    await shot(page, '27-auth-redirect-result')
    await ctx.close()
  }

  // ── TAILORING — unauthenticated state ─────────────────────────────────────
  {
    const ctx  = await browser.newContext({ viewport: DESKTOP })
    const page = await ctx.newPage()
    console.log('\nTailoring — Desktop (unauth redirect)')
    await page.goto(`${BASE}/app/tailor`, { waitUntil: 'load' })
    await page.waitForTimeout(2500)
    await shot(page, '28-tailor-unauth-desktop')
    await ctx.close()
  }
  {
    const ctx  = await browser.newContext({ viewport: MOBILE, isMobile: true, hasTouch: true })
    const page = await ctx.newPage()
    console.log('Tailoring — Mobile (unauth redirect)')
    await page.goto(`${BASE}/app/tailor`, { waitUntil: 'load' })
    await page.waitForTimeout(2500)
    await shot(page, '29-tailor-unauth-mobile')
    await ctx.close()
  }

  // ── DEV LOGIN → authenticated pages ───────────────────────────────────────
  {
    const ctx  = await browser.newContext({ viewport: DESKTOP })
    const page = await ctx.newPage()
    console.log('\nDev login flow')
    await goto(page, '/dev-login')
    await shot(page, '30-devlogin-page')

    // Click first button on dev login page
    const buttons = page.locator('button')
    const count = await buttons.count()
    if (count > 0) {
      await buttons.first().click()
      await page.waitForTimeout(3000)
      await shot(page, '31-post-devlogin')

      // Now try dashboard
      await page.goto(`${BASE}/app/dashboard`, { waitUntil: 'load' })
      await page.waitForSelector('main, nav', { timeout: 8000 }).catch(() => {})
      await page.waitForTimeout(1500)
      await shot(page, '32-dashboard-authenticated')

      // Tailor page authenticated
      await page.goto(`${BASE}/app/tailor`, { waitUntil: 'load' })
      await page.waitForSelector('main', { timeout: 8000 }).catch(() => {})
      await page.waitForTimeout(1500)
      await shot(page, '33-tailor-authenticated-desktop')

      // Tailor — mobile viewport (new context with same storage state isn't possible here
      // so we just resize conceptually by reading the mobile screenshots separately)
    }
    await ctx.close()
  }

  // ── MOBILE TAILOR via dev login ────────────────────────────────────────────
  {
    const ctx  = await browser.newContext({ viewport: MOBILE, isMobile: true, hasTouch: true })
    const page = await ctx.newPage()
    console.log('\nTailoring — Mobile dev login flow')
    await goto(page, '/dev-login')
    const buttons = page.locator('button')
    if (await buttons.count() > 0) {
      await buttons.first().click()
      await page.waitForTimeout(3000)
      await page.goto(`${BASE}/app/tailor`, { waitUntil: 'load' })
      await page.waitForSelector('main', { timeout: 8000 }).catch(() => {})
      await page.waitForTimeout(1500)
      await shot(page, '34-tailor-mobile-wizard-step1')

      // Fill step 1
      const inputs = page.locator('input')
      if (await inputs.count() >= 2) {
        await inputs.nth(0).fill('Stripe')
        await inputs.nth(1).fill('Senior Software Engineer')
        await page.waitForTimeout(300)
        await shot(page, '35-tailor-mobile-step1-filled')

        // Tap next
        const nextBtn = page.locator('button').filter({ hasText: 'Next' }).first()
        if (await nextBtn.count() > 0) {
          await nextBtn.click()
          await page.waitForTimeout(500)
          await shot(page, '36-tailor-mobile-step2-jd')

          // Fill JD
          const ta = page.locator('textarea').first()
          if (await ta.count() > 0) {
            await ta.fill('Senior Software Engineer at Stripe. We are looking for someone with 5+ years building distributed systems at scale. You will work on our payment infrastructure, designing APIs that handle millions of transactions daily. Strong experience with Go, Python, PostgreSQL and AWS required. Experience with financial systems and compliance a strong plus.')
            await page.waitForTimeout(300)
            await shot(page, '37-tailor-mobile-step2-filled')

            const next2 = page.locator('button').filter({ hasText: 'Next' }).first()
            if (await next2.count() > 0) {
              await next2.click()
              await page.waitForTimeout(600)
              await shot(page, '38-tailor-mobile-step3-confirm')
            }
          }
        }
      }
    }
    await ctx.close()
  }

  await browser.close()
  console.log(`\n✅ Done — ${OUT}\n`)
})()
