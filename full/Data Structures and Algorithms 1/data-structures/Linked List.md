# Data Structures and Algorithms Linked List

A linked list is a linear data structure where elements are stored as separate objects called nodes. Each node contains the data and a reference (pointer) to the next node in the sequence.

Unlike an array, the elements are not stored next to each other in memory.

Basic idea

Each node has two parts:

- Data — the actual value.

- Next — a reference to the next node.

Structure of a node

Node

Data

Next

Visualization

A linked list storing 10, 20, 30, 40:

Head

10

next

20

next

30

next

40

NULL

The last node points to NULL, meaning the list ends there.

How memory looks

Nodes can be scattered in memory:

| **Address** | **Data** | **Next** |
|-------------|----------|----------|
| 1000        | 10       | 5000     |
| 5000        | 20       | 8000     |
| 8000        | 30       | 2000     |
| 2000        | 40       | NULL     |

Notice:

- The addresses are not consecutive.

- Each node knows where the next node is.

- The list is connected through references.

### Why use a linked list?

Suppose an array is full:

10

20

30

40

To add another element, an array may need:

- Create a larger array.

- Copy all elements.

- Delete the old array.

In a linked list, you simply create a new node and connect it:

10

20

30

40

50

Basic operations

1. Traversal

Visit each node one by one.

10

20

30

40

- Output: 10, 20, 30, 40

Time Complexity: O(n)

2. Searching

Find 30:

10

20

30 ✓

Check 10 → Check 20 → Found 30

Time Complexity: O(n)

3. Insertion at the beginning

Before:

10

20

30

Insert 5:

5

10

20

30

Steps:

- Create a new node (5).

- Point its Next to the old head.

- Update Head to the new node.

Time Complexity: O(1)

4. Insertion at the end

Before:

10

20

30

Insert 40:

10

20

30

40

If we only have a Head pointer, we must traverse to the last node.

Time Complexity: O(n)

If we also keep a Tail pointer, insertion at the end becomes:

O(1)

5. Deletion

Delete 20.

Before:

10

20

30

40

After:

10

30

40

The previous node (10) now points directly to 30.

### Why random access is slow

Suppose you want the 4th element.

Array:

10

20

30

40

50

- Direct access: array\[3\] → 40

O(1)

Linked List:

10

20

30

40

You must visit: 10 → 20 → 30 → 40

O(n)

A linked list has no index-based direct access.

Time complexity

| **Operation**               | **Complexity** |
|-----------------------------|----------------|
| Access by index             | O(n)           |
| Search                      | O(n)           |
| Traversal                   | O(n)           |
| Insert at beginning         | O(1)           |
| Insert at end (Head only)   | O(n)           |
| Insert at end (Head + Tail) | O(1)           |
| Insert in middle            | O(n)           |
| Delete                      | O(n)           |

C# node class

Simple linked list example

- Output:

10

20

30

Advantages

- Dynamic size — can grow or shrink easily.

- Fast insertion at the beginning (O(1)).

- No need for contiguous memory.

- No costly array resizing.

Disadvantages

- Slow random access (O(n)).

- Extra memory is needed for the Next pointer.

- Poor cache performance because nodes are scattered.

- Searching is slower than arrays.

Array vs Linked List

| **Feature**         | **Array**  | **Linked List** |
|---------------------|------------|-----------------|
| Memory              | Contiguous | Non-contiguous  |
| Random access       | O(1)       | O(n)            |
| Insert at beginning | O(n)       | O(1)            |
| Insert at end       | O(1)\*     | O(n)\*\*        |
| Delete              | O(n)       | O(n)            |
| Dynamic size        | No         | Yes             |
| Extra memory        | No         | Yes (pointer)   |

\* If space is available.

\*\* O(1) if a Tail pointer is maintained.

When should you use a linked list?

Use a linked list when:

- The number of elements changes frequently.

- You perform many insertions or deletions.

- Insertions at the beginning are common.

- Random access is not important.

Avoid it when:

- You frequently access elements by index.

- You need fast random access.

- Cache performance matters.

Common interview questions

- What is a linked list?

- Why doesn't it require contiguous memory?

- Why is accessing the nth element O(n)?

- Why is insertion at the beginning O(1)?

- Why does it use more memory than an array?

- How can insertion at the end become O(1)?

Summary

<table style="width:47%;">
<colgroup>
<col style="width: 20%" />
<col style="width: 26%" />
</colgroup>
<thead>
<tr>
<th style="text-align: center;"><strong>Feature</strong></th>
<th style="text-align: center;"><strong>Linked List</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td>Type</td>
<td>Linear Data Structure</td>
</tr>
<tr>
<td>Storage</td>
<td>Non-contiguous memory</td>
</tr>
<tr>
<td>Node contains</td>
<td>Data + Next</td>
</tr>
<tr>
<td>Random access</td>
<td>O(n)</td>
</tr>
<tr>
<td>Search</td>
<td>O(n)</td>
</tr>
<tr>
<td>Insert at beginning</td>
<td>O(1)</td>
</tr>
<tr>
<td>Insert at end</td>
<td><p>O(n)</p>
<p>or O(1) with Tail</p></td>
</tr>
<tr>
<td>Delete</td>
<td>O(n)</td>
</tr>
</tbody>
</table>

Key takeaway

A linked list is a chain of nodes, where each node stores data and a reference to the next node. It is excellent for frequent insertions and deletions, but poor for direct index-based access because you must traverse the list node by node.

Next, you can learn Doubly Linked List — where each node has both Next and Previous pointers.
