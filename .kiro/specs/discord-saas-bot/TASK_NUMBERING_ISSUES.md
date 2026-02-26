# Task Numbering Issues Found in tasks.md

## Critical Duplicate Task Numbers

### Issue 1: Task 28 Subtasks Used in Multiple Places
**Problem**: Subtasks 28.2 through 28.9 are used for BOTH:
- AI assistant backend (Task 28) - Lines 1023-1087
- Logging system (Task 36) - Lines 1427-1472

**Conflict**:
- Task 28.2: AI rate limiting (Line 1023) vs. Message logging (Line 1427)
- Task 28.3: Member and role logging (Line 1432)
- Task 28.4: AI RAG system (Line 1033) vs. Channel logging (Line 1437)
- Task 28.5: AI context retrieval (Line 1040) vs. Command logging (Line 1442)
- Task 28.6: Token limit enforcement (Line 1046) vs. Log channel posting (Line 1447)
- Task 28.7: Log viewer API (Line 1453)
- Task 28.8: Thread memory (Line 1056) vs. Log channel validation (Line 1459)
- Task 28.9: AI data isolation (Line 1062) vs. Logging tests (Line 1469)

**Fix Required**: Renumber Task 36 subtasks from 28.x to 36.x

---

### Issue 2: Task 29 Subtasks Used in Multiple Places
**Problem**: Subtasks 29.2 through 29.8 are used for BOTH:
- AI dashboard UI (Task 29) - Lines 1106-1136
- Worker system (Task 37) - Lines 1481-1527

**Conflict**:
- Task 29.2: AI channel config (Line 1106) vs. Worker processors (Line 1481)
- Task 29.3: RAG manager (Line 1112) vs. Retry logic (Line 1489)
- Task 29.4: AI analytics (Line 1121) vs. Worker retry test (Line 1494)
- Task 29.5: AI settings (Line 1128) vs. Job timeout guards (Line 1499)
- Task 29.6: Worker job logging (Line 1505)
- Task 29.7: Concurrent job processing (Line 1511)
- Task 29.8: Worker tests (Line 1517)

**Fix Required**: Renumber Task 37 subtasks from 29.x to 37.x

---

### Issue 3: Task 30 Subtasks Used in Multiple Places
**Problem**: Subtasks 30.2 through 30.9 are used for BOTH:
- AI dashboard tests (implied continuation)
- Multi-tenant data isolation (Task 38) - Lines 1537-1583

**Conflict**:
- Task 30.2: Database query filtering (Line 1537)
- Task 30.3: Cross-guild access prevention (Line 1543)
- Task 30.4: Guild isolation test (Line 1549)
- Task 30.5: Shard-aware architecture (Line 1554)
- Task 30.6: Redis pub/sub (Line 1560)
- Task 30.7: Security event logging (Line 1566)
- Task 30.8: AI data isolation (Line 1572)
- Task 30.9: Data isolation tests (Line 1578)

**Fix Required**: Renumber Task 38 subtasks from 30.x to 38.x

---

### Issue 4: Task 32 Subtasks Used in Error Handling
**Problem**: Subtasks 32.2, 32.3, etc. are used in Task 40 (Error Handling) - Lines 1606-1650

**Conflict**:
- Task 32.2: Premium gating (Line 1232) vs. Redis failure test (Line 1606)
- Task 32.3: PostgreSQL failure handling (Line 1612)
- Task 32.4: Premium downgrade (Line 1242) vs. External API failures (Line 1618)
- Task 32.5: Premium limits (Line 1247) vs. Discord rate limits (Line 1623)
- Task 32.6: Premium features (Line 1252) vs. Circuit breakers (Line 1628)
- Task 32.7: Premium logging (Line 1261) vs. Critical alerts (Line 1633)
- Task 32.8: Premium tests (Line 1267) vs. Timeout guards (Line 1638)
- Task 32.9: Premium API (Line 1272) vs. Error handling tests (Line 1643)

**Fix Required**: Renumber Task 40 subtasks from 32.x to 40.x

---

