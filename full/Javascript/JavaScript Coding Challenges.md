# JavaScript Coding Challenges

## Questions Covered

1. Write a function that returns the reverse of a string?
2. Write a function that checks whether two strings are anagrams or not?
3. Write a function that returns the number of vowels in a string?
4. Write a function to sort an array of numbers in ascending order?
5. Write a function to merge two arrays into a single sorted array?
6. Write a function to find the second largest element in an array?
7. Write a function to find the longest common prefix among an array of strings?
8. Write a function to find the intersection of two arrays?
9. Write a function to calculate the Fibonacci sequence up to a given number?
10. Write a function to check whether a given string is a palindrome?

## Write a function that returns the reverse of a string?

### Solution 1 — built-in methods

```javascript
function reverseString(str) {
  return str.split('').reverse().join('');
}

const originalString = 'Hello, World!';
const reversedString = reverseString(originalString);
console.log(reversedString); // !dlroW ,olleH
```

### Solution 2 — manual loop (no `reverse()`)

```javascript
function reverseStringManual(str) {
  let reversed = '';
  for (let i = str.length - 1; i >= 0; i--) {
    reversed += str[i];
  }
  return reversed;
}

console.log(reverseStringManual('OpenAI')); // IAnepO
```

### Explanation

| Approach | Notes |
|----------|-------|
| **split / reverse / join** | Concise; common in interviews when built-ins are allowed |
| **Manual loop** | Iterates from last index to 0; mirrors C# char-array reversal |

**Sample:** `Hello, World!` → `!dlroW ,olleH`; `OpenAI` → `IAnepO`

## Write a function that checks whether two strings are anagrams or not?

Two strings are **anagrams** when they contain the same characters with the same frequency (e.g. `Listen` and `Silent`).

### Solution — normalize, sort, compare

```javascript
function areAnagrams(str1, str2) {
  const normalize = str => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  const normalizedStr1 = normalize(str1);
  const normalizedStr2 = normalize(str2);

  if (normalizedStr1.length !== normalizedStr2.length) {
    return false;
  }

  const sortedStr1 = normalizedStr1.split('').sort().join('');
  const sortedStr2 = normalizedStr2.split('').sort().join('');

  return sortedStr1 === sortedStr2;
}

console.log(areAnagrams('Listen', 'Silent')); // true
console.log(areAnagrams('Hello', 'World'));   // false
```

### Explanation

1. **normalize**: Strips non-alphanumeric characters and lowercases for case-insensitive comparison.
2. **Length check**: Different lengths → not anagrams.
3. **Sort and compare**: Same character multiset → sorted strings are equal.

**Sample:** `Listen` / `Silent` → `true`; `Hello` / `World` → `false`

## Write a function that returns the number of vowels in a string?

### Solution

```javascript
function countVowels(str) {
  const vowels = 'aeiouAEIOU';
  let count = 0;

  for (const char of str) {
    if (vowels.includes(char)) {
      count++;
    }
  }
  return count;
}

const exampleString = 'Hello, World!';
console.log(countVowels(exampleString)); // 3
```

### Explanation

- **vowels**: Lookup string for `a e i o u` (upper and lower).
- **for...of**: Single pass over the string.
- **includes(char)**: Increment count when the character is a vowel.

**Sample:** `Hello, World!` → `3` vowels

## Write a function to sort an array of numbers in ascending order?

Default `Array.sort()` compares elements as **strings** — use a numeric comparator.

### Solution 1 — `sort` with comparator

```javascript
function sortNumbersAscending(arr) {
  return arr.slice().sort((a, b) => a - b);
}

const numbers = [10, 5, 8, 1, 12, 3];
console.log(sortNumbersAscending(numbers)); // [1, 3, 5, 8, 10, 12]
```

### Solution 2 — manual bubble sort (no `sort()`)

```javascript
function bubbleSort(arr) {
  const result = arr.slice();
  for (let i = 0; i < result.length - 1; i++) {
    for (let j = 0; j < result.length - i - 1; j++) {
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
      }
    }
  }
  return result;
}

console.log(bubbleSort([10, 5, 8, 1, 12, 3])); // [1, 3, 5, 8, 10, 12]
```

### Explanation

- **arr.slice()**: Copy before sorting so the original array is unchanged.
- **(a, b) => a - b**: Negative when `a < b` → ascending numeric order.
- **Bubble sort**: O(n²) but easy to write when `sort()` is disallowed.

**Sample:** `[10, 5, 8, 1, 12, 3]` → `[1, 3, 5, 8, 10, 12]`

## Write a function to merge two arrays into a single sorted array?

### Solution

```javascript
function mergeAndSortArrays(arr1, arr2) {
  const combinedArray = arr1.concat(arr2);
  return combinedArray.sort((a, b) => a - b);
}

const array1 = [3, 1, 4, 1, 5];
const array2 = [9, 2, 6, 5, 3];
console.log(mergeAndSortArrays(array1, array2));
// [1, 1, 2, 3, 3, 4, 5, 5, 6, 9]
```

