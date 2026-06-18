# JavaScript Asynchronous Programming

## Questions Covered

1. What is asynchronous programming in JavaScript? What is its use?
2. What are techniques for achieving asynchronous operations in JavaScript?
3. What is the role of callbacks in fetching API data asynchronously?
4. What is callback hell? How can it be avoided?
5. What are Promises in JavaScript?
6. What is a Promise Chain? How does error handling work in a Promise chain?
7. What is the purpose of Promise.all(), Promise.race(), Promise.any(), and Promise.allSettled() in ES6?
8. What is the purpose of async/await? Compare it with Promises?
9. Can we use async without await and vice versa?
10. How do you handle errors in async/await functions?
11. What is the event loop and how does it relate to the call stack, microtask queue, and macrotask queue?
12. How does Promise.prototype.finally() work in handling cleanup tasks?

## What is asynchronous programming in JavaScript? What is its use?

**Asynchronous programming** lets operations run without blocking the main thread. The program can start API calls, file reads, or timers and continue executing other code while waiting for results — improving responsiveness.

**Core mechanisms:**

1. **Callbacks** — functions passed to run when an async operation completes.

```javascript
setTimeout(() => {
  console.log('Executed after 2 seconds');
}, 2000);
```

2. **Promises** — objects representing eventual completion/failure; handled via `.then()` / `.catch()`.

```javascript
let promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve('Done!'), 2000);
});
promise.then(result => console.log(result)); // Outputs: Done!
```

3. **Async/Await** — syntactic sugar over Promises for synchronous-looking async code.

```javascript
async function fetchData() {
  let result = await fetch('https://api.example.com/data');
  console.log(result);
}
fetchData();
```

**Why use it:** non-blocking I/O (network, files, DB), better UI/backend performance, and concurrency for real-time apps (chat, streaming, dynamic sites).

## What are techniques for achieving asynchronous operations in JavaScript?

1. **Callbacks** — function passed to run when a task completes.

```javascript
function fetchData(callback) {
  setTimeout(() => {
    callback('Data fetched');
  }, 2000);
}
fetchData(result => {
  console.log(result); // Outputs: Data fetched
});
```

2. **Promises** — `.then()` / `.catch()` for success and failure.

```javascript
let promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve('Data fetched'), 2000);
});
promise.then(result => {
  console.log(result); // Outputs: Data fetched
}).catch(error => {
  console.error(error);
});
```

3. **Async/Await** — `async` returns a Promise; `await` pauses until it settles.

```javascript
async function fetchData() {
  try {
    let response = await new Promise((resolve, reject) => {
      setTimeout(() => resolve('Data fetched'), 2000);
    });
    console.log(response); // Outputs: Data fetched
  } catch (error) {
    console.error(error);
  }
}
fetchData();
```

4. **Event loop** — runtime checks the message queue and runs callbacks when events fire.

```javascript
console.log('Start');
setTimeout(() => {
  console.log('Timeout callback');
}, 0);
console.log('End');
// Outputs:
// Start
// End
// Timeout callback
```

5. **Web APIs** — browser APIs (`setTimeout`, `fetch`, `XMLHttpRequest`) provide async I/O.

```javascript
fetch('https://api.example.com/data')
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error));
```

6. **Generators + Promises** — less common; libraries like `co` drive generator flow.

```javascript
function* fetchData() {
  let data = yield new Promise((resolve) => {
    setTimeout(() => resolve('Data fetched'), 2000);
  });
  console.log(data); // Outputs: Data fetched
}
const iterator = fetchData();
const promise = iterator.next().value;
promise.then(result => iterator.next(result));
```

Promises and async/await are the modern standard for readability.

## What is the role of callbacks in fetching API data asynchronously?

Callbacks define code to run once an API request completes — processing success data or handling errors without blocking.

1. **Initiate** — pass a callback to `XMLHttpRequest` or wrap `fetch`.
2. **Handle response** — callback processes returned data (UI update, etc.).
3. **Error handling** — error-first callback pattern (`callback(err, data)`).

**XMLHttpRequest example:**

```javascript
function fetchData(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 300) {
      // Call the callback function with the response data
      callback(null, xhr.responseText);
    } else {
      // Call the callback function with an error message
      callback(`Error: ${xhr.status}`);
    }
  };
  xhr.onerror = function() {
    callback('Network Error');
  };
  xhr.send();
}
// Usage
fetchData('https://api.example.com/data', function(error, data) {
  if (error) {
    console.error(error);
  } else {
    console.log('Data received:', data);
  }
});
```

**fetch wrapped with callbacks:**

