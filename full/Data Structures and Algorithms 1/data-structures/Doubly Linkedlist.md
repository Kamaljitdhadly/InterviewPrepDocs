# Data Structures and Algorithms Doubly Linkedlist

Doubly Linked List (Data Structure)

A **Doubly Linked List (DLL)** is a linear data structure in which each node contains:

- **Data** – the actual value.

- **Next** – a reference (pointer) to the next node.

- **Prev** – a reference (pointer) to the previous node.

Unlike a **Singly Linked List**, where you can only move forward, a **Doubly Linked List** allows you to move **both forward and backward**.

### Real-Life Example

Think of a train.

Each coach is connected to:

- The coach in front.

- The coach behind.

Coach A ⇄ Coach B ⇄ Coach C ⇄ Coach D

You can move in either direction.

A doubly linked list works the same way.

Structure of a Node

Each node has three parts.

+--------+------+--------+

\| Prev \| Data \| Next \|

+--------+------+--------+

- **Prev** points to the previous node.

- **Data** stores the value.

- **Next** points to the next node.

Visualization

A doubly linked list containing four values:

Head

\|

v

- NULL \<- \[10\] \<-\> \[20\] \<-\> \[30\] \<-\> \[40\] -\> NULL

Or showing the pointers explicitly:

NULL \<-+--------+ +--------+ +--------+ +--------+-\> NULL

\|10 \|\<---\>\|\<---\>\|20 \|\<---\>\|\<---\>\|30 \|\<---\>\|\<---\>\|40 \| \|

+--------+ +--------+ +--------+ +--------+

The first node's Prev is **NULL**.

The last node's Next is **NULL**.

Memory Representation

Nodes are stored at different memory locations.

| **Address** | **Prev** | **Data** | **Next** |
|-------------|----------|----------|----------|
| 1000        | NULL     | 10       | 5000     |
| 5000        | 1000     | 20       | 8000     |
| 8000        | 5000     | 30       | 2000     |
| 2000        | 8000     | 40       | NULL     |

Notice that memory is **not contiguous**.

The nodes are connected using references.

### Why Use a Doubly Linked List?

Suppose you're browsing a web browser.

Google ← YouTube ← GitHub

You can:

- Click **Back**.

- Click **Forward**.

A singly linked list cannot easily move backward.

A doubly linked list can.

### Basic Operations

1. Traversal (Forward)

Head

↓

10 ⇄ 20 ⇄ 30 ⇄ 40

Output

10

20

30

40

Time Complexity

O(n)

2. Traversal (Backward)

If you have a **Tail** pointer:

Tail

↓

40 ⇄ 30 ⇄ 20 ⇄ 10

Output

40

30

20

10

Time Complexity

O(n)

3. Search

Find 30

10

↓

20

↓

30 ✔

Time Complexity

O(n)

4. Insertion at Beginning

Before

10 ⇄ 20 ⇄ 30

Insert 5

After

5 ⇄ 10 ⇄ 20 ⇄ 30

Steps

- Create new node.

- new.Next = Head

- Head.Prev = new

- Head = new

Time Complexity

O(1)

5. Insertion at End

Before

10 ⇄ 20 ⇄ 30

Insert 40

After

10 ⇄ 20 ⇄ 30 ⇄ 40

If a **Tail** pointer exists:

Time Complexity

O(1)

Without Tail:

O(n)

6. Insertion in Middle

Before

10 ⇄ 20 ⇄ 40

Insert 30

After

10 ⇄ 20 ⇄ 30 ⇄ 40

Update four references:

20.Next = 30

30.Prev = 20

30.Next = 40

40.Prev = 30

Time Complexity

O(n)

7. Deletion

Delete 20

Before

10 ⇄ 20 ⇄ 30 ⇄ 40

After

10 ⇄ 30 ⇄ 40

Update:

10.Next = 30

30.Prev = 10

Time Complexity

O(n)

If you already have a reference to the node being deleted, the pointer updates themselves take **O(1)**.

### Time Complexity

