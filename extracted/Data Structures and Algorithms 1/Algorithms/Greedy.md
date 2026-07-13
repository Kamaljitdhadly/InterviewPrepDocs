# Data Structures and Algorithms Greedy

Greedy Algorithm in Data Structures and Algorithms

A **Greedy algorithm** is an algorithmic technique where we make the **best possible choice at each step** with the hope that these local choices will lead to the **globally optimal solution**.

The idea:

"Take the best choice available right now, and never change it later."

Unlike dynamic programming, greedy algorithms usually do not reconsider previous decisions.

**Real-Life Example: Making Change**

Suppose you need to return ₹87 using Indian currency.

Available coins:

₹50, ₹20, ₹10, ₹5, ₹2, ₹1

Greedy approach:

Take the largest coin possible:

₹50 → Remaining 37

₹20 → Remaining 17

₹10 → Remaining 7

₹5 → Remaining 2

₹2 → Remaining 0

Answer:

50 + 20 + 10 + 5 + 2

We always choose the largest available denomination.

### How Greedy Works

A greedy algorithm usually follows these steps:

1\. Identify choices

2\. Select the best immediate choice

3\. Check if it is valid

4\. Add it to solution

5\. Repeat until complete

General Greedy Pattern

while(solution is not complete)

{

choose best available option;

if(choice is valid)

{

add choice to solution;

}

}

Characteristics of Greedy Algorithms

A problem can often be solved using greedy when it has:

1. Greedy Choice Property

A locally optimal choice leads toward a globally optimal solution.

Example:

Selecting the highest-value activity first.

2. Optimal Substructure

The optimal solution contains optimal solutions to smaller problems.

Example:

Minimum spanning tree.

### Example 1: Activity Selection Problem

Problem

You have activities with:

Start time

End time

Choose maximum number of non-overlapping activities.

Example:

| **Activity** | **Start** | **End** |
|--------------|-----------|---------|
| A            | 1         | 3       |
| B            | 2         | 5       |
| C            | 4         | 6       |
| D            | 6         | 7       |

Greedy strategy:

Choose the activity that finishes earliest.

Sort by ending time:

A (1-3)

C (4-6)

D (6-7)

Selected:

A → C → D

Why?

Because finishing early leaves maximum room for future activities.

### Example 2: Fractional Knapsack

Problem

A thief has a bag capacity:

50 kg

Items:

| **Item** | **Weight** | **Value** |
|----------|------------|-----------|
| A        | 10         | 60        |
| B        | 20         | 100       |
| C        | 30         | 120       |

Choose maximum value.

Calculate value/weight:

A = 60/10 = 6

B = 100/20 = 5

C = 120/30 = 4

Greedy chooses highest ratio:

Take A

Take B

Take remaining from C

Maximum value achieved.

Important:

Greedy works for **Fractional Knapsack**.

But not for **0/1 Knapsack**.

Why?

Because in 0/1:

Either take item completely

or don't take it.

Dynamic programming is needed.

### Example 3: Huffman Coding

Used in:

- Data compression

- ZIP files

- File encoding

Idea:

Frequently used characters get shorter codes.

Example:

Characters:

A: 5 times

B: 2 times

C: 1 time

Greedy chooses the smallest frequencies and builds a tree.

Result:

Common characters require fewer bits.

### Example 4: Dijkstra's Algorithm

Find shortest path in weighted graphs.

Graph:

5

A -------- B

\| \|

2 1

\| \|

C -------- D

3

Starting from A:

Greedy choice:

Pick the node with the smallest known distance.

Steps:

A = 0

Choose C (distance 2)

Choose D (distance 5)

Choose B (distance 6)

### Example 5: Minimum Spanning Tree

A Minimum Spanning Tree connects all nodes with minimum total edge weight.

Two greedy algorithms:

1. Kruskal's Algorithm

Strategy:

Always pick the smallest edge that does not create a cycle.

Example:

Edges:

A-B = 2

B-C = 3

A-C = 5

Choose:

A-B

B-C

Ignore:

A-C

because it creates a cycle.

2. Prim's Algorithm

Strategy:

Start from a node and repeatedly add the cheapest edge connecting a new node.

Greedy vs Dynamic Programming

| **Feature**        | **Greedy**          | **Dynamic Programming** |
|--------------------|---------------------|-------------------------|
| Decision           | Best current choice | Considers all choices   |
| Revisits decisions | No                  | Yes                     |
| Speed              | Usually faster      | Usually slower          |
| Memory             | Low                 | Higher                  |
| Guarantee optimal? | Only some problems  | Usually yes             |
| Example            | Dijkstra            | Knapsack                |

Greedy vs Backtracking

| **Greedy**       | **Backtracking**         |
|------------------|--------------------------|
| Makes one choice | Explores many choices    |
| No undo          | Can undo decisions       |
| Fast             | Usually slower           |
| May fail         | Finds complete solutions |

Example:

Greedy

Choose best path

\|

X

No going back

Backtracking

Choose path

\|

Wrong?

\|

Go back

Try another

Greedy Algorithm Complexity

Most greedy algorithms are efficient.

Examples:

| **Algorithm**       | **Complexity** |
|---------------------|----------------|
| Activity Selection  | O(n log n)     |
| Fractional Knapsack | O(n log n)     |
| Kruskal             | O(E log E)     |
| Prim                | O(E log V)     |
| Dijkstra            | O((V+E) log V) |

Common Greedy Problems

| **Problem**         | **Greedy Strategy**           |
|---------------------|-------------------------------|
| Activity Selection  | Pick earliest finish time     |
| Fractional Knapsack | Highest value/weight ratio    |
| Huffman Coding      | Merge lowest frequencies      |
| Dijkstra            | Pick minimum distance node    |
| Kruskal MST         | Pick smallest edge            |
| Prim MST            | Pick cheapest connecting edge |
| Job Scheduling      | Highest profit jobs first     |

When Should You Think About Greedy?

Look for keywords:

- "Maximum profit"

- "Minimum cost"

- "Best choice"

- "Optimal schedule"

- "Minimum number of steps"

- "Choose the largest/smallest"

- "Arrange optimally"

But always verify:

Does the local best choice guarantee the global best answer?

Interview Explanation (Senior Developer)

"Greedy algorithms solve optimization problems by making the locally optimal choice at each step without reconsidering previous decisions. They work when the problem satisfies the greedy choice property and optimal substructure. Common examples include activity selection, Huffman coding, Dijkstra's algorithm, and minimum spanning tree algorithms like Kruskal and Prim."

For DSA learning, the relationship is:

Brute Force

↓

Greedy (make best choice)

↓

Backtracking (try choices + undo)

↓

Dynamic Programming (store overlapping solutions)

Understanding **when greedy works and when it fails** is the most important interview skill.
