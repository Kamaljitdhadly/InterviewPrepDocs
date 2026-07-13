# Data Structures and Algorithms Two Pointers

Two Pointer Technique in Data Structures and Algorithms

**Two Pointer** is an algorithmic technique where we use **two variables (pointers/indexes)** to traverse a data structure, usually an array or string, to solve problems efficiently.

The main idea:

Use two positions in the data structure and move them intelligently instead of using nested loops.

It often reduces problems from **O(n²)** to **O(n)**.

### Why Do We Need Two Pointers?

Consider finding two numbers whose sum equals a target.

Array:

- \[1, 2, 3, 4, 6\]

Target:

6

Brute Force Approach

Try every pair:

1+2

1+3

1+4

1+6

2+3

...

Time:

O(n²)

Two Pointer Approach

Because the array is sorted:

Place:

left right

↓ ↓

- \[1, 2, 3, 4, 6\]

Calculate:

1 + 6 = 7

Too large → decrease right pointer:

left right

↓ ↓

- \[1,2,3,4,6\]

Now:

1 + 4 = 5

Too small → increase left:

left right

↓ ↓

- \[1,2,3,4,6\]

Now:

2 + 4 = 6

Found.

Two Pointer Pattern

Basic structure:

int left = 0;

int right = arr.Length - 1;

while(left \< right)

{

- // process arr\[left\] and arr\[right\]

if(condition)

left++;

else

right--;

}

Types of Two Pointer Techniques

There are mainly three patterns:

- Opposite Direction Pointers

- Same Direction Pointers

- Fast and Slow Pointers

1. Opposite Direction Pointers

Pointers start from both ends.

Example:

left → ← right

- \[1,2,3,4,5\]

Used in:

- Sorted arrays

- Pair problems

- Palindrome checking

- Container problems

### Example 1: Two Sum in Sorted Array

Problem:

Find two numbers that add to target.

- Input:

- \[2,3,5,8,11\]

Target = 13

Algorithm:

left = 2

right = 11

2 + 11 = 13

Answer:

- \[2,11\]

C#:

- bool TwoSum(int\[\] nums, int target)

{

int left = 0;

int right = nums.Length - 1;

while(left \< right)

{

- int sum = nums\[left\] + nums\[right\];

if(sum == target)

return true;

else if(sum \< target)

left++;

else

right--;

}

return false;

}

Complexity:

Time: O(n)

Space: O(1)

### Example 2: Reverse Array

- Input:

- \[1,2,3,4,5\]

Pointers:

left right

↓ ↓

- \[1,2,3,4,5\]

Swap:

- \[5,2,3,4,1\]

Move pointers:

left right

Final:

- \[5,4,3,2,1\]

Code:

- void Reverse(int\[\] arr)

{

int left = 0;

int right = arr.Length - 1;

while(left \< right)

{

- int temp = arr\[left\];

- arr\[left\] = arr\[right\];

- arr\[right\] = temp;

left++;

right--;

}

}

### Example 3: Valid Palindrome

Problem:

Check:

racecar

is palindrome.

Pointers:

r a c e c a r

↑ ↑

left right

Compare:

r == r

a == a

c == c

Valid.

Code:

bool IsPalindrome(string s)

{

int left = 0;

int right = s.Length - 1;

while(left \< right)

{

- if(s\[left\] != s\[right\])

return false;

left++;

right--;

}

return true;

}

2. Same Direction Pointers

Both pointers move from left to right.

Example:

slow →

fast →

- \[1,2,3,4,5\]

Used for:

- Removing duplicates

- Moving elements

- Partitioning arrays

**Example: Remove Duplicates from Sorted Array**

- Input:

- \[1,1,2,2,3\]

Need:

- \[1,2,3\]

Use:

- slow pointer → position for unique element

- fast pointer → scans array

Process:

slow

↓

- \[1,1,2,2,3\]

↑

fast

Code:

- int RemoveDuplicates(int\[\] nums)

{

int slow = 0;

for(int fast = 1; fast \< nums.Length; fast++)

{

- if(nums\[fast\] != nums\[slow\])

{

slow++;

- nums\[slow\] = nums\[fast\];

}

}

return slow + 1;

}

Complexity:

Time: O(n)

Space: O(1)

3. Fast and Slow Pointer (Floyd's Algorithm)

One pointer moves faster than another.

Example:

slow → one step

fast → two steps

Used in:

- Linked list cycle detection

- Finding middle of linked list

- Detecting loops

**Example: Detect Cycle in Linked List**

Linked list:

1 → 2 → 3 → 4

↑ \|

\|\_\_\_\_\_\|

If there is a cycle:

Fast pointer will eventually catch slow pointer.

Algorithm:

slow = head

fast = head

while(fast != null)

{

slow = slow.next;

fast = fast.next.next;

if(slow == fast)

cycle exists

}

**Example: Find Middle of Linked List**

List:

1 → 2 → 3 → 4 → 5

Movement:

slow:

1 → 2 → 3

fast:

1 → 3 → 5

When fast reaches end:

slow is at middle.

Answer:

3

Two Pointer vs Sliding Window

They are related.

Two Pointer

General technique:

pointer1

pointer2

Example:

Find pair sum

Sliding Window

A specialized two-pointer technique:

- \[left .... right\]

Example:

Longest substring

Two Pointer vs Prefix Sum

| **Two Pointer**       | **Prefix Sum**        |
|-----------------------|-----------------------|
| Uses moving indexes   | Uses precomputed sums |
| Usually sorted arrays | Range queries         |
| O(1) extra space      | O(n) extra space      |
| Good for pairs/ranges | Good for sums         |

Common Two Pointer Problems

| **Problem**               | **Pattern**            |
|---------------------------|------------------------|
| Two Sum Sorted Array      | Opposite pointers      |
| Three Sum                 | Sorting + two pointers |
| Container With Most Water | Opposite pointers      |
| Remove duplicates         | Same direction         |
| Move zeros                | Same direction         |
| Reverse string            | Opposite pointers      |
| Linked list cycle         | Fast/slow              |
| Middle of linked list     | Fast/slow              |
| Palindrome check          | Opposite pointers      |

**Example: Container With Most Water**

Problem:

Heights:

- \[1,8,6,2,5,4,8,3,7\]

Need maximum water.

Start:

L R

↓ ↓

1 8 6 2 5 4 8 3 7

Area:

- min(height\[L\],height\[R\]) \* width

Move smaller height pointer.

Why?

The smaller side limits the water.

Common Mistakes

1. Using Two Pointers Without Sorting

For problems like:

Two Sum

the array usually needs to be sorted first.

2. Wrong Pointer Movement

Example:

If sum is too small:

left++

If sum is too large:

right--

3. Infinite Loops

Always ensure:

while(left \< right)

and pointers move.

Interview Explanation (Senior Developer)

"The two-pointer technique uses two indexes to traverse an array or linked list efficiently. Instead of checking all combinations with nested loops, pointers are moved based on conditions to reduce complexity. Common patterns include opposite-direction pointers for sorted array problems, same-direction pointers for in-place modifications, and fast/slow pointers for linked list cycle detection. Most two-pointer solutions achieve O(n) time and O(1) space."

The usual DSA progression:

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

Two pointers is one of the most important optimization patterns for array and linked-list interview problems.
