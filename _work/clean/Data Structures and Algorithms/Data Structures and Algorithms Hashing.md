# Data Structures and Algorithms Hashing
## Questions Covered

1. What is hashing, and what are hash functions?
2. How do hash tables handle collisions (linear probing, separate chaining)?
3. What is a perfect hash function, double hashing, and how do you handle cryptographic hash collisions?
## What is hashing, and what are hash functions?

### Hashing and Hash Functions

**Hashing** is a technique used in computer science to efficiently store and retrieve data. It involves converting data into a fixed-size value, known as a **hash code** or **hash value**, which typically serves as an index in a data structure like a hash table. This process allows for quick access to data by minimizing the number of comparisons needed to find a value.

### 1. Hash Functions

### Hash Function

- **Definition:** A hash function is a function that takes an input (or key) and returns a fixed-size string or number, typically called a hash value or hash code. The output of a hash function should ideally distribute keys uniformly across the hash table to minimize collisions (situations where two keys hash to the same index).

### Properties of a Good Hash Function

1.  **Deterministic:** The same input should always produce the same hash value.

2.  **Uniform Distribution:** The hash values should be distributed uniformly across the hash table to minimize collisions.

3.  **Fast Computation:** The hash function should compute the hash value quickly.

4.  **Minimizes Collisions:** While collisions cannot be completely avoided, a good hash function minimizes the probability of them.

### Common Hash Functions

1.  **Division Method:** Computes the hash by taking the modulus of the key with the size of the hash table. For example, hash(key) = key % table_size.

2.  **Multiplication Method:** Computes the hash by multiplying the key by a constant, taking the fractional part, and scaling it to the table size. For example, hash(key) = table_size * (key * A % 1), where A is a constant.

3.  **Universal Hashing:** A family of hash functions is used to minimize the impact of any particular hash function on performance.

### Example Hash Functions in C#

```csharp
using System;
class HashFunctions
{
  // Division Method
  public static int DivisionMethodHash(int key, int tableSize)
  {
    return key % tableSize;
  }
  // Multiplication Method
  public static int MultiplicationMethodHash(int key, int tableSize)
  {
    double A = (Math.Sqrt(5) - 1) / 2; // Constant
    return (int)(tableSize * ((key * A) % 1));
  }
}
```

### 2. Hash Tables

### Hash Table

- **Definition:** A hash table is a data structure that uses hash functions to map keys to values. It consists of an array of slots (buckets) where each slot contains a list or another data structure to handle collisions.

### Operations

1.  **Insertion:** Use the hash function to determine the index where the key-value pair should be placed.

2.  **Search:** Use the hash function to find the index and then search for the key in the corresponding bucket.

3.  **Deletion:** Use the hash function to find the index and remove the key-value pair from the bucket.

### Handling Collisions

1.  **Chaining:** Use a linked list or another data structure to store multiple elements that hash to the same index.

2.  **Open Addressing:** Find another slot within the table when a collision occurs (e.g., linear probing, quadratic probing, double hashing).

### Example Hash Table Implementation in C#

```csharp
using System;
using System.Collections.Generic;
class HashTable
{
  private List<KeyValuePair<int, string>>[] table;
  public HashTable(int size)
  {
    table = new List<KeyValuePair<int, string>>[size];
    for (int i = 0; i < size; i++)
    {
      table[i] = new List<KeyValuePair<int, string>>();
    }
  }
  public void Insert(int key, string value)
  {
    int index = HashFunctions.DivisionMethodHash(key, table.Length);
    table[index].Add(new KeyValuePair<int, string>(key, value));
  }
  public string Search(int key)
  {
    int index = HashFunctions.DivisionMethodHash(key, table.Length);
    foreach (var kvp in table[index])
    {
      if (kvp.Key == key)
      {
        return kvp.Value;
      }
    }
    return null; // Key not found
  }
  public void Delete(int key)
  {
    int index = HashFunctions.DivisionMethodHash(key, table.Length);
    table[index].RemoveAll(kvp => kvp.Key == key);
  }
}
```

### Summary

- **Hashing** is a technique for efficiently mapping keys to values using hash functions.

- **Hash Functions** generate a hash value from a key, ideally with uniform distribution and quick computation.

- **Hash Tables** use hash functions to store and retrieve data, handling collisions using techniques like chaining or open addressing.

