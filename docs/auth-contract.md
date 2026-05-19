# Auth & User — API Contract

Covers registration, login, token refresh, logout, and the current-user profile.
All endpoints share the base URL defined in `environment.apiBaseUrl`.

---

## `POST /api/v1/users` — Register

Create a new user account.

### Request

| Header         | Value            |
|----------------|------------------|
| `Content-Type` | `application/json` |

**Body**

```json
{
  "email": "jane@example.com",
  "password": "supersecret"
}
```

| Field      | Required | Constraints                  |
|------------|----------|------------------------------|
| `email`    | Yes      | Valid email format           |
| `password` | Yes      | Minimum 8 characters         |

### Response `201 Created`

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "jane@example.com",
  "createdAt": "2026-05-19T02:00:00Z",
  "lastModifiedAt": "2026-05-19T02:00:00Z"
}
```

### Error responses

**409 Conflict** — email already registered

```json
{ "status": 409, "message": "A user with that email already exists." }
```

**422 Unprocessable Entity** — validation failure

```json
{ "status": 422, "message": "password: size must be between 8 and 2147483647" }
```

---

## `POST /api/v1/auth/login` — Login

Authenticate with email and password. Returns a short-lived JWT (1 hour) and a
long-lived refresh token (30 days). Store both on the client — the JWT goes in
`Authorization` headers, the refresh token is used only to obtain a new JWT.

### Request

| Header         | Value              |
|----------------|--------------------|
| `Content-Type` | `application/json` |

**Body**

```json
{
  "email": "jane@example.com",
  "password": "supersecret"
}
```

### Response `200 OK`

```json
{
  "token": "<JWT>",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Field          | Description                                                  |
|----------------|--------------------------------------------------------------|
| `token`        | Signed JWT. Include as `Authorization: Bearer <token>` on every authenticated request. Expires in **1 hour**. |
| `refreshToken` | Opaque token. Store securely (e.g. `localStorage` or `sessionStorage`). Use with `POST /auth/refresh` before the JWT expires. Expires in **30 days**. Rotates on every use. |

### Error responses

**401 Unauthorized** — wrong email or password

```json
{ "status": 401, "message": "Invalid email or password." }
```

**422 Unprocessable Entity** — blank fields

```json
{ "status": 422, "message": "email: must not be blank" }
```

---

## `POST /api/v1/auth/refresh` — Refresh JWT

Exchange a valid refresh token for a new JWT and a rotated refresh token.
Call this when the JWT has expired (or just before) to keep the user logged in
without asking for credentials again.

> **Rotation:** every successful refresh invalidates the old refresh token and
> issues a new one. Save the new `refreshToken` from the response.

### Request

| Header         | Value              |
|----------------|--------------------|
| `Content-Type` | `application/json` |

**Body**

```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Response `200 OK`

Same shape as login:

```json
{
  "token": "<new JWT>",
  "refreshToken": "<new refresh token>"
}
```

### Error responses

**401 Unauthorized** — token not found, already used, or expired

```json
{ "status": 401, "message": "Invalid or expired refresh token." }
```

---

## `POST /api/v1/auth/logout` — Logout

Invalidates the current refresh token server-side. After this call, any stored
refresh token becomes unusable. The JWT itself remains valid until it naturally
expires (up to 1 hour) — discard it on the client immediately.

### Request

| Header          | Value                  |
|-----------------|------------------------|
| `Authorization` | `Bearer <JWT>`         |

No body.

### Response `204 No Content`

Empty body.

### Error responses

**401 Unauthorized** — missing or invalid JWT

---

## `GET /api/v1/users/me` — Current user

Returns the authenticated user's profile. Use this on app startup (after login
or a successful refresh) to populate user state in the frontend.

### Request

| Header          | Value          |
|-----------------|----------------|
| `Authorization` | `Bearer <JWT>` |

### Response `200 OK`

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "jane@example.com",
  "createdAt": "2026-05-19T02:00:00Z",
  "lastModifiedAt": "2026-05-19T02:00:00Z"
}
```

### Error responses

**401 Unauthorized** — missing or invalid JWT

---

## Auth flow overview

```
Register ──► Login ──► store { token, refreshToken }
                │
                ▼
         API calls with Authorization: Bearer <token>
                │
         token expires (1h)
                │
                ▼
         POST /auth/refresh ──► store new { token, refreshToken }
                │
         refresh token expired (30d) or logout called
                │
                ▼
         redirect to login
```

## Frontend implementation notes

**Storing tokens**

| Token          | Recommended storage | Why |
|----------------|---------------------|-----|
| `token` (JWT)  | Memory / JS variable | Short-lived; no need to persist across tabs |
| `refreshToken` | `localStorage`      | Must survive page reloads |

**Interceptor pattern (Angular example)**

```typescript
// auth.interceptor.ts
intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
  const token = this.authService.getToken();
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next.handle(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        return this.authService.refresh().pipe(
          switchMap(() => next.handle(req.clone({
            setHeaders: { Authorization: `Bearer ${this.authService.getToken()}` }
          })))
        );
      }
      return throwError(() => err);
    })
  );
}
```
