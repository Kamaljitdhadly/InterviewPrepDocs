# Data Structures and Algorithms Backtracking

**Backtracking in Data Structures and Algorithms**

**Backtracking** is an algorithmic technique used to solve problems by **trying different choices, exploring possible solutions, and undoing choices when they lead to an invalid solution**.

It is based on the idea:

**"Choose → Explore → Undo → Try another choice"**

Backtracking is commonly used for problems where we need to find **all possible solutions** or **the best solution among many possibilities**.

**Real-Life Example: Maze Problem**

Imagine you are solving a maze.

1.  You choose a path.

2.  You continue walking.

3.  If you reach a dead end:

    - You go back to the previous point.

    - Try another path.

This going back and trying another option is **backtracking**.

<img src="media/image1.jpeg" style="width:10.66319in;height:8in" alt="https://images.openai.com/static-rsc-4/xSJum1FHSlpX8kTx6yiLRArK7GOZK-5HN46x4slcEnNJQqm4NvoW64rX31XxxIBwH_M644x1tyP-5GcMM-oU9lsvPM0BdWJCSgb3TeAZs1Huv4Ai1th1N6bsaQiu8j8AaBS7_GJACTynRQ_2ty51oKNY6jTUZPQRp84KLerZeojEQBrjEiAmI17Sffz43bd3?purpose=fullsize" />

<img src="media/image2.jpeg" style="width:6.64097in;height:4.97847in" alt="https://images.openai.com/static-rsc-4/u9L-lH3tPWpssZVo4vWuJ0M9soXkz9PGe2716H8lghHDFXsSeehkfncoYP0okUJLPdxCoeIsMXikZJPyWDMU4Acn5krN9R-XXx2At_AHMSJDzHOuZXGjlrqwOWgWy64bixinOHdO-iAqlsOAWbLg6-_hmgTeXJ8rfWbBpBstiaIfwSHbaFHvAdZDAuKjfxOM?purpose=fullsize" />

<img src="media/image3.jpeg" style="width:5.28264in;height:3.69583in" alt="https://images.openai.com/static-rsc-4/lss_mjfP550xuUZIdUatAtVsYzVz3r66wdNA5ztV-QpXH9uoS4aweB0V1eVMvm7ceopv6CtVv2vMXrVNj1WpagzMMntoP5DqMrm8vV_Fqc-RH7B6l2jcXHROWVGlhkVKhRlMzGaCcN8sNGhJlQBoEkWXjl_PzryU34WCWFzegGxdA8SFDOBi67E94YPc9v2n?purpose=fullsize" />

4

**How Backtracking Works**

Backtracking usually uses **recursion**.

The general pattern:

function backtrack(choice):

if solution_found:

save solution

return

for each possible choice:

make choice

if choice is valid:

backtrack(next step)

undo choice

The important operation is:

undo choice

This allows us to return to the previous state and try another possibility.

**Example 1: Generate All Permutations**

Given:

Input: \[1,2,3\]

Possible arrangements:

123

132

213

231

312

321

We can solve this using backtracking.

**Decision Tree:**

\[\]

/ \| \\

1 2 3

/ \\ / \\ / \\

12 13 21 23 31 32

\| \| \| \| \| \|

123 132 213 231 312 321

Algorithm:

Start with empty result

Pick 1

Pick 2

Pick 3

Found 123

Remove 3

Remove 2

Remove 1

Pick 2

Pick 1

Pick 3

Found 213

The removal step is backtracking.

**Example 2: N-Queens Problem**

Problem:

Place N queens on an N×N chess board so that no two queens attack each other.

For 4 queens:

. Q . .

. . . Q

Q . . .

. . Q .

A queen attacks:

- Same row

- Same column

- Diagonal

Approach:

1.  Put queen in first row.

2.  Move to next row.

3.  If placement is invalid:

    - Remove queen.

    - Try next position.

**Example 3: Sudoku Solver**

A Sudoku has empty cells.

Algorithm:

Find empty cell

Try number 1-9

If valid:

place number

solve remaining board

If failed:

remove number

Try next number

Example:

Cell = ?

Try 5

Invalid ❌

Remove 5

Try 7

Valid ✅

Continue

**Backtracking vs Brute Force**

Both explore possibilities, but backtracking is smarter.

**Brute Force**

Try everything:

A

B

C

D

E

F

...

Even invalid paths are explored.

**Backtracking**

Stops invalid paths early:

Start

/ \\

A B

/

Invalid ❌

No need to explore further.

This is called:

**Pruning**

**Backtracking Components**

A backtracking solution usually has:

**1. State**

Current situation.

Example:

Current chess board

Current Sudoku board

Current path in maze

**2. Choices**

Possible options.

Example:

Queen positions:

Column 1

Column 2

Column 3

Column 4

**3. Constraint**

Rules that decide if choice is valid.

Example:

Two queens cannot attack each other

**4. Goal**

When solution is complete.

Example:

All queens placed

**Common Backtracking Problems**

| **Problem**    | **Technique**                |
|----------------|------------------------------|
| N-Queens       | Place items with constraints |
| Sudoku Solver  | Constraint satisfaction      |
| Maze Path      | Explore paths                |
| Word Search    | Search grid                  |
| Permutations   | Generate arrangements        |
| Combinations   | Select elements              |
| Subsets        | Generate subsets             |
| Rat in Maze    | Path finding                 |
| Graph Coloring | Assign colors                |

**Backtracking Complexity**

Usually exponential because it explores many possibilities.

Example:

For permutations:

n elements

Number of possibilities = n!

Time complexity:

O(n!)

For subsets:

2^n possibilities

Time complexity:

O(2^n)

**Backtracking vs Recursion**

They are related but different.

**Recursion**

A function calls itself.

Example:

factorial(5)

5 \* factorial(4)

**Backtracking**

Uses recursion **plus undoing decisions**.

Example:

Choose path

recurse

Undo path

Try another path

**Backtracking vs Dynamic Programming**

| **Backtracking**    | **Dynamic Programming**         |
|---------------------|---------------------------------|
| Explores choices    | Stores previous results         |
| Usually exponential | Usually optimized               |
| Finds all solutions | Finds optimal solution          |
| Uses recursion      | Uses memoization/tabulation     |
| Example: Sudoku     | Example: Fibonacci optimization |

**Simple C# Example: Generate Subsets**

Given:

\[1,2,3\]

Output:

\[\]

\[1\]

\[2\]

\[3\]

\[1,2\]

\[1,3\]

\[2,3\]

\[1,2,3\]

void Backtrack(int index, List\<int\> current)

{

Console.WriteLine(string.Join(",", current));

for(int i=index; i\<nums.Length; i++)

{

// choose

current.Add(nums\[i\]);

// explore

Backtrack(i + 1, current);

// undo

current.RemoveAt(current.Count - 1);

}

}

The important line:

current.RemoveAt(current.Count - 1);

is the **backtracking step**.

**When Should You Think About Backtracking?**

Use backtracking when the problem contains words like:

- "Find all possible..."

- "Generate all..."

- "Arrange..."

- "Combination..."

- "Permutation..."

- "Choose from..."

- "Can we place..."

- "Find a path..."

**Interview Tip (Senior Developer)**

A good way to explain backtracking:

"Backtracking is a depth-first search approach where we build a solution incrementally. If a partial solution violates constraints, we abandon that branch and revert the state to explore other possibilities. It uses recursion and pruning to reduce unnecessary exploration."

This explanation is suitable for **DSA interviews for senior developers**.
