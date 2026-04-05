---
name: jobblitz-supabase-rules
description: Rules for database, auth, and RLS work in JobBlitz.
---

# JobBlitz Supabase & Database Rules

Follow these rules whenever you're touching Supabase, authentication, or database schemas.

## Row Level Security (RLS)
- **Always Enable RLS**: Never leave RLS disabled as a final state. Every table containing user or organizational data must have Row Level Security enabled.
- **Verify Table-by-Table**: When restoring or changing RLS policies, verify them table-by-table to ensure no unauthorized access is possible.

## Schema & Migration Management
- **Keep Migrations in Sync**: If you make a schema change via MCP or manual SQL commands, you MUST also create or update the corresponding migration file on disk.
- **Root Cause Analysis**: Confirm the root cause of an issue before dropping indexes, altering core auth tables, or changing critical infrastructure. Do not use destructive operations as a first-line fix.

## Testing & Verification
- **Real Over Synthetic**: Prefer actual database state over "mock" or "synthetic" frontend hacks for profiles or authentication.
- **Distinguish Test vs. Prod**: Explicitly distinguish between simulated/manual database testing (e.g., manual ID insertion, temp bypasses) and real production-ready behavior. Do not conflate the two in summaries or documentation.
- **Restriction Verification**: Keep admin access restricted deliberately and verify it through active testing.

## Security & Privacy
- **Safe Logging**: Never log secrets, private tokens, passwords, or unsafe payloads.
- **Policy Granularity**: Ensure policies specify exactly what is allowed for `SELECT`, `INSERT`, `UPDATE`, and `DELETE`. Avoid overly broad "ALL" policies when a specific one suffices.
