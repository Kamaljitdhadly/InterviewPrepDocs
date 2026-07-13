# Data Structures and Algorithms Depth First Search

**Depth First Search (DFS) in Data Structures and Algorithms**

**Depth First Search (DFS)** is a graph traversal algorithm that explores a graph by going **as deep as possible along one path before backtracking**.

The main idea:

**Go deep first, then come back and explore other branches.**

DFS uses:

- **Stack**

- Or **Recursion** (which internally uses the call stack)

**Real-Life Example**

Imagine exploring a maze.

You choose a path:

Start

\|

\|

Path 1

\|

\|

Dead End

When you reach a dead end:

Backtrack

and try another path.

This is exactly how DFS works.

**Graph Example**

Consider:

A

/ \\

B C

/ \\

D E

Starting from A.

**DFS Traversal**

Follow one branch completely:

A

\|

B

\|

D

No more nodes.

Backtrack:

B

\|

E

Then:

C

Final DFS order:

A → B → D → E → C

**How DFS Works**

DFS maintains:

1.  **Visited set** → tracks visited nodes

2.  **Stack** → remembers nodes to explore

Algorithm:

1\. Start from a node

2\. Mark it visited

3\. Visit one unvisited neighbor

4\. Continue deeper

5\. When no neighbor exists, backtrack

6\. Continue until all nodes are visited

**DFS Using Recursion**

The recursive idea:

DFS(node)

{

Mark node visited

For every neighbor:

if not visited:

DFS(neighbor)

}

**DFS Example Step-by-Step**

Graph:

A

/ \\

B C

/ \\

D E

Start:

DFS(A)

Visit A:

Visited:

A

Go to B:

Visited:

A,B

Go to D:

Visited:

A,B,D

D has no neighbors.

Backtrack to B.

Go to E:

Visited:

A,B,D,E

Backtrack to A.

Go to C:

Visited:

A,B,D,E,C

Final:

A → B → D → E → C

**DFS Implementation in C#**

Using adjacency list:

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

**Iterative DFS Using Stack**

Instead of recursion:

void DFSIterative(

Dictionary\<int,List\<int\>\> graph,

int start)

{

Stack\<int\> stack = new();

HashSet\<int\> visited = new();

stack.Push(start);

while(stack.Count \> 0)

{

int node = stack.Pop();

if(visited.Contains(node))

continue;

visited.Add(node);

Console.WriteLine(node);

foreach(var neighbor in graph\[node\])

{

stack.Push(neighbor);

}

}

}

**Complexity Analysis**

For graph:

- V = number of vertices

- E = number of edges

**Time Complexity**

Every node visited once:

O(V)

Every edge checked once:

O(E)

Total:

O(V + E)

**Space Complexity**

Visited set:

O(V)

Stack:

O(V)

Total:

O(V)

**DFS in Binary Trees**

DFS is commonly used for tree traversal.

Tree:

1

/ \\

2 3

/ \\

4 5

DFS traversals:

**1. Preorder**

Order:

Root → Left → Right

Output:

1 2 4 5 3

**2. Inorder**

Order:

Left → Root → Right

Output:

4 2 5 1 3

**3. Postorder**

Order:

Left → Right → Root

Output:

4 5 2 3 1

**Applications of DFS**

**1. Cycle Detection**

Example:

A → B → C

↑ \|

\|\_\_\_\|

DFS detects that C points back to an already visited node.

Used in:

- Dependency checking

- Build systems

- Package managers

**2. Topological Sorting**

Used for:

- Course scheduling

- Build order

- Deployment dependencies

Example:

Database

↓

Backend

↓

Frontend

DFS order:

Database → Backend → Frontend

**3. Finding Connected Components**

Graph:

A---B

C---D

Run DFS:

Start A:

A,B

Start C:

C,D

Result:

2 connected components

**4. Maze Solving**

Maze:

Start

\|

Path

\|

Dead end

\|

Backtrack

DFS tries paths recursively.

**5. Finding Islands in Matrix**

Example:

1 1 0

0 1 0

1 0 1

DFS visits connected 1s.

Used in:

- Number of islands problem

- Image processing

**DFS vs BFS**

| **Feature**    | **DFS**               | **BFS**              |
|----------------|-----------------------|----------------------|
| Full form      | Depth First Search    | Breadth First Search |
| Approach       | Go deep first         | Level by level       |
| Data structure | Stack                 | Queue                |
| Implementation | Recursion/Stack       | Queue                |
| Shortest path  | No                    | Yes (unweighted)     |
| Memory         | Lower for wide graphs | Higher               |
| Backtracking   | Yes                   | No                   |

**DFS vs Backtracking**

They look similar but differ.

**DFS**

Traversal:

Visit node

↓

Explore neighbors

Example:

Graph traversal

**Backtracking**

Decision making:

Choose

↓

Explore

↓

Undo choice

Example:

Sudoku

N-Queens

Permutations

**DFS vs Dijkstra**

| **DFS**         | **Dijkstra**        |
|-----------------|---------------------|
| Traversal       | Shortest path       |
| Ignores weights | Uses weights        |
| Uses stack      | Uses priority queue |
| O(V+E)          | O((V+E)logV)        |

**Common DFS Interview Problems**

| **Problem**           | **Concept**         |
|-----------------------|---------------------|
| Binary Tree Traversal | Recursive DFS       |
| Number of Islands     | Matrix DFS          |
| Detect Cycle          | DFS + visited state |
| Topological Sort      | DFS stack           |
| Clone Graph           | DFS traversal       |
| Path Sum              | Tree DFS            |
| Generate Permutations | DFS + Backtracking  |

**DFS with Three States (Advanced)**

Used for cycle detection in directed graphs.

Nodes have states:

0 = Not visited

1 = Currently visiting

2 = Completed

Example:

A → B → C

↑

\|

If DFS finds a node with state 1, there is a cycle.

**Interview Explanation (Senior Developer)**

"Depth First Search is a graph traversal algorithm that explores as far as possible along each branch before backtracking. It can be implemented using recursion or an explicit stack. DFS is commonly used for cycle detection, topological sorting, connected components, path finding, and tree traversal. Its time complexity is O(V+E) and space complexity is O(V)."

The graph algorithm learning path:

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

DFS is one of the core algorithms behind many advanced graph and AI search techniques.
