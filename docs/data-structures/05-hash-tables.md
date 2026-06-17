# Hash Tables (Dictionaries / Sets)

## Concept Explanation

A **hash table** stores key-value pairs and provides **average O(1)** insertion, lookup, and deletion. It works by running each key through a **hash function** to compute an index into an internal array of **buckets**.

When two keys hash to the same bucket, that's a **collision**, resolved by:
- **Chaining** — each bucket holds a list of entries (C#'s `Dictionary` uses a variant of this).
- **Open addressing** — probe for the next free slot (linear/quadratic probing, double hashing).

In C#: **`Dictionary<TKey,TValue>`** (key→value), **`HashSet<T>`** (unique values, membership tests). A good hash function distributes keys uniformly; a poor one causes many collisions, degrading to O(n).

## Code Example(s)

```csharp
var dict = new Dictionary<string, int>();
dict["apple"] = 3;                 // O(1) average insert
dict["apple"] += 1;                // update
if (dict.TryGetValue("apple", out int count)) // O(1) lookup, no exception
    Console.WriteLine(count);      // 4

var set = new HashSet<int>();
set.Add(5);                        // returns true (added)
bool exists = set.Contains(5);     // O(1) average → true
```

```csharp
// Frequency counting — the canonical hash-map use case. O(n)
Dictionary<char, int> CharFrequency(string s)
{
    var freq = new Dictionary<char, int>();
    foreach (char c in s)
        freq[c] = freq.GetValueOrDefault(c) + 1;
    return freq;
}

// First non-repeating character using a frequency map — O(n)
char? FirstUnique(string s)
{
    var freq = CharFrequency(s);
    foreach (char c in s)
        if (freq[c] == 1) return c;
    return null;
}
```

## Interview Q&A

**🟢 What's the time complexity of hash table operations?**
Average O(1) for insert, lookup, and delete. Worst case is O(n) when many keys collide into one bucket.

**🟢 How does a hash table work?**
A hash function maps each key to a bucket index in an internal array. Values are stored in (or near) that bucket; lookups re-hash the key to find the bucket directly, giving near-constant time.

**🟡 What is a hash collision and how is it handled?**
When two keys hash to the same bucket. Handled by chaining (a list per bucket) or open addressing (probing for another slot). Good hashing minimizes collisions.

**🟡 When does a hash table degrade to O(n)?**
When the hash function distributes poorly or many keys collide, all entries pile into few buckets, turning lookups into linear scans. A high load factor without resizing also hurts.

**🔴 In C#/.NET, why must you override `GetHashCode` and `Equals` together for custom keys?**
The dictionary uses `GetHashCode` to pick the bucket and `Equals` to compare keys within it. If two "equal" objects return different hash codes, they land in different buckets and lookups fail. The contract: equal objects **must** have equal hash codes (the reverse isn't required).

## ⚠️ Tricky / Gotchas

- **Override `GetHashCode` and `Equals` together** for custom key types, or dictionary/set lookups silently fail (you store an item but can't find it).
- **Mutating a key after inserting it** changes its hash → it becomes unreachable in the table. Use immutable keys.
- **`dict[missingKey]` throws** `KeyNotFoundException`; use `TryGetValue` or `GetValueOrDefault` for safe access.
- **Hash tables don't preserve insertion or sorted order** — don't rely on enumeration order. Use `SortedDictionary`/`OrderedDictionary` if order matters.
- **Average vs worst case:** interviewers may probe the O(n) worst case (collision attacks / bad hashing) — acknowledge it.
- **`HashSet` for membership, not `List.Contains`** — `List.Contains` is O(n).

## 📌 Quick Recap

- Hash table = key→bucket via hash function; average O(1) insert/lookup/delete.
- Collisions resolved by chaining or open addressing; worst case O(n).
- C#: `Dictionary<K,V>` (pairs), `HashSet<T>` (unique membership).
- Override `GetHashCode` + `Equals` together for custom keys; use immutable keys.
- Use `TryGetValue`/`GetValueOrDefault` to avoid `KeyNotFoundException`.
- No guaranteed order; canonical uses: frequency counts, dedup, O(1) lookups.
