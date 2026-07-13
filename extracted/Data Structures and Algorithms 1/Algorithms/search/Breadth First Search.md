# Data Structures and Algorithms Breadth First Search

**Breadth First Search (BFS) in Data Structures and Algorithms**

**Breadth First Search (BFS)** is a graph traversal algorithm that visits nodes **level by level**.

The main idea:

**Explore all neighboring nodes first before moving to the next level.**

BFS uses a:

Queue (FIFO - First In First Out)

**Real-Life Example**

Imagine you are searching for a person in a social network.

You:

1.  First check your direct friends.

2.  Then check your friends' friends.

3.  Then check the next level.

Example:

You

/ \| \\

Bob Tom Sam

/ \\

John Mike

BFS order:

You → Bob → Tom → Sam → John → Mike

It explores by distance.

**Graph Example**

Consider this graph:

A

/ \\

B C

/ \\ \\

D E F

Starting from A.

**BFS Traversal**

**Level 0:**

A

**Level 1:**

B C

**Level 2:**

D E F

Final BFS order:

A → B → C → D → E → F

**How BFS Works**

BFS maintains:

1.  **Queue** → stores nodes to visit

2.  **Visited set** → prevents visiting the same node multiple times

Algorithm:

1\. Add starting node to queue

2\. Mark it visited

3\. Remove a node from queue

4\. Visit all unvisited neighbors

5\. Add neighbors to queue

6\. Repeat until queue is empty

**Step-by-Step Example**

Graph:

A

/ \\

B C

/ \\

D E

Start:

Queue: \[A\]

Visited: {A}

**Remove A**

Visit neighbors B and C.

Queue: \[B,C\]

Visited:

{A,B,C}

**Remove B**

Add D and E.

Queue:

\[C,D,E\]

**Remove C**

No new nodes.

Queue:

\[D,E\]

**Remove D**

Queue:

\[E\]

**Remove E**

Queue:

\[\]

Traversal:

A B C D E

**BFS Using Adjacency List**

Graphs are commonly stored as:

A → B,C

B → A,D,E

C → A

D → B

E → B

**BFS Algorithm Pseudocode**

BFS(graph, start)

create queue

create visited set

add start to queue

mark start visited

while queue is not empty:

node = remove from queue

process node

for every neighbor:

if neighbor not visited:

mark visited

add neighbor to queue

**BFS Implementation in C#**

void BFS(

Dictionary\<int, List\<int\>\> graph,

int start)

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

**Complexity Analysis**

For a graph:

- V = number of vertices

- E = number of edges

**Time Complexity**

Each node visited once:

O(V)

Each edge checked once:

O(E)

Total:

O(V + E)

**Space Complexity**

Queue stores nodes:

O(V)

Visited set:

O(V)

Total:

O(V)

**BFS in Binary Trees**

BFS is also called:

Level Order Traversal

Example:

1

/ \\

2 3

/ \\

4 5

BFS:

1 → 2 → 3 → 4 → 5

Implementation uses a queue:

Queue\<TreeNode\> queue = new();

queue.Enqueue(root);

while(queue.Count \> 0)

{

var node = queue.Dequeue();

Console.WriteLine(node.Value);

if(node.Left != null)

queue.Enqueue(node.Left);

if(node.Right != null)

queue.Enqueue(node.Right);

}

**Applications of BFS**

**1. Shortest Path in Unweighted Graph**

Example:

A -- B -- C -- D

Each edge has cost 1.

BFS finds:

A → B → C → D

Distance:

3 edges

Why?

Because BFS explores:

Distance 0

Distance 1

Distance 2

Distance 3

**2. Finding Connected Components**

Example:

A--B C--D

There are two groups.

Run BFS:

Start A → finds A,B

Start C → finds C,D

Result:

2 connected components

**3. Cycle Detection in Undirected Graph**

Example:

A --- B

\| \|

C ----

BFS can detect if a node is reached again through another path.

**4. Web Crawlers**

Search engines:

Website A

\|

+--\> Website B

\|

+--\> Website C

BFS discovers pages level by level.

**5. GPS and Navigation**

For simple maps:

Current location

\|

Nearby locations

\|

Farther locations

BFS finds minimum number of steps.

**BFS vs DFS**

| **Feature**         | **BFS**              | **DFS**                    |
|---------------------|----------------------|----------------------------|
| Full form           | Breadth First Search | Depth First Search         |
| Strategy            | Level by level       | Go deep first              |
| Data structure      | Queue                | Stack/Recursion            |
| Finds shortest path | Yes (unweighted)     | No                         |
| Memory              | More for wide graphs | More for deep graphs       |
| Backtracking        | No                   | Yes                        |
| Common use          | Shortest path        | Cycle detection, traversal |

**BFS vs Dijkstra**

| **BFS**                      | **Dijkstra**               |
|------------------------------|----------------------------|
| All edges have same weight   | Different positive weights |
| Uses Queue                   | Uses Priority Queue        |
| Faster for unweighted graphs | Handles weighted graphs    |
| O(V+E)                       | O((V+E)logV)               |

Example:

**BFS:**

A -- B -- C

Every edge cost = 1

**Dijkstra:**

A --5-- B

\|

2

\|

C

Different costs.

**BFS Variations**

**1. Multi-Source BFS**

Start BFS from multiple nodes.

Example:

Rotting oranges problem:

Rotten oranges spread every minute

All rotten oranges start together.

**2. Bidirectional BFS**

Search from:

- Source

- Destination

Meet in the middle.

Used for:

- Word Ladder

- Large graphs

**Common BFS Interview Problems**

| **Problem**            | **Concept**            |
|------------------------|------------------------|
| Level Order Traversal  | Tree BFS               |
| Shortest path in grid  | BFS                    |
| Word Ladder            | BFS                    |
| Rotting Oranges        | Multi-source BFS       |
| Number of Islands      | BFS/DFS                |
| Course Schedule        | BFS + Topological Sort |
| Binary Tree Right View | BFS                    |

**Interview Explanation (Senior Developer)**

"Breadth First Search is a graph traversal algorithm that explores nodes level by level using a queue. It starts from a source node, visits all immediate neighbors, then moves to the next level. BFS guarantees the shortest path in an unweighted graph because nodes are explored in increasing distance order. Its time complexity is O(V+E) and space complexity is O(V). It is widely used in shortest path problems, tree level traversal, network analysis, and dependency problems."

The typical graph learning order is:

Graph Representation

↓

BFS

↓

DFS

↓

Cycle Detection

↓

Topological Sort

↓

Shortest Path Algorithms

↓

Minimum Spanning Tree

BFS is one of the most fundamental graph algorithms and is a foundation for many advanced graph techniques.
