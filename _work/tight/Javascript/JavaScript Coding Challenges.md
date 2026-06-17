# JavaScript Coding Challenges

## Questions Covered

1. Write a function that returns the reverse of a string.
2. Write a function that checks whether two strings are anagrams or not.
3. Write a function that returns the number of vowels in a string.
4. Write a function to sort an array of numbers in ascending order.
5. Write a function to merge two arrays into a single sorted array.
6. Write a function to find the second largest element in an array.
7. Write a function to find the longest common prefix among an array of strings.
8. Write a function to find the intersection of two arrays.
9. Write a function to calculate the Fibonacci sequence up to a given number.

## Write a function that returns the reverse of a string.

```javascript
function reverseString(str) {
  return str.split('').reverse().join('');
}
// Usage
const originalString = 'Hello, World!';
const reversedString = reverseString(originalString);
console.log(reversedString); // !dlroW ,olleH
```

## Write a function that checks whether two strings are anagrams or not.

```javascript
function areAnagrams(str1, str2) {
  // Remove non-alphanumeric characters and convert to lowercase
  const normalize = str => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  // Normalize both strings
  const normalizedStr1 = normalize(str1);
  const normalizedStr2 = normalize(str2);
  // If lengths differ, they cannot be anagrams
  if (normalizedStr1.length !== normalizedStr2.length) {
    return false;
  }
  // Convert strings to character arrays, sort them, and join back to strings
  const sortedStr1 = normalizedStr1.split('').sort().join('');
  const sortedStr2 = normalizedStr2.split('').sort().join('');
  // Compare the sorted strings
  return sortedStr1 === sortedStr2;
}
// Usage
const str1 = 'Listen';
const str2 = 'Silent';
console.log(areAnagrams(str1, str2)); // true
```

## Write a function that returns the number of vowels in a string.

```javascript
function countVowels(str) {
  // Define a set of vowels
  const vowels = 'aeiouAEIOU';
  // Initialize a count variable
  let count = 0;
  // Iterate through the string and count vowels
  for (let char of str) {
    if (vowels.includes(char)) {
      count++;
    }
  }
  return count;
}
// Usage
const exampleString = 'Hello, World!';
const numberOfVowels = countVowels(exampleString);
console.log(numberOfVowels); // 3 (e, o, o)
```

## Write a function to sort an array of numbers in ascending order.

Use `(a, b) => a - b` on a `slice()` copy — default `sort()` is lexicographic:

```javascript
function sortNumbersAscending(arr) {
  return arr.slice().sort((a, b) => a - b);
}
// Usage
const numbers = [10, 5, 8, 1, 12, 3];
const sortedNumbers = sortNumbersAscending(numbers);
console.log(sortedNumbers); // [1, 3, 5, 8, 10, 12]
```

## Write a function to merge two arrays into a single sorted array.

```javascript
function mergeAndSortArrays(arr1, arr2) {
  // Combine the two arrays
  const combinedArray = arr1.concat(arr2);
  // Sort the combined array in ascending order
  return combinedArray.sort((a, b) => a - b);
}
// Usage
const array1 = [3, 1, 4, 1, 5];
const array2 = [9, 2, 6, 5, 3];
const sortedMergedArray = mergeAndSortArrays(array1, array2);
console.log(sortedMergedArray); // [1, 1, 2, 3, 3, 4, 5, 5, 6, 9]
```

## Write a function to find the second largest element in an array.

```javascript
function findSecondLargest(arr) {
  if (arr.length < 2) {
    throw new Error('Array must contain at least two elements.');
  }
  let largest = -Infinity;
  let secondLargest = -Infinity;
  for (let num of arr) {
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
// Usage
const numbers = [10, 5, 8, 1, 12, 3];
const secondLargest = findSecondLargest(numbers);
console.log(secondLargest); // 10
```

## Write a function to find the longest common prefix among an array of strings.

Sort; compare first and last string char-by-char:

```javascript
function longestCommonPrefix(strs) {
  if (strs.length === 0) {
    return '';
  }
  // Sort the array
  strs.sort();
  // Take the first and last strings in the sorted array
  const first = strs[0];
  const last = strs[strs.length - 1];
  let i = 0;
  while (i < first.length && i < last.length && first[i] === last[i]) {
    i++;
  }
  // The common prefix is the substring from start to index i
  return first.substring(0, i);
}
// Usage
const strings = ['flower', 'flow', 'flight'];
const commonPrefix = longestCommonPrefix(strings);
console.log(commonPrefix); // 'fl'
```

## Write a function to find the intersection of two arrays.

```javascript
function intersectArrays(arr1, arr2) {
  // Create a Set from the first array
  const set1 = new Set(arr1);
  // Filter the second array to include only elements present in the Set
  const intersection = arr2.filter(item => set1.has(item));
  return intersection;
}
// Usage
const array1 = [1, 2, 2, 1];
const array2 = [2, 2];
const result = intersectArrays(array1, array2);
console.log(result); // [2, 2]
```

**Unique intersection (no duplicates):**

```javascript
function intersectUniqueArrays(arr1, arr2) {
  const set1 = new Set(arr1);
  const intersection = new Set(arr2.filter(item => set1.has(item)));
  return [...intersection];
}
// Usage
const array1 = [1, 2, 2, 1];
const array2 = [2, 2];
const result = intersectUniqueArrays(array1, array2);
console.log(result); // [2]
```

## Write a function to calculate the Fibonacci sequence up to a given number.

```javascript
function fibonacciUpTo(max) {
  if (max < 0) {
    throw new Error('The maximum number must be non-negative.');
  }
  const sequence = [];
  let a = 0, b = 1;
  // Generate Fibonacci numbers until reaching or exceeding max
  while (a <= max) {
    sequence.push(a);
    [a, b] = [b, a + b]; // Update a and b for the next Fibonacci number
  }
  return sequence;
}
// Usage
const maxNumber = 10;
const fibonacciSequence = fibonacciUpTo(maxNumber);
console.log(fibonacciSequence); // [0, 1, 1, 2, 3, 5, 8]
```
