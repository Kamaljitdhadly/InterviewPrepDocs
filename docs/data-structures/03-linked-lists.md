# Linked Lists

## Concept Explanation

A **linked list** stores elements in **nodes**, each holding a value and a **pointer** to the next node (and previous, in a doubly-linked list). Unlike arrays, nodes aren't contiguous in memory.

- **Singly linked** — each node points to the next; traverse forward only.
- **Doubly linked** — nodes point both ways; `LinkedList<T>` in C# is doubly linked.
- **Circular** — the last node points back to the head.

**Trade-offs vs arrays:** insertion/deletion at a known position is **O(1)** (just relink pointers) — no shifting. But there's **no random access** — finding the k-th element is O(n), and the pointers cost extra memory + hurt cache locality.

## Code Example(s)

```csharp
class Node
{
    public int Value;
    public Node? Next;
    public Node(int v) => Value = v;
}

// Reverse a singly linked list — O(n) time, O(1) space (classic interview question)
Node? Reverse(Node? head)
{
    Node? prev = null, curr = head;
    while (curr != null)
    {
        Node? next = curr.Next;  // save next
        curr.Next = prev;        // reverse the pointer
        prev = curr;             // advance prev
        curr = next;             // advance curr
    }
    return prev;                 // new head
}
```

```csharp
// Floyd's cycle detection (fast & slow pointers) — O(n) time, O(1) space
bool HasCycle(Node? head)
{
    Node? slow = head, fast = head;
    while (fast?.Next != null)
    {
        slow = slow!.Next;       // moves 1
        fast = fast.Next.Next;   // moves 2
        if (slow == fast) return true; // they meet → cycle
    }
    return false;
}
```

## Interview Q&A

**🟢 What's the advantage of a linked list over an array?**
Insertion and deletion at a known node is O(1) (relink pointers, no shifting), and it grows without resizing/reallocation. Arrays need O(n) shifts for mid insert/delete.

**🟢 What's the disadvantage?**
No O(1) random access — reaching the k-th element is O(n). Extra memory for pointers and poor cache locality (nodes scattered in memory).

**🟡 How do you detect a cycle in a linked list?**
Floyd's algorithm: two pointers, one moving one step and one two steps. If they ever meet, there's a cycle; if the fast pointer reaches null, there isn't. O(n) time, O(1) space.

**🟡 How do you find the middle of a linked list in one pass?**
Fast/slow pointers: move slow by 1 and fast by 2; when fast reaches the end, slow is at the middle. O(n) time, O(1) space.

**🔴 What's the difference between singly and doubly linked lists, and when use each?**
Singly uses less memory (one pointer) but only forward traversal and O(n) to delete a node given only its pointer (need the previous). Doubly allows backward traversal and O(1) deletion given a node, at the cost of an extra pointer per node. Use doubly when you need bidirectional access (e.g. LRU cache).

## ⚠️ Tricky / Gotchas

- **Losing the `next` pointer during reversal** — you must save `curr.Next` *before* reassigning it, or you lose the rest of the list.
- **Null-reference errors** at the head/tail — always check for empty list and end-of-list. Edge cases (0, 1, 2 nodes) break naive code.
- **Deleting a node in a singly list requires the previous node** — O(n) to find it (unless you use the trick of copying the next node's value).
- **A "dummy/sentinel head" node** simplifies insertions/deletions at the head — a common technique people forget.
- **Don't index a linked list in a loop** (`for i: list[i]`) — that's O(n²); traverse with a node pointer instead.

## 📌 Quick Recap

- Linked list = nodes + pointers; not contiguous, no O(1) random access.
- O(1) insert/delete at a known node (relink); O(n) to find by position.
- Singly (forward, 1 pointer) vs doubly (both ways, O(1) delete) vs circular.
- Fast/slow pointers: cycle detection (Floyd) and finding the middle in O(n)/O(1).
- Reversal: save next before relinking; use a dummy head for edge cases.
- Watch null/empty/single-node edge cases.
