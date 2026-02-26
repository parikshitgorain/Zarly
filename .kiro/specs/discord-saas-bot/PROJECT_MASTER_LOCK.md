# 🔒 PROJECT MASTER LOCK PROTOCOL
# Universal Enforcement System for Entire Project Lifecycle

This is a production-grade, multi-tenant Discord SaaS system.

This protocol applies to:
- New features
- Feature updates
- Bug fixes
- Refactors
- Performance improvements
- Premium upgrades
- AI modifications
- Database changes
- Dashboard changes
- API changes
- Worker logic changes

No exception.

A feature is NOT complete unless it passes ALL rules below.

============================================================
1️⃣ CORE PRINCIPLE
============================================================

NO FEATURE MAY EXIST IN ONLY ONE LAYER.

Every feature must be fully wired across:

- Bot Layer
- API Layer
- Database Layer
- Redis Layer
- Worker Layer
- Dashboard Layer
- Permission Layer
- Logging Layer
- Premium Gating Layer
- Test Layer
- Documentation Layer

Partial implementation is forbidden.

============================================================
2️⃣ FULL FEATURE LIFECYCLE ENFORCEMENT
============================================================

For ANY feature addition or modification, the AI MUST:

STEP 1 → Define complete lifecycle
STEP 2 → Define DB schema impact
STEP 3 → Define migration (forward + rollback)
STEP 4 → Define Redis key structure
STEP 5 → Define API routes & validation schema
STEP 6 → Define Bot command wiring
STEP 7 → Define Worker jobs (if async)
STEP 8 → Define Dashboard UI changes
STEP 9 → Define Permission enforcement
STEP 10 → Define Logging & analytics
STEP 11 → Define Premium gating (if applicable)
STEP 12 → Generate full test suite
STEP 13 → Verify 90%+ coverage
STEP 14 → Verify regression safety

If any step missing → STOP.

============================================================
3️⃣ TESTING ENFORCEMENT (MANDATORY)
============================================================

Minimum Coverage:
- 90% lines
- 90% branches
- 90% functions
- 90% statements

Required test types:

1. Happy path
2. Permission denied
3. Invalid input
4. Rate limit exceeded
5. Redis failure
6. DB failure
7. Worker failure
8. External API failure
9. Premium expired
10. Cross-guild isolation
11. Concurrency test
12. Duplicate execution test

All tests must use structured mock data.

============================================================
4️⃣ MOCK DATA STANDARD
============================================================

Never use real IDs.

Required mock structure:

- guild_id
- user_id
- role_ids
- permission sets
- shard_id
- premium status

All tests must simulate:
- Multi-guild isolation
- Multi-shard execution
- High concurrency events

============================================================
5️⃣ DATABASE RULES
============================================================

Any DB change must include:

- Migration file
- Rollback migration
- Index validation
- Foreign key validation
- Default value handling
- Backward compatibility

Never:
- Drop column without migration
- Rename column without compatibility layer
- Break existing data

============================================================
6️⃣ REDIS RULES
============================================================

All Redis keys must:

Format:
bot:{guildId}:{feature}:{key}

Rules:
- Namespaced per guild
- TTL defined for temporary data
- Cleanup defined
- Shard-safe
- No cross-guild leakage

Test:
- Expiration
- Corruption
- Missing key
- Concurrent update

============================================================
7️⃣ WORKER RULES
============================================================

All async tasks must:

- Be idempotent
- Have retry policy
- Have timeout guard
- Have failure logging
- Support duplicate execution protection
- Support dead-letter handling

Giveaways, timers, scheduled messages MUST run in worker.

Never execute heavy logic inside Discord event handler.

============================================================
8️⃣ BOT LAYER RULES
============================================================

Bot must:

- Never directly query DB for heavy reads
- Use Redis cache for configs
- Validate role hierarchy
- Validate permissions before execution
- Handle shard distribution
- Enforce cooldowns

No direct DB inside high-frequency events.

============================================================
9️⃣ API RULES
============================================================

All endpoints must:

- Validate input schema
- Validate JWT/session
- Validate guild ownership
- Enforce permission guards
- Enforce premium gates
- Return consistent error structure

Must handle:
- 401 Unauthorized
- 403 Forbidden
- 400 Bad Input
- 429 Rate Limit
- 500 Internal Error

============================================================
🔟 DASHBOARD RULES
============================================================

No backend feature without:

- UI toggle
- Visual state sync
- Loading state handling
- Error display
- Permission visibility filter

UI must reflect backend truth at all times.

============================================================
1️⃣1️⃣ PREMIUM ENFORCEMENT
============================================================

All premium features must:

- Validate entitlement at API layer
- Validate again at execution layer
- Gracefully downgrade
- Never delete user data on downgrade
- Log premium validation failures

============================================================
1️⃣2️⃣ AI SYSTEM RULES
============================================================

AI features must:

- Be isolated per guild
- Prevent cross-guild data leakage
- Enforce token limits
- Enforce timeout fallback
- Enforce per-user cooldown
- Enforce per-guild quota
- Log failures
- Protect against prompt injection attempts

============================================================
1️⃣3️⃣ PERFORMANCE RULES
============================================================

Every feature must pass:

- 1000 concurrent event simulation
- 500 XP events per second test
- Giveaway stress test
- Redis load test
- Worker retry simulation

No blocking operations allowed in event loop.

============================================================
1️⃣4️⃣ SECURITY RULES
============================================================

Must protect against:

- Role hierarchy abuse
- Self-punishment exploits
- Mass mention abuse
- API abuse
- Rate limit bypass
- Cross-guild data exposure

All sensitive operations must be server-validated.

============================================================
1️⃣5️⃣ REGRESSION PROTECTION
============================================================

When modifying existing code:

1. Run full test suite.
2. Add new tests if behavior changes.
3. Maintain backward compatibility.
4. Validate migration compatibility.
5. Validate downgrade compatibility.

Breaking change requires:
- Versioned migration
- Compatibility layer

============================================================
FINAL COMPLETION CHECKLIST
============================================================

A feature is COMPLETE only if:

✔ Full lifecycle defined
✔ Bot wired
✔ API defined
✔ DB migration added
✔ Redis structure defined
✔ Worker job registered
✔ Dashboard updated
✔ Permissions enforced
✔ Logs implemented
✔ Premium gating enforced
✔ Tests written
✔ 90%+ coverage achieved
✔ Regression tests passed
✔ No security risk introduced
✔ No performance bottleneck introduced

If any item fails → Feature is REJECTED.

============================================================
ABSOLUTE RULE
============================================================

If a feature is not fully wired, fully tested,
fully secure, fully scalable, and fully logged —

IT DOES NOT EXIST.