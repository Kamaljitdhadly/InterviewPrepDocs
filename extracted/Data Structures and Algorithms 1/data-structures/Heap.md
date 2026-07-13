# Data Structures and Algorithms Heap

**Heap (Data Structure)**

A **Heap** is a special type of **Complete Binary Tree** that satisfies the **Heap Property**.

Unlike a Binary Search Tree (BST), a heap is **not used for fast searching**. Instead, it is designed to efficiently retrieve the **highest-priority** or **lowest-priority** element.

There are two types of heaps:

1.  **Max Heap** – The largest element is always at the root.

2.  **Min Heap** – The smallest element is always at the root.

**Real-Life Example**

Imagine a hospital emergency room.

Patients are treated based on **priority**, not on arrival time.

Priority

Critical Patient

↑

Serious Patient

↑

Normal Patient

The highest-priority patient is always treated first.

A **heap** works exactly like this.

**What is a Complete Binary Tree?**

A heap must first be a **Complete Binary Tree**.

A Complete Binary Tree means:

- Every level is completely filled except possibly the last.

- The last level is filled from **left to right**.

Example:

10

/ \\

20 30

/ \\ /

40 50 60

✅ This is complete.

Not complete:

10

/ \\

20 30

\\

50

❌ The left child is missing before the right child.

**Heap Property**

**Max Heap**

Every parent is **greater than or equal to** its children.

100

/ \\

50 80

/ \\ / \\

20 40 30 10

Notice:

100 \> 50

100 \> 80

50 \> 20

50 \> 40

80 \> 30

80 \> 10

The **largest element is always at the root**.

**Min Heap**

Every parent is **less than or equal to** its children.

5

/ \\

8 10

/ \\ / \\

20 15 30 40

The **smallest element is always at the root**.

**Important Point**

Many beginners confuse Heap with BST.

Heap **does not sort** its children.

Example:

100

/ \\

20 80

This is still a valid Max Heap.

Why?

Because

100 \> 20

100 \> 80

The relationship between siblings **does not matter**.

**How Heap is Stored**

Unlike most trees, heaps are usually stored in an **array**, not with pointers.

Example heap:

50

/ \\

30 40

/ \\ /

10 20 35

Stored as:

Index : 0 1 2 3 4 5

Value : 50 30 40 10 20 35

**Why an Array?**

Because a Complete Binary Tree has a predictable layout.

No pointers are needed.

**Parent and Child Formula**

Suppose a node is at index **i**.

Left child:

2 × i + 1

Right child:

2 × i + 2

Parent:

(i − 1) / 2

Example

Index

0

1

2

3

4

5

Node at index **2**

Left

2×2+1 = 5

Right

2×2+2 = 6

Perfect!

**Heap Insertion**

Suppose we have

50

/ \\

30 40

Insert **60**

Step 1

Place it at the next available position.

50

/ \\

30 40

/

60

This breaks the heap property.

Because

60 \> 30

**Heapify Up**

Swap with parent.

50

/ \\

60 40

/

30

Still

60 \> 50

Swap again.

60

/ \\

50 40

/

30

Done.

**Heap Deletion**

Deletion removes the **root**.

Suppose

100

/ \\

50 80

/ \\

20 40

Delete 100.

Step 1

Replace root with the last node.

40

/ \\

50 80

/

20

Now heap property is broken.

**Heapify Down**

Compare with larger child.

Largest child = 80

Swap.

80

/ \\

50 40

/

20

Heap restored.

**Heap Operations**

**Peek**

Return root.

Max Heap

100

Time

O(1)

**Insert**

Add node

Heapify Up

Time

O(log n)

**Delete Root**

Replace root

Heapify Down

Time

O(log n)

**Search**

Must visit many nodes because heaps are **not sorted**.

Time

O(n)

**Time Complexity**

| **Operation**  | **Complexity** |
|----------------|----------------|
| Peek (Max/Min) | O(1)           |
| Insert         | O(log n)       |
| Delete Root    | O(log n)       |
| Search         | O(n)           |
| Build Heap     | O(n)           |

**Note:** Building a heap from an unsorted array using the bottom-up heap construction algorithm takes **O(n)** time, which is more efficient than inserting elements one by one (**O(n log n)**).

**Why is Insert O(log n)?**

Because heap height is

log₂ n

Heapify only moves from leaf to root.

Maximum swaps

Height

Therefore

O(log n)

**C# Example**

.NET provides a built-in priority queue rather than a direct Heap class.

using System;

using System.Collections.Generic;

class Program

{

static void Main()

{

var pq = new PriorityQueue\<string, int\>();

// Lower priority number = higher priority

pq.Enqueue("Low", 3);

pq.Enqueue("Medium", 2);

pq.Enqueue("High", 1);

while (pq.Count \> 0)

{

Console.WriteLine(pq.Dequeue());

}

}

}

Output:

High

Medium

Low

PriorityQueue\<TElement, TPriority\> is implemented using a **binary min-heap** internally.

**Heap vs Binary Search Tree**

| **Feature**  | **Heap**             | **Binary Search Tree**                  |
|--------------|----------------------|-----------------------------------------|
| Structure    | Complete Binary Tree | Binary Tree                             |
| Root         | Highest/Lowest value | Depends on insertion order              |
| Search       | O(n)                 | O(log n) average                        |
| Insert       | O(log n)             | O(log n) average                        |
| Delete Root  | O(log n)             | O(log n) average                        |
| Sorted Order | ❌ No                | ✅ In-order traversal gives sorted data |
| Main Purpose | Priority management  | Fast searching                          |

**Max Heap vs Min Heap**

| **Feature** | **Max Heap**           | **Min Heap**          |
|-------------|------------------------|-----------------------|
| Root        | Largest element        | Smallest element      |
| Parent Rule | Parent ≥ Children      | Parent ≤ Children     |
| Use Cases   | Highest priority first | Lowest priority first |

**Real-World Applications**

- **Priority Queues** (task scheduling, CPU scheduling).

- **Dijkstra's Shortest Path Algorithm**.

- **Prim's Minimum Spanning Tree Algorithm**.

- **A\* Pathfinding**.

- **Heap Sort**.

- Finding the **Top K largest/smallest** elements.

- Job schedulers and event-driven systems.

**Common Interview Questions**

1.  What is a heap?

2.  Why must a heap be a **Complete Binary Tree**?

3.  What is the difference between a heap and a BST?

4.  Why is searching in a heap **O(n)**?

5.  Why are heaps stored in arrays?

6.  Explain **Heapify Up** and **Heapify Down**.

7.  Why does insertion take **O(log n)**?

8.  What is the difference between a **Max Heap** and a **Min Heap**?

9.  Why does .NET's PriorityQueue\<TElement, TPriority\> use a **min-heap** internally?

**Summary**

| **Feature** | **Heap**                                |
|-------------|-----------------------------------------|
| Type        | Non-Linear Data Structure               |
| Shape       | Complete Binary Tree                    |
| Storage     | Usually Array                           |
| Root        | Highest (Max Heap) or Lowest (Min Heap) |
| Search      | O(n)                                    |
| Insert      | O(log n)                                |
| Delete Root | O(log n)                                |
| Peek        | O(1)                                    |
| Primary Use | Priority Queue                          |

**Key Takeaways**

- A **Heap** is a **Complete Binary Tree** that satisfies the **Heap Property**.

- The **root** always contains the highest-priority element (maximum in a Max Heap, minimum in a Min Heap).

- Heaps are commonly stored in **arrays**, making them memory-efficient.

- Their biggest strength is **fast insertion and fast removal of the highest/lowest priority element**, making them ideal for implementing **priority queues**.
