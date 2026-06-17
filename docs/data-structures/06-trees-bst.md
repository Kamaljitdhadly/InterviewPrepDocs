# Trees & Binary Search Trees

## Concept Explanation

A **tree** is a hierarchical structure of **nodes**: one **root**, each node having children, no cycles. A **binary tree** limits each node to ≤ 2 children (left/right).

A **Binary Search Tree (BST)** is a binary tree with the ordering invariant: for every node, **all left-subtree values < node < all right-subtree values**. This enables **O(log n)** search/insert/delete — *if balanced*. If it degenerates (inserting sorted data), it becomes a linked list with **O(n)** operations. **Self-balancing trees** (AVL, Red-Black) keep height ~log n automatically.

**Traversals:**
- **In-order** (Left, Node, Right) → visits BST values in **sorted order**.
- **Pre-order** (Node, Left, Right) → copy/serialize a tree.
- **Post-order** (Left, Right, Node) → delete/free a tree, evaluate expressions.
- **Level-order** (BFS) → visit level by level using a queue.

## Code Example(s)

```csharp
class TreeNode
{
    public int Val;
    public TreeNode? Left, Right;
    public TreeNode(int v) => Val = v;
}

// BST insert — O(h), h = height (log n if balanced)
TreeNode Insert(TreeNode? root, int val)
{
    if (root == null) return new TreeNode(val);
    if (val < root.Val) root.Left = Insert(root.Left, val);
    else root.Right = Insert(root.Right, val);
    return root;
}

// In-order traversal yields sorted values for a BST
void InOrder(TreeNode? node, List<int> output)
{
    if (node == null) return;
    InOrder(node.Left, output);
    output.Add(node.Val);          // node between left and right
    InOrder(node.Right, output);
}
```

```csharp
// Level-order (BFS) using a queue — O(n)
IEnumerable<int> LevelOrder(TreeNode? root)
{
    var result = new List<int>();
    if (root == null) return result;
    var q = new Queue<TreeNode>();
    q.Enqueue(root);
    while (q.Count > 0)
    {
        var n = q.Dequeue();
        result.Add(n.Val);
        if (n.Left != null) q.Enqueue(n.Left);
        if (n.Right != null) q.Enqueue(n.Right);
    }
    return result;
}
```

## Interview Q&A

**🟢 What is a binary search tree?**
A binary tree where each node's left subtree holds only smaller values and the right subtree only larger values, enabling efficient (O(log n) when balanced) search, insert, and delete.

**🟢 What are the tree traversal types?**
Depth-first: in-order (L,N,R), pre-order (N,L,R), post-order (L,R,N); and breadth-first: level-order. In-order on a BST gives sorted output.

**🟡 What's the time complexity of BST operations and what affects it?**
O(h) where h is the height. Balanced → O(log n); degenerate (sorted inserts) → O(n). Self-balancing trees (AVL/Red-Black) guarantee O(log n).

**🟡 How do you find the height/depth of a tree?**
Recursively: height = 1 + max(height(left), height(right)), with an empty subtree height 0/-1. O(n) since you visit every node.

**🔴 What's the difference between an AVL tree and a Red-Black tree?**
Both self-balance to keep O(log n). AVL is more strictly balanced (faster lookups, more rotations on insert/delete) — good for read-heavy workloads. Red-Black is more loosely balanced (fewer rotations, faster inserts/deletes) — used in many standard libraries (e.g. `SortedDictionary`, Java's `TreeMap`).

## ⚠️ Tricky / Gotchas

- **A BST built from sorted input degenerates into a linked list** (O(n)) — the classic "why is my BST slow?" gotcha. Use a self-balancing tree.
- **In-order traversal sorted-ness is a BST validity test** — but checking only immediate children isn't enough; you must validate against an inherited min/max range, not just `left < node < right` locally.

```csharp
bool IsValidBst(TreeNode? n, long min, long max) =>
    n == null || (n.Val > min && n.Val < max
        && IsValidBst(n.Left, min, n.Val) && IsValidBst(n.Right, n.Val, max));
```

- **Recursive traversal can stack-overflow** on very deep/unbalanced trees — consider iterative traversal with an explicit stack.
- **Deleting a node with two children** needs the in-order successor (or predecessor) — a step people forget.
- **Binary tree ≠ binary search tree** — a binary tree has no ordering invariant; don't assume search is O(log n) on a plain binary tree.

## 📌 Quick Recap

- Tree = hierarchical nodes (root, children, no cycles); binary tree ≤ 2 children.
- BST invariant: left < node < right → O(log n) ops when balanced, O(n) if degenerate.
- Traversals: in-order (sorted for BST), pre-order (copy), post-order (delete), level-order (BFS via queue).
- Self-balancing: AVL (stricter, read-heavy) vs Red-Black (fewer rotations, used in libraries).
- Validate a BST with inherited min/max range, not just local children.
- Deep recursion can overflow; deleting a 2-child node uses the in-order successor.
