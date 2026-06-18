# JavaScript Event Handling

## Questions Covered

1. What are events? How are events triggered?
2. What is event delegation in JavaScript?
3. What is event bubbling in JavaScript?
4. How can you stop event propagation or event bubbling in JavaScript?
5. What is event capturing in JavaScript?
6. What is the purpose of event.preventDefault() in JavaScript?
7. How do you remove an event handler from an element in JavaScript?

## What are events? How are events triggered?

**Events** are actions/occurrences (user input, system signals, custom dispatches) that JavaScript can listen for and respond to.

**Types:** user (click, keydown, mousemove), system (load, resize), and custom (`CustomEvent`).

**User actions:**

```javascript
document.getElementById('myButton').addEventListener('click', () => {
  console.log('Button clicked!');
});
```

```javascript
document.addEventListener('keydown', (event) => {
  console.log('Key pressed:', event.key);
});
```

```javascript
document.addEventListener('mousemove', (event) => {
  console.log('Mouse moved:', event.clientX, event.clientY);
});
```

**System events:**

```javascript
window.addEventListener('load', () => {
  console.log('Page loaded!');
});
```

```javascript
window.addEventListener('resize', () => {
  console.log('Window resized!');
});
```

**Custom events:**

```javascript
// Create a custom event
const myEvent = new CustomEvent('myCustomEvent', { detail: { key: 'value' } });
// Add an event listener for the custom event
document.addEventListener('myCustomEvent', (event) => {
  console.log('Custom event triggered with detail:', event.detail);
});
// Dispatch the custom event
document.dispatchEvent(myEvent);
```

**Handling:** attach with `addEventListener(type, handler, options)`, detach with `removeEventListener` (same function reference). Events propagate in **capturing** (root → target) then **bubbling** (target → root) phases.

```javascript
document.getElementById('myButton').addEventListener('click', (event) => {
  console.log('Button clicked!');
}, { capture: false }); // or capture: true for capturing phase
```

```javascript
function handleClick() {
  console.log('Button clicked!');
}
const button = document.getElementById('myButton');
button.addEventListener('click', handleClick);
button.removeEventListener('click', handleClick);
```

Control propagation with `stopPropagation()` and `stopImmediatePropagation()`.

## What is event delegation in JavaScript?

**Event delegation** attaches one listener on a parent; child events bubble up and are handled via `event.target`. Efficient for many or dynamically added elements.

**Benefits:** fewer listeners, simpler code, automatic handling of future children.

**List example:**

```javascript
<ul id="myList">
<li>Item 1</li>
<li>Item 2</li>
<li>Item 3</li>
</ul>
```

```javascript
document.getElementById('myList').addEventListener('click', (event) => {
  // Check if the clicked target is an <li> element
  if (event.target.tagName === 'LI') {
    console.log('Clicked item:', event.target.textContent);
  }
});
```

**Dynamic form fields:**

```javascript
<div id="formContainer">
<form id="myForm">
<input type="text" name="field1" />
</form>
<button id="addField">Add Field</button>
</div>
```

```javascript
document.getElementById('formContainer').addEventListener('input', (event) => {
  if (event.target.tagName === 'INPUT') {
    console.log('Input changed:', event.target.value);
  }
});
document.getElementById('addField').addEventListener('click', () => {
  const newInput = document.createElement('input');
  newInput.type = 'text';
  newInput.name = 'field' + (document.querySelectorAll('#myForm input').length + 1);
  document.getElementById('myForm').appendChild(newInput);
});
```

## What is event bubbling in JavaScript?

**Event bubbling** — after the target handles an event, it propagates upward through ancestors to the document root.

**Phases:** target phase → bubbling phase (capturing runs first, before target).

```javascript
<div id="parent">
<div id="child">
<button id="btn">Click me</button>
</div>
</div>
```

```javascript
document.getElementById('btn').addEventListener('click', () => {
  console.log('Button clicked');
});
// Event listener on the child div
document.getElementById('child').addEventListener('click', () => {
  console.log('Child div clicked');
});
// Event listener on the parent div
document.getElementById('parent').addEventListener('click', () => {
  console.log('Parent div clicked');
});
```

**Output when button clicked:** Button clicked → Child div clicked → Parent div clicked.

**Stop bubbling:**

