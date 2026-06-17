**7. Browser API & Web Storage**

1.  What is the window object?

2.  What are Browser APIs in JavaScript?

3.  What is Web Storage, and its use? How many types of web storage are there?

<!-- -->

1.  **What is the window object?**

The window object is a global object in the browser's JavaScript environment. It represents the browser window or tab and provides access to various properties, methods, and functionalities that are essential for interacting with the web page and the browser environment.

**Key Features of the window Object**

1.  **Global Scope**:

    - The window object is the global context in which all JavaScript code runs. Variables and functions declared in the global scope are properties of the window object.

2.  **Browser Interaction**:

    - The window object provides methods and properties to interact with the browser and the web page. This includes features such as managing the browser's history, opening new windows, and interacting with the document.

3.  **Properties**:

    - **window.document**: Represents the DOM of the current web page.

    - **window.location**: Contains information about the current URL and allows navigation to different URLs.

    - **window.navigator**: Provides information about the browser and the user's environment.

    - **window.localStorage** and **window.sessionStorage**: Allow for client-side storage of data.

    - **window.console**: Provides access to the browser's console for logging and debugging.

4.  **Methods**:

    - **window.alert()**: Displays an alert dialog with a message.

    - **window.confirm()**: Displays a confirmation dialog with OK and Cancel buttons.

    - **window.prompt()**: Displays a prompt dialog that allows user input.

    - **window.open()**: Opens a new browser window or tab.

    - **window.close()**: Closes the current browser window or tab (if it was opened by window.open()).

5.  **Event Handling**:

    - The window object can be used to handle global events such as resizing the browser window, scrolling, or key presses.

**Examples**

**Accessing Window Properties**:

console.log(window.location.href); // Logs the current URL

console.log(window.innerWidth); // Logs the width of the browser window

**Using Window Methods**:

// Display an alert

window.alert('Hello, world!');

// Open a new window

window.open('https://example.com', '\_blank');

// Get user input via prompt

const userInput = window.prompt('Enter your name:');

console.log('User entered:', userInput);

**Handling Global Events**:

// Handle window resize

window.addEventListener('resize', () =\> {

console.log('Window resized to:', window.innerWidth, 'x', window.innerHeight);

});

**Summary**

- **window Object**: The global object representing the browser window or tab, providing access to properties, methods, and functionalities for interacting with the web page and browser environment.

- **Properties**: Includes document, location, navigator, localStorage, and sessionStorage.

- **Methods**: Includes alert(), confirm(), prompt(), open(), and close().

- **Event Handling**: Can be used to handle global events like resizing and scrolling.

The window object serves as the primary interface for interacting with the browser environment and the web page, providing essential tools for web development.

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

**2. What are Browser APIs in JavaScript?**

**Browser APIs** in JavaScript are interfaces provided by the web browser that allow developers to interact with and manipulate various features and functionalities of the web environment. These APIs extend JavaScript's capabilities beyond basic language features, enabling complex interactions with the browser and the web page.

**Categories of Browser APIs**

1.  **Document and DOM APIs**:

    - **document**: The document object represents the web page's DOM and provides methods for manipulating HTML elements.

    - **DOM Methods**: Methods such as getElementById(), querySelector(), and createElement() allow for dynamic changes to the web page's content and structure.

2.  **Window and Global APIs**:

    - **window**: The window object provides methods for interacting with the browser window or tab, such as alert(), prompt(), and open().

    - **window.localStorage** and **window.sessionStorage**: APIs for client-side storage, allowing data to be stored and retrieved across sessions or within the same session.

3.  **Network APIs**:

    - **Fetch API**: Provides a modern way to make network requests, replacing older methods like XMLHttpRequest.

    - **XMLHttpRequest**: An older method for making HTTP requests and handling responses asynchronously.

4.  **Geolocation API**:

    - **navigator.geolocation**: Provides access to the user's geographic location, allowing location-based features and services.

5.  **Web Storage APIs**:

    - **localStorage**: Stores data with no expiration time, persisting across sessions and page reloads.

    - **sessionStorage**: Stores data for the duration of the page session, expiring when the page is closed.

6.  **Canvas API**:

    - **CanvasRenderingContext2D**: Provides methods for drawing and manipulating graphics on a \<canvas\> element.

7.  **Web Audio API**:

    - **AudioContext**: Provides a way to create and manipulate audio in web applications, including sound effects, music, and audio analysis.

8.  **Web Workers API**:

    - **Worker**: Allows running JavaScript code in the background, enabling parallel execution and improving performance for complex tasks.

9.  **Service Workers API**:

    - **ServiceWorker**: Provides a way to intercept and cache network requests, enabling offline capabilities and improving performance.

10. **WebRTC API**:

    - **RTCPeerConnection**: Facilitates real-time communication, including audio, video, and data sharing between peers in a web application.

11. **Web Push API**:

    - **PushManager**: Allows web applications to receive push notifications even when the application is not active.

