---
name: senior-dev-standards
description: Ensures clean, maintainable, and readable code matching JobBlitz patterns.
---

# Senior Dev Standards for JobBlitz

Implement changes in JobBlitz like a senior engineer. Prioritize long-term maintainability and readability over cleverness.

## Code Quality & Pattern Matching
- **Match Existing Patterns**: Always study current files in the directory to match naming conventions, file structure, and design patterns.
- **Boring > Clever**: Prefer "boring," explicit, and readable code over complex abstractions or "clever" one-liners. If a junior dev can't immediately understand it, it's probably too clever.
- **Focused Components**: Keep components small, focused, and single-purpose. If a component is growing too large, split it logically.
- **No Duplication**: Avoid copy-pasting logic. Extract reusable helpers or hooks *only* when the abstraction is clearly justified and doesn't introduce unnecessary indirection.

## UI & Styling (Tailwind)
- **Strict Tailwind**: Use standard Tailwind utility classes. Avoid arbitrary values (e.g., `top-[13px]`) unless absolutely necessary for a specific design requirement.
- **Consistency is King**: Maintain consistent spacing, typography, and color usage across the entire app. Use the defined design tokens.

## Architecture & State
- **Explicit State**: Prefer explicit, predictable state management over confusing implicit behaviors or "magic" effects.
- **Graceful Failure**: Always wrap potentially flaky operations in clear error handling. The UI should never "just break"; it should fail gracefully with actionable feedback for the user.
- **Tradeoff Communication**: Before making significant structural or architectural changes, explain the tradeoffs to the USER and wait for confirmation.

## Terminology
- **Consistent Vocabulary**: Use the established JobBlitz domain language:
    - `Session`: The core unit of a job application attempt.
    - `Profile`: The user's primary identity.
    - `Tailored Resume`: A resume customized for a specific job.
    - `Cover Letter`: Part of a session's workspace.
    - `Interview Prep`: Practical tools for the interview stage.
    - `Plan Tier`: Free, Pro, etc.
- **Maintainability First**: Write code as if the person who has to maintain it is a violent psychopath who knows where you live.
