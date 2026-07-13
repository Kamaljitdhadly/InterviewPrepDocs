# Data Structures and Algorithms Heap Sort

**Heap Sort**

**Heap Sort** is a comparison-based sorting algorithm that uses a **Binary Heap** data structure.

It is based on the idea:

1.  Build a **Max Heap** from the array.

2.  The largest element will be at the root.

3.  Move the root element to the end.

4.  Reduce the heap size and repeat.

In simple terms:

Heap Sort repeatedly extracts the largest element and places it in its correct position.

**First Understand Heap**

A **Heap** is a special type of **complete binary tree**.

There are two types:

**1. Max Heap**

Parent node is greater than its children.

Example:

50

/ \\

30 40

/ \\

10 20

Property:

Parent \>= Children

The largest element is always at the root.

**2. Min Heap**

Parent node is smaller than its children.

Example:

10

/ \\

20 30

The smallest element is at the root.

For Heap Sort (ascending order), we use a **Max Heap**.

**How Heap Sort Works**

Suppose we have:

\[4, 10, 3, 5, 1\]

**Step 1: Build Max Heap**

Convert array into a max heap.

Before:

\[4,10,3,5,1\]

Tree representation:

4

/ \\

10 3

/ \\

5 1

This violates heap property because:

10 \> 4

After heapifying:

10

/ \\

5 3

/ \\

4 1

Array:

\[10,5,3,4,1\]

Now the largest element is at index 0.

**Step 2: Move Maximum to End**

Swap root with last element:

\[10,5,3,4,1\]

Swap 10 and 1

\[1,5,3,4,10\]

Now:

10 is sorted

Ignore it.

Heap size becomes:

\[1,5,3,4\]

**Step 3: Heapify Again**

The remaining heap:

1

/ \\

5 3

/

4

is invalid.

Move the largest child up:

5

/ \\

4 3

/

1

Array:

\[5,4,3,1,10\]

**Step 4: Repeat**

Extract maximum:

\[4,1,3,5,10\]

Heapify:

\[4,3,1,5,10\]

Continue:

Final sorted array:

\[1,3,4,5,10\]

**Algorithm Steps**

1\. Build Max Heap

2\. Swap first element with last

3\. Remove last element from heap

4\. Heapify remaining heap

5\. Repeat until sorted

**C# Implementation**

void HeapSort(int\[\] arr)

{

int n = arr.Length;

// Build max heap

for(int i = n / 2 - 1; i \>= 0; i--)

{

Heapify(arr, n, i);

}

// Extract elements

for(int i = n - 1; i \> 0; i--)

{

int temp = arr\[0\];

arr\[0\] = arr\[i\];

arr\[i\] = temp;

Heapify(arr, i, 0);

}

}

void Heapify(int\[\] arr, int n, int i)

{

int largest = i;

int left = 2 \* i + 1;

int right = 2 \* i + 2;

if(left \< n && arr\[left\] \> arr\[largest\])

largest = left;

if(right \< n && arr\[right\] \> arr\[largest\])

largest = right;

if(largest != i)

{

int swap = arr\[i\];

arr\[i\] = arr\[largest\];

arr\[largest\] = swap;

Heapify(arr, n, largest);

}

}

**Understanding Heap Indexing**

Heap is stored as an array.

For a node at index i:

Parent:

(i - 1) / 2

Left child:

2\*i + 1

Right child:

2\*i + 2

Example:

Array:

Index: 0 1 2 3 4

Value: 50 30 40 10 20

Tree:

50

/ \\

30 40

/ \\

10 20

**Time Complexity**

**Building Heap**

Creating heap:

O(n)

**Extracting Elements**

Each extraction requires heapify:

O(log n)

For n elements:

n × log n

Final complexity:

| **Case** | **Complexity** |
|----------|----------------|
| Best     | O(n log n)     |
| Average  | O(n log n)     |
| Worst    | O(n log n)     |

Unlike Quick Sort, Heap Sort always guarantees O(n log n).

**Space Complexity**

Heap Sort is an **in-place algorithm**.

Extra memory:

O(1)

Only a few variables are used.

**Heap Sort Properties**

| **Property**          | **Answer**                   |
|-----------------------|------------------------------|
| Stable?               | ❌ No                        |
| In-place?             | ✅ Yes                       |
| Recursive?            | Usually heapify is recursive |
| Worst case guarantee? | ✅ O(n log n)                |

**Heap Sort vs Quick Sort vs Merge Sort**

| **Feature** | **Heap Sort** | **Quick Sort**  | **Merge Sort** |
|-------------|---------------|-----------------|----------------|
| Average     | O(n log n)    | O(n log n)      | O(n log n)     |
| Worst       | O(n log n)    | O(n²)           | O(n log n)     |
| Space       | O(1)          | O(log n)        | O(n)           |
| Stable      | No            | No              | Yes            |
| Speed       | Good          | Usually fastest | Good           |

**Real-World Usage**

Heap Sort is useful when:

**1. Memory is limited**

Because:

Space = O(1)

Example:

- Embedded systems

- Memory-constrained applications

**2. Priority Queue Implementation**

Heaps are widely used for:

- Task scheduling

- Job processing

- Dijkstra's shortest path algorithm

- Top K problems

Example:

Highest priority task

↓

Heap

↓

Execute first

**3. Finding K Largest Elements**

Example:

Find top 10 salaries from millions of records.

Use:

Min Heap of size 10

Complexity:

O(n log k)

**Interview Questions**

**Q1. Why does Heap Sort use Max Heap?**

Because in ascending sorting, we need to repeatedly extract the largest element.

**Q2. Why is Heap Sort better than Quick Sort in worst case?**

Quick Sort can degrade to:

O(n²)

Heap Sort always remains:

O(n log n)

**Q3. Why is Heap Sort not stable?**

Because swapping elements can change the relative order of equal elements.

Example:

Before:

(A,5), (B,5)

After swapping:

(B,5), (A,5)

Order changed.

**Summary**

Heap Sort follows:

Build Max Heap

\|

Extract Maximum

\|

Move to End

\|

Heapify Remaining

\|

Repeat

Key points:

- Uses **Binary Heap**

- Time complexity: **O(n log n)**

- Space complexity: **O(1)**

- In-place: **Yes**

- Stable: **No**

Heap Sort is especially important because it connects **sorting, priority queues, and tree data structures**.
