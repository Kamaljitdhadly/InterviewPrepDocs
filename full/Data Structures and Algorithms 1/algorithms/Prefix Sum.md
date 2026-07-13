# Data Structures and Algorithms Prefix Sum

**Prefix Sum in Data Structures and Algorithms**

**Prefix Sum** is a technique used to efficiently calculate the **sum of elements in a range of an array**.

The main idea:

Instead of repeatedly calculating sums, precompute cumulative sums once and use them to answer range queries quickly.

**Why Do We Need Prefix Sum?**

Consider an array:

arr = \[2, 4, 6, 8, 10\]

Suppose we need to find:

Sum from index 1 to 3

Meaning:

4 + 6 + 8 = 18

**Normal Approach**

Loop every time:

sum = 0;

for(i=start; i\<=end; i++)

{

sum += arr\[i\];

}

Time complexity:

O(n)

If we have many queries:

Query 1 → O(n)

Query 2 → O(n)

Query 3 → O(n)

...

This becomes slow.

**Prefix Sum Idea**

Create a new array where each element stores the sum of all previous elements.

Original array:

arr:

Index: 0 1 2 3 4

Value: 2 4 6 8 10

Prefix sum:

prefix:

Index: 0 1 2 3 4

Value: 2 6 12 20 30

Meaning:

prefix\[0\] = 2

prefix\[1\] = 2 + 4 = 6

prefix\[2\] = 2 + 4 + 6 = 12

prefix\[3\] = 2 + 4 + 6 + 8 = 20

prefix\[4\] = 2 + 4 + 6 + 8 + 10 = 30

**Range Sum Using Prefix Sum**

Formula:

sum(left, right) = prefix\[right\] - prefix\[left-1\]

Example:

Find:

arr\[1\] to arr\[3\]

Array:

\[2,4,6,8,10\]

Prefix:

\[2,6,12,20,30\]

Formula:

prefix\[3\] - prefix\[0\]

20 - 2

=18

Answer:

4 + 6 + 8 = 18

**Handling When Left Index is 0**

If:

left = 0

There is no left-1.

So:

sum(0,right) = prefix\[right\]

Example:

sum(0,2)

prefix\[2\]

=12

**Prefix Sum Construction**

Algorithm:

prefix\[0\] = arr\[0\];

for(int i=1; i\<arr.Length; i++)

{

prefix\[i\] = prefix\[i-1\] + arr\[i\];

}

**C# Example**

int\[\] arr = {2,4,6,8,10};

int\[\] prefix = new int\[arr.Length\];

prefix\[0\] = arr\[0\];

for(int i=1; i\<arr.Length; i++)

{

prefix\[i\] = prefix\[i-1\] + arr\[i\];

}

int left = 1;

int right = 3;

int result = prefix\[right\] - prefix\[left-1\];

Console.WriteLine(result);

Output:

18

**Complexity Analysis**

**Without Prefix Sum**

For each query:

O(n)

For Q queries:

O(Q × n)

**With Prefix Sum**

Building prefix array:

O(n)

Each query:

O(1)

Total:

O(n + Q)

**Prefix Sum Example: Range Frequency**

Array:

\[1,2,1,3,1,2\]

Question:

How many times does 1 appear between index 0 and 4?

Create frequency prefix:

Index: 0 1 2 3 4 5

Number 1:

1 1 2 2 3 3

Query:

0 to 4

Answer:

prefix\[4\] = 3

**2D Prefix Sum (Matrix)**

Prefix sum also works on matrices.

Example:

Matrix:

1 2 3

4 5 6

7 8 9

Create a prefix matrix:

1 3 6

5 12 21

12 27 45

Now you can find the sum of any rectangle in:

O(1)

instead of scanning all cells.

**Applications of Prefix Sum**

**1. Range Sum Queries**

Example:

Find sum from index 100 to 500

Used in:

- Databases

- Analytics

- Reporting systems

**2. Subarray Sum Problems**

Example:

Find subarray with sum = K.

Array:

\[1,2,3,-2,5\]

Prefix sums help track previous sums.

**3. Difference Array**

Prefix sum is the reverse concept of difference arrays.

Used for:

- Range updates

- Adding values to intervals

Example:

Increase all values from index 2 to 5 by 10.

**4. Counting Subarrays**

Problems like:

- Number of subarrays with sum K

- Longest subarray with given sum

Use:

Prefix Sum + HashMap

**Prefix Sum + HashMap Example**

Problem:

Find number of subarrays whose sum equals K.

Array:

\[1,2,3\]

K = 3

Subarrays:

\[1,2\]

\[3\]

Answer:

2

Approach:

Maintain:

current prefix sum

If:

currentSum - K

exists in hashmap, a valid subarray exists.

**Prefix Sum vs Sliding Window**

| **Prefix Sum**              | **Sliding Window**                |
|-----------------------------|-----------------------------------|
| Works with negative numbers | Usually requires positive numbers |
| Uses extra memory           | Uses constant memory              |
| Good for many queries       | Good for continuous ranges        |
| Query can be O(1)           | Dynamic movement                  |

**Prefix Sum vs Dynamic Programming**

They are related but different.

**Prefix Sum:**

Stores cumulative values.

Example:

sum of previous elements

**Dynamic Programming:**

Stores solutions to subproblems.

Example:

minimum cost path

**Common Interview Problems**

| **Problem**           | **Technique**        |
|-----------------------|----------------------|
| Range Sum Query       | Prefix Sum           |
| Subarray Sum Equals K | Prefix Sum + HashMap |
| Maximum Subarray      | Kadane's Algorithm   |
| Product Except Self   | Prefix/Suffix        |
| 2D Matrix Sum         | 2D Prefix Sum        |
| Range Updates         | Difference Array     |

**Interview Explanation (Senior Developer)**

"Prefix sum is a preprocessing technique where we store cumulative sums of an array. It allows us to answer range sum queries in O(1) time after O(n) preprocessing. The technique is widely used in subarray problems, frequency counting, matrix queries, and optimization problems."

A typical DSA progression is:

Array

↓

Prefix Sum

↓

Sliding Window

↓

Two Pointer

↓

Hashing

↓

Dynamic Programming

Prefix sum is one of the most important array optimization techniques for coding interviews.
