# Data Structures and Algorithms Queues
## Questions Covered

1. What is a queue, and how do you implement it using arrays or linked lists?
2. What are queue operations (enqueue, dequeue, front), and their time complexities?
3. What are circular queues, priority queues, and double-ended queues (deque)?
4. How do you perform level-order traversal of a binary tree using a queue?
## What is a queue, and how do you implement it using arrays or linked lists?

A **queue** follows **FIFO** (First In, First Out) — add at rear, remove from front.

### Queue Operations

1. **Enqueue** — Add to rear.
2. **Dequeue** — Remove from front.
3. **Peek** — View front without removing.
4. **IsEmpty** — Check if empty.

### Implementing a Queue Using Arrays

- Circular array with `front`, `rear`, `size` indices.
- Modular arithmetic avoids shifting — O(1) enqueue/dequeue.

```csharp
using System;
public class QueueUsingArray
{
  private int[] queue;
  private int front, rear, size, capacity;
  public QueueUsingArray(int capacity)
  {
    this.capacity = capacity;
    queue = new int[capacity];
    front = 0;
    rear = -1;
    size = 0;
  }
  // Enqueue operation
  public void Enqueue(int value)
  {
    if (size == capacity)
    throw new InvalidOperationException("Queue is full");
    rear = (rear + 1) % capacity;
    queue[rear] = value;
    size++;
  }
  // Dequeue operation
  public int Dequeue()
  {
    if (size == 0)
    throw new InvalidOperationException("Queue is empty");
    int value = queue[front];
    front = (front + 1) % capacity;
    size--;
    return value;
  }
  // Peek operation
  public int Peek()
  {
    if (size == 0)
    throw new InvalidOperationException("Queue is empty");
    return queue[front];
  }
  // Check if the queue is empty
  public bool IsEmpty()
  {
    return size == 0;
  }
  // Check if the queue is full
  public bool IsFull()
  {
    return size == capacity;
  }
}
public class Program
{
  public static void Main()
  {
    QueueUsingArray queue = new QueueUsingArray(5);
    queue.Enqueue(10);
    queue.Enqueue(20);
    queue.Enqueue(30);
    Console.WriteLine($"Front element: {queue.Peek()}");
    Console.WriteLine($"Dequeued: {queue.Dequeue()}");
    Console.WriteLine($"Dequeued: {queue.Dequeue()}");
    Console.WriteLine($"Is queue empty? {queue.IsEmpty()}");
  }
}
```

### Implementing a Queue Using Linked Lists

- `front` (head) and `rear` (tail) pointers.

```csharp
using System;
public class Node
{
  public int Value;
  public Node Next;
  public Node(int value)
  {
    Value = value;
    Next = null;
  }
}
public class QueueUsingLinkedList
{
  private Node front;
  private Node rear;
  private int size;
  public QueueUsingLinkedList()
  {
    front = null;
    rear = null;
    size = 0;
  }
  // Enqueue operation
  public void Enqueue(int value)
  {
    Node newNode = new Node(value);
    if (rear == null)
    {
      front = newNode;
      rear = newNode;
    }
    else
    {
      rear.Next = newNode;
      rear = newNode;
    }
    size++;
  }
  // Dequeue operation
  public int Dequeue()
  {
    if (front == null)
    throw new InvalidOperationException("Queue is empty");
    int value = front.Value;
    front = front.Next;
    if (front == null)
    rear = null;
    size--;
    return value;
  }
  // Peek operation
  public int Peek()
  {
    if (front == null)
    throw new InvalidOperationException("Queue is empty");
    return front.Value;
  }
  // Check if the queue is empty
  public bool IsEmpty()
  {
    return front == null;
  }
  // Check if the queue is empty
  public int Size()
  {
    return size;
  }
}
public class Program
{
  public static void Main()
  {
    QueueUsingLinkedList queue = new QueueUsingLinkedList();
    queue.Enqueue(10);
    queue.Enqueue(20);
    queue.Enqueue(30);
    Console.WriteLine($"Front element: {queue.Peek()}");
    Console.WriteLine($"Dequeued: {queue.Dequeue()}");
    Console.WriteLine($"Dequeued: {queue.Dequeue()}");
    Console.WriteLine($"Is queue empty? {queue.IsEmpty()}");
  }
}
```

