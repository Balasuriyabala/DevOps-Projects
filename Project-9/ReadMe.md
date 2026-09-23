# Microservices Demo — DevOps Practice Project

A small but "real" microservices app for practicing containerization and Kubernetes deployment.

## Architecture

```
        ┌──────────────┐
        │  api-gateway │  (port 4000, public entrypoint)
        └──────┬───────┘
     ┌──────────┼──────────┐
     ▼          ▼          ▼
┌─────────┐┌────────────┐┌──────────────┐
│  user   ││  product   ││    order     │
│ service ││  service   ││   service    │
│ :4001   ││   :4002    ││    :4003     │
└─────────┘└────────────┘└──────┬───────┘
                                  │ calls user-service + product-service
                                  ▼
                        (fans out over HTTP)
```

- **user-service** — in-memory list of users (`GET/POST /users`)
- **product-service** — in-memory list of products with stock (`GET /products`, `POST /products/:id/reserve`)
- **order-service** — creates an order by calling user-service (verify user) and product-service (reserve stock) — this is the interesting "distributed call" part to practice with
- **api-gateway** — single entrypoint, proxies `/api/users`, `/api/products`, `/api/orders` to the right service

Each service exposes `GET /health` for liveness/readiness checks.

## Part 1 — Run locally with Docker Compose

```bash
cd microservices-demo
docker compose up --build
```

Then try:
```bash
curl http://localhost:4000/api/users
curl http://localhost:4000/api/products
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "productId": 2, "quantity": 3}'
```

Stop with `docker compose down`.

## Part 2 — Deploy to Kubernetes (kind or minikube)

1. **Create a local cluster** (pick one):
   ```bash
   kind create cluster --name microdemo
   # or
   minikube start
   ```

2. **Build the images:**
   ```bash
   docker build -t api-gateway:latest ./api-gateway
   docker build -t user-service:latest ./user-service
   docker build -t product-service:latest ./product-service
   docker build -t order-service:latest ./order-service
   ```

3. **Load images into the cluster** (skips needing a registry):
   ```bash
   # kind:
   kind load docker-image api-gateway:latest user-service:latest product-service:latest order-service:latest --name microdemo

   # minikube:
   minikube image load api-gateway:latest
   minikube image load user-service:latest
   minikube image load product-service:latest
   minikube image load order-service:latest
   ```

4. **Apply the manifests:**
   ```bash
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/user-service.yaml
   kubectl apply -f k8s/product-service.yaml
   kubectl apply -f k8s/order-service.yaml
   kubectl apply -f k8s/api-gateway.yaml
   ```

5. **Check status:**
   ```bash
   kubectl get pods -n microdemo
   kubectl get svc -n microdemo
   ```

6. **Reach the gateway:**
   ```bash
   kubectl port-forward -n microdemo svc/api-gateway 4000:4000
   curl http://localhost:4000/api/products
   ```

7. **(Optional) Ingress**, if you have an ingress controller (e.g. `ingress-nginx`) installed:
   ```bash
   kubectl apply -f k8s/ingress.yaml
   echo "127.0.0.1 microdemo.local" | sudo tee -a /etc/hosts
   curl http://microdemo.local/api/products
   ```

## Practice exercises, roughly in order of difficulty

1. **Scaling** — `kubectl scale deployment user-service -n microdemo --replicas=4`, watch pods come up.
2. **Rolling update** — change a response string in `user-service/server.js`, rebuild, reload the image, `kubectl rollout restart deployment/user-service -n microdemo`, then `kubectl rollout status` and `kubectl rollout undo`.
3. **Break a probe on purpose** — make `/health` return 500 temporarily and watch Kubernetes mark the pod unready / restart it.
4. **Secrets** — move nothing sensitive here yet, but add a `k8s/secret.yaml` (e.g. a fake API key) and mount it as an env var into order-service.
5. **Resource limits** — lower `order-service`'s memory limit until it gets OOMKilled, then fix it. Good for learning `kubectl describe pod`.
6. **Horizontal Pod Autoscaler** — add an HPA for `api-gateway` based on CPU and load-test it (e.g. with `hey` or `ab`).
7. **Add a real database** — swap product-service's in-memory array for Postgres, add a `StatefulSet` or use a managed DB, and a `PersistentVolumeClaim`.
8. **Observability** — add a `/metrics` endpoint (prom-client) to one service and scrape it with Prometheus; view in Grafana.
9. **CI/CD** — write a GitHub Actions workflow that builds each image and pushes to a registry on push to `main`.
10. **Helm** — convert the `k8s/` manifests into a Helm chart with `values.yaml` for replica counts and image tags.

## Notes
- Data is in-memory in every service — restarting a pod resets it. That's intentional, so you can focus on deployment mechanics instead of managing state.
- All ports are configurable via the `PORT` env var if you need to avoid clashes locally.
