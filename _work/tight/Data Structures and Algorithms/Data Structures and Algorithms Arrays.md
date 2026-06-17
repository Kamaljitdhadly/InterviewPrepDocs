# Data Structures and Algorithms Arrays
## Questions Covered

1. What is an array, and what are its advantages and disadvantages?
2. How do arrays differ from lists?
3. How do you implement a dynamic array?
4. How do you find the maximum/minimum elements, reverse an array, and remove duplicates?
5. What is the "sliding window" technique, and how is it applied in array problems?
6. How do you rotate an array or merge two sorted arrays?
7. How do you find the intersection, union, or kth largest/smallest element in an array?
## What is an array, and what are its advantages and disadvantages?

An **array** stores same-type elements at fixed indices. Size is set at creation; supports 1D and multi-dimensional layouts.

### Advantages of Arrays

1. **Fast Access** — O(1) by index; ideal for frequent random access.
2. **Memory Efficiency** — Contiguous storage improves cache locality.
3. **Simple Data Structure** — Easy to implement; foundation for other structures.
4. **Predictable Size** — Fixed size simplifies memory planning when count is known.

### Disadvantages of Arrays

1. **Fixed Size** — Resize requires new array + copy; poor for dynamic collections.
2. **Costly Insertions/Deletions** — Mid-array changes shift elements — O(n).
3. **Wasted Space** — Over-allocation leaves unused slots.
4. **No Built-In Bounds Checking** (some languages) — Risk of out-of-bounds errors.

### Summary

- **Advantages**: Fast access, memory efficiency, simplicity, predictable size.
- **Disadvantages**: Fixed size, costly insert/delete, wasted space, bounds-check gaps.

Use arrays for fast indexed access with known size; use lists/vectors when size changes often.
## How do arrays differ from lists?

Both store collections, but differ in size, memory, and operation costs.

### Arrays

1. **Fixed Size** — `int[] arr = new int[10];` — resize = new array + copy.
2. **Contiguous Memory** — Better cache performance.
3. **Fixed Data Type** — Homogeneous elements.
4. **Constant-Time Access** — O(1) via `arr[3]`.
5. **Costly Insertions/Deletions** — O(n) due to shifting.

### Lists

