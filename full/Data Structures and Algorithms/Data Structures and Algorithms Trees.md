# Data Structures and Algorithms Trees
## Questions Covered

1. Tree: What is Tree in data structure?
2. Binary Trees: What is a binary tree, and how do you perform in-order, pre-order, and post-order traversals?
3. How do you find the height, check if a binary tree is balanced, or find the lowest common ancestor (LCA)?
4. Binary Search Trees (BST): How do binary search trees differ from binary trees?
5. How do you insert, delete nodes, or find the kth smallest element in a BST?
6. How do you convert a BST to a sorted doubly linked list?
7. Heaps: What is a heap, and how does it differ from a BST? How do you perform heap operations (insert, delete) and find the k largest/smallest elements in an array?
8. Balanced Trees: What are AVL and Red-Black trees, and how do you perform rotations and maintain balance?
9. B-Trees: What is a B-tree, and where is it commonly used?
## Tree: What is Tree in data structure?

<img src="extracted\Data Structures and Algorithms\media/media/image1.png" style="width:9in;height:4.46997in" />

A **tree** in data structures is a hierarchical, non-linear data structure consisting of nodes connected by edges. It is used to represent relationships between objects in a parent-child format. A tree starts with a root node and expands outwards, with each node potentially having child nodes.

### Basic Terminology

- **Node**: A single element in the tree, which contains data and references (links) to its child nodes.

- **Root**: The topmost node in the tree. It does not have a parent.

- **Edge**: A connection between two nodes. It represents the parent-child relationship.

- **Child**: A node directly connected to another node when moving away from the root.

- **Parent**: A node that has one or more children.

- **Leaf**: A node that has no children (i.e., the end node in a branch).

- **Subtree**: A tree consisting of a node and its descendants.

- **Depth**: The number of edges from the root node to a particular node.

- **Height**: The number of edges on the longest path from a node to a leaf.

- **Level**: The depth of a node, which is the distance from the root (the root is at level 0).

- **Siblings**: Nodes that share the same parent.

### Tree Properties

- **Acyclic**: Trees do not contain cycles (loops).

- **One Root**: There is always one unique root node.

- **Parent-Child Relationship**: Each node (except the root) has exactly one parent.

### Types of Trees

1.  **Binary Tree**:

    - A tree where each node has at most two children, referred to as the left and right child.

2.  **Binary Search Tree (BST)**:

    - A special type of binary tree where the left child of a node contains values less than the node, and the right child contains values greater than the node.

3.  **Balanced Tree**:

    - A tree where the difference in heights between the left and right subtrees of every node is at most one.

4.  **AVL Tree**:

    - A self-balancing binary search tree where the heights of subtrees differ by at most one.

5.  **Heap Tree**:

    - A complete binary tree that satisfies the heap property, either a max heap (parent is greater than or equal to children) or min heap (parent is less than or equal to children).

6.  **N-ary Tree**:

    - A tree where each node can have up to N children.

7.  **Trie (Prefix Tree)**:

    - A tree-like data structure used to store associative data structures, typically for handling strings.

### Tree Operations

- **Insertion**: Adding a new node to the tree.

- **Deletion**: Removing a node from the tree.

- **Traversal**: Visiting all nodes in the tree (e.g., in-order, pre-order, post-order, level-order).

- **Search**: Finding a specific node based on its value.

### Tree Traversals

- **In-order Traversal (DFS)**: Traverse the left subtree, visit the root, then traverse the right subtree (used in binary search trees to retrieve sorted elements).

- **Pre-order Traversal (DFS)**: Visit the root, traverse the left subtree, then traverse the right subtree.

- **Post-order Traversal (DFS)**: Traverse the left subtree, traverse the right subtree, then visit the root.

- **Level-order Traversal (BFS)**: Visit nodes level by level from top to bottom using a queue.

### Example: Binary Tree

// Basic structure for a node in a binary tree

```csharp
public class TreeNode
{
  public int Value;
  public TreeNode Left;
  public TreeNode Right;
  public TreeNode(int value)
  {
    Value = value;
    Left = null;
    Right = null;
  }
}
// Binary tree class with an example of pre-order traversal
public class BinaryTree
{
  public TreeNode Root;
  public BinaryTree()
  {
    Root = null;
  }
  // Pre-order traversal: Root -> Left -> Right
  public void PreOrderTraversal(TreeNode node)
  {
    if (node == null)
    return;
    Console.Write(node.Value + " "); // Visit the root
    PreOrderTraversal(node.Left); // Traverse the left subtree
    PreOrderTraversal(node.Right); // Traverse the right subtree
  }
}
public class Program
{
  public static void Main()
  {
    // Create a sample binary tree:
    // 1
    // / \\
    // 2 3
    // / \\
    // 4 5
    BinaryTree tree = new BinaryTree();
    tree.Root = new TreeNode(1);
    tree.Root.Left = new TreeNode(2);
    tree.Root.Right = new TreeNode(3);
    tree.Root.Left.Left = new TreeNode(4);
    tree.Root.Left.Right = new TreeNode(5);
    // Pre-order traversal: Output should be 1 2 4 5 3
    Console.WriteLine("Pre-order traversal:");
    tree.PreOrderTraversal(tree.Root);
  }
}
```

### Applications of Trees

- **File Systems**: Hierarchical representation of files and directories.

- **Databases**: B-trees and B+ trees are used for indexing and searching data.

- **Compilers**: Abstract syntax trees represent the syntax of programming languages.

- **Artificial Intelligence**: Decision trees are used for decision-making processes.

- **Networking**: Routing algorithms and hierarchical data are often modeled as trees.

### Advantages of Trees

- Hierarchical structure is well-suited for representing data with parent-child relationships.

- Efficient searching, inserting, and deleting operations in balanced trees (e.g., AVL tree, BST).

- Recursively defined, making certain operations easier to implement.

### Disadvantages of Trees

- Requires more memory compared to linear data structures like arrays or linked lists (because of node pointers).

- Tree operations can be inefficient in unbalanced trees (e.g., skewed binary trees).
## What are different types of tree in data structure?

A tree represents a hierarchical arrangement of nodes, forming a non-linear data structure. Each node in the tree holds a value and points to its child nodes, creating a branching structure akin to a natural tree. This hierarchical organization facilitates efficient storage and retrieval of data.
## Types of Trees in Data Structure According to the Number of Children

<img src="extracted\Data Structures and Algorithms\media/media/image2.png" style="width:6.29097in;height:3.58125in" />
## Binary Tree

A binary tree is a type of general tree, except, with a constraint - a node can have only two child nodes. The children nodes are known as the left child node and right child node.

<img src="extracted\Data Structures and Algorithms\media/media/image3.png" style="width:5.27917in;height:3.45347in" />

### Types of Binary Tree

On the basis of number of children binary tree has two types:

1.  **Full Binary Tree:** All the internal nodes of a full binary tree have two or no child nodes.

