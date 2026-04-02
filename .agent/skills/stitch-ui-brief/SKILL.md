---
name: stitch-ui-brief
description: >
  Transforms a raw app idea into a structured, Google Stitch-ready design brief.
  Use this skill whenever the user wants to design a new SaaS product, web app, or
  dashboard UI and needs a polished brief to feed into Google Stitch (or similar
  AI design tools like v0, Lovable, or Framer AI). Best used at the very start of a
  new product or feature before any design or development work begins.
---

# Stitch UI Brief Skill

## When to Use
- User has a raw app idea and wants to generate a design brief for Google Stitch
- User is starting a new SaaS product, internal tool, or dashboard from scratch
- User wants to define brand feel, UX direction, and screen list before building
- User wants a copy-paste prompt that produces high-quality results in Stitch

## Step-by-Step Instructions

### Step 1 — Extract the Core Idea
Ask the user (or infer from context) the following:
- What does the app do in one sentence?
- Who is the primary user?
- What problem does it solve today that the user is doing manually or badly?
- What is the "magic moment" — the first time the user feels value?

### Step 2 — Define the Target User
Write a tight 2–3 sentence user persona. Include:
- Role/title (e.g. "early-stage founder", "ops manager at a 10-person agency")
- Key pain point
- What they care about (speed, accuracy, aesthetics, control)

### Step 3 — Craft the Core Value Proposition
One sentence. Format: "[App name] helps [target user] [achieve outcome] without [pain/friction]."

### Step 4 — Define Visual Style
Choose a direction from this list and add 2–3 specifics:
- **Dark Premium**: deep navy/slate backgrounds, electric accent colors, glassmorphism cards, subtle gradients
- **Clean SaaS**: white/light grey base, blue or indigo primary, tight typography, lots of whitespace
- **Editorial**: off-white cream tones, serif + sans-serif mix, high contrast, magazine-like layout
- **Minimal Utility**: monochrome, no decoration, function-first, dense data tables
- **Warm Brand**: earthy tones, rounded corners, friendly type, soft shadows

Also define:
- Primary color palette (2–3 colors with rough HEX or description)
- Typography feel (e.g. "Inter for UI, bold headings, generous line-height")
- Key UI motifs (e.g. "cards with top-border accent stripe", "pill badges", "sidebar nav")

### Step 5 — Define the UX Direction
In 3–5 bullet points, describe how the app should feel and behave:
- Navigation model (sidebar, topbar, tab-based, wizard flow)
- Density (compact data-heavy vs. airy content-focused)
- Interaction style (instant feedback, optimistic UI, step-by-step guided)
- Mobile vs desktop priority
- Tone (professional, playful, urgent, calm)

### Step 6 — Build the Screen List
List every screen the MVP needs. For each screen, include:
- Screen name
- 1-line description of what the user does there
- Key UI elements (e.g. table, form, chart, card grid, empty state)

Format as a numbered list. Group screens logically (e.g. Onboarding, Core App, Settings).

### Step 7 — Map the Key Flows
Define 2–3 critical user journeys. Each flow should be a numbered step sequence:
- Flow name (e.g. "First-Time Setup", "Core Loop", "Upgrade Path")
- Steps the user takes
- Where they enter and where they exit

### Step 8 — Write the Stitch Prompt
Synthesize everything into a single, copy-paste ready prompt for Google Stitch. The prompt should:
- Start with the app name and one-sentence description
- State the target user
- Describe the visual style and color palette
- List the screens to design
- Specify any layout or interaction requirements
- End with: "Design in a modern SaaS style. Prioritize clarity, hierarchy, and visual polish."

---

## Output Structure

```
## 🧠 App Summary
[One paragraph overview]

## 👤 Target User
[2–3 sentence persona]

## 🎯 Core Promise
[Single value proposition sentence]

## 🎨 Brand Feel
- Style: [chosen direction]
- Colors: [palette description]
- Typography: [font feel]
- UI Motifs: [key patterns]

## 🧭 UX Direction
- [bullet 1]
- [bullet 2]
- [bullet 3]
- [bullet 4]
- [bullet 5]

## 📱 Screen List
### Onboarding
1. [Screen Name] — [description] | Elements: [list]
2. ...

### Core App
1. ...

### Settings & Admin
1. ...

## 🔄 Key Flows
### Flow 1: [Name]
1. [step]
2. [step]
...

### Flow 2: [Name]
...

## 🚀 Stitch Prompt (Copy-Paste Ready)
---
[Full Stitch-optimized prompt]
---
```

## Quality Rules
- Keep the Stitch prompt under 500 words
- Be specific about colors, layout, and interaction — avoid vague words like "modern" or "clean" without details
- Every screen in the Screen List must have a clear purpose and at least 3 UI elements named
- The Target User section must name a specific role, not "anyone who..."
- Do not include backend logic or data models in this brief — this is a UI/UX document only
