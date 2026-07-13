# Data Structures and Algorithms Stack

**Stack (Data Structure)**

A **Stack** is a **linear data structure** that follows the **LIFO (Last In, First Out)** principle.

This means:

**The last element inserted is the first element removed.**

Think of a stack of plates.

The last plate placed on top is the first plate you take.

**Real-Life Example**

A stack of books:

Top

↓

+------+

\| Book3 \| ← Last added

+------+

\| Book2 \|

+------+

\| Book1 \| ← First added

+------+

If you want to remove a book, you remove **Book3 first**.

This is **LIFO**.

**Stack Terminology**

A stack has one main end:

Top

↓

\[30\]

\[20\]

\[10\]

- **Top** → The position where insertion and deletion happen.

- Unlike a queue, a stack does not have a front and rear.

**Basic Operations**

**1. Push (Insert)**

Adds an element to the top of the stack.

Initially:

Empty Stack

Push 10:

Top

↓

\[10\]

Push 20:

Top

↓

\[20\]

\[10\]

Push 30:

Top

↓

\[30\]

\[20\]

\[10\]

Time Complexity:

O(1)

**2. Pop (Remove)**

Removes the top element.

Before:

Top

↓

\[30\]

\[20\]

\[10\]

Pop:

30 is removed

After:

Top

↓

\[20\]

\[10\]

Time Complexity:

O(1)

**3. Peek (View Top)**

Returns the top element without removing it.

Stack:

Top

↓

\[50\]

\[30\]

\[10\]

Peek:

50

Stack remains unchanged.

Time Complexity:

O(1)

**4. IsEmpty**

Checks whether the stack contains elements.

Example:

Stack = \[\]

Result:

true

Time Complexity:

O(1)

**Stack Operations Example**

Start:

Empty

**Push 10**

Top

↓

10

**Push 20**

Top

↓

20

10

**Push 30**

Top

↓

30

20

10

**Pop**

Remove 30

Top

↓

20

10

**Peek**

Returns:

20

**How Stack is Implemented**

A stack can be implemented using:

1.  Array

2.  Linked List

**Stack Using Array**

Example:

Index

0 1 2

\[10\]\[20\]\[30\]

↑

Top

A variable top keeps track of the last element.

Example:

top = 2

**Push Operation**

Before:

\[10\]\[20\]\[ \]

↑

Top

Push 30:

\[10\]\[20\]\[30\]

↑

Top

**Pop Operation**

Before:

\[10\]\[20\]\[30\]

↑

Top

Remove 30:

\[10\]\[20\]\[ \]

↑

Top

**Stack Using Linked List**

A stack can also be created using nodes.

Top

\|

v

\[30\] → \[20\] → \[10\] → NULL

Push:

Add node at beginning.

Pop:

Remove node from beginning.

Both operations:

O(1)

**Time Complexity**

| **Operation** | **Complexity** |
|---------------|----------------|
| Push          | O(1)           |
| Pop           | O(1)           |
| Peek          | O(1)           |
| IsEmpty       | O(1)           |
| Search        | O(n)           |

**C# Example**

.NET provides a built-in stack:

using System;

using System.Collections.Generic;

class Program

{

static void Main()

{

Stack\<int\> stack = new Stack\<int\>();

stack.Push(10);

stack.Push(20);

stack.Push(30);

Console.WriteLine(stack.Peek());

Console.WriteLine(stack.Pop());

Console.WriteLine(stack.Peek());

}

}

Output:

30

30

20

**Stack vs Queue**

| **Feature**     | **Stack**       | **Queue**       |
|-----------------|-----------------|-----------------|
| Principle       | LIFO            | FIFO            |
| Insert          | Top             | Rear            |
| Remove          | Top             | Front           |
| Example         | Stack of plates | Waiting line    |
| Main Operations | Push/Pop        | Enqueue/Dequeue |

**Applications of Stack**

**1. Function Calls**

Programming languages use a **call stack**.

Example:

void A()

{

B();

}

void B()

{

C();

}

void C()

{

}

Stack:

Top

↓

C()

B()

A()

When C finishes:

Remove C()

Then B:

Remove B()

Then A.

**2. Undo/Redo**

Text editors use stacks.

Example:

Typing:

Hello

Hello World

Hello World!

Stack:

Hello World!

Hello World

Hello

Undo removes the latest change first.

**3. Browser History**

Back button uses a stack.

Example:

Google

↓

YouTube

↓

GitHub

Press Back:

GitHub removed

Return to YouTube.

**4. Expression Evaluation**

Stacks are used for:

- Parentheses checking

- Calculator expressions

- Converting infix to postfix

Example:

Valid:

(10 + 20)

Invalid:

(10 + 20\]

**5. Depth First Search (DFS)**

Graph and tree traversal often uses a stack.

**Stack Overflow**

A **stack overflow** happens when too many function calls are added to the call stack.

Example:

void Function()

{

Function();

}

The function calls itself forever:

Function()

Function()

Function()

Function()

...

Eventually:

Stack Overflow Exception

**Stack vs Array**

| **Feature**   | **Stack** | **Array**   |
|---------------|-----------|-------------|
| Access        | Only top  | Any index   |
| Order         | LIFO      | Index-based |
| Insert        | Top       | Anywhere    |
| Delete        | Top       | Anywhere    |
| Random Access | No        | Yes         |

**Common Interview Questions**

1.  What is a stack?

2.  Why is stack called LIFO?

3.  Difference between stack and queue?

4.  What happens internally during a function call?

5.  What is stack overflow?

6.  How can a stack be implemented using an array?

7.  How can a stack be implemented using a linked list?

8.  What are real-world uses of stacks?

9.  Why are push and pop operations O(1)?

**Summary**

| **Feature**     | **Stack**             |
|-----------------|-----------------------|
| Type            | Linear Data Structure |
| Principle       | LIFO                  |
| Insert          | Push                  |
| Remove          | Pop                   |
| View Top        | Peek                  |
| Push Complexity | O(1)                  |
| Pop Complexity  | O(1)                  |
| Storage         | Array or Linked List  |
| C# Class        | Stack\<T\>            |

**Key Takeaways**

- A **Stack** follows **Last In, First Out (LIFO)**.

- The only accessible element is the **Top** element.

- **Push** adds an item, **Pop** removes an item, and **Peek** views the top.

- Stacks are heavily used in **function calls, recursion, undo/redo, browser history, expression parsing, and DFS algorithms**.
