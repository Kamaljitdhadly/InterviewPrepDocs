# Next.js

## Questions Covered

1. What is Next.js and what problems does it solve?
2. What is the difference between SSR, SSG, and CSR?
3. How does the Next.js App Router differ from the Pages Router?
4. What are Server Components and Client Components in Next.js?
5. How do you fetch data in Next.js (server vs client)?
6. How does routing work in the App Router?
7. What are Next.js API routes / Route Handlers?
8. How do you implement authentication in Next.js?
9. What is middleware in Next.js and common use cases?
10. How do you optimize performance in Next.js (Image, fonts, caching)?

## What is Next.js and what problems does it solve?

**Next.js** is a React framework (Vercel) that adds file-based routing, server rendering, API endpoints, and image/font optimization on top of React — so you ship fast, SEO-friendly apps without assembling SSR infrastructure yourself.

| Problem with plain React SPAs | How Next.js addresses it |
|-------------------------------|--------------------------|
| Poor initial SEO and slow first paint (blank shell + client fetch) | SSR, SSG, and streaming deliver HTML with content |
| Manual webpack/Vite + React Router setup | Zero-config tooling; conventions over configuration |
| No built-in API layer | Route Handlers (App Router) / API Routes (Pages Router) |
| Unoptimized images and fonts | `next/image`, `next/font` with automatic optimization |
| Complex deployment for SSR | `next build` + Node server or static export; Vercel integration |

Next.js supports hybrid rendering (SSR, SSG, ISR, CSR per route). **App Router** (13+) is recommended; **Pages Router** remains for legacy apps.

```jsx
// app/page.tsx — default Server Component, zero client JS for static markup
export default function HomePage() {
  return (
    <main>
      <h1>Welcome to Next.js</h1>
      <p>Rendered on the server by default.</p>
    </main>
  );
}
```

```javascript
// next.config.js — common framework configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.example.com' }],
  },
};

module.exports = nextConfig;
```

In interviews, position Next.js as **React + opinions**: routing, data fetching, and rendering are first-class.

## What is the difference between SSR, SSG, and CSR?

These strategies describe **where and when** HTML is produced.

| Strategy | When HTML is generated | Typical use case |
|----------|------------------------|------------------|
| **CSR (Client-Side Rendering)** | Browser downloads JS bundle, React renders in the client | Dashboards, authenticated apps, highly interactive UIs |
| **SSR (Server-Side Rendering)** | Server renders HTML **per request** | Personalized pages, frequently changing data, SEO + fresh content |
| **SSG (Static Site Generation)** | HTML built **at build time** | Marketing pages, blogs, docs — content same for all users |

**ISR** extends SSG with timed or on-demand revalidation. **CSR:** fast after load, weak SEO. **SSR:** fresh per request, higher server cost. **SSG:** CDN-fast, stale until revalidate.

```jsx
// CSR — fetch in a Client Component after mount
'use client';

import { useEffect, useState } from 'react';

export default function ClientDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then(setStats);
  }, []);

  if (!stats) return <p>Loading...</p>;
  return <pre>{JSON.stringify(stats, null, 2)}</pre>;
}
```

```tsx
// SSR — App Router: dynamic rendering (no cache) fetches per request
export const dynamic = 'force-dynamic';

async function getStats() {
  const res = await fetch('https://api.example.com/stats', { cache: 'no-store' });
  return res.json();
}

export default async function ServerDashboard() {
  const stats = await getStats();
  return <pre>{JSON.stringify(stats, null, 2)}</pre>;
}
```

```tsx
// SSG — fetch at build time with default static caching
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 }, // ISR: revalidate every hour
  });
  return res.json();
}

export default async function BlogIndex() {
  const posts = await getPosts();
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

Choose per route via `fetch` cache options, `dynamic`, `generateStaticParams`, and `'use client'`.

## How does the Next.js App Router differ from the Pages Router?

The **App Router** (`app/`, Next.js 13+) centers **React Server Components**, nested layouts, and colocated special files.

| Feature | Pages Router (`pages/`) | App Router (`app/`) |
|---------|-------------------------|---------------------|
| Default component type | Client (all pages could use hooks) | **Server Component** by default |
| Layouts | Custom `_app.js` wrapper | Nested `layout.tsx` files per segment |
| Data fetching | `getServerSideProps`, `getStaticProps`, `getInitialProps` | `async` Server Components + `fetch` caching |
| API endpoints | `pages/api/*.ts` | `app/api/**/route.ts` Route Handlers |
| Loading / error UI | Manual | `loading.tsx`, `error.tsx`, `not-found.tsx` |
| Routing file | `pages/about.tsx` → `/about` | `app/about/page.tsx` → `/about` |

```tsx
// Pages Router — pages/blog/[slug].tsx
import type { GetStaticPaths, GetStaticProps } from 'next';

