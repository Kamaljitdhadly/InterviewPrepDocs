# Data Structures and Algorithms Set

**Set (Data Structure)**

A **Set** is a data structure that stores a collection of **unique elements**.

The main property of a set is:

**A set does not allow duplicate values.**

For example:

Set = {10, 20, 30, 40}

If you try to add 20 again:

Set = {10, 20, 30, 40, 20}

The set will ignore it:

Set = {10, 20, 30, 40}

**Real-Life Example**

Imagine a list of registered email addresses.

user1@gmail.com

user2@gmail.com

user3@gmail.com

If someone tries to register:

user2@gmail.com

again, the system checks:

"This email already exists."

A Set is perfect for this because it automatically prevents duplicates.

**Characteristics of a Set**

**1. Unique Elements**

A set stores only one copy of each value.

Example:

Input:

\[10, 20, 20, 30, 30, 40\]

Set:

{10, 20, 30, 40}

**2. No Index**

Unlike arrays:

Array:

Index: 0 1 2

Value: 10 20 30

A set usually does not provide indexing:

Set:

{10,20,30}

You cannot do:

set\[2\]

**3. Order May Not Be Maintained**

Many sets do not guarantee insertion order.

Example:

Insert:

50

10

30

20

The set may store:

{10,20,30,50}

or another order.

**Common Set Operations**

**1. Add / Insert**

Adds an element.

Example:

Set:

{10,20,30}

Add 40:

{10,20,30,40}

Time Complexity:

Usually:

O(1)

(for hash-based sets)

**2. Remove**

Removes an element.

Example:

Before:

{10,20,30,40}

Remove 30

After:

{10,20,40}

Time Complexity:

Usually:

O(1)

**3. Contains / Search**

Check whether an element exists.

Example:

Set:

{10,20,30}

Check:

Contains(20)

Result:

true

Time Complexity:

Hash Set:

O(1)

**4. Size**

Returns number of elements.

Example:

{10,20,30}

Size = 3

Time:

O(1)

**How Does a Set Work Internally?**

Most modern sets are implemented using a **Hash Table**.

Example:

Set:

{15,25,35}

A hash function calculates a location.

Hash(15) → Bucket 5

Hash(25) → Bucket 8

Hash(35) → Bucket 2

Memory:

Bucket 0

Bucket 1

Bucket 2 → 35

Bucket 3

Bucket 4

Bucket 5 → 15

Bucket 6

Bucket 7

Bucket 8 → 25

This allows very fast lookup.

**HashSet vs SortedSet**

In C#, there are two common set implementations.

**1. HashSet\<T\>**

Uses a hash table.

Example:

HashSet\<int\> numbers = new HashSet\<int\>();

numbers.Add(10);

numbers.Add(20);

numbers.Add(20);

numbers.Add(30);

Result:

{10,20,30}

Characteristics:

- Very fast lookup.

- No sorting.

- No duplicate values.

Complexity:

| **Operation** | **Time** |
|---------------|----------|
| Add           | O(1)     |
| Remove        | O(1)     |
| Contains      | O(1)     |

**2. SortedSet\<T\>**

Stores elements in sorted order.

Example:

SortedSet\<int\> numbers =

new SortedSet\<int\>();

numbers.Add(30);

numbers.Add(10);

numbers.Add(20);

Output:

{10,20,30}

Internally uses a balanced tree (Red-Black Tree).

Complexity:

| **Operation** | **Time** |
|---------------|----------|
| Add           | O(log n) |
| Remove        | O(log n) |
| Search        | O(log n) |

**Set Operations (Mathematical)**

Sets support operations from mathematics.

Suppose:

A = {1,2,3,4}

B = {3,4,5,6}

**1. Union**

All elements from both sets.

A ∪ B

= {1,2,3,4,5,6}

**2. Intersection**

Common elements.

A ∩ B

= {3,4}

**3. Difference**

Elements in A but not B.

A - B

= {1,2}

**4. Symmetric Difference**

Elements present in either set but not both.

A △ B

= {1,2,5,6}

**Set vs Array**

| **Feature**  | **Array**          | **Set**                |
|--------------|--------------------|------------------------|
| Duplicates   | Allowed            | Not allowed            |
| Index Access | Yes                | No                     |
| Search       | O(n)               | O(1) average           |
| Order        | Maintained         | Usually not guaranteed |
| Insert       | O(n) sometimes     | O(1) average           |
| Use Case     | Store ordered data | Store unique values    |

**Set vs List**

| **Feature**      | **List**       | **Set**                   |
|------------------|----------------|---------------------------|
| Duplicate Values | Allowed        | Not allowed               |
| Access by Index  | Yes            | No                        |
| Search           | O(n)           | O(1) average              |
| Ordering         | Maintained     | Depends on implementation |
| Example          | Shopping items | Unique user IDs           |

**Real-World Applications**

**1. Removing Duplicates**

Example:

Input:

\[1,2,2,3,3,4\]

Convert to set:

{1,2,3,4}

**2. User Permissions**

Example:

User Roles:

{

Admin,

Editor,

Viewer

}

A user should not have duplicate roles.

**3. Unique Visitors**

Website analytics:

Visitors:

User1

User2

User1

User3

Set:

{User1, User2, User3}

**4. Database Unique Constraints**

Database columns like:

Email

Username

Employee ID

behave like sets.

**5. Graph Algorithms**

Sets are used for:

- Tracking visited nodes.

- Preventing cycles.

- BFS/DFS visited collections.

Example:

Visited = {A,B,C,D}

**C# Example**

using System;

using System.Collections.Generic;

class Program

{

static void Main()

{

HashSet\<int\> numbers = new HashSet\<int\>();

numbers.Add(10);

numbers.Add(20);

numbers.Add(20);

numbers.Add(30);

foreach(int num in numbers)

{

Console.WriteLine(num);

}

Console.WriteLine(numbers.Contains(20));

}

}

Output:

10

20

30

True

Notice:

20

was added twice but stored once.

**Common Interview Questions**

1.  What is a Set data structure?

2.  Why does a Set not allow duplicates?

3.  Difference between Set and List?

4.  How does HashSet achieve O(1) lookup?

5.  What happens when two values have the same hash?

6.  Difference between HashSet and SortedSet?

7.  When should you use a Set instead of an Array?

8.  Explain Union, Intersection, and Difference operations.

**Summary**

| **Feature**       | **Set**                      |
|-------------------|------------------------------|
| Type              | Collection Data Structure    |
| Stores            | Unique Elements              |
| Duplicate Values  | Not Allowed                  |
| Index Access      | No                           |
| Search            | O(1) average (HashSet)       |
| Sorted Version    | SortedSet                    |
| C# Implementation | HashSet\<T\>, SortedSet\<T\> |

**Key Takeaways**

- A **Set stores unique values only**.

- It is mainly used when **duplicate data should be prevented**.

- A **HashSet** provides very fast insertion, deletion, and lookup.

- A **SortedSet** keeps elements sorted but has slightly slower operations.

- Sets are widely used in **duplicate removal, caching, permissions, graph traversal, and database uniqueness checks**.
