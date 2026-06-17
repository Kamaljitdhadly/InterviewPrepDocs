# Data Structures and Algorithms Miscellaneous
## Questions Covered

1. What is a Trie, and how is it used?
2. How do you implement an LRU cache?
3. What is a Bloom filter and its use cases?
4. How do you design a data structure to support insert, delete, and getRandom in constant time?
5. What is a segment tree and its applications?
6. What is a disjoint-set (union-find) data structure, and how does it work?
## What is a Trie, and how is it used?

### Trie (Prefix Tree)

**Trie** stores a dynamic set of strings; each node = one character; root-to-leaf paths = keys. Also called **prefix tree** or **digital tree**.

### Structure

- **Nodes:** one character each, multiple children.
- **Edges:** character transitions.
- **Root:** empty starting node.

### Operations

1. **Insertion:** traverse/create nodes per character; mark end-of-word.
2. **Search:** traverse; confirm end marker.
3. **Deletion:** remove nodes if no shared prefix remains.
4. **Prefix Search:** check if any key starts with prefix.

### Advantages

- Efficient prefix queries (autocomplete).
- Lexicographical ordering via tree structure.

### Disadvantages

- Memory-intensive (per-character nodes).

### Applications

Autocomplete, spell checking, IP routing, text search/pattern matching.

### Example Implementation in C#

```csharp
using System;
using System.Collections.Generic;
class TrieNode
{
  public Dictionary<char, TrieNode> Children { get; set; }
  public bool IsEndOfWord { get; set; }
  public TrieNode()
  {
    Children = new Dictionary<char, TrieNode>();
    IsEndOfWord = false;
  }
}
class Trie
{
  private TrieNode root;
  public Trie()
  {
    root = new TrieNode();
  }
  // Insert a word into the Trie
  public void Insert(string word)
  {
    TrieNode node = root;
    foreach (char ch in word)
    {
      if (!node.Children.ContainsKey(ch))
      {
        node.Children[ch] = new TrieNode();
      }
      node = node.Children[ch];
    }
    node.IsEndOfWord = true;
  }
  // Search for a word in the Trie
  public bool Search(string word)
  {
    TrieNode node = root;
    foreach (char ch in word)
    {
      if (!node.Children.ContainsKey(ch))
      {
        return false;
      }
      node = node.Children[ch];
    }
    return node.IsEndOfWord;
  }
  // Check if there is any word in the Trie that starts with the given prefix
  public bool StartsWith(string prefix)
  {
    TrieNode node = root;
    foreach (char ch in prefix)
    {
      if (!node.Children.ContainsKey(ch))
      {
        return false;
      }
      node = node.Children[ch];
    }
    return true;
  }
}
```

### Usage Example

```csharp
class Program
{
  static void Main()
  {
    Trie trie = new Trie();
    trie.Insert("apple");
    trie.Insert("app");
    Console.WriteLine(trie.Search("apple")); // Output: True
    Console.WriteLine(trie.Search("app")); // Output: True
    Console.WriteLine(trie.Search("appl")); // Output: False
    Console.WriteLine(trie.StartsWith("ap")); // Output: True
    Console.WriteLine(trie.StartsWith("bpp")); // Output: False
  }
}
```

### Summary

Trie efficiently stores/queries strings with fast prefix lookups; memory cost is the trade-off.
## How do you implement an LRU cache?

**LRU Cache** evicts the least recently used item when capacity is exceeded. Keeps hot data in limited memory.

### Data Structures Used

1. **Hash Map:** O(1) key → node lookup.
2. **Doubly Linked List:** O(1) insert/remove; MRU at head, LRU at tail.

### How It Works

- **Get:** return value, move node to head.
- **Put:** update existing → move to head; new key → evict tail if full, insert at head.

### Example Implementation in C#

