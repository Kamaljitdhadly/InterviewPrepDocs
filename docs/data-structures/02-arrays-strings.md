# Arrays & Strings

## Concept Explanation

An **array** is a contiguous block of memory holding elements of the same type, accessed by index in **O(1)**. Size is fixed at creation. A **dynamic array** (`List<T>` in C#) grows automatically by reallocating to a larger backing array when full.

**Strings** are sequences of characters; in C# (and Java/JS) they're **immutable**, so each "modification" creates a new string — use `StringBuilder` for repeated edits.

**Key trade-offs:** arrays give fast random access (O(1)) and cache-friendly iteration, but insertion/deletion in the middle is O(n) (elements must shift). Searching an unsorted array is O(n).

Common interview techniques: **two pointers**, **sliding window**, **prefix sums**, and using a hash set/map for O(1) lookups.

## Code Example(s)

```csharp
int[] arr = { 5, 2, 8, 1 };
int x = arr[2];               // O(1) random access → 8
Array.Sort(arr);             // O(n log n) → {1,2,5,8}

var list = new List<int>();
list.Add(9);                 // O(1) amortized
list.Insert(0, 7);           // O(n) — shifts everything right
```

```csharp
// Two-pointer: is the array a palindrome? O(n) time, O(1) space
bool IsPalindrome(int[] a)
{
    int lo = 0, hi = a.Length - 1;
    while (lo < hi)
        if (a[lo++] != a[hi--]) return false;
    return true;
}

// Sliding window: max sum of any k consecutive elements — O(n)
int MaxSubarraySum(int[] a, int k)
{
    int sum = 0;
    for (int i = 0; i < k; i++) sum += a[i];
    int best = sum;
    for (int i = k; i < a.Length; i++)
    {
        sum += a[i] - a[i - k];     // slide: add new, drop oldest
        best = Math.Max(best, sum);
    }
    return best;
}
```

## Interview Q&A

**🟢 What's the time complexity of accessing an array element by index?**
O(1) — the address is computed directly from the base address and index.

**🟢 Why is inserting into the middle of an array O(n)?**
Because all elements after the insertion point must shift by one position to make room (or to close a gap on deletion).

**🟡 What's the difference between an array and a `List<T>`?**
An array has fixed size; `List<T>` is a dynamic array that resizes automatically (doubling the backing array), giving O(1) amortized append while keeping O(1) index access.

**🟡 What is the two-pointer technique?**
Using two indices that move through the array (toward each other, or at different speeds) to solve problems in O(n)/O(1) instead of brute force — e.g. palindrome check, pair-sum in a sorted array, removing duplicates.

**🔴 How would you find two numbers that sum to a target in O(n)?**
Iterate once with a hash set: for each number `x`, check if `target - x` is already seen; if so, return the pair; otherwise add `x`. O(n) time, O(n) space — better than the O(n²) nested-loop approach.

## ⚠️ Tricky / Gotchas

- **String concatenation in a loop is O(n²)** — each `+` allocates a new string and copies. Use `StringBuilder`.

```csharp
string s = "";
for (int i = 0; i < n; i++) s += i;   // ❌ O(n^2)
var sb = new StringBuilder();
for (int i = 0; i < n; i++) sb.Append(i); // ✅ O(n)
```

- **Off-by-one errors** at boundaries (`<=` vs `<`, `length` vs `length-1`) are the #1 array bug — reason carefully about the last index.
- **`List<T>.Contains` is O(n)**, not O(1). For frequent membership tests use a `HashSet<T>`.
- **Modifying a collection while iterating it** throws `InvalidOperationException` in C# — iterate a copy or use an index-based loop.
- **Multidimensional `int[,]` vs jagged `int[][]`** differ in memory layout and performance; jagged arrays are rows of separate arrays.

## 📌 Quick Recap

- Array: contiguous, O(1) index access, fixed size, cache-friendly; mid insert/delete O(n).
- `List<T>` = dynamic array: O(1) amortized append, O(1) index, auto-resize.
- Strings are immutable → use `StringBuilder` to avoid O(n²) concatenation.
- Techniques: two pointers, sliding window, prefix sums, hash set for O(1) lookups.
- Use a hash set to turn O(n²) pair/duplicate problems into O(n).
- Watch off-by-one errors; `Contains` on a list is O(n).
