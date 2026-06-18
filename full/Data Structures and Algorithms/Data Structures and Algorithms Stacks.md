# Data Structures and Algorithms Stacks
## Questions Covered

1. What is a stack, and how do you implement it using arrays or linked lists?
2. What are stack operations (push, pop, peek), and their time complexities?
3. How do you use stacks in real-world applications, such as checking balanced parentheses?
4. How can a stack be implemented using two queues and vice versa?
5. How do you evaluate a postfix expression using a stack?
## What is a stack, and how do you implement it using arrays or linked lists?

A **stack** is a fundamental data structure that follows the Last-In-First-Out (LIFO) principle. This means the most recently added element is the first one to be removed. Stacks are used in various applications such as function calls, expression evaluation, and backtracking algorithms.

### Stack Operations

1.  **Push**: Add an element to the top of the stack.

2.  **Pop**: Remove and return the top element from the stack.

3.  **Peek/Top**: Return the top element without removing it.

4.  **IsEmpty**: Check if the stack is empty.

### Implementation Using Arrays

Stacks can be implemented using arrays where the top of the stack is represented by an index. Here's how you can implement a stack using arrays in C#:

**Example Code**:

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

**Explanation**:

1.  **Array and Top Index**: Use an array to store stack elements and an integer (_top) to keep track of the top element's index.

2.  **Push**: Increment the _top index and add the new element.

3.  **Pop**: Return the element at the _top index and decrement _top.

4.  **Peek**: Return the element at the _top index without modifying _top.

5.  **IsEmpty**: Check if _top is -1 to determine if the stack is empty.

### Implementation Using Linked Lists

Stacks can also be implemented using linked lists. Each node contains the stack element and a reference to the next node. The top of the stack is represented by the head of the linked list.

**Example Code**:

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

**Explanation**:

1.  **Node Class**: Define a Node class to represent each element in the stack.

2.  **Top Node**: Use a Node reference (_top) to keep track of the top element.

3.  **Push**: Create a new node with the new element and set its Next pointer to the current top node.

4.  **Pop**: Remove the top node and set _top to the next node in the list.

5.  **Peek**: Return the data from the top node without modifying _top.

6.  **IsEmpty**: Check if _top is null to determine if the stack is empty.

### Summary

- **Array Implementation**: Provides constant-time access to elements using indices but requires a fixed size or dynamic resizing.

- **Linked List Implementation**: Allows dynamic size and easy insertions/removals but has slightly more overhead due to node pointers.

Both implementations provide the core stack operations with different trade-offs in terms of memory usage and flexibility.
## What are stack operations (push, pop, peek), and their time complexities?

Stack operations include **push**, **pop**, and **peek**. Here's a breakdown of each operation and their time complexities for both array-based and linked-list-based implementations:

### 1. Push Operation

- **Definition**: Adds an element to the top of the stack.

- **Array-Based Implementation**:

  - **Time Complexity**: O(1) (constant time) because it involves placing an element at the next available index and updating the top index.

- **Linked-List-Based Implementation**:

  - **Time Complexity**: O(1) (constant time) because it involves creating a new node and adjusting the pointers, which doesn't depend on the size of the stack.

**Example Code**:

- **Array-Based**:

```csharp
public void Push(int value)
{
  if (_top >= _capacity - 1)
  throw new InvalidOperationException("Stack overflow");
  _array[++_top] = value;
}
```

- **Linked-List-Based**:

```csharp
public void Push(int value)
{
  Node newNode = new Node { Data = value, Next = _top };
  _top = newNode;
}
```

### 2. Pop Operation

- **Definition**: Removes and returns the top element from the stack.

- **Array-Based Implementation**:

  - **Time Complexity**: O(1) (constant time) because it involves accessing and removing the element at the top index and updating the top index.

- **Linked-List-Based Implementation**:

  - **Time Complexity**: O(1) (constant time) because it involves removing the node at the top and updating the top pointer.

**Example Code**:

- **Array-Based**:

```csharp
public int Pop()
{
  if (_top == -1)
  throw new InvalidOperationException("Stack underflow");
  return _array[_top--];
}
```

- **Linked-List-Based**:

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

- **Definition**: Returns the top element of the stack without removing it.

- **Array-Based Implementation**:

  - **Time Complexity**: O(1) (constant time) because it involves accessing the element at the top index without modifying any indices.

- **Linked-List-Based Implementation**:

  - **Time Complexity**: O(1) (constant time) because it involves accessing the data of the top node without modifying the pointers.

