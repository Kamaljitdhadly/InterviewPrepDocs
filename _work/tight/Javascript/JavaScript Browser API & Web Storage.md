# JavaScript Browser API & Web Storage

## Questions Covered

1. What is the window object?
2. What are Browser APIs in JavaScript?
3. What is Web Storage, and its use? How many types of web storage are there?

## What is the window object?

The **window** object is the browser's global object — the tab/window interface for page and browser interaction.

- **Global scope** — global vars/functions are `window` properties.
- **Properties:** `document`, `location`, `navigator`, `localStorage`, `sessionStorage`, `console`.
- **Methods:** `alert()`, `confirm()`, `prompt()`, `open()`, `close()` (close only for `open()`-created windows).
- **Events:** resize, scroll, keypress.

**Accessing properties:**

```javascript
console.log(window.location.href); // Logs the current URL
console.log(window.innerWidth); // Logs the width of the browser window
```

**Using methods:**

```javascript
window.alert('Hello, world!');
// Open a new window
window.open('https://example.com', '_blank');
// Get user input via prompt
const userInput = window.prompt('Enter your name:');
console.log('User entered:', userInput);
```

**Global events:**

```javascript
window.addEventListener('resize', () => {
  console.log('Window resized to:', window.innerWidth, 'x', window.innerHeight);
});
```

## What are Browser APIs in JavaScript?

**Browser APIs** extend JS beyond language features for DOM, network, storage, media, and background work.

| Category | Key APIs |
|----------|----------|
| DOM | `document`, `querySelector`, `createElement` |
| Window | `window`, `localStorage`, `sessionStorage` |
| Network | `fetch`, `XMLHttpRequest` |
| Geolocation | `navigator.geolocation` |
| Canvas / Audio | `CanvasRenderingContext2D`, `AudioContext` |
| Workers | `Worker`, `ServiceWorker` |
| Real-time | `RTCPeerConnection`, `PushManager` |

**Fetch API:**

```javascript
fetch('https://api.example.com/data')
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

**Geolocation API:**

```javascript
navigator.geolocation.getCurrentPosition((position) => {
  console.log('Latitude:', position.coords.latitude);
  console.log('Longitude:', position.coords.longitude);
}, (error) => {
  console.error('Error:', error);
});
```

**Canvas API:**

```html
<canvas id="myCanvas" width="200" height="100"></canvas>
<script>
const canvas = document.getElementById('myCanvas');
const context = canvas.getContext('2d');
context.fillStyle = 'blue';
context.fillRect(10, 10, 150, 80);
</script>
```

**Web Audio API:**

```javascript
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioContext.createOscillator();
oscillator.type = 'sine';
oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
oscillator.connect(audioContext.destination);
oscillator.start();
oscillator.stop(audioContext.currentTime + 1); // Play sound for 1 second
```

## What is Web Storage, and its use? How many types of web storage are there?

**Web Storage** persists data client-side — preferences, form data, caching, session/SPA state. **Two types:**

### Local Storage

Persists across browser restarts; same-origin scoped. API: `setItem`, `getItem`, `removeItem`, `clear`.

```javascript
// Store data
localStorage.setItem('username', 'JohnDoe');
// Retrieve data
const username = localStorage.getItem('username');
console.log(username); // Output: JohnDoe
// Remove data
localStorage.removeItem('username');
// Clear all data
localStorage.clear();
```

### Session Storage

Persists for the tab session; cleared on close. Same origin scope and API as localStorage.

```javascript
// Store data
sessionStorage.setItem('sessionId', 'abc123');
// Retrieve data
const sessionId = sessionStorage.getItem('sessionId');
console.log(sessionId); // Output: abc123
// Remove data
sessionStorage.removeItem('sessionId');
// Clear all data
sessionStorage.clear();
```

**Use cases:** preferences, form persistence, caching, login state, SPA state.