<img src="extracted\Data Structures and Algorithms\media/media/image4.png" style="width:4.84861in;height:4.15139in" />

2.  **Degenerate Binary Tree:** Every internal node of the degenerate binary has just one child.

<img src="extracted\Data Structures and Algorithms\media/media/image5.png" style="width:5.04653in;height:3.84861in" />

The binary tree can be divided into three types on the basis of completion levels:

1.  **Perfect Binary Tree:** All the leaf nodes of this tree are at the same level. Every internal node of a perfect binary tree has 2 child nodes.

<img src="extracted\Data Structures and Algorithms\media/media/image6.png" style="width:4.62778in;height:2.97708in" />

2.  **Complete Binary Tree:** Every level except the last one are full of nodes.

<img src="extracted\Data Structures and Algorithms\media/media/image7.png" style="width:4.31389in;height:3.34861in" />

3.  **Balanced Binary Tree:** The difference in height between the left and right subtrees of any node is either 0 or 1.

<img src="extracted\Data Structures and Algorithms\media/media/image8.png" style="width:5.20903in;height:2.95347in" />
## Ternary Tree

It is a type of tree data structure where each node can have a maximum of three child nodes., commonly referred to as "left", "mid", and "right".

<img src="extracted\Data Structures and Algorithms\media/media/image9.png" style="width:5.75556in;height:3.59306in" />

### Types of Ternary Tree

#### Ternary Search Tree(TST)

A Ternary Search Tree (TST) is a specialized trie data structure where the child nodes are arranged in the form of a binary search tree.A Ternary Search Tree (TST) node consists of exactly three pointers.

1.  The "left" pointer directs to the node with a value smaller than that of the current node.

2.  The "equal" pointer directs to the node containing the same value as the current node.

3.  The "right" pointer guides to the node with a value greater than that of the current node.
## N-ary Tree (Generic Tree)

An N-ary Tree, also called a Generic Tree, is a type of tree data structure. In an N-ary tree, each node holds data records and references to its children. It prohibits duplicate references among its children.

Key features of an N-ary tree:

1.  Each node can have multiple children.

2.  The exact number of children for each node is not predetermined and may vary.

<img src="extracted\Data Structures and Algorithms\media/media/image10.png" style="width:4.96528in;height:3.34861in" />
## Types of Trees in Data Structure According to the Nodes Values
## Binary Search Trees (BST): How do binary search trees differ from binary trees?