Hashing is fundamental to many data structures and algorithms, especially in areas where quick access to data is crucial, such as databases, caches, and various lookup operations.
## How do hash tables handle collisions (linear probing, separate chaining)?

Hash tables handle collisions through different methods to ensure that each key-value pair can be stored and retrieved efficiently even when multiple keys hash to the same index. Two common techniques are **linear probing** and **separate chaining**.

### 1. Linear Probing

**Linear Probing** is a form of **open addressing**, where collisions are handled by finding the next available slot in the hash table.

### How it Works

- When a collision occurs (i.e., the computed index is already occupied), the algorithm checks the next slot sequentially until an empty slot is found.

- This sequential search continues until an empty slot is found or the table is completely full.

### Steps

1.  **Compute Hash:** Use the hash function to find the initial index.

2.  **Check Slot:** If the slot is occupied, move to the next slot (index + 1) and check again.

3.  **Wrap Around:** If the end of the table is reached, wrap around to the beginning of the table.

4.  **Insert:** Place the key-value pair in the first available slot found.

### Time Complexity

- **Average Case:** O(1) if the load factor is low.

- **Worst Case:** O(n) in the case of many collisions or if the table is nearly full.

### Example Code in C#

```csharp
using System;
class LinearProbingHashTable
{
  private int[] table;
  private int size;
  public LinearProbingHashTable(int size)
  {
    this.size = size;
    table = new int[size];
    Array.Fill(table, -1); // Use -1 to indicate empty slots
  }
  public void Insert(int key)
  {
    int index = key % size;
    while (table[index] != -1)
    {
      index = (index + 1) % size;
    }
    table[index] = key;
  }
  public bool Search(int key)
  {
    int index = key % size;
    while (table[index] != -1)
    {
      if (table[index] == key)
      return true;
      index = (index + 1) % size;
    }
    return false;
  }
}
```

### 2. Separate Chaining

**Separate Chaining** is a method where each slot in the hash table contains a list (or another data structure) to store all the key-value pairs that hash to the same index.

### How it Works

- Each slot in the hash table is a reference to a linked list or other collection.

- When a collision occurs, the new key-value pair is added to the list at the hashed index.

- The list allows multiple elements to be stored at the same index.

### Steps

1.  **Compute Hash:** Use the hash function to find the index.

2.  **Add to List:** Insert the key-value pair into the list at the computed index.

3.  **Search:** Traverse the list to find the key.

4.  **Delete:** Traverse the list to find and remove the key.

### Time Complexity

- **Average Case:** O(1) for insertion, search, and deletion, assuming the lists are short.

- **Worst Case:** O(n) if all keys hash to the same index and the list is long.

### Example Code in C#

```csharp
using System;
using System.Collections.Generic;
class SeparateChainingHashTable
{
  private List<KeyValuePair<int, string>>[] table;
  public SeparateChainingHashTable(int size)
  {
    table = new List<KeyValuePair<int, string>>[size];
    for (int i = 0; i < size; i++)
    {
      table[i] = new List<KeyValuePair<int, string>>();
    }
  }
  public void Insert(int key, string value)
  {
    int index = key % table.Length;
    table[index].Add(new KeyValuePair<int, string>(key, value));
  }
  public string Search(int key)
  {
    int index = key % table.Length;
    foreach (var kvp in table[index])
    {
      if (kvp.Key == key)
      {
        return kvp.Value;
      }
    }
    return null; // Key not found
  }
  public void Delete(int key)
  {
    int index = key % table.Length;
    table[index].RemoveAll(kvp => kvp.Key == key);
  }
}
```

### Summary

- **Linear Probing:**

  - **Technique:** Uses open addressing to resolve collisions by probing sequentially.

  - **Complexity:** Average O(1), Worst Case O(n).

  - **Pros:** Simple and can be more cache-friendly.

  - **Cons:** Can lead to clustering and requires careful management of the load factor.

- **Separate Chaining:**

  - **Technique:** Uses linked lists or other collections to store multiple items at the same hash index.

  - **Complexity:** Average O(1), Worst Case O(n) depending on list length.

  - **Pros:** More flexible and avoids clustering issues.

  - **Cons:** Can use more memory and might have higher overhead for managing lists.

Both methods have their use cases and trade-offs, and the choice of which to use can depend on factors such as the expected load factor, memory usage, and performance requirements.
## What is a perfect hash function, double hashing, and how do you handle cryptographic hash collisions?

