# Data Structures and Algorithms Dynamic Array List

Dynamic Array (Data Structure)

A **dynamic array** is an array that **automatically grows (and sometimes shrinks) in size** when needed. Unlike a traditional array, you don't have to know the size in advance.

In C#, the most common dynamic array is **List\<T\>**.

### Why Do We Need Dynamic Arrays?

Imagine you create a traditional array:

- int\[\] numbers = new int\[5\];

It can store **only 5 elements**.

If you try to add a 6th element:

- \[10\]\[20\]\[30\]\[40\]\[50\]

There is no more space.

You have only two options:

- Create a new larger array.

- Copy all elements.

- Delete the old array.

Doing this manually is inconvenient.

A **dynamic array** does this automatically.

### Real-Life Example

Imagine a bookshelf with **5 slots**.

+----+----+----+----+----+

\| 📘 \| 📗 \| 📙 \| 📕 \| 📓 \|

+----+----+----+----+----+

You buy another book.

A normal bookshelf says:

"No space."

A dynamic bookshelf says:

- Buy a larger bookshelf.

- Move all books.

- Add the new book.

The process is automatic.

How Dynamic Arrays Work

Suppose the capacity is **4**.

Capacity = 4

- \[10\]\[20\]\[30\]\[40\]

Now insert **50**.

There is no space.

The dynamic array performs these steps:

Step 1: Allocate a Larger Array

Usually, it **doubles** the capacity.

Old Capacity = 4

New Capacity = 8

Step 2: Copy Elements

Old array

- \[10\]\[20\]\[30\]\[40\]

↓

New array

- \[10\]\[20\]\[30\]\[40\]\[ \]\[ \]\[ \]\[ \]

Step 3: Delete the Old Array

Old memory is released

Step 4: Insert New Element

- \[10\]\[20\]\[30\]\[40\]\[50\]\[ \]\[ \]\[ \]

Done!

Visualization

Initially

Capacity = 4

Size = 4

+----+----+----+----+

\|10 \|20 \|30 \|40 \|

+----+----+----+----+

Insert 50

↓

Allocate Capacity = 8

+----+----+----+----+----+----+----+----+

\|10 \|20 \|30 \|40 \|50 \| \| \| \|

+----+----+----+----+----+----+----+----+

Size vs Capacity

This is one of the most important interview concepts.

Size

Number of actual elements.

- \[10\]\[20\]\[30\]

Size = 3

Capacity

Amount of allocated memory.

- \[10\]\[20\]\[30\]\[ \]\[ \]\[ \]\[ \]\[ \]

Capacity = 8

Notice

Size ≠ Capacity

### Example

Capacity = 8

+----+----+----+----+----+----+----+----+

\|10 \|20 \|30 \|40 \| \| \| \| \|

+----+----+----+----+----+----+----+----+

Size = 4

Capacity = 8

Growth Strategy

Most programming languages use approximately **2× growth**.

Example

1

↓

2

↓

4

↓

8

↓

16

↓

32

↓

64

This reduces the number of expensive resize operations.

### Why Not Increase by 1 Every Time?

Suppose capacity grows like this:

5

↓

6

↓

7

↓

8

↓

9

Every insertion after the array is full requires:

- Allocate new memory

- Copy all elements

- Delete old array

If you insert **100,000 elements**, this would require almost **100,000 copies**, making it extremely slow.

Doubling the capacity keeps resizing infrequent.

### Time Complexity

Access

- array\[i\]

O(1)

Update

- array\[i\] = value

O(1)

Search

Linear Search

O(n)

Binary Search (sorted)

O(log n)

Insert at End

Usually

O(1)

Sometimes (when resize occurs)

O(n)

### Why Is Append Considered O(1)?

Although resizing takes **O(n)** because all elements must be copied, it happens only occasionally.

Example:

Capacity = 4

Insert 1

Insert 2

Insert 3

Insert 4

No resizing

Only the 5th insertion causes a resize.

Because most insertions don't resize, the **average cost per append** is **amortized O(1)**.

**Amortized Analysis:** A few expensive operations are spread across many cheap operations, making the average cost per operation constant.

Insert in Middle

O(n)

Elements must shift.

Delete

O(n)

Elements shift left.

Memory Representation

Old Array

Address

1000 → 10

1004 → 20

1008 → 30

1012 → 40

Resize

Allocate

2000

Copy

2000 → 10

2004 → 20

2008 → 30

2012 → 40

2016 → 50

Old memory

1000

↓

Released

Advantages

- Automatically grows when needed.

- Fast random access (**O(1)**).

- Easy to use.

- Efficient memory usage compared to repeatedly allocating fixed-size arrays.

- Ideal when the number of elements is unknown.

Disadvantages

- Resizing is expensive because it copies all elements.

- Uses extra memory due to unused capacity.

- Insertion/deletion in the middle remains slow (**O(n)**).

- Requires contiguous memory, so allocating very large arrays may become difficult.

Dynamic Arrays in Different Languages

| **Language** | **Dynamic Array** |
|--------------|-------------------|
| C#           | List\<T\>         |
| Java         | ArrayList         |
| C++          | vector            |
| Python       | list              |
| JavaScript   | Array             |

C# Example

using System;

using System.Collections.Generic;

class Program

{

static void Main()

{

List\<int\> numbers = new List\<int\>();

numbers.Add(10);

numbers.Add(20);

numbers.Add(30);

numbers.Add(40);

numbers.Add(50);

foreach (int number in numbers)

{

Console.WriteLine(number);

}

}

}

- Output:

10

20

30

40

50

Array vs Dynamic Array

| **Feature**      | **Array**            | **Dynamic Array (List\<T\>)** |
|------------------|----------------------|-------------------------------|
| Size             | Fixed                | Automatically grows           |
| Memory           | Contiguous           | Contiguous                    |
| Access           | O(1)                 | O(1)                          |
| Append           | Not possible if full | Amortized O(1)                |
| Insert in Middle | O(n)                 | O(n)                          |
| Delete           | O(n)                 | O(n)                          |
| Resize           | Manual               | Automatic                     |
| Best Use         | Known fixed size     | Unknown or changing size      |

Common Interview Questions

- What is a dynamic array?

- How is a dynamic array different from a traditional array?

- Why is appending to a dynamic array considered **amortized O(1)** instead of always **O(1)**?

- What is the difference between **size** and **capacity**?

- Why do most implementations double the capacity instead of increasing it by one?

- Does a dynamic array store elements contiguously?

- Why are insertions and deletions in the middle still **O(n)**?

Summary

| **Feature**     | **Dynamic Array**             |
|-----------------|-------------------------------|
| Type            | Linear Data Structure         |
| Memory          | Contiguous                    |
| Size            | Dynamic (grows automatically) |
| Access          | O(1)                          |
| Append          | Amortized O(1)                |
| Insert (Middle) | O(n)                          |
| Delete          | O(n)                          |
| Search          | O(n), or O(log n) if sorted   |
| Example in C#   | List\<T\>                     |

Key Takeaways

- A **dynamic array** behaves like a normal array but automatically resizes when it runs out of space.

- It maintains **contiguous memory**, so random access remains **O(1)**.

- Resizing is expensive (**O(n)**), but because it happens infrequently, appending elements has an **amortized O(1)** time complexity.

- In C#, List\<T\> is the standard implementation of a dynamic array.
