# Heaps & Priority Queues

## Concept Explanation

A **heap** is a **complete binary tree** (filled left-to-right) satisfying the **heap property**:
- **Min-heap** — every parent ≤ its children → the **minimum** is at the root.
- **Max-heap** — every parent ≥ its children → the **maximum** is at the root.

Heaps are usually stored in an **array** (no pointers): for index `i`, children are at `2i+1`/`2i+2` and the parent at `(i-1)/2`. Operations:
- **Peek** (min/max) → O(1).
- **Insert** (push, then "bubble up") → O(log n).
- **Extract-min/max** (pop root, move last to root, "sift down") → O(log n).

A **priority queue** is the abstract type "always remove the highest-priority element"; it's typically implemented with a heap. C# has **`PriorityQueue<TElement, TPriority>`** (a min-heap by priority).

## Code Example(s)

```csharp
// C# PriorityQueue is a MIN-heap: lowest priority value dequeues first
var pq = new PriorityQueue<string, int>();
pq.Enqueue("low", 5);
pq.Enqueue("urgent", 1);
pq.Enqueue("medium", 3);
Console.WriteLine(pq.Dequeue()); // "urgent" (priority 1 = smallest)
```

```csharp
// Top-K largest elements using a MIN-heap of size k — O(n log k)
int[] TopK(int[] nums, int k)
{
    var minHeap = new PriorityQueue<int, int>();
    foreach (int n in nums)
    {
        minHeap.Enqueue(n, n);
        if (minHeap.Count > k)
            minHeap.Dequeue();        // drop the smallest → keep k largest
    }
    return minHeap.UnorderedItems.Select(x => x.Element).ToArray();
}
```

```csharp
// Max-heap in C#: negate priorities, or use a custom comparer
var maxHeap = new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b - a));
```

## Interview Q&A

**🟢 What is a heap?**
A complete binary tree where each parent is ordered relative to its children (min-heap: parent ≤ children; max-heap: parent ≥ children), giving O(1) access to the min/max and O(log n) insert/extract.

**🟢 What's the difference between a heap and a BST?**
A heap only guarantees the root is the min/max and is great for priority access; it has no total ordering, so searching for an arbitrary value is O(n). A BST keeps all elements ordered, enabling O(log n) search of any value but no O(1) min/max-by-root (though min/max are the leftmost/rightmost).

**🟡 What are the time complexities of heap operations?**
Peek min/max: O(1). Insert: O(log n). Extract-min/max: O(log n). Building a heap from n items: O(n) with heapify (not O(n log n)).

**🟡 How would you find the k largest elements efficiently?**
Maintain a min-heap of size k: push each element, and when size exceeds k, pop the smallest. At the end the heap holds the k largest. O(n log k) time, O(k) space — better than sorting everything (O(n log n)) when k ≪ n.

**🔴 How is a heap stored in an array and why is that efficient?**
As a complete tree it maps to a contiguous array: node `i`'s children are at `2i+1` and `2i+2`, parent at `(i-1)/2`. This needs no pointers, is cache-friendly, and makes bubble-up/sift-down simple index arithmetic.

## ⚠️ Tricky / Gotchas

- **C#'s `PriorityQueue` is a min-heap** — smallest priority dequeues first. For a max-heap, negate the priority or supply a reversed comparer (a common mistake to forget).
- **Heaps don't support efficient arbitrary search/removal** — finding/removing a non-root element is O(n). Use a different structure if you need that.
- **`UnorderedItems` is not sorted** — enumerating a heap does NOT give sorted order; only repeated `Dequeue` does.
- **Building a heap is O(n), not O(n log n)** — via bottom-up heapify; a frequent complexity-question trap.
- **No stable ordering for equal priorities** — `PriorityQueue` doesn't guarantee FIFO among equal priorities; add a tiebreaker (e.g. an incrementing sequence) if needed.

## 📌 Quick Recap

- Heap = complete binary tree; min-heap (min at root) / max-heap (max at root).
- Array-backed: children `2i+1`/`2i+2`, parent `(i-1)/2`; no pointers, cache-friendly.
- Peek O(1); insert/extract O(log n); build-heap O(n).
- Priority queue = "highest priority first," usually a heap; C# `PriorityQueue` is a min-heap (negate/comparer for max).
- Top-K: min-heap of size k → O(n log k).
- No efficient arbitrary search/removal; `UnorderedItems` isn't sorted; ties aren't FIFO.
