# Data Structures and Algorithms Topological Sort

**Topological Sort in Data Structures and Algorithms**

**Topological Sort** is an ordering of the vertices (nodes) of a **Directed Acyclic Graph (DAG)** such that:

For every directed edge u → v, node u appears before node v in the ordering.

In simple words:

**A task must appear before the tasks that depend on it.**

**Real-Life Example: Task Dependencies**

Suppose you are building software.

Dependencies:

Design UI

↓

Develop Frontend

↓

Deploy Application

You cannot:

Deploy → Develop → Design

because deployment depends on development.

A valid topological order:

Design UI → Develop Frontend → Deploy Application

**Important Rule**

Topological sorting works only for:

Directed Acyclic Graph (DAG)

Meaning:

**Directed**

Edges have direction:

A → B

means:

A must happen before B

**Acyclic**

No cycles.

Valid:

A → B → C

Invalid:

A → B → C

↑ \|

\|\_\_\_\_\_\_\_\|

because there is no possible starting point.

**Example Graph**

Consider:

A

/ \\

↓ ↓

B C

\\ /

↓

D

Edges:

A → B

A → C

B → D

C → D

Possible topological orders:

A B C D

or

A C B D

Both are correct.

**Where is Topological Sort Used?**

Common applications:

- Build systems

- Package dependency management

- Course scheduling

- Project planning

- Compilation order

- Deployment pipelines

- Workflow engines

Example:

.NET package dependencies:

Newtonsoft.Json

↓

Your Application

↓

Deployment

**Approaches for Topological Sort**

There are two common algorithms:

1.  **Kahn's Algorithm (BFS approach)**

2.  **DFS based approach**

**1. Kahn's Algorithm (BFS)**

Kahn's algorithm uses:

- Queue

- Indegree count

**What is Indegree?**

**Indegree = Number of incoming edges to a node**

Example:

A → B

C → B

For B:

Indegree(B) = 2

because two edges are coming into B.

**Example**

Graph:

A

/ \\

↓ ↓

B C

\\ /

↓

D

Indegree table:

| **Node** | **Indegree** |
|----------|--------------|
| A        | 0            |
| B        | 1            |
| C        | 1            |
| D        | 2            |

**Kahn's Algorithm Steps**

**Step 1: Find nodes with indegree 0**

A

Add to queue.

**Step 2: Remove A**

Order:

A

Reduce neighbors:

B: 1 → 0

C: 1 → 0

Add:

B, C

**Step 3: Remove B and C**

Order:

A B C

Reduce D:

D: 2 → 0

**Step 4: Remove D**

Final order:

A B C D

**Kahn's Algorithm C# Implementation**

List\<int\> TopologicalSort(

Dictionary\<int,List\<int\>\> graph,

int vertices)

{

int\[\] indegree = new int\[vertices\];

foreach(var node in graph)

{

foreach(var neighbor in node.Value)

{

indegree\[neighbor\]++;

}

}

Queue\<int\> queue = new();

for(int i=0;i\<vertices;i++)

{

if(indegree\[i\]==0)

queue.Enqueue(i);

}

List\<int\> result = new();

while(queue.Count \> 0)

{

int node = queue.Dequeue();

result.Add(node);

foreach(var neighbor in graph\[node\])

{

indegree\[neighbor\]--;

if(indegree\[neighbor\]==0)

{

queue.Enqueue(neighbor);

}

}

}

return result;

}

**Complexity of Kahn's Algorithm**

Time:

O(V + E)

Space:

O(V)

where:

- V = vertices

- E = edges

**Cycle Detection Using Kahn's Algorithm**

Important property:

If after processing:

result.Count != number of vertices

then the graph contains a cycle.

Example:

A → B → C

↑ \|

\|\_\_\_\_\_\_\_\|

No node has indegree 0.

Queue is empty.

Therefore:

Topological sort impossible

**2. DFS Based Topological Sort**

DFS approach uses:

- Recursion

- Stack

Idea:

Put a node into the stack only after visiting all its dependencies.

Example:

A → B → C

DFS:

Visit A

Visit B

Visit C

Add C

Add B

Add A

Stack:

C B A

Reverse:

A B C

**DFS Implementation**

void DFS(

int node,

Dictionary\<int,List\<int\>\> graph,

bool\[\] visited,

Stack\<int\> stack)

{

visited\[node\] = true;

foreach(var neighbor in graph\[node\])

{

if(!visited\[neighbor\])

{

DFS(neighbor, graph, visited, stack);

}

}

stack.Push(node);

}

After DFS:

while(stack.Count \> 0)

{

Console.Write(stack.Pop());

}

**DFS Complexity**

Time:

O(V + E)

Space:

O(V)

**Kahn vs DFS Topological Sort**

| **Feature**     | **Kahn**  | **DFS**                     |
|-----------------|-----------|-----------------------------|
| Approach        | BFS       | DFS                         |
| Uses            | Queue     | Stack                       |
| Uses indegree   | Yes       | No                          |
| Cycle detection | Easy      | Requires recursion tracking |
| Implementation  | Iterative | Recursive                   |

**Example: Course Schedule Problem**

Courses:

0 → 1

1 → 2

Meaning:

Course 0 must be completed before Course 1

Graph:

0

↓

1

↓

2

Topological order:

0 → 1 → 2

**Example: Build Pipeline**

Microservices:

Database Migration

↓

Backend Service

↓

API Gateway

↓

Frontend

Deployment order:

Database

Backend

API Gateway

Frontend

This is a topological sort problem.

**Topological Sort vs Shortest Path**

| **Topological Sort**    | **Shortest Path**        |
|-------------------------|--------------------------|
| Ordering nodes          | Finding minimum distance |
| Used in DAGs            | Used in weighted graphs  |
| Dependency problems     | Routing problems         |
| No distance calculation | Calculates cost          |

**Topological Sort vs Tree Traversal**

Tree:

A

/ \\

B C

Tree has no cycles, but usually has one parent.

Graph:

A → B

C → B

A node can have multiple dependencies.

**Common Interview Problems**

| **Problem**          | **Concept**                 |
|----------------------|-----------------------------|
| Course Schedule      | Cycle detection + topo sort |
| Course Schedule II   | Find ordering               |
| Alien Dictionary     | Topological sorting         |
| Build order          | Dependencies                |
| Task scheduling      | DAG ordering                |
| Package installation | Dependency resolution       |

**Interview Explanation (Senior Developer)**

"Topological sort is an ordering of vertices in a directed acyclic graph where every node appears before its dependent nodes. It is commonly used for dependency resolution problems. It can be implemented using Kahn's algorithm, which uses indegree and BFS, or using DFS with a stack. Both approaches have O(V+E) time complexity. If a directed graph contains a cycle, topological sorting is not possible."

The graph algorithm learning path usually continues:

Graph Representation

↓

BFS / DFS

↓

Topological Sort

↓

Shortest Path Algorithms

↓

Minimum Spanning Tree

↓

Advanced Graph Algorithms

Topological sort is one of the most important graph algorithms because many real-world systems are dependency-driven.
