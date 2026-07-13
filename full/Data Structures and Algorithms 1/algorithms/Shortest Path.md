# Data Structures and Algorithms Shortest Path

**Shortest Path in Data Structures and Algorithms**

The **Shortest Path** problem is about finding the **minimum cost path between two nodes in a graph**.

The "cost" can mean:

- Distance

- Time

- Money

- Number of hops

- Network latency

Example:

A road network:

4

A -------- B

\| \|

2\| \|3

\| \|

C -------- D

1

Find the shortest path from **A to D**.

Possible paths:

A → B → D

Cost = 4 + 3 = 7

A → C → D

Cost = 2 + 1 = 3

Shortest path:

A → C → D

Cost = 3

**Types of Shortest Path Problems**

There are mainly four categories:

1.  **Single Source Shortest Path**

    - Find shortest paths from one source node to all other nodes.

> Example:
>
> A → all nodes

2.  **Single Pair Shortest Path**

    - Find shortest path between two specific nodes.

> Example:
>
> A → D

3.  **Single Destination Shortest Path**

    - Find shortest paths from all nodes to one destination.

4.  **All Pairs Shortest Path**

    - Find shortest paths between every pair of nodes.

**Graph Types Matter**

The algorithm depends on graph properties.

| **Graph Type**   | **Algorithm**                 |
|------------------|-------------------------------|
| Unweighted graph | BFS                           |
| Positive weights | Dijkstra                      |
| Negative weights | Bellman-Ford                  |
| All pairs        | Floyd-Warshall                |
| DAG graph        | Topological Sort + Relaxation |

**1. BFS Shortest Path (Unweighted Graph)**

If every edge has the same weight:

A -- B -- C -- D

Each edge cost:

1

BFS gives the shortest path because it explores level by level.

**Example**

A

/ \\

B C

/

D

Starting from A:

Level 0:

A

Level 1:

B C

Level 2:

D

Distance:

A → D = 2

**BFS Complexity**

Time:

O(V + E)

Space:

O(V)

**2. Dijkstra's Algorithm**

The most famous shortest path algorithm.

Used when:

- Edge weights are positive

- Need shortest distance from one source

Example:

5

A -------- B

\| \|

2 1

\| \|

C -------- D

3

Find shortest paths from A.

**Dijkstra Idea**

Dijkstra follows a greedy approach:

Always choose the unvisited node with the smallest known distance.

**Steps**

**Step 1: Initialize distances**

A = 0

B = ∞

C = ∞

D = ∞

**Step 2: Visit A**

Neighbors:

B = 5

C = 2

Now:

A = 0

C = 2

B = 5

**Step 3: Pick C**

Because:

C = 2

Update D:

D = 2 + 3 = 5

**Step 4: Pick B/D**

Final:

A = 0

C = 2

B = 5

D = 5

**Dijkstra Implementation Concept**

Usually uses:

- Priority Queue (Min Heap)

- Visited set

- Distance array

Pseudo-code:

distance\[source\] = 0

while nodes exist:

current = node with minimum distance

for each neighbor:

calculate new distance

if new distance is smaller:

update distance

**Complexity**

Using priority queue:

O((V + E) log V)

**Important Limitation of Dijkstra**

Dijkstra does NOT work with negative weights.

Example:

A → B = 5

A → C = 2

C → B = -10

Dijkstra may incorrectly finalize B before discovering the cheaper path.

**3. Bellman-Ford Algorithm**

Used when graph contains:

- Negative edge weights

Example:

A → B = 5

B → C = -3

**Bellman-Ford Idea**

Relax all edges repeatedly.

Relaxation means:

Try improving distance.

Formula:

if(distance\[u\] + weight \< distance\[v\])

update distance\[v\]

Example:

A → B = 5

B → C = 3

Initial:

A = 0

B = ∞

C = ∞

After relaxation:

B = 5

C = 8

**Complexity**

Time:

O(VE)

Slower than Dijkstra.

**Detecting Negative Cycles**

Bellman-Ford can detect:

A → B → C → A

where total weight keeps decreasing.

Example:

A → B = 5

B → C = -10

C → A = 2

Total:

5 - 10 + 2 = -3

The path can decrease forever.

**4. Floyd-Warshall Algorithm**

Used for:

Shortest paths between every pair of nodes

Example:

For:

A, B, C, D

Find:

A → B

A → C

A → D

B → A

B → C

...

**Idea**

Try every node as an intermediate point.

Formula:

distance\[i\]\[j\] =

min(

distance\[i\]\[j\],

distance\[i\]\[k\] + distance\[k\]\[j\]

)

Example:

Before:

A → C = 10

But:

A → B = 3

B → C = 4

New:

A → C = 7

**Complexity**

Time:

O(V³)

Space:

O(V²)

**5. Shortest Path in DAG**

A Directed Acyclic Graph can be solved efficiently.

Steps:

1.  Perform topological sorting.

2.  Relax edges in order.

Complexity:

O(V + E)

**BFS vs Dijkstra vs Bellman-Ford**

| **Feature**    | **BFS**         | **Dijkstra**     | **Bellman-Ford** |
|----------------|-----------------|------------------|------------------|
| Graph          | Unweighted      | Positive weights | Negative weights |
| Strategy       | Level traversal | Greedy           | Relaxation       |
| Data Structure | Queue           | Priority Queue   | Array            |
| Negative edges | No              | No               | Yes              |
| Complexity     | O(V+E)          | O((V+E)logV)     | O(VE)            |

**Shortest Path Algorithms in Real Life**

**Google Maps**

Uses:

- Dijkstra variants

- A\* algorithm

- Road network optimizations

**Internet Routing**

Uses:

- Shortest path algorithms

- Link-state routing

Example:

Router A → Router B

**Games**

Finding path for characters:

Player

\|

Enemy

Uses:

- BFS

- A\*

- Dijkstra

**A\* Algorithm (Advanced)**

A\* improves Dijkstra using a heuristic.

Formula:

f(n) = g(n) + h(n)

Where:

- g(n) = cost already traveled

- h(n) = estimated remaining cost

Used in:

- Games

- Maps

- Robotics

**Shortest Path Interview Patterns**

| **Problem**                | **Algorithm**  |
|----------------------------|----------------|
| Minimum steps in grid      | BFS            |
| Network delay time         | Dijkstra       |
| Cheapest flight with stops | BFS/Dijkstra   |
| Negative weights           | Bellman-Ford   |
| All city distances         | Floyd-Warshall |
| Word ladder                | BFS            |
| Maze shortest route        | BFS            |

**Interview Explanation (Senior Developer)**

"Shortest path algorithms find the minimum-cost path between vertices in a graph. The choice of algorithm depends on graph characteristics. BFS is used for unweighted graphs, Dijkstra handles positive weighted graphs using a priority queue, Bellman-Ford supports negative weights and detects negative cycles, while Floyd-Warshall solves all-pairs shortest path problems. The core concept in weighted algorithms is edge relaxation, where we repeatedly try to improve the known shortest distances."

A typical DSA learning path after graphs is:

Graph Representation

↓

BFS / DFS

↓

Shortest Path

↓

Minimum Spanning Tree

↓

Advanced Graph Algorithms

Shortest path algorithms are among the most important graph topics for senior software engineering interviews.
