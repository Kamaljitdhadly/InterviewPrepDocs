# Data Structures and Algorithms Graph

A **Graph** is a **non-linear data structure** that represents relationships between different entities.

A graph consists of:

1.  **Vertices (Nodes)** → The entities.

2.  **Edges** → The connections between entities.

# Real-Life Example

Think about a social network.

People are **nodes**:

Amit

Rahul

Priya

John

Friendships are **edges**:

Amit

/ \\

Rahul Priya

\\

John

Here:

- People = Vertices

- Friend connections = Edges

# Graph Terminology

## 1. Vertex (Node)

A single entity in a graph.

Example:

A ---- B

A and B are vertices.

------------------------------------------------------------------------

## 2. Edge

A connection between two vertices.

Example:

A -------- B

The line between A and B is an edge.

------------------------------------------------------------------------

## 3. Adjacent Vertices

Two vertices connected by an edge.

Example:

A ---- B ---- C

A and B are adjacent.

B and C are adjacent.

------------------------------------------------------------------------

## 4. Degree

Number of edges connected to a vertex.

Example:

B

\|

A ---- C ---- D

\|

E

Degree of C:

4

because C has four connections.

------------------------------------------------------------------------

## 5. Path

A sequence of vertices connected by edges.

Example:

A → B → C → D

This is a path from A to D.

------------------------------------------------------------------------

## 6. Cycle

A path that starts and ends at the same vertex.

Example:

A

/ \\

B---C

Path:

A → B → C → A

This forms a cycle.

------------------------------------------------------------------------

# Graph Representation

There are two common ways to store graphs.

------------------------------------------------------------------------

# 1. Adjacency Matrix

A graph is stored as a 2D array.

Example graph:

A

/ \\

B---C

Matrix:

A B C

----------

A \| 0 1 1

B \| 1 0 1

C \| 1 1 0

Meaning:

1 = connection exists

0 = no connection

------------------------------------------------------------------------

### Advantages

- Very fast edge lookup.

- Simple implementation.

Checking:

"Is A connected to C?"

matrix\[A\]\[C\]

Time:

O(1)

------------------------------------------------------------------------

### Disadvantages

- Uses more memory.

For V vertices:

Space = O(V²)

Even if there are very few edges.

------------------------------------------------------------------------

# 2. Adjacency List

Stores only existing connections.

Example:

A → B → C

B → A → C

C → A → B

------------------------------------------------------------------------

### Advantages

- Uses less memory.

- Good for sparse graphs.

Space:

O(V + E)

where:

- V = vertices

- E = edges

# Types of Graphs

------------------------------------------------------------------------

# 1. Undirected Graph

Edges have no direction.

Example:

Friendship:

A -------- B

means:

A is friend of B

B is friend of A

------------------------------------------------------------------------

# 2. Directed Graph

Edges have direction.

Example:

Twitter follow:

A -----\> B

Means:

A follows B

but B may not follow A.

------------------------------------------------------------------------

# 3. Weighted Graph

Edges have values (weights).

Example:

Road network:

A ----10km---- B

Weight:

Distance = 10 km

Used in:

- GPS

- Network routing

# 4. Unweighted Graph

Edges have no values.

Example:

A ---- B

Only connection matters.

------------------------------------------------------------------------

# 5. Cyclic Graph

Contains a cycle.

Example:

A → B → C → A

------------------------------------------------------------------------

# 6. Acyclic Graph

No cycles.

Example:

A → B → C

------------------------------------------------------------------------

# 7. Connected Graph

Every node can reach every other node.

Example:

A ---- B

\| \|

C ---- D

All nodes are connected.

------------------------------------------------------------------------

# 8. Disconnected Graph

Some nodes are isolated.

Example:

A ---- B

C ---- D

Two separate components.

------------------------------------------------------------------------

# Tree vs Graph

A tree is actually a special type of graph.

| **Feature**  | **Tree**             | **Graph**             |
|--------------|----------------------|-----------------------|
| Structure    | Hierarchical         | General relationships |
| Root         | Always exists        | Not required          |
| Cycles       | Not allowed          | Can exist             |
| Edges        | V-1                  | Any number            |
| Direction    | Usually parent-child | Directed/Undirected   |
| Connectivity | Always connected     | May be disconnected   |

