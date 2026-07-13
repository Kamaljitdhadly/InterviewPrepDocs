# Data Structures and Algorithms Divide And Conquer

**Divide and Conquer Algorithm Technique**

**Divide and Conquer** is an algorithm design technique where a problem is broken into **smaller subproblems**, each subproblem is solved independently, and then their solutions are combined to solve the original problem.

The approach has three main steps:

1.  **Divide** → Break the problem into smaller parts.

2.  **Conquer** → Solve the smaller problems recursively.

3.  **Combine** → Merge the solutions to get the final answer.

**Real-Life Example: Searching a Dictionary**

Suppose you want to find a word in a dictionary with 1000 pages.

**Normal search:**

Check every page:

Page 1

Page 2

Page 3

...

Time: O(n)

**Divide and Conquer:**

1.  Open the middle page.

2.  Check the word.

3.  If the word comes before:

    - Ignore the second half.

4.  If the word comes after:

    - Ignore the first half.

5.  Repeat.

Each step reduces the problem size by half.

This is **Binary Search**.

Time:

O(log n)

**General Structure**

A divide and conquer algorithm usually looks like this:

function solve(problem)

{

if(problem is small)

return direct solution;

// Divide

split problem into smaller problems;

// Conquer

solve each subproblem recursively;

// Combine

merge results;

return answer;

}

**Example 1: Binary Search**

Problem:

Find target 7 in:

\[1,3,5,7,9,11,13\]

Steps:

**Divide**

Find middle:

\[1,3,5,7,9,11,13\]

^

7

Target found.

If target was 11:

First:

\[1,3,5,7,9,11,13\]

Middle = 7

Since:

11 \> 7

Ignore left side:

\[9,11,13\]

Again divide:

\[9,11,13\]

Middle = 11

Found.

Implementation:

int BinarySearch(int\[\] arr, int left, int right, int target)

{

if(left \> right)

return -1;

int mid = left + (right - left) / 2;

if(arr\[mid\] == target)

return mid;

if(target \< arr\[mid\])

return BinarySearch(arr, left, mid - 1, target);

return BinarySearch(arr, mid + 1, right, target);

}

Time complexity:

O(log n)

Space:

O(log n) // recursion stack

**Example 2: Merge Sort**

Merge Sort is one of the most famous divide-and-conquer algorithms.

Problem:

Sort:

\[8,3,5,1,9,6\]

**Divide**

Split repeatedly:

\[8,3,5,1,9,6\]

\|

----------------

\[8,3,5\] \[1,9,6\]

\| \|

\[8\] \[3,5\] \[1\] \[9,6\]

Continue until single elements:

\[8\] \[3\] \[5\] \[1\] \[9\] \[6\]

**Conquer**

Sort small pieces:

\[3\] + \[5\]

=\> \[3,5\]

**Combine**

Merge:

\[3,5\] + \[8\]

=\> \[3,5,8\]

Finally:

\[1,3,5,6,8,9\]

Complexity:

Time: O(n log n)

Space: O(n)

**Example 3: Quick Sort**

Quick Sort also uses divide and conquer.

Steps:

1.  Select a pivot.

2.  Divide array:

    - Smaller elements

    - Pivot

    - Larger elements

3.  Recursively sort both sides.

Example:

\[7,2,9,4,1\]

Choose pivot:

Pivot = 7

Partition:

\[2,4,1\] 7 \[9\]

Sort left and right:

\[1,2,4\] 7 \[9\]

Result:

\[1,2,4,7,9\]

Average complexity:

O(n log n)

Worst case:

O(n²)

**Example 4: Finding Maximum Element**

Array:

\[3,8,2,10,5\]

Divide:

\[3,8,2\] \[10,5\]

Find maximum:

max(left) = 8

max(right)=10

Combine:

max(8,10)=10

**Divide and Conquer vs Dynamic Programming**

They look similar because both break problems into smaller parts.

| **Divide & Conquer**        | **Dynamic Programming**             |
|-----------------------------|-------------------------------------|
| Subproblems are independent | Subproblems overlap                 |
| Does not store results      | Stores previous results             |
| Uses recursion              | Uses memoization/tabulation         |
| Example: Merge Sort         | Example: Fibonacci                  |
| Example: Binary Search      | Example: Longest Common Subsequence |

**Example Difference**

**Divide and Conquer**

Merge Sort:

Sort

/ \\

Sort Sort

Left and right halves are independent.

**Dynamic Programming**

Fibonacci:

F(5)

/ \\

F(4) F(3)

/ \\

F(3) F(2)

F(3) is calculated multiple times.

DP stores it.

**Divide and Conquer Recurrence**

Many divide-and-conquer algorithms follow:

T(n) = aT(n/b) + f(n)

Where:

- a = number of subproblems

- n/b = size of each subproblem

- f(n) = dividing and combining cost

Example: Merge Sort

T(n) = 2T(n/2) + O(n)

Meaning:

- Split into 2 halves

- Sort both halves

- Merge in O(n)

Result:

O(n log n)

**Common Divide and Conquer Algorithms**

| **Algorithm** | **Purpose** | **Complexity** |
|----|----|----|
| Binary Search | Search sorted data | O(log n) |
| Merge Sort | Sorting | O(n log n) |
| Quick Sort | Sorting | O(n log n) average |
| Heap Sort (conceptually related) | Sorting | O(n log n) |
| Strassen Algorithm | Matrix multiplication | Faster matrix multiplication |
| Closest Pair of Points | Geometry | O(n log n) |

**When Should You Think About Divide and Conquer?**

Look for problems where:

✅ The problem can be split into similar smaller problems\
✅ Each part can be solved independently\
✅ The final answer can be combined

Common keywords:

- "Split into halves"

- "Find in sorted array"

- "Sort efficiently"

- "Maximum/minimum in range"

- "Recursive solution"

**Interview Explanation (Senior Developer)**

"Divide and conquer is an algorithmic paradigm where we recursively divide a problem into smaller independent subproblems, solve each subproblem, and combine their results. Algorithms like binary search, merge sort, and quick sort use this approach. The efficiency comes from reducing the problem size at each recursive step."

For DSA interviews, **divide and conquer + recursion + complexity analysis** are usually discussed together.
