**11. Coding Challenges**

1.  Write a function that returns the reverse of a string.

2.  Write a function that checks whether two strings are anagrams or not.

3.  Write a function that returns the number of vowels in a string.

4.  Write a function to sort an array of numbers in ascending order.

5.  Write a function to merge two arrays into a single sorted array.

6.  Write a function to find the second largest element in an array.

7.  Write a function to find the longest common prefix among an array of strings.

8.  Write a function to find the intersection of two arrays.

9.  Write a function to calculate the Fibonacci sequence up to a given number.

<!-- -->

1.  **Write a function that returns the reverse of a string.**

To write a function that reverses a string in JavaScript, you can follow these steps:

1.  Convert the string into an array of characters.

2.  Reverse the order of the array elements.

3.  Join the reversed array back into a string.

Here's a simple implementation:

function reverseString(str) {

return str.split('').reverse().join('');

}

// Usage

const originalString = 'Hello, World!';

const reversedString = reverseString(originalString);

console.log(reversedString); // !dlroW ,olleH

**Explanation:**

- **str.split('')**: Splits the string into an array of characters.

- **reverse()**: Reverses the order of the elements in the array.

- **join('')**: Joins the elements of the array back into a single string.

This method is concise and leverages built-in JavaScript array methods to perform the reversal efficiently.

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

**2. Write a function that checks whether two strings are anagrams or not.**

To determine whether two strings are anagrams, you need to check if they contain the same characters with the same frequency, but possibly in a different order. Here's a function to accomplish this:

**Implementation**