| **Operation**                | **Complexity** |
|------------------------------|----------------|
| Access by Index              | O(n)           |
| Search                       | O(n)           |
| Traverse                     | O(n)           |
| Insert at Beginning          | O(1)           |
| Insert at End (with Tail)    | O(1)           |
| Insert at End (without Tail) | O(n)           |
| Insert in Middle             | O(n)           |
| Delete                       | O(n)           |

C# Node Class

public class Node

{

public int Data;

public Node Next;

public Node Prev;

public Node(int data)

{

Data = data;

Next = null;

Prev = null;

}

}

Simple C# Example

using System;

class Node

{

public int Data;

public Node Next;

public Node Prev;

public Node(int data)

{

Data = data;

}

}

class Program

{

static void Main()

{

Node first = new Node(10);

Node second = new Node(20);

Node third = new Node(30);

first.Next = second;

second.Prev = first;

second.Next = third;

third.Prev = second;

Node current = first;

while (current != null)

{

Console.WriteLine(current.Data);

current = current.Next;

}

}

}

Output

10

20

30

Advantages

- Can traverse in both directions.

- Easy to delete a node when you already have a reference to it.

- Efficient insertion and deletion at both ends (with Head and Tail pointers).

- Useful for browser history, music playlists, undo/redo functionality, and LRU caches.

Disadvantages

- Uses more memory because each node stores two pointers (Prev and Next).

- Pointer updates are more complex than in a singly linked list.

- Slightly slower due to the extra pointer maintenance.

Singly vs Doubly Linked List

| **Feature**       | **Singly Linked List** | **Doubly Linked List** |
|-------------------|------------------------|------------------------|
| Pointers per Node | 1 (Next)               | 2 (Prev, Next)         |
| Traverse Forward  | ✅                     | ✅                     |
| Traverse Backward | ❌                     | ✅                     |
| Memory Usage      | Lower                  | Higher                 |
| Delete Given Node | More difficult         | Easier                 |
| Implementation    | Simpler                | More complex           |

Array vs Doubly Linked List

| **Feature**         | **Array**  | **Doubly Linked List** |
|---------------------|------------|------------------------|
| Memory              | Contiguous | Non-contiguous         |
| Random Access       | O(1)       | O(n)                   |
| Insert at Beginning | O(n)       | O(1)                   |
| Insert at End       | O(1)\*     | O(1)\*\*               |
| Delete              | O(n)       | O(1)\*\* / O(n)\*\*\*  |
| Extra Memory        | No         | Yes (two pointers)     |

\* If space is available.\
\*\* With Head and Tail pointers or a direct node reference.\
\*\*\* O(n) if you must first search for the node.

Real-World Applications

- Browser **Back** and **Forward** navigation.

- Undo/Redo operations in text editors.

- Music player (Previous/Next song).

- Image galleries.

- LRU (Least Recently Used) cache implementations.

- Navigation systems.

Common Interview Questions

- What is a doubly linked list?

- How is it different from a singly linked list?

- Why does it require more memory?

- Why is deletion easier in a doubly linked list?

- When would you choose a doubly linked list over an array?

- Why is random access still **O(n)**?

- What are the advantages of maintaining both **Head** and **Tail** pointers?

Summary

| **Feature**         | **Doubly Linked List** |
|---------------------|------------------------|
| Type                | Linear Data Structure  |
| Node Structure      | Prev + Data + Next     |
| Memory              | Non-contiguous         |
| Traverse            | Forward and Backward   |
| Random Access       | O(n)                   |
| Insert at Beginning | O(1)                   |
| Insert at End       | O(1) with Tail         |
| Delete (Known Node) | O(1)                   |
| Extra Memory        | Two pointers per node  |

Key Takeaways

- A **Doubly Linked List** extends a singly linked list by adding a **Prev pointer** to every node.

- It supports **two-way traversal**, making backward navigation efficient.

- Insertions and deletions are easier because each node knows both its previous and next neighbors.

- The trade-off is **higher memory usage** and **more pointer updates** compared to a singly linked list.