Example:

Tree:

A

/ \\

B C

Graph:

A ---- B

\| \|

C ---- D

------------------------------------------------------------------------

# Graph Traversal Algorithms

Traversal means visiting all nodes.

Two major approaches:

------------------------------------------------------------------------

# 1. Breadth First Search (BFS)

BFS explores level by level.

Uses:

Queue

Example:

A

/ \\

B C

/

D

Traversal:

A → B → C → D

------------------------------------------------------------------------

### BFS Algorithm

1.  Start from a node.

2.  Add it to queue.

3.  Visit neighbors.

4.  Repeat.

Complexity:

O(V + E)

------------------------------------------------------------------------

# 2. Depth First Search (DFS)

DFS goes as deep as possible before backtracking.

Uses:

Stack

or recursion.

Example:

A

/ \\

B C

/

D

Traversal:

A → B → D → C

Complexity:

O(V + E)

------------------------------------------------------------------------

# Shortest Path Algorithms

## 1. Dijkstra Algorithm

Finds shortest path from one node.

Example:

Google Maps:

Home → Office

Uses:

- Weighted graphs

- Non-negative weights

Complexity:

O((V+E) log V)

------------------------------------------------------------------------

## 2. Bellman-Ford Algorithm

Handles negative weights.

Example:

Financial transaction networks.

Complexity:

O(VE)

------------------------------------------------------------------------

## 3. Floyd-Warshall Algorithm

Finds shortest paths between all pairs.

Complexity:

O(V³)

------------------------------------------------------------------------

# Minimum Spanning Tree Algorithms

Used to connect all nodes with minimum cost.

## 1. Kruskal Algorithm

Uses:

- Sorting edges

- Union-Find data structure

## 2. Prim Algorithm

Uses:

- Priority Queue

- Heap

# Graph Implementation in C#

## Using Adjacency List

using System;

using System.Collections.Generic;

class Graph

{

Dictionary\<int, List\<int\>\> adj =

new Dictionary\<int, List\<int\>\>();

public void AddEdge(int source, int destination)

{

if (!adj.ContainsKey(source))

adj\[source\] = new List\<int\>();

adj\[source\].Add(destination);

}

}

------------------------------------------------------------------------

# Real-World Applications

## 1. Social Networks

Users = Nodes

Friendships = Edges

------------------------------------------------------------------------

## 2. Google Maps

Cities = Nodes

Roads = Edges

Distance = Weight

------------------------------------------------------------------------

## 3. Internet Networks

Routers = Nodes

Connections = Edges

------------------------------------------------------------------------

## 4. Recommendation Systems

Example:

User → Movie → Actor

------------------------------------------------------------------------

## 5. Dependency Management

Example:

Software packages:

App

\|

+-- Library A

\|

+-- Library B

------------------------------------------------------------------------

## 6. Microservices Architecture

Example:

Order Service

\|

\|

Payment Service

\|

\|

Notification Service

Services and communication channels can be represented as graphs.

------------------------------------------------------------------------

# Common Interview Questions

1.  What is a graph data structure?

2.  Difference between tree and graph?

3.  Difference between BFS and DFS?

4.  What is adjacency matrix?

5.  What is adjacency list?

6.  When would you use BFS over DFS?

7.  How do you detect cycles in a graph?

8.  Explain Dijkstra's algorithm.

9.  What is a weighted graph?

10. What is a directed graph?

# Summary

| **Feature**  | **Graph**                    |
|--------------|------------------------------|
| Type         | Non-linear data structure    |
| Components   | Vertices + Edges             |
| Represents   | Relationships                |
| Direction    | Directed / Undirected        |
| Weight       | Weighted / Unweighted        |
| Storage      | Matrix / Adjacency List      |
| Traversal    | BFS, DFS                     |
| Applications | Maps, Networks, Social Media |

------------------------------------------------------------------------

## Key Takeaways

- A **Graph represents relationships between objects**.

- It consists of **vertices (nodes)** and **edges (connections)**.

- Graphs can be directed, undirected, weighted, or unweighted.

- **BFS uses Queue**, while **DFS uses Stack/Recursion**.

- Graph algorithms power real-world systems like **Google Maps, social networks, recommendation engines, and network routing**.
