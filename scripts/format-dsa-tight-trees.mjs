import fs from 'node:fs';
import path from 'node:path';

const CLEAN = path.resolve('full/Data Structures and Algorithms');
const TIGHT = path.resolve('study/Data Structures and Algorithms');

const TREES_TOC = [
  'Tree: What is Tree in data structure?',
  'Binary Trees: What is a binary tree, and how do you perform in-order, pre-order, and post-order traversals?',
  'How do you find the height, check if a binary tree is balanced, or find the lowest common ancestor (LCA)?',
  'Binary Search Trees (BST): How do binary search trees differ from binary trees?',
  'How do you insert, delete nodes, or find the kth smallest element in a BST?',
  'How do you convert a BST to a sorted doubly linked list?',
  'Heaps: What is a heap, and how does it differ from a BST? How do you perform heap operations (insert, delete) and find the k largest/smallest elements in an array?',
  'Balanced Trees: What are AVL and Red-Black trees, and how do you perform rotations and maintain balance?',
  'B-Trees: What is a B-tree, and where is it commonly used?',
];

const EXTRA_HEADINGS = new Set([
  'What are different types of tree in data structure?',
  'Types of Trees in Data Structure According to the Number of Children',
  'Binary Tree',
  'Ternary Tree',
  'N-ary Tree (Generic Tree)',
  'Types of Trees in Data Structure According to the Nodes Values',
  'Conclusion',
]);

function extractCsharpBlocks(text) {
  const blocks = [];
  const stripped = text.replace(/```csharp\n([\s\S]*?)```/g, (_, code) => {
    const i = blocks.length;
    blocks.push(code);
    return `<<<CSHARP_${i}>>>`;
  });
  return { stripped, blocks };
}

function restoreCsharpBlocks(text, blocks) {
  return text.replace(/<<<CSHARP_(\d+)>>>/g, (_, i) => `\`\`\`csharp\n${blocks[+i]}\`\`\``);
}

function parseSections(text) {
  const re = /^## (.+)$/gm;
  const matches = [...text.matchAll(re)];
  const sections = [];
  for (let i = 0; i < matches.length; i++) {
    const heading = matches[i][1];
    const start = matches[i].index + matches[i][0].length + 1;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    sections.push({ heading, body: text.slice(start, end).trimEnd() });
  }
  return sections;
}

