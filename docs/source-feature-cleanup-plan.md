# Source-Indexing Feature — Pre-Commit Cleanup Plan

**Status:** Planned (no changes applied yet)
**Date:** 2026-07-20
**Scope:** Uncommitted changes in all three projects — Backlogr (Angular), backlogr-API (Quarkus), Code-themed (FastAPI)

## Background

Review of the uncommitted source-indexing work found the feature coherent and well-tested
end to end, with a handful of safe cleanups worth landing before commit: duplicated
polling/label logic in the new frontend UI, bespoke buttons that bypass the shared UI kit,
and logging/lambda readability nits in the Python worker. All items below are
behavior-preserving. The V16 failure-columns migration is already done.

## A. Frontend (Backlogr) — highest volume of wins

1. **Shared source label helpers.** Move `statusLabel`, `sourceTypeLabel`, and
   `shortRevision` out of `sources-page.ts` and `source-context-bar.ts` (byte-identical
   copies) into `models/source.model.ts` as pure functions. Replace the regex-capitalize
   in `sourceTypeLabel` with an explicit `charAt(0).toUpperCase() + slice(1)`.
2. **Shared polling helper.** The stop → check-for-PROFILING → `timer(2000, 2000)` →
   stop-when-settled pattern exists three times (sources page once, context bar twice).
   Extract a small `SourcePoller` (modeled on `AiStreamController`: constructor takes the
   fetch function and `DestroyRef`) or a `pollSources()` helper; name the interval
   `SOURCE_POLL_INTERVAL_MS`. Introduce a named `hasIndexingSources` boolean where the
   `.some(status === 'PROFILING')` check is used.
3. **Adopt the shared kit in the new UI.** Replace the 9 raw `<button>`s in
   `sources-page.html` and `source-context-bar.html` with `app-button`, and the URL inputs
   with `app-text-field`; delete the corresponding bespoke button/input CSS from both
   component stylesheets (largest CSS reduction in this plan).
4. **Stale-response guard.** Extract the repeated
   `workspaceId !== this.workspaceId() || ticketKey !== this.ticketKey()` check in the
   context bar into a private `isStale(workspaceId, ticketKey)` method.
5. **`SourceService` split.** Move the five source endpoints (+ ticket-context calls) out
   of `workspace.service.ts` into a new `services/source.service.ts`; update the two new
   components and the spec. Cheap now, expensive after commit.

## B. Python (Code-themed)

6. **Job log helper.** Replace the six repetitive `logger.info(...)` calls in
   `SourceIndexCore.queue()/run()` with a small helper that closes over the request
   (e.g. `log = self._job_logger(request)` then `log("started", revision=...)`),
   keeping the same structured key=value output.
7. **Named function instead of assigned lambda.** `file_cache_key = lambda path: ...`
   (line ~114) becomes a `def` or a private method returning the callable (PEP 8).
8. **Failure-code mapping as data.** In `_classify_failure`, replace the stage if/elif
   chain with a module-level `STAGE_TO_FAILURE_CODE` dict lookup with an
   `INDEXING_FAILED` default. Keep the two exception-type checks (Gemini auth, Redis)
   as guards above it.
9. **Repo hygiene.** Add `chroma_db/` and `notebooks/app.db` to `.gitignore`; they are
   currently staged as modified/untracked binary data (78 MB).

## C. Backend (backlogr-API)

10. **Cross-contract comment.** Add a one-line comment on `CodeIntelligenceContracts.IndexFailure`
    (and the Python `IndexFailure` model, and the TS `SourceIndexFailure` interface)
    noting the shape exists in all three projects and must change together.
11. *(Already done)* V16 migration for the `index_failure_*` columns.

## Order of work

1. Frontend helpers first (1, 2, 4) — pure extractions, immediately testable with the
   existing specs.
2. Frontend kit adoption (3), then the service split (5).
3. Python items (6–9) — independent of the frontend work.
4. Contract comments (10) last, once shapes are final.

## Explicitly out of scope (not safe / not now)

Async indexing on the backend (blocking HTTP inside `@Transactional`), read-side
`refreshIndexStatus` side effects, `reindexSource` connection-owner fallback, and any
change to the wire contracts themselves.