**Example Code**:

- **Array-Based**:

```csharp
public int Peek()
{
  if (_top == -1)
  throw new InvalidOperationException("Stack is empty");
  return _array[_top];
}
```

- **Linked-List-Based**:

```csharp
public int Peek()
{
  if (_top == null)
  throw new InvalidOperationException("Stack is empty");
  return _top.Data;
}
```

### Summary

- **Push**: Adds an element to the stack. Time complexity is O(1) for both array-based and linked-list-based implementations.

- **Pop**: Removes the top element from the stack. Time complexity is O(1) for both implementations.

- **Peek**: Returns the top element without removing it. Time complexity is O(1) for both implementations.

In both array-based and linked-list-based stacks, these operations are performed in constant time, making the stack a very efficient data structure for its core operations.
## How do you use stacks in real-world applications, such as checking balanced parentheses?

Stacks are versatile data structures with numerous real-world applications. One common application is checking for balanced parentheses in strings. This problem is crucial in various scenarios, such as validating mathematical expressions, programming language syntax, and markup languages.

### Checking Balanced Parentheses Using a Stack

**Problem Statement**: Determine if the parentheses (or brackets) in a string are balanced. Balanced parentheses mean that every opening parenthesis has a corresponding closing parenthesis in the correct order.

**Steps to Solve**:

1.  **Initialize a Stack**: Use a stack to keep track of opening parentheses.

2.  **Traverse the String**: Iterate through each character in the string.

3.  **Push Opening Parentheses**: When an opening parenthesis is encountered, push it onto the stack.

4.  **Pop for Closing Parentheses**: When a closing parenthesis is encountered, check if the stack is empty. If not, pop the top of the stack and ensure it matches the corresponding opening parenthesis.

5.  **Check Stack State**: After processing all characters, if the stack is empty, the parentheses are balanced. If not, they are unbalanced.

**Example Code in C#**:

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

**Explanation**:

1.  **Initialize Stack**: Create a stack to keep track of opening parentheses.

2.  **Iterate Through Expression**: For each character:

    - Push opening parentheses onto the stack.

    - For closing parentheses, check if the stack is empty or if the top of the stack does not match the expected opening parenthesis.

3.  **Final Check**: Ensure the stack is empty at the end, indicating that all opening parentheses have corresponding closing parentheses.

### Other Real-World Applications of Stacks

1.  **Function Call Management**:

    - **Use**: Stacks manage function calls in programming languages, where each call is pushed onto the call stack and popped when the function returns.

2.  **Undo Mechanism**:

    - **Use**: Applications like text editors use stacks to handle undo operations. Each action is pushed onto the stack, and undoing an action involves popping from the stack.

3.  **Expression Evaluation**:

    - **Use**: Stacks are used to evaluate expressions, especially in postfix notation (Reverse Polish Notation), where operators are applied to operands using a stack.

4.  **Backtracking Algorithms**:

    - **Use**: Stacks assist in backtracking algorithms such as solving mazes or puzzles, where the stack keeps track of the current state and previous steps.

5.  **Syntax Parsing**:

    - **Use**: Compilers and interpreters use stacks for parsing expressions and checking syntax in programming languages.

By leveraging the stack's LIFO nature, you can efficiently solve problems related to managing sequences, states, and nested structures in various real-world applications.
## How can a stack be implemented using two queues and vice versa?

Stacks and queues are both fundamental data structures with distinct characteristics. However, it is possible to implement a stack using two queues and vice versa. Here's how you can achieve this:

### Implementing a Stack Using Two Queues

### Approach 1: Making Push Operation Costly

1.  **Initialization**: Use two queues, queue1 and queue2.

2.  **Push Operation**:

    - Enqueue the new element into queue2.

    - Dequeue all elements from queue1 and enqueue them into queue2.

    - Swap queue1 and queue2 (i.e., queue1 becomes queue2 and vice versa).

3.  **Pop Operation**:

    - Dequeue the front element from queue1.

**Example Code in C#**:

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

**Explanation**:

- **Push Operation**: New elements are added to queue2, then elements from queue1 are transferred to queue2 to maintain the stack order. Finally, swap queue1 and queue2.

- **Pop Operation**: Directly dequeue from queue1, which represents the stack's top.

### Approach 2: Making Pop Operation Costly

1.  **Initialization**: Use two queues, queue1 and queue2.

2.  **Push Operation**:

    - Enqueue the new element into queue1.