```csharp
using System;
using System.Collections.Generic;
public class LRUCache
{
  private class Node
  {
    public int Key { get; set; }
    public int Value { get; set; }
    public Node Prev { get; set; }
    public Node Next { get; set; }
  }
  private readonly int capacity;
  private readonly Dictionary<int, Node> cache;
  private readonly Node head;
  private readonly Node tail;
  public LRUCache(int capacity)
  {
    this.capacity = capacity;
    cache = new Dictionary<int, Node>(capacity);
    head = new Node(); // Dummy head
    tail = new Node(); // Dummy tail
    head.Next = tail;
    tail.Prev = head;
  }
  public int Get(int key)
  {
    if (cache.TryGetValue(key, out Node node))
    {
      MoveToHead(node);
      return node.Value;
    }
    return -1; // Indicates that the key was not found
  }
  public void Put(int key, int value)
  {
    if (cache.TryGetValue(key, out Node node))
    {
      // Update the value and move the node to the head
      node.Value = value;
      MoveToHead(node);
    }
    else
    {
      if (cache.Count >= capacity)
      {
        // Remove the least recently used item
        RemoveTail();
      }
      // Insert the new node
      Node newNode = new Node { Key = key, Value = value };
      AddToHead(newNode);
      cache[key] = newNode;
    }
  }
  private void MoveToHead(Node node)
  {
    // Remove the node from its current position
    RemoveNode(node);
    // Add the node to the head
    AddToHead(node);
  }
  private void RemoveNode(Node node)
  {
    node.Prev.Next = node.Next;
    node.Next.Prev = node.Prev;
  }
  private void AddToHead(Node node)
  {
    node.Next = head.Next;
    node.Prev = head;
    head.Next.Prev = node;
    head.Next = node;
  }
  private void RemoveTail()
  {
    Node tailNode = tail.Prev;
    RemoveNode(tailNode);
    cache.Remove(tailNode.Key);
  }
}
```

### Usage Example

```csharp
class Program
{
  static void Main()
  {
    LRUCache lruCache = new LRUCache(2);
    lruCache.Put(1, 1);
    lruCache.Put(2, 2);
    Console.WriteLine(lruCache.Get(1)); // Returns 1
    lruCache.Put(3, 3); // Evicts key 2
    Console.WriteLine(lruCache.Get(2)); // Returns -1 (not found)
    lruCache.Put(4, 4); // Evicts key 1
    Console.WriteLine(lruCache.Get(1)); // Returns -1 (not found)
    Console.WriteLine(lruCache.Get(3)); // Returns 3
    Console.WriteLine(lruCache.Get(4)); // Returns 4
  }
}
```

### Summary

Hash map + doubly linked list = O(1) get/put with LRU eviction.
## What is a Bloom filter and its use cases?

**Bloom filter** — probabilistic set membership test. **No false negatives**; possible **false positives**. Space-efficient for large sets.

### How It Works

1. Multiple hash functions map elements to bit array positions.
2. **Insert:** set all hashed positions to 1.
3. **Query:** if any position is 0 → definitely not in set; all 1 → might be in set.

### Key Characteristics

- False positives possible (hash collisions); no false negatives.
- Low memory vs hash tables; scales to large sets.

### Use Cases

1. **Caching/DB:** quick "might exist" checks before disk/network lookup.
2. **Network:** spam filtering, routing tables.
3. **Databases/FS:** HBase, HDFS lookups.
4. **Security:** intrusion detection signature checks.

### Example Implementation in C#

```csharp
using System;
using System.Collections.Generic;
public class BloomFilter
{
  private readonly int size;
  private readonly int[] bitArray;
  private readonly Func<string, int>[] hashFunctions;
  public BloomFilter(int size, params Func<string, int>[] hashFunctions)
  {
    this.size = size;
    this.bitArray = new int[size];
    this.hashFunctions = hashFunctions;
  }
  public void Add(string item)
  {
    foreach (var hashFunction in hashFunctions)
    {
      int hash = hashFunction(item) % size;
      bitArray[Math.Abs(hash)] = 1;
    }
  }
  public bool Contains(string item)
  {
    foreach (var hashFunction in hashFunctions)
    {
      int hash = hashFunction(item) % size;
      if (bitArray[Math.Abs(hash)] == 0)
      {
        return false;
      }
    }
    return true;
  }
}
class Program
{
  static void Main()
  {
    Func<string, int> hash1 = s => s.Length;
    Func<string, int> hash2 = s => s[0];
    BloomFilter bloomFilter = new BloomFilter(100, hash1, hash2);
    bloomFilter.Add("hello");
    bloomFilter.Add("world");
    Console.WriteLine(bloomFilter.Contains("hello")); // Output: True
    Console.WriteLine(bloomFilter.Contains("world")); // Output: True
    Console.WriteLine(bloomFilter.Contains("test")); // Output: False (might be false positive)
  }
}
```

