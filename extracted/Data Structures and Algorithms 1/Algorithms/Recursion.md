# Data Structures and Algorithms Recursion

Recursion in Data Structures and Algorithms

**Recursion** is a programming technique where a function **calls itself** to solve a smaller version of the same problem.

The main idea:

"Solve a big problem by breaking it into smaller identical problems until reaching a simple case."

A recursive function has two important parts:

- **Base Case** → Condition where recursion stops.

- **Recursive Case** → Function calls itself with a smaller input.

**Real-Life Example: Climbing Stairs**

Imagine you are climbing stairs.

To reach step 5:

Reach step 5

\|

↓

Reach step 4

\|

↓

Reach step 3

\|

↓

Reach step 2

\|

↓

Reach step 1

Eventually:

Step 1 → Stop

That stopping condition is the **base case**.

Basic Structure of Recursion

void RecursiveFunction(parameters)

{

// Base case

if(condition)

{

return;

}

// Recursive call

RecursiveFunction(smaller problem);

}

### Example 1: Factorial Using Recursion

Problem:

Calculate:

5!

Mathematically:

5! = 5 × 4 × 3 × 2 × 1

Recursive definition:

n! = n × (n-1)!

Base case:

1! = 1

Execution

factorial(5)

5 \* factorial(4)

5 \* 4 \* factorial(3)

5 \* 4 \* 3 \* factorial(2)

5 \* 4 \* 3 \* 2 \* factorial(1)

Return 1

Now values return back:

1

2\*1 = 2

3\*2 = 6

4\*6 = 24

5\*24 = 120

Answer:

120

C# Code

int Factorial(int n)

{

if(n == 1)

return 1;

return n \* Factorial(n - 1);

}

Calling:

Factorial(5);

- Output:

120

How Recursion Uses Memory

Recursion uses a **call stack**.

Example:

Factorial(5)

\|

Factorial(4)

\|

Factorial(3)

\|

Factorial(2)

\|

Factorial(1)

Memory stack:

Top

------

Factorial(1)

Factorial(2)

Factorial(3)

Factorial(4)

Factorial(5)

------

Bottom

When the base case is reached, functions return and are removed from the stack.

### Example 2: Fibonacci Series

Fibonacci:

0 1 1 2 3 5 8

Formula:

F(n) = F(n-1) + F(n-2)

Base cases:

F(0)=0

F(1)=1

Code:

int Fibonacci(int n)

{

if(n \<= 1)

return n;

return Fibonacci(n-1) + Fibonacci(n-2);

}

Problem:

Fibonacci(5)

Creates a tree:

F(5)

/ \\

F(4) F(3)

/ \\ / \\

F(3) F(2) F(2) F(1)

Notice:

F(3)

is calculated multiple times.

This is inefficient.

Time complexity:

O(2^n)

Recursion vs Iteration

Iteration

Uses loops:

for(int i=0;i\<n;i++)

{

}

Recursion

Uses function calls:

Function()

{

Function();

}

| **Recursion**                  | **Iteration**           |
|--------------------------------|-------------------------|
| Uses function calls            | Uses loops              |
| Uses stack memory              | Usually constant memory |
| Easier for tree/graph problems | Usually faster          |
| Can cause stack overflow       | No recursion limit      |

### Example 3: Reverse a String

- Input:

hello

- Output:

olleh

Recursive idea:

Reverse("hello")

Reverse("ello") + h

Reverse("llo") + e + h

Reverse("lo") + l + e + h

Reverse("o") + l + l + e + h

Recursion in Data Structures

Recursion is naturally used in:

1. Binary Trees

Example:

Tree traversal:

A

/ \\

B C

DFS:

Visit A

Visit B

Visit C

Code:

void Traverse(Node node)

{

if(node == null)

return;

Console.WriteLine(node.Value);

Traverse(node.Left);

Traverse(node.Right);

}

2. Graph DFS

Graph:

A → B → C

DFS uses recursion:

Visit A

Visit B

Visit C

3. Backtracking

Examples:

- Sudoku

- N-Queens

- Maze solving

Pattern:

Choose

↓

Recurse

↓

Undo

4. Divide and Conquer

Examples:

- Merge Sort

- Quick Sort

- Binary Search

Example:

Sort(big array)

Sort(left)

Sort(right)

Types of Recursion

1. Direct Recursion

Function calls itself.

Example:

void Print(int n)

{

Print(n-1);

}

2. Indirect Recursion

Function A calls B, and B calls A.

Example:

void A()

{

B();

}

void B()

{

A();

}

3. Tail Recursion

Recursive call is the last operation.

Example:

void Print(int n)

{

if(n==0)

return;

Print(n-1);

}

Nothing happens after recursive call.

Recursion Problems in Interviews

Common questions:

| **Problem**           | **Concept**       |
|-----------------------|-------------------|
| Factorial             | Basic recursion   |
| Fibonacci             | Recursive tree    |
| Binary tree traversal | DFS               |
| Reverse linked list   | Recursion         |
| Merge sort            | Divide & conquer  |
| Quick sort            | Divide & conquer  |
| Generate subsets      | Backtracking      |
| Permutations          | Backtracking      |
| Tower of Hanoi        | Classic recursion |

Recursion Complexity

Depends on number of recursive calls.

Example:

Factorial:

T(n)=T(n-1)+O(1)

Time:

O(n)

Space:

O(n)

because of call stack.

Fibonacci:

T(n)=T(n-1)+T(n-2)

Time:

O(2^n)

Space:

O(n)

Common Recursion Mistakes

1. Missing Base Case

Wrong:

void Print(int n)

{

Print(n-1);

}

No stopping condition.

Result:

StackOverflowException

2. Not Reducing the Problem

Wrong:

Function(n)

{

Function(n);

}

The input never changes.

3. Too Many Recursive Calls

Example:

Naive Fibonacci:

F(50)

creates billions of calls.

Solution:

Use:

- Memoization

- Dynamic Programming

Recursion vs Backtracking

They are related but different.

Recursion

Solve smaller problem

Example:

factorial(5)

Backtracking

Try choice

↓

Recurse

↓

Undo choice

Example:

Sudoku

N-Queens

Interview Explanation (Senior Developer)

"Recursion is a technique where a function solves a problem by calling itself with a smaller input until reaching a base condition. Each recursive call is stored in the call stack. It is commonly used in tree traversal, graph DFS, divide-and-conquer algorithms, and backtracking problems. The key considerations are defining a correct base case, reducing the input size, and analyzing stack space complexity."

A typical DSA learning sequence is:

Recursion

↓

Backtracking

↓

Divide & Conquer

↓

Tree Traversal

↓

Graph DFS

↓

Dynamic Programming

Recursion is one of the foundational concepts behind many advanced DSA algorithms.
