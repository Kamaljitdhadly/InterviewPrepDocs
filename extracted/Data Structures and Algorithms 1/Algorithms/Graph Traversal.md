# Data Structures and Algorithms Graph Traversal

**Graph Traversal in Data Structures**

**Graph traversal** is the process of **visiting every vertex (node) and edge of a graph systematically**.

A graph may contain:

- **Vertices (Nodes)** → entities

- **Edges** → relationships between entities

Example:

A social network:

A

/ \\

B C

/ \\ \\

D E F

Nodes:

A, B, C, D, E, F

Edges:

A-B, A-C, B-D, B-E, C-F

Graph traversal helps us explore this structure.

**Why Do We Need Graph Traversal?**

Graph traversal is used for:

- Finding paths between nodes

- Detecting cycles

- Finding connected components

- Shortest path problems

- Network routing

- Dependency resolution

- Web crawling

- Social network analysis

- AI search algorithms

Examples:

- Google crawling websites

- GPS finding routes

- Finding friends of friends in social networks

**Two Main Graph Traversal Algorithms**

There are two fundamental ways to traverse a graph:

1.  **Breadth First Search (BFS)**

2.  **Depth First Search (DFS)**

**1. Breadth First Search (BFS)**

BFS explores the graph **level by level**.

It uses a:

Queue (FIFO)

**Example Graph**

A

/ \| \\

B C D

/ \\

E F

Starting from A:

Traversal:

A → B → C → D → E → F

Order:

Level 0:

A

Level 1:

B C D

Level 2:

E F

**BFS Algorithm Steps**

1.  Add starting node to queue.

2.  Mark it visited.

3.  Remove node from queue.

4.  Visit all its neighbors.

5.  Add unvisited neighbors to queue.

6.  Repeat until queue is empty.

**BFS Visualization**

Queue:

\[A\]

Remove A

Queue:

\[B,C,D\]

Remove B

Queue:

\[C,D,E,F\]

Remove C

Queue:

\[D,E,F\]

...

**BFS Implementation (C#)**

Using adjacency list:

void BFS(int start, Dictionary\<int,List\<int\>\> graph)

{

Queue\<int\> queue = new();

HashSet\<int\> visited = new();

queue.Enqueue(start);

visited.Add(start);

while(queue.Count \> 0)

{

int node = queue.Dequeue();

Console.WriteLine(node);

foreach(var neighbor in graph\[node\])

{

if(!visited.Contains(neighbor))

{

visited.Add(neighbor);

queue.Enqueue(neighbor);

}

}

}

}

**BFS Complexity**

For a graph:

- V = number of vertices

- E = number of edges

Time:

O(V + E)

Space:

O(V)

**Applications of BFS**

**1. Shortest Path in Unweighted Graph**

Example:

A -- B -- C -- D

BFS finds:

A → B → C → D

because it explores nearest nodes first.

**2. Level Order Traversal of Binary Tree**

Binary tree:

1

/ \\

2 3

/

4

BFS output:

1 2 3 4

**2. Depth First Search (DFS)**

DFS explores as deep as possible before backtracking.

It uses:

- Stack

- Or recursion

Example:

A

/ \| \\

B C D

/ \\

E F

Possible DFS:

A → B → E → F → C → D

It goes deep:

A

\|

B

\|

E

Then backtracks.

**DFS Algorithm Steps**

1.  Start from a node.

2.  Mark it visited.

3.  Visit one neighbor.

4.  Continue deeper.

5.  When no more neighbors:

    - Backtrack.

6.  Visit remaining neighbors.

**DFS Using Recursion**

void DFS(

int node,

Dictionary\<int,List\<int\>\> graph,

HashSet\<int\> visited)

{

visited.Add(node);

Console.WriteLine(node);

foreach(var neighbor in graph\[node\])

{

if(!visited.Contains(neighbor))

{

DFS(neighbor, graph, visited);

}

}

}

**DFS Complexity**

Time:

O(V + E)

Space:

O(V)

(recursion stack + visited)

**BFS vs DFS**

| **Feature**         | **BFS**                | **DFS**                |
|---------------------|------------------------|------------------------|
| Approach            | Level by level         | Go deep first          |
| Data structure      | Queue                  | Stack/Recursion        |
| Finds shortest path | Yes (unweighted)       | No                     |
| Memory              | Higher for wide graphs | Higher for deep graphs |
| Backtracking        | No                     | Yes                    |
| Used for            | Shortest path          | Cycle detection        |

**Graph Representation**

Before traversal, graphs need to be stored.

Two common ways:

**1. Adjacency Matrix**

2D array.

Example:

Graph:

A---B

\|

C

Matrix:

A B C

A 0 1 1

B 1 0 0

C 1 0 0

Advantages:

- Easy edge lookup

Disadvantages:

- Uses more memory

Space:

O(V²)

**2. Adjacency List**

Store neighbors.

Example:

A → B,C

B → A

C → A

Usually preferred.

Space:

O(V + E)

**Graph Traversal Problems**

**1. Detect Cycle**

Example:

A → B → C

↑ \|

----

DFS detects cycles using recursion stack.

**2. Connected Components**

Graph:

A--B C--D

There are:

2 connected components

Run DFS/BFS from every unvisited node.

**3. Topological Sorting**

Used for dependencies.

Example:

Software build:

Database

\|

Backend

\|

Frontend

Order:

Database → Backend → Frontend

Uses DFS.

**4. Path Finding**

Find route:

A → B → C → D

Uses BFS/DFS.

**BFS vs DFS Example**

Graph:

1

/ \| \\

2 3 4

/

5

**BFS:**

1

2 3 4

5

Output:

1 2 3 4 5

**DFS:**

1

\|

2

\|

5

then 3,4

Output:

1 2 5 3 4

**Advanced Graph Traversal Algorithms**

After BFS and DFS, many algorithms build on them:

| **Algorithm**    | **Purpose**                         |
|------------------|-------------------------------------|
| Dijkstra         | Shortest path with weights          |
| Bellman-Ford     | Shortest path with negative weights |
| Floyd-Warshall   | All-pairs shortest path             |
| Kruskal          | Minimum spanning tree               |
| Prim             | Minimum spanning tree               |
| Tarjan           | Strongly connected components       |
| Kahn's Algorithm | Topological sorting                 |

**Interview Explanation (Senior Developer)**

A good interview answer:

"Graph traversal is a technique to systematically visit nodes and edges in a graph. The two primary traversal algorithms are BFS and DFS. BFS uses a queue and explores nodes level by level, making it suitable for shortest path problems in unweighted graphs. DFS uses recursion or a stack and explores deeply before backtracking, making it useful for cycle detection, topological sorting, and connected components. Both have O(V+E) time complexity using an adjacency list."

For DSA preparation, the typical learning order is:

**Graph Representation → BFS → DFS → Cycle Detection → Topological Sort → Shortest Path Algorithms → Minimum Spanning Tree**.
