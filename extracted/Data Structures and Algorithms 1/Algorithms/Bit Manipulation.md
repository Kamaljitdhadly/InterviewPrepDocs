# Data Structures and Algorithms Bit Manipulation

**Bit Manipulation in Data Structures and Algorithms**

**Bit manipulation** is a technique of directly working with the **binary representation of numbers** using bitwise operators.

Computers store integers as a sequence of **bits** (0s and 1s), so bit manipulation allows us to perform operations very efficiently at the lowest level.

Example:

Decimal:

10

Binary:

1010

A bit is a single binary digit:

0 or 1

**Why Learn Bit Manipulation?**

Bit manipulation is useful because:

- Operations are very fast (usually **O(1)**)

- It saves memory

- It is used in:

  - Operating systems

  - Cryptography

  - Networking

  - Compression algorithms

  - Embedded systems

  - Competitive programming

  - Interview problems

**Binary Representation**

A number is represented using powers of 2.

Example:

13

Binary:

1101

Meaning:

1 1 0 1

\| \| \| \|

8 4 2 1

= 8 + 4 + 0 + 1

= 13

**Bitwise Operators**

Most programming languages support these operators:

| **Operator** | **Name**    | **Example** |
|--------------|-------------|-------------|
| &            | AND         | 5 & 3       |
| \`           | \`          | OR          |
| ^            | XOR         | 5 ^ 3       |
| ~            | NOT         | ~5          |
| \<\<         | Left Shift  | 5 \<\< 1    |
| \>\>         | Right Shift | 5 \>\> 1    |

**1. Bitwise AND (&)**

AND returns **1 only when both bits are 1**.

Truth table:

| **A** | **B** | **A & B** |
|-------|-------|-----------|
| 0     | 0     | 0         |
| 0     | 1     | 0         |
| 1     | 0     | 0         |
| 1     | 1     | 1         |

Example:

5 = 0101

3 = 0011

5 & 3

0101

&0011

-----

0001

Result:

1

**Common Use: Check if a bit is set**

Example:

Check whether the 3rd bit is ON.

Number:

10 = 1010

Mask:

0010

Operation:

1010

0010

----

0010

Since result is not zero:

Bit is set

**2. Bitwise OR (\|)**

OR returns 1 if **any bit is 1**.

Example:

5 \| 3

0101

\|0011

-----

0111

Result:

7

**Common Use**

Setting a particular bit.

Example:

Set the second bit:

1000

Mask:

0010

OR:

1000

0010

----

1010

**3. Bitwise XOR (^)**

XOR returns 1 when bits are different.

Truth table:

| **A** | **B** | **A^B** |
|-------|-------|---------|
| 0     | 0     | 0       |
| 0     | 1     | 1       |
| 1     | 0     | 1       |
| 1     | 1     | 0       |

Example:

5 ^ 3

0101

0011

----

0110

Result:

6

**Important XOR Properties**

**1. Same number XOR gives zero**

5 ^ 5 = 0

Because:

0101

0101

----

0000

**2. XOR with zero gives same number**

5 ^ 0 = 5

**Famous Interview Problem**

**Find unique number**

Array:

\[2,3,4,3,2\]

Every number appears twice except one.

Solution:

XOR all numbers:

2 ^ 3 ^ 4 ^ 3 ^ 2

Pairs cancel:

(2^2) ^ (3^3) ^ 4

0 ^ 0 ^ 4

=4

Answer:

4

Time:

O(n)

Space:

O(1)

**4. Bitwise NOT (~)**

Flips every bit.

Example:

5

0101

NOT:

1010

For signed integers, this involves two's complement representation.

**5. Left Shift (\<\<)**

Moves bits to the left.

Example:

5 \<\< 1

Binary:

0101

Shift left:

1010

Decimal:

10

Effect:

number \* 2

Example:

5 \<\< 2

0101 -\> 10100

=20

Equivalent:

5 \* 2^2

**6. Right Shift (\>\>)**

Moves bits right.

Example:

10 \>\> 1

Binary:

1010

Shift:

0101

Result:

5

Effect:

number / 2

**Common Bit Manipulation Tricks**

**1. Check Odd or Even Number**

Every odd number has last bit = 1.

Example:

7 = 111

Last bit:

1

Code:

if((number & 1) == 1)

{

Console.WriteLine("Odd");

}

else

{

Console.WriteLine("Even");

}

**2. Swap Two Numbers Without Temporary Variable**

Using XOR:

a = a ^ b;

b = a ^ b;

a = a ^ b;

Example:

a = 5

b = 3

After operations:

a = 3

b = 5

**3. Count Number of Set Bits**

Example:

13 = 1101

Number of 1s:

3

Using Brian Kernighan's algorithm:

int count = 0;

while(n \> 0)

{

n = n & (n - 1);

count++;

}

Why?

n & (n-1)

removes the lowest set bit.

Example:

1100

1100

1011

----

1000

One bit removed.

**4. Check Power of Two**

A power of two has exactly one set bit.

Examples:

8 = 1000

16 = 10000

Formula:

n \> 0 && (n & (n-1)) == 0

Example:

8

1000

0111

----

0000

True.

**5. Get Lowest Set Bit**

Formula:

n & -n

Example:

12

1100

Lowest set bit:

0100

Result:

4

**Bit Masking**

A **mask** is a number used to select or modify specific bits.

Example:

Number:

101101

Mask:

001000

AND:

101101

001000

------

001000

Used for:

- Permissions

- Flags

- Configuration settings

**Real-World Example: Permissions**

Imagine permissions:

Read = 001

Write = 010

Delete = 100

User permissions:

Read + Write

001

010

---

011

Check write permission:

011

010

---

010

Permission exists.

**Bit Manipulation Complexity**

Most operations:

O(1)

Example:

AND

OR

XOR

Shift

Counting bits:

O(number of bits)

**Common Interview Problems**

| **Problem**         | **Technique**    |
|---------------------|------------------|
| Find unique element | XOR              |
| Count set bits      | n & (n-1)        |
| Check power of two  | n & (n-1)        |
| Reverse bits        | Shift operations |
| Missing number      | XOR              |
| Generate subsets    | Bit masking      |
| Swap numbers        | XOR              |
| Single number II    | Bit counting     |
| Bit ranges          | Masking          |

**Bit Manipulation vs Normal Arithmetic**

Example:

Multiply by 2:

Normal:

x \* 2

Bit:

x \<\< 1

Divide by 2:

x \>\> 1

**Interview-Level Explanation**

For a senior developer interview:

"Bit manipulation is a technique of using bitwise operators to manipulate individual bits of a number. It helps optimize memory and performance by performing low-level operations such as checking, setting, clearing, or toggling bits. Common applications include flags, permissions, encryption, and algorithm optimization."

Bit manipulation is especially important for **advanced DSA problems involving XOR, subsets, masks, and optimization techniques**.