```javascript
function fetchData(url, callback) {
  fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => callback(null, data))
  .catch(error => callback(error));
}
// Usage
fetchData('https://api.example.com/data', function(error, data) {
  if (error) {
    console.error(error);
  } else {
    console.log('Data received:', data);
  }
});
```

Callbacks are foundational but nested chains lead to callback hell; Promises/async-await are preferred today.

## What is callback hell? How can it be avoided?

**Callback hell** — deeply nested callbacks when async steps depend on each other; hard to read and maintain.

```javascript
function doFirstThing(callback) {
  setTimeout(() => {
    console.log('First thing done');
    callback();
  }, 1000);
}
function doSecondThing(callback) {
  setTimeout(() => {
    console.log('Second thing done');
    callback();
  }, 1000);
}
function doThirdThing(callback) {
  setTimeout(() => {
    console.log('Third thing done');
    callback();
  }, 1000);
}
// Callback hell
doFirstThing(() => {
  doSecondThing(() => {
    doThirdThing(() => {
      console.log('All done');
    });
  });
});
```

**Avoid with:**

1. **Promises** — linear `.then()` chains.

```javascript
function doFirstThing() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('First thing done');
      resolve();
    }, 1000);
  });
}
function doSecondThing() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Second thing done');
      resolve();
    }, 1000);
  });
}
function doThirdThing() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Third thing done');
      resolve();
    }, 1000);
  });
}
// Using Promises
doFirstThing()
.then(doSecondThing)
.then(doThirdThing)
.then(() => {
  console.log('All done');
});
```

2. **Async/Await** — sequential, readable flow.

```javascript
async function doFirstThing() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('First thing done');
      resolve();
    }, 1000);
  });
}
async function doSecondThing() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Second thing done');
      resolve();
    }, 1000);
  });
}
async function doThirdThing() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Third thing done');
      resolve();
    }, 1000);
  });
}
// Using Async/Await
async function doAllThings() {
  await doFirstThing();
  await doSecondThing();
  await doThirdThing();
  console.log('All done');
}
doAllThings();
```

3. **Modularize** — extract reusable steps.

```javascript
function logAndResolve(message) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(message);
      resolve();
    }, 1000);
  });
}
async function doAllThings() {
  await logAndResolve('First thing done');
  await logAndResolve('Second thing done');
  await logAndResolve('Third thing done');
  console.log('All done');
}
doAllThings();
```

4. **Error handling** — `.catch()` or `try/catch`.

```javascript
async function doAllThings() {
  try {
    await logAndResolve('First thing done');
    await logAndResolve('Second thing done');
    await logAndResolve('Third thing done');
    console.log('All done');
  } catch (error) {
    console.error('Error:', error);
  }
}
doAllThings();
```

## What are Promises in JavaScript?

**Promises** represent the eventual completion or failure of an async operation.

**States:** `pending` → `fulfilled` (resolved) or `rejected`.

**Creating a Promise:**

```javascript
let promise = new Promise((resolve, reject) => {
  // Asynchronous operation
  setTimeout(() => {
    let success = true; // Simulate success or failure
    if (success) {
      resolve('Operation was successful');
    } else {
      reject('Operation failed');
    }
  }, 2000);
});
```

**Handling:**

```javascript
promise
.then(result => {
  console.log(result); // Outputs: Operation was successful
})
.catch(error => {
  console.error(error); // Outputs: Operation failed
})
.finally(() => {
  console.log('Operation complete');
});
```

**Chaining** — each `.then()` returns a new Promise:

```javascript
promise
.then(result => {
  console.log(result);
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve('Next step done'), 1000);
  });
})
.then(nextResult => {
  console.log(nextResult);
})
.catch(error => {
  console.error('Error:', error);
});
```

**Static helpers:**

```javascript
let promise1 = Promise.resolve('First');
let promise2 = Promise.resolve('Second');
Promise.all([promise1, promise2])
.then(results => {
  console.log(results); // Outputs: ['First', 'Second']
})
.catch(error => {
  console.error('Error:', error);
});
```

```javascript
let promise1 = new Promise((resolve) => setTimeout(resolve, 100, 'First'));
let promise2 = new Promise((resolve) => setTimeout(resolve, 200, 'Second'));
Promise.race([promise1, promise2])
.then(result => {
  console.log(result); // Outputs: 'First'
});
```

```javascript
let promise1 = Promise.reject('First');
let promise2 = Promise.resolve('Second');
Promise.any([promise1, promise2])
.then(result => {
  console.log(result); // Outputs: 'Second'
})
.catch(error => {
  console.error('Error:', error);
});
```

```javascript
let promise1 = Promise.resolve('First');
let promise2 = Promise.reject('Second');
Promise.allSettled([promise1, promise2])
.then(results => {
  results.forEach(result => {
    console.log(result.status); // Outputs: 'fulfilled' or 'rejected'
    console.log(result.value || result.reason); // Outputs: result value or reason
  });
});
```

