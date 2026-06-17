# Data Structures and Algorithms Paradigms
## Questions Covered

1. Searching Algorithms: How do you perform binary search on a sorted array and linear search?
2. Searching Algorithms: How do you perform search operations in a sorted matrix?
3. Sorting Algorithms: What are the following sorting algorithms and their time/space complexities? (Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort, Heap Sort, Radix Sort)
4. Sorting Algorithms: How do you sort a large dataset that doesn't fit into memory?
5. Divide and Conquer: How does divide and conquer work?
6. Two-Pointer: What is the two-pointer technique, and how does it work?
7. Dynamic Programming: How does dynamic programming differ from recursion? How do you solve problems like: (Knapsack Problem, Longest Common Subsequence, Matrix Chain Multiplication)
8. Greedy Algorithms: What are greedy algorithms, and how do they differ from dynamic programming? How do you solve problems like: (Fractional Knapsack Problem, Activity Selection Problem)
9. Backtracking: How does backtracking work? How do you solve problems like: (N-Queens Problem, Subset Sum Problem)
10. Bit Manipulation: How do you perform bitwise operations (AND, OR, XOR) and count set bits? How do you check if a number is a power of 2?
11. Brute Force: What is brute force, and how does it work?
## Searching Algorithms: How do you perform binary search on a sorted array and linear search?

### **1. Binary Search**

Efficient search on a **sorted** array by halving the interval each step.

#### **How It Works:**

1. `low=0`, `high=n-1`.
2. `mid = low + (high-low)/2`.
3. Match → return mid; target larger → `low=mid+1`; smaller → `high=mid-1`.
4. Repeat until `low > high` → return -1.

#### **Time Complexity:** O(log n)

#### **Example Implementation in C#:**

```csharp
using System;
public class BinarySearch
{
  public static int Search(int[] arr, int target)
  {
    int low = 0;
    int high = arr.Length - 1;
    while (low <= high)
    {
      int mid = low + (high - low) / 2;
      if (arr[mid] == target)
      {
        return mid;
      }
      else if (arr[mid] < target)
      {
        low = mid + 1;
      }
      else
      {
        high = mid - 1;
      }
    }
    return -1; // Target not found
  }
}
class Program
{
  static void Main()
  {
    int[] arr = { 1, 2, 3, 4, 5, 6, 7, 8, 9 };
    int target = 5;
    int result = BinarySearch.Search(arr, target);
    Console.WriteLine(result); // Output: 4 (index of the target value 5)
  }
}
```

### **2. Linear Search**

Sequential scan of every element.

#### **How It Works:**

1. Iterate from index 0; return index on match.
2. End of array with no match → return -1.

#### **Time Complexity:** O(n)

#### **Example Implementation in C#:**

```csharp
using System;
public class LinearSearch
{
  public static int Search(int[] arr, int target)
  {
    for (int i = 0; i < arr.Length; i++)
    {
      if (arr[i] == target)
      {
        return i;
      }
    }
    return -1; // Target not found
  }
}
class Program
{
  static void Main()
  {
    int[] arr = { 1, 2, 3, 4, 5, 6, 7, 8, 9 };
    int target = 5;
    int result = LinearSearch.Search(arr, target);
    Console.WriteLine(result); // Output: 4 (index of the target value 5)
  }
}
```

### **Summary:**

- **Binary Search:** sorted array, O(log n).
- **Linear Search:** any array, O(n).
## Searching Algorithms: How do you perform search operations in a sorted matrix?

Sorted matrix: each row and column ascending. Two common approaches:

### **1. Staircase Search**

Start top-right (0, n-1): equal → found; greater → move left; less → move down. **Time:** O(m+n).

#### **Example Implementation in C#:**

```csharp
using System;
public class MatrixSearch
{
  public static (int, int) Search(int[,] matrix, int target)
  {
    int rows = matrix.GetLength(0);
    int cols = matrix.GetLength(1);
    int row = 0;
    int col = cols - 1;
    while (row < rows && col >= 0)
    {
      if (matrix[row, col] == target)
      {
        return (row, col); // Found target
      }
      else if (matrix[row, col] > target)
      {
        col--; // Move left
      }
      else
      {
        row++; // Move down
      }
    }
    return (-1, -1); // Target not found
  }
}
class Program
{
  static void Main()
  {
    int[,] matrix =
    {
      { 1, 4, 7, 11 },
      { 2, 5, 8, 12 },
      { 3, 6, 9, 16 },
      { 10, 13, 14, 17 }
    };
    int target = 9;
    var result = MatrixSearch.Search(matrix, target);
    Console.WriteLine(result); // Output: (2, 2) (index of the target value 9)
  }
}
```

