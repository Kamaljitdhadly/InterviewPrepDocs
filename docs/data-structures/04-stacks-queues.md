# Stacks & Queues

## Concept Explanation

Both are linear structures defined by **how you add/remove** elements:

- **Stack — LIFO** (Last In, First Out). `Push` adds to the top, `Pop`/`Peek` removes/reads the top. Think of a stack of plates. Uses: function call stack, undo, expression evaluation, backtracking, DFS.
- **Queue — FIFO** (First In, First Out). `Enqueue` adds to the back, `Dequeue`/`Peek` removes/reads the front. Think of a line of people. Uses: task scheduling, BFS, buffering, producer/consumer.

Variants: **Deque** (double-ended, add/remove both ends), **Priority Queue** (highest priority first — see Heaps), **Circular Queue** (fixed-size ring buffer).

All core operations are **O(1)**.

## Code Example(s)

```csharp
// Stack (LIFO)
var stack = new Stack<int>();
stack.Push(1); stack.Push(2); stack.Push(3);
Console.WriteLine(stack.Pop());  // 3 (last in, first out)
Console.WriteLine(stack.Peek()); // 2 (top, not removed)

// Queue (FIFO)
var queue = new Queue<int>();
queue.Enqueue(1); queue.Enqueue(2); queue.Enqueue(3);
Console.WriteLine(queue.Dequeue()); // 1 (first in, first out)
Console.WriteLine(queue.Peek());    // 2 (front, not removed)
```

```csharp
// Classic stack problem: are the brackets balanced? O(n)
bool IsBalanced(string s)
{
    var stack = new Stack<char>();
    var pairs = new Dictionary<char, char> { [')']='(', [']']='[', ['}']='{' };
    foreach (char c in s)
    {
        if (c is '(' or '[' or '{') stack.Push(c);
        else if (pairs.ContainsKey(c))
        {
            if (stack.Count == 0 || stack.Pop() != pairs[c]) return false;
        }
    }
    return stack.Count == 0; // leftovers = unbalanced
}
```

## Interview Q&A

**🟢 What's the difference between a stack and a queue?**
A stack is LIFO — the last element added is the first removed. A queue is FIFO — the first element added is the first removed.

**🟢 Give real-world uses of each.**
Stack: function call stack, undo/redo, browser back button, DFS, expression parsing. Queue: print/task scheduling, BFS, message buffers, request handling.

**🟡 How would you implement a queue using two stacks?**
Use an `inbox` stack for enqueues and an `outbox` stack for dequeues. To dequeue, if `outbox` is empty, pop everything from `inbox` into `outbox` (reversing order), then pop from `outbox`. Amortized O(1) per operation.

**🟡 What is a deque?**
A double-ended queue allowing insertion and removal at both ends in O(1). It can act as both a stack and a queue and is useful for sliding-window problems.

**🔴 Where is the stack used implicitly in recursion, and what's the risk?**
Each recursive call pushes a frame onto the **call stack** (parameters, locals, return address). Too-deep recursion overflows it → `StackOverflowException`. Converting recursion to iteration with an explicit stack avoids this for very deep inputs.

## ⚠️ Tricky / Gotchas

- **Calling `Pop`/`Peek` on an empty stack/queue throws** `InvalidOperationException` — always check `Count > 0` first.
- **C# has no built-in `Deque`** — use `LinkedList<T>` or a `List<T>`-based ring buffer; people assume `Queue<T>` is double-ended (it isn't).
- **Stack overflow from deep recursion** — DFS on a huge/skewed structure can blow the call stack; use an explicit stack for iterative DFS.
- **Queue ≠ priority queue** — a plain queue is strict FIFO; if you need "most important first," use a priority queue/heap (C#'s `PriorityQueue<TElement,TPriority>`).
- **`Stack<T>` enumeration order** is top-to-bottom (LIFO), which can surprise when debugging.

## 📌 Quick Recap

- Stack = LIFO (Push/Pop/Peek); Queue = FIFO (Enqueue/Dequeue/Peek); all O(1).
- Stack uses: call stack, undo, DFS, expression/bracket matching, backtracking.
- Queue uses: scheduling, BFS, buffering, producer/consumer.
- Deque = both ends O(1); Priority Queue = highest priority first (heap).
- Recursion uses the call stack implicitly → deep recursion risks overflow.
- Check `Count` before Pop/Peek; C# lacks a built-in Deque.
