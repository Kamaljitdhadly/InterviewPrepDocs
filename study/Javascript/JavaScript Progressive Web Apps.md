# JavaScript Progressive Web Apps

## Questions Covered

1. What are Progressive Web Apps (PWAs)?
2. What is a manifest file in a PWA?
3. What are service workers and how do they work in PWAs?
4. What is Background Sync in PWAs?

## What are Progressive Web Apps (PWAs)?

**PWAs** are web apps built with HTML, CSS, and JavaScript that deliver a native-like experience across desktop, mobile, and tablet — with offline access, push notifications, and fast loads.

**Key characteristics:**

1. **Progressive enhancement** — works everywhere; adds features on capable browsers.
2. **Responsive** — fits any screen size/orientation.
3. **Connectivity independence** — service workers cache resources for offline/low-quality networks.
4. **App-like UI** — smooth SPA-style interactions; installable to home screen in full-screen/standalone mode.
5. **Re-engageable** — push notifications when the app isn't open.
6. **Safe** — served over HTTPS.
7. **Installable** — no app store required; appears on home screen/launcher.
8. **Linkable** — shareable via URL.

**How they work:** service workers (network proxy + caching), a `manifest.json` (install metadata), responsive design, and asset caching for speed/offline use.

**Benefits:** lower cost than multi-platform native apps, higher engagement, no app-store gatekeeping, SEO-indexable.

**Examples:** Twitter Lite, Spotify web player, Pinterest PWA.

**Challenges:** limited device APIs vs native (Bluetooth, sensors), uneven browser support on older engines, no default app-store presence.

## What is a manifest file in a PWA?

The **manifest** (`manifest.json`) is JSON metadata that controls install appearance and launch behavior — name, icons, theme colors, display mode, and scope.

**Key fields:**

1. **`name` / `short_name`** — full and abbreviated app names.

```javascript
{
  "name": "My Awesome App",
  "short_name": "Awesome"
}
```

2. **`icons`** — home screen / splash icons at multiple resolutions.

```javascript
{
  "icons": [
  {
    "src": "/images/icon-192x192.png",
    "type": "image/png",
    "sizes": "192x192"
  },
  {
    "src": "/images/icon-512x512.png",
    "type": "image/png",
    "sizes": "512x512"
  }
  ]
}
```

3. **`start_url`** — URL loaded on launch.

```javascript
{
  "start_url": "/index.html"
}
```

4. **`display`** — `fullscreen`, `standalone`, `minimal-ui`, or `browser`.

```javascript
{
  "display": "standalone"
}
```

5. **`background_color`** — splash screen background.

```javascript
{
  "background_color": "#ffffff"
}
```

6. **`theme_color`** — browser UI / status bar color.

```javascript
{
  "theme_color": "#4CAF50"
}
```

7. **`orientation`** — preferred orientation (`portrait`, `landscape`, etc.).

```javascript
{
  "orientation": "portrait"
}
```

8. **`scope`** — navigation boundary for the installed app.

```javascript
{
  "scope": "/"
}
```

**Complete example:**

```javascript
{
  "name": "My Awesome App",
  "short_name": "Awesome",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4CAF50",
  "orientation": "portrait",
  "scope": "/",
  "icons": [
    {
      "src": "/images/icon-192x192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "/images/icon-512x512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ]
}
```

**Usage:** enables "Add to Home Screen", drives app-like launch (icons, colors, orientation), and supports discoverability when the PWA is well-indexed.

## What are service workers and how do they work in PWAs?

**Service workers** are background JS scripts (no direct DOM access) that sit between the app and the network — enabling offline caching, push notifications, and background sync.

**Key concepts:**

- **Event-driven** — responds to `install`, `activate`, and `fetch` events.
- **Lifecycle:** `install` (cache assets) → `activate` (clean old caches) → `fetch` (intercept requests).

**Registration:**

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
  .then(function(registration) {
    console.log('Service Worker registered with scope:', registration.scope);
  }).catch(function(error) {
    console.log('Service Worker registration failed:', error);
  });
}
```

**Install & cache:**

```javascript
self.addEventListener('install', function(event) {
  event.waitUntil(
  caches.open('my-cache').then(function(cache) {
    return cache.addAll([
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/image.png'
    ]);
  })
  );
});
```

**Activate (cache cleanup):**

```javascript
self.addEventListener('activate', function(event) {
  var cacheWhitelist = ['my-cache'];
  event.waitUntil(
  caches.keys().then(function(cacheNames) {
    return Promise.all(
    cacheNames.map(function(cacheName) {
      if (cacheWhitelist.indexOf(cacheName) === -1) {
        return caches.delete(cacheName);
      }
    })
    );
  })
  );
});
```

**Fetch (offline support):**

```javascript
self.addEventListener('fetch', function(event) {
  event.respondWith(
  caches.match(event.request)
  .then(function(response) {
    return response || fetch(event.request);
  })
  );
});
```

**Use cases:** offline access, push notifications, background sync, resource optimization (cache-first, network-first, stale-while-revalidate).

**Challenges:** choosing caching strategies, update propagation (old SW controls pages until closed), HTTPS-only requirement.

## What is Background Sync in PWAs?

**Background Sync** defers network-dependent actions until connectivity is stable — ideal for messages, uploads, form submissions, and data sync when offline or on poor networks.

**How it works:**

1. Register via the service worker when an action needs the network.
2. Browser fires a `sync` event when connection is reliable.
3. Automatic retries if the network is still down.

**Register a sync event:**

```javascript
// Example: Registering a sync event
navigator.serviceWorker.ready.then(function(swRegistration) {
  return swRegistration.sync.register('my-tag-name');
});
```

**Handle the sync event:**

```javascript
self.addEventListener('sync', function(event) {
  if (event.tag === 'my-tag-name') {
    event.waitUntil(doSomeWork());
  }
});
function doSomeWork() {
  // Example: Sending queued data to the server
  return fetch('/send-data', {
    method: 'POST',
    body: JSON.stringify({ data: 'my-data' })
  });
}
```

**Use cases:** offline messaging, deferred media uploads, queued form submissions, server data sync.

**Advantages:** seamless UX regardless of network state, reliable eventual completion, battery-efficient (avoids repeated failed requests).

**Considerations:** may require user permission, edge cases for prolonged offline periods, browser support strongest in Chromium.
