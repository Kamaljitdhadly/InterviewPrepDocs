# Data Structures and Algorithms Basics

## Questions Covered

1. What is Big O notation, and how does it help in analyzing the performance of algorithms?
2. What is the difference between Big O, Big Theta (Θ), and Big Omega (Ω) notations?
3. What are the time complexity and space complexity?
4. What are the time complexities and space complexities for common operations in data structures (e.g., arrays, linked lists, stacks, queues)?
5. How do nested loops and recursion impact time complexity?
6. What are the Big O notations for the following complexities: (Constant time (O(1)), Logarithmic time (O(log n)), Linear time (O(n)), Quadratic time (O(n²)), Cubic time (O(n³)), Exponential time (O(2^n)))

## What is Big O notation, and how does it help in analyzing the performance of algorithms?

**Big O notation** describes the **upper bound** of an algorithm's runtime or space as input size grows.

| Benefit | Description |
|---------|-------------|
| **Growth rates** | Shows how performance scales — **O(n)** linear vs **O(n²)** quadratic |
| **Ignores constants** | Focuses on dominant term; hardware/implementation details matter less |
| **Worst-case** | Guarantees performance ceiling regardless of input |
| **Comparison** | Pick the best algorithm for size and constraints |

**Common notations:** **O(1)** constant · **O(log n)** logarithmic · **O(n)** linear · **O(n log n)** linearithmic · **O(n²)** quadratic · **O(2^n)** exponential · **O(n!)** factorial

## What is the difference between Big O, Big Theta (Θ), and Big Omega (Ω) notations?

| Notation | Bound | Scenario | Formal (T(n) = runtime) |
|----------|-------|----------|-------------------------|
| **Big O (O)** | Upper | Worst-case max growth | T(n) ≤ c·f(n) for n ≥ n₀ |
| **Big Theta (Θ)** | Tight (upper + lower) | Exact asymptotic rate | c₁·f(n) ≤ T(n) ≤ c₂·f(n) |
| **Big Omega (Ω)** | Lower | Best-case min growth | T(n) ≥ c·f(n) for n ≥ n₀ |

- **O**: "at most" — e.g. **O(n²)** worst case grows quadratically
- **Θ**: "exactly" — e.g. **Θ(n²)** always quadratic
- **Ω**: "at least" — e.g. **Ω(n)** at least linear

<img src="extracted\Data Structures and Algorithms\media/media/image1.png" style="width:6.41875in;height:3.8375in" />

## What are the time complexity and space complexity?

<img src="extracted\Data Structures and Algorithms\media/media/image2.png" style="width:5.86042in;height:5.61597in" />

| Metric | Measures | Focus |
|--------|----------|-------|
| **Time complexity** | Execution time vs input size | How runtime scales |
| **Space complexity** | Memory usage vs input size | How storage scales |

**Time classes:** **O(1)**, **O(log n)**, **O(n)**, **O(n log n)**, **O(n²)**, **O(2^n)**, **O(n!)**

**Space classes:** **O(1)** fixed · **O(n)** linear · **O(n²)** quadratic

**Example — sum array:**

```csharp
public int SumArray(int[] array) {
  int sum = 0; // Constant space
  for (int i = 0; i < array.Length; i++) { // Linear time complexity
  sum += array[i];
}
return sum;
}
```

- **Time:** **O(n)** — single pass
- **Space:** **O(1)** — only `sum` variable

## What are the time complexities and space complexities for common operations in data structures (e.g., arrays, linked lists, stacks, queues)?

### Arrays

| Operation | Time | Space |
|-----------|------|-------|
| Access | **O(1)** | **O(n)** |
| Search | **O(n)** unsorted / **O(log n)** sorted | **O(1)** |
| Insert / Delete | **O(n)** (shift elements) | **O(n)** |

### Linked Lists

| Operation | Time | Space |
|-----------|------|-------|
| Access / Search | **O(n)** | **O(1)** |
| Insert / Delete | **O(1)** with known node ref | **O(1)** |

### Stacks & Queues

| Operation | Time | Space |
|-----------|------|-------|
| Push / Pop / Peek (stack) | **O(1)** | **O(1)** |
| Enqueue / Dequeue / Peek (queue) | **O(1)** | **O(1)** |

**Takeaway:** Arrays — fast access, costly insert/delete. Linked lists — opposite. Stacks/queues — all core ops **O(1)**.

## How do nested loops and recursion impact time complexity?

### Nested Loops

Complexity = **product** of loop sizes. **k** nested loops × **n** iterations each → **O(n^k)**.

- **Single loop** — **O(n)**:

```csharp
for (int i = 0; i < n; i++) {
  // Constant time operation
}
The loop runs nnn times, so the time complexity is **O(n)**.
```

- **Two nested** — **O(n²)**:

```csharp
for (int i = 0; i < n; i++) {
  for (int j = 0; j < n; j++) {
    // Constant time operation
  }
}
The inner loop runs n times for each iteration of the outer loop, resulting in n×n= n² operations, so the time complexity is **O(n²)**.
```

- **Three nested** — **O(n³)**:

```csharp
for (int i = 0; i < n; i++) {
  for (int j = 0; j < n; j++) {
    for (int k = 0; k < n; k++) {
      // Constant time operation
    }
  }
}
The total number of operations is n×n×n= n³, so the time complexity is **O(n³)**.
```

### Recursion

Depends on calls per level and work per call.

- **Linear** — one call per level → **O(n)**:

```csharp
int sum(int n) {
  if (n <= 1) return n;
  return n + sum(n - 1);
}
This function is called n times, so the time complexity is **O(n)**.
```

- **Binary** — two calls per level:
  - Binary search: **O(log n)** (halve input)
  - Merge sort: **O(n \log n)** (halve + linear merge)

Merge Sort Example

```csharp
void mergeSort(int[] arr) {
  if (arr.length < 2) return;
  int mid = arr.length / 2;
  int[] left = Arrays.copyOfRange(arr, 0, mid);
  int[] right = Arrays.copyOfRange(arr, mid, arr.length);
  mergeSort(left);
  mergeSort(right);
  merge(left, right, arr);
}
Merge sort splits the array into two halves recursively (logarithmic factor) and merges the sorted halves (linear factor), resulting in **O(n \log n)** complexity.
```

- **Exponential** — multiple calls per level → **O(2^n)** (naive Fibonacci):

```csharp
int fibonacci(int n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
Each call to fibonacci(n) makes two further recursive calls, leading to a time complexity of **O(2^n)**.
```

| Pattern | Complexity |
|---------|------------|
| k nested loops | **O(n^k)** |
| Linear recursion | **O(n)** |
| Binary search | **O(log n)** |
| Merge sort | **O(n log n)** |
| Exponential recursion | **O(2^n)** |

## What are the Big O notations for the following complexities: (Constant time (O(1)), Logarithmic time (O(log n)), Linear time (O(n)), Quadratic time (O(n²)), Cubic time (O(n³)), Exponential time (O(2^n)))

| Notation | Growth | Cause | Example |
|----------|--------|-------|---------|
| **O(1)** | Constant | Fixed work regardless of n | Array index access |
| **O(log n)** | Logarithmic | Halve input each step | Binary search |
| **O(n)** | Linear | Single pass over input | Array iteration |
| **O(n²)** | Quadratic | Two nested n-loops | Bubble/insertion sort |
| **O(n³)** | Cubic | Three nested n-loops | Naive matrix multiply |
| **O(2ⁿ)** | Exponential | Branching doubles work | Naive Fibonacci recursion |
