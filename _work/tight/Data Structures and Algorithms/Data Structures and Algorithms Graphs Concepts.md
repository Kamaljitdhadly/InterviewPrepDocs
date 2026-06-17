# Data Structures and Algorithms Graphs Concepts

A **graph** is **vertices** (nodes) connected by **edges**, modeling relationships between objects.

### Types of Graphs

### 1. **Undirected Graph**

Edges have no direction; travel either way. Example: mutual friendships (A—B implies B—A).

```
A ——— B
|     |
C ——— D
```

#### Key Points:

- Edge (A-B) works both directions; no inherent direction.

### 2. **Directed Graph (Digraph)**

Each edge has direction (A → B only). Example: one-way web links, task dependencies.

```
A → B
↑   ↓
D ← C
```

#### Key Points:

- One-way travel; models asymmetric relationships.

### 3. **Weighted Graph**

Each edge has a numeric weight (cost, distance). Can be directed or undirected. Example: road distances between cities.

#### Key Points:

- Weights on edges represent cost/distance metrics.

### 4. **Cyclic Graph**

Contains at least one cycle (path returning to start vertex). Both directed and undirected graphs can be cyclic.

#### Key Points:

- A cycle revisits a vertex without reusing an edge.

### 5. **Acyclic Graph**

No cycles. **DAG (Directed Acyclic Graph)** used for ordered tasks/scheduling.

#### Key Points:

- No loops; strict sequencing (e.g., A → B → C → D).

### 6. **Complete Graph**

Every pair of vertices connected. n vertices → n(n−1)/2 edges. Dense.

#### Key Points:

- Maximum possible edges for n vertices.

### 7. **Sparse Graph**

Few edges relative to vertices. Example: cities with only major roads.

#### Key Points:

- Minimal connections; memory-efficient with adjacency lists.

### 8. **Dense Graph**

Many edges, near maximum. Computationally expensive for traversal/storage.

#### Key Points:

- High edge-to-vertex ratio; adjacency matrix may suit.

### Conclusion

Graph type depends on problem: directed vs undirected, weighted, cyclic/acyclic, sparse/dense.

### Adjacency Matrix Representation

2D table: cell [i][j] = edge presence/weight.

1. **Undirected:** symmetric matrix.
2. **Directed:** not necessarily symmetric.
3. **Weighted:** stores weights; no edge = 0 or ∞.

#### Example 1: Undirected Graph

Vertices {A,B,C,D}, edges (A-B), (A-C), (B-D), (C-D).

```
A B C D
A [0, 1, 1, 0]
B [1, 0, 0, 1]
C [1, 0, 0, 1]
D [0, 1, 1, 0]
```

Symmetric; diagonal = 0 (no self-loops).

#### Example 2: Directed Graph

Edges A→B, B→C, C→D, D→A.

```
A B C D
A [0, 1, 0, 0]
B [0, 0, 1, 0]
C [0, 0, 0, 1]
D [1, 0, 0, 0]
```

[A][B]=1 but [B][A]=0 — direction matters.

#### Example 3: Weighted Graph

Weights: (A-B,4), (A-C,10), (B-D,2), (C-D,5).

```
A B  C  D
A [0, 4, 10, 0]
B [4, 0,  0, 2]
C [10,0,  0, 5]
D [0, 2,  5, 0]
```

0 = no direct edge.

### Advantages of Adjacency Matrix:

1. Simple; **O(1)** edge lookup.

### Disadvantages of Adjacency Matrix:

1. **O(n²)** space — wasteful for sparse graphs. Prefer adjacency list when few edges.

### Summary:

Best for dense graphs or frequent edge-existence queries; memory-heavy for large sparse graphs.

### Adjacency List Representation

Each vertex stores a list of neighbors. **Directed:** outgoing only. **Undirected:** both directions stored.

#### Example 1: Undirected Graph

A: B,C | B: A,D | C: A,D | D: B,C

#### Example 2: Directed Graph

A: B | B: C | C: D | D: A

#### Example 3: Weighted Graph

A: (B,4),(C,10) | B: (A,4),(D,2) | C: (A,10),(D,5) | D: (B,2),(C,5)

### Example 4: Cyclic vs. Acyclic Graphs

#### Cyclic Graph:

```csharp
makefile
Copy code
A: B
B: C
C: D
D: A
```

#### Acyclic Graph:

```csharp
makefile
Copy code
A: B
B: C
C: D
D: []
```

Cyclic: A→B→C→D→A loop. Acyclic: no return path.

### Advantages of Adjacency List:

1. **O(V+E)** space — efficient for sparse graphs.
2. Fast neighbor iteration.

