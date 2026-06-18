**What is a Graph?**

A **graph** is a collection of **vertices** (also called nodes) and **edges** that connect pairs of vertices. Graphs are used to model relationships between objects.

### Types of Graphs

### 1. **Undirected Graph**

An **undirected graph** is a graph in which edges do not have a direction. You can move between two connected nodes in either direction.

#### Example:

- **Scenario**: Social network friendships, where connections are mutual (if A is friends with B, then B is friends with A).

**Diagram**:

css

Copy code

A ——— B

\| \|

\| \|

C ——— D

- **Explanation**: Vertices (A, B, C, D) represent people, and edges represent friendships. Each edge is bidirectional, meaning friendships are mutual.

#### Key Points:

- In an undirected graph, the edge (A-B) means you can go from A to B and B to A.

- The graph does not have any specific direction between nodes.

### 2. **Directed Graph (Digraph)**

A **directed graph** is a graph where each edge has a direction. You can only travel from the start node to the end node as indicated by the arrow.

#### Example:

- **Scenario**: Web pages where links point from one page to another (A links to B, but B does not necessarily link to A).

**Diagram**:

css

Copy code

A → B

↑ ↓

D ← C

- **Explanation**: Vertices (A, B, C, D) represent web pages, and the arrows (edges) represent one-way links from one page to another.

#### Key Points:

- In a directed graph, the edge (A → B) means you can go from A to B but not the other way around.

- Directed graphs are useful for modeling one-way relationships like links or tasks with dependencies.

### 3. **Weighted Graph**

A **weighted graph** assigns a numerical weight to each edge, representing a cost, distance, or some other metric between the nodes.

#### Example:

- **Scenario**: A road map where cities are connected by roads, and the weight represents the distance between cities.

**Diagram**:

css

Copy code

5

A ———— B

\| \|

10 3

\| \|

C ———— D

2

- **Explanation**: Vertices (A, B, C, D) represent cities, and the edges represent roads between cities. The numbers on the edges indicate the distance (weights) between the cities.

#### Key Points:

- The graph is weighted, meaning each edge has a value (e.g., road distance).

- This graph can be either directed or undirected, depending on the scenario.

### 4. **Cyclic Graph**

A **cyclic graph** contains at least one cycle, which is a path that starts and ends at the same vertex.

#### Example:

- **Scenario**: A network of roads where you can loop back to the starting point without retracing any edge.

**Diagram**:

css

Copy code

A → B

↑ ↓

D ← C

- **Explanation**: Starting from A, you can travel through B → C → D → A, forming a cycle.

#### Key Points:

- A cycle in a graph means there’s a path where you can revisit the same vertex.

- Both directed and undirected graphs can have cycles.

### 5. **Acyclic Graph**

An **acyclic graph** is a graph with no cycles. If you start from any vertex and traverse through the edges, you won’t revisit the same vertex.

#### Example:

- **Scenario**: A family tree or a workflow where tasks are done in sequence with no repetition.

**Diagram**:

css

Copy code

A → B → C → D

- **Explanation**: Vertices (A, B, C, D) represent tasks, and the directed edges show the sequence in which tasks must be completed. There is no way to return to any previous node.

#### Key Points:

- An acyclic graph does not have any loops.

- **DAG (Directed Acyclic Graph)** is commonly used in tasks that require a strict order, like project scheduling.

### 6. **Complete Graph**

A **complete graph** is a graph where every pair of vertices is connected by a unique edge.

#### Example:

- **Scenario**: A fully connected social network where each person is friends with every other person.

**Diagram**:

css

Copy code

A —— B

\| \\ \|

\| \\ \|

C —— D

- **Explanation**: Vertices (A, B, C, D) are people, and each person is directly connected to every other person.

#### Key Points:

- In a complete graph with n vertices, there are (n \* (n - 1)) / 2 edges.

- Complete graphs are dense, meaning they have the maximum possible number of edges.

### 7. **Sparse Graph**

