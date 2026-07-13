# Data Structures and Algorithms Sliding Window

**Sliding Window in Data Structures and Algorithms**

**Sliding Window** is a technique used to solve problems involving **continuous subarrays or substrings** by maintaining a window (a range of elements) and moving it through the data instead of repeatedly recalculating results.

The main idea:

**Maintain a window of elements, expand when needed, shrink when the condition is violated.**

It is mainly used with:

- Arrays

- Strings

- Subarrays

- Substrings

**Why Do We Need Sliding Window?**

Suppose we have an array:

arr = \[2, 1, 5, 1, 3, 2\]

Find the maximum sum of a subarray of size 3.

**Brute Force Approach**

Check every possible group:

\[2,1,5\] → 8

\[1,5,1\] → 7

\[5,1,3\] → 9

\[1,3,2\] → 6

Maximum:

9

For each window, we calculate the sum again.

Time complexity:

O(n \* k)

where:

- n = array size

- k = window size

**Sliding Window Approach**

Instead of recalculating:

Initial window:

\[2,1,5\] = 8

Move window by one:

Remove outgoing element:

8 - 2 = 6

Add incoming element:

6 + 1 = 7

Next:

7 - 1 + 3 = 9

We reuse previous calculations.

Time:

O(n)

**Types of Sliding Window**

There are two main types:

1.  **Fixed Size Sliding Window**

2.  **Variable Size Sliding Window**

**1. Fixed Size Sliding Window**

The window size remains constant.

Example:

Find maximum sum of k consecutive elements

Given:

\[2,1,5,1,3,2\]

k = 3

Windows:

\[2,1,5\]

\[1,5,1\]

\[5,1,3\]

\[1,3,2\]

**Algorithm**

1.  Create window of size k.

2.  Calculate initial result.

3.  Move window one step.

4.  Remove left element.

5.  Add right element.

**C# Example**

int MaxSum(int\[\] arr, int k)

{

int windowSum = 0;

int maxSum = 0;

// First window

for(int i = 0; i \< k; i++)

{

windowSum += arr\[i\];

}

maxSum = windowSum;

// Slide window

for(int i = k; i \< arr.Length; i++)

{

windowSum += arr\[i\];

windowSum -= arr\[i-k\];

maxSum = Math.Max(maxSum, windowSum);

}

return maxSum;

}

Complexity:

Time: O(n)

Space: O(1)

**2. Variable Size Sliding Window**

Window size changes dynamically.

Used for problems like:

- Longest substring

- Smallest subarray

- Maximum length satisfying a condition

**Example: Longest Subarray With Sum ≤ K**

Array:

\[2,1,5,1,3,2\]

K = 7

Start:

left = 0

right = 0

Expand:

\[2\] sum=2

\[2,1\] sum=3

\[2,1,5\] sum=8

Sum exceeds K.

Shrink:

Remove left:

\[1,5\]

sum=6

Continue.

**General Variable Window Pattern**

int left = 0;

for(int right = 0; right \< arr.Length; right++)

{

// Add arr\[right\] to window

while(condition is invalid)

{

// Remove arr\[left\]

left++;

}

// Update answer

}

**Example: Longest Substring Without Repeating Characters**

Problem:

Input:

abcabcbb

Find longest substring without duplicate characters.

Window movement:

a

ab

abc

Next:

abca

Duplicate a found.

Shrink:

bca

Continue.

Answer:

abc

Length:

3

**C# Implementation**

int LengthOfLongestSubstring(string s)

{

HashSet\<char\> set = new();

int left = 0;

int maxLength = 0;

for(int right = 0; right \< s.Length; right++)

{

while(set.Contains(s\[right\]))

{

set.Remove(s\[left\]);

left++;

}

set.Add(s\[right\]);

maxLength = Math.Max(

maxLength,

right - left + 1

);

}

return maxLength;

}

Complexity:

Time: O(n)

Space: O(k)

**Sliding Window with HashMap**

Many advanced problems use:

Sliding Window + HashMap

Example:

Find:

Longest substring with at most K distinct characters

Example:

eceba

K = 2

Window:

ece

Contains:

e,c

Length:

3

Use:

Dictionary\<char,int\>

to track frequencies.

**Fixed vs Variable Sliding Window**

| **Feature** | **Fixed Window**      | **Variable Window**      |
|-------------|-----------------------|--------------------------|
| Size        | Constant              | Changes                  |
| Movement    | Always move one step  | Expand/Shrink            |
| Uses        | k-size problems       | Condition-based problems |
| Example     | Max sum of k elements | Longest substring        |

**Sliding Window vs Prefix Sum**

| **Sliding Window**          | **Prefix Sum**               |
|-----------------------------|------------------------------|
| Best for continuous ranges  | Best for range queries       |
| Usually one/few passes      | Preprocessing required       |
| Often O(1) space            | Uses extra array             |
| Works well with constraints | Works well with many queries |

Example:

**Sliding Window:**

"Find longest substring"

**Prefix Sum:**

"Find sum between index 100 and 500"

**Sliding Window vs Two Pointer**

They are closely related.

Two pointers:

left → ← right

Sliding window:

\[left ........ right\]

A sliding window is usually a **special case of two pointers**.

**Common Sliding Window Problems**

| **Problem**                                    | **Technique**        |
|------------------------------------------------|----------------------|
| Maximum sum subarray of size K                 | Fixed window         |
| Longest substring without repeating characters | Variable window      |
| Minimum window substring                       | HashMap + window     |
| Longest substring with K distinct chars        | Frequency map        |
| Permutation in string                          | Fixed window         |
| Anagram detection                              | Frequency comparison |
| Maximum in every window                        | Deque                |

**Advanced Example: Minimum Window Substring**

Problem:

Find smallest substring containing all characters.

Input:

ADOBECODEBANC

Target:

ABC

Answer:

BANC

Approach:

1.  Expand right pointer.

2.  Include required characters.

3.  When valid, shrink from left.

4.  Keep minimum window.

**Common Mistakes**

**1. Forgetting to remove elements**

Wrong:

Expand only

The window grows forever.

**2. Incorrect window size**

For fixed window:

right - left + 1

is the current size.

**3. Not handling duplicates**

Use:

- HashSet

- Dictionary frequency

**Interview Explanation (Senior Developer)**

"Sliding window is an optimization technique used for problems involving contiguous sequences. It maintains a range using two pointers and avoids recalculating information by adding new elements when expanding and removing old elements when shrinking. Fixed-size windows are used when the window length is known, while variable-size windows dynamically adjust based on constraints. It reduces many O(n²) brute-force solutions to O(n)."

The usual DSA progression is:

Arrays

↓

Two Pointer

↓

Sliding Window

↓

Prefix Sum

↓

Hashing

↓

Dynamic Programming

Sliding window is one of the most frequently asked techniques in coding interviews because it turns many brute-force subarray/string problems into linear-time solutions.
