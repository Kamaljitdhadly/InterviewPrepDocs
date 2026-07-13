# Data Structures and Algorithms Trie

Trie (Data Structure)

A **Trie** (pronounced as **"try"**) is a special type of **tree data structure** used to store and search **strings efficiently**.

It is also called a:

- **Prefix Tree**

- **Digital Tree**

- **Radix Tree** (in some variations)

The main idea of a Trie is:

Each node represents a character, and paths from the root represent words or prefixes.

### Real-Life Example

Think about the search box in Google.

You type:

app

Google suggests:

apple

application

app store

How does it quickly find these?

A Trie stores words by their common prefixes.

Basic Trie Structure

Suppose we store:

cat

car

can

Trie looks like:

Root

\|

c

\|

a

/ \| \\

t r n

The common prefix:

ca

is stored only once.

How Trie Stores Words

Let's insert:

apple

app

ape

Trie:

Root

\|

a

\|

p

\|

p

/ \\

\* l

\|

e

\*

a

/

p

e

\*

\* represents **end of word**.

Why do we need an end marker?

Because:

app

and

apple

have the same prefix.

The Trie needs to know that:

app

is a complete word.

Trie Node Structure

Each Trie node usually contains:

- Children references

- A flag indicating end of word

Example:

+----------------+

\| Character \|

- \| Children\[\] \|

\| IsEndOfWord \|

+----------------+

Trie Node Example in C#

class TrieNode

{

- public TrieNode\[\] Children = new TrieNode\[26\];

public bool IsEndOfWord;

}

Here:

- Children\[0\] = a

- Children\[1\] = b

- Children\[2\] = c

...

Because English alphabet has 26 characters.

Trie Operations

1. Insert

Insert the word:

cat

Initially:

Root

Step 1:

Create c

Root

\|

c

Step 2:

Create a

Root

\|

c

\|

a

Step 3:

Create t

Root

\|

c

\|

a

\|

t\*

Mark t as the end of the word.

2. Search

Search:

cat

Traverse:

Root

\|

c

\|

a

\|

t\*

If:

- All characters exist.

- Last node has IsEndOfWord = true.

Then:

Word exists

Search:

ca

Traversal succeeds:

Root → c → a

But:

a.IsEndOfWord = false

Therefore:

"ca" is not a complete word

3. Prefix Search

This is where Trie is powerful.

Question:

"Do we have words starting with:

app

Trie:

Root

\|

a

\|

p

\|

p

If this path exists:

Prefix exists

It does not matter whether it is a complete word.

### Time Complexity

Let:

L = length of the word

Insert

Example:

Insert:

apple

Characters processed:

a → p → p → l → e

Complexity:

O(L)

Search

Search:

apple

Visit each character:

O(L)

Prefix Search

Example:

app

Complexity:

O(L)

Trie vs Hash Table

| **Feature**     | **Trie**  | **Hash Table** |
|-----------------|-----------|----------------|
| Search          | O(L)      | O(1) average   |
| Prefix Search   | Excellent | Poor           |
| Memory          | Higher    | Lower          |
| Ordered Data    | Yes       | No             |
| String Handling | Better    | Good           |

### Why Use Trie Instead of HashSet?

Suppose you have:

apple

application

app

apply

apt

You want:

"Show all words starting with:

app

"

HashSet:

apple

application

app

apply

apt

You must scan everything.

Time:

O(n)

Trie:

a

\|

p

\|

p

/ \| \\

l \* l

Just follow:

a → p → p

Instantly find all matches.

Trie Applications

1. Auto Complete

Example:

Typing:

car

Suggestions:

car

card

care

career

Trie stores these prefixes.

2. Spell Checker

Example:

Wrong spelling:

aple

Trie contains:

apple

apply

ape

It can suggest corrections.

3. Dictionary Search

A dictionary application can store millions of words efficiently.

4. IP Routing

Routers use variations of Trie called:

- Binary Trie

- Patricia Trie

For IP address lookup.

5. Search Engines

Used for:

- Query suggestions

- Prefix matching

6. Word Games

Examples:

- Word search

- Scrabble

- Crossword helpers

Trie Implementation in C#

Example:

class TrieNode

{

public Dictionary\<char, TrieNode\> Children

= new Dictionary\<char, TrieNode\>();

public bool IsEndOfWord;

}

class Trie

{

private TrieNode root = new TrieNode();

public void Insert(string word)

{

TrieNode current = root;

foreach(char c in word)

{

if(!current.Children.ContainsKey(c))

{

- current.Children\[c\] = new TrieNode();

}

- current = current.Children\[c\];

}

current.IsEndOfWord = true;

}

public bool Search(string word)

{

TrieNode current = root;

foreach(char c in word)

{

if(!current.Children.ContainsKey(c))

return false;

- current = current.Children\[c\];

}

return current.IsEndOfWord;

}

}

Trie vs Binary Tree

| **Feature**     | **Trie**         | **Binary Tree**     |
|-----------------|------------------|---------------------|
| Stores          | Strings          | Any data            |
| Node Represents | Character        | Value               |
| Children        | Many             | Usually 2           |
| Main Use        | Prefix searching | Searching/traversal |

Trie vs BST

| **Feature**   | **Trie**      | **BST**             |
|---------------|---------------|---------------------|
| Data          | Strings       | Any comparable data |
| Search        | O(L)          | O(log n) average    |
| Prefix Search | Excellent     | Not efficient       |
| Ordering      | Lexical order | Sorted order        |

Common Interview Questions

- What is a Trie?

- Why is Trie called a Prefix Tree?

- How does Trie perform prefix search efficiently?

- Difference between Trie and HashMap?

- Why does Trie consume more memory?

- How do you delete a word from Trie?

- How is autocomplete implemented using Trie?

- What is the time complexity of Trie operations?

Advantages

✅ Very fast string searching\
✅ Excellent for prefix matching\
✅ Avoids repeated storage of common prefixes\
✅ Useful for autocomplete systems

Disadvantages

❌ High memory consumption\
❌ More complex implementation\
❌ Not useful for non-string data

Summary

| **Feature**   | **Trie**                         |
|---------------|----------------------------------|
| Type          | Tree-based data structure        |
| Also Called   | Prefix Tree                      |
| Stores        | Strings                          |
| Node Contains | Character + Children             |
| Search        | O(L)                             |
| Insert        | O(L)                             |
| Prefix Search | O(L)                             |
| Main Use      | Autocomplete, dictionary, search |

Key Takeaways

- A **Trie stores strings character by character**.

- Words with common prefixes share the same path.

- The biggest advantage of Trie is **fast prefix searching**.

- It is the backbone of features like **autocomplete, spell checking, search suggestions, and dictionary lookup**.
