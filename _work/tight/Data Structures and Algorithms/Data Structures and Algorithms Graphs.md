# Data Structures and Algorithms Graphs
## Questions Covered

1. What is a graph, and what is the difference between directed and undirected graphs?
2. How do you represent a graph (adjacency matrix vs. adjacency list) and traverse it (BFS, DFS)?
3. How do you detect cycles, and what is the difference between weighted and unweighted graphs?
4. What is Dijkstra's, Bellman-Ford, and Floyd-Warshall algorithm for finding shortest paths?
5. How do you find the Minimum Spanning Tree using Prim's or Kruskal's algorithm?
## What is a graph, and what is the difference between directed and undirected graphs?

### Graph: Overview

A **graph** models objects (**vertices/nodes**) connected by **edges**. Used for social networks, routes, web links. G(V, E): V = vertices, E = edges.

### Types of Graphs

1. **Directed Graph (Digraph):** Edges have direction (u → v); relationships are one-way. Vertices have **in-degree** and **out-degree**. Example: Twitter follows, web links, task dependencies.

2. **Undirected Graph:** Edges are bidirectional (u — v). Symmetric relationships. Example: Facebook friends, road maps, co-authorship.

### Differences Between Directed and Undirected Graphs

| **Feature** | **Directed Graph** | **Undirected Graph** |
|----|----|----|
| **Edge Direction** | Each edge has a direction (u → v) | No direction; connections are bi-directional (u — v) |
| **Symmetry** | Relationships are typically asymmetric | Relationships are symmetric (two-way) |
| **Degree of Vertex** | In-degree and out-degree are different | Only one degree (number of neighbors) |
| **Examples** | Twitter, Web pages, Dependency graphs | Facebook, Physical road maps, Collaboration networks |
| **Storage (Adj. List)** | Stores outgoing edges separately for each vertex | Stores edges as pairs without direction |
| **Use Case** | Task scheduling, Network traffic, Web crawlers | Social networking, Road networks, Biology |

### Graph Representations

1. **Adjacency Matrix:** 2D matrix; M[i][j] indicates edge. **Space:** O(V²). Good for **dense** graphs.
2. **Adjacency List:** Per-vertex neighbor lists. **Space:** O(V + E). Good for **sparse** graphs.

### Real-World Applications

Social networks, transportation, web hyperlinks, recommendation systems.

### Summary

**Directed** = one-way edges; **undirected** = two-way. Both essential for networking, ranking, and routing problems.
## How do you represent a graph (adjacency matrix vs. adjacency list) and traverse it (BFS, DFS)?

### **Graph Representation**

#### **1. Adjacency Matrix**

2D matrix M[i][j]: 1 if edge exists (directed: i→j only; undirected: symmetric). **Space:** O(V²). **Edge lookup:** O(1). Wasteful for sparse graphs; slow edge enumeration.

**Example** (A→B, B→C):

|     | **A** | **B** | **C** |
|-----|-------|-------|-------|
| A   | 0     | 1     | 0     |
| B   | 0     | 0     | 1     |
| C   | 0     | 0     | 0     |

#### **2. Adjacency List**

Array of neighbor lists per vertex. **Space:** O(V + E). Efficient edge enumeration; **edge lookup:** O(V).

**Example:** A: [B], B: [C], C: []

### **Graph Traversal Algorithms**

#### **1. Breadth-First Search (BFS)**

Queue-based level-order traversal: dequeue vertex, visit, enqueue unvisited neighbors. **Time/Space:** O(V + E) / O(V). Shortest path in unweighted graphs.

### Example Code (C#)

```csharp
using System;
using System.Collections.Generic;
class Graph
{
  private int V; // Number of vertices
  private List<int>[] adjList; // Adjacency list
  public Graph(int v)
  {
    V = v;
    adjList = new List<int>[v];
    for (int i = 0; i < v; i++)
    {
      adjList[i] = new List<int>();
    }
  }
  public void AddEdge(int u, int v)
  {
    adjList[u].Add(v);
  }
  public void BFS(int start)
  {
    bool[] visited = new bool[V];
    Queue<int> queue = new Queue<int>();
    visited[start] = true;
    queue.Enqueue(start);
    while (queue.Count > 0)
    {
      int vertex = queue.Dequeue();
      Console.Write(vertex + " ");
      foreach (int neighbor in adjList[vertex])
      {
        if (!visited[neighbor])
        {
          visited[neighbor] = true;
          queue.Enqueue(neighbor);
        }
      }
    }
  }
}
```

#### **2. Depth-First Search (DFS)**

Stack/recursion-based: go deep before backtracking. **Time/Space:** O(V + E) / O(V). Used for pathfinding, topological sort, components.

