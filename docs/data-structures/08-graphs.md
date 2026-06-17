# Graphs & Traversals (BFS/DFS)

## Concept Explanation

A **graph** is a set of **vertices (nodes)** connected by **edges**. Variations:
- **Directed** (edges have direction) vs **undirected**.
- **Weighted** (edges carry costs) vs unweighted.
- **Cyclic** vs **acyclic** (a DAG = directed acyclic graph).

**Representations:**
- **Adjacency list** — each vertex stores its neighbors. Space O(V+E); efficient for sparse graphs (most real graphs). Preferred.
- **Adjacency matrix** — a V×V grid of edge presence/weight. Space O(V²); O(1) edge lookup; good for dense graphs.

**Traversals:**
- **BFS (Breadth-First Search)** — explore level by level using a **queue**; finds the **shortest path in unweighted graphs**.
- **DFS (Depth-First Search)** — go deep first using a **stack/recursion**; used for cycle detection, topological sort, connectivity.

For **weighted** shortest paths use **Dijkstra** (non-negative weights) or **Bellman-Ford** (handles negatives).

## Code Example(s)

```csharp
// Adjacency list
var graph = new Dictionary<int, List<int>>
{
    [1] = new() { 2, 3 },
    [2] = new() { 4 },
    [3] = new() { 4 },
    [4] = new() { }
};
```

```csharp
// BFS — shortest path (in edges) from a source in an unweighted graph. O(V+E)
IEnumerable<int> Bfs(Dictionary<int, List<int>> g, int start)
{
    var visited = new HashSet<int> { start };
    var queue = new Queue<int>(); queue.Enqueue(start);
    var order = new List<int>();
    while (queue.Count > 0)
    {
        int node = queue.Dequeue();
        order.Add(node);
        foreach (int next in g[node])
            if (visited.Add(next))      // Add returns false if already visited
                queue.Enqueue(next);
    }
    return order;
}

// DFS (recursive). O(V+E)
void Dfs(Dictionary<int, List<int>> g, int node, HashSet<int> visited)
{
    if (!visited.Add(node)) return;     // already visited
    foreach (int next in g[node])
        Dfs(g, next, visited);
}
```

## Interview Q&A

**🟢 What are the two main ways to represent a graph?**
Adjacency list (each vertex lists its neighbors; O(V+E) space, good for sparse graphs) and adjacency matrix (V×V grid; O(V²) space, O(1) edge lookup, good for dense graphs).

**🟢 What's the difference between BFS and DFS?**
BFS explores level by level using a queue and finds shortest paths in unweighted graphs. DFS explores as deep as possible using a stack/recursion and is used for cycle detection, topological sorting, and connectivity. Both are O(V+E).

**🟡 How do you find the shortest path in an unweighted graph?**
BFS from the source — because it visits nodes in order of distance, the first time you reach a node is via a shortest path. Track distances/parents during the traversal.

**🟡 How do you detect a cycle in a graph?**
In an undirected graph, DFS and check for a visited neighbor that isn't the parent. In a directed graph, DFS with three states (unvisited/in-progress/done) — encountering an "in-progress" node means a back edge → cycle.

**🔴 When would you use Dijkstra vs BFS vs Bellman-Ford?**
BFS for shortest path in **unweighted** graphs (O(V+E)). Dijkstra for **weighted, non-negative** edges (O((V+E) log V) with a heap). Bellman-Ford when edges can be **negative** (O(V·E)) and to detect negative cycles. Use a topological sort + DP for shortest paths on a DAG.

## ⚠️ Tricky / Gotchas

- **Forgetting the `visited` set causes infinite loops** in cyclic graphs (and redundant work in DAGs). Mark nodes visited as you enqueue/recurse.
- **Mark visited when enqueuing, not when dequeuing**, in BFS — otherwise a node can be added to the queue multiple times.
- **DFS recursion can stack-overflow** on large/deep graphs — use an explicit stack for iterative DFS.
- **Directed vs undirected matters** for cycle detection and connectivity — the algorithms differ; don't apply the undirected approach to a directed graph.
- **Dijkstra fails with negative edges** — a classic trap; use Bellman-Ford instead.
- **Disconnected graphs**: a single BFS/DFS only reaches one component — loop over all vertices to cover everything.

## 📌 Quick Recap

- Graph = vertices + edges; directed/undirected, weighted/unweighted, cyclic/acyclic (DAG).
- Represent with adjacency list (sparse, O(V+E)) or matrix (dense, O(V²), O(1) lookup).
- BFS (queue, level-order) → shortest path in unweighted graphs; DFS (stack/recursion) → cycles, topo sort, connectivity. Both O(V+E).
- Weighted shortest path: Dijkstra (non-negative) or Bellman-Ford (negatives + negative-cycle detection).
- Always track visited (mark on enqueue in BFS); handle directed vs undirected and disconnected components.