type Props = { post: { title: string; body: string } };

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [{ params: { slug: 'hello-world' } }],
  fallback: 'blocking',
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const post = await fetchPost(params?.slug as string);
  return { props: { post }, revalidate: 60 };
};

export default function BlogPost({ post }: Props) {
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}
```

```tsx
// App Router — app/blog/[slug]/page.tsx (equivalent SSG + ISR)
type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await fetchAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

async function fetchPost(slug: string) {
  const res = await fetch(`https://api.example.com/posts/${slug}`, {
    next: { revalidate: 60 },
  });
  return res.json();
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}
```

Use App Router for new projects; both routers can coexist during migration.

## What are Server Components and Client Components in Next.js?

**Server Components (RSC)** run on the server — direct DB/filesystem access, smaller client bundles. **Client Components** hydrate in the browser and support hooks, effects, and browser APIs.

| Server Component | Client Component (`'use client'`) |
|----------------|-----------------------------------|
| Default in App Router | Opt in with `'use client'` at file top |
| `async` / `await` in component body | `useState`, `useEffect`, event handlers |
| Import server-only modules (`fs`, DB drivers) | Browser APIs (`window`, `localStorage`) |
| Cannot use hooks or interactivity | Can import and render Server Components as children |

**Composition pattern:** Keep interactive leaves as Client Components; wrap them in Server Component parents that fetch data and pass serializable props.

```tsx
// app/products/page.tsx — Server Component (no directive)
import { AddToCartButton } from './AddToCartButton';

async function getProducts() {
  const res = await fetch('https://api.example.com/products', {
    next: { tags: ['products'] },
  });
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          {product.name} — ${product.price}
          <AddToCartButton productId={product.id} />
        </li>
      ))}
    </ul>
  );
}
```

```tsx
// app/products/AddToCartButton.tsx — Client Component
'use client';

import { useState } from 'react';

export function AddToCartButton({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false);

  return (
    <button
      onClick={() => {
        // call API or update client cart state
        setAdded(true);
      }}
    >
      {added ? 'Added' : 'Add to cart'}
    </button>
  );
}
```

Server Components stream as RSC payload; only Client boundaries ship JS. Props must be serializable.

## How do you fetch data in Next.js (server vs client)?

In Server Components, call `fetch`, ORMs, or DB APIs directly. Extended `fetch` options: default cache (SSG), `cache: 'no-store'` (SSR), `next: { revalidate: N }` (ISR), `next: { tags }` + `revalidateTag`. Use `Promise.all` and React `cache()` to avoid waterfalls and duplicate requests.

```tsx
// app/dashboard/page.tsx — parallel server fetches
import { cache } from 'react';

const getUser = cache(async (id: string) => {
  const res = await fetch(`https://api.example.com/users/${id}`, {
    next: { revalidate: 300 },
  });
  return res.json();
});

async function getOrders(userId: string) {
  const res = await fetch(`https://api.example.com/orders?userId=${userId}`, {
    cache: 'no-store',
  });
  return res.json();
}