A **sparse graph** is a graph with relatively few edges compared to the number of vertices.

#### Example:

- **Scenario**: A city map where only a few major roads connect cities.

**Diagram**:

css

Copy code

A —— B

\|

D

- **Explanation**: Vertices (A, B, D) are cities, but there are only two roads (edges), indicating a sparse connection.

#### Key Points:

- Sparse graphs are used when connections between nodes are minimal.

- Efficient for cases where many nodes exist but only a few connections are necessary.

### 8. **Dense Graph**

A **dense graph** has many edges, close to the maximum number of edges possible for the number of vertices.

#### Example:

- **Scenario**: A network of cities where each city is well-connected with roads to many other cities.

**Diagram**:

css

Copy code

A —— B

\| \\ \|

\| /\\ \|

C —— D

- **Explanation**: Vertices (A, B, C, D) represent cities, and there are numerous roads (edges) between them, making it a dense network.

#### Key Points:

- Dense graphs have many edges relative to the number of vertices.

- These graphs can be computationally expensive to handle in terms of memory and traversal.

### Conclusion

Graphs are versatile and powerful structures used in many real-world applications like social networks, road systems, web page links, and task scheduling. The type of graph depends on the problem you're solving—whether you need directed, weighted, cyclic, acyclic, sparse, or dense relationships.

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

The **Adjacency Matrix** is one of the most common ways to represent a graph. It’s a 2D matrix (or table) where each cell \[i\]\[j\] represents whether there is an edge from vertex i to vertex j. It is useful for quickly determining if there is a direct connection between two vertices.

### Adjacency Matrix Representation

1.  **Undirected Graph**: The matrix is symmetric, meaning if there’s an edge between vertices i and j, then the matrix will have 1 (or the weight of the edge) at both \[i\]\[j\] and \[j\]\[i\].

2.  **Directed Graph**: The matrix is not necessarily symmetric because an edge from i to j doesn’t imply an edge from j to i.

3.  **Weighted Graph**: Instead of 1s and 0s, the matrix stores the weights of the edges. If there is no edge between two vertices, the value is typically set to ∞ or a very large number to indicate no connection.

### Example 1: Undirected Graph

Let's take a simple undirected graph as an example.

#### Graph Diagram:

css

Copy code

A ——— B

\| /

\| /

C ——— D

- Vertices: {A, B, C, D}

- Edges: { (A-B), (A-C), (B-D), (C-D) }

#### Adjacency Matrix:

css

Copy code

A B C D

A \[0, 1, 1, 0\]

B \[1, 0, 0, 1\]

C \[1, 0, 0, 1\]

D \[0, 1, 1, 0\]

- **Explanation**:

  - A-B: There is an edge between A and B, so \[A\]\[B\] and \[B\]\[A\] are both 1.

  - A-C: There is an edge between A and C, so \[A\]\[C\] and \[C\]\[A\] are both 1.

  - B-D: There is an edge between B and D, so \[B\]\[D\] and \[D\]\[B\] are both 1.

  - The diagonal cells \[i\]\[i\] are 0 because there are no self-loops (i.e., no vertex connects to itself).

### Example 2: Directed Graph

In a directed graph, edges have a direction. Consider this example:

#### Graph Diagram:

css

Copy code

A → B

↑ ↓

D ← C

- Vertices: {A, B, C, D}

- Directed Edges: { (A → B), (B → C), (C → D), (D → A) }

#### Adjacency Matrix:

css

Copy code

A B C D

A \[0, 1, 0, 0\]

B \[0, 0, 1, 0\]

C \[0, 0, 0, 1\]

D \[1, 0, 0, 0\]

- **Explanation**:

  - A → B: There is a directed edge from A to B, so \[A\]\[B\] is 1, but \[B\]\[A\] is 0 (no edge from B to A).

  - B → C: There is an edge from B to C, so \[B\]\[C\] is 1.

  - C → D: There is an edge from C to D, so \[C\]\[D\] is 1.

  - D → A: There is an edge from D to A, so \[D\]\[A\] is 1.

