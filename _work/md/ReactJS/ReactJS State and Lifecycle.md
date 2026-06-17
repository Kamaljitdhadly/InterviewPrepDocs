## 18. What is State in React?

### Definition

**State** is a built-in object in React that allows a component to store
and manage dynamic data that can change over time.

When state changes:

- The component re-renders.

- The UI updates automatically.

State makes components interactive.

## Example Using Functional Component (useState)

import React, { useState } from \"react\";\
\
function Counter() {\
const \[count, setCount\] = useState(0);\
\
return (\
\<\>\
\<h1\>{count}\</h1\>\
\<button onClick={() =\> setCount(count + 1)}\>\
Increment\
\</button\>\
\</\>\
);\
}

### How It Works

- count is the state variable.

- setCount updates the state.

- When setCount is called:

  - React schedules a re-render.

  - UI reflects the new value.

## Example Using Class Component

class Counter extends React.Component {\
constructor(props) {\
super(props);\
this.state = { count: 0 };\
}\
\
render() {\
return (\
\<\>\
\<h1\>{this.state.count}\</h1\>\
\<button\
onClick={() =\>\
this.setState({ count: this.state.count + 1 })\
}\
\>\
Increment\
\</button\>\
\</\>\
);\
}\
}

## Key Characteristics of State

### 1. Managed Inside the Component

State belongs to the component that defines it.

### 2. Mutable (Through Setters Only)

You should never modify state directly.

Wrong:

count = count + 1; // ❌

Correct:

setCount(count + 1); // ✅

### 3. Triggers Re-render

When state changes, React updates the UI automatically.

### 4. Asynchronous Updates

State updates may be batched and applied later for performance
optimization.

## When Do You Use State?

- Counters

- Form inputs

- Toggle buttons

- API responses

- UI visibility (show/hide)

- Loading indicators

## In Simple Terms

State = Internal memory of a component

It stores data that:

- Changes over time

- Affects rendering

- Makes UI dynamic

# 19. What is the Difference Between State and Props?

Both state and props are used to manage data in React, but they serve
different purposes.

## 1. Ownership

- **Props** are passed from parent to child.

- **State** is owned and managed by the component itself.

## 2. Mutability

- **Props** are immutable (read-only).

- **State** is mutable (via setState or useState).

## 3. Who Controls Them?

- **Props** are controlled by the parent.

- **State** is controlled by the component itself.

## 4. Purpose

- **Props** → Pass data between components.

- **State** → Manage internal component data.

## Example Showing Both

function Child({ name }) { // name is prop\
const \[count, setCount\] = React.useState(0); // count is state\
\
return (\
\<\>\
\<h1\>{name}\</h1\>\
\<h2\>{count}\</h2\>\
\<button onClick={() =\> setCount(count + 1)}\>\
Increment\
\</button\>\
\</\>\
);\
}

Here:

- name comes from parent (prop).

- count is internal to Child (state).

## Comparison Table

  ------------------------------------------
  **Feature**   **Props**        **State**
  ------------- ---------------- -----------
  Definition    External input   Internal
                                 data

  Owned by      Parent           Component

  Mutable?      No               Yes (via
                                 setter)

  Causes        Yes (if changed  Yes
  re-render?    by parent)       

  Purpose       Data passing     Dynamic
                                 behavior
  ------------------------------------------

## Practical Rule

If data needs to:

- Be shared → Use props.

- Be changed inside component → Use state.

### 20 How does **setState** work internally?

In **React**, setState is the method used to update a component's state.
Internally, it **does not immediately mutate the state**. Instead, React
schedules a state update and **merges the new state with the previous
state**.

#### 🔹 Key Points:

1.  **State is queued:** React maintains a queue of state updates.

2.  **Batching:** Multiple setState calls within the same event are
    **batched** for performance.

3.  **Re-rendering:** After the state is updated, React re-renders the
    component and its children.

4.  **Functional Updates:** You can pass a function to setState to get
    the latest state value.

### ✅ Example

import React, { useState } from \"react\";\
\
function Counter() {\
const \[count, setCount\] = useState(0);\
\
const handleClick = () =\> {\
setCount(count + 1);\
setCount(count + 1); // Not immediately 2, due to batching\
};\
\
return (\
\<div\>\
\<p\>Count: {count}\</p\>\
\<button onClick={handleClick}\>Increment Twice\</button\>\
\</div\>\
);\
}

💡 **Note:** Even though we called setCount twice, the count may only
increase by **1**, because React batches updates in the same event loop.

#### ✅ Functional Update to Fix It

setCount(prevCount =\> prevCount + 1);\
setCount(prevCount =\> prevCount + 1); // Now count increases by 2

### 21 Are state updates synchronous or asynchronous?

- **Answer:** **State updates are asynchronous** in React.

- React may **delay the update** to **batch multiple updates** together
  for better performance.

- Exception: In **async code like setTimeout, fetch, or promises**,
  React may process updates immediately depending on the version.

#### 🔹 Key Takeaways:

1.  setState **doesn't immediately update this.state** in class
    components.

2.  To work with the latest state, **use functional updates**:

setCount(prevCount =\> prevCount + 1);

3.  This ensures your update is **based on the latest value**, avoiding
    stale state bugs.

If you want, I can also create a **diagram showing how React batches
setState internally**, which makes it very clear how updates flow and
re-rendering happens

## 
