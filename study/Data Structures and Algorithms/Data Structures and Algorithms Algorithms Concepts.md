# Data Structures and Algorithms Algorithms Concepts

**Patterns** = general strategies for problem categories. **Algorithms** = concrete step-by-step procedures (often implementing a pattern).

## Problem-Solving Patterns vs Algorithms

| Aspect | Patterns | Algorithms |
|--------|----------|------------|
| **Scope** | Broad framework/technique | Specific implementation |
| **Detail** | Strategy only | Exact steps |
| **Examples** | Divide & Conquer, Greedy, DP, Backtracking, Sliding Window, Two Pointers | Merge Sort, Binary Search, DFS, Knapsack |

**Relationship:** Patterns are frameworks; algorithms are concrete implementations (e.g. Divide & Conquer → Merge Sort, Quick Sort).

## Most Common Algorithms

### Sorting
**Bubble Sort** · **Selection Sort** · **Insertion Sort** · **Merge Sort** (divide & conquer) · **Quick Sort** (partition + recurse) · **Heap Sort** · **Counting Sort** · **Radix Sort**

### Searching
**Linear Search** — O(n) scan · **Binary Search** — O(log n) on sorted array

### Graph
**DFS** — deep branch first · **BFS** — level-by-level · **Dijkstra** — shortest path (non-negative weights) · **Bellman-Ford** — negative weights · **Floyd-Warshall** — all pairs · **Kruskal / Prim** — MST

### Dynamic Programming
**Knapsack** · **LCS** · **Matrix Chain Multiplication** · **Fibonacci** (memoized)

### Greedy
**Huffman Coding** · **Activity Selection**

### Backtracking
**N-Queens** · **Sudoku Solver**

### Other
**Union-Find** (disjoint sets) · **Topological Sort** (DAG ordering)

## Most Common Problem-Solving Patterns

| Pattern | Approach | Examples |
|---------|----------|----------|
| **Divide & Conquer** | Split → solve subproblems → combine | Merge Sort, Quick Sort, Binary Search |
| **Greedy** | Locally optimal choices → global optimum | Fractional Knapsack, Prim's, Kruskal's |
| **Dynamic Programming** | Overlapping subproblems + memoization | Fibonacci, Knapsack, LCS |
| **Backtracking** | Build candidates; prune invalid paths | N-Queens, Sudoku |
| **Sliding Window** | Maintain moving subset | Max sum subarray size K, longest unique substring |
| **Two Pointers** | Two indices, same or opposite ends | Pair sum, Container With Most Water |
| **DFS / BFS** | Systematic graph/tree traversal | Pathfinding, topological sort, connected components |
| **Union-Find** | Disjoint set partition + union/find | Kruskal's MST, cycle detection |

These patterns and algorithms form the foundation for efficient problem-solving in interviews and production code.