### **2. Binary Search on Rows**

Binary search each row. **Time:** O(m log n).

#### **Example Implementation in C#:**

```csharp
using System;
public class MatrixSearch
{
  public static (int, int) Search(int[,] matrix, int target)
  {
    int rows = matrix.GetLength(0);
    for (int row = 0; row < rows; row++)
    {
      int index = BinarySearch(matrix, row, target);
      if (index != -1)
      {
        return (row, index); // Found target
      }
    }
    return (-1, -1); // Target not found
  }
  private static int BinarySearch(int[,] matrix, int row, int target)
  {
    int low = 0;
    int high = matrix.GetLength(1) - 1;
    while (low <= high)
    {
      int mid = low + (high - low) / 2;
      if (matrix[row, mid] == target)
      {
        return mid;
      }
      else if (matrix[row, mid] < target)
      {
        low = mid + 1;
      }
      else
      {
        high = mid - 1;
      }
    }
    return -1; // Target not found
  }
}
class Program
{
  static void Main()
  {
    int[,] matrix =
    {
      { 1, 4, 7, 11 },
      { 2, 5, 8, 12 },
      { 3, 6, 9, 16 },
      { 10, 13, 14, 17 }
    };
    int target = 9;
    var result = MatrixSearch.Search(matrix, target);
    Console.WriteLine(result); // Output: (2, 2) (index of the target value 9)
  }
}
```

### **Summary:**

- **Staircase:** O(m+n), elegant for row+column sorted.
- **Binary per row:** O(m log n).
## Sorting Algorithms: What are the following sorting algorithms and their time/space complexities? (Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort, Heap Sort, Radix Sort)

### 1. Bubble Sort

Repeatedly swap adjacent out-of-order elements.

- **Time:** Best O(n), Avg/Worst O(n²)
- **Space:** O(1)

### Example Implementation in C#

```csharp
public class BubbleSort
{
  public static void Sort(int[] arr)
  {
    int n = arr.Length;
    for (int i = 0; i < n - 1; i++)
    {
      for (int j = 0; j < n - i - 1; j++)
      {
        if (arr[j] > arr[j + 1])
        {
          // Swap
          int temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
        }
      }
    }
  }
}
```

### 2. Selection Sort

Select minimum from unsorted portion, swap to front.

- **Time:** O(n²) all cases
- **Space:** O(1)

### Example Implementation in C#

```csharp
public class SelectionSort
{
  public static void Sort(int[] arr)
  {
    int n = arr.Length;
    for (int i = 0; i < n - 1; i++)
    {
      int minIndex = i;
      for (int j = i + 1; j < n; j++)
      {
        if (arr[j] < arr[minIndex])
        {
          minIndex = j;
        }
      }
      // Swap
      int temp = arr[minIndex];
      arr[minIndex] = arr[i];
      arr[i] = temp;
    }
  }
}
```

### 3. Insertion Sort

Build sorted portion by inserting each element in place.

- **Time:** Best O(n), Avg/Worst O(n²)
- **Space:** O(1)

### Example Implementation in C#

```csharp
public class InsertionSort
{
  public static void Sort(int[] arr)
  {
    int n = arr.Length;
    for (int i = 1; i < n; i++)
    {
      int key = arr[i];
      int j = i - 1;
      while (j >= 0 && arr[j] > key)
      {
        arr[j + 1] = arr[j];
        j--;
      }
      arr[j + 1] = key;
    }
  }
}
```

### 4. Merge Sort

Divide in half, sort recursively, merge.

- **Time:** O(n log n) all cases
- **Space:** O(n)

### Example Implementation in C#

