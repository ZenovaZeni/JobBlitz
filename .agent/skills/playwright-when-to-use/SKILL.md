---
name: playwright-when-to-use
description: Guidelines for deciding when to use Playwright for browser-level verification.
---

# Playwright: When to Use in JobBlitz

Use Playwright only when browser-level verification is genuinely necessary. It's a powerful tool for finding UI and flow regressions, but it should not be the first tool for every problem.

## Recommended Use Cases
Use Playwright when you need to:
- **Verify End-to-End Flows**: Start-to-finish user journeys (e.g., job application session creation).
- **Check Auth & Session Creation**: Confirming signup, login, and correct cookie/session persistence.
- **Test Route & Redirect Logic**: Ensuring that certain pages are protected or that users are sent to the right place after an action.
- **UX & Responsive Inspection**:
    - Sticky headers, modals, drawers, and sidebars.
    - Mobile-specific layouts and interactions.
- **Session Continuity**: Testing behavior across multiple tabs or after a page refresh.
- **Visual Regression**: Capturing and comparing screenshots when visual layout changes significantly.
- **Admin & RBAC Access**: Confirming that restricted areas (e.g., `/admin`) are correctly protected from non-admin users.

## When NOT to Use
Do not use Playwright for:
- **Simple Code Logic**: If you can verify the fix by just reading the code or checking a log, don't spin up a browser.
- **Backend-Only Planning**: Database schema changes or logic refactors that don't directly affect the immediate UI flow.
- **Initial Debugging**: Always try to find the root cause in the code first before using Playwright as a diagnostic tool.

## Operational Rules
- **Targeted Verification > Broad Runs**: Favor small, targeted tests that verify one thing quickly. Avoid running the entire test suite for every minor change.
- **Verify One Flow at a Time**: Keep test scopes narrow to help isolate failures.
- **Screenshot Evidence**: Capture screenshots (and label them) whenever visual judgment or layout correctness is the goal.
- **Verification, Not Discovery**: Use Playwright primarily to *confirm* a fix or a new feature's behavior, not as a substitute for thorough code analysis.