### Example 3: Weighted Graph

Let’s consider a weighted graph, where the edges have weights representing distances between nodes.

#### Graph Diagram:

css

Copy code

4

A ———— B

\| \|

10 2

\| \|

C ———— D

5

- Vertices: {A, B, C, D}

- Weights: { (A-B, 4), (A-C, 10), (B-D, 2), (C-D, 5) }

#### Adjacency Matrix:

css

Copy code

A B C D

A \[0, 4, 10, 0\]

B \[4, 0, 0, 2\]

C \[10, 0, 0, 5\]

D \[0, 2, 5, 0\]

- **Explanation**:

  - A-B has a weight of 4, so \[A\]\[B\] and \[B\]\[A\] are 4.

  - A-C has a weight of 10, so \[A\]\[C\] and \[C\]\[A\] are 10.

  - B-D has a weight of 2, so \[B\]\[D\] and \[D\]\[B\] are 2.

  - C-D has a weight of 5, so \[C\]\[D\] and \[D\]\[C\] are 5.

  - Entries with 0 represent no connection between those vertices.

### Advantages of Adjacency Matrix:

1.  **Easy to implement**: Simple to represent and easy to check if two vertices are adjacent (connected by an edge).

2.  **Fast edge lookup**: You can quickly determine if an edge exists between two vertices in O(1) time by checking the matrix.

### Disadvantages of Adjacency Matrix:

1.  **Memory usage**: For large, sparse graphs (graphs with fewer edges), the adjacency matrix is inefficient since it requires O(n²) space, even if many entries are 0 (no edges).

2.  **Not ideal for sparse graphs**: If the graph has far fewer edges than vertices, an adjacency list is more memory efficient.

### Summary:

The adjacency matrix is a simple, compact way to represent a graph, especially when the graph is dense or when you need fast lookups of edge existence. However, it can become memory-intensive for large graphs with few edges. If you'd like to explore adjacency lists or graph algorithms, let me know!

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

The **Adjacency List** is another popular way to represent a graph. Unlike the **Adjacency Matrix**, which uses a 2D matrix, the **Adjacency List** uses a list of lists (or linked lists, arrays, etc.) where each node has a list of nodes it is connected to. This representation is more space-efficient for sparse graphs (graphs with fewer edges compared to vertices).

### Structure of Adjacency List:

- Each vertex has its own list of adjacent vertices (i.e., the vertices it is connected to).

- For **directed graphs**, the list for each vertex contains only the vertices it points to.

- For **undirected graphs**, if there is an edge between vertices u and v, then both u's list contains v and v's list contains u.

### Example 1: Undirected Graph

Let's take a simple undirected graph as an example.

#### Graph Diagram:

css

Copy code

A ——— B

\| /

\| /

C ——— D

- Vertices: {A, B, C, D}

- Edges: { (A-B), (A-C), (B-D), (C-D) }

#### Adjacency List Representation:

mathematica

Copy code

A: B, C

B: A, D

C: A, D

D: B, C

- **Explanation**:

  - A is connected to B and C, so A’s adjacency list contains B and C.

  - B is connected to A and D, so B’s list contains A and D.

  - C is connected to A and D, so C’s list contains A and D.

  - D is connected to B and C, so D’s list contains B and C.

### Example 2: Directed Graph

In a directed graph, edges have directions, meaning connections only exist from one vertex to another.

#### Graph Diagram:

css

Copy code

A → B

↑ ↓

D ← C

- Vertices: {A, B, C, D}

- Directed Edges: { (A → B), (B → C), (C → D), (D → A) }

#### Adjacency List Representation:

makefile

Copy code

A: B

B: C

C: D

D: A

- **Explanation**:

  - A has a directed edge to B, so A’s adjacency list contains only B.

  - B has a directed edge to C, so B’s list contains only C.

  - C has a directed edge to D, so C’s list contains only D.

  - D has a directed edge to A, so D’s list contains only A.

