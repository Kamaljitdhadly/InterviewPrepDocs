# Data Structures and Algorithms Strings

## Questions Covered

1. How do you reverse a string or check if it is a palindrome?
2. How do you find the longest substring without repeating characters?
3. How do you implement string matching algorithms (e.g., KMP)?

## How do you reverse a string or check if it is a palindrome?

### Reverse a String

Convert to char array → reverse → new string.

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

### Check Palindrome

Clean (alphanumeric only, lowercase) → reverse → compare.

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

**Steps:** `ToCharArray()` → `Array.Reverse()` → compare cleaned vs reversed.

## How do you find the longest substring without repeating characters?

**Sliding window** + **HashSet** — **O(n)** time.

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

| Step | Action |
|------|--------|
| Expand | Move `right`; add `s[right]` to `seen` |
| Shrink | On duplicate, remove `s[left]` and advance `left` |
| Track | `maxLength = max(maxLength, right - left + 1)` |

**Example:** `"abcabcbb"` → longest unique substring `"abc"` → length **3**.

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

## How do you implement string matching algorithms (e.g., KMP)?

**KMP** preprocesses the pattern into an **LPS** (longest prefix-suffix) array to skip redundant comparisons. **O(n + m)** time.

### 1. Compute LPS Array

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

### 2. KMP Search

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

**Flow:** Build LPS → scan text; on mismatch, jump `j` via `lps[j-1]` instead of restarting. **O(n + m)**.
