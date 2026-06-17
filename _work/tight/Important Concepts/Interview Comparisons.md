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

Component-based UIs; differ in scope, opinions, ecosystem.

| Dimension | Angular | React |
|-----------|---------|-------|
| **Type** | Full framework | UI library |
| **Language** | TypeScript enforced | TS optional |
| **Learning curve** | Steeper (RxJS, DI) | Gentler entry |
| **State** | Services + RxJS; NgRx | Hooks, Context, Redux, Zustand |
| **Change detection** | Zone.js / Signals | Virtual DOM |
| **Enterprise** | Conventions, CLI | Flexibility, hiring pool |
| **Mobile** | Ionic, NativeScript | React Native |

**Choose Angular:** enterprise longevity, one official stack, RxJS/TS team.
**Choose React:** flexibility, fast prototyping, React Native, incremental adoption.

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

**Interview tip:** Match team skills and how much framework opinion you want.

## Redux vs NgRx vs Context vs Zustand

Shared state tools — ceremony and platform differ.

| Tool | Platform | Pattern | Best for |
|------|----------|---------|----------|
| **Redux** | React (RTK) | Store, actions, reducers | Complex state, DevTools, middleware |
| **NgRx** | Angular | Redux + Effects, Entity | Predictable Angular global state |
| **Context** | React | Provider + `useContext` | Theme, locale — rare updates |
| **Zustand** | React | Hook store | Medium global state, low boilerplate |

| Concern | Redux / NgRx | Context | Zustand |
|---------|--------------|---------|---------|
| Boilerplate | High (RTK helps) | Low | Very low |
| Re-renders | Selectors | All consumers | Per-selector |
| Async | Thunks / Effects | Manual | Plain async |

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

**Rule of thumb:** Context for config; Zustand for simple global UI; Redux/NgRx for normalized shared data and complex async.

## REST vs GraphQL vs gRPC

| Aspect | REST | GraphQL | gRPC |
|--------|------|---------|------|
| **Protocol** | HTTP + JSON | HTTP + JSON | HTTP/2 + Protobuf |
| **Contract** | OpenAPI (informal) | SDL schema | `.proto` |
| **Fetching** | Fixed endpoints | Client picks fields | Typed RPC |
| **Caching** | HTTP-native | Client layer | Limited |
| **Browser** | Native | Native | grpc-web proxy |
| **Best fit** | Public CRUD | Varied client shapes | Internal services |

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

**Interview tip:** REST = compatibility; GraphQL = flexible clients; gRPC = low-latency internals.

## Monolith vs Microservices

| Dimension | Monolith | Microservices |
|-----------|----------|---------------|
| **Deploy** | Single unit | Independent services |
| **Scaling** | Whole app | Per service |
| **Data** | Often one DB | DB per service |
| **Faults** | All-or-nothing | Smaller blast radius |
| **Ops** | Simpler | Discovery, tracing, mesh |
| **Transactions** | In-process ACID | Sagas, eventual consistency |

**Monolith:** early product, small team, unclear boundaries.
**Microservices:** distinct scale profiles, independent releases, platform investment.

```
Monolith:  [ Web + API + Jobs ] ──► DB

Microservices:
  [ API Gateway ] ──► [ Orders svc ] ──► Orders DB
                  ├──► [ Catalog svc ] ──► Catalog DB
                  └──► [ Payments svc ] ──► Payments DB
```

## SQL vs NoSQL databases

| Aspect | SQL | NoSQL |
|--------|-----|-------|
| **Model** | Tables, rows | Document, KV, column, graph |
| **Schema** | Strict | Flexible |
| **Queries** | JOINs, SQL | Denormalized paths |
| **Transactions** | ACID | Eventual (varies) |
| **Scale** | Vertical + replicas | Horizontal partition |
| **Use cases** | Relations, reporting | High writes, flexible docs |

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

**Interview tip:** SQL for integrity/relations; NoSQL for scale and evolving schema.

## Docker vs Kubernetes — roles and relationship

| Role | Docker | Kubernetes |
|------|--------|------------|
| **Job** | Build, ship, run containers | Schedule, scale, heal |
| **Unit** | Image + container | Pod |
| **Scaling** | Manual / Compose | Declarative replicas, HPA |
| **Multi-host** | Swarm (rare) or K8s | Core design |

**Relationship:** Docker = runtime; Kubernetes = orchestrator (where/how many).

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

**Interview tip:** Dockerize the app; K8s runs it in prod with rolling updates.

## SSR vs CSR vs SSG (web rendering)