```javascript
document.getElementById('btn').addEventListener('click', (event) => {
  console.log('Button clicked');
  event.stopPropagation(); // Prevents the event from bubbling up
});
document.getElementById('child').addEventListener('click', () => {
  console.log('Child div clicked');
});
document.getElementById('parent').addEventListener('click', () => {
  console.log('Parent div clicked');
});
```

**Output:** Button clicked only.

## How can you stop event propagation or event bubbling in JavaScript?

| Method | Effect |
|--------|--------|
| `event.stopPropagation()` | Stops bubbling to ancestors |
| `event.stopImmediatePropagation()` | Stops bubbling + other listeners on same element |
| `event.preventDefault()` | Cancels default action; does not stop propagation |

**stopPropagation():**

```javascript
document.getElementById('btn').addEventListener('click', (event) => {
  console.log('Button clicked');
  event.stopPropagation(); // Stops the event from bubbling up
});
document.getElementById('parent').addEventListener('click', () => {
  console.log('Parent div clicked');
});
Button clicked
```

**stopImmediatePropagation():**

```javascript
document.getElementById('btn').addEventListener('click', (event) => {
  console.log('First handler');
  event.stopImmediatePropagation(); // Stops other handlers on the same element
});
document.getElementById('btn').addEventListener('click', () => {
  console.log('Second handler');
});
document.getElementById('parent').addEventListener('click', () => {
  console.log('Parent div clicked');
});
First handler
```

**preventDefault():**

```javascript
document.getElementById('link').addEventListener('click', (event) => {
  event.preventDefault(); // Prevents the link from navigating
  console.log('Link clicked');
});
```

## What is event capturing in JavaScript?

**Capturing phase** — event travels from root down to target before the target and bubbling phases. Listeners with `{ capture: true }` fire during this descent.

**Propagation order:** capturing (outer → inner) → target → bubbling (inner → outer).

```javascript
element.addEventListener(eventType, callback, { capture: true });
```

```javascript
<html>
<body>
<div id="parent">
<button id="btn">Click me</button>
</div>
<script>
document.getElementById('parent').addEventListener('click', () => {
  console.log('Parent div clicked - Capturing');
}, { capture: true });
document.getElementById('btn').addEventListener('click', () => {
  console.log('Button clicked - Capturing');
}, { capture: true });
</script>
</body>
</html>
```

**Output:** Parent div clicked - Capturing → Button clicked - Capturing.

Capture listeners run before bubble listeners on the same path.

## What is the purpose of event.preventDefault() in JavaScript?

**`event.preventDefault()`** cancels the browser's default action for an event (navigation, form submit, key insertion) so you can implement custom behavior.

**Form submission:**

```javascript
<form id="myForm">
<input type="text" name="username" required />
<button type="submit">Submit</button>
</form>
<script>
document.getElementById('myForm').addEventListener('submit', (event) => {
  event.preventDefault(); // Prevents form from submitting
  console.log('Form submission prevented');
  // Add custom validation or handling here
});
</script>
```

**Link navigation:**

```javascript
<a href="https://example.com" id="myLink">Go to example.com</a>
<script>
document.getElementById('myLink').addEventListener('click', (event) => {
  event.preventDefault(); // Prevents the link from navigating to the URL
  console.log('Link click prevented');
  // Handle the link click with custom logic here
});
</script>
```

**Keyboard events:**

```javascript
<input type="text" id="myInput" />
<script>
document.getElementById('myInput').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevents form submission or default behavior on Enter key
    console.log('Enter key pressed');
    // Custom behavior for Enter key
  }
});
</script>
```

Does not stop event propagation — pair with `stopPropagation()` if needed.

## How do you remove an event handler from an element in JavaScript?

Use **`removeEventListener`** with the same event type, function reference, and options as `addEventListener`.

```javascript
<button id="myButton">Click me</button>
```

```javascript
function handleClick(event) {
  console.log('Button clicked!');
}
// Attach the event listener
document.getElementById('myButton').addEventListener('click', handleClick);
// Later in the code, remove the event listener
document.getElementById('myButton').removeEventListener('click', handleClick);
```

**Inline handlers** (`element.onclick`) — set to `null` instead:

```javascript
document.getElementById('myButton').onclick = function() {
  console.log('Button clicked!');
};
// Remove the event handler by setting it to null
document.getElementById('myButton').onclick = null;
```

Anonymous functions cannot be removed — store a named reference.
