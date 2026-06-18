# Data Structures and Algorithms Stacks
## Questions Covered

1. What is a stack, and how do you implement it using arrays or linked lists?
2. What are stack operations (push, pop, peek), and their time complexities?
3. How do you use stacks in real-world applications, such as checking balanced parentheses?
4. How can a stack be implemented using two queues and vice versa?
5. How do you evaluate a postfix expression using a stack?
## What is a stack, and how do you implement it using arrays or linked lists?

A **stack** follows **LIFO** (Last-In-First-Out). Used in function calls, expression evaluation, and backtracking.

### Stack Operations

1. **Push** — Add to top.
2. **Pop** — Remove and return top.
3. **Peek/Top** — View top without removing.
4. **IsEmpty** — Check if empty.

### Implementation Using Arrays

Top tracked by index `_top`.

```csharp
using System;
public class StackArray
{
  private int[] _array;
  private int _top;
  private int _capacity;
  public StackArray(int capacity)
  {
    _capacity = capacity;
    _array = new int[_capacity];
    _top = -1;
  }
  // Push operation
  public void Push(int value)
  {
    if (_top >= _capacity - 1)
    throw new InvalidOperationException("Stack overflow");
    _array[++_top] = value;
  }
  // Pop operation
  public int Pop()
  {
    if (_top == -1)
    throw new InvalidOperationException("Stack underflow");
    return _array[_top--];
  }
  // Peek operation
  public int Peek()
  {
    if (_top == -1)
    throw new InvalidOperationException("Stack is empty");
    return _array[_top];
  }
  // Check if the stack is empty
  public bool IsEmpty()
  {
    return _top == -1;
  }
  // Print the stack
  public void PrintStack()
  {
    for (int i = 0; i <= _top; i++)
    {
      Console.Write(_array[i] + " ");
    }
    Console.WriteLine();
  }
}
```

**Key points**: `_top` index; push increments, pop decrements; empty when `_top == -1`.

### Implementation Using Linked Lists

Top = head of list.

```csharp
using System;
public class Node
{
  public int Data { get; set; }
  public Node Next { get; set; }
}
public class StackLinkedList
{
  private Node _top;
  // Push operation
  public void Push(int value)
  {
    Node newNode = new Node { Data = value, Next = _top };
    _top = newNode;
  }
  // Pop operation
  public int Pop()
  {
    if (_top == null)
    throw new InvalidOperationException("Stack underflow");
    int value = _top.Data;
    _top = _top.Next;
    return value;
  }
  // Peek operation
  public int Peek()
  {
    if (_top == null)
    throw new InvalidOperationException("Stack is empty");
    return _top.Data;
  }
  // Check if the stack is empty
  public bool IsEmpty()
  {
    return _top == null;
  }
  // Print the stack
  public void PrintStack()
  {
    Node current = _top;
    while (current != null)
    {
      Console.Write(current.Data + " ");
      current = current.Next;
    }
    Console.WriteLine();
  }
}
```

**Key points**: Push prepends node; pop advances `_top`; empty when `_top == null`.

### Summary

- **Array**: O(1) ops; fixed size or dynamic resize.
- **Linked List**: O(1) ops; dynamic size; extra pointer overhead.
## What are stack operations (push, pop, peek), and their time complexities?

All core stack operations are **O(1)** for both array and linked-list implementations.

### 1. Push Operation

- **Definition**: Add element to top.
- **Array**: O(1) — place at `_top + 1`.
- **Linked List**: O(1) — prepend node.

**Array-Based**:

```csharp
public void Push(int value)
{
  if (_top >= _capacity - 1)
  throw new InvalidOperationException("Stack overflow");
  _array[++_top] = value;
}
```

**Linked-List-Based**:

```csharp
public void Push(int value)
{
  Node newNode = new Node { Data = value, Next = _top };
  _top = newNode;
}
```

### 2. Pop Operation

- **Definition**: Remove and return top.
- **Array**: O(1) — read and decrement `_top`.
- **Linked List**: O(1) — advance `_top`.

**Array-Based**:

```csharp
public int Pop()
{
  if (_top == -1)
  throw new InvalidOperationException("Stack underflow");
  return _array[_top--];
}
```

**Linked-List-Based**:

```csharp
public int Pop()
{
  if (_top == null)
  throw new InvalidOperationException("Stack underflow");
  int value = _top.Data;
  _top = _top.Next;
  return value;
}
```

### 3. Peek Operation

- **Definition**: Return top without removing.
- **Both**: O(1).

**Array-Based**:

```csharp
public int Peek()
{
  if (_top == -1)
  throw new InvalidOperationException("Stack is empty");
  return _array[_top];
}
```

**Linked-List-Based**:

```csharp
public int Peek()
{
  if (_top == null)
  throw new InvalidOperationException("Stack is empty");
  return _top.Data;
}
```

### Summary

| Operation | Array | Linked List |
|-----------|-------|-------------|
| Push | O(1) | O(1) |
| Pop | O(1) | O(1) |
| Peek | O(1) | O(1) |
## How do you use stacks in real-world applications, such as checking balanced parentheses?