**Examples**

**Fetch API Example**:

fetch('https://api.example.com/data')

.then(response =\> response.json())

.then(data =\> console.log(data))

.catch(error =\> console.error('Error:', error));

**Geolocation API Example**:

navigator.geolocation.getCurrentPosition((position) =\> {

console.log('Latitude:', position.coords.latitude);

console.log('Longitude:', position.coords.longitude);

}, (error) =\> {

console.error('Error:', error);

});

**Canvas API Example**:

\<canvas id="myCanvas" width="200" height="100"\>\</canvas\>

\<script\>

const canvas = document.getElementById('myCanvas');

const context = canvas.getContext('2d');

context.fillStyle = 'blue';

context.fillRect(10, 10, 150, 80);

\</script\>

**Web Audio API Example**:

const audioContext = new (window.AudioContext \|\| window.webkitAudioContext)();

const oscillator = audioContext.createOscillator();

oscillator.type = 'sine';

oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note

oscillator.connect(audioContext.destination);

oscillator.start();

oscillator.stop(audioContext.currentTime + 1); // Play sound for 1 second

**Summary**

- **Browser APIs**: Provide interfaces and methods to interact with various aspects of the browser environment and the web page.

- **Categories**: Include Document and DOM APIs, Network APIs, Geolocation API, Web Storage APIs, Canvas API, Web Audio API, Web Workers API, Service Workers API, WebRTC API, and Web Push API.

- **Usage**: Enable advanced web functionalities, such as network requests, location services, graphical rendering, background processing, and real-time communication.

Browser APIs enhance the capabilities of web applications, allowing developers to build rich, interactive, and performant web experiences.

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

**3. What is Web Storage, and its use? How many types of web storage are there?**

**Web Storage** is a set of web APIs that provides a way for web applications to store data persistently on the client side (i.e., in the user's browser). It allows data to be saved and retrieved across page reloads and browser sessions, making it useful for managing user preferences, caching data, and maintaining application state.

**Types of Web Storage**

There are two main types of Web Storage:

1.  **Local Storage**:

    - **Purpose**: Stores data with no expiration time. The data persists even when the browser is closed and reopened.

    - **Scope**: Data stored in Local Storage is specific to the domain and is accessible only by pages from the same origin (protocol, domain, and port).

    - **API**:

      - **localStorage.setItem(key, value)**: Stores data with a specified key.

      - **localStorage.getItem(key)**: Retrieves data by key.

      - **localStorage.removeItem(key)**: Removes data by key.

      - **localStorage.clear()**: Clears all data for the origin.

> **Example**:
>
> // Store data
>
> localStorage.setItem('username', 'JohnDoe');
>
> // Retrieve data
>
> const username = localStorage.getItem('username');
>
> console.log(username); // Output: JohnDoe
>
> // Remove data
>
> localStorage.removeItem('username');
>
> // Clear all data
>
> localStorage.clear();

2.  **Session Storage**:

    - **Purpose**: Stores data for the duration of the page session. Data is available while the page is open, including across page reloads and navigation, but is cleared when the page session ends (i.e., when the browser tab or window is closed).

    - **Scope**: Data stored in Session Storage is specific to the domain and accessible only by pages from the same origin, similar to Local Storage.

    - **API**:

      - **sessionStorage.setItem(key, value)**: Stores data with a specified key.

      - **sessionStorage.getItem(key)**: Retrieves data by key.

      - **sessionStorage.removeItem(key)**: Removes data by key.

      - **sessionStorage.clear()**: Clears all data for the session.

> **Example**:
>
> // Store data
>
> sessionStorage.setItem('sessionId', 'abc123');
>
> // Retrieve data
>
> const sessionId = sessionStorage.getItem('sessionId');
>
> console.log(sessionId); // Output: abc123
>
> // Remove data
>
> sessionStorage.removeItem('sessionId');
>
> // Clear all data
>
> sessionStorage.clear();

**Use Cases**

1.  **User Preferences**:

    - Store user settings or preferences, such as theme choices, language settings, or user credentials, to personalize the user experience.

2.  **Form Data**:

    - Save form data temporarily, so users don’t lose their input if they navigate away from the page and return later.

3.  **Caching**:

    - Cache data locally to improve performance and reduce the need for repeated network requests.

4.  **Session Management**:

    - Manage session information, such as user login status, without needing to use server-side storage.

5.  **Application State**:

    - Maintain state information across page reloads or within a single session, which can be particularly useful for single-page applications (SPAs).

**Summary**

- **Web Storage**: A mechanism for storing data on the client side within the browser.

- **Types**:

  - **Local Storage**: Persists data across browser sessions and page reloads.

  - **Session Storage**: Stores data for the duration of the page session and is cleared when the tab or window is closed.

- **Use Cases**: Include user preferences, form data persistence, caching, session management, and application state management.

Web Storage provides a straightforward way to handle client-side data, enhancing the user experience and application performance.