### Example 3: Weighted Graph

In a weighted graph, edges have weights representing distances or costs between vertices. In the adjacency list, each vertex will store both the adjacent vertex and the weight of the edge.

#### Graph Diagram:

css

Copy code

4

A ———— B

\| \|

10 2

\| \|

C ———— D

5

- Vertices: {A, B, C, D}

- Weights: { (A-B, 4), (A-C, 10), (B-D, 2), (C-D, 5) }

#### Adjacency List Representation:

mathematica

Copy code

A: (B, 4), (C, 10)

B: (A, 4), (D, 2)

C: (A, 10), (D, 5)

D: (B, 2), (C, 5)

- **Explanation**:

  - A is connected to B with a weight of 4, and C with a weight of 10, so A’s adjacency list contains (B, 4) and (C, 10).

  - B is connected to A with a weight of 4, and D with a weight of 2, so B’s list contains (A, 4) and (D, 2).

  - C is connected to A with a weight of 10, and D with a weight of 5, so C’s list contains (A, 10) and (D, 5).

  - D is connected to B with a weight of 2, and C with a weight of 5, so D’s list contains (B, 2) and (C, 5).

### Example 4: Cyclic vs. Acyclic Graphs

- **Cyclic Graph**: A graph with a cycle, i.e., where a node can be revisited.

- **Acyclic Graph**: A graph with no cycles.

#### Cyclic Graph Diagram:

css

Copy code

A → B

↑ ↓

D ← C

- **Adjacency List**:

> makefile
>
> Copy code
>
> A: B
>
> B: C
>
> C: D
>
> D: A

#### Acyclic Graph Diagram:

css

Copy code

A → B → C → D

- **Adjacency List**:

> makefile
>
> Copy code
>
> A: B
>
> B: C
>
> C: D
>
> D: \[\]

In a cyclic graph, starting from A, you can eventually loop back to A by traversing through B → C → D → A. In an acyclic graph, there’s no way to return to A once you start the traversal.

### Advantages of Adjacency List:

1.  **Space-efficient for sparse graphs**: It only stores the edges that exist, unlike the adjacency matrix, which requires space for all possible edges (even those that don’t exist).

    - **Space complexity**: O(V + E) where V is the number of vertices and E is the number of edges.

2.  **Faster edge iteration**: If you want to find all the neighbors of a vertex, the adjacency list provides direct access.

### Disadvantages of Adjacency List:

1.  **Edge lookup is slower**: To check if an edge exists between two vertices, you may need to search through the list of adjacent vertices, making it slower than the adjacency matrix, which can check for an edge in O(1) time.

2.  **Not ideal for dense graphs**: If the graph has a large number of edges (close to the maximum possible), an adjacency matrix might be more efficient.

### Summary:

- **Adjacency List** is a space-efficient way to represent a graph, especially when the graph is sparse (has few edges compared to vertices).

- It’s easy to store and iterate through all adjacent vertices for a given vertex, but checking for the existence of a specific edge can be slower.

- It’s particularly useful when you only care about storing the existing edges and don’t need to frequently query whether an edge exists between two nodes.

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Graph traversal is the process of visiting all the nodes (vertices) in a graph in a specific order. There are two primary methods of graph traversal:

1.  **Breadth-First Search (BFS)**: This explores the graph layer by layer, starting from a source vertex and visiting its neighbors before moving on to their neighbors.

2.  **Depth-First Search (DFS)**: This explores as far along a branch of the graph as possible before backtracking to explore other branches.

Both BFS and DFS are fundamental for solving various problems in graph theory, such as finding connected components, shortest paths, and detecting cycles.

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

**Breadth-First Search (BFS)** is a graph traversal algorithm that explores all the vertices of a graph layer by layer, starting from a given source vertex. It visits all the neighbors of the starting vertex first, then their neighbors, and so on, moving outward in breadth.

### Key Characteristics of BFS:

- **Level-wise exploration**: BFS explores vertices at the same level (distance from the starting vertex) before moving to the next level.