### Issue 5: Task 33 Subtasks Used in Performance
**Problem**: Subtasks 33.2 through 33.8 are used in Task 41 (Performance) - Lines 1656-1695

**Conflict**:
- Task 33.2: OAuth flow (Line 1287) vs. Redis caching (Line 1656)
- Task 33.3: Guild selection (Line 1294) vs. XP batch updates (Line 1662)
- Task 33.4: Dashboard layout (Line 1301) vs. Redis TTL (Line 1667)
- Task 33.5: Feature toggles (Line 1308) vs. Non-blocking workers (Line 1673)
- Task 33.6: Premium filtering (Line 1315) vs. Performance monitoring (Line 1678)
- Task 33.7: Moderation page (Line 1322) vs. Concurrent test (Line 1684)
- Task 33.8: Logs viewer (Line 1330) vs. Response time test (Line 1689)

**Fix Required**: Renumber Task 41 subtasks from 33.x to 41.x

---

### Issue 6: Task 34 Subtasks Used in Security
**Problem**: Subtasks 34.2 through 34.5 are used in Task 42 (Security) - Lines 1701-1720

**Conflict**:
- Task 34.2: Ticket API (Line 1371) vs. Webhook validation (Line 1701)
- Task 34.3: Ticket dashboard (Line 1378) vs. HTTPS enforcement (Line 1706)
- Task 34.4: Ticket transcript (Line 1386) vs. Giveaway fraud (Line 1711)
- Task 34.5: Ticket config (Line 1393) vs. Security tests (Line 1716)

**Fix Required**: Renumber Task 42 subtasks from 34.x to 42.x

---

### Issue 7: Task 36 Subtasks Used in Testing
**Problem**: Subtasks 36.2 through 36.9 are used in Task 44 (Testing) - Lines 1738-1783

**Conflict**:
- Task 36.2: Mock data standards (Line 1738)
- Task 36.3: Happy path tests (Line 1743)
- Task 36.4: Permission denied tests (Line 1747)
- Task 36.5: Invalid input tests (Line 1752)
- Task 36.6: Rate limit tests (Line 1757)
- Task 36.7: Concurrency tests (Line 1762)
- Task 36.8: Duplicate execution tests (Line 1767)
- Task 36.9: Coverage verification (Line 1772)

**Fix Required**: Renumber Task 44 subtasks from 36.x to 44.x

---

### Issue 8: Task 37 Subtasks Used in Deployment
**Problem**: Subtasks 37.2 through 37.5 are used in Task 45 (Deployment) - Lines 1789-1813

**Conflict**:
- Task 37.2: Docker Compose (Line 1789)
- Task 37.3: Environment docs (Line 1795)
- Task 37.4: Migration scripts (Line 1800)
- Task 37.5: Deployment docs (Line 1805)

**Fix Required**: Renumber Task 45 subtasks from 37.x to 45.x

---

### Issue 9: Task 38 Subtasks Used in Documentation
**Problem**: Subtasks 38.2 through 38.5 are used in Task 46 (Documentation) - Lines 1819-1843

**Conflict**:
- Task 38.2: Bot command docs (Line 1819)
- Task 38.3: Architecture docs (Line 1824)
- Task 38.4: Troubleshooting guide (Line 1829)
- Task 38.5: User guide (Line 1834)

**Fix Required**: Renumber Task 46 subtasks from 38.x to 46.x

---

## Summary

**Total Issues**: 9 major numbering conflicts affecting 8 tasks

**Tasks Affected**:
- Task 36 (Logging) - using 28.x instead of 36.x
- Task 37 (Worker) - using 29.x instead of 37.x
- Task 38 (Data Isolation) - using 30.x instead of 38.x
- Task 40 (Error Handling) - using 32.x instead of 40.x
- Task 41 (Performance) - using 33.x instead of 41.x
- Task 42 (Security) - using 34.x instead of 42.x
- Task 44 (Testing) - using 36.x instead of 44.x
- Task 45 (Deployment) - using 37.x instead of 45.x
- Task 46 (Documentation) - using 38.x instead of 46.x

**Impact**: High - This will cause confusion during implementation and tracking

**Priority**: Critical - Must be fixed before implementation begins