```csharp
public class MergeSort
{
  public static void Sort(int[] arr)
  {
    if (arr.Length <= 1) return;
    int[] temp = new int[arr.Length];
    Sort(arr, temp, 0, arr.Length - 1);
  }
  private static void Sort(int[] arr, int[] temp, int leftStart, int rightEnd)
  {
    if (leftStart >= rightEnd) return;
    int middle = (leftStart + rightEnd) / 2;
    Sort(arr, temp, leftStart, middle);
    Sort(arr, temp, middle + 1, rightEnd);
    Merge(arr, temp, leftStart, rightEnd);
  }
  private static void Merge(int[] arr, int[] temp, int leftStart, int rightEnd)
  {
    int leftEnd = (rightEnd + leftStart) / 2;
    int rightStart = leftEnd + 1;
    int size = rightEnd - leftStart + 1;
    int left = leftStart;
    int right = rightStart;
    int index = leftStart;
    while (left <= leftEnd && right <= rightEnd)
    {
      if (arr[left] <= arr[right])
      {
        temp[index++] = arr[left++];
      }
      else
      {
        temp[index++] = arr[right++];
      }
    }
    Array.Copy(arr, left, temp, index, leftEnd - left + 1);
    Array.Copy(arr, right, temp, index, rightEnd - right + 1);
    Array.Copy(temp, leftStart, arr, leftStart, size);
  }
}
```

### 5. Quick Sort

Partition around pivot, recurse on subarrays.

- **Time:** Best/Avg O(n log n), Worst O(n²)
- **Space:** O(log n) recursion

### Example Implementation in C#

```csharp
public class QuickSort
{
  public static void Sort(int[] arr)
  {
    Sort(arr, 0, arr.Length - 1);
  }
  private static void Sort(int[] arr, int low, int high)
  {
    if (low < high)
    {
      int pivotIndex = Partition(arr, low, high);
      Sort(arr, low, pivotIndex - 1);
      Sort(arr, pivotIndex + 1, high);
    }
  }
  private static int Partition(int[] arr, int low, int high)
  {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++)
    {
      if (arr[j] <= pivot)
      {
        i++;
        // Swap
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
    }
    // Swap pivot
    int temp1 = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp1;
    return i + 1;
  }
}
```

### 6. Heap Sort

Build max heap, repeatedly extract max.

- **Time:** O(n log n) all cases
- **Space:** O(1)

### Example Implementation in C#

```csharp
public class HeapSort
{
  public static void Sort(int[] arr)
  {
    int n = arr.Length;
    // Build max heap
    for (int i = n / 2 - 1; i >= 0; i--)
    {
      Heapify(arr, n, i);
    }
    // Extract elements from heap
    for (int i = n - 1; i >= 0; i--)
    {
      // Move current root to end
      int temp = arr[0];
      arr[0] = arr[i];
      arr[i] = temp;
      // Call heapify on the reduced heap
      Heapify(arr, i, 0);
    }
  }
  private static void Heapify(int[] arr, int n, int i)
  {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest])
    {
      largest = left;
    }
    if (right < n && arr[right] > arr[largest])
    {
      largest = right;
    }
    if (largest != i)
    {
      int temp = arr[i];
      arr[i] = arr[largest];
      arr[largest] = temp;
      Heapify(arr, n, largest);
    }
  }
}
```

### 7. Radix Sort

Non-comparative; sort by digits (LSD/MSD).

- **Time:** O(nk) where k = digit count
- **Space:** O(n + k)

### Example Implementation in C#

```csharp
using System;
public class RadixSort
{
  public static void Sort(int[] arr)
  {
    int n = arr.Length;
    int max = GetMax(arr);
    for (int exp = 1; max / exp > 0; exp *= 10)
    {
      CountSort(arr, n, exp);
    }
  }
  private static int GetMax(int[] arr)
  {
    int max = arr[0];
    foreach (int num in arr)
    {
      if (num > max)
      {
        max = num;
      }
    }
    return max;
  }
  private static void CountSort(int[] arr, int n, int exp)
  {
    int[] output = new int[n];
    int[] count = new int[10];
    // Initialize count array
    for (int i = 0; i < 10; i++)
    {
      count[i] = 0;
    }
    // Store count of occurrences
    for (int i = 0; i < n; i++)
    {
      count[(arr[i] / exp) % 10]++;
    }
    // Change count[i] so that count[i] contains the actual position of this digit in output[]
    for (int i = 1; i < 10; i++)
    {
      count[i] += count[i - 1];
    }
    // Build the output array
    for (int i = n - 1; i >= 0; i--)
    {
      output[count[(arr[i] / exp) % 10] - 1] = arr[i];
      count[(arr[i] / exp) % 10]--;
    }
    // Copy the output array to arr[], so that arr[] contains sorted numbers according to current digit
    for (int i = 0; i < n; i++)
    {
      arr[i] = output[i];
    }
  }
}
```