## What is a Promise Chain? How does error handling work in a Promise chain?

A **Promise chain** links `.then()` calls sequentially; each step waits for the previous Promise and can pass a value forward.

```javascript
function fetchData() {
  return new Promise((resolve) => {
    setTimeout(() => resolve('Data fetched'), 1000);
  });
}
function processData(data) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data.toUpperCase()), 1000);
  });
}
function saveData(data) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(`${data} saved`), 1000);
  });
}
fetchData()
.then(result => {
  console.log(result); // Outputs: Data fetched
  return processData(result);
})
.then(processedResult => {
  console.log(processedResult); // Outputs: DATA FETCHED
  return saveData(processedResult);
})
.then(finalResult => {
  console.log(finalResult); // Outputs: DATA FETCHED saved
});
```

**Error handling:**

1. **Global `.catch()`** — catches rejection from any prior step.

```javascript
fetchData()
.then(result => {
  console.log(result);
  return processData(result);
})
.then(processedResult => {
  console.log(processedResult);
  // Simulate an error
  return Promise.reject('An error occurred');
})
.then(finalResult => {
  console.log(finalResult);
})
.catch(error => {
  console.error('Error:', error); // Outputs: Error: An error occurred
});
```

2. **Local `.catch()`** — recover and continue the chain.

```javascript
fetchData()
.then(result => {
  console.log(result);
  return processData(result);
})
.then(processedResult => {
  console.log(processedResult);
  // Simulate an error
  return Promise.reject('An error occurred');
})
.catch(error => {
  console.error('Caught error:', error); // Outputs: Caught error: An error occurred
  return 'Recovered from error'; // Continue with a new value
})
.then(finalResult => {
  console.log(finalResult); // Outputs: Recovered from error
});
```

3. **Propagation** — unhandled rejections bubble to the next `.catch()`.

## What is the purpose of Promise.all(), Promise.race(), Promise.any(), and Promise.allSettled() in ES6?

| Method | Behavior |
|--------|----------|
| `Promise.all()` | Waits for all to resolve; rejects on first rejection |
| `Promise.race()` | Settles with the first Promise to resolve or reject |
| `Promise.any()` | Resolves on first fulfillment; rejects only if all reject |
| `Promise.allSettled()` | Waits for all to settle; returns status per Promise |

**Promise.all()** — parallel work; fail-fast on any rejection:

```javascript
const promise1 = Promise.resolve('First');
const promise2 = Promise.resolve('Second');
const promise3 = Promise.resolve('Third');
Promise.all([promise1, promise2, promise3])
.then(results => {
  console.log(results); // Outputs: ['First', 'Second', 'Third']
})
.catch(error => {
  console.error('Error:', error);
});
```

**Promise.race()** — first to settle wins:

```javascript
const promise1 = new Promise((resolve) => setTimeout(resolve, 100, 'First'));
const promise2 = new Promise((resolve) => setTimeout(resolve, 200, 'Second'));
Promise.race([promise1, promise2])
.then(result => {
  console.log(result); // Outputs: 'First' (because it resolves first)
});
```

**Promise.any()** — first success; `AggregateError` if all fail:

```javascript
const promise1 = Promise.reject('First');
const promise2 = Promise.resolve('Second');
Promise.any([promise1, promise2])
.then(result => {
  console.log(result); // Outputs: 'Second'
})
.catch(error => {
  console.error('Error:', error);
});
```

**Promise.allSettled()** — inspect every outcome:

```javascript
const promise1 = Promise.resolve('First');
const promise2 = Promise.reject('Second');
const promise3 = Promise.resolve('Third');
Promise.allSettled([promise1, promise2, promise3])
.then(results => {
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      console.log('Success:', result.value);
    } else {
      console.error('Failure:', result.reason);
    }
  });
});
```

## What is the purpose of async/await? Compare it with Promises?

**async/await** is syntactic sugar over Promises — write async code that reads like synchronous code with familiar `try/catch` error handling.

**Promises** — chain `.then()` / `.catch()`:

```javascript
fetchData()
.then(result => processData(result))
.then(processed => saveData(processed))
.then(() => console.log('All done'))
.catch(error => console.error('Error:', error));
```

**Async/Await** — linear flow:

```javascript
async function doAll() {
  try {
    const result = await fetchData();
    const processed = await processData(result);
    await saveData(processed);
    console.log('All done');
  } catch (error) {
    console.error('Error:', error);
  }
}
doAll();
```