- **Queue-based implementation**: BFS uses a queue to keep track of vertices to explore.

- **Shortest Path**: BFS finds the shortest path in an unweighted graph, making it useful for such problems.

### BFS Algorithm:

1.  **Start** from a source node, mark it as visited.

2.  **Add** the source node to a queue.

3.  **While** the queue is not empty:

    - Dequeue a vertex from the front of the queue.

    - Visit all its unvisited adjacent vertices, mark them as visited, and enqueue them.

### BFS Example

Consider this graph as an example:

#### Graph Diagram:

mathematica

Copy code

A

/ \\

B C

/ \\ \\

D E F

- **Vertices**: {A, B, C, D, E, F}

- **Edges**: { (A-B), (A-C), (B-D), (B-E), (C-F) }

We will perform a BFS starting from vertex A.

#### Step-by-Step BFS Traversal:

1.  **Start at A**:

    - Mark A as visited: Visited = {A}

    - Enqueue A: Queue = \[A\]

2.  **Dequeue A**, visit its neighbors B and C:

    - Mark B and C as visited: Visited = {A, B, C}

    - Enqueue B and C: Queue = \[B, C\]

3.  **Dequeue B**, visit its neighbors D and E:

    - Mark D and E as visited: Visited = {A, B, C, D, E}

    - Enqueue D and E: Queue = \[C, D, E\]

4.  **Dequeue C**, visit its neighbor F:

    - Mark F as visited: Visited = {A, B, C, D, E, F}

    - Enqueue F: Queue = \[D, E, F\]

5.  **Dequeue D**: No new neighbors to visit.

6.  **Dequeue E**: No new neighbors to visit.

7.  **Dequeue F**: No new neighbors to visit.

### BFS Traversal Order: A → B → C → D → E → F

### BFS in Action: Visualization

#### Initial Graph:

mathematica

Copy code

A

/ \\

B C

/ \\ \\

D E F

#### BFS Traversal Steps:

1.  **Step 1**: Start from A, add B and C to the queue.

> css
>
> Copy code
>
> A → \[B, C\]

2.  **Step 2**: Dequeue B, add its neighbors D and E to the queue.

> css
>
> Copy code
>
> A → B → \[C, D, E\]

3.  **Step 3**: Dequeue C, add its neighbor F to the queue.

> css
>
> Copy code
>
> A → B → C → \[D, E, F\]

4.  **Step 4**: Dequeue D.

> css
>
> Copy code
>
> A → B → C → D → \[E, F\]

5.  **Step 5**: Dequeue E.

> css
>
> Copy code
>
> A → B → C → D → E → \[F\]

6.  **Step 6**: Dequeue F.

> css
>
> Copy code
>
> A → B → C → D → E → F → \[\]

#### Final BFS Traversal Order: A → B → C → D → E → F

### BFS in a Directed Graph:

In a **directed graph**, BFS works similarly, but it only follows directed edges.

#### Directed Graph Example:

mathematica

Copy code

A → B → C

↓

D → E

- **Vertices**: {A, B, C, D, E}

- **Directed Edges**: { (A→B), (B→C), (B→D), (D→E) }

#### BFS Traversal from A:

1.  **Start at A**: Visited = {A}, Queue = \[A\]

2.  **Dequeue A**, visit its neighbor B: Visited = {A, B}, Queue = \[B\]

3.  **Dequeue B**, visit its neighbors C and D: Visited = {A, B, C, D}, Queue = \[C, D\]

4.  **Dequeue C**: No new neighbors, Queue = \[D\]

5.  **Dequeue D**, visit its neighbor E: Visited = {A, B, C, D, E}, Queue = \[E\]

6.  **Dequeue E**: No new neighbors, Queue = \[\]

#### BFS Traversal Order: A → B → C → D → E

### BFS in a Weighted Graph:

