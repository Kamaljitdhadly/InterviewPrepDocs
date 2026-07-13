# Data Structures and Algorithms Avl

AVL Tree (Adelson-Velsky and Landis Tree)

An **AVL Tree** is a **self-balancing Binary Search Tree (BST)**.

It automatically keeps the tree balanced after every insertion and deletion so that searching remains fast.

The main idea:

The height difference between the left and right subtrees of any node can never be more than 1.

### Why Do We Need AVL Tree?

First, understand the problem with a normal BST.

A normal BST works like this:

Rule:

Left Child \< Parent \< Right Child

Example:

Insert:

10, 20, 30, 40, 50

A normal BST becomes:

10

\\

20

\\

30

\\

40

\\

50

This is no longer a balanced tree.

Searching becomes like a linked list:

Search = O(n)

AVL Tree Solution

AVL automatically rotates nodes to maintain balance.

After inserting:

10, 20, 30, 40, 50

AVL tree becomes:

30

/ \\

20 40

/ \\

10 50

Height remains small.

Search:

O(log n)

AVL Balance Property

Every node has a **Balance Factor**.

Formula:

Balance Factor = Height of Left Subtree - Height of Right Subtree

Allowed values:

-1, 0, 1

Example:

50

/ \\

30 70

Left height = 1

Right height = 1

Balance Factor:

1 - 1 = 0

Balanced.

Another example:

50

/

30

/

20

Height:

Left = 2

Right = 0

Balance Factor:

2 - 0 = 2

Not allowed.

Tree is unbalanced.

AVL Rotations

To balance the tree, AVL uses rotations.

There are four cases:

- Left Left (LL)

- Right Right (RR)

- Left Right (LR)

- Right Left (RL)

1. Left Left (LL) Rotation

Occurs when insertion happens in the left subtree of the left child.

Example:

Insert:

30

20

10

Before balancing:

30

/

20

/

10

Balance factor of 30:

2

Need right rotation.

After rotation:

20

/ \\

10 30

2. Right Right (RR) Rotation

Occurs when insertion happens in the right subtree of the right child.

Insert:

10

20

30

Before:

10

\\

20

\\

30

Need left rotation.

After:

20

/ \\

10 30

3. Left Right (LR) Rotation

Combination of:

- Left rotation

- Right rotation

Example:

Insert:

30

10

20

Before:

30

/

10

\\

20

Step 1: Left rotate 10

30

/

20

/

10

Step 2: Right rotate 30

20

/ \\

10 30

4. Right Left (RL) Rotation

Combination of:

- Right rotation

- Left rotation

Example:

Insert:

10

30

20

Before:

10

\\

30

/

20

Step 1:

Right rotate 30

10

\\

20

\\

30

Step 2:

Left rotate 10

20

/ \\

10 30

AVL Insertion Steps

When inserting a value:

Step 1

Perform normal BST insertion.

Example:

Insert 25:

50

/

30

Insert:

25

Result:

50

/

30

/

25

Step 2

Calculate balance factors.

50

Balance Factor = 2

Unbalanced.

Step 3

Perform appropriate rotation.

After rotation:

30

/ \\

25 50

Balanced.

AVL Deletion

Deletion is more complex.

Steps:

- Delete like BST.

- Update heights.

- Calculate balance factors.

- Perform rotations if needed.

### Time Complexity

| **Operation** | **AVL Tree** |
|---------------|--------------|
| Search        | O(log n)     |
| Insert        | O(log n)     |
| Delete        | O(log n)     |
| Traversal     | O(n)         |

Why?

Because height is always:

O(log n)

AVL Tree vs Binary Search Tree

| **Feature** | **BST**         | **AVL**         |
|-------------|-----------------|-----------------|
| Balance     | Not guaranteed  | Always balanced |
| Search      | O(n) worst case | O(log n)        |
| Insert      | O(n) worst case | O(log n)        |
| Rotations   | No              | Yes             |
| Complexity  | Simpler         | More complex    |

AVL Tree vs Red-Black Tree

Another self-balancing tree is the **Red-Black Tree**.

| **Feature**   | **AVL**            | **Red-Black**            |
|---------------|--------------------|--------------------------|
| Balance       | More strict        | Less strict              |
| Search        | Faster             | Slightly slower          |
| Insert/Delete | More rotations     | Fewer rotations          |
| Used in       | Read-heavy systems | Frequently modified data |

Examples:

- AVL → Applications where searching is very frequent.

- Red-Black Tree → Many standard libraries.

AVL Tree Implementation Concept in C#

A node needs extra information:

class AVLNode

{

public int Value;

public int Height;

public AVLNode Left;

public AVLNode Right;

public AVLNode(int value)

{

Value = value;

Height = 1;

}

}

Unlike a normal BST node:

class Node

{

public int Value;

public Node Left;

public Node Right;

}

AVL stores the **height** to calculate balance.

Real-World Applications

1. Database Indexing

Used in systems where fast searching is required.

Example:

Employee ID → Employee Record

2. Memory Management

Used in some memory allocation systems.

3. Searching Applications

When:

- Data changes occasionally.

- Searches happen frequently.

4. Dictionaries and Maps

Balanced trees can maintain sorted key-value data.

Common Interview Questions

- What is an AVL tree?

- Why is AVL called a self-balancing tree?

- What is balance factor?

- What values are allowed for balance factor?

- Explain LL, RR, LR, RL rotations.

- Difference between BST and AVL tree?

- Why is searching O(log n) in AVL?

- Why does AVL store height?

- AVL vs Red-Black Tree?

- What happens after insertion causes imbalance?

Summary

| **Feature**      | **AVL Tree**          |
|------------------|-----------------------|
| Type             | Self-balancing BST    |
| Rule             | Left \< Root \< Right |
| Balance Factor   | -1, 0, 1              |
| Height           | O(log n)              |
| Search           | O(log n)              |
| Insert           | O(log n)              |
| Delete           | O(log n)              |
| Balancing Method | Rotations             |
| Rotations        | LL, RR, LR, RL        |

Key Takeaways

- An **AVL Tree is a balanced Binary Search Tree**.

- It prevents BST from becoming a linked list.

- It maintains balance using **rotations**.

- Every node's balance factor must be **-1, 0, or 1**.

- AVL provides guaranteed **O(log n)** search, insertion, and deletion.
