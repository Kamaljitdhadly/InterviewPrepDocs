# Data Structures and Algorithms Quick Sort

Quick Sort

**Quick Sort** is an efficient sorting algorithm based on the **Divide and Conquer** technique.

It works by:

- Selecting a **pivot** element.

- Partitioning the array so:

    - Elements smaller than the pivot go to the left.

    - Elements larger than the pivot go to the right.

- Recursively sorting the left and right parts.

The key idea:

Choose Pivot → Partition → Recursively Sort

### Example

Given array:

- \[8, 3, 5, 1, 9, 6, 2, 7\]

Let's choose the last element as pivot:

Pivot = 7

Step 1: Partition

Move smaller elements to the left and larger elements to the right.

Before:

- \[8, 3, 5, 1, 9, 6, 2, 7\]

↑

Pivot

After partition:

- \[3, 5, 1, 6, 2, 7, 9, 8\]

↑

Pivot position

Now:

Left side Pivot Right side

- \[3,5,1,6,2\] 7 \[9,8\]

The pivot 7 is now in its correct position.

Step 2: Recursively Sort Left Side

Left:

- \[3,5,1,6,2\]

Choose pivot:

Pivot = 2

Partition:

- \[1,2,3,5,6\]

Now:

- \[1\] 2 \[3,5,6\]

Step 3: Sort Right Side

Right:

- \[9,8\]

Choose pivot:

Pivot = 8

Partition:

- \[8,9\]

Final Result

- \[1,2,3,5,6,7,8,9\]

How Quick Sort Works Internally

Quick Sort mainly has two operations:

1. Partition

The partition step rearranges the array around the pivot.

Example:

- \[6,3,8,5,2,7\]

Pivot:

5

Partition:

- \[3,2\] 5 \[6,8,7\]

2. Recursive Sorting

After partition:

- \[3,2\] 5 \[6,8,7\]

Sort:

- \[2,3\] 5 \[6,7,8\]

Result:

- \[2,3,5,6,7,8\]

C# Implementation

- void QuickSort(int\[\] arr, int low, int high)

{

if(low \< high)

{

int pivotIndex = Partition(arr, low, high);

QuickSort(arr, low, pivotIndex - 1);

QuickSort(arr, pivotIndex + 1, high);

}

}

- int Partition(int\[\] arr, int low, int high)

{

- int pivot = arr\[high\];

int i = low - 1;

for(int j = low; j \< high; j++)

{

- if(arr\[j\] \< pivot)

{

i++;

- int temp = arr\[i\];

- arr\[i\] = arr\[j\];

- arr\[j\] = temp;

}

}

- int temp2 = arr\[i + 1\];

- arr\[i + 1\] = arr\[high\];

- arr\[high\] = temp2;

return i + 1;

}

Understanding Partition Logic

Example:

- \[5,2,8,1,7\]

Pivot:

7

Start:

i = -1

Compare elements:

5 \< 7

Move left:

- \[5,2,8,1,7\]

↑

2 \< 7

Move left:

- \[5,2,8,1,7\]

8 \> 7

Do nothing.

1 \< 7

Move left:

- \[5,2,1,8,7\]

Finally place pivot:

- \[5,2,1,7,8\]

Pivot position = 3.

### Time Complexity

Best Case

Pivot divides array equally:

n

/ \\

n/2 n/2

Complexity:

O(n log n)

Average Case

Random data:

O(n log n)

Worst Case

Bad pivot selection.

Example:

Already sorted array:

- \[1,2,3,4,5\]

Choose last element as pivot:

Pivot = 5

Partition:

- \[1,2,3,4\] 5

Only one side reduces.

Complexity:

O(n²)

### Space Complexity

Quick Sort is usually performed **in-place**.

Extra memory:

O(log n)

because of recursion stack.

Worst case recursion:

O(n)

How to Improve Quick Sort

1. Choose better pivot

Instead of always choosing the last element:

Random pivot

Pick random element

Reduces chances of worst case.

2. Median-of-three

Choose:

First element

Middle element

Last element

Take the median.

Example:

- \[10,5,20\]

Median = 10

Quick Sort vs Merge Sort

| **Feature**     | **Quick Sort**   | **Merge Sort**   |
|-----------------|------------------|------------------|
| Technique       | Divide & Conquer | Divide & Conquer |
| Average Time    | O(n log n)       | O(n log n)       |
| Worst Time      | O(n²)            | O(n log n)       |
| Space           | O(log n)         | O(n)             |
| Stable          | ❌ No            | ✅ Yes           |
| In-place        | ✅ Yes           | ❌ No            |
| Practical speed | Usually faster   | Usually slower   |

### Why is Quick Sort Often Faster in Practice?

Although both are:

O(n log n)

Quick Sort usually wins because:

- It works in-place (less memory allocation).

- Better cache performance.

- Fewer data movements.

- Lower constant factors.

Real-World Usage

Quick Sort or its variations are used in:

- Standard library sorting implementations

- Database query engines

- Large-scale data processing

- Language runtime libraries

For example, .NET's sorting implementation uses optimized hybrid approaches rather than a simple Quick Sort, but Quick Sort concepts are part of many high-performance sorting strategies.

Interview Questions

1. Why is Quick Sort called divide and conquer?

Because it divides the problem into smaller sub-arrays around a pivot and solves them recursively.

2. Why can Quick Sort become O(n²)?

Because a poor pivot selection creates extremely unbalanced partitions.

Example:

- \[1,2,3,4,5\]

Pivot = 5

Left = 4 elements

Right = 0 elements

3. How do you make Quick Sort stable?

Standard Quick Sort is not stable. You need extra memory or a modified partition approach.

4. When would you choose Quick Sort over Merge Sort?

Use Quick Sort when:

- Memory is limited.

- Average performance matters.

- In-place sorting is preferred.

Use Merge Sort when:

- Stability is required.

- Worst-case guarantees are important.

Summary

Quick Sort follows:

Choose Pivot

\|

Partition Array

\|

----------------------

\| \|

Sort Left Sort Right

\| \|

-------- Merge -------

Key points:

- Average complexity: **O(n log n)**

- Worst case: **O(n²)**

- Space: **O(log n)**

- In-place: **Yes**

- Stable: **No**

Quick Sort is one of the most important sorting algorithms because it combines **excellent average performance with low memory usage**.