Choose algorithm by data size, input distribution, and stability/memory needs.
## Sorting Algorithms: How do you sort a large dataset that doesn't fit into memory?

Use **external sorting** — data too large for RAM.

### **1. External Merge Sort**

1. **Divide:** split into memory-sized chunks, sort each in RAM, write sorted chunks to disk.
2. **Merge:** multi-way merge via min-heap/priority queue across chunk readers.

#### **Example Implementation in C#:**

```csharp
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
public class ExternalMergeSort
{
  public static void SortLargeFile(string inputFilePath, string outputFilePath, int chunkSize)
  {
    // Step 1: Divide and sort chunks
    List<string> sortedChunkFiles = SplitAndSortChunks(inputFilePath, chunkSize);
    // Step 2: Merge sorted chunks
    MergeSortedChunks(sortedChunkFiles, outputFilePath);
  }
  private static List<string> SplitAndSortChunks(string inputFilePath, int chunkSize)
  {
    List<string> sortedChunkFiles = new List<string>();
    using (StreamReader reader = new StreamReader(inputFilePath))
    {
      int chunkIndex = 0;
      while (!reader.EndOfStream)
      {
        List<int> chunk = new List<int>();
        string line;
        while (chunk.Count < chunkSize && (line = reader.ReadLine()) != null)
        {
          chunk.Add(int.Parse(line));
        }
        chunk.Sort(); // Sort chunk in memory
        string chunkFileName = $"chunk_{chunkIndex++}.txt";
        sortedChunkFiles.Add(chunkFileName);
        File.WriteAllLines(chunkFileName, chunk.Select(x => x.ToString()));
      }
    }
    return sortedChunkFiles;
  }
  private static void MergeSortedChunks(List<string> chunkFiles, string outputFilePath)
  {
    using (StreamWriter writer = new StreamWriter(outputFilePath))
    {
      var readers = chunkFiles.Select(file => new StreamReader(file)).ToList();
      var minHeap = new SortedSet<(int value, int fileIndex)>(
      Comparer<(int value, int fileIndex)>.Create((a, b) => a.value.CompareTo(b.value))
      );
      for (int i = 0; i < readers.Count; i++)
      {
        if (!readers[i].EndOfStream)
        {
          minHeap.Add((int.Parse(readers[i].ReadLine()), i));
        }
      }
      while (minHeap.Count > 0)
      {
        var minElement = minHeap.Min;
        minHeap.Remove(minElement);
        writer.WriteLine(minElement.value);
        if (!readers[minElement.fileIndex].EndOfStream)
        {
          minHeap.Add((int.Parse(readers[minElement.fileIndex].ReadLine()), minElement.fileIndex));
        }
      }
      readers.ForEach(r => r.Dispose());
    }
  }
}
class Program
{
  static void Main()
  {
    string inputFilePath = "large_data.txt";
    string outputFilePath = "sorted_large_data.txt";
    int chunkSize = 10000; // Adjust based on available memory
    ExternalMergeSort.SortLargeFile(inputFilePath, outputFilePath, chunkSize);
  }
}
```

### **2. External Sorting Algorithms**

- **External Radix Sort:** digit-by-digit on chunked data.
- **Replacement Selection Sort:** priority-queue variant for better run generation.

### **3. Using Distributed Systems**

- **Apache Hadoop:** MapReduce across cluster.
- **Apache Spark:** distributed in-memory processing.

### **Summary**

External merge sort: chunk → sort → multi-way merge. Hadoop/Spark for massive scale.
## Divide and Conquer: How does divide and conquer work?

Break problem into smaller subproblems, solve recursively, combine results.

### Steps in Divide and Conquer

1. **Divide:** partition into similar smaller subproblems.
2. **Conquer:** solve subproblems (recurse if needed).
3. **Combine:** merge subproblem solutions.

### Example Algorithms

1. **Merge Sort:** split → sort halves → merge.

