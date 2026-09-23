# Login + User List — Microservices Demo (with frontend)

A focused example: three backend services plus a real browser UI, built to show
exactly how services talk to each other and how a login token is used across
service boundaries.

## Architecture

```
 Browser (frontend, :8080)
        │  fetch()
        ▼
 API gateway (:5000)
        │
   ┌────┴─────┐
   ▼          ▼
auth-service  user-service
  (:5001)       (:5002)
   │  (creates profile on register)
   └────────────▶
```

- **auth-service** — owns credentials only (hashed passwords). Handles `/register` and `/login`, issues a JWT on successful login.
- **user-service** — owns public profile data only (never sees a password). Exposes `GET /users`, protected by a JWT check.
- **api-gateway** — the only thing the browser ever talks to. Routes `/api/auth/*` → auth-service, `/api/users` → user-service.
- **frontend** — plain HTML/CSS/JS (no framework, no build step) served by nginx: a login page, register page, and a dashboard listing users.
