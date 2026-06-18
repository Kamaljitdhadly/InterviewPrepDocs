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

A **tree** is a hierarchical, acyclic structure of nodes and edges in parent-child form, rooted at one node.

### Basic Terminology

- **Node**: Data + child references.

- **Root**: Top node; no parent.

- **Edge**: Parent-child link.

- **Child**: Node below parent.

- **Parent**: Has children.

- **Leaf**: No children.

- **Subtree**: Node + descendants.

- **Depth**: Edges from root.

- **Height**: Longest path to leaf.

- **Level**: Depth from root (0 at root).

- **Siblings**: Same parent.

### Tree Properties

- **Acyclic**, **one root**, each non-root has exactly one parent.

### Types of Trees

| Type | Key trait |
|------|----------|
| **Binary** | ≤2 children |
| **BST** | left < node < right |
| **Balanced/AVL** | height diff ≤ 1 |
| **Heap** | complete + heap property |
| **N-ary** | ≤N children |
| **Trie** | prefix strings |

### Operations & Traversals

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

### Applications / Trade-offs

- **Uses**: file systems, DB indexes, ASTs, decision trees, routing.
- **Pros**: hierarchy, efficient balanced ops, recursion-friendly.
- **Cons**: pointer overhead; skew hurts performance.

### What are different types of tree in data structure?

Trees branch by child count and node ordering.

### Types of Trees in Data Structure According to the Number of Children

<img src="extracted\Data Structures and Algorithms\media/media/image2.png" style="width:6.29097in;height:3.58125in" />

### Binary Tree

**Binary tree**: ≤2 children (left/right).

<img src="extracted\Data Structures and Algorithms\media/media/image3.png" style="width:5.27917in;height:3.45347in" />

### Types of Binary Tree

**By children**: full (0/2 internal), degenerate (1 child). **By shape**: perfect, complete, balanced (|hL−hR|≤1).

<img src="extracted\Data Structures and Algorithms\media/media/image8.png" style="width:5.20903in;height:2.95347in" />

### Ternary Tree

**Ternary tree**: ≤3 children (left/mid/right).

<img src="extracted\Data Structures and Algorithms\media/media/image9.png" style="width:5.75556in;height:3.59306in" />

### Types of Ternary Tree

#### Ternary Search Tree(TST)

**TST**: trie-like; left/equal/right pointers by char comparison.

2.  The "equal" pointer directs to the node containing the same value as the current node.

3.  The "right" pointer guides to the node with a value greater than that of the current node.

### N-ary Tree (Generic Tree)

**N-ary/generic**: variable child count; no duplicate child refs.

<img src="extracted\Data Structures and Algorithms\media/media/image10.png" style="width:4.96528in;height:3.34861in" />

### Types of Trees in Data Structure According to the Nodes Values

### Conclusion

Trees vary by child count (binary/ternary/N-ary) and ordering (BST, balanced, B-tree, segment tree).

## Binary Trees: What is a binary tree, and how do you perform in-order, pre-order, and post-order traversals?

**Binary tree**: ≤2 children (left/right).

### **Structure of a Binary Tree**

### Types

- **Full Binary Tree**: Every node has 0 or 2 children.

- **Perfect Binary Tree**: All internal nodes have two children, and all leaves are at the same level.

- **Complete Binary Tree**: All levels are completely filled except possibly for the last, which is filled from left to right.

- **Balanced Binary Tree**: A tree where the height of the two subtrees of every node differs by at most 1.

### **Binary Tree Traversals**

**DFS traversals**:

1.  **In-order Traversal**: Left -> Root -> Right

2.  **Pre-order Traversal**: Root -> Left -> Right

3.  **Post-order Traversal**: Left -> Right -> Root

Let's see how each of these traversals works with C# examples.

### **1. In-order Traversal (Left, Root, Right)**

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

Tree `1/2,3/4,5` → in-order: **4 2 5 1 3**.

### **2. Pre-order Traversal (Root, Left, Right)**

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

→ pre-order: **1 2 4 5 3**.

### **3. Post-order Traversal (Left, Right, Root)**

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

→ post-order: **4 5 2 3 1**.

### **Full Code Example**

**Full example:**

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

- **Time** O(n); **space** O(h) recursion stack. This is because recursion uses a call stack to store function calls, which depends on the height of the tree.

## How do you find the height, check if a binary tree is balanced, or find the lowest common ancestor (LCA)?

### 1. **Finding the Height of a Binary Tree**

**Height**: longest root-to-leaf edges (empty −1, single node 0).

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

### 2. **Checking if a Binary Tree is Balanced**

**Balanced**: |h(left)−h(right)|≤1 at every node.

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

### 3. **Finding the Lowest Common Ancestor (LCA)**

