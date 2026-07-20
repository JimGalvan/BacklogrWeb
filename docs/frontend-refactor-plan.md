# Frontend Refactor Plan — Component Reuse & De-duplication

**Status:** Planned (no code changes yet)
**Date:** 2026-07-19
**Scope:** `Backlogr` (Angular 21 frontend)

## Background

An audit found the app is architecturally sound (standalone components, signals, strict TS, functional interceptor) but the shared UI kit in `src/app/components/ui/common` is barely adopted: most shared components have exactly one consumer, and the two largest pages (`workspaces`, `onboarding`) hand-roll modals, toasts, buttons, and inputs that already exist or should be primitives. Cross-cutting code (error mapping, API base URL, avatar helpers) is copy-pasted across pages and services. CSS totals ~3,900 lines largely because each page re-implements the design system locally.

This plan also feeds the upcoming onboarding rework (de-GitHub-ing copy + the new "Import tickets" multi-select step), which should be built on the shared kit rather than adding more bespoke markup.

## A. Adopt the existing UI kit

1. **Workspaces page → modal-shell.** Replace its three hand-rolled modals (create workspace, invite member, confirm remove) with `app-modal-shell`; confirm-remove becomes `app-confirm-dialog`.
2. **Workspaces page → shared toast.** Delete the local `Toast` interface and markup; use `ui/common/toast` (already proven on the workspace-tickets page).
3. **Onboarding page → shared kit.** Rebuild the error banner, loading state, and the upcoming import-step list from `app-empty-state`, toast, and the new primitives below. No new bespoke markup for the Import-tickets rework.
4. **Spread single-use components.** `app-status-chip`, `app-tag`, `app-confirm-dialog` each have one consumer today; as pages migrate, apply them wherever the pattern appears (connection status, source status, permission chips).

## B. New shared primitives (extract, don't invent)

5. **`app-button`** — variants: primary / secondary / text, with loading state. Extracted from styles currently duplicated across workspaces, onboarding, and auth pages; replace raw `<button>`s page by page.
6. **`app-text-field`** — generalize `app-auth-field` out of its auth branding so the workspaces search/invite inputs and the onboarding source-URL input can use it.
7. **Avatar helpers → shared.** Move `initialsOf`, `glyphOf`, `avOf` out of `workspaces-page.ts` into `core/utils` (or a small `app-avatar` component, since the CSS is duplicated too).

## C. Kill duplicated cross-cutting code

8. **Shared API base URL.** One injectable token/helper for `${apiBaseUrl}/api/${version}` instead of the `BASE` constant rebuilt in five services.
9. **Shared error mapping.** A single `errorMessage(err)` helper (or an HTTP error interceptor) replacing the three copy-pasted versions; standardizes the `err.error.message` extraction and the "Something went wrong" fallback.
10. **Toast service.** Signal-based service driving the shared toast component so pages stop managing toast state locally (pairs with item 2).
11. **Subscription hygiene while touching pages.** Replace the nested `currentUser → getUserWorkspaces` subscribes in `workspaces-page` with `switchMap`; add `takeUntilDestroyed` to each page as it is migrated.

## D. CSS consolidation (falls out of A + B)

12. Move modal, button, input, toast, and chip styles into the shared components / `styles.css`; delete the duplicated blocks from `workspaces-page.css` (831 lines) and `onboarding-page.css` (548 lines) as each migration lands.

## Order of work

1. Primitives and shared services first: items 5, 6, 8, 9, 10.
2. Migrate the workspaces page: items 1, 2, 7, 11, 12.
3. Migrate the onboarding page (item 3) together with the Import-tickets rework, so the redesign is built on the kit once rather than retrofitted.
4. Sweep remaining pages: item 4.

## Related findings (separate track, from the same audit)

Not part of this refactor but worth scheduling: add ESLint (`angular-eslint`) — no lint config exists; add tests around `auth.interceptor` (401 → refresh → retry) and guards — only 2 spec files exist for 74 source files; lazy-load routes via `loadComponent`; replace deprecated `toPromise()` in `app.config.ts` with `firstValueFrom`; guard the unvalidated `JSON.parse(localStorage…)` in `integration.service.ts`; remove the commented-out production URL from `environment.ts`.