### Summary

| Implementation | Enqueue | Dequeue | Peek | Space |
|----------------|---------|---------|------|-------|
| Circular Array | O(1) | O(1) | O(1) | O(n) capacity |
| Linked List | O(1) | O(1) | O(1) | O(n) + pointers |

Arrays: better locality; may need resize. Linked lists: dynamic size; pointer overhead.
## What are queue operations (enqueue, dequeue, front), and their time complexities?

Core queue ops are **O(1)** for both circular-array and linked-list implementations.

### Queue Operations

1. **Enqueue** — Add to rear.
2. **Dequeue** — Remove from front.
3. **Front (Peek)** — View front element.
4. **IsEmpty** — Check emptiness.

### Array-Based Queue (Circular)

| Operation | Complexity | Notes |
|-----------|------------|-------|
| Enqueue | O(1) | Rear wraps via `% capacity` |
| Dequeue | O(1) | Front advances via modulo |
| Peek | O(1) | Read `queue[front]` |
| IsEmpty | O(1) | `size == 0` |

Non-circular arrays with shifting degrade to O(n).

### Linked List-Based Queue

| Operation | Complexity | Notes |
|-----------|------------|-------|
| Enqueue | O(1) | Append at `rear` |
| Dequeue | O(1) | Advance `front` |
| Peek | O(1) | Read `front.Value` |
| IsEmpty | O(1) | `front == null` |

### Summary

Both implementations deliver O(1) core ops. Choose based on fixed vs dynamic size and memory layout needs.
## What are circular queues, priority queues, and double-ended queues (deque)?

### Circular Queue

**Definition**: Fixed-size array with wrap-around — reuses freed slots at the front.

**Key points**: `front`/`rear` indices; rear wraps to 0 when at end.

| Operation | Complexity |
|-----------|------------|
| Enqueue / Dequeue / Peek / IsEmpty / IsFull | O(1) |

```csharp
using System;
public class CircularQueue
{
  private int[] queue;
  private int front, rear, size, capacity;
  public CircularQueue(int capacity)
  {
    this.capacity = capacity;
    queue = new int[capacity];
    front = 0;
    rear = -1;
    size = 0;
  }
  public void Enqueue(int value)
  {
    if (size == capacity)
    throw new InvalidOperationException("Queue is full");
    rear = (rear + 1) % capacity;
    queue[rear] = value;
    size++;
  }
  public int Dequeue()
  {
    if (size == 0)
    throw new InvalidOperationException("Queue is empty");
    int value = queue[front];
    front = (front + 1) % capacity;
    size--;
    return value;
  }
  public int Peek()
  {
    if (size == 0)
    throw new InvalidOperationException("Queue is empty");
    return queue[front];
  }
  public bool IsEmpty()
  {
    return size == 0;
  }
  public bool IsFull()
  {
    return size == capacity;
  }
}
```

### Priority Queue

**Definition**: Elements dequeued by **priority**, not insertion order. Typically backed by a binary heap.

| Operation | Complexity (heap) |
|-----------|-------------------|
| Enqueue | O(log n) |
| Dequeue | O(log n) |
| Peek | O(1) |

```csharp
using System;
using System.Collections.Generic;
public class PriorityQueue<T>
{
  private SortedDictionary<int, Queue<T>> dict = new SortedDictionary<int, Queue<T>>();
  public void Enqueue(T item, int priority)
  {
    if (!dict.ContainsKey(priority))
    dict[priority] = new Queue<T>();
    dict[priority].Enqueue(item);
  }
  public T Dequeue()
  {
    if (dict.Count == 0)
    throw new InvalidOperationException("Queue is empty");
    var highestPriority = dict.Keys.Max();
    var item = dict[highestPriority].Dequeue();
    if (dict[highestPriority].Count == 0)
    dict.Remove(highestPriority);
    return item;
  }
  public T Peek()
  {
    if (dict.Count == 0)
    throw new InvalidOperationException("Queue is empty");
    var highestPriority = dict.Keys.Max();
    return dict[highestPriority].Peek();
  }
  public bool IsEmpty()
  {
    return dict.Count == 0;
  }
}
```