**LCA**: lowest ancestor of both nodes (node counts as own descendant).

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

Example: LCA(5,1)=3; LCA(5,4)=5.

### Summary

| Op | Time |
|----|------|
| Height | O(n) |
| Balanced check | O(n) |
| LCA | O(n) |

## Binary Search Trees (BST): How do binary search trees differ from binary trees?

**Binary tree**: no ordering. **BST**: left < parent < right → in-order sorted; O(log n) when balanced.

- **Definition**: A binary search tree is a binary tree with the following additional property: for every node N:

  - The value of all nodes in the left subtree of N are **less than** the value of N.

  - The value of all nodes in the right subtree of N are **greater than** the value of N.

- **Properties**:

  - **Ordering**: A BST enforces a strict ordering where the left subtree holds smaller values, and the right subtree holds larger values.

  - This ordering allows for **efficient searching, insertion, and deletion** operations.

  - BSTs are widely used for maintaining dynamically sorted data.

- **Traversal**: An in-order traversal of a BST returns the elements in **sorted order**.

BST example: 10 with left {2,5,7}, right {15,20}.

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

**Search/Insert** (recursive):

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

**Delete**: leaf / one child / two children (swap with successor).

**Uses**: dynamic sorted sets. **Caveat**: skew → O(n); use AVL/RB.

In summary, a **binary search tree (BST)** differs from a regular **binary tree** in that it maintains a specific ordering property, allowing for more efficient search, insertion, and deletion operations.

## How do you insert, delete nodes, or find the kth smallest element in a BST?

### 1. **Inserting a Node in a Binary Search Tree (BST)**

**Insert**: go left/right until null.

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

### 2. **Deleting a Node in a Binary Search Tree (BST)**

**Delete**: 3 cases — leaf, one child, two children (in-order successor).

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

### 3. **Finding the kth Smallest Element in a BST**

**kth smallest**: in-order with counter.

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

### Summary

| Op | Time |
|----|------|
| Insert/Delete | O(h) |
| kth smallest | O(n) |

## How do you convert a BST to a sorted doubly linked list?

**BST → sorted DLL**: in-order; rewire Left/Right as prev/next.

### C# Implementation

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

### Time Complexity

O(n) — visit each node once.

**Example**: BST 10/5,15/3,7,12 → DLL 3↔5↔7↔10↔12↔15. O(1) extra space.

## Heaps: What is a heap, and how does it differ from a BST? How do you perform heap operations (insert, delete) and find the k largest/smallest elements in an array?

### 1. **What is a Heap?**

**Heap**: complete binary tree; **max-heap** parent≥children, **min-heap** parent≤children.

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

**Insert**: append; **heapify up**.

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

**Delete max**: last→root; **heapify down**.

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

#### k Largest (min-heap size k)

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

#### k Smallest: max-heap size k — replace root when smaller value seen.

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

Self-balancing BSTs: **AVL** (strict) and **Red-Black** (looser).

### **AVL Trees**

### <img src="extracted\Data Structures and Algorithms\media/media/image16.png" style="width:6.79097in;height:4.09306in" />

**AVL**: balance factor = h(left)−h(right) ∈ {-1,0,1}.

#### **Balance Factor**:

- **Balance factor** of a node = Height of left subtree - Height of right subtree.

- The AVL tree is balanced if the balance factor of each node is either -1, 0, or 1.

#### **Rotations in AVL Trees**:

**Rotations**: LL→right, RR→left, LR/RL→double rotation.

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

**RBT**: red/black colors; root black; no red-red; equal black height paths.

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

Insert red; fix via recolor + rotate.

### **Difference Between AVL and Red-Black Trees**:

| **Property** | **AVL Tree** | **Red-Black Tree** |
|----|----|----|
| **Balance** | Strictly balanced (balance factor is -1, 0, 1) | Less strictly balanced |
| **Rotations** | More rotations due to strict balance | Fewer rotations due to looser balancing |
| **Height** | Logarithmic but slightly shorter than RBT | Logarithmic, but taller than AVL tree |
| **Use Cases** | Good for read-heavy applications | Good for write-heavy applications |

### Summary

| | AVL | Red-Black |
|---|-----|------------|
| Balance | Strict | Looser |
| Rotations | More | Fewer |
| Best for | Reads | Writes |

## B-Trees: What is a B-tree, and where is it commonly used?

### **B-Trees: Overview**

**B-tree**: multi-key, disk-friendly; shallow; minimizes I/O.

### Properties & Structure

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

### Operations

- **Search:** O(log n)

- **Insert:** O(log n)

- **Delete:** O(log n)

### Uses

DB indexes (B+), file systems (NTFS, HFS+), search engines.

### Summary

Multi-key nodes; sorted keys; great for disk blocks; complex in-memory.