```csharp
public class MergeSort
{
  public static void Sort(int[] arr)
  {
    if (arr.Length <= 1) return;
    int[] temp = new int[arr.Length];
    Sort(arr, temp, 0, arr.Length - 1);
  }
  private static void Sort(int[] arr, int[] temp, int leftStart, int rightEnd)
  {
    if (leftStart >= rightEnd) return;
    int middle = (leftStart + rightEnd) / 2;
    Sort(arr, temp, leftStart, middle);
    Sort(arr, temp, middle + 1, rightEnd);
    Merge(arr, temp, leftStart, rightEnd);
  }
  private static void Merge(int[] arr, int[] temp, int leftStart, int rightEnd)
  {
    int leftEnd = (rightEnd + leftStart) / 2;
    int rightStart = leftEnd + 1;
    int size = rightEnd - leftStart + 1;
    int left = leftStart;
    int right = rightStart;
    int index = leftStart;
    while (left <= leftEnd && right <= rightEnd)
    {
      if (arr[left] <= arr[right])
      {
        temp[index++] = arr[left++];
      }
      else
      {
        temp[index++] = arr[right++];
      }
    }
    Array.Copy(arr, left, temp, index, leftEnd - left + 1);
    Array.Copy(arr, right, temp, index, rightEnd - right + 1);
    Array.Copy(temp, leftStart, arr, leftStart, size);
  }
}
```

2. **Quick Sort:** partition around pivot → recurse subarrays.

```csharp
public class QuickSort
{
  public static void Sort(int[] arr)
  {
    Sort(arr, 0, arr.Length - 1);
  }
  private static void Sort(int[] arr, int low, int high)
  {
    if (low < high)
    {
      int pivotIndex = Partition(arr, low, high);
      Sort(arr, low, pivotIndex - 1);
      Sort(arr, pivotIndex + 1, high);
    }
  }
  private static int Partition(int[] arr, int low, int high)
  {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++)
    {
      if (arr[j] <= pivot)
      {
        i++;
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
    }
    int temp1 = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp1;
    return i + 1;
  }
}
```

3. **Binary Search:** halve interval → search one half.

```csharp
public class BinarySearch
{
  public static int Search(int[] arr, int target)
  {
    int left = 0;
    int right = arr.Length - 1;
    while (left <= right)
    {
      int mid = left + (right - left) / 2;
      if (arr[mid] == target)
      {
        return mid;
      }
      if (arr[mid] < target)
      {
        left = mid + 1;
      }
      else
      {
        right = mid - 1;
      }
    }
    return -1; // Target not found
  }
}
```

### Advantages of Divide and Conquer

- Efficient on large problems; simplifies complexity; parallelizable.

### Summary

Divide → conquer → combine. Core paradigm for sort, search, and many algorithms.
## Two-Pointer: What is the two-pointer technique, and how does it work?

Two pointers traverse an array/list to solve problems in O(n) instead of O(n²).

### **How It Works**

1. **Initialize** two pointers (positions vary by problem).
2. **Move** based on comparisons/conditions.
3. **Process** until termination (meet, end, or found).

### **Common Use Cases**

1. Pair finding in sorted arrays.
2. Subarray sum/length problems.
3. In-place reversal.

### **Examples**

#### **1. Pair with Given Sum (Sorted Array):**

```csharp
public class TwoPointerExample
{
  public static bool FindPairWithSum(int[] arr, int targetSum)
  {
    int left = 0;
    int right = arr.Length - 1;
    while (left < right)
    {
      int currentSum = arr[left] + arr[right];
      if (currentSum == targetSum)
      {
        return true;
      }
      else if (currentSum < targetSum)
      {
        left++;
      }
      else
      {
        right--;
      }
    }
    return false;
  }
}
```

#### **2. Reverse an Array:**

```csharp
public class TwoPointerExample
{
  public static void ReverseArray(int[] arr)
  {
    int left = 0;
    int right = arr.Length - 1;
    while (left < right)
    {
      int temp = arr[left];
      arr[left] = arr[right];
      arr[right] = temp;
      left++;
      right--;
    }
  }
}
```

#### **3. Remove Duplicates from Sorted Array:**

```csharp
public class TwoPointerExample
{
  public static int RemoveDuplicates(int[] arr)
  {
    if (arr.Length == 0) return 0;
    int uniqueIndex = 0;
    for (int i = 1; i < arr.Length; i++)
    {
      if (arr[i] != arr[uniqueIndex])
      {
        uniqueIndex++;
        arr[uniqueIndex] = arr[i];
      }
    }
    return uniqueIndex + 1;
  }
}
```

