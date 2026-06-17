# Big-O & Complexity Analysis

## Concept Explanation

**Big-O notation** describes how an algorithm's **time** or **space** requirements grow as the input size `n` grows — focusing on the **worst case** and **dominant term**, ignoring constants and lower-order terms. It lets you compare algorithms independent of hardware.

Common complexities, fastest → slowest:

| Big-O | Name | Example |
|---|---|---|
| O(1) | constant | array index, hash lookup |
| O(log n) | logarithmic | binary search |
| O(n) | linear | scanning an array |
| O(n log n) | linearithmic | efficient sorts (merge/quick) |
| O(n²) | quadratic | nested loops, bubble sort |
| O(2ⁿ) | exponential | naive recursion (subsets) |
| O(n!) | factorial | permutations, brute-force TSP |

You also analyze **best / average / worst** case, and **amortized** cost (average over a sequence of operations).

## Code Example(s)

```csharp
// O(1) — constant: independent of n
int First(int[] a) => a[0];

// O(n) — linear: one pass
int Sum(int[] a) { int s = 0; foreach (var x in a) s += x; return s; }

// O(n^2) — quadratic: nested loops over n
bool HasDuplicateBrute(int[] a)
{
    for (int i = 0; i < a.Length; i++)
        for (int j = i + 1; j < a.Length; j++)
            if (a[i] == a[j]) return true;
    return false;
}

// O(n) time, O(n) space — trading space to drop from O(n^2) to O(n)
bool HasDuplicateFast(int[] a)
{
    var seen = new HashSet<int>();
    foreach (var x in a)
        if (!seen.Add(x)) return true; // Add returns false if already present
    return false;
}

// O(log n) — halving the search space each step
int BinarySearch(int[] sorted, int target) { /* see Sorting & Searching */ return -1; }
```

## Interview Q&A

**🟢 What is Big-O notation?**
A way to express how an algorithm's running time or memory scales with input size, focusing on the dominant term and worst case, ignoring constants.

**🟢 What's the time complexity of a single loop vs two nested loops over `n`?**
A single loop is O(n); two nested loops over the same `n` are O(n²). Each additional nested level over `n` multiplies by another factor of n.

**🟡 Why do we ignore constants and lower-order terms?**
Because Big-O describes asymptotic growth — for large `n`, the dominant term dwarfs constants and smaller terms. `3n + 5` and `n` both grow linearly, so both are O(n).

**🟡 What's the difference between time and space complexity?**
Time complexity measures operations as `n` grows; space complexity measures extra memory used. They often trade off — e.g. using a hash set (more space) to make duplicate detection O(n) instead of O(n²).

**🔴 What is amortized complexity? Give an example.**
The average cost per operation over a sequence, even if individual operations vary. Example: appending to a dynamic array (`List<T>.Add`) is O(1) **amortized** — most adds are O(1), but occasional resizes are O(n); spread over many adds, the average is O(1).

## ⚠️ Tricky / Gotchas

- **O(2n) and O(n + 1000) are both O(n)** — constants drop. But in *practice* constants matter; Big-O isn't the whole story for small `n`.
- **Logarithm base doesn't matter** in Big-O — `log₂ n` and `log₁₀ n` differ by a constant factor, so both are O(log n).
- **Best case is rarely useful** — interviewers care about worst (and average) case. Quicksort is O(n log n) average but O(n²) worst case.
- **Hidden costs:** `string` concatenation in a loop is O(n²) (each `+` copies); `list.Contains` is O(n), not O(1) like a `HashSet`.
- **Space includes the call stack** — recursion depth counts. A recursive function `n` deep uses O(n) stack space even if it looks "in place".
- **Two separate loops are O(n + n) = O(n), not O(n²)** — only *nested* loops multiply.

## 📌 Quick Recap

- Big-O = asymptotic growth of time/space, worst case, dominant term, drop constants.
- Order: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!).
- Nested loops multiply; sequential loops add.
- Time/space often trade off (hash set → O(n) duplicate check).
- Amortized = average over a sequence (e.g. dynamic array append = O(1) amortized).
- Recursion depth counts as space; watch hidden O(n) ops (`Contains`, string `+`).
