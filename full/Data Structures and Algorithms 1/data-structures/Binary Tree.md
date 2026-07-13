# Data Structures and Algorithms Binary Tree

**Binary Tree (Data Structure)**

A **Binary Tree** is a type of **tree data structure** where each node can have **at most two children**.

The two children are called:

1.  **Left Child**

2.  **Right Child**

The main rule:

A node in a binary tree can have 0, 1, or 2 children.

**Basic Structure**

Example:

10

/ \\

20 30

/ \\ \\

40 50 60

Here:

- 10 → Root node

- 20, 30 → Children of 10

- 40, 50, 60 → Leaf nodes

**Binary Tree Terminology**

**1. Node**

A single element of a tree.

Example:

\[10\]

A node contains:

- Data

- Reference to left child

- Reference to right child

**2. Root Node**

The first/top node of the tree.

Example:

10 ← Root

/ \\

20 30

A binary tree has only one root.

**3. Parent Node**

A node that has child nodes.

Example:

10

/ \\

20 30

10 is the parent of 20 and 30.

**4. Child Node**

A node connected below another node.

Example:

10

/

20

20 is the child of 10.

**5. Leaf Node**

A node with no children.

Example:

10

/ \\

20 30

20 and 30 are leaf nodes.

**6. Edge**

The connection between two nodes.

Example:

10 -------- 20

The line is an edge.

**7. Height of Tree**

The longest path from root to a leaf.

Example:

10

/

20

/

30

Height:

2

(counting edges)

**Binary Tree Node Representation**

A binary tree node usually contains:

+----------------+

\| Data \|

+----------------+

\| Left Pointer \|

+----------------+

\| Right Pointer \|

+----------------+

Example in C#:

class Node

{

public int Data;

public Node Left;

public Node Right;

public Node(int value)

{

Data = value;

Left = null;

Right = null;

}

}

**Creating a Binary Tree in C#**

Example:

Node root = new Node(10);

root.Left = new Node(20);

root.Right = new Node(30);

root.Left.Left = new Node(40);

root.Left.Right = new Node(50);

Creates:

10

/ \\

20 30

/ \\

40 50

**Types of Binary Trees**

**1. Full Binary Tree**

A binary tree where every node has either:

- 0 children

- 2 children

Example:

10

/ \\

20 30

/ \\

40 50

All nodes have either 0 or 2 children.

**2. Complete Binary Tree**

A binary tree where:

- All levels are completely filled except possibly the last.

- Last level is filled from left to right.

Example:

10

/ \\

20 30

/ \\

40 50

Used in:

- Heap data structure

**3. Perfect Binary Tree**

Every internal node has exactly two children, and all leaf nodes are at the same level.

Example:

10

/ \\

20 30

/ \\ / \\

40 50 60 70

Properties:

For height h:

Number of nodes:

2^(h+1) - 1

**4. Balanced Binary Tree**

Height of left and right subtrees is almost equal.

Example:

10

/ \\

20 30

Examples:

- AVL Tree

- Red-Black Tree

**5. Skewed Binary Tree**

All nodes are on one side.

**Left Skewed**

10

/

20

/

30

**Right Skewed**

10

\\

20

\\

30

It behaves like a linked list.

**Binary Tree Traversal**

Traversal means visiting every node.

There are two main approaches:

1.  Depth First Search (DFS)

2.  Breadth First Search (BFS)

**1. Depth First Traversal (DFS)**

Uses:

- Recursion

- Stack

There are three types.

**A. Inorder Traversal**

Order:

Left → Root → Right

Example:

10

/ \\

20 30

Steps:

20 → 10 → 30

Used in:

- Binary Search Tree (gives sorted order)

**B. Preorder Traversal**

Order:

Root → Left → Right

Example:

Output:

10 → 20 → 30

Used for:

- Copying a tree

- Serialization

**C. Postorder Traversal**

Order:

Left → Right → Root

Example:

Output:

20 → 30 → 10

Used for:

- Deleting a tree

**2. Breadth First Traversal (Level Order)**

Uses:

- Queue

Example:

10

/ \\

20 30

/

40

Traversal:

10 → 20 → 30 → 40

**Binary Tree Operations**

**1. Insert**

Adding a new node.

In a normal binary tree, insertion position depends on the implementation.

Example:

Before:

10

/

20

Insert 30:

10

/ \\

20 30

**2. Search**

Find a value.

Example:

Search 30:

10

/ \\

20 30

Need to traverse nodes.

Complexity:

O(n)

**3. Delete**

Remove a node.

Cases:

**Case 1: Leaf Node**

10

/

20

Remove 20.

**Case 2: One Child**

10

\\

20

\\

30

Replace node with child.

**Case 3: Two Children**

Replace with:

- Inorder successor

- Inorder predecessor

**Binary Tree vs Binary Search Tree**

Many people confuse these.

**Binary Tree**

Only rule:

Maximum 2 children

Example:

50

/ \\

100 20

Valid binary tree.

**Binary Search Tree**

Additional ordering rule:

Left \< Root \< Right

Example:

50

/ \\

30 70

**Binary Tree vs BST**

| **Feature**      | **Binary Tree** | **BST**               |
|------------------|-----------------|-----------------------|
| Children         | Max 2           | Max 2                 |
| Ordering         | No rule         | Left \< Root \< Right |
| Search           | O(n)            | O(log n) average      |
| Sorted Traversal | No              | Yes (Inorder)         |

**Applications of Binary Trees**

**1. Expression Trees**

Mathematical expressions:

(5 + 3) \* 2

Tree:

\*

/ \\

\+ 2

/ \\

5 3

**2. Binary Search Trees**

Used for:

- Searching

- Sorting

- Maintaining ordered data

**3. Heaps**

Priority queues use complete binary trees.

**4. File Systems**

Hierarchical folder structures.

**5. Artificial Intelligence**

Decision trees.

Example:

Weather

/ \\

Rain Sunny

**Time Complexity**

For a normal binary tree:

| **Operation** | **Complexity** |
|---------------|----------------|
| Search        | O(n)           |
| Insert        | O(n)           |
| Delete        | O(n)           |
| Traversal     | O(n)           |

For a balanced BST:

| **Operation** | **Complexity** |
|---------------|----------------|
| Search        | O(log n)       |
| Insert        | O(log n)       |
| Delete        | O(log n)       |

**Common Interview Questions**

1.  What is a binary tree?

2.  Difference between binary tree and BST?

3.  Difference between full and complete binary tree?

4.  Explain tree traversal algorithms.

5.  What is height of binary tree?

6.  How many nodes can a binary tree have?

7.  Difference between BFS and DFS?

8.  How do you find the depth of a binary tree?

9.  How do you check if two binary trees are identical?

10. How do you find the lowest common ancestor?

**Summary**

| **Feature**      | **Binary Tree**           |
|------------------|---------------------------|
| Type             | Non-linear data structure |
| Structure        | Hierarchical              |
| Maximum Children | 2                         |
| Children Names   | Left and Right            |
| Root             | One                       |
| Traversal        | DFS, BFS                  |
| Storage          | Nodes + References        |
| Search           | O(n)                      |

**Key Takeaways**

- A **Binary Tree is a tree where each node has at most two children**.

- Children are called **left child** and **right child**.

- Binary trees are the foundation for many advanced structures like **BST, AVL Tree, Heap, and Expression Trees**.

- Traversal methods (**Inorder, Preorder, Postorder, Level Order**) are the most important concepts for interviews.