### Summary

Space-efficient probabilistic membership; trade accuracy for memory in caching, DBs, and networks.
## How do you design a data structure to support insert, delete, and getRandom in constant time?

Combine **hash map** (value → index) + **dynamic array** (elements) for O(1) insert, delete, getRandom.

### Operations

1. **Insert:** append to list, store index in map.
2. **Delete:** swap with last element, pop, update map indices.
3. **GetRandom:** random index into list.

### Example Implementation in C#

```csharp
using System;
using System.Collections.Generic;
public class RandomizedSet
{
  private List<int> _list;
  private Dictionary<int, int> _dict;
  private Random _random;
  public RandomizedSet()
  {
    _list = new List<int>();
    _dict = new Dictionary<int, int>();
    _random = new Random();
  }
```

// Inserts a value to the set. Returns true if the set did not already contain the specified element.

```csharp
public bool Insert(int val)
{
  if (_dict.ContainsKey(val))
  {
    return false; // The value already exists in the set.
  }
  _list.Add(val);
  _dict[val] = _list.Count - 1;
  return true;
}
```

// Removes a value from the set. Returns true if the set contained the specified element.

```csharp
public bool Remove(int val)
{
  if (!_dict.ContainsKey(val))
  {
    return false; // The value does not exist in the set.
  }
  // Get the index of the element to remove.
  int index = _dict[val];
  int lastElement = _list[_list.Count - 1];
  // Swap the element with the last one.
  _list[index] = lastElement;
  _dict[lastElement] = index;
  // Remove the last element.
  _list.RemoveAt(_list.Count - 1);
  _dict.Remove(val);
  return true;
}
// Get a random element from the set.
public int GetRandom()
{
  int randomIndex = _random.Next(_list.Count);
  return _list[randomIndex];
}
}
```

### Usage Example

```csharp
class Program
{
  static void Main()
  {
    RandomizedSet randomizedSet = new RandomizedSet();
    Console.WriteLine(randomizedSet.Insert(1)); // Output: True (1 was inserted)
    Console.WriteLine(randomizedSet.Insert(2)); // Output: True (2 was inserted)
    Console.WriteLine(randomizedSet.Insert(2)); // Output: False (2 already exists)
    Console.WriteLine(randomizedSet.GetRandom()); // Output: Randomly returns 1 or 2
    Console.WriteLine(randomizedSet.Remove(1)); // Output: True (1 was removed)
    Console.WriteLine(randomizedSet.Remove(1)); // Output: False (1 does not exist)
    Console.WriteLine(randomizedSet.GetRandom()); // Output: 2 (only 2 is left)
  }
}
```

### Summary

Map + list with swap-delete: O(1) insert, delete, getRandom.
## What is a segment tree and its applications?

**Segment tree** answers **range queries** and **range updates** in O(log n). Binary tree of array intervals; root = full array, leaves = elements.

### Basic Operations

1. **Build:** O(n)
2. **Query:** O(log n) — sum, min, max, GCD, etc.
3. **Update:** O(log n) — point or range updates

### Applications

Range sum/min/max/GCD queries, range add/update, frequency counts, interval DP problems.

### Example Implementation in C#