### **Advantages**

- O(n) vs O(n²); simple and readable.

### **Summary**

Two pointers: efficient pairing, subarrays, reversal on sorted/sequential data.
## Dynamic Programming: How does dynamic programming differ from recursion? How do you solve problems like: (Knapsack Problem, Longest Common Subsequence, Matrix Chain Multiplication)

### **Differences Between Dynamic Programming and Recursion**

1. **Recursion:** breaks into subproblems; may recompute same subproblems. Memoization can help.
2. **DP:** solves overlapping subproblems once, stores results (tabulation/memoization). Requires **optimal substructure**.

### **Dynamic Programming Problems**

#### **1. Knapsack Problem**

Maximize value within weight limit. `dp[i][w]` = max value using first i items, capacity w.

- Skip item i: `dp[i-1][w]`
- Take item i: `dp[i-1][w-weight[i-1]] + value[i-1]`
- `dp[i][w] = max(skip, take)`

### Example in C#

```csharp
using System;
public class Knapsack
{
  public static int MaxValue(int[] weights, int[] values, int capacity)
  {
    int n = weights.Length;
    int[,] dp = new int[n + 1, capacity + 1];
    for (int i = 0; i <= n; i++)
    {
      for (int w = 0; w <= capacity; w++)
      {
        if (i == 0 || w == 0)
        {
          dp[i, w] = 0;
        }
        else if (weights[i - 1] <= w)
        {
          dp[i, w] = Math.Max(dp[i - 1, w], dp[i - 1, w - weights[i - 1]] + values[i - 1]);
        }
        else
        {
          dp[i, w] = dp[i - 1, w];
        }
      }
    }
    return dp[n, capacity];
  }
}
```

#### **2. Longest Common Subsequence (LCS)**

`dp[i][j]` = LCS length of first i chars of s1 and first j of s2.

- Match: `dp[i][j] = dp[i-1][j-1] + 1`
- No match: `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`

### Example in C#

```csharp
using System;
public class LCS
{
  public static int LongestCommonSubsequence(string s1, string s2)
  {
    int m = s1.Length;
    int n = s2.Length;
    int[,] dp = new int[m + 1, n + 1];
    for (int i = 1; i <= m; i++)
    {
      for (int j = 1; j <= n; j++)
      {
        if (s1[i - 1] == s2[j - 1])
        {
          dp[i, j] = dp[i - 1, j - 1] + 1;
        }
        else
        {
          dp[i, j] = Math.Max(dp[i - 1, j], dp[i, j - 1]);
        }
      }
    }
    return dp[m, n];
  }
}
```

#### **3. Matrix Chain Multiplication**

`dp[i][j]` = min scalar multiplications for matrices i..j.

- Try all split points k: `dp[i][j] = min(dp[i][k] + dp[k+1][j] + p[i]*p[k+1]*p[j+1])`

### Example in C#

```csharp
using System;
public class MatrixChain
{
  public static int MatrixChainOrder(int[] p)
  {
    int n = p.Length;
    int[,] dp = new int[n - 1, n - 1];
    for (int length = 2; length < n; length++)
    {
      for (int i = 0; i < n - length; i++)
      {
        int j = i + length;
        dp[i, j - 1] = int.MaxValue;
        for (int k = i; k < j - 1; k++)
        {
          int q = dp[i, k] + dp[k + 1, j - 1] + p[i] * p[k + 1] * p[j];
          if (q < dp[i, j - 1])
          {
            dp[i, j - 1] = q;
          }
        }
      }
    }
    return dp[0, n - 2];
  }
}
```

### **Summary**

DP caches overlapping subproblems. Classic patterns: knapsack, LCS, matrix chain — define state, recurrence, fill table.
## Greedy Algorithms: What are greedy algorithms, and how do they differ from dynamic programming? How do you solve problems like: (Fractional Knapsack Problem, Activity Selection Problem)

**Greedy** picks locally optimal choice each step, hoping for global optimum. **DP** stores subproblem results for overlapping decisions.

### Difference from Dynamic Programming

- **DP:** overlapping subproblems, optimal substructure, stores results.
- **Greedy:** no subproblem table; incremental local choices (works when greedy choice property holds).

