---
name: jobblitz-workflow-rules
description: Rules for agent collaboration, task ownership, and handoffs in the JobBlitz project.
---

# JobBlitz Workflow Rules

You are working inside the JobBlitz project alongside other AI agents and human developers. Follow these rules to ensure clean collaboration and prevent collisions.

## Agent Collaboration & Task Ownership
- **One Agent, One Task**: Only one agent should own a specific task scope at a time.
- **No Overlapping Edits**: Do not edit files that another agent is actively working on.
- **Check Before Working**: Always run `git status` or check the list of recently changed files before starting work in an area that another agent may have touched. Identify potential overlaps early.

## Handoffs & Checkpoints
- **Handoff Requirements**: Before handing off to another agent or completion, provide a clear checkpoint:
    - Perform a `git diff` review.
    - Provide a concise summary of all changed files and their impact.
    - Commit or checkpoint your progress if appropriate.

## Stability & Architecture
- **Preserve Working Flows**: Keep existing routes, UI flows, and functionality working unless explicitly instructed to replace them.
- **No Stealth Rewrites**: Do not introduce large architectural changes or refactors without explicit approval from the USER.
- **Low-Risk Over Clever**: Prefer practical, low-risk changes over "clever" or high-abstraction rewrites.

## Security & Verification
- **No Pseudo-Fixes**: Never claim that sensitive systems (Auth, Security, Billing, RLS) are "fixed" without explicit browser-level or database-level verification.
- **Cleanup Hacks**: Clearly label all temporary "smoke-test" or debugging hacks. Remove them immediately after they've served their purpose.

## Product Continuity
- **Maintain Direction**: Align all work with the current JobBlitz direction:
    - Smooth onboarding & tight workflow.
    - Reliable session continuity.
    - High-fidelity exports & mobile usability.
    - Robust admin observability.
