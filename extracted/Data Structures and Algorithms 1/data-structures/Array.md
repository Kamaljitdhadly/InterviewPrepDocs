# Data Structures and Algorithms Array

Array (Data Structure)

An **array** is one of the simplest and most important data structures. It stores **multiple elements of the same data type** in a **continuous block of memory**.

Think of it like a row of lockers:

+----+----+----+----+----+

\| 10 \| 20 \| 30 \| 40 \| 50 \|

+----+----+----+----+----+

0 1 2 3 4

Each value has an **index**, starting from **0**.

### Real-Life Example

Imagine a classroom with 5 students sitting in fixed seats.

| **Seat Number** | **Student** |
|-----------------|-------------|
| 0               | Aman        |
| 1               | Ravi        |
| 2               | Priya       |
| 3               | Neha        |
| 4               | Simran      |

If you want to find the student in seat **2**, you immediately know it is **Priya**.

Arrays work exactly like this.

### Definition

**Array** is a linear data structure that stores elements of the same type in contiguous memory locations and allows direct access using an index.

### Characteristics

1. Fixed Size

Once an array is created, its size cannot change (in most programming languages).

Example:

- int numbers\[5\];

Only 5 integers can be stored.

2. Same Data Type

An integer array stores only integers.

✔ 10

✔ 20

✔ 30

✘ "Hello"

✘ 5.6

3. Contiguous Memory

Elements are stored next to each other in memory.

Address

1000 → 10

1004 → 20

1008 → 30

1012 → 40

1016 → 50

Because memory is continuous, the computer can calculate any element's location instantly.

4. Indexed Access

Every element has an index.

Index : 0 1 2 3 4

Value : 7 5 1 9 6

Accessing index 3:

- array\[3\] = 9

This happens in constant time.

### Why Arrays are Fast

Suppose:

- array = \[10,20,30,40,50\]

Want the 4th element?

Computer calculates:

Address = Base Address + (Index × Size of Data Type)

Example:

Base Address = 1000

Size of int = 4 bytes

Index = 3

Address = 1000 + (3 × 4)

Address = 1012

The computer jumps directly to memory location 1012.

No searching is required.

This is why array access is **O(1)**.

### Basic Operations

1. Access

- array = \[5,10,15,20\]

- array\[2\]

Output

15

Time Complexity:

O(1)

2. Update

Before

- \[5,10,15,20\]

- array\[2\] = 50

After

- \[5,10,50,20\]

Time Complexity

O(1)

3. Traversal

Visit every element one by one.

for each element

print(element)

Output

5

10

15

20

Time Complexity

O(n)

4. Searching

Linear Search

- \[10,20,30,40\]

Find 40

Check 10

Check 20

Check 30

Check 40

Time

O(n)

Binary Search

Works only on a **sorted array**.

- \[10,20,30,40,50\]

Time Complexity

O(log n)

5. Insertion

Insert 25 at index 2.

Before

- \[10,20,30,40\]

Shift elements

30 →

40 →

After

- \[10,20,25,30,40\]

Time Complexity

O(n)

6. Deletion

Delete 20

Before

- \[10,20,30,40\]

Shift left

30 ←

40 ←

After

- \[10,30,40\]

Time Complexity

O(n)

Memory Representation

Suppose

- int arr\[5\];

Memory

Address Value

1000 10

1004 20

1008 30

1012 40

1016 50

Index calculation

Address = Base + Index × Size

### Time Complexity

| **Operation**                   | **Complexity** |
|---------------------------------|----------------|
| Access                          | O(1)           |
| Update                          | O(1)           |
| Traversal                       | O(n)           |
| Linear Search                   | O(n)           |
| Binary Search                   | O(log n)       |
| Insert at End (if space exists) | O(1)           |
| Insert at Beginning             | O(n)           |
| Insert in Middle                | O(n)           |
| Delete                          | O(n)           |

Advantages

- Very fast random access.

- Simple to understand and implement.

- Memory efficient (no extra pointer overhead).

- Cache-friendly because elements are stored contiguously.

- Excellent when the size is known in advance.

Disadvantages

- Fixed size (traditional arrays).

- Insertion in the middle is slow because elements must be shifted.

- Deletion is slow for the same reason.

- Can waste memory if allocated size is larger than needed.

- Stores only one data type (in most statically typed languages).

C# Example

using System;

class Program

{

static void Main()

{

- int\[\] numbers = {10, 20, 30, 40, 50};

- Console.WriteLine(numbers\[2\]); // 30

- numbers\[2\] = 100;

foreach (int num in numbers)

{

Console.WriteLine(num);

}

}

}

- Output:

30

10

20

100

40

50

Common Interview Questions

- Why is array access **O(1)**?

- Why are insertion and deletion **O(n)**?

- What is contiguous memory?

- What is the difference between an array and a linked list?

- Can an array grow in size? (Traditional arrays cannot; dynamic arrays can.)

- What is the difference between linear search and binary search?

- When should you use an array instead of another data structure?

Summary

| **Feature** | **Array**                                               |
|-------------|---------------------------------------------------------|
| Type        | Linear Data Structure                                   |
| Memory      | Contiguous                                              |
| Size        | Fixed (traditional array)                               |
| Access      | O(1)                                                    |
| Search      | O(n), O(log n) if sorted                                |
| Insert      | O(n)                                                    |
| Delete      | O(n)                                                    |
| Best Use    | Fast index-based access with a known number of elements |

Key Takeaways

- Arrays store **same-type elements** in **contiguous memory**.

- Each element is accessed by its **index**.

- Access and updates are **very fast (O(1))**.

- Insertions and deletions are **expensive (O(n))** because elements need to be shifted.

- Arrays are the foundation for many other data structures such as **dynamic arrays (e.g., List\<T\> in C#), stacks, queues, heaps, hash tables, and matrices**.
