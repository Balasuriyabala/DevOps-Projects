# Login + User List — Microservices Demo (with frontend)

A focused example: three backend services plus a real browser UI, built to show
exactly how services talk to each other and how a login token is used across
service boundaries.

## Architecture

```
 Browser (frontend, :7000)
        │  fetch()
        ▼
 API gateway (:5000)
        │
   ┌────┴─────┐
   ▼          ▼
auth-service  user-service
  (:6001)       (:6002)
   │  (creates profile on register)
   └────────────▶
```

- **auth-service** — owns credentials only (hashed passwords). Handles `/register` and `/login`, issues a JWT on successful login.
- **user-service** — owns public profile data only (never sees a password). Exposes `GET /users`, protected by a JWT check.
- **api-gateway** — the only thing the browser ever talks to. Routes `/api/auth/*` → auth-service, `/api/users` → user-service.
- **frontend** — plain HTML/CSS/JS (no framework, no build step) served by nginx: a login page, register page, and a dashboard listing users.

## The two communication patterns to notice

1. **Register → service-to-service call.** When you register, `auth-service` calls `user-service` directly (`POST /internal/users`) to create a profile — this is a backend-to-backend call the browser never sees. If that call fails, auth-service rolls back the credential so the two services don't drift out of sync. Look at `auth-service/server.js`.

2. **Login → stateless JWT, verified independently.** `auth-service` signs a JWT with `JWT_SECRET`. Later, when the browser calls `GET /api/users` with `Authorization: Bearer <token>`, `user-service` verifies that token **itself**, using the same `JWT_SECRET` — it never calls auth-service to check if the token is valid. This is the core idea behind stateless auth: any service holding the shared secret can verify a token with zero network calls. Look at `requireAuth` in `user-service/server.js`.

Try this to see it fail on purpose: change `JWT_SECRET` for just one service in `docker-compose.yml` and restart. Login will still succeed, but `GET /users` will return `401 Invalid or expired token` — because the two services no longer agree on the secret. That single mismatch is a very common real-world microservices bug.

## Run it

```bash
cd login-microservices-demo
docker compose up --build
```

Then open **http://localhost:7000** in a browser (or `http://<your-machine's-IP>:7000` from another device on the LAN — the frontend now reads its API host from `window.location.hostname` instead of a hardcoded `localhost`, so both work):
1. Register a new account.
2. Log in — a JWT is stored in `localStorage`.
3. You land on the dashboard, which calls `GET /api/users` with that token and lists everyone who's registered.

You can also drive it with curl, exactly like the frontend does:
```bash
curl -X POST localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"username":"alice","password":"hunter2"}'

TOKEN=$(curl -s -X POST localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"username":"alice","password":"hunter2"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

curl localhost:5000/api/users -H "Authorization: Bearer $TOKEN"
```

## Practice ideas, once this feels familiar
1. Open the browser's Network tab while logging in and watch the request/response for `/api/auth/login`, then `/api/users` — see the `Authorization` header attach itself.
2. Add a "delete my account" button that calls a new `DELETE /users/:id` on user-service, and also removes the credential from auth-service (another service-to-service call).
3. Add password strength/length validation on the frontend, then again on the backend — notice the frontend check is just UX, the backend check is the real security boundary.
4. Shorten the JWT's `expiresIn` to `30s`, stay logged in, and watch the dashboard's next request start failing with 401 — that's what "expired token" looks like in practice.
5. Once this all makes sense, we can containerize and deploy this same app to Kubernetes (Deployments, Services, and a Secret for `JWT_SECRET` instead of a plain env var) — just say the word.