function condenseWhitespace(text) {
  return text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function condenseQ1(body) {
  const { stripped, blocks } = extractCsharpBlocks(body);
  let b = stripped
    .replace(
      /A \*\*tree\*\* in data structures is a hierarchical, non-linear data structure consisting of nodes connected by edges\. It is used to represent relationships between objects in a parent-child format\. A tree starts with a root node and expands outwards, with each node potentially having child nodes\./,
      'A **tree** is a hierarchical, acyclic structure of nodes and edges in parent-child form, rooted at one node.'
    )
    .replace(/- \*\*Node\*\*: A single element in the tree, which contains data and references \(links\) to its child nodes\./, '- **Node**: Data + child references.')
    .replace(/- \*\*Root\*\*: The topmost node in the tree\. It does not have a parent\./, '- **Root**: Top node; no parent.')
    .replace(/- \*\*Edge\*\*: A connection between two nodes\. It represents the parent-child relationship\./, '- **Edge**: Parent-child link.')
    .replace(/- \*\*Child\*\*: A node directly connected to another node when moving away from the root\./, '- **Child**: Node below parent.')
    .replace(/- \*\*Parent\*\*: A node that has one or more children\./, '- **Parent**: Has children.')
    .replace(/- \*\*Leaf\*\*: A node that has no children \(i\.e\., the end node in a branch\)\./, '- **Leaf**: No children.')
    .replace(/- \*\*Subtree\*\*: A tree consisting of a node and its descendants\./, '- **Subtree**: Node + descendants.')
    .replace(/- \*\*Depth\*\*: The number of edges from the root node to a particular node\./, '- **Depth**: Edges from root.')
    .replace(/- \*\*Height\*\*: The number of edges on the longest path from a node to a leaf\./, '- **Height**: Longest path to leaf.')
    .replace(/- \*\*Level\*\*: The depth of a node, which is the distance from the root \(the root is at level 0\)\./, '- **Level**: Depth from root (0 at root).')
    .replace(/- \*\*Siblings\*\*: Nodes that share the same parent\./, '- **Siblings**: Same parent.')
    .replace(/### Tree Properties[\s\S]*?### Types of Trees/, '### Tree Properties\n\n- **Acyclic**, **one root**, each non-root has exactly one parent.\n\n### Types of Trees')
    .replace(/1\.  \*\*Binary Tree\*\*:\s+- A tree where each node has at most two children[\s\S]*?7\.  \*\*Trie[\s\S]*?strings\./,
      '| Type | Key trait |\n|------|----------|\n| **Binary** | ≤2 children |\n| **BST** | left < node < right |\n| **Balanced/AVL** | height diff ≤ 1 |\n| **Heap** | complete + heap property |\n| **N-ary** | ≤N children |\n| **Trie** | prefix strings |')
    .replace(/### Tree Operations[\s\S]*?### Tree Traversals/, '### Operations & Traversals')
    .replace(/- \*\*Insertion\*\*: Adding a new node to the tree\.\s+- \*\*Deletion\*\*: Removing a node from the tree\.\s+- \*\*Traversal\*\*: Visiting all nodes in the tree \(e\.g\., in-order, pre-order, post-order, level-order\)\.\s+- \*\*Search\*\*: Finding a specific node based on its value\./,
      '- **Insert/Delete/Search**; **Traversals**: in/pre/post-order (DFS), level-order (BFS).')
    .replace(/- \*\*In-order Traversal \(DFS\*\*[\s\S]*?using a queue\./,
      '- **In-order**: L-root-R (BST → sorted). **Pre-order**: root-L-R. **Post-order**: L-R-root. **Level-order**: BFS queue.')
    .replace(/### Applications of Trees[\s\S]*?### Advantages of Trees[\s\S]*?### Disadvantages of Trees[\s\S]*?skewed binary trees\)\./,
      '### Applications / Trade-offs\n\n- **Uses**: file systems, DB indexes, ASTs, decision trees, routing.\n- **Pros**: hierarchy, efficient balanced ops, recursion-friendly.\n- **Cons**: pointer overhead; skew hurts performance.');
  return restoreCsharpBlocks(condenseWhitespace(b), blocks);
}

function condenseExtra(body) {
  const { stripped, blocks } = extractCsharpBlocks(body);
  let b = stripped
    .replace(/A tree represents a hierarchical arrangement[\s\S]*?retrieval of data\./, 'Trees branch by child count and node ordering.')
    .replace(/A binary tree is a type of general tree, except, with a constraint - a node can have only two child nodes\. The children nodes are known as the left child node and right child node\./,
      '**Binary tree**: ≤2 children (left/right).')
    .replace(/On the basis of number of children binary tree has two types:[\s\S]*?3\.  \*\*Balanced Binary Tree:\*\*[\s\S]*?0 or 1\./,
      '**By children**: full (0/2 internal), degenerate (1 child). **By shape**: perfect, complete, balanced (|hL−hR|≤1).')
    .replace(/It is a type of tree data structure where each node can have a maximum of three child nodes\., commonly referred to as "left", "mid", and "right"\./,
      '**Ternary tree**: ≤3 children (left/mid/right).')
    .replace(/A Ternary Search Tree \(TST\) is a specialized trie[\s\S]*?current node\./,
      '**TST**: trie-like; left/equal/right pointers by char comparison.')
    .replace(/An N-ary Tree, also called a Generic Tree[\s\S]*?may vary\./,
      '**N-ary/generic**: variable child count; no duplicate child refs.')
    .replace(/A \[binary search tree\][\s\S]*?search operations\./,
      '**BST** (by value): left < parent < right.')
    .replace(/A self-balancing binary search tree is called an AVL tree\.[\s\S]*?balancing factor is \*\*1\*\*\./,
      '**AVL**: balance factor ∈ {-1,0,1}.')
    .replace(/To learn more about the AVL tree, refer to[\s\S]*?avl-tree\/\)\./, '')
    .replace(/The red-black tree is also a self-balancing tree\.[\s\S]*?black nodes\./,
      '**Red-Black**: colored nodes; root/leaves black; no adjacent reds; equal black depth.')
    .replace(/To learn about the red-black tree in detail, refer to[\s\S]*?red-black-tree\/\)\./, '')
    .replace(/A B-Tree is a self-balancing search tree[\s\S]*?structure of the tree\./,
      '**B-tree** (preview): uniform leaf level; min degree t; sorted keys; disk-oriented.')
    .replace(/A B\+ tree is an enhancement[\s\S]*?search operations\./,
      '**B+ tree**: data pointers only in leaves — faster sequential scan.')
    .replace(/A segment tree is a binary tree utilized[\s\S]*?two indices\)\./,
      '**Segment tree**: interval aggregates; range update/query.')
    .replace(/1\.  Trees are hierarchical[\s\S]*?queries in arrays\./,
      'Trees vary by child count (binary/ternary/N-ary) and ordering (BST, balanced, B-tree, segment tree).');
  return restoreCsharpBlocks(condenseWhitespace(b), blocks);
}

function condenseBinaryTrees(body) {
  const { stripped, blocks } = extractCsharpBlocks(body);
  let b = stripped
    .replace(/A \*\*binary tree\*\* is a tree data structure[\s\S]*?hierarchical storage\./,
      '**Binary tree**: ≤2 children (left/right).')
    .replace(/Each node in a binary tree has:[\s\S]*?### \*\*Types of Binary Trees\*\*/,
      '### Types')
    .replace(/Traversal refers to visiting[\s\S]*?depth-first traversal:/,
      '**DFS traversals**:')
    .replace(/In in-order traversal[\s\S]*?right subtree\./, '')
    .replace(/In pre-order traversal[\s\S]*?right subtree\./, '')
    .replace(/In post-order traversal[\s\S]*?root node\./, '')
    .replace(/#### Example of In-order Traversal:[\s\S]*?4 2 5 1 3\./, 'Tree `1/2,3/4,5` → in-order: **4 2 5 1 3**.')
    .replace(/#### Example of Pre-order Traversal:[\s\S]*?1 2 4 5 3\./, '→ pre-order: **1 2 4 5 3**.')
    .replace(/#### Example of Post-order Traversal:[\s\S]*?4 5 2 3 1\./, '→ post-order: **4 5 2 3 1**.')
    .replace(/Here’s a complete example showing all three traversals in C#:/, '**Full example:**')
    .replace(/- \*\*Time Complexity\*\* for all traversals: O\(n\)[\s\S]*?height of the tree\./,
      '- **Time** O(n); **space** O(h) recursion stack.');
  return restoreCsharpBlocks(condenseWhitespace(b), blocks);
}

function condenseHeight(body) {
  const { stripped, blocks } = extractCsharpBlocks(body);
  let b = stripped
    .replace(/The \*\*height\*\* of a binary tree is[\s\S]*?height is 0\./, '**Height**: longest root-to-leaf edges (empty −1, single node 0).')
    .replace(/A \*\*balanced binary tree\*\* is one where[\s\S]*?at any node\./, '**Balanced**: |h(left)−h(right)|≤1 at every node.')
    .replace(/The \*\*lowest common ancestor \(LCA\)\*\*[\s\S]*?descendant of itself\)\./, '**LCA**: lowest ancestor of both nodes (node counts as own descendant).')
    .replace(/#### \*\*Explanation:\*\*[\s\S]*?(?=###|#### \*\*Example)/g, '')
    .replace(/#### \*\*Example:\*\*[\s\S]*?LCA is 5\./, 'Example: LCA(5,1)=3; LCA(5,4)=5.')
    .replace(/### \*\*Summary of Operations\*\*[\s\S]*/,
      '### Summary\n\n| Op | Time |\n|----|------|\n| Height | O(n) |\n| Balanced check | O(n) |\n| LCA | O(n) |');
  return restoreCsharpBlocks(condenseWhitespace(b), blocks);
}

function condenseBST(body) {
  const { stripped, blocks } = extractCsharpBlocks(body);
  let b = stripped
    .replace(/### \*\*Binary Tree vs\. Binary Search Tree \(BST\)\*\*[\s\S]*?differences:/,
      '**Binary tree**: no ordering. **BST**: left < parent < right → in-order sorted; O(log n) when balanced.')
    .replace(/### \*\*1\. Binary Tree\*\*[\s\S]*?### \*\*2\. Binary Search Tree \(BST\)\*\*/, '')
    .replace(/#### \*\*Example of Binary Tree:\*\*[\s\S]*?left and right children\./, '')
    .replace(/#### \*\*Example of Binary Search Tree:\*\*[\s\S]*?greater than 10\./, 'BST example: 10 with left {2,5,7}, right {15,20}.')
    .replace(/1\.  \*\*Search Operation in BST\*\*:[\s\S]*?greater than the root\./, '**Search/Insert** (recursive):')
    .replace(/3\.  \*\*Deletion in BST\*\*:[\s\S]*?successor\)\./, '**Delete**: leaf / one child / two children (swap with successor).')
    .replace(/### \*\*Applications of BST\*\*[\s\S]*?### \*\*Advantages of BST\*\*[\s\S]*?### \*\*Disadvantages of BST\*\*[\s\S]*?complexity\./,
      '**Uses**: dynamic sorted sets. **Caveat**: skew → O(n); use AVL/RB.');
  return restoreCsharpBlocks(condenseWhitespace(b), blocks);
}

function condenseInsert(body) {
  const { stripped, blocks } = extractCsharpBlocks(body);
  let b = stripped
    .replace(/Insertion in a BST follows[\s\S]*?new value\./, '**Insert**: go left/right until null.')
    .replace(/There are three possible cases when deleting[\s\S]*?right subtree\)\./, '**Delete**: 3 cases — leaf, one child, two children (in-order successor).')
    .replace(/The kth smallest element[\s\S]*?sorted order\./, '**kth smallest**: in-order with counter.')
    .replace(/#### \*\*Explanation\*\*:[\s\S]*?(?=###)/g, '')
    .replace(/### \*\*Summary\*\*[\s\S]*/, '### Summary\n\n| Op | Time |\n|----|------|\n| Insert/Delete | O(h) |\n| kth smallest | O(n) |');
  return restoreCsharpBlocks(condenseWhitespace(b), blocks);
}

function condenseDLL(body) {
  const { stripped, blocks } = extractCsharpBlocks(body);
  let b = stripped
    .replace(/To convert a \*\*Binary Search Tree \(BST\)\*\*[\s\S]*?sorted order\./, '**BST → sorted DLL**: in-order; rewire Left/Right as prev/next.')
    .replace(/### \*\*Steps to Convert BST to a Doubly Linked List:\*\*[\s\S]*?### \*\*C# Implementation\*\*:/, '### C# Implementation')
    .replace(/### \*\*Explanation\*\*:[\s\S]*?### \*\*Time Complexity\*\*:/, '### Time Complexity')
    .replace(/- The time complexity[\s\S]*?exactly once\./, 'O(n) — visit each node once.')
    .replace(/### \*\*Example\*\*:[\s\S]*?required\)\./, '**Example**: BST 10/5,15/3,7,12 → DLL 3↔5↔7↔10↔12↔15. O(1) extra space.');
  return restoreCsharpBlocks(condenseWhitespace(b), blocks);
}

function condenseHeaps(body) {
  const { stripped, blocks } = extractCsharpBlocks(body);
  let b = stripped
    .replace(/A \*\*heap\*\* is a \*\*binary tree\*\*[\s\S]*?left to right\./,
      '**Heap**: complete binary tree; **max-heap** parent≥children, **min-heap** parent≤children.')
    .replace(/When inserting a new element into a heap:[\s\S]*?smaller than its parent\./, '**Insert**: append; **heapify up**.')
    .replace(/Deleting the root element[\s\S]*?any of its children\./, '**Delete max**: last→root; **heapify down**.')
    .replace(/#### \*\*Finding the k Largest Elements Using a Min Heap\*\*[\s\S]*?##### C# Code for Finding k Largest Elements:/, '#### k Largest (min-heap size k)\n\n')
    .replace(/#### \*\*Finding the k Smallest Elements Using a Max Heap\*\*[\s\S]*?k smallest elements\./, '#### k Smallest: max-heap size k — replace root when smaller value seen.');
  return restoreCsharpBlocks(condenseWhitespace(b), blocks);
}

function condenseBalanced(body) {
  const { stripped, blocks } = extractCsharpBlocks(body);
  let b = stripped
    .replace(/Balanced trees are self-balancing[\s\S]*?Red-Black Trees\*\*\./,
      'Self-balancing BSTs: **AVL** (strict) and **Red-Black** (looser).')
    .replace(/An \*\*AVL tree\*\* is a self-balancing[\s\S]*?restore balance\./,
      '**AVL**: balance factor = h(left)−h(right) ∈ {-1,0,1}.')
    .replace(/When the balance factor[\s\S]*?on the root\./,
      '**Rotations**: LL→right, RR→left, LR/RL→double rotation.')
    .replace(/A \*\*Red-Black Tree\*\* is a self-balancing[\s\S]*?balanced structure\./,
      '**RBT**: red/black colors; root black; no red-red; equal black height paths.')
    .replace(/When a new node is inserted[\s\S]*?fix the violation\./, 'Insert red; fix via recolor + rotate.')
    .replace(/### \*\*Finding the k Largest\/Smallest[\s\S]*?respectively\./, '')
    .replace(/### \*\*Key Summary\*\*:[\s\S]*/,
      '### Summary\n\n| | AVL | Red-Black |\n|---|-----|------------|\n| Balance | Strict | Looser |\n| Rotations | More | Fewer |\n| Best for | Reads | Writes |');
  return restoreCsharpBlocks(condenseWhitespace(b), blocks);
}

function condenseBTrees(body) {
  const { stripped, blocks } = extractCsharpBlocks(body);
  let b = stripped
    .replace(/A \*\*B-tree\*\* is a self-balancing tree[\s\S]*?during operations\./,
      '**B-tree**: multi-key, disk-friendly; shallow; minimizes I/O.')
    .replace(/### \*\*Key Properties of B-Trees:\*\*[\s\S]*?### \*\*Structure of a B-Tree:\*\*/,
      '### Properties & Structure')
    .replace(/1\.  \*\*Balanced Tree:\*\*[\s\S]*?fewer levels\./, '- Multi-key nodes; all leaves same level; block-oriented.')
    .replace(/2\.  \*\*Nodes Can Have Multiple Keys:\*\*[\s\S]*?m children\./, '')
    .replace(/3\.  \*\*Child Nodes:\*\*[\s\S]*?child nodes\./, '')
    .replace(/4\.  \*\*Height:\*\*[\s\S]*?operations\./, '')
    .replace(/5\.  \*\*Balanced Nodes:\*\*[\s\S]*?deletion\./, '')
    .replace(/6\.  \*\*Efficient Disk Access:\*\*[\s\S]*?delete operations\./, '')
    .replace(/### \*\*Operations in B-Trees:\*\*[\s\S]*?### \*\*B-Tree Operations Time Complexity:\*\*/,
      '### Operations')
    .replace(/1\.  \*\*Search:\*\*[\s\S]*?binary trees\./, '**Search/Insert/Delete** O(log n); insert splits full nodes; delete may borrow/merge.')
    .replace(/2\.  \*\*Insertion:\*\*[\s\S]*?by 1\./, '')
    .replace(/3\.  \*\*Deletion:\*\*[\s\S]*?the tree\./, '')
    .replace(/### \*\*Where B-Trees Are Commonly Used:\*\*[\s\S]*?index data\./,
      '### Uses\n\nDB indexes (B+), file systems (NTFS, HFS+), search engines.')
    .replace(/### \*\*Advantages of B-Trees:\*\*[\s\S]*?### \*\*Disadvantages of B-Trees:\*\*[\s\S]*?balancing\./, '')
    .replace(/### \*\*Key Summary:\*\*[\s\S]*/,
      '### Summary\n\nMulti-key nodes; sorted keys; great for disk blocks; complex in-memory.');
  return restoreCsharpBlocks(condenseWhitespace(b), blocks);
}

const CONDENSERS = {
  [TREES_TOC[0]]: condenseQ1,
  [TREES_TOC[1]]: condenseBinaryTrees,
  [TREES_TOC[2]]: condenseHeight,
  [TREES_TOC[3]]: condenseBST,
  [TREES_TOC[4]]: condenseInsert,
  [TREES_TOC[5]]: condenseDLL,
  [TREES_TOC[6]]: condenseHeaps,
  [TREES_TOC[7]]: condenseBalanced,
  [TREES_TOC[8]]: condenseBTrees,
};

function tightenTrees() {
  const raw = fs.readFileSync(path.join(CLEAN, 'Data Structures and Algorithms Trees.md'), 'utf8');
  const sections = parseSections(raw);

  // last occurrence wins for duplicate TOC headings
  const byHeading = new Map();
  for (const s of sections) byHeading.set(s.heading, s.body);

  let extra = '';
  for (const s of sections) {
    if (EXTRA_HEADINGS.has(s.heading)) extra += `\n\n### ${s.heading}\n\n${s.body}`;
  }

  const tocBlock = `## Questions Covered

${TREES_TOC.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;

  let out = '# Data Structures and Algorithms Trees\n' + tocBlock + '\n';

  for (const h of TREES_TOC) {
    let body = byHeading.get(h) || '';
    if (h === TREES_TOC[0] && extra) body += '\n\n' + condenseExtra(extra);
    body = CONDENSERS[h](body);
    out += `\n## ${h}\n\n${body}\n`;
  }

  out = out.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
  fs.mkdirSync(TIGHT, { recursive: true });
  const outPath = path.join(TIGHT, 'Data Structures and Algorithms Trees.md');
  fs.writeFileSync(outPath, out, 'utf8');

  const csharpCount = (out.match(/```csharp/g) || []).length;
  return { raw: raw.length, tight: out.length, csharpCount, outPath };
}

// --- Concepts (reuse prior logic) ---
function tightenConcepts() {
  const raw = fs.readFileSync(path.join(CLEAN, 'Data Structures and Algorithms Trees Concepts.md'), 'utf8');
  let t = raw;
  t = t.replace(
    /In data structures, trees are hierarchical structures consisting of nodes connected by edges\. Various types of trees are used to solve different problems in computer science\. Below are the key types of trees:/,
    'Trees are hierarchical node-edge structures. Key types:'
  );
  t = t.replace(/- \*\*Definition\*\*: ([^\n]+)\n\n- \*\*Concept\*\*: ([^\n]+)/g, '- **Definition**: $1 — $2');
  t = t.replace(/- In this binary tree:\n\n  - Node A/g, '- Root A; children B,C; B has D,E.');
  t = t.replace(/- In this BST:\n\n  - Nodes in the left[\s\S]*?are larger\./, '- Left of 20 < 20 < right subtree.');
  t = t.replace(/- Here, the tree is balanced[\s\S]*?equal heights\./, '- Subtree heights differ by ≤1.');
  t = t.replace(/- The nodes are filled level by level[\s\S]*?as possible\./, '- Levels filled left-to-right.');
  t = t.replace(/- Every node has either 0 children[\s\S]*?internal nodes\)\./, '- Internal nodes have exactly 2 children.');
  t = t.replace(/- All leaf nodes \(4, 5, 6, 7\) are at the same level[\s\S]*?balanced\./, '- All leaves same depth.');
  t = t.replace(/- Each node can have more than two children[\s\S]*?balanced\./, '- Multi-child nodes; stays balanced.');
  t = t.replace(/- The root is always the largest[\s\S]*?heap property\./, '- Root is max; heap property throughout.');
  t = t.replace(/- Each path from root to a leaf represents a word[\s\S]*?c -> a -> t\./, '- Paths spell stored words (e.g. cat).');
  t = t.replace(/- This segment tree stores sums[\s\S]*?range sum queries\./, '- Internal nodes store segment sums for O(log n) queries.');
  t = t.replace(/- Each index in the Fenwick Tree[\s\S]*?fast queries\./, '- BIT stores prefix sums for O(log n) update/query.');
  t = t.replace(/- Each node can have multiple children[\s\S]*?three children\./, '- Up to 3 children per node.');
  t = t.replace(/### Summary[\s\S]*?computer science\./,
    '### Summary\n\nBinary → BST → balanced (AVL/RB) → complete (heap) → B-tree (disk) → trie (prefix) → segment/Fenwick (ranges) → N-ary (general hierarchy).');
  t = t.replace(/### Example of AVL Tree Insertion[\s\S]*?so the tree is balanced\./,
    '### AVL Insertion Example\n\nInsert 10,20,30,40,50,25: RR cases → left rotations; final root 20 with balanced subtrees.');
  t = t.replace(/### Step-by-Step Red-Black Tree Insertion:[\s\S]*?5\(R\) 15\(R\) 25\(R\)/,
    '### Red-Black Insertion Example\n\nInsert 10,20,30,15,25,5: fix red-red violations via rotate+recolor; root stays black.');
  t = t.replace(/### Step 1: Insert 10[\s\S]*?greater than or equal to its children\./,
    '### Max-Heap Build (10,20,30,25,5,40,35)\n\nInsert at next leaf; bubble up → root 40.');
  t = t.replace(/### Step 1: Insert 10[\s\S]*?less than or equal to its children\./,
    '### Min-Heap Build (same values)\n\nBubble to maintain min property → root 5.');
  t = t.replace(/#### Step 1: Insert 10, 20, 30[\s\S]*?balanced again\./,
    '#### B-Tree Build (t=3)\n\nSplit on overflow; e.g. `[30,60] / [10,20] | [40,50] | [70,80]`.');
  t = t.replace(/#### Step 1: Inserting "the"[\s\S]*?diverge at different nodes\./,
    '#### Trie for ["the","there","their","then","that","these"]\n\nShared `t→h→e` prefix; branches per word. O(m) search.');
  t = t.replace(/### Example: Building a Segment Tree[\s\S]*?reflect the change\./,
    '### Segment Tree ([1,3,5,7,9,11])\n\nRoot=36; query [1,3]=15; point update propagates in O(log n).');
  t = t.replace(/A \*\*Balanced Binary Tree\*\* is a special type[\s\S]*?O\(log n\)\)\./,
    '**Balanced binary tree**: |hL−hR|≤1 everywhere → O(log n) ops.');
  t = t.replace(/An \*\*AVL Tree\*\* is a self-balancing[\s\S]*?O\(log n\)\)\./,
    '**AVL**: BST + balance factor ∈ {-1,0,1}; rotations on insert/delete.');
  t = t.replace(/### Properties of AVL Trees[\s\S]*?### Balance Factor[\s\S]*?or \+1\./,
    '### AVL Properties\n\nBST ordering; balance factor ∈ {-1,0,1}; self-balance via rotations.');
  t = t.replace(/A \*\*Red-Black Tree\*\* is a type of self-balancing[\s\S]*?O\(log n\) time\./,
    '**Red-Black**: BST + color rules → approximate balance, O(log n).');
  t = t.replace(/A \*\*Heap Tree\*\* is a specialized[\s\S]*?Heap Sort\*\*\./,
    '**Heap**: complete binary tree; max/min heap property; priority queues & heap sort.');
  t = t.replace(/A \*\*B-Tree\*\* is a self-balancing search tree[\s\S]*?disk accesses required\./,
    '**B-tree**: multi-way self-balancing tree for disk blocks; O(log n), few I/Os.');
  t = t.replace(/A \*\*Trie\*\* \(also known as[\s\S]*?IP routing\./,
    '**Trie**: char-per-edge; O(m) string ops; autocomplete, spell-check, routing.');
  t = t.replace(/A \*\*Segment Tree\*\* is a binary tree used for storing[\s\S]*?updates on arrays\./,
    '**Segment tree**: interval aggregates over arrays; O(log n) query/update.');
  t = t.replace(/### Advantages of AVL Trees[\s\S]*?simple binary trees\./,
    '### AVL Trade-offs\n\n- **Pros**: strict balance, fast lookup.\n- **Cons**: rotation overhead, extra metadata.');
  t = t.replace(/### Advantages of Red-Black Trees:[\s\S]*?memory management systems\./,
    '### Red-Black Trade-offs\n\n- **Pros**: fewer rotations; `TreeMap`, Linux kernel.\n- **Cons**: less strictly balanced than AVL.');
  t = t.replace(/### Applications of Heaps:[\s\S]*?priority-based operations\./,
    '### Heap Applications\n\nPriority queues, heap sort, Dijkstra/Prim, scheduling.');
  t = t.replace(/### Conclusion:\n\nA \*\*Heap Tree\*\*[\s\S]*?priority-based operations\./, '');
  t = t.replace(/### Applications of B-Trees:[\s\S]*?storage systems\./,
    '### B-Tree Applications\n\nDB indexing, file metadata, multilevel indexes.');
  t = t.replace(/### Advantages of B-Trees:[\s\S]*?efficiently manageable\./,
    '### B-Tree Trade-offs\n\n- **Pros**: few disk reads; stable O(log n).\n- **Cons**: complex; in-memory overhead.');
  t = t.replace(/### Applications of Tries:[\s\S]*?overlapping prefixes\./,
    '### Trie Applications\n\nAutocomplete, spell-check, IP routing, word games.');
  t = t.replace(/### Advantages of Tries:[\s\S]*?hash maps\./,
    '### Trie Trade-offs\n\n- **Pros**: O(m) ops; prefix search; shared storage.\n- **Cons**: memory; complexity vs hash maps.');
  t = t.replace(/### Conclusion:\n\nA \*\*Trie\*\*[\s\S]*?prefix search are required\./, '');
  t = t.replace(/### Advantages of Segment Trees:[\s\S]*?Fenwick Trees\)\./,
    '### Segment Tree Trade-offs\n\n- **Pros**: O(log n) range ops; flexible aggregates.\n- **Cons**: ~2n space; harder than Fenwick.');
  t = t.replace(/### Conclusion:\n\nA \*\*Segment Tree\*\*[\s\S]*?queries are frequent\./, '');
  t = t.replace(/### \/\/+\s*/g, '');
  t = t.replace(/^###\s*$/gm, '');
  t = t.replace(/markdown\n\nCopy code\n\n/g, '');
  t = t.replace(/^(csharp|css|scss|less|mathematica)\n\nCopy code\n\n/gm, '');
  t = t.replace(/O\(\\log n\)O\(\\log n\)O\(logn\)/g, 'O(log n)');
  t = t.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';

  const outPath = path.join(TIGHT, 'Data Structures and Algorithms Trees Concepts.md');
  fs.writeFileSync(outPath, t, 'utf8');
  return { raw: raw.length, tight: t.length, outPath };
}

const trees = tightenTrees();
const concepts = tightenConcepts();
for (const r of [trees, concepts]) {
  const pct = (((r.raw - r.tight) / r.raw) * 100).toFixed(1);
  console.log(`${path.basename(r.outPath)}: ${r.raw} -> ${r.tight} (${pct}% reduction)`);
}
console.log(`Trees.md csharp blocks: ${trees.csharpCount}`);

// Verify csharp blocks match source
const srcBlocks = [...fs.readFileSync(path.join(CLEAN, 'Data Structures and Algorithms Trees.md'), 'utf8').matchAll(/```csharp\n([\s\S]*?)```/g)].map(m => m[1]);
const outBlocks = [...fs.readFileSync(trees.outPath, 'utf8').matchAll(/```csharp\n([\s\S]*?)```/g)].map(m => m[1]);
const match = srcBlocks.length === outBlocks.length && srcBlocks.every((b, i) => b === outBlocks[i]);
console.log(`Csharp blocks verbatim match: ${match}`);
