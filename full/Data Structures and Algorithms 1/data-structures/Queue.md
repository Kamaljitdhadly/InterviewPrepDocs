# Data Structures and Algorithms Queue

Queue (Data Structure)

A **Queue** is a **linear data structure** that follows the **FIFO (First In, First Out)** principle.

This means:

The first element inserted is the first element removed.

Think of it as standing in a line at a ticket counter.

The person who arrives first gets served first.

### Real-Life Example

Imagine people waiting at a movie ticket counter.

Front

↓

- \[Aman\] \[Rahul\] \[Priya\] \[Neha\]

↑

Rear

- **Aman** entered the queue first, so he is served first.

- **Neha** joined last, so she will be served last.

This is **FIFO**.

Queue Terminology

A queue has two important ends.

Front ---------------------------- Rear

- **Front** → Element removed from here.

- **Rear** → New elements are added here.

### Basic Operations

1. Enqueue (Insert)

Adds an element at the **rear**.

Initially

Front

↓

- \[10\]

↑

Rear

Enqueue 20

Front

↓

- \[10\] \[20\]

↑

Rear

Enqueue 30

Front

↓

- \[10\] \[20\] \[30\]

↑

Rear

Time Complexity

O(1)

2. Dequeue (Remove)

Removes the element from the **front**.

Before

Front

↓

- \[10\] \[20\] \[30\]

↑

Rear

Remove 10

After

Front

↓

- \[20\] \[30\]

↑

Rear

Time Complexity

O(1)

3. Peek (Front)

Returns the first element without removing it.

Queue

- \[20\] \[30\] \[40\]

Peek

20

Time Complexity

O(1)

4. IsEmpty

Checks whether the queue contains elements.

- Queue = \[\]

Result = True

Time Complexity

O(1)

Step-by-Step Example

Start with an empty queue.

Enqueue 10

Front Rear

↓ ↓

- \[10\]

Enqueue 20

Front

↓

- \[10\] \[20\]

↑

Rear

Enqueue 30

Front

↓

- \[10\] \[20\] \[30\]

↑

Rear

Dequeue

Remove 10

Front

↓

- \[20\] \[30\]

↑

Rear

Enqueue 40

Front

↓

- \[20\] \[30\] \[40\]

↑

Rear

Dequeue

Remove 20

Front

↓

- \[30\] \[40\]

↑

Rear

Queue Using an Array

Index

0 1 2 3 4

- \[10\]\[20\]\[30\]\[ \]\[ \]

Two variables are maintained:

Front = 0

Rear = 2

After one dequeue

Front = 1

Rear = 2

Problem

If you keep dequeuing and enqueuing, empty spaces appear at the beginning.

- \[ \]\[ \]\[30\]\[40\]\[50\]

Even though there is free space, a simple array-based queue may think it's full if Rear has reached the end.

This is solved using a **Circular Queue**.

Queue Using a Linked List

A queue can also be implemented using a linked list.

Front

↓

10 → 20 → 30 → NULL

↑

Rear

- Insert at the **rear**.

- Remove from the **front**.

Both operations are **O(1)** when both Front and Rear pointers are maintained.

### Time Complexity

| **Operation** | **Complexity** |
|---------------|----------------|
| Enqueue       | O(1)           |
| Dequeue       | O(1)           |
| Peek          | O(1)           |
| IsEmpty       | O(1)           |
| Search        | O(n)           |

C# Example

The .NET framework provides a built-in generic queue.

using System;

using System.Collections.Generic;

class Program

{

static void Main()

{

Queue\<int\> queue = new Queue\<int\>();

queue.Enqueue(10);

queue.Enqueue(20);

queue.Enqueue(30);

Console.WriteLine(queue.Peek()); // 10

Console.WriteLine(queue.Dequeue()); // 10

Console.WriteLine(queue.Peek()); // 20

}

}

Output

10

10

20

Queue vs Stack

| **Feature**    | **Queue**     | **Stack**    |
|----------------|---------------|--------------|
| Principle      | FIFO          | LIFO         |
| Insert         | Rear          | Top          |
| Remove         | Front         | Top          |
| First Inserted | Removed First | Removed Last |

Example:

Queue

10 → 20 → 30

Remove → 10

Stack

Top

30

20

10

Pop → 30

Queue vs Array

| **Feature**     | **Queue** | **Array**   |
|-----------------|-----------|-------------|
| Order           | FIFO      | Index-based |
| Access by Index | No        | Yes         |
| Insert          | Rear      | Anywhere    |
| Delete          | Front     | Anywhere    |
| Random Access   | No        | Yes         |

Types of Queues

1. Simple Queue

FIFO.

10 → 20 → 30

2. Circular Queue

The last position connects back to the first.

- \[ \]\[ \]\[30\]\[40\]\[50\]

↓

Reuse empty spaces at the beginning.

Efficient use of array space.

3. Priority Queue

Elements are removed based on **priority**, not insertion order.

Example:

Low

Medium

High

Removal order

High

Medium

Low

A **heap** is commonly used to implement a priority queue efficiently.

4. Double-Ended Queue (Deque)

Insertion and deletion are allowed at **both the front and rear**.

Front ⇄ 10 ⇄ 20 ⇄ 30 ⇄ Rear

Real-World Applications

- Printer job scheduling.

- CPU process scheduling.

- Customer service waiting lines.

- Breadth-First Search (BFS) in graphs and trees.

- Message queues (e.g., RabbitMQ, Azure Service Bus).

- Network packet processing.

- Streaming and buffering systems.

Common Interview Questions

- What is a queue?

- Why is a queue called **FIFO**?

- What is the difference between a queue and a stack?

- What are **Front** and **Rear**?

- Why are enqueue and dequeue **O(1)**?

- What problem does a circular queue solve?

- How is a queue implemented using a linked list?

- What is the difference between a simple queue and a priority queue?

Summary

| **Feature** | **Queue**                  |
|-------------|----------------------------|
| Type        | Linear Data Structure      |
| Principle   | FIFO (First In, First Out) |
| Insert      | Rear                       |
| Remove      | Front                      |
| Peek        | Front Element              |
| Enqueue     | O(1)                       |
| Dequeue     | O(1)                       |
| Search      | O(n)                       |
| C# Class    | Queue\<T\>                 |

Key Takeaways

- A **Queue** processes elements in the order they arrive (**FIFO**).

- New elements are added at the **rear** using **Enqueue**.

- Elements are removed from the **front** using **Dequeue**.

- Queues are ideal when tasks must be processed **in arrival order**, such as scheduling, buffering, and breadth-first traversal.

- Variants like **Circular Queue**, **Priority Queue**, and **Deque** solve different real-world problems while building on the same fundamental concept.
