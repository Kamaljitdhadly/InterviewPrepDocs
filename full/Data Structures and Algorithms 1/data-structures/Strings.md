# Data Structures and Algorithms Strings

## Questions Covered

- How do you reverse a string or check if it is a palindrome?
- How do you find the longest substring without repeating characters?
- How do you implement string matching algorithms (e.g., KMP)?

## How do you reverse a string or check if it is a palindrome?

Here's how you can reverse a string and check if it is a palindrome using C#:

### 1. Reverse a String

**Problem**: Reverse the characters in a string.

**Example Code**:

```csharp
using System;
public class StringUtils
{
  public static string ReverseString(string s)
  {
    char[] array = s.ToCharArray();
    Array.Reverse(array);
    return new string(array);
  }
}
```

**Explanation**:

- **Convert the string** to a character array.

- **Reverse the array** using Array.Reverse.

- **Create a new string** from the reversed character array.

### 2. Check if a String is a Palindrome

**Problem**: Check if a string reads the same forward and backward (ignoring case and spaces).

**Example Code**:

```csharp
using System;
public class StringUtils
{
  public static bool IsPalindrome(string s)
  {
    string cleaned = CleanString(s);
    string reversed = ReverseString(cleaned);
    return cleaned.Equals(reversed, StringComparison.OrdinalIgnoreCase);
  }
  private static string CleanString(string s)
  {
    char[] arr = s.ToCharArray();
    string cleaned = "";
    foreach (char c in arr)
    {
      if (Char.IsLetterOrDigit(c))
      {
        cleaned += Char.ToLower(c);
      }
    }
    return cleaned;
  }
}
```

**Explanation**:

- **Clean the string**: Remove non-alphanumeric characters and convert to lowercase.

- **Reverse the cleaned string**.

- **Compare the cleaned string** with its reversed version to check for palindrome properties.

### Summary

- **Reverse a String**: Convert the string to a character array, reverse the array, and convert it back to a string.

- **Check for Palindrome**: Clean the string by removing non-alphanumeric characters and converting to lowercase, then compare it with its reversed version.

These methods provide efficient ways to handle string manipulation and palindrome checking in C#.

## How do you find the longest substring without repeating characters?

To find the longest substring without repeating characters, you can use the sliding window technique with a hash set to keep track of characters. This approach ensures that you efficiently find the maximum length substring in linear time. Here’s how you can implement it in C#:

### Find the Longest Substring Without Repeating Characters

**Problem**: Given a string, find the length of the longest substring that does not contain repeating characters.

**Example Code**:

```csharp
using System;
using System.Collections.Generic;
public class StringUtils
{
  public static int LengthOfLongestSubstring(string s)
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

### Explanation

- **Initialize a HashSet**: seen is used to store characters in the current window of the substring.

- **Two Pointers**: Use left and right pointers to define the current window in the string.

- **Expand the Window**: Move the right pointer to expand the window by including new characters.

- **Shrink the Window**: If a character is repeated (i.e., seen contains the character at right), move the left pointer to shrink the window until the repeated character is removed.

- **Update Maximum Length**: After adjusting the window, update maxLength with the size of the current window if it's larger than the previous maximum length.

- **Return Result**: The maxLength will be the length of the longest substring without repeating characters.

### Example Usage

```csharp
public class Program
{
  public static void Main()
  {
    string input = "abcabcbb";
    int length = StringUtils.LengthOfLongestSubstring(input);
    Console.WriteLine($"Length of the longest substring without repeating characters: {length}");
  }
}
```

In this example, the longest substring without repeating characters is "abc" with a length of 3.

This approach is efficient with a time complexity of O(n), where n is the length of the string, making it well-suited for handling long strings.

## How do you implement string matching algorithms (e.g., KMP)?

The Knuth-Morris-Pratt (KMP) algorithm is a well-known string matching algorithm that efficiently finds occurrences of a "pattern" string within a "text" string. The KMP algorithm preprocesses the pattern to create a longest prefix suffix (LPS) array, which helps in skipping unnecessary comparisons.

Here's a step-by-step implementation of the KMP algorithm in C#:

### 1. Compute the LPS Array

The LPS (Longest Prefix which is also Suffix) array is used to skip characters while matching.

**Example Code for LPS Array Computation**:

```csharp
using System;
public class KMPAlgorithm
{
  public static int[] ComputeLPSArray(string pattern)
  {
    int length = pattern.Length;
    int[] lps = new int[length];
    int len = 0; // Length of the previous longest prefix suffix
    int i = 1;
    lps[0] = 0; // LPS[0] is always 0
    while (i < length)
    {
      if (pattern[i] == pattern[len])
      {
        len++;
        lps[i] = len;
        i++;
      }
      else
      {
        if (len != 0)
        {
          len = lps[len - 1];
        }
        else
        {
          lps[i] = 0;
          i++;
        }
      }
    }
    return lps;
  }
}
```

### 2. Perform the KMP Search

Use the LPS array to perform the actual search.

**Example Code for KMP Search**:

```csharp
using System;
public class KMPAlgorithm
{
  public static void KMPSearch(string text, string pattern)
  {
    int textLength = text.Length;
    int patternLength = pattern.Length;
    int[] lps = ComputeLPSArray(pattern);
    int i = 0; // Index for text
    int j = 0; // Index for pattern
    while (i < textLength)
    {
      if (pattern[j] == text[i])
      {
        i++;
        j++;
      }
      if (j == patternLength)
      {
        Console.WriteLine("Pattern found at index " + (i - j));
        j = lps[j - 1];
      }
      else if (i < textLength && pattern[j] != text[i])
      {
        if (j != 0)
        {
          j = lps[j - 1];
        }
        else
        {
          i++;
        }
      }
    }
  }
  public static int[] ComputeLPSArray(string pattern)
  {
    int length = pattern.Length;
    int[] lps = new int[length];
    int len = 0; // Length of the previous longest prefix suffix
    int i = 1;
    lps[0] = 0; // LPS[0] is always 0
    while (i < length)
    {
      if (pattern[i] == pattern[len])
      {
        len++;
        lps[i] = len;
        i++;
      }
      else
      {
        if (len != 0)
        {
          len = lps[len - 1];
        }
        else
        {
          lps[i] = 0;
          i++;
        }
      }
    }
    return lps;
  }
}
```

### Example Usage

```csharp
public class Program
{
  public static void Main()
  {
    string text = "ABABDABACDABABCABAB";
    string pattern = "ABABCABAB";
    KMPAlgorithm.KMPSearch(text, pattern);
  }
}
```

**Explanation**:

- **Compute LPS Array**: Preprocess the pattern to build the LPS array which will help to skip characters in the pattern.

- **Search for Pattern**: Traverse the text using the KMP algorithm. Use the LPS array to skip characters and find matches efficiently.

### Summary

- **LPS Array**: Helps in skipping unnecessary comparisons by keeping track of the longest prefix that is also a suffix.

- **KMP Search**: Utilizes the LPS array to efficiently find all occurrences of the pattern in the text.

This approach has a time complexity of O(n + m), where n is the length of the text and m is the length of the pattern, making it very efficient for string matching.
