# Data Structures and Algorithms Disjoint Set

**Disjoint Set (Union-Find) Data Structure**

A **Disjoint Set** is a data structure used to manage a collection of **non-overlapping (disjoint) sets**.

It is also called:

- **Union-Find**

- **DSU (Disjoint Set Union)**

The main purpose:

**Efficiently track groups and determine whether two elements belong to the same group.**

**Real-Life Example**

Imagine students in a school.

Initially, every student is in their own group:

{A} {B} {C} {D} {E}

If A and B become friends:

{A,B} {C} {D} {E}

If C and D become friends:

{A,B} {C,D} {E}

Now we can ask:

Are A and B in the same group?

Answer:

Yes

Are A and C in the same group?

Answer:

No

This is exactly what Disjoint Set solves.

**Main Operations**

A Disjoint Set has two primary operations:

1.  **Find**

2.  **Union**

**1. Find Operation**

The **Find** operation tells which set an element belongs to.

Example:

{A,B,C}

{D,E}

Find(A):

Group 1

Find(D):

Group 2

Usually, each group has a representative element called the **root/parent**.

**2. Union Operation**

The **Union** operation merges two sets.

Example:

Before:

{A,B}

{C,D}

Union(A,C):

After:

{A,B,C,D}

**How Disjoint Set Works Internally**

Initially:

Each element is its own parent.

Example:

Elements:

0 1 2 3 4

Parent array:

Index: 0 1 2 3 4

Parent: 0 1 2 3 4

Meaning:

0 → itself

1 → itself

2 → itself

Each element is a separate set.

**Performing Union**

Union(0,1)

Make 1's parent as 0:

Parent:

0 1 2 3 4

0 0 2 3 4

Structure:

0

/

1

Union(2,3)

Parent:

0 0 2 2 4

Structure:

2

/

3

Now we have:

{0,1}

{2,3}

{4}

**Find Operation**

Find(1):

Follow parent:

1 → 0

Root:

0

Find(3):

3 → 2

Root:

2

**Problem: Long Chains**

A bad union can create a chain:

5

\|

4

\|

3

\|

2

\|

1

\|

0

Finding 5 requires traversing many nodes.

Complexity:

O(n)

To solve this, we use optimizations.

**Optimization 1: Path Compression**

Path compression makes future searches faster.

Before:

5

\|

4

\|

3

\|

2

\|

1

\|

0

Find(5):

After compression:

0

/ / \| \\ \\

1 2 3 4 5

Now every node directly points to root.

Future Find operations become much faster.

**Optimization 2: Union by Rank / Size**

When merging two sets:

Do not attach a bigger tree under a smaller tree.

Instead:

Attach the smaller tree below the larger tree.

Example:

Before:

Set A:

1

/ \\

2 3

Set B:

4

/

5

Set A is bigger.

Attach B under A:

1

/ \| \\

2 3 4

\|

5

This keeps height small.

**Time Complexity**

With both optimizations:

- Path Compression

- Union by Rank

Operations are almost constant time.

| **Operation** | **Complexity** |
|---------------|----------------|
| Find          | O(α(n))        |
| Union         | O(α(n))        |

Where:

α(n) = Inverse Ackermann function

For all practical purposes:

α(n) ≈ O(1)

**Implementation in C#**

class DisjointSet

{

private int\[\] parent;

private int\[\] rank;

public DisjointSet(int n)

{

parent = new int\[n\];

rank = new int\[n\];

for(int i = 0; i \< n; i++)

{

parent\[i\] = i;

rank\[i\] = 0;

}

}

public int Find(int x)

{

if(parent\[x\] != x)

{

parent\[x\] = Find(parent\[x\]);

}

return parent\[x\];

}

public void Union(int x, int y)

{

int rootX = Find(x);

int rootY = Find(y);

if(rootX == rootY)

return;

if(rank\[rootX\] \< rank\[rootY\])

{

parent\[rootX\] = rootY;

}

else if(rank\[rootX\] \> rank\[rootY\])

{

parent\[rootY\] = rootX;

}

else

{

parent\[rootY\] = rootX;

rank\[rootX\]++;

}

}

}

**Example Usage**

DisjointSet ds = new DisjointSet(5);

ds.Union(0,1);

ds.Union(1,2);

Console.WriteLine(ds.Find(0));

Console.WriteLine(ds.Find(2));

Output:

0

0

Because:

0,1,2

are in the same set.

**Applications of Disjoint Set**

**1. Kruskal's Algorithm (Minimum Spanning Tree)**

This is the most famous use.

Problem:

Connect cities with minimum cost.

Example:

City A ---- City B

\\ /

\\ /

City C

Disjoint Set helps detect cycles.

Before adding an edge:

Are these cities already connected?

If yes:

Adding edge creates a cycle

Skip it.

**2. Cycle Detection in Graphs**

Example:

Graph:

A ---- B

\| \|

C ---- D

When adding edge:

C ---- D

Check:

Find(C) == Find(D)

If true:

Cycle exists

**3. Network Connectivity**

Example:

Computers connected in a network:

Computer1

\|

Computer2

Questions:

"Can computer A communicate with computer B?"

Use:

Find(A) == Find(B)

**4. Social Networks**

Groups of connected users:

User A

\|

User B

\|

User C

Find communities.

**5. Image Processing**

Finding connected regions:

Example:

1 1 0

1 0 0

0 0 1

Identify separate objects.

**Disjoint Set vs Graph Traversal**

| **Feature** | **Disjoint Set**           | **BFS/DFS**        |
|-------------|----------------------------|--------------------|
| Purpose     | Track connected components | Explore graph      |
| Operation   | Union/Find                 | Visit nodes        |
| Speed       | Very fast for connectivity | Good for traversal |
| Memory      | Less                       | More               |
| Used in     | Kruskal, cycle detection   | Path finding       |

**Disjoint Set vs HashSet**

| **Feature**    | **Disjoint Set** | **HashSet**       |
|----------------|------------------|-------------------|
| Stores         | Groups           | Unique values     |
| Main Operation | Merge groups     | Check existence   |
| Purpose        | Connectivity     | Membership        |
| Example        | Network groups   | Duplicate removal |

**Common Interview Questions**

1.  What is Disjoint Set?

2.  Why is it called Union-Find?

3.  Explain Find operation.

4.  Explain Union operation.

5.  What is path compression?

6.  What is union by rank?

7.  How does DSU detect cycles?

8.  How is DSU used in Kruskal's algorithm?

9.  What is the time complexity of DSU?

10. Difference between DFS and DSU?

**Summary**

| **Feature**  | **Disjoint Set**                        |
|--------------|-----------------------------------------|
| Also Called  | Union-Find / DSU                        |
| Purpose      | Manage separate groups                  |
| Operations   | Find, Union                             |
| Optimization | Path Compression + Union by Rank        |
| Complexity   | Almost O(1)                             |
| Used In      | Graph algorithms, connectivity problems |

**Key Takeaways**

- A **Disjoint Set manages multiple independent groups**.

- **Find** tells which group an element belongs to.

- **Union** merges two groups.

- **Path compression** and **union by rank** make it extremely fast.

- It is heavily used in **Kruskal's algorithm, cycle detection, network connectivity, and clustering problems**.
