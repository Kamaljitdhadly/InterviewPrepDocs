# Interview Comparisons

## Questions Covered

1. Angular vs React — when to choose which?
2. Redux vs NgRx vs Context vs Zustand
3. REST vs GraphQL vs gRPC
4. Monolith vs Microservices
5. SQL vs NoSQL databases
6. Docker vs Kubernetes — roles and relationship
7. SSR vs CSR vs SSG (web rendering)
8. OAuth 2.0 vs OpenID Connect vs SAML
9. TCP vs UDP
10. Horizontal vs Vertical scaling
11. Synchronous vs Asynchronous communication in distributed systems
12. CI vs CD — what each does

## Angular vs React — when to choose which?

Both are component-based; Angular is a full framework, React is a UI library with a large ecosystem.

| Dimension | Angular | React |
|-----------|---------|-------|
| **Scope** | Routing, HTTP, forms, DI built in | Ecosystem fills gaps (Next.js, React Router) |
| **Language** | TypeScript-first, enforced | JS/TS; TypeScript common but optional |
| **State** | Services + RxJS; NgRx for Redux-style | Hooks, Context, Redux, Zustand |
| **Change detection** | Zone.js or Signals | Virtual DOM reconciliation |
| **Team fit** | Conventions reduce decision fatigue | Flexibility; large hiring pool |
| **Mobile** | Ionic, NativeScript | React Native |

**Choose Angular** for long-lived enterprise apps, strict architecture, and teams strong in TypeScript/RxJS.
**Choose React** for flexible stacks, fast iteration, React Native, or incremental adoption.

```tsx
// React — functional component + hooks (minimal setup)
function UserList({ users }: { users: User[] }) {
  const [filter, setFilter] = useState('');
  const visible = users.filter((u) => u.name.includes(filter));
  return (
  <>
    <input value={filter} onChange={(e) => setFilter(e.target.value)} />
    <ul>{visible.map((u) => <li key={u.id}>{u.name}</li>)}</ul>
  </>
  );
}
```

```typescript
// Angular — component + service + async pipe
@Component({
  selector: 'app-user-list',
  template: `
    <input [value]="filter()" (input)="filter.set($any($event.target).value)" />
    <ul><li *ngFor="let u of filteredUsers()">{{ u.name }}</li></ul>
  `,
})
export class UserListComponent {
  users = input.required<User[]>();
  filter = signal('');
  filteredUsers = computed(() =>
    this.users().filter((u) => u.name.includes(this.filter()))
  );
}
```

Match team skills and framework opinion — neither is universally better.

## Redux vs NgRx vs Context vs Zustand

| Tool | Platform | Pattern | Best for |
|------|----------|---------|----------|
| **Redux** | React (RTK) | Store, actions, reducers | Complex client state, middleware, DevTools |
| **NgRx** | Angular | Redux + Effects, Entity | Predictable global state in Angular |
| **Context** | React | Provider + `useContext` | Theme, locale, auth shell — rare updates |
| **Zustand** | React | Hook-based store | Medium global state, minimal boilerplate |

| Concern | Redux / NgRx | Context | Zustand |
|---------|--------------|---------|---------|
| Boilerplate | High (RTK mitigates) | Low | Very low |
| Re-render control | Selectors / memoization | All consumers on any change | Per-selector subscriptions |
| Async | Thunks (RTK), Effects (NgRx) | Manual in provider | Plain async in store |

```tsx
// React Context — fine for infrequently changing values
const ThemeContext = createContext<'light' | 'dark'>('light');
function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  return (
    <ThemeContext.Provider value={theme}>
      <Toolbar onToggle={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))} />
    </ThemeContext.Provider>
  );
}
```

```js
// Zustand — colocated state + actions, no provider
import { create } from 'zustand';
const useCart = create((set) => ({
  items: [],
  add: (item) => set((s) => ({ items: [...s.items, item] })),
}));
```

```typescript
// NgRx — action → reducer → selector (Angular)
export const addItem = createAction('[Cart] Add', props<{ item: Item }>());
export const cartReducer = createReducer(
  initialState,
  on(addItem, (state, { item }) => ({ ...state, items: [...state.items, item] }))
);
```

**Rule of thumb:** Context for config; Zustand for simple global UI; Redux/NgRx when many features share normalized data or need audit-friendly flows.

## REST vs GraphQL vs gRPC

