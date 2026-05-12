# Backlogr — Backend API Contract

All endpoints are prefixed with `/api/v1`. JSON request/response bodies. Auth via Bearer token in `Authorization` header.

---

## Tickets

### `GET /api/v1/tickets/:key`

Fetch a single ticket by its key (e.g. `PAY-4827`).

**Response `200`**
```json
{
  "key": "PAY-4827",
  "project": "Payments",
  "title": "Checkout fails silently when applying expired promo code — order completes at full price",
  "priority": "P1",
  "status": "In Progress",
  "assignee": {
    "id": "user_mt",
    "name": "Marcus Tang",
    "avatarInitials": "MT",
    "avatarColor": "teal"
  },
  "reporter": {
    "id": "user_pr",
    "name": "Priya Ramachandran",
    "avatarInitials": "PR",
    "avatarColor": "purple"
  },
  "sprint": "Sprint 47 · May 4–18",
  "affects": "2.41.0 · prod",
  "labels": ["regression", "silent-failure", "promo-engine", "p1-customer"],
  "description": "<html string with code/strong/ul/li tags>",
  "stackTrace": "<html string with span.err / span.mut / span.hl highlights>",
  "comments": [
    {
      "id": "cmt_001",
      "author": "Marcus Tang",
      "avatarInitials": "MT",
      "avatarColor": "teal",
      "createdAt": "2026-05-11T10:00:00Z",
      "body": "<html string>"
    }
  ],
  "createdAt": "2026-05-08T09:00:00Z",
  "updatedAt": "2026-05-11T11:30:00Z"
}
```

**Errors:** `404` ticket not found · `401` unauthorized

---

### `POST /api/v1/tickets/import`

Import a ticket from an external tracker URL.

**Request**
```json
{ "url": "https://acme.atlassian.net/browse/PAY-4827" }
```

**Response `200`** — same shape as `GET /tickets/:key`

**Response `422`**
```json
{ "error": "UNSUPPORTED_TRACKER", "message": "Only Jira, Linear, GitHub Issues, and ServiceNow are supported." }
```

**Errors:** `400` missing/invalid URL · `422` unrecognized tracker · `503` upstream unavailable

---

### `GET /api/v1/workspace/tickets`

Search tickets in the connected workspace.

**Query params**
- `q` — search query (optional)
- `project` — filter by project key (optional)
- `limit` — max results (default `20`, max `100`)
- `cursor` — pagination cursor (optional)

**Response `200`**
```json
{
  "items": [
    {
      "key": "PAY-4827",
      "title": "Checkout fails silently when applying expired promo code",
      "project": "Payments",
      "status": "In Progress",
      "priority": "P1"
    }
  ],
  "nextCursor": "cursor_abc123",
  "total": 142
}
```

---

## Insights

### `GET /api/v1/insights/:ticketKey`

Get AI-generated insights for a ticket. Streams via SSE or returns a completed snapshot.

**Query params**
- `stream` — `true` to receive Server-Sent Events (default `false`)

**Response `200` (non-streaming)**
```json
{
  "ticketKey": "PAY-4827",
  "tldr": "A silent error-swallow in checkout lets expired promo codes pass validation, charging customers full price without any UI feedback.",
  "bullets": [
    { "html": "Root cause: <code>checkout.ts:412</code> catch block returns <code>ok:true</code> for any gateway exception, including expiration errors." },
    { "html": "Introduced by <code>promo-engine@3.2.0</code> (May 4) — contract changed from \"returns null\" to \"throws typed errors\"; consumer was not updated." },
    { "html": "47 customer reports in 4 days, refund volume up 4.2× WoW, 12 chargebacks initiated." },
    { "html": "Fix is narrow (4 lines) but exposes a class of contract-test gaps across the checkout/promo boundary." }
  ],
  "model": "haiku",
  "latencyMs": 1200,
  "contextTokens": 12400,
  "generatedAt": "2026-05-11T12:00:00Z"
}
```

**SSE stream events (when `stream=true`)**
```
event: chunk
data: {"delta": "A silent error"}

event: chunk
data: {"delta": "-swallow in checkout"}

event: done
data: {"bullets": [...], "model": "haiku", "latencyMs": 1200}
```

**Errors:** `404` ticket not found · `429` rate limited

---

## Workspaces

### `GET /api/v1/workspaces`

List connected workspaces for the authenticated user.

**Response `200`**
```json
{
  "workspaces": [
    {
      "id": "ws_atlassian_acme",
      "provider": "jira",
      "displayName": "acme.atlassian.net",
      "projectCount": 8,
      "ticketCount": 12481,
      "connected": true,
      "lastSyncedAt": "2026-05-11T11:56:00Z"
    },
    {
      "id": "ws_linear_acme",
      "provider": "linear",
      "displayName": "linear.app/acme",
      "connected": false
    }
  ]
}
```

### `POST /api/v1/workspaces/:id/connect`

Initiate OAuth connection for a workspace.

**Response `200`**
```json
{ "oauthUrl": "https://auth.atlassian.com/authorize?..." }
```

### `DELETE /api/v1/workspaces/:id`

Disconnect a workspace.

**Response `204`** No content

---

## Notes

- All timestamps are ISO 8601 UTC.
- Rich text fields (`description`, `stackTrace`, `body`) are sanitized HTML strings. Only `<p>`, `<strong>`, `<em>`, `<code>`, `<pre>`, `<ul>`, `<ol>`, `<li>`, `<span>` with class attributes are allowed.
- The API is **read-only** with respect to external trackers — we never write back.
- Mock implementation: all endpoints are implemented as in-memory services returning static data with a simulated `~200ms` delay.
