# Sorting & Searching

## Concept Explanation

**Searching:**
- **Linear search** — scan every element, O(n); works on unsorted data.
- **Binary search** — repeatedly halve a **sorted** array, O(log n). Requires sorted input.

**Sorting** algorithms and their complexities:

| Algorithm | Best | Average | Worst | Space | Stable |
|---|---|---|---|---|---|
| Bubble / Insertion / Selection | O(n)* | O(n²) | O(n²) | O(1) | yes (insertion/bubble) |
| **Merge sort** | O(n log n) | O(n log n) | O(n log n) | O(n) | yes |
| **Quick sort** | O(n log n) | O(n log n) | O(n²) | O(log n) | no |
| **Heap sort** | O(n log n) | O(n log n) | O(n log n) | O(1) | no |
| Counting / Radix | O(n+k) | O(n+k) | O(n+k) | O(n+k) | yes |

\*Insertion sort is O(n) on nearly-sorted data. **Stable** = equal elements keep their relative order.

## Code Example(s)

```csharp
// Binary search on a sorted array — O(log n)
int BinarySearch(int[] a, int target)
{
    int lo = 0, hi = a.Length - 1;
    while (lo <= hi)
    {
        int mid = lo + (hi - lo) / 2;     // avoids integer overflow
        if (a[mid] == target) return mid;
        if (a[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1; // not found
}
```

```csharp
// Merge sort — stable, guaranteed O(n log n). O(n) extra space
int[] MergeSort(int[] a)
{
    if (a.Length <= 1) return a;
    int mid = a.Length / 2;
    var left = MergeSort(a[..mid]);
    var right = MergeSort(a[mid..]);
    return Merge(left, right);
}
int[] Merge(int[] l, int[] r)
{
    var res = new int[l.Length + r.Length];
    int i = 0, j = 0, k = 0;
    while (i < l.Length && j < r.Length)
        res[k++] = l[i] <= r[j] ? l[i++] : r[j++]; // <= keeps it stable
    while (i < l.Length) res[k++] = l[i++];
    while (j < r.Length) res[k++] = r[j++];
    return res;
}
```

## Interview Q&A

**🟢 What's the requirement for binary search?**
The data must be sorted. It then runs in O(log n) by halving the search range each step.

**🟢 What's the time complexity of the common sorting algorithms?**
Bubble/insertion/selection are O(n²). Merge, heap, and (average) quick sort are O(n log n). Counting/radix can be O(n+k) for bounded integer keys.

**🟡 Compare merge sort and quick sort.**
Merge sort guarantees O(n log n) and is stable but uses O(n) extra space. Quick sort is in-place (O(log n) stack) and usually faster in practice due to cache locality, but its worst case is O(n²) (bad pivots) and it's not stable. Quick sort is the common default; merge sort when stability or guaranteed worst case matters (or for linked lists/external sorting).

**🟡 What does "stable sort" mean and why does it matter?**
A stable sort preserves the relative order of equal elements. It matters when sorting by multiple keys (e.g. sort by name, then stably by age keeps name order within each age).

**🔴 Why is comparison-based sorting bounded by O(n log n), and how do counting/radix beat it?**
Any comparison sort must distinguish n! possible orderings; a decision tree needs log₂(n!) ≈ n log n comparisons — so O(n log n) is the lower bound. Counting/radix sort aren't comparison-based; they use the keys' values directly (bucketing by digit/value), achieving O(n+k) when keys are integers in a bounded range.

## ⚠️ Tricky / Gotchas

- **Binary search overflow:** `mid = (lo + hi) / 2` can overflow for huge indices; use `lo + (hi - lo) / 2`.
- **Off-by-one / infinite loops** in binary search — get the `<=` vs `<` and `mid ± 1` right, or it loops forever or misses the target.
- **Binary search needs sorted data** — running it on unsorted input gives wrong results silently (no error).
- **Quick sort's O(n²) worst case** happens with poor pivots (already-sorted data + naive pivot) — use randomized/median-of-three pivots.
- **"Which sort does the language use?"** — many runtimes use hybrids: C#'s `Array.Sort` uses introsort (quick + heap + insertion); it's **not stable**, while `OrderBy` (LINQ) **is** stable.
- **Recursion depth** in merge/quick sort adds O(log n) space (stack); naive quicksort on sorted data can be O(n) depth.

## 📌 Quick Recap

- Linear search O(n) (any data); binary search O(log n) (sorted only).
- O(n²): bubble/insertion/selection. O(n log n): merge (stable, O(n) space), heap (in-place), quick (average; O(n²) worst).
- Comparison sorts ≥ O(n log n); counting/radix O(n+k) for bounded integer keys.
- Stable = equal elements keep order (matters for multi-key sorts).
- Quick sort = fast default; merge sort = stability/guaranteed worst case.
- Binary search: use `lo + (hi-lo)/2`, mind `<=`/`mid±1`; C# `Array.Sort` (introsort) isn't stable, LINQ `OrderBy` is.
