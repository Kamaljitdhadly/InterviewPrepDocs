# Data Structures and Algorithms Searching

**Searching Algorithms**

**Searching** is the process of finding a specific element (called a **target/key**) in a collection of data such as an array, list, tree, or graph.

Example:

Given an array:

\[10, 25, 30, 45, 60, 80\]

Find:

45

A searching algorithm determines **whether the element exists** and often returns its position/index.

**Types of Searching Algorithms**

The most common searching algorithms are:

1.  Linear Search

2.  Binary Search

3.  Hash Table Search

4.  Depth First Search (DFS)

5.  Breadth First Search (BFS)

**1. Linear Search**

Linear search checks each element one by one until it finds the target.

**Example**

Array:

\[15, 8, 20, 35, 50\]

Find 35.

Steps:

Check 15 → No

Check 8 → No

Check 20 → No

Check 35 → Found

**Implementation (C#)**

int LinearSearch(int\[\] arr, int target)

{

for(int i = 0; i \< arr.Length; i++)

{

if(arr\[i\] == target)

return i;

}

return -1;

}

**Complexity**

| **Case**     | **Complexity** |
|--------------|----------------|
| Best case    | O(1)           |
| Average case | O(n)           |
| Worst case   | O(n)           |

**Advantages**

✅ Simple\
✅ Works on sorted and unsorted data

**Disadvantages**

❌ Slow for large datasets

**2. Binary Search**

Binary search is much faster, but the data **must be sorted**.

It repeatedly divides the search space into half.

Example:

Sorted array:

\[10,20,30,40,50,60,70\]

Find 60.

**Step 1**

Check middle:

\|

\[10,20,30,40,50,60,70\]

40

60 is greater than 40.

Ignore left half.

Remaining:

\[50,60,70\]

**Step 2**

Check middle:

\[50,60,70\]

\|

60

Found.

**Implementation**

int BinarySearch(int\[\] arr, int target)

{

int left = 0;

int right = arr.Length - 1;

while(left \<= right)

{

int mid = left + (right - left) / 2;

if(arr\[mid\] == target)

return mid;

if(arr\[mid\] \< target)

left = mid + 1;

else

right = mid - 1;

}

return -1;

}

**Complexity**

| **Case**     | **Complexity** |
|--------------|----------------|
| Best case    | O(1)           |
| Average case | O(log n)       |
| Worst case   | O(log n)       |

**Linear Search vs Binary Search**

| **Feature**     | **Linear Search** | **Binary Search**  |
|-----------------|-------------------|--------------------|
| Data required   | Sorted/Unsorted   | Sorted only        |
| Approach        | Check one by one  | Divide and conquer |
| Time Complexity | O(n)              | O(log n)           |
| Suitable for    | Small data        | Large sorted data  |

Example:

Searching 1 million records:

**Linear Search**

1,000,000 checks

**Binary Search**

log2(1,000,000)

≈ 20 checks

**3. Hash Table Searching**

Hash tables use a **hash function** to directly locate data.

Example:

Store users:

Key Value

101 John

102 Mike

103 Sarah

Searching:

Find user 102

Hash function calculates location:

102 → bucket 2

Direct access.

**Complexity**

Average:

Search: O(1)

Insert: O(1)

Delete: O(1)

Worst case:

O(n)

due to collisions.

Examples:

- C# Dictionary\<TKey,TValue\>

- Java HashMap

- Python Dictionary

**4. Tree Searching**

Searching in trees depends on the tree type.

**Binary Search Tree (BST)**

Example:

50

/ \\

30 70

/ \\ / \\

20 40 60 80

Find 60.

Steps:

60 \> 50 → go right

60 \< 70 → go left

Found 60

Complexity:

Balanced BST:

O(log n)

Worst case:

O(n)

**5. Graph Searching**

Graphs contain nodes connected by edges.

Example:

A --- B

\| \|

C --- D

Two major algorithms:

**Breadth First Search (BFS)**

Search level by level.

Example:

Start A

Level 1:

B, C

Level 2:

D

Uses:

Queue

Complexity:

O(V + E)

where:

- V = vertices (nodes)

- E = edges

Applications:

- Shortest path in unweighted graphs

- Social network connections

**Depth First Search (DFS)**

Explore as deep as possible before backtracking.

Example:

A

\|

B

\|

C

\|

D

Uses:

Stack or Recursion

Complexity:

O(V + E)

Applications:

- Maze solving

- Cycle detection

- Topological sorting

**Searching Algorithm Comparison**

| **Algorithm** | **Data Structure** | **Time Complexity** |
|---------------|--------------------|---------------------|
| Linear Search | Array/List         | O(n)                |
| Binary Search | Sorted Array       | O(log n)            |
| Hash Search   | Hash Table         | O(1) average        |
| BST Search    | Binary Tree        | O(log n) average    |
| BFS           | Graph              | O(V+E)              |
| DFS           | Graph              | O(V+E)              |

**How to choose a searching algorithm?**

**Small unsorted data**

Use:

Linear Search

**Large sorted array**

Use:

Binary Search

**Need fastest lookup by key**

Use:

Hash Table

Example:

Dictionary\<int, User\>

**Searching relationships/networks**

Use:

BFS / DFS

Example:

- Google Maps

- Social networks

- Dependency graphs

**Interview perspective**

For senior developers, common searching questions are:

1.  Difference between Linear and Binary Search?

2.  Why does Binary Search require sorted data?

3.  How does Dictionary achieve O(1) lookup?

4.  How does HashMap handle collisions?

5.  Implement Binary Search recursively.

6.  Find first/last occurrence using Binary Search.

7.  Search in a rotated sorted array.

8.  BFS vs DFS — when to use which?

9.  Find shortest path in a graph.

Searching is one of the fundamental algorithm categories because many real-world systems are essentially **efficient ways of finding information quickly**.