| Aspect | Promises | async/await |
|--------|----------|-------------|
| Syntax | `.then()` chains | `await` pauses in `async` function |
| Errors | `.catch()` at end | `try/catch` |
| Readability | Nesting on complex flows | Linear, synchronous style |
| Under the hood | Native | Built on Promises |

Both are compatible; async/await is preferred for application code, Promises remain fundamental in APIs and libraries.

## Can we use async without await and vice versa?

**async without await** — valid; `async` always returns a Promise. A returned value is auto-wrapped.

```javascript
async function getNumber() {
  return 42;
}
getNumber().then(result => console.log(result)); // Outputs: 42
```

**await without async** — invalid; `await` only works inside `async` functions (or top-level modules).

```javascript
function fetchData() {
  return new Promise(resolve => setTimeout(() => resolve('Data'), 1000));
}
async function getData() {
  const data = await fetchData();
  console.log(data);
}
getData(); // Outputs: Data after 1 second
```

- `async` — returns a Promise; thrown errors become rejections.
- `await` — pauses the `async` function until the Promise settles.

## How do you handle errors in async/await functions?

Wrap `await` calls in **`try/catch`**:

```javascript
async function fetchData() {
  // Simulating an async operation that may fail
  return new Promise((resolve, reject) => {
    setTimeout(() => reject('Failed to fetch data'), 1000);
  });
}
async function getData() {
  try {
    const result = await fetchData(); // Await the asynchronous operation
    console.log(result); // This line won't run if an error occurs
  } catch (error) {
    console.error('Error:', error); // Handle the error
  }
}
getData();
```

**Multiple awaits** — one `try/catch` catches any rejection:

```javascript
async function fetchData1() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve('Data 1'), 1000);
  });
}
async function fetchData2() {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject('Failed to fetch data 2'), 1000);
  });
}
async function getData() {
  try {
    const data1 = await fetchData1();
    console.log(data1);
    const data2 = await fetchData2(); // This will cause an error
    console.log(data2);
  } catch (error) {
    console.error('Error:', error); // Handles errors from either fetchData1 or fetchData2
  }
}
getData();
```

**Granular handling** — separate `try/catch` per operation:

```javascript
async function fetchData1() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve('Data 1'), 1000);
  });
}
async function fetchData2() {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject('Failed to fetch data 2'), 1000);
  });
}
async function getData() {
  try {
    const data1 = await fetchData1();
    console.log(data1);
  } catch (error) {
    console.error('Error fetching data 1:', error);
  }
  try {
    const data2 = await fetchData2();
    console.log(data2);
  } catch (error) {
    console.error('Error fetching data 2:', error);
  }
}
getData();
```

## What is the event loop and how does it relate to the call stack, microtask queue, and macrotask queue?

The **event loop** enables non-blocking async behavior in single-threaded JavaScript.

| Component | Role |
|-----------|------|
| **Call stack** | Runs synchronous code (LIFO) |
| **Microtask queue** | Promise callbacks, `MutationObserver` — drained after each task, before macrotasks |
| **Macrotask queue** | `setTimeout`, I/O, UI events — one task per loop iteration |

**Loop order:** run sync code → drain all microtasks → run one macrotask → repeat.

```javascript
console.log('Start');
setTimeout(() => {
  console.log('Macrotask 1');
}, 0);
setTimeout(() => {
  console.log('Macrotask 2');
}, 0);
Promise.resolve()
.then(() => console.log('Microtask 1'))
.then(() => console.log('Microtask 2'));
console.log('End');
```

**Output:**

Start

End

Microtask 1

Microtask 2

Macrotask 1

Macrotask 2

## How does Promise.prototype.finally() work in handling cleanup tasks?

**`finally()`** runs a callback after fulfillment or rejection — ideal for cleanup (hide spinners, close connections) without duplicating logic in `.then()` and `.catch()`.

- Takes no arguments; does not change the settled value.
- Returns a new Promise with the same outcome; chainable.

```javascript
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve('Data'), 1000);
  });
}
fetchData()
.then(result => {
  console.log('Result:', result);
  // Process the result
})
.catch(error => {
  console.error('Error:', error);
  // Handle the error
})
.finally(() => {
  console.log('Cleanup tasks');
  // Perform cleanup tasks, like hiding loading indicators
});
```

**Chaining after `finally()`** — subsequent `.then()` receives the original value:

```javascript
fetchData()
.then(result => {
  console.log('Result:', result);
})
.catch(error => {
  console.error('Error:', error);
})
.finally(() => {
  console.log('Cleanup tasks');
})
.then(() => {
  console.log('Additional processing');
});
```

---

## Related Topics

- **React HTTP and Data Fetching** (`React/`)
- **RxJS Basics** (`Angular/`)