### Example Code (C#)

```csharp
using System;
using System.Collections.Generic;
class Graph
{
  private int V; // Number of vertices
  private List<int>[] adjList; // Adjacency list
  public Graph(int v)
  {
    V = v;
    adjList = new List<int>[v];
    for (int i = 0; i < v; i++)
    {
      adjList[i] = new List<int>();
    }
  }
  public void AddEdge(int u, int v)
  {
    adjList[u].Add(v);
  }
  public void DFS(int start)
  {
    bool[] visited = new bool[V];
    Stack<int> stack = new Stack<int>();
    stack.Push(start);
    while (stack.Count > 0)
    {
      int vertex = stack.Pop();
      if (!visited[vertex])
      {
        visited[vertex] = true;
        Console.Write(vertex + " ");
        foreach (int neighbor in adjList[vertex])
        {
          if (!visited[neighbor])
          {
            stack.Push(neighbor);
          }
        }
      }
    }
  }
}
```

### **Summary:**

- **Matrix:** dense graphs, O(1) lookup; **List:** sparse graphs, O(V+E) space.
- **BFS:** queue, shortest unweighted path; **DFS:** stack, topological sort/pathfinding.
## How do you detect cycles, and what is the difference between weighted and unweighted graphs?

### **Detecting Cycles in Graphs**

#### **1. Detecting Cycles in Undirected Graphs**

DFS with parent tracking: if a visited neighbor isn't the parent → cycle.