| Aspect | REST | GraphQL | gRPC |
|--------|------|---------|------|
| **Protocol** | HTTP + JSON | HTTP + JSON | HTTP/2 + Protobuf |
| **Contract** | OpenAPI (informal) | SDL schema | `.proto` files |
| **Fetching** | Fixed endpoints; over/under-fetch | Client specifies fields | Strongly typed RPC methods |
| **Caching** | HTTP cache friendly | Client/cache layer needed | Limited HTTP caching |
| **Browser** | Native | Native | grpc-web proxy |
| **Best fit** | Public CRUD APIs | Varied client data needs | Internal service-to-service |

```http
GET /api/users/42/orders?status=open HTTP/1.1
```

```graphql
query {
  user(id: 42) {
    name
    orders(status: OPEN) { id total }
  }
}
```

```protobuf
service OrderService {
  rpc GetOrders(GetOrdersRequest) returns (OrderList);
}
```

REST for compatibility; GraphQL for flexible shapes; gRPC for low-latency internals.

## Monolith vs Microservices

| Dimension | Monolith | Microservices |
|-----------|----------|---------------|
| **Deployment** | Single unit | Independent services |
| **Scaling** | Scale entire app | Scale hot services only |
| **Data** | Often one database | Database per service (ideal) |
| **Fault isolation** | Failure can affect all | Smaller blast radius |
| **Ops complexity** | Lower | Discovery, tracing, gateways |
| **Transactions** | In-process ACID | Sagas, eventual consistency |

**Monolith:** early product, small team, unclear domain boundaries.
**Microservices:** distinct subdomains, independent release cadence, platform investment.

```
Monolith:  [ Web + API + Jobs ] ──► DB

Microservices:
  [ API Gateway ] ──► [ Orders svc ] ──► Orders DB
                  ├──► [ Catalog svc ] ──► Catalog DB
                  └──► [ Payments svc ] ──► Payments DB
```

## SQL vs NoSQL databases

| Aspect | SQL (PostgreSQL, SQL Server) | NoSQL (MongoDB, DynamoDB) |
|--------|------------------------------|---------------------------|
| **Model** | Tables, rows, fixed schema | Document, key-value, column, graph |
| **Queries** | JOINs, aggregations, SQL | Denormalized access paths |
| **Transactions** | ACID (strong default) | Eventual consistency common |
| **Scaling** | Vertical + replicas | Horizontal partition built-in |
| **Use cases** | Financial, reporting, relations | High writes, flexible docs, caching |

```sql
SELECT o.id, c.name, SUM(oi.qty * oi.price) AS total
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'PAID'
GROUP BY o.id, c.name;
```

```javascript
// MongoDB — embedded document avoids JOIN
db.orders.findOne(
  { _id: orderId, status: 'PAID' },
  { customer: 1, items: 1, 'items.qty': 1, 'items.price': 1 }
);
```

Default to SQL for integrity/relations; NoSQL for simple access patterns at massive scale.

## Docker vs Kubernetes — roles and relationship

| Role | Docker | Kubernetes |
|------|--------|------------|
| **Primary job** | Build, ship, run containers | Schedule, scale, heal workloads |
| **Unit** | Image + container | Pod (one or more containers) |
| **Scaling** | Manual / Compose replicas | Declarative replicas, HPA |
| **Self-healing** | Restart on one host | Reschedule across cluster |
| **Multi-host** | Swarm (less common) | Core design goal |

Docker is the **runtime**; Kubernetes is the **orchestrator** deciding where and how many containers run.

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# Kubernetes Deployment — desired state, not just a single container
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels: { app: api }
  template:
    metadata:
      labels: { app: api }
    spec:
      containers:
        - name: api
          image: myregistry/api:1.2.0
          ports: [{ containerPort: 3000 }]
```

## SSR vs CSR vs SSG (web rendering)

| Mode | Where HTML is built | Pros | Cons |
|------|---------------------|------|------|
| **CSR** | Browser (JS bundle) | Rich interactivity; simple hosting | Slow first paint; weak SEO |
| **SSR** | Server per request | Fresh data; good SEO | Server load per request |
| **SSG** | Build time / CDN | Fast delivery; cheap scale | Stale until rebuild/revalidate |

```
CSR:  Browser ──► shell + JS ──► API ──► render
SSR:  Request ──► server HTML ──► hydrate ──► interactive
SSG:  Build ──► static HTML ──► CDN
```

```tsx
// Next.js App Router examples
// SSG (default for static pages)
export default function About() {
  return <h1>About</h1>;
}