Stacks excel at **nested structure** problems — parentheses, call stacks, undo, parsing.

### Checking Balanced Parentheses

**Problem**: Every opening `(`, `{`, `[` has a matching closing bracket in correct order.

**Steps**:

1. Push opening brackets.
2. On closing bracket — pop and verify match; empty stack = unbalanced.
3. End with empty stack.

```csharp
using System;
using System.Collections.Generic;
public class ParenthesesChecker
{
  // Method to check if parentheses are balanced
  public bool AreParenthesesBalanced(string expression)
  {
    Stack<char> stack = new Stack<char>();
    foreach (char ch in expression)
    {
      if (ch == '(' || ch == '{' || ch == '[')
      {
        stack.Push(ch);
      }
      else if (ch == ')' || ch == '}' || ch == ']')
      {
        if (stack.Count == 0)
        return false;
        char top = stack.Pop();
        if (!IsMatchingPair(top, ch))
        return false;
      }
    }
    return stack.Count == 0;
  }
  // Helper method to check if the parentheses match
  private bool IsMatchingPair(char opening, char closing)
  {
    return (opening == '(' && closing == ')') ||
    (opening == '{' && closing == '}') ||
    (opening == '[' && closing == ']');
  }
}
public class Program
{
  public static void Main()
  {
    ParenthesesChecker checker = new ParenthesesChecker();
    string expression1 = "{[()]}";
    string expression2 = "{[(])}";
    Console.WriteLine($"Expression '{expression1}' is balanced: {checker.AreParenthesesBalanced(expression1)}");
    Console.WriteLine($"Expression '{expression2}' is balanced: {checker.AreParenthesesBalanced(expression2)}");
  }
}
```

### Other Real-World Applications

1. **Function Call Management** — Call stack for push/pop of frames.
2. **Undo Mechanism** — Push actions; pop to undo.
3. **Expression Evaluation** — Postfix/RPN evaluation.
4. **Backtracking** — Maze/puzzle state tracking.
5. **Syntax Parsing** — Compiler/interpreter bracket matching.
## How can a stack be implemented using two queues and vice versa?

Stacks (LIFO) and queues (FIFO) can simulate each other with trade-offs on which operation is costly.

### Stack Using Two Queues

#### Approach 1: Costly Push — O(n) push, O(1) pop

```csharp
using System;
using System.Collections.Generic;
public class StackUsingQueues
{
  private Queue<int> queue1;
  private Queue<int> queue2;
  public StackUsingQueues()
  {
    queue1 = new Queue<int>();
    queue2 = new Queue<int>();
  }
  // Push operation
  public void Push(int value)
  {
    queue2.Enqueue(value);
    while (queue1.Count > 0)
    {
      queue2.Enqueue(queue1.Dequeue());
    }
    Queue<int> temp = queue1;
    queue1 = queue2;
    queue2 = temp;
  }
  // Pop operation
  public int Pop()
  {
    if (queue1.Count == 0)
    throw new InvalidOperationException("Stack is empty");
    return queue1.Dequeue();
  }
  // Peek operation
  public int Peek()
  {
    if (queue1.Count == 0)
    throw new InvalidOperationException("Stack is empty");
    return queue1.Peek();
  }
  // Check if the stack is empty
  public bool IsEmpty()
  {
    return queue1.Count == 0;
  }
}
```

Push: enqueue to queue2, transfer queue1 → queue2, swap queues.

#### Approach 2: Costly Pop — O(1) push, O(n) pop

```csharp
using System;
using System.Collections.Generic;
public class StackUsingQueues
{
  private Queue<int> queue1;
  private Queue<int> queue2;
  public StackUsingQueues()
  {
    queue1 = new Queue<int>();
    queue2 = new Queue<int>();
  }
  // Push operation
  public void Push(int value)
  {
    queue1.Enqueue(value);
  }
  // Pop operation
  public int Pop()
  {
    if (queue1.Count == 0)
    throw new InvalidOperationException("Stack is empty");
    while (queue1.Count > 1)
    {
      queue2.Enqueue(queue1.Dequeue());
    }
    int top = queue1.Dequeue();
    Queue<int> temp = queue1;
    queue1 = queue2;
    queue2 = temp;
    return top;
  }
  // Peek operation
  public int Peek()
  {
    if (queue1.Count == 0)
    throw new InvalidOperationException("Stack is empty");
    while (queue1.Count > 1)
    {
      queue2.Enqueue(queue1.Dequeue());
    }
    int top = queue1.Peek();
    queue2.Enqueue(queue1.Dequeue());
    Queue<int> temp = queue1;
    queue1 = queue2;
    queue2 = temp;
    return top;
  }
  // Check if the stack is empty
  public bool IsEmpty()
  {
    return queue1.Count == 0;
  }
}
```

Pop: move all but last to queue2; last element is top.

### Queue Using Two Stacks

#### Approach 1: O(1) enqueue, O(n) dequeue (amortized)

