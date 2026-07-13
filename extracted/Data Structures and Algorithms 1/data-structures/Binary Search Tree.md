# Data Structures and Algorithms Binary Search Tree

**Binary Search Tree (BST)**

A **Binary Search Tree (BST)** is a special type of **Binary Tree** where every node follows an ordering rule:

**All values in the left subtree are smaller than the node value, and all values in the right subtree are greater than the node value.**

Rule:

Left Subtree \< Root Node \< Right Subtree

**Example of BST**

Consider inserting:

50, 30, 70, 20, 40, 60, 80

BST:

50

/ \\

30 70

/ \\ / \\

20 40 60 80

Check the rule:

For node 50:

Left side:

20, 30, 40 \< 50 ✅

Right side:

60, 70, 80 \> 50 ✅

For node 30:

20 \< 30 \< 40 ✅

**Why Use BST?**

A normal binary tree does not have any ordering.

Example:

50

/ \\

100 10

Searching for 10 may require checking every node.

Time:

O(n)

A BST organizes data so searching becomes faster.

**BST Node Structure**

Each node contains:

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

public Node(int data)

{

Data = data;

Left = null;

Right = null;

}

}

**Creating a BST**

Insert values:

50, 30, 70, 20, 40

**Step 1**

Insert 50:

50

**Step 2**

Insert 30:

30 is smaller than 50, go left.

50

/

30

**Step 3**

Insert 70:

70 is greater than 50, go right.

50

/ \\

30 70

**Step 4**

Insert 20:

20 \< 50 → left

20 \< 30 → left

50

/ \\

30 70

/

20

**Step 5**

Insert 40:

40 \< 50 → left

40 \> 30 → right

50

/ \\

30 70

/ \\

20 40

**BST Operations**

**1. Search**

Searching is the biggest advantage of BST.

Example:

Find 40:

50

/

30

\\

40

Steps:

**Compare with root**

40 \< 50

Go left.

**Compare with 30**

40 \> 30

Go right.

**Found**

40

**Search Algorithm**

bool Search(Node root, int value)

{

if(root == null)

return false;

if(root.Data == value)

return true;

if(value \< root.Data)

return Search(root.Left, value);

return Search(root.Right, value);

}

**2. Insert**

Insertion follows the same search path.

Example:

Insert:

65

BST:

50

/ \\

30 70

/

60

65:

65 \> 50 → right

65 \< 70 → left

65 \> 60 → right

Result:

50

/ \\

30 70

/

60

\\

65

**3. Delete**

Deletion is the most complex BST operation.

There are three cases.

**Case 1: Delete Leaf Node**

Leaf node has no children.

Example:

Delete 20.

Before:

50

/

30

/

20

After:

50

/

30

Simply remove it.

**Case 2: Delete Node With One Child**

Example:

Delete 30:

Before:

50

/

30

\\

40

Replace 30 with its child:

50

/

40

**Case 3: Delete Node With Two Children**

Example:

Delete 50:

50

/ \\

30 70

/

60

Replace 50 with:

- Inorder successor (smallest value in right subtree)

- OR Inorder predecessor (largest value in left subtree)

Inorder successor:

60

After deletion:

60

/ \\

30 70

**BST Traversals**

BST supports all tree traversals.

**1. Inorder Traversal**

Order:

Left → Root → Right

Example:

50

/ \\

30 70

Output:

30 50 70

Important:

Inorder traversal of BST always gives sorted order.

**2. Preorder Traversal**

Order:

Root → Left → Right

Output:

50 30 70

Used for copying trees.

**3. Postorder Traversal**

Order:

Left → Right → Root

Output:

30 70 50

**BST Time Complexity**

For a balanced BST:

| **Operation** | **Complexity** |
|---------------|----------------|
| Search        | O(log n)       |
| Insert        | O(log n)       |
| Delete        | O(log n)       |

Why?

Because each comparison eliminates half of the tree.

**Worst Case BST**

A BST can become unbalanced.

Example insertion:

10,20,30,40,50

Creates:

10

\\

20

\\

30

\\

40

\\

50

Height becomes large.

Operations:

Search = O(n)

Insert = O(n)

Delete = O(n)

This is why we have:

- AVL Tree

- Red-Black Tree

**BST vs Binary Tree**

| **Feature** | **Binary Tree**   | **BST**               |
|-------------|-------------------|-----------------------|
| Children    | Maximum 2         | Maximum 2             |
| Ordering    | No rule           | Left \< Root \< Right |
| Searching   | O(n)              | O(log n) average      |
| Inorder     | Random order      | Sorted order          |
| Usage       | General hierarchy | Fast searching        |

**BST vs AVL Tree**

| **Feature** | **BST**         | **AVL**              |
|-------------|-----------------|----------------------|
| Balance     | Not guaranteed  | Always balanced      |
| Search      | O(n) worst case | O(log n)             |
| Insert      | Simple          | Uses rotations       |
| Memory      | Less            | More (stores height) |
| Complexity  | Easier          | More complex         |

**Real-World Applications**

**1. Database Indexes**

Used to quickly find records.

Example:

EmployeeId

\|

BST

\|

Employee Record

**2. Searching and Sorting**

BST can maintain sorted data dynamically.

Example:

Insert values:

50,20,70,10,30

Inorder:

10 20 30 50 70

**3. Symbol Tables**

Compilers store:

Variable Name → Information

**4. Auto-complete (with modifications)**

Can be used with string-based BST variants.

**Common Interview Questions**

1.  What is a Binary Search Tree?

2.  What is the difference between Binary Tree and BST?

3.  Why is searching faster in BST?

4.  Why does inorder traversal of BST give sorted values?

5.  Explain BST deletion cases.

6.  What happens when BST becomes skewed?

7.  Difference between BST and AVL Tree?

8.  How do you find minimum and maximum value in BST?

9.  How do you find lowest common ancestor in BST?

10. How do you validate whether a binary tree is a BST?

**Summary**

| **Feature**  | **BST**                      |
|--------------|------------------------------|
| Type         | Binary Tree                  |
| Rule         | Left \< Root \< Right        |
| Search       | O(log n) average             |
| Insert       | O(log n) average             |
| Delete       | O(log n) average             |
| Traversal    | Inorder, Preorder, Postorder |
| Best Feature | Fast searching               |
| Problem      | Can become unbalanced        |

**Key Takeaways**

- A **BST is an ordered binary tree**.

- Every node follows:

Left \< Node \< Right

- Searching, insertion, and deletion are efficient when the tree is balanced.

- **Inorder traversal of BST produces sorted data**.

- An unbalanced BST can degrade to **O(n)**, which is why self-balancing trees like **AVL and Red-Black Trees** are used.
