# Data Structures and Algorithms Tree

**Tree (Data Structure)**

A **Tree** is a **non-linear hierarchical data structure** that stores data in a structure similar to a real-world tree.

Unlike arrays, linked lists, stacks, and queues (which are linear), a tree represents **parent-child relationships**.

**Real-Life Example**

Think about a company's organization structure:

CEO

\|

-----------------

\| \|

Manager1 Manager2

\| \|

Employee1 Employee2

- CEO is the **root**.

- Managers are **children** of CEO.

- Employees are **children** of managers.

A tree data structure works in the same way.

**Basic Tree Structure**

Example:

10

/ \\

20 30

/ \\ / \\

40 50 60 70

Here:

- 10 is the **root node**.

- 20 and 30 are children of 10.

- 40, 50, 60, 70 are leaf nodes.

**Important Terminology**

**1. Node**

A single element in a tree.

Example:

\[10\]

A node stores:

- Data

- References to child nodes

**2. Root**

The topmost node.

Example:

10 ← Root

/ \\

20 30

A tree has only **one root**.

**3. Parent**

A node that has child nodes.

Example:

10

/

20

10 is the parent of 20.

**4. Child**

A node connected below another node.

Example:

10

/

20

20 is the child of 10.

**5. Sibling**

Nodes having the same parent.

Example:

10

/ \\

20 30

20 and 30 are siblings.

**6. Leaf Node**

A node with no children.

Example:

10

/ \\

20 30

20 and 30 are leaf nodes.

**7. Edge**

The connection between two nodes.

Example:

10 ---- 20

The connection is an edge.

**8. Height of Tree**

The longest path from root to leaf.

Example:

10

/

20

/

30

Height = 2 edges

**9. Depth of Node**

Distance from root to that node.

Example:

10 depth 0

/

20 depth 1

/

30 depth 2

**Types of Trees**

**1. General Tree**

A node can have any number of children.

Example:

A

/ / \| \\

B C D E

**2. Binary Tree**

A node can have at most **two children**.

They are called:

- Left child

- Right child

Example:

10

/ \\

20 30

**3. Binary Search Tree (BST)**

A binary tree with a special ordering rule:

Left child \< Parent \< Right child

Example:

50

/ \\

30 70

/ \\ / \\

20 40 60 80

Searching is faster.

Average:

O(log n)

**4. AVL Tree**

A self-balancing Binary Search Tree.

It maintains balance so that the height remains small.

Example:

Balance Factor = Height(left) - Height(right)

Allowed values:

-1, 0, 1

Operations:

Search: O(log n)

Insert: O(log n)

Delete: O(log n)

**5. Heap**

A complete binary tree used for priority operations.

Example:

Max Heap:

100

/ \\

50 80

Parent is greater than children.

Used in:

- Priority Queue

- Heap Sort

**6. Trie**

A tree used for storing strings.

Example:

Words:

cat

car

can

Structure:

c

\|

a

/ \| \\

t r n

Used in:

- Auto-complete

- Dictionary search

**Tree Traversal**

Traversal means visiting every node in a tree.

There are two major categories:

**1. Depth First Traversal (DFS)**

Go deep before moving sideways.

Three types:

**Inorder Traversal**

Order:

Left → Root → Right

Example:

10

/ \\

5 20

Output:

5 10 20

For BST, inorder gives sorted values.

**Preorder Traversal**

Order:

Root → Left → Right

Output:

10 5 20

Used for:

- Copying trees

- Creating tree structure

**Postorder Traversal**

Order:

Left → Right → Root

Output:

5 20 10

Used for:

- Deleting trees

- Expression evaluation

**2. Breadth First Traversal (BFS)**

Visit level by level.

Example:

10

/ \\

20 30

/ \\

40 50

Output:

10 20 30 40 50

Uses a **Queue** internally.

**Tree Implementation in C#**

A simple binary tree node:

class Node

{

public int Data;

public Node Left;

public Node Right;

public Node(int data)

{

Data = data;

Left = null;

Right = null;

}

}

Creating a tree:

Node root = new Node(10);

root.Left = new Node(20);

root.Right = new Node(30);

root.Left.Left = new Node(40);

root.Left.Right = new Node(50);

Structure:

10

/ \\

20 30

/ \\

40 50

**Time Complexity**

Depends on the type of tree.

For a normal binary tree:

| **Operation** | **Complexity** |
|---------------|----------------|
| Search        | O(n)           |
| Insert        | O(n)           |
| Delete        | O(n)           |

For a balanced BST:

| **Operation** | **Complexity** |
|---------------|----------------|
| Search        | O(log n)       |
| Insert        | O(log n)       |
| Delete        | O(log n)       |

**Tree vs Linear Data Structures**

| **Feature**  | **Linear Structures** | **Tree**        |
|--------------|-----------------------|-----------------|
| Arrangement  | Sequential            | Hierarchical    |
| Relationship | One-to-one            | Parent-child    |
| Traversal    | Simple                | Multiple ways   |
| Examples     | Array, Stack, Queue   | BST, Heap, Trie |

**Applications of Trees**

**File Systems**

Example:

C:

\|

-------------

\| \|

Users Program Files

**Databases**

Database indexes use trees:

- B-Tree

- B+ Tree

Used by:

- SQL Server

- Oracle

- PostgreSQL

**Compilers**

Expression trees:

\+

/ \\

5 3

Represents:

5 + 3

**Artificial Intelligence**

Decision trees:

Weather

/ \\

Rain Sunny

**Networks**

Routing tables and hierarchical structures.

**Common Interview Questions**

1.  What is a tree data structure?

2.  Difference between tree and graph?

3.  What is a binary tree?

4.  Difference between binary tree and BST?

5.  What is tree traversal?

6.  Difference between DFS and BFS?

7.  What is tree height?

8.  What is a balanced tree?

9.  Why are trees used in databases?

10. Difference between BST and Heap?

**Summary**

| **Feature**  | **Tree**                  |
|--------------|---------------------------|
| Type         | Non-linear data structure |
| Structure    | Hierarchical              |
| Components   | Nodes + Edges             |
| Top Node     | Root                      |
| Bottom Nodes | Leaves                    |
| Relationship | Parent-Child              |
| Traversal    | DFS and BFS               |
| Examples     | BST, AVL, Heap, Trie      |

**Key Takeaways**

- A **tree** represents hierarchical relationships using **nodes and edges**.

- The top node is called the **root**.

- Nodes can have children, and nodes without children are **leaf nodes**.

- Trees are used extensively in **databases, file systems, searching, AI, compilers, and networking**.

- Important tree types include **Binary Tree, BST, AVL Tree, Heap, and Trie**.
