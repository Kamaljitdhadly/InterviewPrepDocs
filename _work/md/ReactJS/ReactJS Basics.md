## 1. What is React and why was it created?

**React** is a JavaScript library for building user interfaces,
especially for single-page applications (SPAs). It focuses on building
reusable UI components and efficiently updating the DOM when data
changes.

It was developed by **Jordan Walke** at **Facebook** (now **Meta
Platforms**) and first released in 2013.

### Why was React created?

Before React, building large, dynamic applications had several
challenges:

- Frequent manual DOM manipulation

- Complex UI updates

- Difficult state management

- Poor performance in large applications

- Hard-to-maintain codebases

Facebook needed a better way to handle:

- Constant UI updates (like news feeds, notifications, chats)

- Large-scale, dynamic user interfaces

- Performance optimization

React was created to solve these problems by introducing:

1.  **Component-based architecture** -- Break UI into reusable pieces.

2.  **Virtual DOM** -- Efficient DOM updates.

3.  **Declarative programming model** -- Describe what UI should look
    like instead of how to update it.

### Simple Example

Without React (imperative approach):

document.getElementById(\"counter\").innerText = count;

With React (declarative approach):

function Counter({ count }) {\
return \<h1\>{count}\</h1\>;\
}

You just describe UI based on state. React handles DOM updates
automatically.

## 2. Core Principles of React

React is built on a few fundamental principles:

### 1. Declarative UI

In React, you describe **what** the UI should look like for a given
state.

Instead of writing logic like:

- If this changes → update that element → remove that node → add this
  class

You simply define:

return \<h1\>{count}\</h1\>;

When count changes, React automatically updates the DOM.

This makes code:

- Easier to read

- Easier to debug

- More predictable

### 2. Component-Based Architecture

Everything in React is a component.

Example:

function Header() {\
return \<h1\>My App\</h1\>;\
}\
\
function App() {\
return (\
\<div\>\
\<Header /\>\
\</div\>\
);\
}

Benefits:

- Reusability

- Separation of concerns

- Maintainability

- Better testing

Large applications become easier to manage because UI is broken into
small, independent pieces.

### 3. Virtual DOM

React does not directly manipulate the real DOM.

Instead:

1.  It creates a **Virtual DOM** (lightweight JS object representation).

2.  When state changes, it creates a new Virtual DOM.

3.  It compares (diffs) old and new Virtual DOM.

4.  It updates only the changed parts in the real DOM.

This makes React:

- Fast

- Efficient

- Optimized for performance

### 4. Unidirectional Data Flow (One-Way Data Binding)

Data flows from:\
Parent → Child via props

Example:

function Child({ name }) {\
return \<h1\>{name}\</h1\>;\
}\
\
function Parent() {\
return \<Child name=\"Kamal\" /\>;\
}

Benefits:

- Predictable data flow

- Easier debugging

- Better state control

### 5. Reusability Through Composition

React prefers composition over inheritance.

Instead of creating complex inheritance trees, you compose components
together.

function Layout({ children }) {\
return \<div className=\"layout\"\>{children}\</div\>;\
}

This makes applications:

- Flexible

- Cleaner

- Easier to extend

## 3. What is the Virtual DOM and how does it work?

### What is Virtual DOM?

The **Virtual DOM** is a lightweight JavaScript representation of the
real DOM.

Instead of directly updating the browser DOM (which is slow and
expensive), React updates this virtual copy first.

React introduced this concept to optimize performance and avoid
unnecessary DOM manipulations.

### Why not update the real DOM directly?

Real DOM operations are expensive because:

- Browser must reflow (recalculate layout)

- Browser must repaint (update pixels on screen)

- Frequent updates reduce performance in large applications

React solves this by minimizing direct DOM updates.

### How Virtual DOM Works (Step-by-Step)

When you use React (from **Meta Platforms**):

#### Step 1: Initial Render

React creates a Virtual DOM tree from your components.

Example:

function App() {\
return \<h1\>Hello\</h1\>;\
}

React creates a Virtual DOM object like:

{\
type: \"h1\",\
props: { children: \"Hello\" }\
}

Then it renders this to the real DOM.

#### Step 2: State Change Occurs

Suppose state changes:

\<h1\>Hello Kamal\</h1\>

React creates a **new Virtual DOM tree**.

#### Step 3: Diffing

React compares:\
Old Virtual DOM\
vs\
New Virtual DOM

It identifies what changed.

In this case:\
Only text content changed.

#### Step 4: Minimal Real DOM Update

React updates only the changed part in the real DOM.

Instead of re-rendering the whole page, it updates just:

\<h1\>Hello Kamal\</h1\>

This makes React fast and efficient.

### Why Virtual DOM is Important

- Reduces direct DOM manipulation

- Improves performance

- Enables predictable UI updates

- Makes large applications scalable

## 4. What is Reconciliation in React and why is it needed?

### What is Reconciliation?

Reconciliation is the process by which React updates the DOM when a
component's state or props change.

It is the algorithm React uses to:

- Compare old Virtual DOM

- Compare new Virtual DOM

- Decide what needs to change in the real DOM

This comparison process is also called **diffing**.

### Why is Reconciliation Needed?

Without reconciliation:

- Every state change would re-render the entire DOM

- Performance would degrade

- Large applications would become slow

Reconciliation ensures:

- Only necessary changes are applied

- UI stays fast and responsive

- DOM operations are minimized

### How Reconciliation Works (Core Rules)

React follows certain assumptions to optimize comparison:

#### 1. Different element types → Replace entire subtree

\<div\>\
\<h1\>Hello\</h1\>\
\</div\>

becomes

\<span\>\
\<h1\>Hello\</h1\>\
\</span\>

React destroys the old tree and builds a new one.

#### 2. Same element type → Update attributes only

\<h1 className=\"red\"\>Hello\</h1\>

becomes

\<h1 className=\"blue\"\>Hello\</h1\>

React updates only the className.

#### 3. Lists use keys for efficient updates

When rendering lists:

items.map(item =\> \<li key={item.id}\>{item.name}\</li\>)

The key helps React:

- Identify which items changed

- Avoid unnecessary re-renders

- Reorder efficiently

Without keys, React may re-render more elements than necessary.

### Relationship Between Virtual DOM and Reconciliation

- Virtual DOM is the data structure.

- Reconciliation is the algorithm that compares Virtual DOM trees.

- The result is minimal updates to the real DOM.

## 5. How does React's Diffing Algorithm work?

React's **diffing algorithm** is the mechanism used during
reconciliation to compare the old Virtual DOM tree with the new Virtual
DOM tree and determine the minimal set of changes needed in the real
DOM.

A naive tree comparison would take **O(n³)** time complexity, which is
too slow for large applications. React optimizes this by making a few
smart assumptions.

### Core Assumptions of React's Diffing Algorithm

React's implementation (inside **Meta Platforms**'s React library)
follows two important rules:

### 1. Elements of Different Types Produce Different Trees

If the element type changes, React destroys the old subtree and creates
a new one.

Example:

\<div\>\
\<h1\>Hello\</h1\>\
\</div\>

becomes

\<span\>\
\<h1\>Hello\</h1\>\
\</span\>

Since div and span are different types:

- Old tree is removed

- New tree is created

- Child components are destroyed and remounted

This is fast because React does not deeply compare everything.

### 2. Same Type Elements Are Compared Attribute-by-Attribute

If element type is the same:

\<h1 className=\"red\"\>Hello\</h1\>

becomes

\<h1 className=\"blue\"\>Hello\</h1\>

React:

- Keeps the same DOM node

- Updates only the changed attribute (className)

- Keeps child nodes intact if unchanged

### 3. Lists Are Compared Using Keys

When rendering lists:

items.map(item =\> \<li key={item.id}\>{item.name}\</li\>)

Keys help React:

- Identify which items were added

- Identify which items were removed

- Identify which items moved

Without keys:

- React compares items by index

- Reordering may cause unnecessary re-renders

With proper keys:

- React efficiently reorders DOM nodes

- Avoids destroying and recreating unchanged items

### Step-by-Step Example

Initial render:

\<ul\>\
\<li key=\"1\"\>A\</li\>\
\<li key=\"2\"\>B\</li\>\
\</ul\>

After update:

\<ul\>\
\<li key=\"2\"\>B\</li\>\
\<li key=\"1\"\>A\</li\>\
\</ul\>

Because keys exist:

- React understands items were reordered

- It moves DOM nodes instead of recreating them

### Why React's Diffing Is Fast

Instead of deep tree comparison:

- It compares elements level-by-level

- It uses element type as a quick decision rule

- It uses keys for list optimization

This reduces complexity roughly to **O(n)**.

## 6. What are Components in React?

Components are the building blocks of a React application.

A component is a reusable, independent piece of UI that returns React
elements describing what should appear on the screen.

Everything in React is built using components.

### Types of Components

### 1. Functional Components (Modern & Recommended)

These are JavaScript functions that return JSX.

function Greeting(props) {\
return \<h1\>Hello {props.name}\</h1\>;\
}

Characteristics:

- Simple and readable

- Use Hooks for state and lifecycle

- Preferred in modern React development

### 2. Class Components (Older Approach)

import React, { Component } from \"react\";\
\
class Greeting extends Component {\
render() {\
return \<h1\>Hello {this.props.name}\</h1\>;\
}\
}

Characteristics:

- Use this

- Have lifecycle methods

- More boilerplate than functional components

Functional components with Hooks have mostly replaced class components
in modern applications.

### Key Characteristics of Components

### 1. Reusable

You can use a component multiple times:

\<Greeting name=\"Kamal\" /\>\
\<Greeting name=\"John\" /\>

### 2. Composable

Components can contain other components:

function App() {\
return (\
\<div\>\
\<Greeting name=\"Kamal\" /\>\
\</div\>\
);\
}

### 3. Isolated

Each component manages its own:

- State

- Logic

- UI

This makes large applications easier to maintain.

### 4. Declarative

Components describe what the UI should look like based on state and
props.

## 7. What is the difference between Functional and Class Components?

In React, components can be created using **functions** or **classes**.
While both achieve similar outcomes, they differ in syntax, state
handling, lifecycle management, and modern usage.

## 1. Syntax Difference

### Functional Component

A simple JavaScript function that returns JSX.

function Greeting(props) {\
return \<h1\>Hello {props.name}\</h1\>;\
}

### Class Component

A JavaScript class that extends React.Component.

import React, { Component } from \"react\";\
\
class Greeting extends Component {\
render() {\
return \<h1\>Hello {this.props.name}\</h1\>;\
}\
}

Key Difference:

- Functional components are simpler and cleaner.

- Class components require this, render(), and more boilerplate.

## 2. State Management

### Functional Component (Using Hooks)

Before React 16.8, functional components could not manage state.\
After the introduction of Hooks in React 16.8 (developed by **Meta
Platforms**), they can manage state.

import { useState } from \"react\";\
\
function Counter() {\
const \[count, setCount\] = useState(0);\
\
return (\
\<button onClick={() =\> setCount(count + 1)}\>\
{count}\
\</button\>\
);\
}

### Class Component (Using this.state)

class Counter extends React.Component {\
constructor(props) {\
super(props);\
this.state = { count: 0 };\
}\
\
render() {\
return (\
\<button onClick={() =\> this.setState({ count: this.state.count + 1
})}\>\
{this.state.count}\
\</button\>\
);\
}\
}

Key Difference:

- Functional components use Hooks (useState, useEffect).

- Class components use this.state and this.setState().

## 3. Lifecycle Handling

### Class Components

Use lifecycle methods:

- componentDidMount

- componentDidUpdate

- componentWillUnmount

### Functional Components

Use useEffect Hook to handle lifecycle behavior.

import { useEffect } from \"react\";\
\
useEffect(() =\> {\
console.log(\"Component mounted\");\
\
return () =\> {\
console.log(\"Component unmounted\");\
};\
}, \[\]);

Functional components simplify lifecycle management by combining related
logic into one place.

## 4. Performance & Readability

Functional components:

- Less boilerplate

- Easier to read

- Easier to test

- Encouraged in modern React

Class components:

- More verbose

- Harder to maintain in large applications

## 5. Current Recommendation

Modern React development prefers **functional components with Hooks**.\
Class components are still supported but are mostly considered legacy
for new development.

### Quick Comparison Table

  ------------------------------------------
  **Feature**   **Functional   **Class
                Component**    Component**
  ------------- -------------- -------------
  Syntax        Simple         ES6 class
                function       

  State         useState Hook  this.state

  Lifecycle     useEffect      Lifecycle
                               methods

  this keyword  Not used       Required

  Boilerplate   Minimal        More

  Modern usage  Recommended    Legacy
                               approach
  ------------------------------------------

## 8. What is JSX and why is it used?

### What is JSX?

JSX stands for **JavaScript XML**.

It is a syntax extension that allows you to write HTML-like code inside
JavaScript.

Example:

const element = \<h1\>Hello World\</h1\>;

Although it looks like HTML, it is actually JavaScript.

JSX is not understood directly by browsers. It gets transpiled
(converted) into React.createElement() calls.

### JSX Behind the Scenes

This JSX:

const element = \<h1\>Hello\</h1\>;

Is converted into:

const element = React.createElement(\"h1\", null, \"Hello\");

So JSX is just syntactic sugar over React.createElement().

## Why JSX is Used

### 1. Improves Readability

Without JSX:

React.createElement(\"h1\", null, \"Hello\");

With JSX:

\<h1\>Hello\</h1\>

JSX makes UI structure easier to understand.

### 2. Declarative UI

JSX allows you to describe UI in a natural way.

function Greeting({ name }) {\
return \<h1\>Hello {name}\</h1\>;\
}

This clearly shows how UI depends on data.

### 3. Embedding JavaScript Inside HTML

You can write JavaScript expressions inside {}.

const name = \"Kamal\";\
\<h1\>Hello {name}\</h1\>

You can use:

- Variables

- Functions

- Conditions

- Ternary operators

- Array mapping

Example:

{isLoggedIn ? \<Dashboard /\> : \<Login /\>}

### 4. Prevents Injection Attacks

JSX automatically escapes values before rendering.\
This helps prevent common security issues like XSS attacks.

### Important Rules of JSX

1.  Must return a single parent element.

2.  Use className instead of class.

3.  Use camelCase for attributes (e.g., onClick).

4.  JavaScript expressions go inside {}.

## 9. How does React render elements to the DOM?

React renders elements to the DOM using a structured process that
involves:

1.  Creating React elements

2.  Building a Virtual DOM

3.  Reconciling differences

4.  Updating the real DOM efficiently

Let's understand this step by step.

## Step 1: Creating React Elements

When you write JSX:

const element = \<h1\>Hello\</h1\>;

It is transformed into:

React.createElement(\"h1\", null, \"Hello\");

This creates a plain JavaScript object representing the UI.

## Step 2: Rendering to the Root

In modern React (React 18):

import React from \"react\";\
import ReactDOM from \"react-dom/client\";\
\
const root = ReactDOM.createRoot(document.getElementById(\"root\"));\
root.render(\<App /\>);

Here:

- createRoot() creates a root container.

- render() tells React to render the component tree inside that
  container.

## Step 3: Virtual DOM Creation

React builds a **Virtual DOM tree**, which is a lightweight JavaScript
representation of the UI.

It does not immediately manipulate the real DOM.

## Step 4: Reconciliation (Diffing)

When state or props change:

- React creates a new Virtual DOM tree.

- It compares it with the previous Virtual DOM.

- It calculates the minimal changes needed.

This process is called reconciliation.

## Step 5: Updating the Real DOM

After comparison:

- React updates only the changed parts in the real DOM.

- It avoids re-rendering the entire page.

Example:

Initial:

\<h1\>Hello\</h1\>

After state update:

\<h1\>Hello Kamal\</h1\>

React updates only the text node, not the entire \<h1\> element.

## What Makes This Efficient?

- Virtual DOM

- Optimized diffing algorithm

- Batched state updates

- Smart reconciliation rules

React ensures minimal and predictable DOM operations.

## Rendering Phases in React

### 1. Render Phase

- React calculates what changes are needed.

- No DOM updates yet.

### 2. Commit Phase

- React applies changes to the real DOM.

- Browser repaints.

This separation improves performance and predictability.

## 10. What is the purpose of key in lists?

When rendering lists in React, the key prop helps React identify which
items have changed, been added, or removed.

## Example Without Key

items.map(item =\> \<li\>{item.name}\</li\>);

Problem:

- React uses index by default.

- Reordering can cause unnecessary re-renders.

- May lead to incorrect UI behavior.

## Example With Key

items.map(item =\> (\
\<li key={item.id}\>{item.name}\</li\>\
));

Now React can:

- Track each element uniquely

- Identify which item changed

- Reorder efficiently

- Avoid unnecessary DOM updates

## Why Keys Are Important

### 1. Efficient Reconciliation

When list changes:

Before:

\[A, B, C\]

After:

\[B, A, C\]

With proper keys:

- React understands items were reordered.

- It moves DOM nodes instead of destroying and recreating them.

Without keys:

- React may re-render multiple items unnecessarily.

### 2. Preserving Component State

If components inside a list have internal state:

Proper keys ensure:

- State stays attached to the correct item.

Incorrect keys (like index) can cause:

- State mixing

- UI bugs

## Rules for Keys

1.  Keys must be unique among siblings.

2.  Keys should be stable (do not change between renders).

3.  Avoid using array index if items can reorder.

4.  Prefer unique IDs from data (e.g., database ID).

## When Using Index as Key Is Safe

Using index as key is acceptable if:

- List is static

- Items never reorder

- Items are never inserted or deleted

Otherwise, always use a unique identifier.

## 11. What are Props in React?

**Props** (short for *properties*) are inputs passed from a parent
component to a child component in React.

They allow components to be:

- Reusable

- Dynamic

- Configurable

Props are passed as attributes in JSX.

## Basic Example

### Parent Component

function App() {\
return \<Greeting name=\"Kamal\" age={30} /\>;\
}

### Child Component

function Greeting(props) {\
return (\
\<h1\>\
Hello {props.name}, Age: {props.age}\
\</h1\>\
);\
}

Here:

- name and age are props.

- They are passed from App to Greeting.

## Props with Destructuring (Recommended)

function Greeting({ name, age }) {\
return \<h1\>Hello {name}, Age: {age}\</h1\>;\
}

This makes the code cleaner and easier to read.

## Key Characteristics of Props

### 1. Passed from Parent to Child

Data flows in one direction:\
Parent → Child

This follows React's unidirectional data flow principle.

### 2. Read-Only Inside Child

A child component receives props but does not own them.\
It cannot change them.

### 3. Can Pass Different Types

You can pass:

- Strings

- Numbers

- Booleans

- Arrays

- Objects

- Functions

- Components

Example:

function Button({ onClick }) {\
return \<button onClick={onClick}\>Click\</button\>;\
}

Here, a function is passed as a prop.

### 4. Props Enable Reusability

\<Greeting name=\"Kamal\" /\>\
\<Greeting name=\"John\" /\>\
\<Greeting name=\"Aman\" /\>

Same component, different data.

## 12. Are Props Mutable or Immutable?

Props are **immutable**.

That means:

- A component cannot modify its own props.

- Props are read-only.

## Why Are Props Immutable?

React enforces immutability to ensure:

- Predictable UI behavior

- Easier debugging

- Efficient reconciliation

- Clear data flow

If props were mutable, components could change external data
unpredictably.

## Incorrect Example (Do Not Do This)

function Greeting(props) {\
props.name = \"Changed\"; // ❌ Not allowed\
return \<h1\>{props.name}\</h1\>;\
}

This breaks React's design principles.

## Correct Approach

If data needs to change:

- The parent should manage state.

- The parent updates state.

- New props are passed down.

Example:

function Parent() {\
const \[name, setName\] = React.useState(\"Kamal\");\
\
return (\
\<\>\
\<Greeting name={name} /\>\
\<button onClick={() =\> setName(\"John\")}\>\
Change Name\
\</button\>\
\</\>\
);\
}

Here:

- Parent owns the state.

- When state changes, new props are sent to Greeting.

## Props vs State (Important Difference)

  ---------------------------------------
  **Feature**   **Props**   **State**
  ------------- ----------- -------------
  Owned by      Parent      Component
                            itself

  Mutable?      No          Yes

  Purpose       Pass data   Manage
                            internal data

  Modified by   Parent      setState /
                            useState
  ---------------------------------------

## 13. What is Prop Drilling and why is it a problem?

### What is Prop Drilling?

**Prop drilling** is the process of passing props through multiple
intermediate components just to reach a deeply nested child component.

Even if intermediate components do not use the data, they must pass it
down.

### Example of Prop Drilling

function App() {\
const user = \"Kamal\";\
return \<Parent user={user} /\>;\
}\
\
function Parent({ user }) {\
return \<Child user={user} /\>;\
}\
\
function Child({ user }) {\
return \<GrandChild user={user} /\>;\
}\
\
function GrandChild({ user }) {\
return \<h1\>Hello {user}\</h1\>;\
}

Here:

- Parent and Child do not use user.

- They only forward it.

- This is prop drilling.

## Why Is Prop Drilling a Problem?

### 1. Unnecessary Complexity

Intermediate components become cluttered with props they do not need.

### 2. Reduced Maintainability

If you rename or modify a prop:

- You must update it at multiple levels.

- This increases the risk of bugs.

### 3. Harder to Scale

In large applications with deep component trees:

- Passing many props becomes difficult to manage.

### 4. Tight Coupling

Components become dependent on props they do not actually use.

## How to Avoid Prop Drilling

### 1. Context API

React provides Context to share data globally without passing props
manually at every level.

const UserContext = React.createContext();

Then wrap components and access values directly where needed.

### 2. State Management Libraries

For large applications, tools like:

- Redux

- Zustand

- Recoil

Help manage shared state centrally.

### In Simple Terms

Prop drilling = Passing props through multiple layers unnecessarily

It becomes a problem when:

- Component hierarchy grows

- Many shared values exist

- Code becomes difficult to maintain

## 14. How do you pass data from child to parent components?

In React, data flows from **parent to child** by default (via props).

To send data from **child to parent**, you pass a function from parent
to child as a prop.

The child calls that function with data.

## Step-by-Step Example

### Step 1: Parent Defines Function

function Parent() {\
const \[message, setMessage\] = React.useState(\"\");\
\
const receiveData = (data) =\> {\
setMessage(data);\
};\
\
return (\
\<\>\
\<Child sendData={receiveData} /\>\
\<h2\>{message}\</h2\>\
\</\>\
);\
}

### Step 2: Child Calls the Function

function Child({ sendData }) {\
return (\
\<button onClick={() =\> sendData(\"Hello from Child\")}\>\
Send Data\
\</button\>\
);\
}

## How It Works

1.  Parent creates a function (receiveData).

2.  Parent passes it as a prop (sendData).

3.  Child calls that function.

4.  Parent updates its state.

5.  UI re-renders.

## Why This Works

- State lives in the parent.

- Parent controls data.

- Child communicates via callback.

This follows React's unidirectional data flow principle.

## 15. What is defaultProps and when would you use it?

### What is defaultProps?

defaultProps is a way to define default values for props in a React
component.

If a prop is not provided by the parent, React will use the default
value instead.

## Example Using defaultProps (Traditional Way)

function Greeting(props) {\
return \<h1\>Hello {props.name}\</h1\>;\
}\
\
Greeting.defaultProps = {\
name: \"Guest\"\
};

If used like this:

\<Greeting /\>

Output will be:

Hello Guest

Because name was not provided, it falls back to \"Guest\".

## Modern Approach (Recommended)

In modern React, especially with functional components, default
parameters are preferred:

function Greeting({ name = \"Guest\" }) {\
return \<h1\>Hello {name}\</h1\>;\
}

This is cleaner and more aligned with modern JavaScript.

## When Would You Use Default Props?

You use default props when:

### 1. Providing Fallback Values

To prevent undefined errors when a prop is not passed.

### 2. Making Components More Robust

It ensures the component works even if the parent forgets to pass
certain props.

### 3. Defining Optional Props

Some props may not always be required.

Example:

function Button({ type = \"button\", text = \"Click\" }) {\
return \<button type={type}\>{text}\</button\>;\
}

## Important Notes

- defaultProps is mostly used with class components.

- For functional components, default parameters are preferred.

- If a prop is explicitly passed as null, defaultProps will NOT override
  it.

- If a prop is undefined, defaultProps will apply.

## In Simple Terms

defaultProps = Default value for props

It ensures:

- Safe rendering

- Better usability

- Fewer runtime errors

## 16. What are Higher-Order Components (HOCs)?

### What is a Higher-Order Component?

A Higher-Order Component (HOC) is a function that takes a component as
input and returns a new enhanced component.

It is a pattern for reusing component logic.

### Definition

A HOC:

- Accepts a component

- Adds additional functionality

- Returns a new component

It does not modify the original component.

## Basic Example

function withLogger(WrappedComponent) {\
return function EnhancedComponent(props) {\
console.log(\"Component rendered\");\
return \<WrappedComponent {\...props} /\>;\
};\
}

Usage:

function Greeting({ name }) {\
return \<h1\>Hello {name}\</h1\>;\
}\
\
const EnhancedGreeting = withLogger(Greeting);

Now whenever EnhancedGreeting renders, it logs to console.

## Why Use HOCs?

HOCs help with:

### 1. Code Reusability

Share logic across multiple components.

### 2. Cross-Cutting Concerns

Handle common functionality like:

- Authentication

- Logging

- Data fetching

- Permission checks

## Real-World Example

In many React applications, especially those using **Redux**, the
connect() function is a classic example of a HOC.

export default connect(mapStateToProps)(MyComponent);

connect() wraps the component and injects state/dispatch as props.

## Structure of an HOC

const HOC = (Component) =\> {\
return (props) =\> {\
// Add logic here\
return \<Component {\...props} /\>;\
};\
};

## Important Characteristics

- Pure function

- Does not modify original component

- Returns a new component

- Uses composition, not inheritance

## HOCs vs Hooks

Modern React often prefers Hooks over HOCs because:

- Hooks are simpler

- Less nesting

- Easier to read

- No wrapper component tree complexity

However, HOCs are still widely used in many codebases.

## 17. What are Controlled vs Uncontrolled Components?

In React, form elements (like \<input\>, \<textarea\>, \<select\>) can
be handled in two ways:

- Controlled Components

- Uncontrolled Components

The difference is based on **where the form data is stored and
managed**.

# 1. Controlled Components

### Definition

A controlled component is a form element whose value is controlled by
React state.

React becomes the single source of truth.

## Example of Controlled Component

import React, { useState } from \"react\";\
\
function ControlledInput() {\
const \[name, setName\] = useState(\"\");\
\
return (\
\<input\
type=\"text\"\
value={name}\
onChange={(e) =\> setName(e.target.value)}\
/\>\
);\
}

### How It Works

- value is linked to React state.

- onChange updates the state.

- Every keystroke updates state.

- React re-renders with new value.

## Characteristics of Controlled Components

- React controls input value.

- State is the single source of truth.

- Easy validation and conditional logic.

- Better predictability.

- More commonly used in modern React apps.

## Why Use Controlled Components?

Because you can:

- Validate input in real time

- Disable buttons conditionally

- Format input dynamically

- Keep UI always in sync with state

Example validation:

\<button disabled={!name}\>Submit\</button\>

# 2. Uncontrolled Components

### Definition

An uncontrolled component stores its own state internally in the DOM.

React does not control the input value directly.

You access the value using a ref.

## Example of Uncontrolled Component

import React, { useRef } from \"react\";\
\
function UncontrolledInput() {\
const inputRef = useRef();\
\
const handleSubmit = () =\> {\
console.log(inputRef.current.value);\
};\
\
return (\
\<\>\
\<input type=\"text\" ref={inputRef} /\>\
\<button onClick={handleSubmit}\>Submit\</button\>\
\</\>\
);\
}

### How It Works

- Input manages its own value.

- React does not track changes.

- Value is accessed only when needed.

## Characteristics of Uncontrolled Components

- DOM is the source of truth.

- Less code.

- Less re-rendering.

- Harder to validate in real time.

- Similar to traditional HTML forms.

# Key Differences

  ---------------------------------------------
  **Feature**   **Controlled   **Uncontrolled
                Component**    Component**
  ------------- -------------- ----------------
  Source of     React state    DOM
  truth                        

  Value         value +        ref
  handling      onChange       

  Re-render on  Yes            No
  input                        

  Validation    Easy           Harder

  Recommended   Yes (most      For simple cases
                cases)         
  ---------------------------------------------

# When to Use Controlled Components

- Complex forms

- Real-time validation

- Dynamic UI updates

- Conditional rendering

- Form libraries (Formik, React Hook Form internally use controlled
  logic)

# When to Use Uncontrolled Components

- Simple forms

- Performance-sensitive large forms

- Integrating with non-React libraries

- File inputs (commonly uncontrolled)
