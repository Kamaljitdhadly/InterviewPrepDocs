# Data Structures and Algorithms Merge Sort

**Merge Sort**

**Merge Sort** is an efficient sorting algorithm based on the **Divide and Conquer** technique.

The main idea:

1.  **Divide** the array into smaller halves.

2.  **Conquer** by sorting each half recursively.

3.  **Merge** the sorted halves back together.

Unlike Bubble Sort, which compares neighboring elements repeatedly, Merge Sort breaks the problem into smaller problems and combines their solutions.

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

*(Note: the visualization above is for insertion sort; for merge sort, focus on the divide → sort → merge process described below.)*

**Example**

Given:

\[8, 3, 5, 1, 9, 6, 2, 7\]

Goal:

\[1,2,3,5,6,7,8,9\]

**Step 1: Divide**

Merge Sort repeatedly splits the array into halves.

\[8,3,5,1,9,6,2,7\]

\|

-----------------------

\| \|

\[8,3,5,1\] \[9,6,2,7\]

\| \|

-------- --------

\| \| \| \|

\[8,3\] \[5,1\] \[9,6\] \[2,7\]

Continue splitting:

\[8,3\] → \[8\] \[3\]

\[5,1\] → \[5\] \[1\]

\[9,6\] → \[9\] \[6\]

\[2,7\] → \[2\] \[7\]

Now every piece has one element.

A single element is already sorted.

**Step 2: Merge**

Now we combine sorted pieces.

**Merge:**

\[8\] and \[3\]

Compare:

8 \> 3

Result:

\[3,8\]

**Merge:**

\[5\] and \[1\]

Result:

\[1,5\]

Now:

\[3,8\] \[1,5\]

Merge them:

Compare:

3 vs 1 → take 1

3 vs 5 → take 3

8 vs 5 → take 5

take 8

Result:

\[1,3,5,8\]

Similarly:

\[9,6\] → \[6,9\]

\[2,7\] → \[2,7\]

Merge:

\[6,9\] + \[2,7\]

Result:

\[2,6,7,9\]

Final merge:

\[1,3,5,8\]

\+

\[2,6,7,9\]

Compare elements:

1 → take

2 → take

3 → take

5 → take

6 → take

7 → take

8 → take

9 → take

Final:

\[1,2,3,5,6,7,8,9\]

**How Merge Sort Works Internally**

Merge Sort has two functions:

**1. Divide function**

Splits the array:

MergeSort(array, left, right)

{

find middle

MergeSort(left half)

MergeSort(right half)

Merge(left, middle, right)

}

**2. Merge function**

Combines two sorted arrays:

Example:

Left:

\[2,5,8\]

Right:

\[1,4,9\]

Compare first elements:

2 vs 1 → take 1

2 vs 4 → take 2

5 vs 4 → take 4

Result:

\[1,2,4,5,8,9\]

**C# Implementation**

void MergeSort(int\[\] arr, int left, int right)

{

if(left \< right)

{

int middle = (left + right) / 2;

MergeSort(arr, left, middle);

MergeSort(arr, middle + 1, right);

Merge(arr, left, middle, right);

}

}

void Merge(int\[\] arr, int left, int middle, int right)

{

int\[\] temp = new int\[right - left + 1\];

int i = left;

int j = middle + 1;

int k = 0;

while(i \<= middle && j \<= right)

{

if(arr\[i\] \<= arr\[j\])

{

temp\[k\] = arr\[i\];

i++;

}

else

{

temp\[k\] = arr\[j\];

j++;

}

k++;

}

while(i \<= middle)

{

temp\[k++\] = arr\[i++\];

}

while(j \<= right)

{

temp\[k++\] = arr\[j++\];

}

for(i = left; i \<= right; i++)

{

arr\[i\] = temp\[i - left\];

}

}

**Time Complexity**

The array is divided into halves.

For example:

8 elements

8 → 4 → 2 → 1

Number of divisions:

log₂(n)

During each level, merging requires:

O(n)

Therefore:

O(n) × O(log n)

Final complexity:

| **Case** | **Complexity** |
|----------|----------------|
| Best     | O(n log n)     |
| Average  | O(n log n)     |
| Worst    | O(n log n)     |

**Space Complexity**

Merge Sort requires temporary arrays while merging.

Example:

Original array:

\[8,3,5,1\]

Temporary:

\[1,3,5,8\]

Extra memory:

O(n)

**Merge Sort Properties**

| **Property**      | **Answer** |
|-------------------|------------|
| Stable?           | ✅ Yes     |
| In-place?         | ❌ No      |
| Recursive?        | ✅ Usually |
| Divide & Conquer? | ✅ Yes     |

**Merge Sort vs Bubble Sort**

| **Feature** | **Bubble Sort**  | **Merge Sort**   |
|-------------|------------------|------------------|
| Approach    | Compare and swap | Divide and merge |
| Best case   | O(n)             | O(n log n)       |
| Average     | O(n²)            | O(n log n)       |
| Worst       | O(n²)            | O(n log n)       |
| Memory      | O(1)             | O(n)             |
| Large data  | Poor             | Excellent        |

**Where is Merge Sort Used?**

**1. Sorting large datasets**

Example:

- Database records

- Large files

**2. External sorting**

When data is too large to fit in memory:

Disk data

↓

Sort chunks

↓

Merge sorted chunks

**3. Linked Lists**

Merge Sort is very efficient for linked lists because:

- Splitting is easy using pointers.

- No random access is needed.

**4. Distributed systems**

Large datasets can be split across machines:

Machine A → sort part 1

Machine B → sort part 2

Machine C → sort part 3

↓

Merge results

**Interview Questions**

**Q1. Why is Merge Sort O(n log n)?**

Because:

- Array is divided into log n levels.

- Each level processes all n elements during merging.

**Q2. Why is Merge Sort preferred for linked lists?**

Because linked lists don't support fast random access, but merging linked lists is efficient.

**Q3. Merge Sort vs Quick Sort?**

|                 | **Merge Sort** | **Quick Sort** |
|-----------------|----------------|----------------|
| Worst case      | O(n log n)     | O(n²)          |
| Memory          | O(n)           | O(log n)       |
| Stable          | Yes            | Usually No     |
| Practical speed | Good           | Usually faster |

**Summary:**

Merge Sort is a powerful sorting algorithm that uses **divide and conquer**:

Divide → Sort → Merge

It provides guaranteed **O(n log n)** performance and is widely used for large-scale sorting, especially when stability and predictable performance are important.
