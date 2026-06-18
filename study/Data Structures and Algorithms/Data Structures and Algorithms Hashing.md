# Data Structures and Algorithms Hashing

## Questions Covered

1. What is hashing, and what are hash functions?
2. How do hash tables handle collisions (linear probing, separate chaining)?
3. What is a perfect hash function, double hashing, and how do you handle cryptographic hash collisions?

## What is hashing, and what are hash functions?

**Hashing** maps keys to fixed-size **hash codes** (indices) for O(1) average lookup in hash tables.

### Hash Function Properties

| Property | Requirement |
|----------|-------------|
| **Deterministic** | Same key → same hash |
| **Uniform distribution** | Spread keys evenly |
| **Fast** | Quick computation |
| **Low collisions** | Minimize same-index keys |

**Common methods:** **Division** — `key % table_size` · **Multiplication** — `table_size * (key * A % 1)` · **Universal hashing** — random function family

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

### Hash Table

Array of buckets; hash function maps key → index. Collision handling: **chaining** (lists per bucket) or **open addressing** (probe for next slot).

| Operation | Steps |
|-----------|-------|
| Insert | Hash → place in bucket |
| Search | Hash → scan bucket |
| Delete | Hash → remove from bucket |

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

## How do hash tables handle collisions (linear probing, separate chaining)?

### Linear Probing (Open Addressing)

On collision, probe `(index + 1) % size` until empty slot.

| Case | Complexity |
|------|------------|
| Average (low load) | **O(1)** |
| Worst (clustering / full table) | **O(n)** |

**Pros:** Simple, cache-friendly · **Cons:** Clustering, load factor management

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

### Separate Chaining

Each bucket holds a **linked list** of colliding key-value pairs.

| Case | Complexity |
|------|------------|
| Average (short lists) | **O(1)** |
| Worst (all keys same bucket) | **O(n)** |

**Pros:** No clustering, flexible · **Cons:** Extra memory, list overhead

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

## What is a perfect hash function, double hashing, and how do you handle cryptographic hash collisions?

### Perfect Hash Function

Maps a **fixed key set** to unique slots — **zero collisions**. Ideal for static data (e.g. compiler keyword tables); impractical for dynamic sets.

### Double Hashing

Open addressing with **two hash functions**: `hash1` for initial index, `hash2` for step size.

1. `index = hash1(key) % size`
2. `step = hash2(key) % size` (non-zero)
3. On collision: `index = (index + step) % size`

| Case | Complexity |
|------|------------|
| Average | **O(1)** |
| Worst | **O(n)** |

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

### Cryptographic Hash Collisions

Two different inputs → same hash output. Mitigation:

| Strategy | Purpose |
|----------|---------|
| **Strong algorithms** | SHA-256, SHA-3 — collision-resistant |
| **Salting** | Random salt defeats rainbow tables |
| **Longer output** | Lower collision probability |
| **Algorithm rotation** | Replace if vulnerability found |

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