BFS does **not** account for weights directly, so it is generally not used for weighted graphs when edge weights matter (for that, **Dijkstra's Algorithm** is used). However, if we ignore weights, BFS can still be applied.

### Applications of BFS:

1.  **Shortest Path in Unweighted Graph**:

    - BFS finds the shortest path from a source vertex to all other vertices in an unweighted graph.

2.  **Level-order Traversal**:

    - In trees, BFS is equivalent to level-order traversal, where nodes are visited level by level.

3.  **Cycle Detection in Undirected Graph**:

    - BFS can detect cycles by checking for previously visited nodes while exploring neighbors.

4.  **Finding Connected Components**:

    - BFS helps in identifying connected components in a graph.

5.  **Web Crawling**:

    - Web crawlers use BFS to explore hyperlinks in web pages, level by level.

6.  **Social Networking**:

    - BFS is used to find the shortest path between individuals in social networks (e.g., degrees of separation between two people).

### Time and Space Complexity:

1.  **Time Complexity**:

    - **BFS** visits each vertex and edge once, so the time complexity is:

      - O(V + E) where V is the number of vertices and E is the number of edges.

2.  **Space Complexity**:

    - BFS requires a queue to store vertices and an array to track visited vertices.

    - Space complexity: O(V) where V is the number of vertices.

### Advantages of BFS:

1.  **Finds shortest path** in an unweighted graph.

2.  It is easy to implement using a queue.

3.  Suitable for exploring level-wise connections (e.g., social networks, web crawling).

### Disadvantages of BFS:

1.  Requires more memory than DFS, especially for graphs with many nodes at each level.

2.  It may be slower on deep graphs compared to DFS due to the queue-based implementation.

### Summary:

- **BFS** explores a graph level by level, starting from a source node and visiting all its neighbors before moving on to the next level.

- It uses a **queue** to keep track of vertices, ensuring that all vertices at a certain level are explored before moving to the next.

- **Applications** include shortest path finding, web crawling, social network analysis, and cycle detection.

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

**Depth-First Search (DFS)** is a graph traversal algorithm that explores as far along each branch as possible before backtracking. DFS dives deep into the graph, going to the deepest level of a path before checking other branches. It uses a stack (either explicitly or through recursion) to keep track of vertices being explored.

### Key Characteristics of DFS:

- **Deep exploration**: DFS explores a path fully before backtracking and visiting other paths.

- **Stack-based implementation**: DFS can be implemented using an explicit stack or recursion.

- **Useful for problem-solving**: DFS is often used for tasks like detecting cycles, finding connected components, and topological sorting.

### DFS Algorithm (Recursive Approach):

1.  **Start** from a source node, mark it as visited.

2.  **Recursively** visit all its unvisited neighbors.

3.  **Backtrack** when there are no more neighbors to explore.

### DFS Algorithm (Iterative Approach):

1.  **Start** from a source node, push it onto the stack.

2.  **While** the stack is not empty:

    - Pop the top node from the stack.

    - Visit the node, mark it as visited.

    - Push all its unvisited neighbors onto the stack.

### DFS Example

Consider the following graph:

#### Graph Diagram:

mathematica

Copy code

A

/ \\

B C

/ \\ \\

D E F

- **Vertices**: {A, B, C, D, E, F}

- **Edges**: { (A-B), (A-C), (B-D), (B-E), (C-F) }

We will perform DFS starting from vertex A.

#### Step-by-Step DFS Traversal:

1.  **Start at A**:

    - Mark A as visited: Visited = {A}

    - Explore A's first neighbor, B.

2.  **Visit B**:

    - Mark B as visited: Visited = {A, B}

    - Explore B's first neighbor, D.

3.  **Visit D**:

    - Mark D as visited: Visited = {A, B, D}

    - No more neighbors to visit, so backtrack to B.

4.  **Backtrack to B**, visit B's second neighbor, E:

    - Mark E as visited: Visited = {A, B, D, E}

    - No more neighbors to visit, so backtrack to A.

5.  **Backtrack to A**, visit A's second neighbor, C:

    - Mark C as visited: Visited = {A, B, D, E, C}

    - Explore C's neighbor, F.

6.  **Visit F**:

    - Mark F as visited: Visited = {A, B, D, E, C, F}

    - No more neighbors to visit, traversal is complete.

#### DFS Traversal Order: A → B → D → E → C → F

### DFS in Action: Visualization

#### Initial Graph:

mathematica

Copy code

A

/ \\

B C

/ \\ \\

D E F

#### DFS Traversal Steps:

1.  **Step 1**: Start from A, explore B.

> css
>
> Copy code
>
> A → B

2.  **Step 2**: Explore B, go deeper to D.

> css
>
> Copy code
>
> A → B → D

3.  **Step 3**: Backtrack to B, explore E.

> css
>
> Copy code
>
> A → B → D → E

4.  **Step 4**: Backtrack to A, explore C.

> mathematica
>
> Copy code
>
> A → B → D → E → C

5.  **Step 5**: Explore C, go deeper to F.

> mathematica
>
> Copy code
>
> A → B → D → E → C → F

#### Final DFS Traversal Order: A → B → D → E → C → F

### DFS in a Directed Graph:

In a **directed graph**, DFS works similarly but follows directed edges only.

#### Directed Graph Example:

mathematica

Copy code

A → B → C

↓

D → E

- **Vertices**: {A, B, C, D, E}

- **Directed Edges**: { (A→B), (B→C), (B→D), (D→E) }

#### DFS Traversal from A:

1.  **Start at A**: Visited = {A}

2.  **Visit B**: Visited = {A, B}

3.  **Visit C**: Visited = {A, B, C}

4.  **Backtrack to B**, visit D: Visited = {A, B, C, D}

5.  **Visit E**: Visited = {A, B, C, D, E}

#### DFS Traversal Order: A → B → C → D → E

### DFS in a Weighted Graph:

DFS does **not** account for edge weights directly. It can be applied to weighted graphs, but for shortest path problems in weighted graphs, **Dijkstra's Algorithm** or **Bellman-Ford Algorithm** is preferred.

### Applications of DFS:

1.  **Cycle Detection**:

    - DFS can detect cycles in both directed and undirected graphs.

    - In a directed graph, if DFS encounters a back edge (an edge pointing to an ancestor in the recursion stack), a cycle is detected.

2.  **Connected Components**:

    - DFS can be used to identify all connected components in an undirected graph.

3.  **Topological Sorting**:

    - In a Directed Acyclic Graph (DAG), DFS helps in performing topological sorting by visiting nodes in a linearized order.

4.  **Solving Maze Problems**:

    - DFS can be used to explore all possible paths in maze problems and find solutions.

5.  **Path Finding**:

    - DFS is useful for finding any path between two vertices in a graph, though it may not find the shortest path.

### Time and Space Complexity:

1.  **Time Complexity**:

    - DFS visits each vertex and edge once, so the time complexity is:

      - O(V + E) where V is the number of vertices and E is the number of edges.

2.  **Space Complexity**:

    - In the worst case, the recursion stack or explicit stack will hold all vertices at a given time, so the space complexity is:

      - O(V) for the stack or recursion depth.

### Advantages of DFS:

1.  **Memory efficient**: DFS uses less memory compared to BFS, especially for deep graphs.

2.  **Useful for problem-solving**: It can detect cycles, find connected components, and solve maze-like problems.

### Disadvantages of DFS:

1.  **May not find the shortest path**: DFS is not guaranteed to find the shortest path in unweighted graphs.

2.  **Can get stuck in deep branches**: DFS can get "stuck" in deep paths if not used with backtracking or proper termination.

### Summary:

- **DFS** explores as deep into the graph as possible before backtracking to explore other paths.

- It can be implemented using recursion or an explicit stack.

- **Applications** include cycle detection, connected components, topological sorting, and pathfinding in graphs.

- DFS is more memory efficient than BFS, especially for deep graphs, but it may not always find the shortest path.
