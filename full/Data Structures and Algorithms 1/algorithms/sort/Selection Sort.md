# Data Structures and Algorithms Selection Sort

Selection Sort

**Selection Sort** is a simple comparison-based sorting algorithm.

The main idea:

Find the smallest element from the unsorted part and place it at the beginning.

It divides the array into two parts:

- **Sorted part** → elements already placed correctly.

- **Unsorted part** → elements that still need sorting.

Pass 1: scan the unsorted suffix

Comparison 1 of 7·0 sorted

Minimum 6Comparing 3

6

3

8

2

7

1

5

4

1

2

3

4

5

6

7

8

Compare 3 with 6; the bars stay fixed while this pass scans

Selection step

![](media/image1.wmf)

### Example

- Given:

- \[64, 25, 12, 22, 11\]

We want ascending order:

- \[11, 12, 22, 25, 64\]

### How Selection Sort Works

Initially:

Sorted Unsorted

- \[\] \[64,25,12,22,11\]

Pass 1

Find the smallest element in the unsorted part:

- \[64,25,12,22,11\]

Minimum = 11

Swap it with the first element:

- \[11,25,12,22,64\]

Now:

Sorted Unsorted

- \[11\] \[25,12,22,64\]

11 is in its final position.

Pass 2

Find minimum in:

- \[25,12,22,64\]

Minimum:

12

Swap with first unsorted element:

- \[11,12,25,22,64\]

Now:

Sorted Unsorted

- \[11,12\] \[25,22,64\]

Pass 3

Find minimum:

- \[25,22,64\]

Minimum:

22

Swap:

- \[11,12,22,25,64\]

Pass 4

Remaining:

- \[25,64\]

Minimum:

25

Already correct.

Final:

- \[11,12,22,25,64\]

### Algorithm Steps

- Start from the first index.

- Search the smallest element in the remaining array.

- Swap it with the current position.

- Move the boundary of the sorted section forward.

- Repeat until the array is sorted.

C# Implementation

- void SelectionSort(int\[\] arr)

{

int n = arr.Length;

for(int i = 0; i \< n - 1; i++)

{

int minIndex = i;

// Find minimum element

for(int j = i + 1; j \< n; j++)

{

- if(arr\[j\] \< arr\[minIndex\])

{

minIndex = j;

}

}

// Swap minimum with current position

- int temp = arr\[i\];

- arr\[i\] = arr\[minIndex\];

- arr\[minIndex\] = temp;

}

}

Understanding the Code

Example:

- \[64,25,12,22,11\]

First iteration:

i = 0

Assume:

minIndex = 0

Meaning:

64 is currently the smallest

Compare:

25 \< 64 → minIndex = 1

12 \< 25 → minIndex = 2

22 \> 12 → ignore

11 \< 12 → minIndex = 4

Now:

minIndex = 4

Swap:

64 ↔ 11

Result:

- \[11,25,12,22,64\]

### Time Complexity

Selection Sort always searches the remaining elements.

Best Case

Already sorted:

- \[1,2,3,4,5\]

Still checks all elements.

Complexity:

O(n²)

Average Case

Random order:

O(n²)

Worst Case

Reverse order:

- \[5,4,3,2,1\]

Complexity:

O(n²)

### Space Complexity

Selection Sort only uses temporary variables:

int temp;

int minIndex;

Therefore:

Space Complexity = O(1)

It is an **in-place sorting algorithm**.

Properties of Selection Sort

| **Property** | **Answer**    |
|--------------|---------------|
| Stable       | ❌ Usually No |
| In-place     | ✅ Yes        |
| Adaptive     | ❌ No         |
| Recursive    | ❌ Usually No |

### Why is Selection Sort Not Stable?

Example:

(A,5), (B,3), (C,5)

Sort by number.

During swapping:

(C,5) may move before (A,5)

Original order of equal elements changes.

Result:

(B,3), (C,5), (A,5)

Therefore, it is not stable.

Selection Sort vs Bubble Sort vs Insertion Sort

| **Feature**    | **Selection Sort** | **Bubble Sort** | **Insertion Sort** |
|----------------|--------------------|-----------------|--------------------|
| Main operation | Select minimum     | Swap neighbors  | Insert element     |
| Best Case      | O(n²)              | O(n)            | O(n)               |
| Average        | O(n²)              | O(n²)           | O(n²)              |
| Worst          | O(n²)              | O(n²)           | O(n²)              |
| Space          | O(1)               | O(1)            | O(1)               |
| Stable         | No                 | Yes             | Yes                |
| Swaps          | Few                | Many            | Moderate           |

Advantages

✅ Very simple to implement\
✅ Requires minimum memory\
✅ Performs fewer swaps compared to Bubble Sort

Example:

For:

- \[1000 elements\]

Selection Sort performs at most:

n-1 swaps

Disadvantages

❌ Always performs O(n²) comparisons\
❌ Not suitable for large datasets\
❌ Slower than Merge Sort and Quick Sort

When is Selection Sort Useful?

1. Small datasets

Example:

Sorting 10-20 items

2. Memory-constrained systems

Because:

Space = O(1)

3. When writes are expensive

Because it performs fewer swaps.

Example:

Flash memory where writing is costly.

Interview Questions

Q1. Why is Selection Sort O(n²)?

Because for every element, it scans the remaining elements.

Example:

n + (n-1) + (n-2) + ... + 1

≈

n² / 2

Therefore:

O(n²)

Q2. Selection Sort vs Insertion Sort?

Selection Sort:

- Finds minimum and swaps.

- Fewer writes.

Insertion Sort:

- Shifts elements.

- Better for nearly sorted data.

Q3. Is Selection Sort stable?

Standard Selection Sort:

No

A modified version can be made stable by shifting instead of swapping.

Summary

Selection Sort follows:

Find Minimum → Swap → Repeat

Complexities:

- Best: **O(n²)**

- Average: **O(n²)**

- Worst: **O(n²)**

- Space: **O(1)**

It is one of the easiest sorting algorithms to understand, but for real-world applications, algorithms like **Quick Sort, Merge Sort, or optimized library sorting** are preferred.