```csharp
using System;
using System.Collections.Generic;
public class QueueUsingStacks
{
  private Stack<int> stack1;
  private Stack<int> stack2;
  public QueueUsingStacks()
  {
    stack1 = new Stack<int>();
    stack2 = new Stack<int>();
  }
  // Enqueue operation
  public void Enqueue(int value)
  {
    stack1.Push(value);
  }
  // Dequeue operation
  public int Dequeue()
  {
    if (stack1.Count == 0 && stack2.Count == 0)
    throw new InvalidOperationException("Queue is empty");
    if (stack2.Count == 0)
    {
      while (stack1.Count > 0)
      {
        stack2.Push(stack1.Pop());
      }
    }
    return stack2.Pop();
  }
  // Peek operation
  public int Peek()
  {
    if (stack1.Count == 0 && stack2.Count == 0)
    throw new InvalidOperationException("Queue is empty");
    if (stack2.Count == 0)
    {
      while (stack1.Count > 0)
      {
        stack2.Push(stack1.Pop());
      }
    }
    return stack2.Peek();
  }
  // Check if the queue is empty
  public bool IsEmpty()
  {
    return stack1.Count == 0 && stack2.Count == 0;
  }
}
```

Dequeue: if stack2 empty, pour stack1 → stack2 (reverses order).

#### Approach 2: Same pattern (alternate implementation)

```csharp
using System;
using System.Collections.Generic;
public class QueueUsingStacks
{
  private Stack<int> stack1;
  private Stack<int> stack2;
  public QueueUsingStacks()
  {
    stack1 = new Stack<int>();
    stack2 = new Stack<int>();
  }
  // Enqueue operation
  public void Enqueue(int value)
  {
    stack1.Push(value);
  }
  // Dequeue operation
  public int Dequeue()
  {
    if (stack2.Count == 0)
    {
      while (stack1.Count > 0)
      {
        stack2.Push(stack1.Pop());
      }
    }
    if (stack2.Count == 0)
    throw new InvalidOperationException("Queue is empty");
    return stack2.Pop();
  }
  // Peek operation
  public int Peek()
  {
    if (stack2.Count == 0)
    {
      while (stack1.Count > 0)
      {
        stack2.Push(stack1.Pop());
      }
    }
    if (stack2.Count == 0)
    throw new InvalidOperationException("Queue is empty");
    return stack2.Peek();
  }
  // Check if the queue is empty
  public bool IsEmpty()
  {
    return stack1.Count == 0 && stack2.Count == 0;
  }
}
```

### Summary

| Conversion | Costly Op | Cheap Op |
|------------|-----------|----------|
| Stack ← 2 Queues (push costly) | Push O(n) | Pop O(1) |
| Stack ← 2 Queues (pop costly) | Pop O(n) | Push O(1) |
| Queue ← 2 Stacks | Dequeue O(n) amortized | Enqueue O(1) |
## How do you evaluate a postfix expression using a stack?

**Postfix (RPN)**: operators follow operands — no parentheses needed.

### Algorithm

1. **Initialize** empty operand stack.
2. **For each token**:
   - Operand → push.
   - Operator → pop two operands, apply, push result.
3. **Final result** = sole stack element.

### Example: `5 6 2 + *`

| Token | Action | Stack |
|-------|--------|-------|
| 5 | push | [5] |
| 6 | push | [5,6] |
| 2 | push | [5,6,2] |
| + | 6+2=8 | [5,8] |
| * | 5*8=40 | [40] |

Result: **40**

### Example Code in C#

```csharp
using System;
using System.Collections.Generic;
public class PostfixEvaluator
{
  // Method to evaluate postfix expression
  public int Evaluate(string expression)
  {
    Stack<int> stack = new Stack<int>();
    string[] tokens = expression.Split(' ');
    foreach (string token in tokens)
    {
      if (IsOperator(token))
      {
        int operand2 = stack.Pop();
        int operand1 = stack.Pop();
        int result = ApplyOperator(token, operand1, operand2);
        stack.Push(result);
      }
      else
      {
        stack.Push(int.Parse(token));
      }
    }
    return stack.Pop();
  }
  // Method to check if the token is an operator
  private bool IsOperator(string token)
  {
    return token == "+" || token == "-" || token == "*" || token == "/";
  }
  // Method to apply an operator to two operands
  private int ApplyOperator(string operatorToken, int operand1, int operand2)
  {
    switch (operatorToken)
    {
      case "+": return operand1 + operand2;
      case "-": return operand1 - operand2;
      case "*": return operand1 * operand2;
      case "/": return operand1 / operand2;
      default: throw new InvalidOperationException("Invalid operator");
    }
  }
}
public class Program
{
  public static void Main()
  {
    PostfixEvaluator evaluator = new PostfixEvaluator();
    string expression = "5 6 2 + *";
    int result = evaluator.Evaluate(expression);
    Console.WriteLine($"The result of the postfix expression '{expression}' is {result}");
  }
}
```

### Summary

- Operands pushed; operators pop two, compute, push back.
- LIFO ensures correct operand order without precedence rules.