// SSR — dynamic per request
export const dynamic = 'force-dynamic';
export default async function Dashboard() {
  const data = await fetchMetrics(); // runs on server each request
  return <Chart data={data} />;
}
```

**Hybrid is common:** marketing SSG, authenticated dashboard SSR, heavy widgets CSR.

## OAuth 2.0 vs OpenID Connect vs SAML

| Standard | Purpose | Token/format | Typical use |
|----------|---------|--------------|-------------|
| **OAuth 2.0** | Authorization — delegate access | Access token | API access on user's behalf |
| **OIDC** | Authentication on OAuth 2.0 | ID token (JWT) + access token | Modern web/mobile login (PKCE) |
| **SAML 2.0** | Federation SSO | XML assertions | Enterprise IdP (Okta, ADFS) |

| | OAuth/OIDC | SAML |
|---|------------|------|
| Transport | JSON over HTTPS | XML POST/redirect |
| Identity claims | `sub`, `email` in ID token | `NameID`, attributes |
| API delegation | Access token scopes | Not designed for APIs |

```
OAuth:  Client → Auth Server → Access Token → Resource Server
OIDC:   + ID Token + UserInfo endpoint
SAML:   User → IdP → SAML Assertion (XML) → Service Provider
```

```http
# OIDC Authorization Code + PKCE (simplified)
GET /authorize?response_type=code&client_id=...&redirect_uri=...&scope=openid%20profile&code_challenge=...
```

OAuth = delegation; OIDC = identity; SAML = enterprise SSO.

## TCP vs UDP

| Feature | TCP | UDP |
|---------|-----|-----|
| **Connection** | Connection-oriented (handshake) | Connectionless |
| **Reliability** | Guaranteed delivery, ordering | Best-effort |
| **Flow/congestion control** | Yes | No |
| **Latency** | Higher | Lower |
| **Use cases** | HTTP, email, file transfer | DNS, VoIP, gaming, live video |

```
TCP:  SYN → SYN-ACK → ACK → reliable ordered stream
UDP:  datagram sent → may arrive, duplicate, or drop
```

## Horizontal vs Vertical scaling

| Aspect | Vertical (scale up) | Horizontal (scale out) |
|--------|---------------------|-------------------------|
| **Action** | Bigger CPU/RAM on one node | More nodes behind load balancer |
| **Limits** | Hardware ceiling | Needs stateless or shared state |
| **Fault tolerance** | Single point of failure | Survives node loss |
| **Data layer** | Easier monolithic DB | Sharding, replicas, distributed cache |

```
Vertical:   [ 4 CPU ] ──► [ 32 CPU ]
Horizontal: [ App ] [ App ] [ App ] ← Load Balancer
```

Horizontal for web tiers; vertical common for DBs until sharding.

## Synchronous vs Asynchronous communication in distributed systems

| Aspect | Synchronous | Asynchronous |
|--------|-------------|--------------|
| **Pattern** | HTTP/gRPC request–response | Queues, pub/sub, event buses |
| **Coupling** | Caller waits; temporal coupling | Decoupled in time |
| **Failure** | Immediate error to caller | Retries, DLQ, eventual processing |
| **Examples** | REST between services | Kafka, RabbitMQ, Service Bus |

```
Sync:   Client → API → Inventory → Payment → response (blocking)
Async:  Client → API → OrderCreated → [queue] → workers → 202 Accepted
```

```csharp
// Sync — caller blocks
var stock = await inventoryClient.ReserveAsync(orderId);

// Async — fire event, process later
await bus.PublishAsync(new OrderCreated(orderId));
return Accepted();
```

**Sync** for short chains and immediate feedback; **async** for fan-out, buffering, and long-running work.

## CI vs CD — what each does

| Practice | What it does | Typical activities |
|----------|--------------|-------------------|
| **CI** | Validate every change on merge | Build, unit tests, lint, artifact |
| **CD (Delivery)** | Always releasable; manual prod gate | Staging deploy, E2E, smoke tests |
| **CD (Deployment)** | Auto-deploy passing main to prod | Delivery + automated promote |

```
push → CI (build + test) → artifact → CD (staging → tests → [approve] → prod)
```

| Stage | CI | CD |
|-------|----|----|
| Trigger | Every PR / push | After CI success |
| Goal | Catch defects early | Ship safely and often |
| Output | Tested build artifact | Deployed environment |

```yaml
# GitHub Actions — CI job
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test && npm run build
```

```yaml
# CD deploy job (runs after CI)
  deploy:
    needs: ci
    runs-on: ubuntu-latest
    steps:
      - run: kubectl set image deployment/api api=myapp:${{ github.sha }}
```

CI = does it work; CD = can we ship it safely.
