# Backlogr Frontend

Angular single-page app for Backlogr. It handles sign-in, provider connections,
workspaces, Sources, imported tickets, and the ticket insights used to refine work before
implementation: Summary, Refinement Findings, and Relevant Files.

## How it fits together

```
This app, Angular (:4200)
        │  REST + SSE
Backlogr backend, Quarkus (:8080)
        │
Code intelligence service, FastAPI (:8000)
```

The frontend only ever talks to the backend. Start the backend first — without it, the
app loads but sign-in and every data call fail.

## Required accounts

None. All credentials live in the backend; sign-in goes through the GitHub App that the
backend configures.

## Prerequisites

- Node.js 20 or newer (Node 22 recommended)
- A running Backlogr backend (see its README)

## Configuration

There are no environment variables. The API location is compiled in from
`src/environments/`:

| File | Used by | `apiBaseUrl` |
|---|---|---|
| `environment.ts` | `npm start` (development) | `http://localhost:8080` |
| `environment.prod.ts` | `npm run build` (production) | your deployed backend URL |

The production build swaps the first file for the second automatically. To point the app
at a different backend, edit the matching file — for a deployed build, update
`apiBaseUrl` in `environment.prod.ts` before building.

## Run it

```powershell
npm install
npm start
```

The app is then on http://localhost:4200 and reloads on save.

## Smoke test

1. Open http://localhost:4200 — the sign-in screen loads.
2. Sign in with GitHub. You are redirected back to the app with a workspace.
3. Open a ticket, select **Refinement Findings**, and press **Run**.

Expected output: Backlogr returns up to five atomic findings ordered by likely
implementation impact. Each finding identifies a specific problem, its supporting
evidence, the decision the team still needs to make, a suggested clarification, and a
verification rule. If an indexed Source is selected as ticket context, code-grounded
findings reference validated files that can be inspected under **Relevant Files**.

If insights fail while the rest of the app works, the backend is reachable but its AI
provider is not — check `OPENAI_API_KEY` on the backend.

## Build for production

```powershell
npm run build
```

Output goes to `dist/Backlogr/browser/`, ready for any static host.

## Running the tests

```powershell
npm test
```

## Deploying to Railway

1. Set `apiBaseUrl` in `src/environments/environment.prod.ts` to your deployed backend
   URL and commit it — it is baked in at build time, not read at runtime.
2. New service → deploy from this repository. Railway builds the included `Dockerfile`
   and serves the Angular build with nginx on container port `80`. Generate the public
   domain with target port `80`.
3. On the **backend**, set `FRONTEND_URL` to this app's Railway URL so OAuth redirects
   land back here, and set `CORS_ORIGINS` to the same URL so the browser is allowed to
   call the API.
4. Update the GitHub App's callback URL to point at the deployed backend.

## Notes

`proxy.conf.json` forwards `/api` to the backend during `npm start`. It only takes effect
if `apiBaseUrl` is changed to a relative path; with the default absolute URL, requests go
straight to the backend and the proxy is bypassed.