**Example Code (C#)**

```csharp
using System;
using System.Collections.Generic;
class Graph
{
  private int V; // Number of vertices
  private List<int>[] adjList; // Adjacency list
  public Graph(int v)
  {
    V = v;
    adjList = new List<int>[v];
    for (int i = 0; i < v; i++)
    {
      adjList[i] = new List<int>();
    }
  }
  public void AddEdge(int u, int v)
  {
    adjList[u].Add(v);
    adjList[v].Add(u); // For undirected graph
  }
  private bool IsCyclicUtil(int v, bool[] visited, int parent)
  {
    visited[v] = true;
    foreach (int neighbor in adjList[v])
    {
      if (!visited[neighbor])
      {
        if (IsCyclicUtil(neighbor, visited, v))
        return true;
      }
      else if (neighbor != parent)
      {
        return true;
      }
    }
    return false;
  }
  public bool IsCyclic()
  {
    bool[] visited = new bool[V];
    for (int i = 0; i < V; i++)
    {
      if (!visited[i])
      {
        if (IsCyclicUtil(i, visited, -1))
        return true;
      }
    }
    return false;
  }
}
```

#### **2. Detecting Cycles in Directed Graphs**

DFS with **recursion stack** (`recStack`): if neighbor is in recStack → back edge → cycle.

**Example Code (C#)**

```csharp
using System;
using System.Collections.Generic;
class Graph
{
  private int V; // Number of vertices
  private List<int>[] adjList; // Adjacency list
  public Graph(int v)
  {
    V = v;
    adjList = new List<int>[v];
    for (int i = 0; i < v; i++)
    {
      adjList[i] = new List<int>();
    }
  }
  public void AddEdge(int u, int v)
  {
    adjList[u].Add(v);
  }
  private bool IsCyclicUtil(int v, bool[] visited, bool[] recStack)
  {
    if (recStack[v])
    return true;
    if (visited[v])
    return false;
    visited[v] = true;
    recStack[v] = true;
    foreach (int neighbor in adjList[v])
    {
      if (IsCyclicUtil(neighbor, visited, recStack))
      return true;
    }
    recStack[v] = false;
    return false;
  }
  public bool IsCyclic()
  {
    bool[] visited = new bool[V];
    bool[] recStack = new bool[V];
    for (int i = 0; i < V; i++)
    {
      if (!visited[i])
      {
        if (IsCyclicUtil(i, visited, recStack))
        return true;
      }
    }
    return false;
  }
}
```

### **Weighted vs. Unweighted Graphs**

#### **1. Weighted Graphs**

Each edge has a cost/weight. Use Dijkstra, Bellman-Ford for shortest paths; network flow problems.

#### **2. Unweighted Graphs**

All edges treated as weight 1. BFS finds shortest paths; used for basic connectivity.

### **Summary**

- **Undirected cycles:** DFS + parent check.
- **Directed cycles:** DFS + recursion stack.
- **Weighted:** edge costs matter; **unweighted:** BFS for shortest path.
## What is Dijkstra's, Bellman-Ford, and Floyd-Warshall algorithm for finding shortest paths?

### Shortest Path Algorithms

### 1. Dijkstra's Algorithm

**Single-source**, non-negative weights. Greedy: priority queue relaxes neighbors. **Time:** O((V+E) log V) with min-heap.

### Example Code (C#)

```csharp
using System;
using System.Collections.Generic;
class Graph
{
  private int V; // Number of vertices
  private List<Tuple<int, int>>[] adjList; // Adjacency list with weights
  public Graph(int v)
  {
    V = v;
    adjList = new List<Tuple<int, int>>[v];
    for (int i = 0; i < v; i++)
    {
      adjList[i] = new List<Tuple<int, int>>();
    }
  }
  public void AddEdge(int u, int v, int w)
  {
    adjList[u].Add(new Tuple<int, int>(v, w));
    // For undirected graph, also add the reverse edge
    adjList[v].Add(new Tuple<int, int>(u, w));
  }
  public void Dijkstra(int source)
  {
    int[] dist = new int[V];
    bool[] sptSet = new bool[V];
    PriorityQueue<int, int> pq = new PriorityQueue<int, int>();
    for (int i = 0; i < V; i++)
    {
      dist[i] = int.MaxValue;
      sptSet[i] = false;
    }
    dist[source] = 0;
    pq.Enqueue(source, 0);
    while (pq.Count > 0)
    {
      int u = pq.Dequeue();
      sptSet[u] = true;
      foreach (var edge in adjList[u])
      {
        int v = edge.Item1;
        int weight = edge.Item2;
        if (!sptSet[v] && dist[u] != int.MaxValue && dist[u] + weight < dist[v])
        {
          dist[v] = dist[u] + weight;
          pq.Enqueue(v, dist[v]);
        }
      }
    }
    // Print the distance array
    for (int i = 0; i < V; i++)
    {
      Console.WriteLine("Distance from source to vertex " + i + " is " + dist[i]);
    }
  }
}
```

### 2. Bellman-Ford Algorithm

**Single-source**, handles **negative weights**; detects negative cycles. Relax all edges V−1 times, then one more pass. **Time:** O(V·E).

### Example Code (C#)

```csharp
using System;
using System.Collections.Generic;
class Graph
{
  private int V; // Number of vertices
  private List<Tuple<int, int, int>> edges; // List of edges with weights
  public Graph(int v)
  {
    V = v;
    edges = new List<Tuple<int, int, int>>();
  }
  public void AddEdge(int u, int v, int w)
  {
    edges.Add(new Tuple<int, int, int>(u, v, w));
  }
  public void BellmanFord(int source)
  {
    int[] dist = new int[V];
    for (int i = 0; i < V; i++)
    {
      dist[i] = int.MaxValue;
    }
    dist[source] = 0;
    // Relax all edges (V - 1) times
    for (int i = 1; i <= V - 1; i++)
    {
      foreach (var edge in edges)
      {
        int u = edge.Item1;
        int v = edge.Item2;
        int weight = edge.Item3;
        if (dist[u] != int.MaxValue && dist[u] + weight < dist[v])
        {
          dist[v] = dist[u] + weight;
        }
      }
    }
    // Check for negative weight cycles
    foreach (var edge in edges)
    {
      int u = edge.Item1;
      int v = edge.Item2;
      int weight = edge.Item3;
      if (dist[u] != int.MaxValue && dist[u] + weight < dist[v])
      {
        Console.WriteLine("Graph contains negative weight cycle");
        return;
      }
    }
    // Print the distance array
    for (int i = 0; i < V; i++)
    {
      Console.WriteLine("Distance from source to vertex " + i + " is " + dist[i]);
    }
  }
}
```

### 3. Floyd-Warshall Algorithm

**All-pairs** shortest paths via DP. `dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])` for each intermediate k. Handles negative weights (not negative cycles). **Time:** O(V³).

### Example Code (C#)

```csharp
using System;
class Graph
{
  private int V; // Number of vertices
  private int[,] dist; // Distance matrix
  public Graph(int v)
  {
    V = v;
    dist = new int[V, V];
    for (int i = 0; i < V; i++)
    {
      for (int j = 0; j < V; j++)
      {
        if (i == j)
        dist[i, j] = 0;
        else
        dist[i, j] = int.MaxValue;
      }
    }
  }
  public void AddEdge(int u, int v, int w)
  {
    dist[u, v] = w;
  }
  public void FloydWarshall()
  {
    for (int k = 0; k < V; k++)
    {
      for (int i = 0; i < V; i++)
      {
        for (int j = 0; j < V; j++)
        {
          if (dist[i, k] != int.MaxValue && dist[k, j] != int.MaxValue &&
          dist[i, j] > dist[i, k] + dist[k, j])
          {
            dist[i, j] = dist[i, k] + dist[k, j];
          }
        }
      }
    }
    // Print the distance matrix
    for (int i = 0; i < V; i++)
    {
      for (int j = 0; j < V; j++)
      {
        if (dist[i, j] == int.MaxValue)
        Console.Write("INF ");
        else
        Console.Write(dist[i, j] + " ");
      }
      Console.WriteLine();
    }
  }
}
```

### Summary

- **Dijkstra:** single-source, non-negative, O((V+E) log V).
- **Bellman-Ford:** single-source, negative weights/cycle detection, O(V·E).
- **Floyd-Warshall:** all-pairs, O(V³).
## How do you find the Minimum Spanning Tree using Prim's or Kruskal's algorithm?

### Minimum Spanning Tree (MST)

MST of a connected undirected graph spans all vertices with minimum total edge weight.

### 1. Prim's Algorithm

Grows MST from a seed vertex; repeatedly add smallest edge connecting MST to a non-MST vertex. **Time:** O((V+E) log V) with binary heap.

### Example Code (C#)

```csharp
using System;
using System.Collections.Generic;
class Graph
{
  private int V; // Number of vertices
  private List<Tuple<int, int, int>> edges; // List of edges with weights
  public Graph(int v)
  {
    V = v;
    edges = new List<Tuple<int, int, int>>();
  }
  public void AddEdge(int u, int v, int w)
  {
    edges.Add(new Tuple<int, int, int>(u, v, w));
  }
  public void Prim()
  {
    bool[] inMST = new bool[V];
    int[] parent = new int[V];
    int[] key = new int[V];
    PriorityQueue<int, int> pq = new PriorityQueue<int, int>();
    for (int i = 0; i < V; i++)
    {
      key[i] = int.MaxValue;
      inMST[i] = false;
    }
    key[0] = 0;
    pq.Enqueue(0, 0);
    parent[0] = -1;
    while (pq.Count > 0)
    {
      int u = pq.Dequeue();
      inMST[u] = true;
      foreach (var edge in edges)
      {
        int v = edge.Item2;
        int weight = edge.Item3;
        if (edge.Item1 == u && !inMST[v] && weight < key[v])
        {
          key[v] = weight;
          pq.Enqueue(v, key[v]);
          parent[v] = u;
        }
      }
    }
    // Print the MST
    for (int i = 1; i < V; i++)
    {
      Console.WriteLine("Edge: " + parent[i] + " - " + i + " Weight: " + key[i]);
    }
  }
}
```

### 2. Kruskal's Algorithm

Sort edges by weight; greedily add smallest non-cycle-forming edge using **Union-Find**. **Time:** O(E log E).

### Example Code (C#)

```csharp
using System;
using System.Collections.Generic;
class UnionFind
{
  private int[] parent;
  private int[] rank;
  public UnionFind(int n)
  {
    parent = new int[n];
    rank = new int[n];
    for (int i = 0; i < n; i++)
    {
      parent[i] = i;
      rank[i] = 0;
    }
  }
  public int Find(int u)
  {
    if (parent[u] != u)
    {
      parent[u] = Find(parent[u]);
    }
    return parent[u];
  }
  public void Union(int u, int v)
  {
    int rootU = Find(u);
    int rootV = Find(v);
    if (rootU != rootV)
    {
      if (rank[rootU] > rank[rootV])
      parent[rootV] = rootU;
      else if (rank[rootU] < rank[rootV])
      parent[rootU] = rootV;
      else
      {
        parent[rootV] = rootU;
        rank[rootU]++;
      }
    }
  }
}
class Graph
{
  private int V; // Number of vertices
  private List<Tuple<int, int, int>> edges; // List of edges with weights
  public Graph(int v)
  {
    V = v;
    edges = new List<Tuple<int, int, int>>();
  }
  public void AddEdge(int u, int v, int w)
  {
    edges.Add(new Tuple<int, int, int>(u, v, w));
  }
  public void Kruskal()
  {
    edges.Sort((e1, e2) => e1.Item3.CompareTo(e2.Item3));
    UnionFind uf = new UnionFind(V);
    foreach (var edge in edges)
    {
      int u = edge.Item1;
      int v = edge.Item2;
      int weight = edge.Item3;
      if (uf.Find(u) != uf.Find(v))
      {
        uf.Union(u, v);
        Console.WriteLine("Edge: " + u + " - " + v + " Weight: " + weight);
      }
    }
  }
}
```

### Summary

- **Prim:** grow from vertex, O((V+E) log V).
- **Kruskal:** sort edges + union-find, O(E log E).
