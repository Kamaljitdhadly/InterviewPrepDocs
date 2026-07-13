# Data Structures and Algorithms Dynamic Programming

**Dynamic programming (DP)** is a problem-solving technique used to solve complex problems by **breaking them into smaller overlapping subproblems**, solving each subproblem only once, and **storing the results** so they can be reused.

**Why use dynamic programming?**

Suppose you're calculating the Fibonacci sequence:

- F(0)=0F(0) = 0F(0)=0

- F(1)=1F(1) = 1F(1)=1

- F(n)=F(n−1)+F(n−2)F(n) = F(n-1) + F(n-2)F(n)=F(n−1)+F(n−2)

A simple recursive solution repeatedly recalculates the same values.

For example, to compute F(5):

F(5)

├── F(4)

│ ├── F(3)

│ │ ├── F(2)

│ │ └── F(1)

│ └── F(2)

└── F(3)

├── F(2)

└── F(1)

Notice that F(3) and F(2) are computed multiple times.

DP avoids this repetition by storing previously computed results.

**Two approaches to DP**

**1. Memoization (Top-Down)**

Use recursion, but save computed results.

memo = {}

def fib(n):

if n \<= 1:

return n

if n in memo:

return memo\[n\]

memo\[n\] = fib(n-1) + fib(n-2)

return memo\[n\]

- Recursive

- Computes only needed subproblems

- Easy to write

**2. Tabulation (Bottom-Up)**

Build the solution iteratively.

def fib(n):

if n \<= 1:

return n

dp = \[0\] \* (n + 1)

dp\[1\] = 1

for i in range(2, n + 1):

dp\[i\] = dp\[i-1\] + dp\[i-2\]

return dp\[n\]

- No recursion

- Usually more efficient

- Easier to optimize memory

**When can DP be used?**

A problem is suitable for DP if it has:

1.  **Overlapping subproblems**

    - The same smaller problems appear repeatedly.

2.  **Optimal substructure**

    - The optimal solution can be built from optimal solutions to smaller subproblems.

**Common DP problems**

- Fibonacci numbers

- Climbing stairs

- Coin change

- 0/1 Knapsack

- Longest Common Subsequence (LCS)

- Longest Increasing Subsequence (LIS)

- Edit distance

- Matrix chain multiplication

**General steps for solving a DP problem**

1.  Define the **state** (what each DP value represents).

2.  Write the **recurrence relation** (how the state depends on previous states).

3.  Identify **base cases**.

4.  Decide between **memoization** or **tabulation**.

5.  Optimize memory if possible.

**Example: Climbing Stairs**

You can climb either 1 or 2 steps. How many distinct ways are there to reach the nnn-th step?

Recurrence:

- dp\[1\] = 1

- dp\[2\] = 2

- dp\[n\] = dp\[n-1\] + dp\[n-2\]

For n = 5:

| **Step** | **Ways** |
|----------|----------|
| 1        | 1        |
| 2        | 2        |
| 3        | 3        |
| 4        | 5        |
| 5        | 8        |

The answer is **8**.

**Time complexity comparison (Fibonacci)**

| **Method**      | **Time**         | **Space**    |
|-----------------|------------------|--------------|
| Naive recursion | O(2n)O(2^n)O(2n) | O(n)O(n)O(n) |
| Memoization     | O(n)O(n)O(n)     | O(n)O(n)O(n) |
| Tabulation      | O(n)O(n)O(n)     | O(n)O(n)O(n) |
| Optimized DP    | O(n)O(n)O(n)     | O(1)O(1)O(1) |

In essence, dynamic programming is **"remembering previous results so you don't solve the same subproblem more than once."** This often reduces exponential-time algorithms to polynomial-time ones.