### Perfect Hash Function

### Perfect Hash Function

- **Definition:** A perfect hash function is a hash function that maps a set of keys to a hash table with no collisions. In other words, it provides a unique index for each key, making it ideal for situations where you have a fixed set of keys and want optimal performance.

- **Characteristics:**

  - **Collision-Free:** Each key maps to a unique slot in the hash table.

  - **Fixed Set:** Perfect hashing is generally feasible when the set of keys is known in advance and remains constant.

### Applications

- **Static Data:** Useful in scenarios where the set of keys is fixed and known, such as in certain types of database indexing.

### Example

- For a small, fixed set of keys, one might be able to design a perfect hash function manually or using specialized algorithms that generate a minimal perfect hash function.

### Double Hashing

### Double Hashing

- **Definition:** A technique used in open addressing to handle collisions by using two hash functions. If a collision occurs, a secondary hash function is used to compute the next slot to check.

- **How it Works:**

  1.  **Primary Hash Function:** Compute the initial index using the primary hash function.

  2.  **Collision Handling:** If a collision occurs at the computed index, use a secondary hash function to determine the step size for probing.

  3.  **Probing:** Move to the next slot by adding the step size to the current index, repeating until an empty slot is found.

### Steps

1.  **Compute Initial Index:** index = hash1(key) % table_size

2.  **Compute Step Size:** step_size = hash2(key) % table_size (where hash2 is different from hash1)

3.  **Probing Sequence:** If collision occurs, move to index = (index + step_size) % table_size and repeat.

### Time Complexity

- **Average Case:** O(1) if the table is not too full and the hash functions are good.

- **Worst Case:** O(n) if the table is very full or the hash functions have poor distribution.

### Example Code in C#

```csharp
using System;
class DoubleHashingHashTable
{
  private int[] table;
  private int size;
  public DoubleHashingHashTable(int size)
  {
    this.size = size;
    table = new int[size];
    Array.Fill(table, -1); // Use -1 to indicate empty slots
  }
  private int Hash1(int key) => key % size;
  private int Hash2(int key) => 1 + (key % (size - 1)); // Ensure step size is non-zero
  public void Insert(int key)
  {
    int index = Hash1(key);
    int stepSize = Hash2(key);
    while (table[index] != -1)
    {
      index = (index + stepSize) % size;
    }
    table[index] = key;
  }
  public bool Search(int key)
  {
    int index = Hash1(key);
    int stepSize = Hash2(key);
    while (table[index] != -1)
    {
      if (table[index] == key)
      return true;
      index = (index + stepSize) % size;
    }
    return false;
  }
}
```

### Handling Cryptographic Hash Collisions

### Cryptographic Hash Collisions

- **Definition:** In cryptography, a hash collision occurs when two different inputs produce the same hash output. Cryptographic hash functions are designed to be resistant to collisions, but they cannot be completely collision-free.

### Strategies for Handling Collisions

1.  **Choose a Strong Hash Function:** Use hash functions that are resistant to collisions, such as SHA-256 or SHA-3, which have strong theoretical guarantees against collisions.

2.  **Salting:** Add a random value (salt) to the input before hashing. This makes it harder for attackers to use precomputed tables (rainbow tables) to find collisions.

3.  **Increasing Hash Length:** Longer hash values reduce the probability of collisions but may increase computational cost.

4.  **Switching Algorithms:** If a hash function is found to be vulnerable or weak, switch to a more secure algorithm.

### Example of Cryptographic Hash Function in C# (SHA-256)

```csharp
using System;
using System.Security.Cryptography;
using System.Text;
class CryptographicHash
{
  public static string ComputeSHA256Hash(string input)
  {
    using (SHA256 sha256 = SHA256.Create())
    {
      byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
      StringBuilder builder = new StringBuilder();
      foreach (byte b in bytes)
      {
        builder.Append(b.ToString("x2"));
      }
      return builder.ToString();
    }
  }
}
```

### Summary

- **Perfect Hash Function:** Provides a collision-free mapping for a fixed set of keys, ideal but often impractical for dynamic data.

- **Double Hashing:** A technique in open addressing that uses two hash functions to resolve collisions by probing with a secondary hash function.

- **Handling Cryptographic Hash Collisions:** Use strong hash functions, salting, and possibly switch algorithms if vulnerabilities are discovered.