### Double-Ended Queue (Deque)

**Definition**: Insert/remove at **both** front and rear. Often implemented with doubly linked list.

| Operation | Complexity |
|-----------|------------|
| AddFirst / AddLast / RemoveFirst / RemoveLast / PeekFirst / PeekLast | O(1) |

```csharp
using System;
using System.Collections.Generic;
public class Deque<T>
{
  private LinkedList<T> list = new LinkedList<T>();
  public void AddFirst(T item)
  {
    list.AddFirst(item);
  }
  public void AddLast(T item)
  {
    list.AddLast(item);
  }
  public T RemoveFirst()
  {
    if (list.Count == 0)
    throw new InvalidOperationException("Deque is empty");
    var value = list.First.Value;
    list.RemoveFirst();
    return value;
  }
  public T RemoveLast()
  {
    if (list.Count == 0)
    throw new InvalidOperationException("Deque is empty");
    var value = list.Last.Value;
    list.RemoveLast();
    return value;
  }
  public T PeekFirst()
  {
    if (list.Count == 0)
    throw new InvalidOperationException("Deque is empty");
    return list.First.Value;
  }
  public T PeekLast()
  {
    if (list.Count == 0)
    throw new InvalidOperationException("Deque is empty");
    return list.Last.Value;
  }
  public bool IsEmpty()
  {
    return list.Count == 0;
  }
}
```

### Summary

- **Circular Queue**: Fixed buffer, space-efficient wrap-around.
- **Priority Queue**: Heap-backed priority ordering.
- **Deque**: Two-ended access for sliding-window and BFS variants.
## How do you perform level-order traversal of a binary tree using a queue?

**Level-order (BFS)**: Visit nodes level by level using a queue.

### Steps

1. Enqueue root.
2. While queue not empty: dequeue node, process it, enqueue left then right children.
3. Repeat until queue empty.

### Example Code in C#

```csharp
using System;
using System.Collections.Generic;
public class TreeNode
{
  public int Value;
  public TreeNode Left;
  public TreeNode Right;
  public TreeNode(int value)
  {
    Value = value;
    Left = null;
    Right = null;
  }
}
public class BinaryTree
{
  public TreeNode Root;
  public BinaryTree()
  {
    Root = null;
  }
  public void LevelOrderTraversal()
  {
    if (Root == null)
    return;
    Queue<TreeNode> queue = new Queue<TreeNode>();
    queue.Enqueue(Root);
    while (queue.Count > 0)
    {
      TreeNode current = queue.Dequeue();
      Console.Write(current.Value + " ");
      if (current.Left != null)
      queue.Enqueue(current.Left);
      if (current.Right != null)
      queue.Enqueue(current.Right);
    }
  }
}
public class Program
{
  public static void Main()
  {
    // Create a sample tree:
    // 1
    // / \\
    // 2 3
    // / \\
    // 4 5
    BinaryTree tree = new BinaryTree();
    tree.Root = new TreeNode(1);
    tree.Root.Left = new TreeNode(2);
    tree.Root.Right = new TreeNode(3);
    tree.Root.Left.Left = new TreeNode(4);
    tree.Root.Left.Right = new TreeNode(5);
    Console.WriteLine("Level-order traversal:");
    tree.LevelOrderTraversal(); // Output: 1 2 3 4 5
  }
}
```

### Complexity

- **Time**: O(n) — each node enqueued/dequeued once.
- **Space**: O(w) — w = max tree width (queue size at widest level).

Useful for printing trees, level-specific queries, and BFS-based problems.