A [binary search tree](https://www.scaler.com/topics/data-structures/binary-search-tree/) shares similarities with a binary tree but has specific limitations.The value of the left child in a binary search tree is always smaller than that of the parent node, and the value of the right child is larger than that of the parent node in the binary search tree. This property makes the binary search tree optimal for search operations.

<img src="extracted\Data Structures and Algorithms\media/media/image11.png" style="width:4.47708in;height:3.39514in" />

### 2. AVL Tree

A self-balancing binary search tree is called an AVL tree. In an AVL tree, a balancing factor is given to every node in the tree which depends on whether the tree is balanced or not. These balancing factor values vary between -1, 0, and 1.

- If the right subtree is one level higher than the left subtree of a node, then the balancing factor value of that node is **-1**.

- If both, the left and right subtrees are at the same level, the balancing factor value is given as **0**.

- If the left subtree is one level higher than the right subtree then the balancing factor is **1**.

To learn more about the AVL tree, refer to the [scaler blog on AVL tree](https://www.scaler.com/topics/data-structures/avl-tree/).

<img src="extracted\Data Structures and Algorithms\media/media/image12.png" style="width:6in;height:4.23264in" />

### 3. Red-Black Tree

The red-black tree is also a self-balancing tree. Each node is either painted red or black. The rules of a red-black tree are:

- The leaf nodes and root nodes are black.

- If a parent node is red, both children nodes are black.

- There cannot be two adjacent red nodes.

- Every path from a node to the descendant NULL node (end of the path) must have an equal number of black nodes.

<img src="extracted\Data Structures and Algorithms\media/media/image13.png" style="width:4.96528in;height:3.34861in" />

To learn about the red-black tree in detail, refer to [this](https://www.scaler.com/topics/data-structures/red-black-tree/).
## B-Trees: What is a B-tree, and where is it commonly used?

A B-Tree is a self-balancing search tree that is specifically designed for disk storage systems. Here are the key properties of a B-Tree:

1.  **Uniform Leaf Level:** All leaves of a B-Tree are guaranteed to be at the same level, ensuring efficient retrieval operations regardless of the tree's size.

2.  **Minimum Degree 't':** The structure of a B-Tree is determined by its minimum degree 't', which is influenced by the disk block size.

3.  **Key Constraints:** Each non-root node must contain at least 't-1' keys, while the root may have a minimum of one key. Additionally, all nodes, including the root, can hold at most '(2*t – 1)' keys.

4.  **Child-Node Relationship:** The number of children of a node is equal to the number of keys it contains plus one.

5.  **Sorted Keys:** Keys within a node are always sorted in increasing order, facilitating efficient searching operations.

6.  **Leaf Node Insertion:** New key insertion in a B-Tree occurs exclusively at leaf nodes, maintaining the balanced structure of the tree.

### 5. B+ Tree

A B+ tree is an enhancement of the B-tree data structure, specifically optimized for indexing purposes. Unlike traditional B-trees, which store data pointers in both internal and leaf nodes, B+ trees only store data pointers at the leaf nodes. This design eliminates the need to traverse internal nodes for data retrieval, making B+ trees more efficient for disk-based storage systems.

Key characteristics of a B+ tree include:

1.  **Leaf Node Structure:** Leaf nodes in a B+ tree store all key values along with their corresponding data pointers to disk blocks.

2.  **Internal Node Structure:** Internal nodes of a B+ tree consist of tree pointers and key values. Each internal node follows a specific structure where keys are sorted in ascending order, facilitating efficient search operations.

3.  **Tree Pointer Arrangement:** Internal nodes have a maximum of 'a' tree pointers, where 'a' is the order of the B+ tree. The root node contains at least two tree pointers, while other internal nodes have at least ⌈a/2⌉ pointers.

4.  **Key-Pointer Relationship:** For each search field value 'X' in the subtree pointed to by a tree pointer Pi, the internal node ensures that the condition Ki-1 < X <= Ki holds for 1 < i < c, where 'c' is the number of pointers in the node.

<img src="extracted\Data Structures and Algorithms\media/media/image14.png" style="width:6.03472in;height:3.22083in" />

### 6. Segment Tree

A segment tree is a binary tree utilized for storing intervals or segments. Every node of the tree is used to represent an interval. A segment tree can be represented using a simple array. This tree allows us to answer range queries over an array.

Let's say we have an array A of size N that represents a segment tree T.

- The root node of the tree includes all elements of the array A[0 - 1].

- Every leaf node of the tree will represent only one element of the array A[i] such that 0 <= i < N

- The internal nodes of the tree will represent the union of elementary intervals A[i : j] where 0 <= i < j < N.

<img src="extracted\Data Structures and Algorithms\media/media/image15.png" style="width:6.20903in;height:4.3375in" />

Two operations can be done on a segment tree - update (update the value of a key) and query (given two indices, return the segment lying between the two indices).
## Conclusion

1.  Trees are hierarchical data structures consisting of nodes, each storing a value and references to child nodes.

2.  Binary trees restrict nodes to have at most two children, leading to variations like full, degenerate, perfect, complete, and balanced binary trees.

3.  Ternary trees extend this concept, allowing nodes to have up to three children, typically labeled as "left", "mid", and "right".

4.  N-ary trees, also known as generic trees, permit nodes to have multiple children, with the exact number varying per node.

5.  Binary Search Trees, AVL Trees, and Red-Black Trees are variants optimized for efficient searching, insertion, and deletion operations.

6.  B-Trees and B+ Trees are designed for disk storage systems, ensuring uniform leaf levels and efficient indexing for large datasets. Additionally, segment trees offer a specialized structure for interval-based queries in arrays.
## Binary Trees: What is a binary tree, and how do you perform in-order, pre-order, and post-order traversals?

A **binary tree** is a tree data structure in which each node has at most two children, referred to as the **left child** and the **right child**. Binary trees are widely used in algorithms and data structures for various applications like searching, sorting, and hierarchical storage.

### **Structure of a Binary Tree**

Each node in a binary tree has:

- **Data**: The value of the node.

- **Left Child**: The left child node (can be null if no left child).

- **Right Child**: The right child node (can be null if no right child).

### **Types of Binary Trees**

- **Full Binary Tree**: Every node has 0 or 2 children.

- **Perfect Binary Tree**: All internal nodes have two children, and all leaves are at the same level.

- **Complete Binary Tree**: All levels are completely filled except possibly for the last, which is filled from left to right.

- **Balanced Binary Tree**: A tree where the height of the two subtrees of every node differs by at most 1.

### **Binary Tree Traversals**

Traversal refers to visiting all the nodes in a tree in a specific order. There are three common types of depth-first traversal:

1.  **In-order Traversal**: Left -> Root -> Right

2.  **Pre-order Traversal**: Root -> Left -> Right

3.  **Post-order Traversal**: Left -> Right -> Root

Let's see how each of these traversals works with C# examples.

### **1. In-order Traversal (Left, Root, Right)**

In in-order traversal, we first traverse the left subtree, visit the root node, and then traverse the right subtree.

#### Example:

```csharp
public void InOrderTraversal(TreeNode node)
{
  if (node == null)
  return;
  InOrderTraversal(node.Left); // Traverse left subtree
  Console.Write(node.Value + " "); // Visit root
  InOrderTraversal(node.Right); // Traverse right subtree
}
```

#### Example of In-order Traversal:

Given this tree:

1

/ \\

2 3

/ \\

4 5

The in-order traversal will print: 4 2 5 1 3.

### **2. Pre-order Traversal (Root, Left, Right)**

In pre-order traversal, we first visit the root node, then traverse the left subtree, and finally, the right subtree.

#### Example:

```csharp
public void PreOrderTraversal(TreeNode node)
{
  if (node == null)
  return;
  Console.Write(node.Value + " "); // Visit root
  PreOrderTraversal(node.Left); // Traverse left subtree
  PreOrderTraversal(node.Right); // Traverse right subtree
}
```

#### Example of Pre-order Traversal:

Given the same tree:

1

/ \\

2 3

/ \\

4 5

The pre-order traversal will print: 1 2 4 5 3.

### **3. Post-order Traversal (Left, Right, Root)**

In post-order traversal, we first traverse the left subtree, then the right subtree, and finally visit the root node.

#### Example:

```csharp
public void PostOrderTraversal(TreeNode node)
{
  if (node == null)
  return;
  PostOrderTraversal(node.Left); // Traverse left subtree
  PostOrderTraversal(node.Right); // Traverse right subtree
  Console.Write(node.Value + " "); // Visit root
}
```

#### Example of Post-order Traversal:

Given the same tree:

1

/ \\

2 3

/ \\

4 5

The post-order traversal will print: 4 5 2 3 1.

### **Full Code Example**

Here’s a complete example showing all three traversals in C#:

```csharp
using System;
public class TreeNode
{
  public int Value;
  public TreeNode Left;
  public TreeNode Right;
  public TreeNode(int value)
  {
    Value = value;
    Left = null;
    Right = null;
  }
}
public class BinaryTree
{
  public TreeNode Root;
  public BinaryTree()
  {
    Root = null;
  }
  // In-order traversal (Left, Root, Right)
  public void InOrderTraversal(TreeNode node)
  {
    if (node == null)
    return;
    InOrderTraversal(node.Left);
    Console.Write(node.Value + " ");
    InOrderTraversal(node.Right);
  }
  // Pre-order traversal (Root, Left, Right)
  public void PreOrderTraversal(TreeNode node)
  {
    if (node == null)
    return;
    Console.Write(node.Value + " ");
    PreOrderTraversal(node.Left);
    PreOrderTraversal(node.Right);
  }
  // Post-order traversal (Left, Right, Root)
  public void PostOrderTraversal(TreeNode node)
  {
    if (node == null)
    return;
    PostOrderTraversal(node.Left);
    PostOrderTraversal(node.Right);
    Console.Write(node.Value + " ");
  }
}
public class Program
{
  public static void Main()
  {
    // Create a sample binary tree:
    // 1
    // / \\
    // 2 3
    // / \\
    // 4 5
    BinaryTree tree = new BinaryTree();
    tree.Root = new TreeNode(1);
    tree.Root.Left = new TreeNode(2);
    tree.Root.Right = new TreeNode(3);
    tree.Root.Left.Left = new TreeNode(4);
    tree.Root.Left.Right = new TreeNode(5);
    Console.WriteLine("In-order traversal:");
    tree.InOrderTraversal(tree.Root); // Output: 4 2 5 1 3
    Console.WriteLine("\nPre-order traversal:");
    tree.PreOrderTraversal(tree.Root); // Output: 1 2 4 5 3
    Console.WriteLine("\nPost-order traversal:");
    tree.PostOrderTraversal(tree.Root); // Output: 4 5 2 3 1
  }
}
```

### **Traversal Summary**

- **In-order Traversal**: Useful in Binary Search Trees (BST) to retrieve elements in sorted order.

- **Pre-order Traversal**: Useful to create a copy of the tree or to display the structure of the tree.

- **Post-order Traversal**: Useful for deleting a tree or evaluating postfix expressions.

### **Complexity**

- **Time Complexity** for all traversals: O(n), where **n** is the number of nodes in the tree. Each node is visited exactly once.

- **Space Complexity**: O(h), where **h** is the height of the tree. This is because recursion uses a call stack to store function calls, which depends on the height of the tree.
## How do you find the height, check if a binary tree is balanced, or find the lowest common ancestor (LCA)?

### 1. **Finding the Height of a Binary Tree**

The **height** of a binary tree is the number of edges in the longest path from the root node to a leaf. For an empty tree, the height is considered as -1, and for a tree with only one node (the root), the height is 0.

#### **C# Example to Find the Height:**

```csharp
public int FindHeight(TreeNode node)
{
  if (node == null)
  return -1; // Base case: return -1 for empty tree
  // Recursively find the height of left and right subtrees
  int leftHeight = FindHeight(node.Left);
  int rightHeight = FindHeight(node.Right);
  // The height of the tree is the maximum of the two heights plus 1
  return Math.Max(leftHeight, rightHeight) + 1;
}
```

#### **Explanation:**

- This function recursively calculates the height of the left and right subtrees and returns the greater of the two, adding 1 to account for the current node.

### 2. **Checking if a Binary Tree is Balanced**

A **balanced binary tree** is one where the height of the left and right subtrees of every node differ by at most one. An unbalanced tree can lead to inefficient operations.

To check if a binary tree is balanced, we can recursively calculate the height of the left and right subtrees and verify if the height difference is more than 1 at any node.

#### **C# Example to Check if a Tree is Balanced:**

public bool IsBalanced(TreeNode node)

```csharp
{
  return CheckHeight(node) != -1;
}
private int CheckHeight(TreeNode node)
{
  if (node == null)
  return 0; // Base case: height of an empty tree is 0
  // Recursively get the height of the left and right subtrees
  int leftHeight = CheckHeight(node.Left);
  if (leftHeight == -1) return -1; // If left subtree is unbalanced
  int rightHeight = CheckHeight(node.Right);
  if (rightHeight == -1) return -1; // If right subtree is unbalanced
  // If the difference in heights is greater than 1, return -1 to indicate unbalanced
  if (Math.Abs(leftHeight - rightHeight) > 1)
  return -1;
  // Return the height of the current subtree
  return Math.Max(leftHeight, rightHeight) + 1;
}
```

#### **Explanation:**

- This function checks the height of the left and right subtrees for every node.

- If any subtree is unbalanced (height difference greater than 1), the function returns -1 to indicate the tree is unbalanced.

### 3. **Finding the Lowest Common Ancestor (LCA)**

The **lowest common ancestor (LCA)** of two nodes in a binary tree is the lowest node that has both the given nodes as descendants (where we allow a node to be a descendant of itself).

#### **C# Example to Find LCA:**

public TreeNode FindLCA(TreeNode root, TreeNode p, TreeNode q)

```csharp
{
  if (root == null || root == p || root == q)
  return root; // Base case: return root if it's null, or if root matches p or q
  // Recur for left and right subtrees
  TreeNode left = FindLCA(root.Left, p, q);
  TreeNode right = FindLCA(root.Right, p, q);
  // If both left and right are not null, then root is the LCA
  if (left != null && right != null)
  return root;
  // Otherwise, return the non-null child (either left or right)
  return (left != null) ? left : right;
}
```

#### **Explanation:**

- This recursive function checks if the current node is null or matches one of the two target nodes (p or q).

- It searches both the left and right subtrees for the two nodes.

- If the current node is the lowest node that has both target nodes in different subtrees, it is the LCA.

- If one node is found in one subtree and the other is found in the other subtree, the current node is the LCA.

#### **Example:**

Given the following tree:

3

/ \\

5 1

/ \\ / \\

6 2 0 8

/ \\

7 4

For p = 5 and q = 1, the LCA is 3. For p = 5 and q = 4, the LCA is 5.

### **Summary of Operations**

1.  **Find Height**:

    - Recursively calculate the height of the left and right subtrees.

    - Time Complexity: O(n), where n is the number of nodes.

2.  **Check if Balanced**:

    - Use a recursive helper function to check the balance and calculate height simultaneously.

    - Time Complexity: O(n), where n is the number of nodes.

3.  **Find Lowest Common Ancestor (LCA)**:

    - Recursively search for the nodes in the tree and find their common ancestor.

    - Time Complexity: O(n), where n is the number of nodes.
## Binary Search Trees (BST): How do binary search trees differ from binary trees?

### **Binary Tree vs. Binary Search Tree (BST)**

A **binary tree** is a general tree data structure where each node can have up to two children. There are no specific constraints on the arrangement of the nodes. On the other hand, a **binary search tree (BST)** is a special kind of binary tree that has additional properties related to the arrangement of its nodes, particularly with respect to the values stored in the nodes.

Here’s a breakdown of the differences:

### **1. Binary Tree**

- **Definition**: A binary tree is a tree data structure in which each node can have at most two children (referred to as the left and right child).

- **Properties**:

  - No specific ordering of nodes.

  - The left and right child nodes of any node can have any value.

  - Useful for generic hierarchical storage, such as representing expressions, file directories, etc.

- **Traversal**: Can be traversed using in-order, pre-order, post-order, or level-order.

#### **Example of Binary Tree:**

10

/ \\

5 20

/ \\ /

2 6 15

In the above binary tree:

- There is no specific order of values for the left and right children.

### **2. Binary Search Tree (BST)**

- **Definition**: A binary search tree is a binary tree with the following additional property: for every node N:

  - The value of all nodes in the left subtree of N are **less than** the value of N.

  - The value of all nodes in the right subtree of N are **greater than** the value of N.

- **Properties**:

  - **Ordering**: A BST enforces a strict ordering where the left subtree holds smaller values, and the right subtree holds larger values.

  - This ordering allows for **efficient searching, insertion, and deletion** operations.

  - BSTs are widely used for maintaining dynamically sorted data.

- **Traversal**: An in-order traversal of a BST returns the elements in **sorted order**.

#### **Example of Binary Search Tree:**

10

/ \\

5 20

/ \\ /

2 7 15

In the above binary search tree:

- All nodes to the left of 10 (5, 2, 7) are less than 10.

- All nodes to the right of 10 (20, 15) are greater than 10.

### **Comparison Table**

| **Property** | **Binary Tree** | **Binary Search Tree (BST)** |
|----|----|----|
| **Definition** | A tree where each node has up to two children | A binary tree where the left child is smaller and the right child is larger than the root |
| **Node Ordering** | No specific ordering | Left child < Parent < Right child |
| **Searching Efficiency** | Linear time O(n) | Logarithmic time O(log n) in balanced BST |
| **In-order Traversal** | No particular order | Returns nodes in sorted order |
| **Applications** | Generic storage, expression trees, etc. | Dynamic sets, searching, sorted data maintenance |
| **Insert/Delete Complexity** | O(n) | O(log n) in balanced BST |

### **Key Operations in a Binary Search Tree (BST)**

1.  **Search Operation in BST**: Due to the ordering property of the BST, searching for a value is efficient. You can start at the root and decide whether to go left or right depending on whether the value is less or greater than the root.

```csharp
public TreeNode Search(TreeNode root, int key)
{
  if (root == null || root.Value == key)
  return root; // Base case: root is null or key is found
  // Recur down the tree
  if (key < root.Value)
  return Search(root.Left, key); // Search in left subtree
  else
  return Search(root.Right, key); // Search in right subtree
}
```

2.  **Insertion in BST**: Inserting a new value follows a similar approach. You compare the value to be inserted with the root and move left or right until you find a suitable empty position to insert the new node.

```csharp
public TreeNode Insert(TreeNode root, int key)
{
  if (root == null)
  return new TreeNode(key); // Insert new node if current root is null
  // Recur down the tree
  if (key < root.Value)
  root.Left = Insert(root.Left, key);
  else if (key > root.Value)
  root.Right = Insert(root.Right, key);
  return root;
}
```

3.  **Deletion in BST**: Deletion is more complex, as there are three possible cases:

    - The node to be deleted is a **leaf node**.

    - The node to be deleted has **one child**.

    - The node to be deleted has **two children** (requires finding the in-order predecessor or successor).

### **Applications of BST**

- **Searching**: BSTs allow for efficient searching with O(log n) complexity (in a balanced tree).

- **Dynamic Sets**: BSTs are used to maintain dynamic sets of data, where elements are inserted or deleted over time.

- **Ordered Data**: In-order traversal of BST provides a natural sorted order of the elements, which makes it easy to retrieve sorted data.

### **Advantages of BST**

- **Efficient Searching**: The structure allows for efficient searching in O(log n) time in the average case (balanced tree).

- **Sorted Data**: Elements are automatically maintained in sorted order.

- **Dynamic**: Elements can be inserted and deleted dynamically while maintaining the order.

### **Disadvantages of BST**

- **Unbalanced Tree**: If not balanced, a BST can degrade into a linear structure, causing operations to take O(n) time.

- **Additional Complexity**: Balancing a tree dynamically (e.g., AVL trees, Red-Black trees) can require additional operations and complexity.

In summary, a **binary search tree (BST)** differs from a regular **binary tree** in that it maintains a specific ordering property, allowing for more efficient search, insertion, and deletion operations.
## How do you insert, delete nodes, or find the kth smallest element in a BST?

### 1. **Inserting a Node in a Binary Search Tree (BST)**

Insertion in a BST follows the property of the tree: values smaller than the current node go to the left, and values greater go to the right. You traverse down the tree until you find the correct spot for the new value.

#### **C# Code to Insert a Node:**

```csharp
public class TreeNode
{
  public int Value;
  public TreeNode Left, Right;
  public TreeNode(int value)
  {
    Value = value;
    Left = Right = null;
  }
}
public TreeNode Insert(TreeNode root, int key)
{
  if (root == null)
  return new TreeNode(key); // Base case: insert at the correct leaf position
  if (key < root.Value)
  root.Left = Insert(root.Left, key); // Recur to left subtree
  else if (key > root.Value)
  root.Right = Insert(root.Right, key); // Recur to right subtree
  return root; // Return the unchanged root pointer
}
```

#### **Explanation**:

- Start at the root.

- If the key is smaller than the root, recur to the left subtree, otherwise to the right.

- Insert the node when an appropriate null spot is found.

### 2. **Deleting a Node in a Binary Search Tree (BST)**

There are three possible cases when deleting a node in a BST:

- **Case 1**: The node is a leaf (has no children).

- **Case 2**: The node has one child (left or right).

- **Case 3**: The node has two children. In this case, we replace the node with its in-order predecessor (largest in the left subtree) or its in-order successor (smallest in the right subtree).

#### **C# Code to Delete a Node:**

```csharp
public TreeNode DeleteNode(TreeNode root, int key)
{
  if (root == null) return root; // Base case: key not found
  if (key < root.Value)
  root.Left = DeleteNode(root.Left, key); // Recur to left subtree
  else if (key > root.Value)
  root.Right = DeleteNode(root.Right, key); // Recur to right subtree
  else
  {
    // Node with only one child or no child
    if (root.Left == null)
    return root.Right;
    else if (root.Right == null)
    return root.Left;
    // Node with two children: get the inorder successor (smallest in the right subtree)
    root.Value = MinValue(root.Right);
    // Delete the inorder successor
    root.Right = DeleteNode(root.Right, root.Value);
  }
  return root;
}
private int MinValue(TreeNode root)
{
  int minValue = root.Value;
  while (root.Left != null)
  {
    minValue = root.Left.Value;
    root = root.Left;
  }
  return minValue;
}
```

#### **Explanation**:

- **Case 1**: If the node to be deleted has no children, simply remove it.

- **Case 2**: If it has one child, replace it with its child.

- **Case 3**: If it has two children, find the in-order successor, replace the node’s value with the successor’s value, and delete the successor.

### 3. **Finding the kth Smallest Element in a BST**

The kth smallest element in a BST can be found by performing an **in-order traversal**, which visits nodes in sorted order.

#### **C# Code to Find the kth Smallest Element:**

```csharp
public int KthSmallest(TreeNode root, int k)
{
  int count = 0;
  return InOrderTraversal(root, ref count, k);
}
private int InOrderTraversal(TreeNode node, ref int count, int k)
{
  if (node == null)
  return -1; // Base case: tree is empty
  // Search in the left subtree
  int left = InOrderTraversal(node.Left, ref count, k);
  if (left != -1)
  return left; // If the kth smallest is found in the left subtree
  // Increment count of visited nodes
  count++;
  if (count == k)
  return node.Value; // If current node is the kth smallest
  // Otherwise, search in the right subtree
  return InOrderTraversal(node.Right, ref count, k);
}
```

#### **Explanation**:

- Perform an **in-order traversal** of the BST.

- Keep a counter count to track the number of visited nodes.

- When count equals k, return the current node's value.

### **Summary**

1.  **Insert a Node**:

    - Traverse the tree recursively until you find an empty position to insert the node.

    - Time Complexity: O(h), where h is the height of the tree.

2.  **Delete a Node**:

    - If the node has two children, find its in-order successor or predecessor.

    - Time Complexity: O(h), where h is the height of the tree.

3.  **Find the kth Smallest Element**:

    - Perform an in-order traversal and stop when you’ve visited k nodes.

    - Time Complexity: O(n) for a full traversal, where n is the number of nodes.
## How do you convert a BST to a sorted doubly linked list?

To convert a **Binary Search Tree (BST)** to a **sorted doubly linked list**, you need to perform an **in-order traversal** of the BST. During the traversal, you can re-link the nodes to form a doubly linked list, as the in-order traversal naturally processes the nodes in sorted order.

### **Steps to Convert BST to a Doubly Linked List:**

1.  Perform an **in-order traversal** of the BST, which visits nodes in ascending order.

2.  As you visit each node, modify the pointers (left/right) to form the doubly linked list.

3.  The left pointer of each node will point to its previous node in the list (i.e., predecessor), and the right pointer will point to its next node (i.e., successor).

### **C# Implementation**:

```csharp
public class TreeNode
{
  public int Value;
  public TreeNode Left, Right;
  public TreeNode(int value)
  {
    Value = value;
    Left = Right = null;
  }
}
public class BSTtoDoublyLinkedList
{
  private TreeNode prev = null; // To keep track of the previous node
  private TreeNode head = null; // To keep track of the head of the doubly linked list
  public TreeNode ConvertBSTtoDLL(TreeNode root)
  {
    if (root == null) return null;
    // Perform in-order traversal and modify the pointers
    InOrderTraversal(root);
    // Return the head of the doubly linked list
    return head;
  }
  private void InOrderTraversal(TreeNode node)
  {
    if (node == null) return;
    // Recursively traverse the left subtree
    InOrderTraversal(node.Left);
    // Process the current node
    if (prev == null)
    {
      // This is the leftmost (smallest) node, set it as head of DLL
      head = node;
    }
    else
    {
      // Modify pointers to form the doubly linked list
      prev.Right = node;
      node.Left = prev;
    }
    // Move prev to the current node
    prev = node;
    // Recursively traverse the right subtree
    InOrderTraversal(node.Right);
  }
}
```

### **Explanation**:

- **In-order Traversal**: We traverse the tree in-order (left-root-right), which ensures that nodes are processed in ascending order.

- **Node Processing**:

  - For each node:

    - The left pointer (node.Left) is updated to point to the previous node (prev).

    - The right pointer (prev.Right) of the previous node is updated to point to the current node.

- **Head Pointer**: The first (smallest) node encountered during the in-order traversal becomes the head of the doubly linked list.

### **Time Complexity**:

- The time complexity of this approach is **O(n)**, where n is the number of nodes in the BST, because we visit each node exactly once.

### **Example**:

#### **Input (BST)**:

10

/ \\

5 15

/ \\ /

3 7 12

#### **Output (Doubly Linked List)**:

rust

Copy code

3 <-> 5 <-> 7 <-> 10 <-> 12 <-> 15

Each node's left pointer points to the previous node, and the right pointer points to the next node in the sorted order. This doubly linked list is sorted in ascending order, as was the original BST.

This approach ensures that you efficiently convert a BST into a sorted doubly linked list without using extra space beyond the tree itself (i.e., no additional data structures are required).
## Heaps: What is a heap, and how does it differ from a BST? How do you perform heap operations (insert, delete) and find the k largest/smallest elements in an array?

### 1. **What is a Heap?**

A **heap** is a **binary tree** that satisfies the **heap property**:

- **Max Heap**: Every parent node is greater than or equal to its child nodes.

- **Min Heap**: Every parent node is less than or equal to its child nodes.

A heap is commonly implemented as a binary heap, which is a complete binary tree. This means all levels of the tree are fully filled except for the last level, which is filled from left to right.

### **Difference between a Heap and a Binary Search Tree (BST):**

| **Aspect** | **Heap** | **Binary Search Tree (BST)** |
|----|----|----|
| **Heap Property** | Max Heap: Parent ≥ Child; Min Heap: Parent ≤ Child | Left subtree ≤ Root ≤ Right subtree |
| **Order** | No specific order between siblings | In-order traversal gives elements in sorted order |
| **Shape** | Complete binary tree (all levels filled except possibly the last) | No shape constraint; can be skewed (unbalanced) |
| **Use Case** | Fast access to the maximum/minimum element | Efficient lookups, insertions, deletions in sorted order |
| **Time Complexity** | Insertion/Deletion: O(log n); Find Max/Min: O(1) | Insertion/Deletion/Search: O(h), where h is the height of the tree |

### 2. **Heap Operations**

#### **Insert Operation in a Heap**

When inserting a new element into a heap:

1.  Insert the element at the next available position in the last level (to maintain the complete tree property).

2.  Perform an operation called **"heapify"** (or **"bubble up"**) to maintain the heap property:

    - For a **max heap**, bubble the new element up as long as it’s greater than its parent.

    - For a **min heap**, bubble the new element up as long as it’s smaller than its parent.

##### C# Code to Insert in a Max Heap:

```csharp
public class MaxHeap
{
  private List<int> heap = new List<int>();
  public void Insert(int value)
  {
    heap.Add(value); // Add the value at the end of the heap
    int index = heap.Count - 1; // Get index of newly added value
    HeapifyUp(index); // Restore heap property
  }
  private void HeapifyUp(int index)
  {
    while (index > 0)
    {
      int parentIndex = (index - 1) / 2;
      if (heap[index] <= heap[parentIndex]) break; // If heap property holds, stop
      Swap(index, parentIndex); // Swap with parent
      index = parentIndex; // Move up to the parent index
    }
  }
  private void Swap(int i, int j)
  {
    int temp = heap[i];
    heap[i] = heap[j];
    heap[j] = temp;
  }
}
```

#### **Delete Operation in a Heap (Max Heap)**

Deleting the root element (maximum in a max heap):

1.  Replace the root with the last element in the heap (to maintain the complete tree property).

2.  Perform an operation called **"heapify down"** to restore the heap property:

    - For a **max heap**, bubble the new root down if it’s smaller than any of its children.

    - For a **min heap**, bubble the new root down if it’s larger than any of its children.

##### C# Code to Delete from a Max Heap:

```csharp
public class MaxHeap
{
  private List<int> heap = new List<int>();
  public int DeleteMax()
  {
    if (heap.Count == 0) throw new InvalidOperationException("Heap is empty.");
    int maxValue = heap[0]; // The root is the maximum value
    heap[0] = heap[heap.Count - 1]; // Replace root with last element
    heap.RemoveAt(heap.Count - 1); // Remove the last element
    HeapifyDown(0); // Restore heap property
    return maxValue;
  }
  private void HeapifyDown(int index)
  {
    int lastIndex = heap.Count - 1;
    while (index < lastIndex)
    {
      int leftChildIndex = 2 * index + 1;
      int rightChildIndex = 2 * index + 2;
      int largest = index;
      // Find the largest of the parent and children
      if (leftChildIndex <= lastIndex && heap[leftChildIndex] > heap[largest])
      largest = leftChildIndex;
      if (rightChildIndex <= lastIndex && heap[rightChildIndex] > heap[largest])
      largest = rightChildIndex;
      if (largest == index) break; // Heap property holds
      Swap(index, largest);
      index = largest; // Move to the largest child
    }
  }
  private void Swap(int i, int j)
  {
    int temp = heap[i];
    heap[i] = heap[j];
    heap[j] = temp;
  }
}
```

### 3. **Finding the k Largest/Smallest Elements in an Array**

#### **Finding the k Largest Elements Using a Min Heap**

1.  Build a **min heap** of size k from the first k elements of the array.

2.  For each remaining element in the array, if the element is larger than the root of the heap, replace the root with the element and heapify.

3.  At the end, the heap will contain the k largest elements.

##### C# Code for Finding k Largest Elements:

```csharp
public List<int> FindKLargest(int[] array, int k)
{
  PriorityQueue<int, int> minHeap = new PriorityQueue<int, int>();
  // Build a min heap with the first k elements
  for (int i = 0; i < k; i++)
  {
    minHeap.Enqueue(array[i], array[i]); // Value and priority are the same
  }
  // Process the remaining elements
  for (int i = k; i < array.Length; i++)
  {
    if (array[i] > minHeap.Peek())
    {
      minHeap.Dequeue(); // Remove the smallest element
      minHeap.Enqueue(array[i], array[i]); // Insert the new element
    }
  }
  // The min heap now contains the k largest elements
  return new List<int>(minHeap.UnorderedItems.Select(item => item.Element));
}
```

#### **Finding the k Smallest Elements Using a Max Heap**

1.  Build a **max heap** of size k from the first k elements of the array.

2.  For each remaining element, if the element is smaller than the root of the heap, replace the root and heapify.

3.  The heap will contain the k smallest elements.

### **Summary of Heap Operations:**

| **Operation**        | **Time Complexity** |
|----------------------|---------------------|
| **Insert**           | O(log n)            |
| **Delete (Max/Min)** | O(log n)            |
| **Find Max/Min**     | O(1)                |
| **Build a Heap**     | O(n)                |

- **Insert** and **Delete** operations take O(log n) because of the height of the heap being log-based.

- Finding the maximum or minimum element in a heap is O(1) since it's always at the root.

### **Heap Applications**:

- **Heap Sort**: Sorting an array in O(n log n) using a heap.

- **Priority Queue**: A common implementation of priority queues uses heaps to efficiently support operations like insert, delete, and find maximum/minimum.

- **Finding k largest/smallest elements**: Efficiently finding k largest/smallest elements from a large dataset using heaps.
## Balanced Trees: What are AVL and Red-Black trees, and how do you perform rotations and maintain balance?

### **Balanced Trees**

Balanced trees are self-balancing binary search trees (BSTs) that automatically adjust their structure to ensure that their height remains logarithmic in terms of the number of nodes, thus improving search, insertion, and deletion operations. Two commonly used balanced trees are **AVL Trees** and **Red-Black Trees**.

### **AVL Trees**

### <img src="extracted\Data Structures and Algorithms\media/media/image16.png" style="width:6.79097in;height:4.09306in" />

An **AVL tree** is a self-balancing binary search tree where the **height difference** (or balance factor) between the left and right subtrees of any node is at most **1**. If this balance factor becomes more than 1, rotations are used to restore balance.

#### **Balance Factor**:

- **Balance factor** of a node = Height of left subtree - Height of right subtree.

- The AVL tree is balanced if the balance factor of each node is either -1, 0, or 1.

#### **Rotations in AVL Trees**:

When the balance factor of a node becomes **unbalanced**, rotations are used to restore balance. There are four types of rotations:

1.  **Left Rotation (LL Rotation)**:

    - Performed when a node becomes unbalanced due to an insertion in the right subtree of its right child (Right-Right case).

**Steps**:

- Make the right child the new root.

- The old root becomes the left child of the new root.

- Reassign the left subtree of the new root to the right of the old root.

2.  **Right Rotation (RR Rotation)**:

    - Performed when a node becomes unbalanced due to an insertion in the left subtree of its left child (Left-Left case).

**Steps**:

- Make the left child the new root.

- The old root becomes the right child of the new root.

- Reassign the right subtree of the new root to the left of the old root.

3.  **Left-Right Rotation (LR Rotation)**:

    - Performed when a node becomes unbalanced due to an insertion in the right subtree of its left child (Left-Right case).

**Steps**:

- First, perform a **left rotation** on the left child (Left-Right turns into Left-Left).

- Then perform a **right rotation** on the root.

4.  **Right-Left Rotation (RL Rotation)**:

    - Performed when a node becomes unbalanced due to an insertion in the left subtree of its right child (Right-Left case).

**Steps**:

- First, perform a **right rotation** on the right child (Right-Left turns into Right-Right).

- Then perform a **left rotation** on the root.

#### **C# Code Example for AVL Rotations**:

```csharp
public class AVLTreeNode
{
  public int Value;
  public AVLTreeNode Left, Right;
  public int Height;
  public AVLTreeNode(int value)
  {
    Value = value;
    Height = 1;
  }
}
public class AVLTree
{
  public AVLTreeNode Insert(AVLTreeNode node, int value)
  {
    // Perform normal BST insert
    if (node == null)
    return new AVLTreeNode(value);
    if (value < node.Value)
    node.Left = Insert(node.Left, value);
    else if (value > node.Value)
    node.Right = Insert(node.Right, value);
    else
    return node; // Duplicate keys not allowed
    // Update height of this ancestor node
    node.Height = 1 + Math.Max(GetHeight(node.Left), GetHeight(node.Right));
    // Get the balance factor
    int balance = GetBalance(node);
    // If the node becomes unbalanced, 4 cases
    // Left Left Case
    if (balance > 1 && value < node.Left.Value)
    return RightRotate(node);
    // Right Right Case
    if (balance < -1 && value > node.Right.Value)
    return LeftRotate(node);
    // Left Right Case
    if (balance > 1 && value > node.Left.Value)
    {
      node.Left = LeftRotate(node.Left);
      return RightRotate(node);
    }
    // Right Left Case
    if (balance < -1 && value < node.Right.Value)
    {
      node.Right = RightRotate(node.Right);
      return LeftRotate(node);
    }
    return node;
  }
  private int GetHeight(AVLTreeNode node)
  {
    return node == null ? 0 : node.Height;
  }
  private int GetBalance(AVLTreeNode node)
  {
    return node == null ? 0 : GetHeight(node.Left) - GetHeight(node.Right);
  }
  private AVLTreeNode RightRotate(AVLTreeNode y)
  {
    AVLTreeNode x = y.Left;
    AVLTreeNode T2 = x.Right;
    // Perform rotation
    x.Right = y;
    y.Left = T2;
    // Update heights
    y.Height = Math.Max(GetHeight(y.Left), GetHeight(y.Right)) + 1;
    x.Height = Math.Max(GetHeight(x.Left), GetHeight(x.Right)) + 1;
    // Return new root
    return x;
  }
  private AVLTreeNode LeftRotate(AVLTreeNode x)
  {
    AVLTreeNode y = x.Right;
    AVLTreeNode T2 = y.Left;
    // Perform rotation
    y.Left = x;
    x.Right = T2;
    // Update heights
    x.Height = Math.Max(GetHeight(x.Left), GetHeight(x.Right)) + 1;
    y.Height = Math.Max(GetHeight(y.Left), GetHeight(y.Right)) + 1;
    // Return new root
    return y;
  }
}
```

### **2. Red-Black Trees**

A **Red-Black Tree** is a self-balancing binary search tree where each node has an extra attribute called **color**, which can either be **red** or **black**. The tree is balanced by ensuring that it adheres to certain properties, maintaining a relatively balanced structure.

#### **Properties of Red-Black Tree**:

1.  Every node is either red or black.

2.  The root node is always black.

3.  Red nodes cannot have red children (no two consecutive red nodes).

4.  Every path from the root to a null node (leaf) has the same number of black nodes.

5.  Newly inserted nodes are always red.

#### **Rotations in Red-Black Trees**:

Rotations in Red-Black trees are similar to AVL trees, and there are **left rotations** and **right rotations** that help in restoring the tree's balance during insertion or deletion operations.

- **Left Rotation**: Similar to the left rotation in AVL trees.

- **Right Rotation**: Similar to the right rotation in AVL trees.

#### **Insertion and Rebalancing**:

When a new node is inserted, it is always colored **red**. After insertion, rebalancing is performed to maintain Red-Black Tree properties:

1.  If the parent is black, no violation occurs, and no rebalancing is needed.

2.  If the parent is red, a violation occurs, and rebalancing with rotations and color changes is needed to fix the violation.

### **Difference Between AVL and Red-Black Trees**:

| **Property** | **AVL Tree** | **Red-Black Tree** |
|----|----|----|
| **Balance** | Strictly balanced (balance factor is -1, 0, 1) | Less strictly balanced |
| **Rotations** | More rotations due to strict balance | Fewer rotations due to looser balancing |
| **Height** | Logarithmic but slightly shorter than RBT | Logarithmic, but taller than AVL tree |
| **Use Cases** | Good for read-heavy applications | Good for write-heavy applications |

### **Finding the k Largest/Smallest Elements in a Balanced Tree**:

- **In-order traversal** of an AVL or Red-Black Tree can be used to retrieve elements in sorted order. To find the k largest or smallest elements, simply perform an in-order traversal and collect the first or last k elements respectively.

### **Key Summary**:

- **AVL Trees** maintain a stricter balance by tracking the height difference, resulting in better search performance but potentially more frequent rotations.

- **Red-Black Trees** are less strictly balanced, making them more efficient for insertion and deletion-heavy use cases at the cost of potentially higher search times than AVL trees.

- Both trees guarantee O(log n) time complexity for insertion, deletion, and search operations.
## B-Trees: What is a B-tree, and where is it commonly used?

### **B-Trees: Overview**

A **B-tree** is a self-balancing tree data structure that maintains sorted data and allows searches, sequential access, insertions, and deletions in logarithmic time. It is widely used in database systems and file systems because it efficiently handles large blocks of data and minimizes the number of disk accesses required during operations.

### **Key Properties of B-Trees:**

1.  **Balanced Tree:**

    - Like AVL and Red-Black trees, B-trees maintain balance. However, B-trees can have multiple keys and child nodes in each node, leading to a broader tree with fewer levels.

2.  **Nodes Can Have Multiple Keys:**

    - Unlike binary trees, where nodes have only one key, each node in a B-tree can store **multiple keys**. A B-tree of order m can have at most m-1 keys and m children.

3.  **Child Nodes:**

    - The number of child nodes for each node is determined by the number of keys in that node. A B-tree node with n keys will have n + 1 child nodes.

4.  **Height:**

    - B-trees are **shallow**, meaning that the height of the tree remains relatively low even with large amounts of data, which is crucial for minimizing disk I/O operations.

5.  **Balanced Nodes:**

    - Every leaf node appears at the same level, ensuring that the tree remains balanced after every insertion or deletion.

6.  **Efficient Disk Access:**

    - B-trees are designed to work well with **block-oriented storage systems** (like disks). By storing multiple keys in a single node, they reduce the number of disk accesses required during search, insert, or delete operations.

### **Structure of a B-Tree:**

- Each node can have **multiple keys** and **multiple child nodes**.

- For a B-tree of **order m**, each node can have:

  - At most m-1 keys.

  - At most m children.

  - At least ⌈m/2⌉ - 1 keys, except for the root node, which may have fewer.

#### Example: B-Tree of Order 3

- Each node can have up to **2 keys** and **3 children**.

- The keys in a node are **sorted**, and the child pointers are structured such that:

  - All values in the left child are less than the first key.

  - All values between the first and second key are in the middle child.

  - All values greater than the second key are in the right child.

### **Operations in B-Trees:**

1.  **Search:**

    - B-tree search is similar to binary search within a node.

    - Each node is searched for the desired key, and if not found, the appropriate child is followed recursively.

    - Since nodes can contain multiple keys, fewer levels of recursion are required than in binary trees.

2.  **Insertion:**

    - New keys are inserted into a leaf node.

    - If a node overflows (i.e., it exceeds the maximum number of keys), it is split, and the middle key is promoted to the parent node.

    - This process may repeat recursively, and the root node may also be split, increasing the tree's height by 1.

3.  **Deletion:**

    - When a key is deleted, if it is in an internal node, it is replaced by its predecessor or successor key.

    - If a node underflows (i.e., it has fewer than the minimum number of keys), it may borrow a key from a neighboring node or merge with a sibling node, possibly causing changes to propagate upwards in the tree.

### **B-Tree Operations Time Complexity:**

- **Search:** O(log n)

- **Insert:** O(log n)

- **Delete:** O(log n)

### **Where B-Trees Are Commonly Used:**

1.  **Databases:**

    - B-trees are the standard data structure used for database indexing.

    - **B+-trees** (a variant of B-trees) are particularly common because they store all data in the leaf nodes, making sequential access faster.

2.  **File Systems:**

    - Many file systems, such as **NTFS** (New Technology File System) and **HFS+** (Hierarchical File System), use B-trees to organize file and directory metadata.

3.  **Disk-Based Storage:**

    - B-trees are optimized for storage devices like hard disks or SSDs, where data retrieval time is measured in terms of disk I/O operations rather than memory access time.

4.  **Search Engines:**

    - B-trees are also used in search engines to store and quickly retrieve large amounts of index data.

### **Advantages of B-Trees:**

- **Efficient Disk Access:** B-trees minimize disk access because they reduce the height of the tree and store multiple keys in each node.

- **Balanced Structure:** Automatically keeps itself balanced, ensuring logarithmic time complexity for insertion, deletion, and search operations.

- **Supports Sequential Access:** In B-trees, keys are stored in sorted order, allowing efficient range queries.

### **Disadvantages of B-Trees:**

- **Complicated Implementation:** More complex to implement compared to simpler data structures like binary trees or hash tables.

- **Slower in Memory:** For in-memory data, B-trees can be slower than simpler data structures like binary search trees or hash tables due to the overhead of maintaining multiple keys and balancing.

### **Key Summary:**

- A **B-tree** is a balanced tree data structure that stores sorted data and supports efficient search, insertion, and deletion operations.

- B-trees are particularly suited for systems that rely on **disk storage** or **large datasets** because they minimize the number of disk reads/writes during operations.

- They are widely used in **database indexing**, **file systems**, and **storage systems** where efficient access to large amounts of data is critical.
