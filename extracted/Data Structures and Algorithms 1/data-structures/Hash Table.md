# Data Structures and Algorithms Hash Table

Hash Table (Data Structure)

A **Hash Table** is a data structure that stores data in **key-value pairs** and provides very fast insertion, deletion, and searching.

The main idea:

Use a hash function to convert a key into an index where the value is stored.

Average time complexity for searching is:

O(1)

### Real-Life Example

Think of a dictionary.

You want to find the meaning of a word:

Word → Meaning

"Apple" → "A fruit"

"Car" → "A vehicle"

Instead of checking every word one by one, you directly jump to the location.

A hash table works similarly.

Hash Table Structure

A hash table contains:

- **Keys** → Unique identifiers.

- **Values** → Data associated with keys.

- **Hash Function** → Converts key into an index.

- **Buckets/Array** → Stores the data.

Example:

Key Value

101 → Kamal

102 → Rahul

103 → Amit

How Hash Table Works?

Suppose we want to store:

Key = 25

Value = "John"

A hash function calculates an index:

Hash Function:

index = key % table_size

Assume table size = 10

25 % 10 = 5

Store the value at index 5.

Index Value

0

1

2

3

4

5 → 25, John

6

7

8

9

Searching in Hash Table

Search:

Key = 25

Hash function:

25 % 10 = 5

Go directly to index 5.

Found:

John

No need to scan the whole collection.

Hash Function

A hash function converts a key into a numeric index.

Example:

Key = "CAT"

Hash("CAT") = 7

Store:

- Bucket\[7\] = CAT

A good hash function should:

- Be fast.

- Distribute values evenly.

- Minimize collisions.

Collision in Hash Table

A collision happens when two keys produce the same index.

Example:

Table size = 10

25 % 10 = 5

35 % 10 = 5

Both want index 5.

Index

5 → 25

5 → 35

This is a collision.

Handling Collisions

There are two common techniques.

1. Separate Chaining

Each bucket stores a list.

Example:

Bucket 5

↓

25 → 35 → 45

Multiple values can exist at the same index.

2. Open Addressing

Find another empty location.

Example:

Initial:

Index 5 occupied

Try:

Index 6

If empty:

Store there

Types:

- Linear probing

- Quadratic probing

- Double hashing

Hash Table Operations

1. Insert

Add key-value pair.

Example:

Add:

101 → "Kamal"

Steps:

- Calculate hash.

- Find index.

- Store value.

Average complexity:

O(1)

2. Search

Find value using key.

Example:

Find:

101

Hash:

101 → Index 4

Retrieve value.

Average:

O(1)

3. Delete

Remove using key.

Example:

Delete:

101

Average:

O(1)

### Time Complexity

| **Operation** | **Average** | **Worst Case** |
|---------------|-------------|----------------|
| Insert        | O(1)        | O(n)           |
| Search        | O(1)        | O(n)           |
| Delete        | O(1)        | O(n)           |

Why worst case?

Because if many collisions happen, all items may end up in one bucket.

Hash Table vs Array

| **Feature**    | **Array**  | **Hash Table** |
|----------------|------------|----------------|
| Storage        | Indexed    | Key-based      |
| Access         | Index      | Key            |
| Search         | O(n)       | O(1) average   |
| Ordering       | Maintained | Not guaranteed |
| Duplicate Keys | Allowed    | Usually not    |

Hash Table vs Linked List

| **Feature** | **Linked List**        | **Hash Table** |
|-------------|------------------------|----------------|
| Search      | O(n)                   | O(1) average   |
| Insert      | O(1) at known position | O(1) average   |
| Memory      | Low                    | Higher         |
| Access      | Sequential             | Direct         |

Hash Table vs Tree

| **Feature**    | **Hash Table** | **Tree** |
|----------------|----------------|----------|
| Search         | O(1) average   | O(log n) |
| Ordering       | No             | Yes      |
| Range Queries  | Poor           | Good     |
| Implementation | Hash function  | Nodes    |

Hash Table in C#

In .NET, the common implementation is:

Dictionary\<TKey,TValue\>

using System;

using System.Collections.Generic;

class Program

{

static void Main()

{

Dictionary\<int,string\> users = new();

users.Add(101, "Kamal");

users.Add(102, "Rahul");

users.Add(103, "Amit");

- Console.WriteLine(users\[102\]);

}

}

- Output:

Rahul

Internally:

Dictionary\<TKey,TValue\>

\|

↓

Hash Table

HashSet

A HashSet is a hash table that stores only keys.

Example:

HashSet\<int\> numbers = new();

numbers.Add(10);

numbers.Add(20);

numbers.Add(10);

Result:

{10,20}

Duplicate values are ignored.

Real-World Applications

1. Database Indexing

Databases use hash indexes for fast lookup.

Example:

EmployeeId → Employee Record

2. Caching

Example:

Redis cache:

UserId → User Data

Instead of querying database every time.

3. Authentication

Store:

SessionId → User Information

4. Counting Frequency

Example:

Find character frequency:

- Input:

banana

Hash table:

b → 1

a → 3

n → 2

5. Compiler Symbol Tables

Programming languages store:

Variable Name → Memory Location

Example:

count → address 1000

6. Duplicate Detection

Example:

Check duplicate numbers:

- \[10,20,30,20\]

Store:

{10,20,30}

When 20 appears again:

Already exists

Hash Table Internals in .NET

Dictionary\<TKey,TValue\> internally maintains:

Buckets Array

\|

↓

Entries Array

\|

↓

Hash Code

Key

Value

Next

When you insert:

Key

\|

↓

GetHashCode()

\|

↓

Bucket Index

\|

↓

Store Entry

Common Interview Questions

- What is a hash table?

- How does a hash table achieve O(1) lookup?

- What is a hash function?

- What is collision?

- How do you handle collisions?

- Difference between Dictionary and Hashtable in C#?

- Difference between HashSet and Dictionary?

- Why should keys be immutable?

- What happens when two objects have the same hash code?

- Why is hash table search O(n) in the worst case?

Summary

| **Feature**        | **Hash Table**                 |
|--------------------|--------------------------------|
| Type               | Non-linear data structure      |
| Stores             | Key-Value pairs                |
| Uses               | Hash Function                  |
| Access             | By Key                         |
| Search             | O(1) average                   |
| Insert             | O(1) average                   |
| Delete             | O(1) average                   |
| Collision Handling | Chaining / Open Addressing     |
| C# Implementation  | Dictionary, Hashtable, HashSet |

Key Takeaways

- A **Hash Table stores data using key-value pairs**.

- A **hash function converts keys into array indexes**.

- It provides extremely fast lookup, insertion, and deletion (**O(1) average**).

- The main challenge is **collision handling**.

- In .NET, Dictionary\<TKey,TValue\> and HashSet\<T\> are common hash table-based collections.