### **Examples of Greedy Algorithms**

#### **1. Fractional Knapsack Problem**

Take fractions allowed. Sort by value/weight ratio descending; fill greedily.

### Example in C#

```csharp
using System;
public class FractionalKnapsack
{
  public class Item
  {
    public int Value { get; set; }
    public int Weight { get; set; }
    public double Ratio => (double)Value / Weight;
  }
  public static double MaxValue(Item[] items, int capacity)
  {
    Array.Sort(items, (a, b) => b.Ratio.CompareTo(a.Ratio));
    double totalValue = 0;
    foreach (var item in items)
    {
      if (capacity == 0) break;
      int weightToTake = Math.Min(item.Weight, capacity);
      totalValue += weightToTake * item.Ratio;
      capacity -= weightToTake;
    }
    return totalValue;
  }
}
```

#### **2. Activity Selection Problem**

Max non-overlapping activities. Sort by end time; pick if start ≥ last end.

### Example in C#

```csharp
using System;
public class ActivitySelection
{
  public class Activity
  {
    public int Start { get; set; }
    public int End { get; set; }
  }
  public static void SelectActivities(Activity[] activities)
  {
    Array.Sort(activities, (a, b) => a.End.CompareTo(b.End));
    int lastEnd = -1;
    foreach (var activity in activities)
    {
      if (activity.Start >= lastEnd)
      {
        Console.WriteLine($"Activity: Start = {activity.Start}, End = {activity.End}");
        lastEnd = activity.End;
      }
    }
  }
}
```

### **Summary**

Greedy: local optimum (fractional knapsack, activity selection). DP: when subproblems overlap and greedy fails (0/1 knapsack, LCS).
## Backtracking: How does backtracking work? How do you solve problems like: (N-Queens Problem, Subset Sum Problem)

**Backtracking** builds solutions incrementally; abandons (backtracks) invalid partial solutions.

### **How Backtracking Works**

1. **Choose** a candidate.
2. **Explore** recursively.
3. **Check constraints** — backtrack if invalid.
4. **Terminate** on complete solution or exhaustion.

### **Backtracking Examples**

#### **1. N-Queens Problem**

Place N queens with no shared row/column/diagonal.

### Backtracking Approach

Place queen row by row; check safety; backtrack on failure.

### Example in C#

```csharp
using System;
public class NQueens
{
  private static void PrintSolution(int[,] board, int N)
  {
    for (int i = 0; i < N; i++)
    {
      for (int j = 0; j < N; j++)
      Console.Write(board[i, j] == 1 ? "Q " : ". ");
      Console.WriteLine();
    }
    Console.WriteLine();
  }
  private static bool IsSafe(int[,] board, int row, int col, int N)
  {
    // Check this column
    for (int i = 0; i < row; i++)
    if (board[i, col] == 1)
    return false;
    // Check upper-left diagonal
    for (int i = row, j = col; i >= 0 && j >= 0; i--, j--)
    if (board[i, j] == 1)
    return false;
    // Check upper-right diagonal
    for (int i = row, j = col; i >= 0 && j < N; i--, j++)
    if (board[i, j] == 1)
    return false;
    return true;
  }
  private static bool SolveNQueensUtil(int[,] board, int row, int N)
  {
    if (row >= N)
    return true;
    for (int i = 0; i < N; i++)
    {
      if (IsSafe(board, row, i, N))
      {
        board[row, i] = 1;
        if (SolveNQueensUtil(board, row + 1, N))
        return true;
        board[row, i] = 0; // Backtrack
      }
    }
    return false;
  }
  public static void SolveNQueens(int N)
  {
    int[,] board = new int[N, N];
    if (SolveNQueensUtil(board, 0, N))
    PrintSolution(board, N);
    else
    Console.WriteLine("Solution does not exist.");
  }
}
```

#### **2. Subset Sum Problem**

Find subset summing to target.

### Backtracking Approach

Include or exclude each element; backtrack when sum exceeds target.

### Example in C#

```csharp
using System;
public class SubsetSum
{
  private static bool FindSubset(int[] arr, int index, int target, int currentSum)
  {
    if (currentSum == target)
    return true;
    if (index >= arr.Length || currentSum > target)
    return false;
    // Include the current element
    if (FindSubset(arr, index + 1, target, currentSum + arr[index]))
    return true;
    // Exclude the current element
    return FindSubset(arr, index + 1, target, currentSum);
  }
  public static bool IsSubsetSum(int[] arr, int target)
  {
    return FindSubset(arr, 0, target, 0);
  }
}
```