### Disadvantages of Adjacency List:

1. Edge lookup O(degree) vs matrix O(1).
2. Less ideal for very dense graphs.

### Summary:

Space-efficient for sparse graphs; great for traversals; slower specific-edge queries.

### Graph Traversal

Two primary methods: **BFS** (level-by-level) and **DFS** (deep before backtrack). Used for components, shortest paths, cycles.

**Breadth-First Search (BFS)** explores layer by layer from a source using a **queue**.

### Key Characteristics of BFS:

- Level-wise exploration; queue-based.
- Shortest path in **unweighted** graphs.

### BFS Algorithm:

1. Mark source visited, enqueue.
2. Dequeue, visit neighbors, enqueue unvisited ones.
3. Repeat until queue empty.

### BFS Example

```
    A
   / \
  B   C
 / \   \
D   E   F
```

Vertices {A,B,C,D,E,F}; edges (A-B),(A-C),(B-D),(B-E),(C-F). **Order from A:** A → B → C → D → E → F.

#### BFS Traversal Steps:

1. **Step 1**: Start from A, add B and C to the queue.

```csharp
css
Copy code
A → [B, C]
```

2. **Step 2**: Dequeue B, add its neighbors D and E to the queue.

```csharp
css
Copy code
A → B → [C, D, E]
```

3. **Step 3**: Dequeue C, add its neighbor F to the queue.

```csharp
css
Copy code
A → B → C → [D, E, F]
```

4. **Step 4**: Dequeue D.

```csharp
css
Copy code
A → B → C → D → [E, F]
```

5. **Step 5**: Dequeue E.

```csharp
css
Copy code
A → B → C → D → E → [F]
```

6. **Step 6**: Dequeue F.

```csharp
css
Copy code
A → B → C → D → E → F → []
```

### BFS in a Directed Graph:

Follows directed edges only. From A in graph A→B→C, B→D, D→E: **Order:** A → B → C → D → E.

### BFS in a Weighted Graph:

Ignores weights; use **Dijkstra** when weights matter.

### Applications of BFS:

1. Shortest path (unweighted).
2. Level-order traversal.
3. Cycle detection (undirected).
4. Connected components.
5. Web crawling, social network degrees of separation.

### Time and Space Complexity:

- **Time:** O(V + E)
- **Space:** O(V) for queue + visited

### Advantages of BFS:

1. Shortest path in unweighted graphs; simple queue implementation.

### Disadvantages of BFS:

1. More memory than DFS on wide graphs.

### Summary:

BFS = queue, level-order, shortest unweighted paths.

**Depth-First Search (DFS)** explores as deep as possible before backtracking. Uses **stack** or recursion.

### Key Characteristics of DFS:

- Deep exploration; stack/recursion-based.
- Cycle detection, topological sort, components.

### DFS Algorithm (Recursive):

1. Mark visited, recurse on unvisited neighbors, backtrack when stuck.

### DFS Algorithm (Iterative):

1. Push source; pop, visit, push unvisited neighbors.

### DFS Example

Same graph as BFS (A—B,C; B—D,E; C—F). **Order from A:** A → B → D → E → C → F (neighbor order dependent). DFS dives to D before visiting C.

#### DFS Traversal Steps:

1. **Step 1**: Start from A, explore B.

```csharp
css
Copy code
A → B
```

2. **Step 2**: Explore B, go deeper to D.

```csharp
css
Copy code
A → B → D
```

3. **Step 3**: Backtrack to B, explore E.

```csharp
css
Copy code
A → B → D → E
```

4. **Step 4**: Backtrack to A, explore C.

```csharp
mathematica
Copy code
A → B → D → E → C
```

5. **Step 5**: Explore C, go deeper to F.

```csharp
mathematica
Copy code
A → B → D → E → C → F
```

### DFS in a Directed Graph:

From A in A→B→C, B→D, D→E: **Order:** A → B → C → D → E.

### DFS in a Weighted Graph:

Ignores weights; use Dijkstra/Bellman-Ford for weighted shortest paths.

### Applications of DFS:

1. Cycle detection (directed/undirected).
2. Connected components.
3. Topological sort (DAG).
4. Maze/path exploration.

### Time and Space Complexity:

- **Time:** O(V + E)
- **Space:** O(V) stack depth

### Advantages of DFS:

1. Memory-efficient on deep graphs; versatile for cycles/topological sort.

### Disadvantages of DFS:

1. No shortest-path guarantee in unweighted graphs.

### Summary:

DFS = stack/recursion, deep-first; cycles, topo sort, pathfinding.
