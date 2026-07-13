# Data Structures and Algorithms Bubble Sort

**Bubble Sort**

**Bubble Sort** is one of the simplest sorting algorithms. It repeatedly compares **adjacent elements** and swaps them if they are in the wrong order.

The name "bubble sort" comes from the idea that the **largest elements "bubble up" to the end** of the array after each pass.

Compare 5 and 2 → swap

Pass 1·Comparison 1 of 6·1 swap

2

5

7

1

6

3

4

1

2

3

4

5

6

7

Result: 2, 5; 5 moves one place right

Sorting step

![](media/image1.wmf)

**Example**

Given an array:

\[5, 3, 8, 1, 2\]

We want ascending order:

\[1, 2, 3, 5, 8\]

**How Bubble Sort Works**

**Pass 1**

Compare adjacent elements:

**Compare 5 and 3**

\[5, 3, 8, 1, 2\]

5 \> 3 → swap

\[3, 5, 8, 1, 2\]

**Compare 5 and 8**

5 \< 8 → no swap

\[3, 5, 8, 1, 2\]

**Compare 8 and 1**

8 \> 1 → swap

\[3, 5, 1, 8, 2\]

**Compare 8 and 2**

8 \> 2 → swap

\[3, 5, 1, 2, 8\]

After first pass:

\[3,5,1,2,8\]

↑

Largest element fixed

The largest element (8) has reached its correct position.

**Pass 2**

Now ignore the last element because it is already sorted.

\[3,5,1,2,8\]

Compare:

3 and 5 → no swap

5 and 1 → swap

\[3,1,5,2,8\]

5 and 2 → swap

\[3,1,2,5,8\]

Now:

\[3,1,2,5,8\]

↑

5 is fixed

**Continue**

Pass 3:

\[1,2,3,5,8\]

Array is sorted.

**Algorithm Steps**

1.  Start from the first element.

2.  Compare each pair of adjacent elements.

3.  Swap if left element is greater than right element.

4.  After one complete pass, the largest element reaches the end.

5.  Repeat until the array is sorted.

**C# Implementation**

void BubbleSort(int\[\] arr)

{

int n = arr.Length;

for(int i = 0; i \< n - 1; i++)

{

bool swapped = false;

for(int j = 0; j \< n - i - 1; j++)

{

if(arr\[j\] \> arr\[j + 1\])

{

int temp = arr\[j\];

arr\[j\] = arr\[j + 1\];

arr\[j + 1\] = temp;

swapped = true;

}

}

// Optimization: array is already sorted

if(!swapped)

break;

}

}

**Understanding the Loops**

Outer loop:

for(int i = 0; i \< n-1; i++)

Controls the number of passes.

For an array of size 5:

Maximum passes = 4

Inner loop:

for(int j = 0; j \< n-i-1; j++)

Performs comparisons.

Why n-i-1?

Because after every pass, the largest element is already placed at the end.

Example:

After pass 1:

\[3,5,1,2,8\]

↑

Ignore

After pass 2:

\[3,1,2,5,8\]

↑

Ignore

**Time Complexity**

**Worst Case**

Array is reverse sorted:

\[5,4,3,2,1\]

Every element must be swapped.

Complexity:

O(n²)

**Average Case**

Random order:

O(n²)

**Best Case**

Already sorted:

\[1,2,3,4,5\]

With optimization:

O(n)

Without optimization:

O(n²)

**Space Complexity**

Bubble sort only uses a temporary variable:

int temp;

So:

Space Complexity = O(1)

It is an **in-place sorting algorithm**.

**Advantages**

✅ Very easy to understand\
✅ Simple implementation\
✅ Requires very little memory\
✅ Good for learning sorting concepts\
✅ Good for very small datasets

**Disadvantages**

❌ Very slow for large datasets\
❌ Performs many unnecessary comparisons\
❌ Not used in production systems for large data

**Bubble Sort vs Other Sorts**

| **Algorithm**  | **Average Time** | **Space** |
|----------------|------------------|-----------|
| Bubble Sort    | O(n²)            | O(1)      |
| Insertion Sort | O(n²)            | O(1)      |
| Selection Sort | O(n²)            | O(1)      |
| Merge Sort     | O(n log n)       | O(n)      |
| Quick Sort     | O(n log n)       | O(log n)  |

**Real-world Example**

Imagine students standing in a line according to height:

Tall students should move to the right.

Short students should move to the left.

Each student compares with the neighbor and swaps if needed.

After many rounds, the tallest students move to the end — just like bubbles rising in water.

**Interview Perspective**

Common Bubble Sort questions:

1.  Explain Bubble Sort algorithm.

2.  Why is it called Bubble Sort?

3.  What is the time complexity?

4.  Can Bubble Sort be optimized?

5.  Is Bubble Sort stable?

6.  Is Bubble Sort in-place?

Answers:

- Stable: **Yes** (equal elements maintain order)

- In-place: **Yes**

- Best case: **O(n)** with optimization

- Worst case: **O(n²)**

Bubble Sort is mainly important for understanding the basics of sorting, swapping, and algorithm complexity. In real applications, algorithms like **Quick Sort, Merge Sort, or optimized library sorting** are preferred.