### **Summary**

Backtracking: try → validate → undo. N-Queens (placement constraints), Subset Sum (include/exclude).
## Bit Manipulation: How do you perform bitwise operations (AND, OR, XOR) and count set bits? How do you check if a number is a power of 2?

Operations on binary representations — efficient for low-level optimizations.

### Bitwise Operations

1. **Bitwise AND (&):** 1 if both bits 1.

**Example:**

```csharp
int a = 12; // 1100 in binary
int b = 7; // 0111 in binary
int result = a & b; // 0100 in binary, which is 4 in decimal
```

2. **Bitwise OR (|):** 1 if either bit 1.

**Example:**

```csharp
int a = 12; // 1100 in binary
int b = 7; // 0111 in binary
int result = a | b; // 1111 in binary, which is 15 in decimal
```

3. **Bitwise XOR (^):** 1 if exactly one bit 1.

**Example:**

```csharp
int a = 12; // 1100 in binary
int b = 7; // 0111 in binary
int result = a ^ b; // 1011 in binary, which is 11 in decimal
```

### Counting Set Bits

### Brian Kernighan's Algorithm

```csharp
int CountSetBits(int n)
{
  int count = 0;
  while (n > 0)
  {
    n &= (n - 1); // Remove the lowest set bit
    count++;
  }
  return count;
}
```

Each `n &= (n-1)` clears the lowest set bit.

### Checking if a Number is a Power of 2

### Method

```csharp
bool IsPowerOfTwo(int n)
{
  return (n > 0) && ((n & (n - 1)) == 0);
}
```

Power of 2 has exactly one bit set; `n & (n-1)` clears it → 0.

### Examples in C#

1. **Bitwise Operations:**

```csharp
int a = 12; // 1100 in binary
int b = 7; // 0111 in binary
int andResult = a & b; // 4 (0100 in binary)
int orResult = a | b; // 15 (1111 in binary)
int xorResult = a ^ b; // 11 (1011 in binary)
```

2. **Count Set Bits:**

```csharp
int CountSetBits(int n)
{
  int count = 0;
  while (n > 0)
  {
    n &= (n - 1);
    count++;
  }
  return count;
}
```

3. **Check Power of 2:**

```csharp
bool IsPowerOfTwo(int n)
{
  return (n > 0) && ((n & (n - 1)) == 0);
}
```

### Summary

AND/OR/XOR manipulate bits. Brian Kernighan counts set bits. `n & (n-1)==0` tests power of 2.
## Brute Force: What is brute force, and how does it work?

**Brute force** tries all possible solutions/combinations until one satisfies constraints.

### How Brute Force Works

1. Generate all candidates.
2. Check each against requirements.
3. Select best (if optimizing) or first valid.
4. Stop on find or after exhausting all.

### Characteristics of Brute Force

- Exhaustive, simple, guaranteed correct — but often exponential/inefficient at scale.

### Examples of Brute Force

1. **Password Cracking:**

**Example in C#**

```csharp
using System;
public class PasswordCracker
{
  public static bool CrackPassword(string targetPassword, string[] possiblePasswords)
  {
    foreach (string password in possiblePasswords)
    {
      if (password == targetPassword)
      return true;
    }
    return false;
  }
}
```

2. **Finding the Maximum Subarray Sum:**

**Example in C#**

```csharp
using System;
public class MaximumSubarraySum
{
  public static int FindMaxSum(int[] arr)
  {
    int n = arr.Length;
    int maxSum = int.MinValue;
    for (int start = 0; start < n; start++)
    {
      for (int end = start; end < n; end++)
      {
        int currentSum = 0;
        for (int k = start; k <= end; k++)
        {
          currentSum += arr[k];
        }
        maxSum = Math.Max(maxSum, currentSum);
      }
    }
    return maxSum;
  }
}
```

3. **Traveling Salesman Problem (TSP):**

Try all permutations; pick shortest tour. Exponential — impractical for large n.

### Summary

Brute force: try everything. Simple baseline; use when n is small or as comparison for optimized algorithms.