1. **Dynamic Size** — `List<int>` grows/shrinks as needed.
2. **Non-Contiguous Memory** (linked lists) — Nodes scattered; dynamic arrays still contiguous.
3. **Flexible Data Type** — `List<Object>` allows mixed types (C#); `List<T>` is typed.
4. **Variable-Time Access** — O(1) for dynamic arrays; O(n) for linked lists.
5. **Efficient Insertions/Deletions** — O(1) at known node (linked list); dynamic arrays may resize.

### Summary

- **Arrays**: Fixed size, contiguous, O(1) access, costly insert/delete.
- **Lists**: Dynamic size, flexible memory layout, efficient insert/delete.

Arrays suit known-size, fast-access needs; lists suit dynamic size and frequent insert/delete.
## How do you implement a dynamic array?

A **dynamic array** grows/shrinks at runtime. Start with fixed capacity; double and copy when full.

### Key Operations

1. **Initialization** — Fixed array + element count.
2. **Resizing** — New larger array, copy elements.
3. **Adding Elements** — Insert; resize if full.
4. **Removing Elements** — Shift down; optionally shrink.

### Implementation in C#

```csharp
using System;
public class DynamicArray<T>
{
  private T[] _array;
  private int _size;
  private int _capacity;
  public DynamicArray(int initialCapacity = 4)
  {
    _capacity = initialCapacity;
    _array = new T[_capacity];
    _size = 0;
  }
  // Add an element to the dynamic array
  public void Add(T item)
  {
    if (_size == _capacity)
    {
      Resize();
    }
    _array[_size] = item;
    _size++;
  }
  // Resize the array when it becomes full
  private void Resize()
  {
    _capacity *= 2;
    T[] newArray = new T[_capacity];
    Array.Copy(_array, newArray, _size);
    _array = newArray;
  }
  // Get the element at a specific index
  public T Get(int index)
  {
    if (index < 0 || index >= _size)
    {
      throw new IndexOutOfRangeException();
    }
    return _array[index];
  }
  // Remove the element at a specific index
  public void RemoveAt(int index)
  {
    if (index < 0 || index >= _size)
    {
      throw new IndexOutOfRangeException();
    }
    for (int i = index; i < _size - 1; i++)
    {
      _array[i] = _array[i + 1];
    }
    _size--;
  }
  // Get the number of elements in the dynamic array
  public int Size()
  {
    return _size;
  }
}
```

### Explanation

1. **Init** — Default capacity; `_size` tracks count.
2. **Add** — Resize when full (double capacity, copy).
3. **Remove** — Shift elements left, decrement size.

### Trade-offs

- **Pros**: Dynamic growth; amortized O(1) append via doubling.
- **Cons**: Memory overhead; resize copies all elements (amortized cheap).
## How do you find the maximum/minimum elements, reverse an array, and remove duplicates?

### 1. Find Maximum and Minimum Elements

**In C#**:

```csharp
public class ArrayUtils
{
  public static int FindMax(int[] array)
  {
    if (array.Length == 0) throw new InvalidOperationException("Array is empty.");
    int max = array[0];
    for (int i = 1; i < array.Length; i++)
    {
      if (array[i] > max) max = array[i];
    }
    return max;
  }
  public static int FindMin(int[] array)
  {
    if (array.Length == 0) throw new InvalidOperationException("Array is empty.");
    int min = array[0];
    for (int i = 1; i < array.Length; i++)
    {
      if (array[i] < min) min = array[i];
    }
    return min;
  }
}
```

### 2. Reverse an Array

**In C#**:

```csharp
public class ArrayUtils
{
  public static void ReverseArray(int[] array)
  {
    int left = 0;
    int right = array.Length - 1;
    while (left < right)
    {
      int temp = array[left];
      array[left] = array[right];
      array[right] = temp;
      left++;
      right--;
    }
  }
}
```

### 3. Remove Duplicates

**In C#** (using a HashSet):

```csharp
using System;
using System.Collections.Generic;
public class ArrayUtils
{
  public static int[] RemoveDuplicates(int[] array)
  {
    HashSet<int> set = new HashSet<int>(array);
    return new List<int>(set).ToArray();
  }
}
```

### Summary

- **Max/Min**: Single pass, compare each element — O(n).
- **Reverse**: Swap from both ends toward center — O(n).
- **Remove Duplicates**: `HashSet` for uniqueness, convert back — O(n).
## What is the "sliding window" technique, and how is it applied in array problems?

The **sliding window** avoids redundant work by reusing prior window state as it moves across an array/sequence.

### Concept

1. **Fixed-Size Window** — Window of size k slides one step; update incrementally.
2. **Variable-Size Window** — Window expands/contracts to meet criteria.

### How It Works

1. **Initialize** — Set starting window.
2. **Update** — Add entering element, remove exiting element.
3. **Output** — Collect results per position.

### Applications

#### 1. Maximum Sum Subarray of Fixed Size

**Problem**: Max sum of any subarray of size k.

```csharp
public class SlidingWindow
{
  public static int MaxSumFixedSize(int[] array, int k)
  {
    if (array.Length < k) throw new ArgumentException("Array length must be greater than or equal to window size.");
    int maxSum = 0;
    int windowSum = 0;
    // Calculate the sum of the first window
    for (int i = 0; i < k; i++)
    {
      windowSum += array[i];
    }
    maxSum = windowSum;
    // Slide the window across the array
    for (int i = k; i < array.Length; i++)
    {
      windowSum += array[i] - array[i - k];
      maxSum = Math.Max(maxSum, windowSum);
    }
    return maxSum;
  }
}
```

#### 2. Longest Substring Without Repeating Characters

```csharp
using System;
using System.Collections.Generic;
public class SlidingWindow
{
  public static int LongestSubstringWithoutRepeating(string s)
  {
    HashSet<char> seen = new HashSet<char>();
    int left = 0;
    int maxLength = 0;
    for (int right = 0; right < s.Length; right++)
    {
      while (seen.Contains(s[right]))
      {
        seen.Remove(s[left]);
        left++;
      }
      seen.Add(s[right]);
      maxLength = Math.Max(maxLength, right - left + 1);
    }
    return maxLength;
  }
}
```

#### 3. Minimum Size Subarray Sum

```csharp
public class SlidingWindow
{
  public static int MinSizeSubarraySum(int s, int[] nums)
  {
    int minLength = int.MaxValue;
    int windowSum = 0;
    int left = 0;
    for (int right = 0; right < nums.Length; right++)
    {
      windowSum += nums[right];
      while (windowSum >= s)
      {
        minLength = Math.Min(minLength, right - left + 1);
        windowSum -= nums[left];
        left++;
      }
    }
    return minLength == int.MaxValue ? 0 : minLength;
  }
}
```

### Summary

- **Fixed window**: Max sum of length-k subarrays.
- **Variable window**: Unique substrings, minimum-length sum targets.

Maintains window state instead of recomputing — typically O(n).
## How do you rotate an array or merge two sorted arrays?

### 1. Rotate an Array

**Problem**: Rotate right by k steps. `[1,2,3,4,5,6,7]`, k=3 → `[5,6,7,1,2,3,4]`.

```csharp
public class ArrayUtils
{
  public static void RotateRight(int[] array, int k)
  {
    if (array.Length == 0) return;
    k = k % array.Length; // Handle cases where k > array.Length
    Reverse(array, 0, array.Length - 1);
    Reverse(array, 0, k - 1);
    Reverse(array, k, array.Length - 1);
  }
  private static void Reverse(int[] array, int start, int end)
  {
    while (start < end)
    {
      int temp = array[start];
      array[start] = array[end];
      array[end] = temp;
      start++;
      end--;
    }
  }
}
```

**Steps**: (1) Reverse whole array, (2) reverse first k, (3) reverse remainder — O(n) time, O(1) space.

### 2. Merge Two Sorted Arrays

**Problem**: Merge `[1,3,5]` + `[2,4,6]` → `[1,2,3,4,5,6]`.

```csharp
public class ArrayUtils
{
  public static int[] MergeSortedArrays(int[] nums1, int[] nums2)
  {
    int[] result = new int[nums1.Length + nums2.Length];
    int i = 0, j = 0, k = 0;
    while (i < nums1.Length && j < nums2.Length)
    {
      if (nums1[i] < nums2[j])
      {
        result[k++] = nums1[i++];
      }
      else
      {
        result[k++] = nums2[j++];
      }
    }
    // Copy remaining elements of nums1, if any
    while (i < nums1.Length)
    {
      result[k++] = nums1[i++];
    }
    // Copy remaining elements of nums2, if any
    while (j < nums2.Length)
    {
      result[k++] = nums2[j++];
    }
    return result;
  }
}
```

**Steps**: Two pointers compare and pick smaller; drain leftovers — O(n+m).

### Summary

- **Rotate**: Triple-reverse trick — O(n).
- **Merge**: Two-pointer merge — O(n+m).
## How do you find the intersection, union, or kth largest/smallest element in an array?

### 1. Intersection of Two Arrays

**Problem**: Common elements between two arrays.

```csharp
using System;
using System.Collections.Generic;
public class ArrayUtils
{
  public static int[] Intersection(int[] nums1, int[] nums2)
  {
    HashSet<int> set1 = new HashSet<int>(nums1);
    HashSet<int> intersection = new HashSet<int>();
    foreach (int num in nums2)
    {
      if (set1.Contains(num))
      {
        intersection.Add(num);
      }
    }
    return new List<int>(intersection).ToArray();
  }
}
```

HashSet of nums1; check nums2 membership — O(n+m).

### 2. Union of Two Arrays

```csharp
using System;
using System.Collections.Generic;
public class ArrayUtils
{
  public static int[] Union(int[] nums1, int[] nums2)
  {
    HashSet<int> union = new HashSet<int>();
    foreach (int num in nums1)
    {
      union.Add(num);
    }
    foreach (int num in nums2)
    {
      union.Add(num);
    }
    return new List<int>(union).ToArray();
  }
}
```

HashSet deduplicates both arrays — O(n+m).

### 3. K-th Largest Element

```csharp
using System;
using System.Collections.Generic;
public class ArrayUtils
{
  public static int FindKthLargest(int[] nums, int k)
  {
    if (k < 1 || k > nums.Length) throw new ArgumentOutOfRangeException("k is out of range.");
    // Min-Heap to store the top k elements
    PriorityQueue<int, int> minHeap = new PriorityQueue<int, int>();
    foreach (int num in nums)
    {
      minHeap.Enqueue(num, num);
      if (minHeap.Count > k)
      {
        minHeap.Dequeue();
      }
    }
    return minHeap.Peek();
  }
}
```

Min-heap of size k; root = kth largest — O(n log k).

### 4. K-th Smallest Element

```csharp
using System;
using System.Collections.Generic;
public class ArrayUtils
{
  public static int FindKthSmallest(int[] nums, int k)
  {
    if (k < 1 || k > nums.Length) throw new ArgumentOutOfRangeException("k is out of range.");
    // Min-Heap to store the smallest elements
    PriorityQueue<int, int> minHeap = new PriorityQueue<int, int>();
    foreach (int num in nums)
    {
      minHeap.Enqueue(num, num);
      if (minHeap.Count > k)
      {
        minHeap.Dequeue();
      }
    }
    return minHeap.Peek();
  }
}
```

Min-heap of size k; root = kth smallest — O(n log k).

### Summary

- **Intersection/Union**: HashSet — O(n+m).
- **K-th Largest/Smallest**: Min-heap of size k — O(n log k).