export default async function DashboardPage() {
  const userId = 'user-1';
  const [user, orders] = await Promise.all([getUser(userId), getOrders(userId)]);

  return (
    <section>
      <h1>{user.name}</h1>
      <p>Orders: {orders.length}</p>
    </section>
  );
}
```

Use client fetching (SWR, React Query, `useEffect`) for polling, user-triggered refetch, or browser-only libraries.

```tsx
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function LiveMetrics() {
  const { data, error, isLoading } = useSWR('/api/metrics', fetcher, {
    refreshInterval: 5000,
  });

  if (isLoading) return <p>Loading metrics...</p>;
  if (error) return <p>Failed to load.</p>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

**Server Actions** (`'use server'`) handle mutations without hand-written API routes.

```tsx
// app/actions.ts
'use server';

import { revalidateTag } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  await db.post.create({ data: { title } });
  revalidateTag('posts');
}
```

## How does routing work in the App Router?

Folders in `app/` are URL segments. Key files: `page.tsx` (route UI), `layout.tsx` (shared wrapper), `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts` (API). Dynamic `[slug]`, catch-all `[...slug]`, optional `[[...slug]]`. Route groups `(name)` skip URL segments; parallel routes use `@slot`.

```tsx
// app/layout.tsx — root layout (required)
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'My App', template: '%s | My App' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

```tsx
// app/blog/[slug]/page.tsx — dynamic route + generateStaticParams
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return [{ slug: 'intro' }, { slug: 'advanced' }];
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
  <article>
    <Link href="/blog">← Back</Link>
    <h1>{post.title}</h1>
    <div>{post.content}</div>
  </article>
  );
}
```

```tsx
// app/blog/loading.tsx — shown while page.tsx suspends
export default function Loading() {
  return <p>Loading post...</p>;
}
```

Navigate with `<Link>` (prefetch) or `redirect()` / `useRouter()` from `next/navigation`.

## What are Next.js API routes / Route Handlers?

**Route Handlers** (`app/**/route.ts`) replace legacy **API Routes** (`pages/api/*`). Export `GET`, `POST`, etc.; return `Response` / `NextResponse`. Run on Edge or Node; keep secrets server-side. Legacy Pages Router handlers use `NextApiRequest` / `NextApiResponse`.

```typescript
// app/api/hello/route.ts — App Router Route Handler
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello from Route Handler' });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ received: body }, { status: 201 });
}
```

```typescript
// app/api/users/[id]/route.ts — dynamic API route
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const user = await db.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  await db.user.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
```

```javascript
// pages/api/hello.js — Pages Router (legacy pattern)
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ message: 'Hello from API Route' });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
```

Route Handlers don't render React. Use `runtime = 'edge'` for low latency; `dynamic` / `revalidate` for caching.

## How do you implement authentication in Next.js?

No built-in auth — combine HTTP-only cookies, server session validation, middleware redirects, and Client login UI. Libraries: Auth.js, Clerk, Lucia, or custom JWT. Store sessions in HTTP-only cookies (not `localStorage`); validate in Server Components, Route Handlers, and Server Actions; use middleware + `redirect()` for guards.

```typescript
// auth.ts — session helpers (server-only)
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string };
  } catch {
    return null;
  }
}
```

```tsx
// app/login/actions.ts — Server Action for login
'use server';

import { redirect } from 'next/navigation';
import { createSession } from '@/auth';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const user = await verifyCredentials(email, formData.get('password') as string);
  if (!user) {
    return { error: 'Invalid credentials' };
  }
  await createSession(user.id);
  redirect('/dashboard');
}
```

```tsx
// app/dashboard/page.tsx — protect at data layer
import { redirect } from 'next/navigation';
import { getSession } from '@/auth';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const data = await fetchUserData(session.userId);
  return <h1>Welcome, {data.name}</h1>;
}
```

Auth.js handles OAuth and sessions via `app/api/auth/[...nextauth]/route.ts`. Use CSRF protection; never expose secrets client-side.

## What is middleware in Next.js and common use cases?

**Middleware** (`middleware.ts` at project root) runs at the Edge before the request completes — redirect, rewrite, or set headers. Use `matcher` to scope paths. Common uses: auth redirects, i18n locale routing, A/B testing, bot protection, geo routing. Edge runtime only — no `fs`; keep checks lightweight (JWT verify, not heavy DB).

```typescript
// middleware.ts — auth gate + locale prefix
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const publicPaths = ['/login', '/register', '/api/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public routes and static assets
  if (
    publicPaths.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('session')?.value;
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

Heavy validation belongs in Server Components or Route Handlers, not middleware.

## How do you optimize performance in Next.js (Image, fonts, caching)?

Cover **asset optimization**, **caching**, and **bundle size**. `next/image` serves responsive images, lazy loading, WebP/AVIF, and prevents CLS via `width`/`height` or `fill`.

```tsx
import Image from 'next/image';

export function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Product showcase"
      width={1200}
      height={630}
      priority // LCP image — preload, disable lazy load
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  );
}
```

`next/font` self-hosts fonts at build time — no external request, no CLS.

```tsx
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = Roboto_Mono({ subsets: ['latin'], variable: '--font-mono' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

**Caching:** Full Route Cache (static routes), Data Cache (`fetch` + `revalidateTag`/`revalidatePath`), request memoization (`cache()`), Router Cache (client soft nav).

```tsx
// Tag-based cache invalidation after mutation
import { revalidatePath, revalidateTag } from 'next/cache';

export async function updateProduct(id: string, data: FormData) {
  'use server';
  await db.product.update({ where: { id }, data: Object.fromEntries(data) });
  revalidateTag('products');
  revalidatePath('/products');
}
```

```javascript
// next.config.js — headers for static assets
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

Also use `next/dynamic`, Suspense streaming, `@next/bundle-analyzer`, and PPR when enabled. Measure **Core Web Vitals** (LCP, INP, CLS) — optimizations matter most with deliberate Server/Client boundaries.
