# Data Structures and Algorithms Linked Lists
## Questions Covered

1. What is a linked list, and how does it differ from a doubly linked list?
2. How do you reverse a linked list or detect a cycle in a linked list?
3. How do you find the middle element or remove the Nth node from the end?
4. What is a skip list, and how does it improve search operations?
## What is a linked list, and how does it differ from a doubly linked list?

### Linked List

A **linked list** stores elements as **nodes** — each has **Data** and a **Next** pointer.

**Types**:

1. **Singly Linked List** — One direction; last node → null.

```csharp
public class Node
{
  public int Data { get; set; }
  public Node Next { get; set; }
}
public class SinglyLinkedList
{
  public Node Head { get; set; }
}
```

2. **Doubly Linked List** — **Next** + **Previous** pointers; bidirectional traversal.

```csharp
public class Node
{
  public int Data { get; set; }
  public Node Next { get; set; }
  public Node Previous { get; set; }
}
public class DoublyLinkedList
{
  public Node Head { get; set; }
  public Node Tail { get; set; }
}
```

### Differences: Singly vs Doubly

| Aspect | Singly | Doubly |
|--------|--------|--------|
| Node structure | Data + Next | Data + Next + Previous |
| Traversal | Forward only | Forward and backward |
| Insert/Delete | Simpler; may need full traverse | Direct prev access — more efficient |
| Memory | 1 pointer/node | 2 pointers/node |
| Complexity | Simpler | More pointer management |

### Example Operations

**Singly — Insert at End**:

```csharp
public void InsertAtEnd(int data)
{
  Node newNode = new Node { Data = data };
  if (Head == null)
  {
    Head = newNode;
    return;
  }
  Node current = Head;
  while (current.Next != null)
  {
    current = current.Next;
  }
  current.Next = newNode;
}
```

**Doubly — Insert at End**:

```csharp
public void InsertAtEnd(int data)
{
  Node newNode = new Node { Data = data };
  if (Head == null)
  {
    Head = newNode;
    Tail = newNode;
    return;
  }
  Tail.Next = newNode;
  newNode.Previous = Tail;
  Tail = newNode;
}
```

**Singly — Traversal**:

```csharp
public void PrintList()
{
  Node current = Head;
  while (current != null)
  {
    Console.Write(current.Data + " ");
    current = current.Next;
  }
}
```

**Doubly — Forward and Backward Traversal**:

```csharp
public void PrintListForward()
{
  Node current = Head;
  while (current != null)
  {
    Console.Write(current.Data + " ");
    current = current.Next;
  }
}
public void PrintListBackward()
{
  Node current = Tail;
  while (current != null)
  {
    Console.Write(current.Data + " ");
    current = current.Previous;
  }
}
```

### Summary

- **Singly**: Less memory, one-way — simple linear structures.
- **Doubly**: Bidirectional traversal, flexible insert/delete — more memory.
## How do you reverse a linked list or detect a cycle in a linked list?

### 1. Reverse a Singly Linked List

**Problem**: Reverse node order in-place — O(n) time, O(1) space.

```csharp
using System;
public class Node
{
  public int Data { get; set; }
  public Node Next { get; set; }
}
public class SinglyLinkedList
{
  public Node Head { get; set; }
  // Method to reverse the linked list
  public void Reverse()
  {
    Node prev = null;
    Node current = Head;
    Node next = null;
    while (current != null)
    {
      next = current.Next; // Save the next node
      current.Next = prev; // Reverse the current node's pointer
      prev = current; // Move pointers one position ahead
      current = next;
    }
    Head = prev; // Update the head to the new first node
  }
  // Helper method to print the linked list
  public void PrintList()
  {
    Node current = Head;
    while (current != null)
    {
      Console.Write(current.Data + " ");
      current = current.Next;
    }
    Console.WriteLine();
  }
}
```

**Steps**: Three pointers (`prev`, `current`, `next`); flip `Next` each step; set `Head = prev`.

### 2. Detect a Cycle (Floyd's Algorithm)

**Problem**: Detect if any `Next` points back to a prior node.