3.  **Pop Operation**:

    - Dequeue all elements from queue1, except the last one, and enqueue them into queue2.

    - The last dequeued element from queue1 is the top element of the stack. Swap queue1 and queue2.

**Example Code in C#**:

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

**Explanation**:

- **Push Operation**: Simply enqueue the element into queue1.

- **Pop Operation**: Transfer all elements except the last one to queue2. The last element dequeued from queue1 is the stack’s top. Swap queue1 and queue2.

### Implementing a Queue Using Two Stacks

### Approach 1: Making Enqueue Operation Costly

1.  **Initialization**: Use two stacks, stack1 and stack2.

2.  **Enqueue Operation**:

    - Push the new element onto stack1.

3.  **Dequeue Operation**:

    - If stack2 is empty, transfer all elements from stack1 to stack2 (pop from stack1 and push to stack2).

    - Pop from stack2.

**Example Code in C#**:

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

**Explanation**:

- **Enqueue Operation**: Push elements onto stack1.

- **Dequeue Operation**: If stack2 is empty, transfer elements from stack1 to stack2. Pop from stack2.

### Approach 2: Making Dequeue Operation Costly

1.  **Initialization**: Use two stacks, stack1 and stack2.

2.  **Enqueue Operation**:

    - Push the new element onto stack1.

3.  **Dequeue Operation**:

    - Push all elements from stack2 back to stack1 if stack2 is empty.

    - Pop from stack1.

**Example Code in C#**:

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

**Explanation**:

- **Enqueue Operation**: Simply push elements onto stack1.

- **Dequeue Operation**: If stack2 is empty, transfer elements from stack1 to stack2. Pop from stack2.

### Summary

- **Stack Using Two Queues**:

  - **Push Costly**: O(n) time complexity for push, O(1) for pop.

  - **Pop Costly**: O(n) time complexity for pop, O(1) for push.

- **Queue Using Two Stacks**:

  - **Enqueue Costly**: O(1) time complexity for enqueue, O(n) for dequeue.

  - **Dequeue Costly**: O(n) time complexity for dequeue, O(1) for enqueue.

Both approaches demonstrate how different data structures can be simulated using one another, showcasing the flexibility and power of basic data structures.
## How do you evaluate a postfix expression using a stack?

Evaluating a postfix expression (also known as Reverse Polish Notation or RPN) using a stack is a common algorithmic problem. In postfix notation, operators follow their operands, which eliminates the need for parentheses to denote operation precedence.

Here’s a step-by-step method to evaluate a postfix expression using a stack:

### Algorithm

1.  **Initialize a Stack**: Create an empty stack to store operands.

2.  **Process Each Token**: Iterate through each token (character or number) in the postfix expression.

    - **If Token is an Operand**: Push it onto the stack.

    - **If Token is an Operator**:

      - Pop the top two operands from the stack.

      - Apply the operator to these operands.

      - Push the result back onto the stack.

3.  **Final Result**: After processing all tokens, the stack should contain one element, which is the result of the postfix expression.

### Example

Let’s evaluate the postfix expression 5 6 2 + *:

1.  **Initialize Stack**: []

2.  **Process Tokens**:

    - **5**: Push 5 onto the stack. Stack: [5]

    - **6**: Push 6 onto the stack. Stack: [5, 6]

    - **2**: Push 2 onto the stack. Stack: [5, 6, 2]

    - **+**: Pop 2 and 6 from the stack. Compute 6 + 2 = 8. Push 8 onto the stack. Stack: [5, 8]

    - *****: Pop 8 and 5 from the stack. Compute 5 * 8 = 40. Push 40 onto the stack. Stack: [40]

3.  **Final Result**: The stack contains [40], so the result of the postfix expression is 40.

### Example Code in C#

Here’s a C# implementation to evaluate a postfix expression:

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

### Explanation

1.  **Initialization**: Create a stack to hold operands.

2.  **Token Processing**:

    - **Operands** are pushed onto the stack.

    - **Operators** require popping the top two operands from the stack, performing the operation, and pushing the result back onto the stack.

3.  **Final Result**: The final value left in the stack is the result of the postfix expression.

### Summary

- **Postfix Expression**: Operand and operator are in a sequence where operators follow their operands.

- **Evaluation Using Stack**: Efficiently evaluates expressions without needing parentheses by using a stack to manage operands and intermediate results.

This method leverages the stack's LIFO (Last In, First Out) property to handle operand and operator sequences correctly, ensuring accurate evaluation of postfix expressions.