function areAnagrams(str1, str2) {

// Remove non-alphanumeric characters and convert to lowercase

const normalize = str =\> str.replace(/\[^a-zA-Z0-9\]/g, '').toLowerCase();

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

**Explanation:**

1.  **Normalization**:

    - **normalize function**: Removes non-alphanumeric characters and converts the string to lowercase to ensure case and punctuation are not considered in the comparison.

2.  **Length Check**:

    - **if (normalizedStr1.length !== normalizedStr2.length)**: If the lengths of the normalized strings are not the same, they cannot be anagrams.

3.  **Sorting and Comparing**:

    - **split('').sort().join('')**: Converts the string to an array of characters, sorts them alphabetically, and joins them back into a string.

    - **return sortedStr1 === sortedStr2**: Compares the sorted versions of the strings.

This approach ensures that all characters are considered and compared in a consistent manner, making it a robust solution for checking anagrams.

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

**3. Write a function that returns the number of vowels in a string.**

To count the number of vowels in a string, you can iterate through the string and check each character to see if it is a vowel. Here's a function that accomplishes this:

**Implementation**

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

**Explanation:**

1.  **Vowel Set**:

    - **const vowels = 'aeiouAEIOU'**: A string containing both uppercase and lowercase vowels to check against.

2.  **Counting Vowels**:

    - **for (let char of str)**: Iterates over each character in the string.

    - **if (vowels.includes(char))**: Checks if the character is in the set of vowels.

    - **count++**: Increments the count for each vowel found.

3.  **Return Count**:

    - **return count**: Returns the total number of vowels found in the string.

This function efficiently counts vowels in a string by leveraging the includes method to check membership and iterates through the string only once.

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

**4. Write a function to sort an array of numbers in ascending order.**

To sort an array of numbers in ascending order in JavaScript, you can use the built-in sort method of arrays. However, the sort method by default converts elements to strings and sorts them lexicographically. To sort numbers correctly, you need to provide a comparison function to sort.

**Implementation**

Here's a function that sorts an array of numbers in ascending order:

function sortNumbersAscending(arr) {

return arr.slice().sort((a, b) =\> a - b);

}

// Usage

const numbers = \[10, 5, 8, 1, 12, 3\];

const sortedNumbers = sortNumbersAscending(numbers);

console.log(sortedNumbers); // \[1, 3, 5, 8, 10, 12\]

**Explanation:**

1.  **Copy the Array**:

    - **arr.slice()**: Creates a shallow copy of the array to avoid modifying the original array. This is useful if you want to maintain immutability.

2.  **Sorting Function**:

    - **.sort((a, b) =\> a - b)**: The comparison function used for sorting numbers in ascending order.

      - **a - b**: When a - b is negative, a is less than b, so a comes before b in the sorted order.

3.  **Return Sorted Array**:

    - **return arr.slice().sort(...)**: Returns the sorted copy of the array.

This approach ensures that the array is sorted numerically in ascending order, and using slice() preserves the original array unmodified.

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

**5. Write a function to merge two arrays into a single sorted array.**

To merge two arrays into a single sorted array, you can follow these steps:

1.  **Combine** both arrays into one.

2.  **Sort** the combined array in ascending order.

Here's a function that performs these steps:

**Implementation**

function mergeAndSortArrays(arr1, arr2) {

// Combine the two arrays

const combinedArray = arr1.concat(arr2);

// Sort the combined array in ascending order

return combinedArray.sort((a, b) =\> a - b);

}

// Usage

const array1 = \[3, 1, 4, 1, 5\];

const array2 = \[9, 2, 6, 5, 3\];

const sortedMergedArray = mergeAndSortArrays(array1, array2);

console.log(sortedMergedArray); // \[1, 1, 2, 3, 3, 4, 5, 5, 6, 9\]

**Explanation:**

1.  **Combine Arrays**:

    - **arr1.concat(arr2)**: Combines arr1 and arr2 into a single array. The concat method does not modify the original arrays but returns a new array that contains elements from both.

2.  **Sort Combined Array**:

    - **.sort((a, b) =\> a - b)**: Sorts the combined array numerically in ascending order.

      - **a - b**: Used to compare numbers, ensuring the correct numerical order.

3.  **Return Sorted Array**:

    - **return combinedArray.sort(...)**: Returns the sorted array.

This function effectively merges two arrays and sorts the resulting array, providing a single sorted array as output.

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

**6. Write a function to find the second largest element in an array.**

To find the second largest element in an array, you can follow these steps:

1.  **Initialize Variables**: Use two variables to keep track of the largest and second largest elements.

2.  **Iterate Through the Array**: Compare each element with the largest and second largest values and update them as necessary.

Here’s a function to find the second largest element:

**Implementation**

function findSecondLargest(arr) {

if (arr.length \< 2) {

throw new Error('Array must contain at least two elements.');

}

let largest = -Infinity;

let secondLargest = -Infinity;

for (let num of arr) {

if (num \> largest) {

secondLargest = largest;

largest = num;

} else if (num \> secondLargest && num \< largest) {

secondLargest = num;

}

}

if (secondLargest === -Infinity) {

throw new Error('Array does not contain a second distinct largest element.');

}

return secondLargest;

}

// Usage

const numbers = \[10, 5, 8, 1, 12, 3\];

const secondLargest = findSecondLargest(numbers);

console.log(secondLargest); // 10

**Explanation:**

1.  **Initialize Variables**:

    - **largest and secondLargest**: Start with -Infinity to handle cases where all elements are negative or if no elements are larger initially.

2.  **Iterate Through the Array**:

    - **if (num \> largest)**: If the current number is greater than largest, update secondLargest to the old largest, and then update largest to the current number.

    - **else if (num \> secondLargest && num \< largest)**: If the current number is greater than secondLargest but less than largest, update secondLargest.

3.  **Check for Valid Second Largest**:

    - **if (secondLargest === -Infinity)**: If secondLargest is still -Infinity, it means there was no valid second largest value (possibly all elements are the same).

4.  **Return Second Largest**:

    - **return secondLargest**: Returns the second largest element found.

This approach efficiently finds the second largest element in a single pass through the array, making it both time and space efficient.

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

**7. Write a function to find the longest common prefix among an array of strings.**

To find the longest common prefix among an array of strings, you can use the following approach:

1.  **Edge Case Check**: If the array is empty, return an empty string.

2.  **Sort the Array**: Sort the array of strings. The longest common prefix will be the common prefix between the first and the last strings in the sorted array.

3.  **Find the Common Prefix**: Compare the first and last strings character by character to determine the common prefix.

Here’s how you can implement this:

**Implementation**

function longestCommonPrefix(strs) {

if (strs.length === 0) {

return '';

}

// Sort the array

strs.sort();

// Take the first and last strings in the sorted array

const first = strs\[0\];

const last = strs\[strs.length - 1\];

let i = 0;

while (i \< first.length && i \< last.length && first\[i\] === last\[i\]) {

i++;

}

// The common prefix is the substring from start to index i

return first.substring(0, i);

}

// Usage

const strings = \['flower', 'flow', 'flight'\];

const commonPrefix = longestCommonPrefix(strings);

console.log(commonPrefix); // 'fl'

**Explanation:**

1.  **Edge Case Check**:

    - **if (strs.length === 0)**: If the array is empty, return an empty string as there are no strings to compare.

2.  **Sort the Array**:

    - **strs.sort()**: Sorting the array places the strings with the same prefix next to each other, so the common prefix will be between the first and the last strings.

3.  **Find the Common Prefix**:

    - **const first = strs\[0\]** and **const last = strs\[strs.length - 1\]**: Get the first and last strings in the sorted array.

    - **while (i \< first.length && i \< last.length && first\[i\] === last\[i\])**: Compare characters of the first and last strings up to the length of the shorter string or until characters differ.

    - **first.substring(0, i)**: Return the common prefix by taking a substring from the start of the first string up to the index where the characters start to differ.

This method is efficient and straightforward, leveraging the properties of sorted arrays to simplify finding the longest common prefix.

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

**8. Write a function to find the intersection of two arrays.**

To find the intersection of two arrays, you want to identify elements that are present in both arrays. You can achieve this using various methods, but a common and efficient approach is to use a Set for quick lookups.

Here’s a function to find the intersection of two arrays:

**Implementation**

function intersectArrays(arr1, arr2) {

// Create a Set from the first array

const set1 = new Set(arr1);

// Filter the second array to include only elements present in the Set

const intersection = arr2.filter(item =\> set1.has(item));

return intersection;

}

// Usage

const array1 = \[1, 2, 2, 1\];

const array2 = \[2, 2\];

const result = intersectArrays(array1, array2);

console.log(result); // \[2, 2\]

**Explanation:**

1.  **Create a Set**:

    - **const set1 = new Set(arr1)**: Convert the first array into a Set to leverage its efficient O(1) average time complexity for lookups. This removes duplicates and allows fast membership checking.

2.  **Filter the Second Array**:

    - **arr2.filter(item =\> set1.has(item))**: Use the filter method on the second array to retain only those elements that are also present in set1.

3.  **Return Intersection**:

    - **return intersection**: Return the resulting array that contains the common elements.

**Additional Considerations:**

- **Handling Duplicates**: The above function preserves duplicates if they are present in both arrays. If you want to find unique intersections (without duplicates), you can use a Set for the result:

function intersectUniqueArrays(arr1, arr2) {

const set1 = new Set(arr1);

const intersection = new Set(arr2.filter(item =\> set1.has(item)));

return \[...intersection\];

}

// Usage

const array1 = \[1, 2, 2, 1\];

const array2 = \[2, 2\];

const result = intersectUniqueArrays(array1, array2);

console.log(result); // \[2\]

In this modified version, **new Set(arr2.filter(...))** creates a set to ensure uniqueness, and **\[...intersection\]** converts the set back into an array.

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

**9. Write a function to calculate the Fibonacci sequence up to a given number.**

To calculate the Fibonacci sequence up to a given number, you need to generate Fibonacci numbers until you reach or exceed that number. Here’s a function to achieve this:

**Implementation**

function fibonacciUpTo(max) {

if (max \< 0) {

throw new Error('The maximum number must be non-negative.');

}

const sequence = \[\];

let a = 0, b = 1;

// Generate Fibonacci numbers until reaching or exceeding max

while (a \<= max) {

sequence.push(a);

\[a, b\] = \[b, a + b\]; // Update a and b for the next Fibonacci number

}

return sequence;

}

// Usage

const maxNumber = 10;

const fibonacciSequence = fibonacciUpTo(maxNumber);

console.log(fibonacciSequence); // \[0, 1, 1, 2, 3, 5, 8\]

**Explanation:**

1.  **Handle Negative Input**:

    - **if (max \< 0)**: Throws an error if the maximum number is negative since Fibonacci numbers are non-negative.

2.  **Generate Fibonacci Numbers**:

    - **const sequence = \[\]**: Initializes an empty array to store the Fibonacci sequence.

    - **let a = 0, b = 1**: Starts with the first two Fibonacci numbers.

    - **while (a \<= max)**: Continuously generates Fibonacci numbers until the current number exceeds the maximum value.

      - **sequence.push(a)**: Adds the current Fibonacci number to the sequence.

      - **\[a, b\] = \[b, a + b\]**: Updates a and b to the next pair of Fibonacci numbers.

3.  **Return the Sequence**:

    - **return sequence**: Returns the array containing Fibonacci numbers up to the specified maximum.

This function efficiently generates Fibonacci numbers up to a given number by iterating through the sequence only once, ensuring optimal performance.
