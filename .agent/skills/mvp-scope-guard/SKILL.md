---
name: mvp-scope-guard
description: >
  Forces the smallest useful version of a product by cutting scope ruthlessly and
  identifying the highest-risk features. Use this skill before any build begins,
  or when the user is adding features to an existing project and risks scope creep.
  Especially useful for solo builders and AI/no-code developers who need to ship fast
  and validate before investing in complexity.
---

# MVP Scope Guard Skill

## When to Use
- User is about to start building a new product and hasn't defined v1 yet
- User is listing features and the list is growing beyond what one person can ship in 1–2 weeks
- User wants to know what to cut from a plan
- User is debating whether to add a "nice to have" feature before launching
- User wants a clear build order to avoid blocking themselves

## Step-by-Step Instructions

### Step 1 — Capture the Full Feature List
Ask the user to brain-dump every feature they're considering. If a list already exists, use it. Do not filter yet. Just collect.

### Step 2 — Apply the MVP Filter
For each feature, ask:
1. **Can users get core value without this?** → If yes, it's not v1
2. **Does this help the user convert, retain, or pay?** → If no, it's not v1
3. **Can this be faked or done manually at first?** → If yes, defer it
4. **Does this require a third-party integration or complex backend?** → Flag as risky

### Step 3 — Categorize Features
Sort every feature into one of four buckets:

- **v1 (Ship It)**: Absolutely required for the product to work and deliver its core promise
- **v2 (Next Sprint)**: High value but not blocking — add after first user feedback
- **Later (Backlog)**: Good ideas but low urgency — revisit after traction
- **Cut It**: Not aligned with core value prop, adds complexity, or targets a user segment that isn't v1

### Step 4 — Flag Risky Integrations
List any features that depend on:
- Third-party APIs with rate limits, pricing, or reliability risk
- Complex auth flows (OAuth, SSO, multi-tenant)
- Real-time infrastructure (websockets, live sync)
- AI features that require prompt engineering + fallback handling
- Payment processing or compliance requirements

For each, estimate the risk level: **Low / Medium / High**

### Step 5 — Define Non-Goals
Explicitly state what this product is NOT trying to do in v1. This is as important as the feature list. Non-goals prevent scope drift during build.

### Step 6 — Recommend Build Order
Given the v1 features, define the recommended build sequence:
- What to build first (foundation, auth, core loop)
- What to build second (main value-delivery feature)
- What to build last (polish, edge cases, settings)
- What to validate manually before building (things that could invalidate the concept)

---

## Output Structure

```
## 🎯 v1 Features (Ship It)
| Feature | Why It's Required |
|---------|------------------|
| [feature] | [reason] |

## 🔜 v2 Features (Next Sprint)
| Feature | Why It's Deferred |
|---------|------------------|
| [feature] | [reason] |

## 📋 Later / Backlog
- [feature] — [brief note]

## ✂️ Cut It
- [feature] — [reason for cutting]

## ⚠️ Risky Integrations
| Integration | Risk | Reason |
|-------------|------|--------|
| [name] | Low/Med/High | [why] |

## 🚫 Non-Goals (v1 Explicitly Does NOT Include)
- [non-goal 1]
- [non-goal 2]
- [non-goal 3]

## 🏗️ Recommended Build Order
1. [First thing to build — why]
2. [Second — why]
3. [Third — why]
4. [What to manually validate before building X]

## 🧪 Pre-Build Validation Checklist
- [ ] Can you describe the core loop in one sentence?
- [ ] Do you have at least one real potential user you can test with?
- [ ] Is the v1 list small enough to ship in 1–2 weeks with Lovable/Cursor/Supabase?
- [ ] Have you removed every feature that requires a paid API you haven't tested?
```

## Quality Rules
- v1 must be shippable by a solo builder in 1–2 weeks using AI tools
- If v1 has more than 10 features, it is too large — cut more
- Every risky integration must have an explicit fallback or manual workaround identified
- Non-goals must be opinionated and specific, not generic (avoid "we're not building X for now")
- Build order must account for dependencies (e.g. auth before any user-specific data)
- The output must be actionable — no vague advice, every item must have a reason