```csharp
using System;
public class SegmentTree
{
  private int[] tree;
  private int[] arr;
  private int n;
  public SegmentTree(int[] array)
  {
    n = array.Length;
    arr = array;
    tree = new int[4 * n];
    Build(0, 0, n - 1);
  }
  private void Build(int node, int start, int end)
  {
    if (start == end)
    {
      tree[node] = arr[start];
    }
    else
    {
      int mid = (start + end) / 2;
      Build(2 * node + 1, start, mid);
      Build(2 * node + 2, mid + 1, end);
      tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
    }
  }
  public void Update(int index, int value)
  {
    Update(0, 0, n - 1, index, value);
  }
  private void Update(int node, int start, int end, int index, int value)
  {
    if (start == end)
    {
      arr[index] = value;
      tree[node] = value;
    }
    else
    {
      int mid = (start + end) / 2;
      if (start <= index && index <= mid)
      {
        Update(node * 2 + 1, start, mid, index, value);
      }
      else
      {
        Update(node * 2 + 2, mid + 1, end, index, value);
      }
      tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
    }
  }
  public int Query(int left, int right)
  {
    return Query(0, 0, n - 1, left, right);
  }
  private int Query(int node, int start, int end, int left, int right)
  {
    if (right < start || end < left)
    {
      return 0; // Out of range
    }
    if (left <= start && end <= right)
    {
      return tree[node]; // Current segment is completely within the range
    }
    int mid = (start + end) / 2;
    int leftQuery = Query(2 * node + 1, start, mid, left, right);
    int rightQuery = Query(2 * node + 2, mid + 1, end, left, right);
    return leftQuery + rightQuery;
  }
}
class Program
{
  static void Main()
  {
    int[] array = { 1, 3, 5, 7, 9, 11 };
    SegmentTree segmentTree = new SegmentTree(array);
    Console.WriteLine("Sum of values in range [1, 3]: " + segmentTree.Query(1, 3)); // Output: 15
    segmentTree.Update(1, 10); // Update value at index 1 to 10
    Console.WriteLine("Sum of values in range [1, 3] after update: " + segmentTree.Query(1, 3)); // Output: 22
  }
}
```

### Summary

O(log n) range queries/updates; extensible beyond sum to min/max/GCD.
## What is a disjoint-set (union-find) data structure, and how does it work?

**Disjoint-set (union-find)** tracks partitioned sets with efficient **Union** (merge) and **Find** (representative lookup).

### Key Components

1. **Parent array:** `parent[i]=i` means i is root/representative.
2. **Rank array:** keeps trees shallow during union.

### Operations

1. **Find:** locate root with **path compression**.
2. **Union:** merge by attaching smaller-rank tree under larger (**union by rank**).

### Example Implementation in C#

```csharp
using System;
public class DisjointSet
{
  private int[] parent;
  private int[] rank;
  public DisjointSet(int size)
  {
    parent = new int[size];
    rank = new int[size];
    // Initialize each element to be its own parent and rank to be 0.
    for (int i = 0; i < size; i++)
    {
      parent[i] = i;
      rank[i] = 0;
    }
  }
  // Find with path compression.
  public int Find(int x)
  {
    if (parent[x] != x)
    {
      parent[x] = Find(parent[x]); // Path compression.
    }
    return parent[x];
  }
  // Union by rank.
  public void Union(int x, int y)
  {
    int rootX = Find(x);
    int rootY = Find(y);
    if (rootX != rootY)
    {
      if (rank[rootX] > rank[rootY])
      {
        parent[rootY] = rootX;
      }
      else if (rank[rootX] < rank[rootY])
      {
        parent[rootX] = rootY;
      }
      else
      {
        parent[rootY] = rootX;
        rank[rootX]++;
      }
    }
  }
}
class Program
{
  static void Main()
  {
    DisjointSet ds = new DisjointSet(5);
    ds.Union(0, 1);
    ds.Union(1, 2);
    ds.Union(3, 4);
    Console.WriteLine(ds.Find(0)); // Output: 0 (or 2, the root of the set containing 0)
    Console.WriteLine(ds.Find(1)); // Output: 0 (root of the set containing 1)
    Console.WriteLine(ds.Find(2)); // Output: 0 (root of the set containing 2)
    Console.WriteLine(ds.Find(3)); // Output: 3 (or 4, the root of the set containing 3)
    Console.WriteLine(ds.Find(4)); // Output: 3 (root of the set containing 4)
  }
}
```

### Key Concepts

1. **Path compression:** nodes point directly to root.
2. **Union by rank:** attach smaller tree under larger.

### Applications

Kruskal's MST, network connectivity, equivalence classes, image segmentation.

### Summary

Union-find with path compression + union by rank ≈ O(α(n)) amortized per operation.
