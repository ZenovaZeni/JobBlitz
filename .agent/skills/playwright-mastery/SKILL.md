---
name: playwright-mastery
description: >
  Transforms Playwright from a simple test runner into "Automated Eyes" for a solopreneur. 
  Use this skill to automate visual regression, perform high-speed manual flow verification, 
  and provide deep technical context when debugging UI or state-related issues. 
  Empowers a single developer to maintain the quality and reliability of a high-paid QA team.
---

# Playwright Mastery Skill

## When to Use
- **Post-Edit Verification**: After making changes to any core component (Navbar, Layout, Auth).
- **Visual Regression**: To ensure a CSS change didn't break layouts on mobile vs. desktop.
- **State "Driving"**: When a developer needs to see a page that requires a complex sequence of actions (e.g., "Show me the 4th step of the Resume Import flow").
- **Debugging Ghost Bugs**: When a bug only happens in specific browser environments or after specific timing.
- **Pre-Launch Sanity Check**: Before shipping a feature to production/test mode.

## Step-by-Step Instructions

### Step 1 — Define the Objective
Determine if you are:
1. **Testing Logic**: (e.g., "Does the signup form submit correctly?")
2. **Verifying Visuals**: (e.g., "Does the dashboard look good on an iPhone 12?")
3. **Fetching Context**: (e.g., "Why is the 'Save' button disabled on the Profile page?")

### Step 2 — Select the Tooling
- **Headed Mode**: Use `npx playwright test --headed` if you want the user to see the browser.
- **Traces**: Always run with `--trace on` when debugging so you can inspect the timeline, console logs, and network requests later in the Playwright Trace Viewer.
- **Screenshots**: Use `page.screenshot()` to provide immediate visual feedback to the AI assistant.

### Step 3 — Drive the Flow
Instead of asking the user for a screenshot, write a quick Playwright script to:
1. Navigate to the page.
2. Perform the required setup (Auth, data entry).
3. Capture the state (DOM snapshot, console logs, screenshot).

### Step 4 — Analyze the "Trace"
If a test fails:
1. Don't just guess. Open the trace report.
2. Check the **Action** timeline: Did the element exist at the time of the click?
3. Check **Network**: Did a Supabase call fail with a 403?
4. Check **Console**: Are there React hydration errors?

### Step 5 — Report Findings
Present the results to the user with:
- **Visual Evidence**: "I ran a mobile test; here is the screenshot showing the overlap."
- **Root Cause**: "The trace shows the session token was missing during the `useMasterProfile` hook call."
- **Efficiency Metrics**: "I verified 12 critical flows in 45 seconds—saving you 15 minutes of manual clicking."

---

## Output Structure

When using this skill, format your report as follows:

```markdown
### 🛡️ Playwright Verification Report: [Feature Name]

#### 📊 Results Summary
- **Tests Run**: [Number]
- **Status**: ✅ All Clear / ❌ Failures Detected
- **Environments**: [Desktop Chrome, iPhone 12, etc.]

#### 📸 Visual Context
![Mobile Viewport Leak](file:///path/to/screenshot.png)

#### 🔍 Root Cause Analysis (if applicable)
- **Problem**: [Describe the issue]
- **Trace Evidence**: [Link to trace/line number in report]
- **Proposed Fix**: [How to fix it]

#### 🚀 Efficiency Gain
- **Manual Time Saved**: ~[X] minutes
- **Flows Automated**: [List of flows verified]
```

## Quality Rules
- **Never Guess**: If a UI element isn't found, run a trace before suggesting a code change.
- **Clean State**: Always use `test.use({ storageState: 'auth.json' })` if possible to avoid redundant login steps.
- **Fast Feedback**: Smoke tests should run in < 10 seconds. If they take longer, split them.
- **Solopreneur Lens**: Focus on the most fragile paths (Auth, Payments, Data Sync) rather than 100% coverage.
```
