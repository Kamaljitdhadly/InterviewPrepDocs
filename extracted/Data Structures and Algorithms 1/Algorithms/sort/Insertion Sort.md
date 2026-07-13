# Data Structures and Algorithms Insertion Sort

**Insertion Sort**

**Insertion Sort** is a simple comparison-based sorting algorithm that builds the final sorted array **one element at a time**.

The idea is similar to arranging playing cards in your hand:

- You pick one card.

- Compare it with cards already arranged.

- Insert it into the correct position.

Start with one sorted value

Pass 1 of 6·1 sorted

Sorted prefix

7

3

8

2

6

4

5

1

2

3

4

5

6

7

Insertion step

![](media/image1.wmf)

**How Insertion Sort Works**

Example:

\[5, 3, 8, 4, 2\]

We divide the array into:

- **Sorted part** (left side)

- **Unsorted part** (right side)

Initially:

\[5\] \[3,8,4,2\]

↑

Sorted

The first element is considered already sorted.

**Step 1: Insert 3**

Current:

Sorted: \[5\]

Key = 3

Compare:

3 \< 5

Move 5 right:

\[5,5,8,4,2\]

Insert 3:

\[3,5,8,4,2\]

Now:

\[3,5\] \[8,4,2\]

Sorted part grows.

**Step 2: Insert 8**

Current:

\[3,5\] \[8,4,2\]

Key:

8

Compare:

8 \> 5

Already in correct position.

Array:

\[3,5,8,4,2\]

**Step 3: Insert 4**

Current:

\[3,5,8\] \[4,2\]

Key:

4

Compare from right:

4 \< 8 → shift 8

Array:

\[3,5,8,8,2\]

Compare:

4 \< 5 → shift 5

Array:

\[3,5,5,8,2\]

Compare:

4 \> 3

Insert:

\[3,4,5,8,2\]

**Step 4: Insert 2**

Current:

\[3,4,5,8\] \[2\]

Shift larger elements:

\[2,3,4,5,8\]

Final sorted array:

\[2,3,4,5,8\]

**Algorithm Steps**

1.  Assume first element is sorted.

2.  Pick the next element (called **key**).

3.  Compare it with elements on the left.

4.  Shift larger elements one position right.

5.  Insert the key into its correct position.

6.  Repeat until the array is sorted.

**C# Implementation**

void InsertionSort(int\[\] arr)

{

int n = arr.Length;

for(int i = 1; i \< n; i++)

{

int key = arr\[i\];

int j = i - 1;

while(j \>= 0 && arr\[j\] \> key)

{

arr\[j + 1\] = arr\[j\];

j--;

}

arr\[j + 1\] = key;

}

}

**Understanding the Code**

**Pick current element**

int key = arr\[i\];

Example:

\[3,5,8,4,2\]

key = 4

**Move bigger elements**

while(arr\[j\] \> key)

Example:

5 \> 4

Move 5 right:

\[3,5,5,8,2\]

**Insert key**

arr\[j+1\] = key;

Result:

\[3,4,5,8,2\]

**Time Complexity**

**Best Case**

Already sorted array:

\[1,2,3,4,5\]

Only comparisons are needed.

Complexity:

O(n)

**Average Case**

Random order:

O(n²)

**Worst Case**

Reverse sorted:

\[5,4,3,2,1\]

Every element must move.

Complexity:

O(n²)

**Space Complexity**

Insertion Sort uses only a temporary variable:

int key;

Therefore:

Space Complexity = O(1)

It is an **in-place sorting algorithm**.

**Properties of Insertion Sort**

| **Property** | **Answer**           |
|--------------|----------------------|
| Stable       | ✅ Yes               |
| In-place     | ✅ Yes               |
| Adaptive     | ✅ Yes               |
| Recursive    | ❌ Usually iterative |

**Why is Insertion Sort Adaptive?**

An adaptive algorithm performs better when data is already partially sorted.

Example:

Already sorted:

\[1,2,3,4,5\]

Insertion Sort:

O(n)

Almost sorted:

\[1,2,3,5,4\]

Only small adjustments are needed.

**Insertion Sort vs Bubble Sort**

| **Feature**     | **Insertion Sort**              | **Bubble Sort**        |
|-----------------|---------------------------------|------------------------|
| Approach        | Insert element into sorted area | Swap adjacent elements |
| Best Case       | O(n)                            | O(n)                   |
| Average         | O(n²)                           | O(n²)                  |
| Worst           | O(n²)                           | O(n²)                  |
| Memory          | O(1)                            | O(1)                   |
| Stable          | Yes                             | Yes                    |
| Practical speed | Usually faster                  | Slower                 |

**Insertion Sort vs Merge/Quick Sort**

| **Algorithm**  | **Average Complexity** |
|----------------|------------------------|
| Insertion Sort | O(n²)                  |
| Merge Sort     | O(n log n)             |
| Quick Sort     | O(n log n)             |

For large data:

Merge Sort / Quick Sort win

For small data:

Insertion Sort can be faster

**Real-World Usage**

Although it is not used for large datasets, Insertion Sort is useful in:

**1. Small arrays**

For example:

Sorting 10-50 elements

**2. Hybrid sorting algorithms**

Many high-performance sorting algorithms use Insertion Sort for small partitions.

Example:

Quick Sort

\|

\|-- small partition → Insertion Sort

because the overhead of recursion is not worth it for tiny arrays.

**3. Nearly sorted data**

Example:

A list of employees already sorted by name, with a few new employees added.

Insertion Sort performs very well.

**Interview Questions**

**1. Why is Insertion Sort better than Bubble Sort?**

Because it does fewer swaps and works by shifting elements efficiently.

**2. Is Insertion Sort stable?**

Yes.

Equal elements keep their original order.

**3. When would you use Insertion Sort?**

Use it when:

- Data size is small.

- Data is almost sorted.

- Memory is limited.

**4. Why is it called Insertion Sort?**

Because each new element is **inserted** into its correct position in the already sorted portion.

**Summary**

Insertion Sort works like arranging playing cards:

Take element → Compare → Shift → Insert

Complexities:

- Best: **O(n)**

- Average: **O(n²)**

- Worst: **O(n²)**

- Space: **O(1)**

It is simple, stable, and excellent for small or nearly sorted datasets.