| Mode | Where | When | Pros | Cons |
|------|-------|------|------|------|
| **CSR** | Browser | Client runtime | Rich UX; simple host | Slow FCP; weak SEO |
| **SSR** | Server/request | Per request | Fresh data; SEO | Server load |
| **SSG** | Build/CDN | Pre-render | Fast, cheap | Stale until revalidate |

```
CSR:  Browser ──► shell + JS ──► API ──► render
SSR:  Request ──► server HTML ──► hydrate
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

**Hybrid common:** marketing SSG, dashboard SSR, widgets CSR.

## OAuth 2.0 vs OpenID Connect vs SAML

| Standard | Purpose | Format | Use |
|----------|---------|--------|-----|
| **OAuth 2.0** | Authorization | Access token | API delegation, social login |
| **OIDC** | Authentication on OAuth | ID token (JWT) | Modern web/mobile + PKCE |
| **SAML 2.0** | Federation SSO | XML assertions | Enterprise IdP |

| | OAuth/OIDC | SAML |
|---|------------|------|
| Transport | JSON/HTTPS | XML POST |
| Identity | `id_token` claims | `NameID`, attributes |
| APIs | Access token scopes | Not for API delegation |

```
OAuth:  Client → Auth Server → Access Token → Resource Server
OIDC:   + ID Token + UserInfo
SAML:   User → IdP → XML Assertion → Service Provider
```

```http
# OIDC Authorization Code + PKCE (simplified)
GET /authorize?response_type=code&client_id=...&redirect_uri=...&scope=openid%20profile&code_challenge=...
```

**Interview tip:** OAuth = act on my behalf; OIDC = who is the user; SAML = enterprise SSO.

## TCP vs UDP

| Feature | TCP | UDP |
|---------|-----|-----|
| **Connection** | Oriented (handshake) | Connectionless |
| **Reliability** | Guaranteed, ordered | Best-effort |
| **Flow/congestion** | Yes | No |
| **Latency** | Higher | Lower |
| **Use cases** | HTTP, email, files | DNS, VoIP, gaming, video |

```
TCP:  SYN → SYN-ACK → ACK → reliable stream
UDP:  datagram → may drop/duplicate
```

**Interview tip:** TCP for correctness; UDP for timeliness (or app handles loss).

## Horizontal vs Vertical scaling

| Aspect | Vertical (scale up) | Horizontal (scale out) |
|--------|---------------------|-------------------------|
| **Action** | Bigger single node | More nodes + LB |
| **Limits** | Hardware ceiling | Needs stateless design |
| **Fault tolerance** | SPOF | Survives node loss |
| **Data** | Easier monolith DB | Sharding, replicas |

```
Vertical:   [ 4 CPU ] ──► [ 32 CPU ]
Horizontal: [ App ] [ App ] [ App ] ← Load Balancer
```

**Interview tip:** Horizontal for web tiers; vertical still common for DBs.

## Synchronous vs Asynchronous communication in distributed systems

| Aspect | Sync | Async |
|--------|------|-------|
| **Pattern** | HTTP/gRPC request–response | Queues, pub/sub |
| **Coupling** | Caller waits | Decoupled in time |
| **Failure** | Immediate error | Retries, DLQ |
| **Consistency** | Per-call reasoning | Eventual |
| **Examples** | REST chains | Kafka, Service Bus |

```
Sync:   Client → API → Inventory → Payment → response
Async:  Client → API → OrderCreated → [queue] → workers → 202 Accepted
```

```csharp
// Sync — caller blocks
var stock = await inventoryClient.ReserveAsync(orderId);

// Async — fire event, process later
await bus.PublishAsync(new OrderCreated(orderId));
return Accepted();
```

**Sync:** short chains, immediate feedback. **Async:** fan-out, buffering, long work.

## CI vs CD — what each does

| Practice | Does | Activities |
|----------|------|------------|
| **CI** | Validate each merge | Build, test, lint, artifact |
| **CD (Delivery)** | Always releasable; manual prod gate | Staging, E2E, smoke |
| **CD (Deployment)** | Auto prod on green main | Delivery + auto promote |

```
push → CI (build + test) → artifact → CD (staging → tests → [approve] → prod)
```

| Stage | CI | CD |
|-------|----|----|
| Trigger | PR/push | After CI |
| Goal | Catch defects | Ship safely |
| Output | Tested artifact | Deployed env |

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

**Interview tip:** CI = does it work? CD = can we ship it (safely/automatically)?

---

## Related Topics

- **OWASP** (`Important Concepts/`)
- **Microservices Basics** (`Microservices/`)