### Explanation

1. **concat**: Joins both arrays without mutating the originals.
2. **sort((a, b) => a - b)**: Sorts the combined array numerically.

**Sample:** merged sorted `[1, 1, 2, 3, 3, 4, 5, 5, 6, 9]`

## Write a function to find the second largest element in an array?

Single-pass O(n) — track `largest` and `secondLargest`.

### Solution

```javascript
function findSecondLargest(arr) {
  if (arr.length < 2) {
    throw new Error('Array must contain at least two elements.');
  }

  let largest = -Infinity;
  let secondLargest = -Infinity;

  for (const num of arr) {
    if (num > largest) {
      secondLargest = largest;
      largest = num;
    } else if (num > secondLargest && num < largest) {
      secondLargest = num;
    }
  }

  if (secondLargest === -Infinity) {
    throw new Error('Array does not contain a second distinct largest element.');
  }

  return secondLargest;
}

const numbers = [10, 5, 8, 1, 12, 3];
console.log(findSecondLargest(numbers)); // 10
```

### Explanation

| Step | Logic |
|------|-------|
| `num > largest` | Promote old `largest` to `secondLargest`, set new `largest` |
| `num > secondLargest && num < largest` | Update `secondLargest` only |
| `secondLargest === -Infinity` after loop | All elements equal — no distinct second largest |

**Sample:** `[10, 5, 8, 1, 12, 3]` → `10`

## Write a function to find the longest common prefix among an array of strings?

### Solution — sort, compare first and last

```javascript
function longestCommonPrefix(strs) {
  if (strs.length === 0) {
    return '';
  }

  strs.sort();
  const first = strs[0];
  const last = strs[strs.length - 1];
  let i = 0;

  while (i < first.length && i < last.length && first[i] === last[i]) {
    i++;
  }

  return first.substring(0, i);
}

const strings = ['flower', 'flow', 'flight'];
console.log(longestCommonPrefix(strings)); // fl
```

### Explanation

After sorting, the longest common prefix of the whole array equals the common prefix of the **first** and **last** strings (most divergent pair). Compare character by character until mismatch.

**Sample:** `['flower', 'flow', 'flight']` → `'fl'`

## Write a function to find the intersection of two arrays?

### Solution 1 — preserve duplicates

```javascript
function intersectArrays(arr1, arr2) {
  const set1 = new Set(arr1);
  return arr2.filter(item => set1.has(item));
}

const array1 = [1, 2, 2, 1];
const array2 = [2, 2];
console.log(intersectArrays(array1, array2)); // [2, 2]
```

### Solution 2 — unique intersection only

```javascript
function intersectUniqueArrays(arr1, arr2) {
  const set1 = new Set(arr1);
  const intersection = new Set(arr2.filter(item => set1.has(item)));
  return [...intersection];
}

console.log(intersectUniqueArrays([1, 2, 2, 1], [2, 2])); // [2]
```

### Explanation

- **Set(arr1)**: O(1) average lookup for membership.
- **filter**: Keeps elements of `arr2` present in `set1`.
- **Unique variant**: Wrap result in `Set` to drop duplicates.

**Sample:** `[1,2,2,1] ∩ [2,2]` → `[2, 2]` or unique `[2]`

## Write a function to calculate the Fibonacci sequence up to a given number?

Generate Fibonacci numbers while `a <= max`.

### Solution

```javascript
function fibonacciUpTo(max) {
  if (max < 0) {
    throw new Error('The maximum number must be non-negative.');
  }

  const sequence = [];
  let a = 0;
  let b = 1;

  while (a <= max) {
    sequence.push(a);
    [a, b] = [b, a + b];
  }

  return sequence;
}

const maxNumber = 10;
console.log(fibonacciUpTo(maxNumber)); // [0, 1, 1, 2, 3, 5, 8]
```

### Explanation

- Start with `a = 0`, `b = 1` (first two Fibonacci numbers).
- Push `a`, then advance with `[a, b] = [b, a + b]`.
- Stop when the next `a` would exceed `max`.

**Sample:** `max = 10` → `[0, 1, 1, 2, 3, 5, 8]`

## Write a function to check whether a given string is a palindrome?

A **palindrome** reads the same forwards and backwards (e.g. `madam`, `racecar`).

### Solution — compare from both ends

```javascript
function isPalindrome(str) {
  const s = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    if (s[left] !== s[right]) {
      return false;
    }
    left++;
    right--;
  }

  return true;
}

console.log(isPalindrome('madam'));  // true
console.log(isPalindrome('hello'));  // false
console.log(isPalindrome('A man, a plan, a canal: Panama')); // true
```

### Explanation

1. **Normalize**: Lowercase and strip non-alphanumeric (optional; remove for strict comparison).
2. **Two pointers**: `left` from start, `right` from end — move inward.
3. **Mismatch** → `false`; loop completes → `true`.

**Sample:** `madam` → true; `hello` → false; `A man, a plan, a canal: Panama` → true