```csharp
using System;
public class Node
{
  public int Data { get; set; }
  public Node Next { get; set; }
}
public class SinglyLinkedList
{
  public Node Head { get; set; }
  // Method to detect a cycle in the linked list
  public bool HasCycle()
  {
    Node slow = Head;
    Node fast = Head;
    while (fast != null && fast.Next != null)
    {
      slow = slow.Next; // Move slow pointer by one step
      fast = fast.Next.Next; // Move fast pointer by two steps
      if (slow == fast) // Cycle detected
      {
        return true;
      }
    }
    return false; // No cycle detected
  }
  // Helper method to print the linked list
  public void PrintList()
  {
    Node current = Head;
    while (current != null)
    {
      Console.Write(current.Data + " ");
      current = current.Next;
    }
    Console.WriteLine();
  }
}
```

**Steps**: Slow (+1) and fast (+2); meeting = cycle; fast reaches null = no cycle — O(n) time, O(1) space.

### Example Usage

**Reversing**:

```csharp
public class Program
{
  public static void Main()
  {
    SinglyLinkedList list = new SinglyLinkedList();
    list.Head = new Node { Data = 1 };
    list.Head.Next = new Node { Data = 2 };
    list.Head.Next.Next = new Node { Data = 3 };
    list.Head.Next.Next.Next = new Node { Data = 4 };
    Console.WriteLine("Original list:");
    list.PrintList();
    list.Reverse();
    Console.WriteLine("Reversed list:");
    list.PrintList();
  }
}
```

**Cycle Detection**:

```csharp
public class Program
{
  public static void Main()
  {
    SinglyLinkedList list = new SinglyLinkedList();
    list.Head = new Node { Data = 1 };
    list.Head.Next = new Node { Data = 2 };
    list.Head.Next.Next = new Node { Data = 3 };
    list.Head.Next.Next.Next = new Node { Data = 4 };
    // Create a cycle for testing
    list.Head.Next.Next.Next.Next = list.Head.Next; // Create a cycle
    Console.WriteLine("Does the list have a cycle? " + list.HasCycle());
  }
}
```

### Summary

- **Reverse**: Iterative pointer flip — O(n).
- **Cycle detect**: Floyd's tortoise/hare — O(n).
## How do you find the middle element or remove the Nth node from the end?

Both use **two-pointer** techniques for single-pass O(n) solutions.

### 1. Find the Middle Element

Slow (+1) and fast (+2); when fast reaches end, slow is at middle.

```csharp
using System;
public class Node
{
  public int Data { get; set; }
  public Node Next { get; set; }
}
public class SinglyLinkedList
{
  public Node Head { get; set; }
  // Method to find the middle element of the linked list
  public int? FindMiddle()
  {
    if (Head == null)
    return null;
    Node slow = Head;
    Node fast = Head;
    while (fast != null && fast.Next != null)
    {
      slow = slow.Next;
      fast = fast.Next.Next;
    }
    return slow.Data;
  }
}
```

For even-length lists, returns second middle node.

### 2. Remove the Nth Node from the End

Dummy node + two pointers separated by N+1 steps.

```csharp
using System;
public class Node
{
  public int Data { get; set; }
  public Node Next { get; set; }
}
public class SinglyLinkedList
{
  public Node Head { get; set; }
  // Method to remove the Nth node from the end
  public void RemoveNthFromEnd(int n)
  {
    Node dummy = new Node { Next = Head };
    Node first = dummy;
    Node second = dummy;
    // Move first pointer N+1 steps ahead
    for (int i = 0; i <= n; i++)
    {
      if (first == null)
      return;
      first = first.Next;
    }
    // Move both pointers until the first pointer reaches the end
    while (first != null)
    {
      first = first.Next;
      second = second.Next;
    }
    // Skip the Nth node from the end
    second.Next = second.Next.Next;
    Head = dummy.Next; // Update head in case the first node is removed
  }
  // Helper method to print the linked list
  public void PrintList()
  {
    Node current = Head;
    while (current != null)
    {
      Console.Write(current.Data + " ");
      current = current.Next;
    }
    Console.WriteLine();
  }
}
```

**Steps**: Advance `first` N+1 ahead; move both until `first` is null; `second.Next` skips target node.

### Example Usage

**Middle Element**:

```csharp
public class Program
{
  public static void Main()
  {
    SinglyLinkedList list = new SinglyLinkedList();
    list.Head = new Node { Data = 1 };
    list.Head.Next = new Node { Data = 2 };
    list.Head.Next.Next = new Node { Data = 3 };
    list.Head.Next.Next.Next = new Node { Data = 4 };
    list.Head.Next.Next.Next.Next = new Node { Data = 5 };
    Console.WriteLine("Middle element: " + list.FindMiddle());
  }
}
```

**Remove Nth from End**:

```csharp
public class Program
{
  public static void Main()
  {
    SinglyLinkedList list = new SinglyLinkedList();
    list.Head = new Node { Data = 1 };
    list.Head.Next = new Node { Data = 2 };
    list.Head.Next.Next = new Node { Data = 3 };
    list.Head.Next.Next.Next = new Node { Data = 4 };
    list.Head.Next.Next.Next.Next = new Node { Data = 5 };
    Console.WriteLine("Original list:");
    list.PrintList();
    list.RemoveNthFromEnd(2);
    Console.WriteLine("List after removing 2nd node from the end:");
    list.PrintList();
  }
}
```

### Summary

- **Middle**: Slow/fast pointers — O(n), O(1) space.
- **Remove Nth**: Dummy node + gap of N+1 — O(n), O(1) space.
## What is a skip list, and how does it improve search operations?

A **skip list** is a probabilistic structure with multiple linked-list levels — higher levels act as "express lanes" for O(log n) average search/insert/delete.

### Skip List Structure

1. **Levels** — Level 0 has all elements; higher levels hold subsets.
2. **Nodes** — Multiple forward pointers; promotion probability decreases per level.

### 1. Search

Start at top level, move right while `< target`, descend when overshooting.

```csharp
public class Node
{
  public int Data { get; set; }
  public Node[] Forward { get; set; }
}
public class SkipList
{
  private Node head;
  private int maxLevel;
  private Random random;
  public SkipList(int maxLevel)
  {
    this.maxLevel = maxLevel;
    this.head = new Node { Forward = new Node[maxLevel + 1] };
    this.random = new Random();
  }
  // Search for a value in the skip list
  public bool Search(int value)
  {
    Node current = head;
    for (int i = maxLevel; i >= 0; i--)
    {
      while (current.Forward[i] != null && current.Forward[i].Data < value)
      {
        current = current.Forward[i];
      }
    }
    current = current.Forward[0];
    return current != null && current.Data == value;
  }
}
```

### 2. Insertion

Find position, insert at level 0, promote via random level generation.

```csharp
public void Insert(int value)
{
  Node[] update = new Node[maxLevel + 1];
  Node current = head;
  for (int i = maxLevel; i >= 0; i--)
  {
    while (current.Forward[i] != null && current.Forward[i].Data < value)
    {
      current = current.Forward[i];
    }
    update[i] = current;
  }
  current = current.Forward[0];
  if (current == null || current.Data != value)
  {
    int level = RandomLevel();
    Node newNode = new Node
    {
      Data = value,
      Forward = new Node[level + 1]
    };
    for (int i = 0; i <= level; i++)
    {
      newNode.Forward[i] = update[i].Forward[i];
      update[i].Forward[i] = newNode;
    }
  }
}
// Generates a random level for the new node
private int RandomLevel()
{
  int level = 0;
  while (random.NextDouble() < 0.5 && level < maxLevel)
  {
    level++;
  }
  return level;
}
```

### 3. Deletion

Locate node, bypass at each level.

```csharp
public void Delete(int value)
{
  Node[] update = new Node[maxLevel + 1];
  Node current = head;
  for (int i = maxLevel; i >= 0; i--)
  {
    while (current.Forward[i] != null && current.Forward[i].Data < value)
    {
      current = current.Forward[i];
    }
    update[i] = current;
  }
  current = current.Forward[0];
  if (current != null && current.Data == value)
  {
    for (int i = 0; i <= maxLevel; i++)
    {
      if (update[i].Forward[i] != current)
      break;
      update[i].Forward[i] = current.Forward[i];
    }
  }
}
```

### Benefits

- **O(log n) average** search, insert, delete — comparable to balanced trees.
- **Probabilistic balance** — avoids worst-case BST degeneration.
- **Simpler implementation** than AVL/Red-Black trees.

### Summary

Skip lists layer linked lists for logarithmic ops — simpler than self-balancing trees, widely used (e.g., Redis sorted sets).
