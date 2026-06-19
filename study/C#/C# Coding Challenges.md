# C# Coding Challenges

## Questions Covered

1. Write a program in C# to reverse a string?
2. Write a program in C# to reverse the order of words in a sentence?
3. Write a program in C# to check whether a string is a palindrome?
4. Write a C# program to extract a substring from a given string?
5. Write a C# program to check whether a positive integer is prime?
6. Write a C# method to find two indices whose values add up to a target (Two Sum)?
7. Write a C# method to check whether two strings are anagrams?
8. Write a C# method to count vowels in a string?
9. Write a C# method to find the second largest element in an array?
10. Write a C# method to remove duplicates from a list?
11. Write a C# method to generate the Fibonacci sequence up to a given number?
12. Write a C# program to print FizzBuzz for numbers 1 to N?

## Write a program in C# to reverse a string?

Copy chars end-to-start into `char[]`, return `new string(charArray)`.

```csharp
static string ReverseString(string str)
{
    char[] charArray = new char[str.Length];
    int index = 0;

    for (int i = str.Length - 1; i >= 0; i--)
    {
        charArray[index] = str[i];
        index++;
    }

    return new string(charArray);
}

// Usage
Console.WriteLine(ReverseString("OpenAI")); // IAnepO
```

**Sample:** `OpenAI` → `IAnepO`

## Write a program in C# to reverse the order of words in a sentence?

`Split` + `Array.Reverse` + `Join`, or manual `SplitWords` loop.

```csharp
static string ReverseWords(string sentence)
{
    string[] words = sentence.Split(' ', StringSplitOptions.RemoveEmptyEntries);
    Array.Reverse(words);
    return string.Join(' ', words);
}

// Usage
Console.WriteLine(ReverseWords("C# is fun")); // fun is C#
```

```csharp
static string ReverseWordsManual(string sentence)
{
    string[] words = SplitWords(sentence);
    string reversed = "";

    for (int i = words.Length - 1; i >= 0; i--)
    {
        reversed += words[i];
        if (i > 0) reversed += " ";
    }

    return reversed;
}

static string[] SplitWords(string sentence)
{
    int wordCount = 0;
    for (int i = 0; i < sentence.Length; i++)
    {
        if (sentence[i] == ' ')
            wordCount++;
    }

    string[] words = new string[wordCount + 1];
    string word = "";
    int index = 0;

    foreach (char c in sentence)
    {
        if (c == ' ')
        {
            words[index++] = word;
            word = "";
        }
        else
        {
            word += c;
        }
    }

    words[index] = word;
    return words;
}
```

**Sample:** `C# is fun` → `fun is C#`

## Write a program in C# to check whether a string is a palindrome?

Compare `str[i]` vs `str[length - i - 1]` from both ends.

```csharp
static bool IsPalindrome(string str)
{
    int length = str.Length;

    for (int i = 0; i < length / 2; i++)
    {
        if (str[i] != str[length - i - 1])
            return false;
    }

    return true;
}

// Usage
Console.WriteLine(IsPalindrome("madam"));  // True
Console.WriteLine(IsPalindrome("hello"));  // False
```

**Sample:** `madam` → true; `hello` → false

## Write a C# program to extract a substring from a given string?

Validate bounds; copy `length` chars from `startIndex`.

```csharp
static string GetSubstring(string str, int startIndex, int length)
{
    if (startIndex < 0 || startIndex >= str.Length)
        throw new ArgumentOutOfRangeException(nameof(startIndex));
    if (length < 0 || startIndex + length > str.Length)
        throw new ArgumentOutOfRangeException(nameof(length));

    char[] buffer = new char[length];

    for (int i = 0; i < length; i++)
        buffer[i] = str[startIndex + i];

    return new string(buffer);
}

// Usage
Console.WriteLine(GetSubstring("Hello, World!", 7, 5)); // World
```

**Sample:** `"Hello, World!"` start `7`, len `5` → `World`

## Write a C# program to check whether a positive integer is prime?

`≤1` false → `2` true → even false → test odd `i` where `i*i ≤ num`.

```csharp
static bool IsPrime(int num)
{
    if (num <= 1) return false;
    if (num == 2) return true;
    if (num % 2 == 0) return false;

    for (int i = 3; i * i <= num; i += 2)
    {
        if (num % i == 0)
            return false;
    }

    return true;
}

// Usage
Console.WriteLine(IsPrime(29));  // True
Console.WriteLine(IsPrime(30));  // False
```

**Sample:** `29` prime; `30` not

## Write a C# method to find two indices whose values add up to a target (Two Sum)?

`Dictionary<int,int>` value → index; check complement each step.

```csharp
static int[]? TwoSum(int[] nums, int target)
{
    var seen = new Dictionary<int, int>();

    for (int i = 0; i < nums.Length; i++)
    {
        int complement = target - nums[i];

        if (seen.TryGetValue(complement, out int index))
            return new[] { index, i };

        seen[nums[i]] = i;
    }

    return null;
}

// Usage
Console.WriteLine(string.Join(", ", TwoSum(new[] { 2, 7, 11, 15 }, 9)!)); // 0, 1
```

**Sample:** `[2, 7, 11, 15]`, target `9` → `0, 1`

## Write a C# method to check whether two strings are anagrams?

Normalize → sort chars → `SequenceEqual`.

```csharp
using System.Linq;

static bool AreAnagrams(string str1, string str2)
{
    static string Normalize(string s) =>
        new string(s.Where(char.IsLetterOrDigit).Select(char.ToLowerInvariant).ToArray());

    var a = Normalize(str1);
    var b = Normalize(str2);

    if (a.Length != b.Length) return false;

    var charsA = a.ToCharArray();
    var charsB = b.ToCharArray();
    Array.Sort(charsA);
    Array.Sort(charsB);

    return charsA.SequenceEqual(charsB);
}

// Usage
Console.WriteLine(AreAnagrams("Listen", "Silent")); // True
```

**Sample:** `Listen` / `Silent` → true

## Write a C# method to count vowels in a string?

Single pass; `vowels.Contains(c)`.

```csharp
static int CountVowels(string str)
{
    const string vowels = "aeiouAEIOU";
    int count = 0;

    foreach (char c in str)
    {
        if (vowels.Contains(c))
            count++;
    }

    return count;
}

// Usage
Console.WriteLine(CountVowels("Hello, World!")); // 3
```

**Sample:** `Hello, World!` → `3` vowels

## Write a C# method to find the second largest element in an array?

Track `largest` and `secondLargest` in one pass.

```csharp
static int FindSecondLargest(int[] arr)
{
    if (arr.Length < 2)
        throw new ArgumentException("Array must contain at least two elements.");

    int largest = int.MinValue;
    int secondLargest = int.MinValue;

    foreach (int num in arr)
    {
        if (num > largest)
        {
            secondLargest = largest;
            largest = num;
        }
        else if (num > secondLargest && num < largest)
        {
            secondLargest = num;
        }
    }

    if (secondLargest == int.MinValue)
        throw new InvalidOperationException("No distinct second largest value.");

    return secondLargest;
}

// Usage
Console.WriteLine(FindSecondLargest(new[] { 10, 5, 8, 1, 12, 3 })); // 10
```

**Sample:** `[10, 5, 8, 1, 12, 3]` → `10`

## Write a C# method to remove duplicates from a list?

`HashSet.Add` — only add to result when new.

```csharp
static List<T> RemoveDuplicates<T>(IEnumerable<T> items)
{
    var seen = new HashSet<T>();
    var result = new List<T>();

    foreach (var item in items)
    {
        if (seen.Add(item))
            result.Add(item);
    }

    return result;
}

// Usage
var unique = RemoveDuplicates(new[] { 1, 2, 2, 3, 1, 4 });
Console.WriteLine(string.Join(", ", unique)); // 1, 2, 3, 4
```

**Sample:** `[1, 2, 2, 3, 1, 4]` → `1, 2, 3, 4`

## Write a C# method to generate the Fibonacci sequence up to a given number?

Push `a` while `a <= max`; `(a, b) = (b, a + b)`.

```csharp
static List<int> FibonacciUpTo(int max)
{
    if (max < 0)
        throw new ArgumentOutOfRangeException(nameof(max));

    var sequence = new List<int>();
    int a = 0, b = 1;

    while (a <= max)
    {
        sequence.Add(a);
        (a, b) = (b, a + b);
    }

    return sequence;
}

// Usage
Console.WriteLine(string.Join(", ", FibonacciUpTo(10))); // 0, 1, 1, 2, 3, 5, 8
```

**Sample:** `max = 10` → `0, 1, 1, 2, 3, 5, 8`

## Write a C# program to print FizzBuzz for numbers 1 to N?

Check `% 3` and `% 5` together first for `FizzBuzz`.

```csharp
static IEnumerable<string> FizzBuzz(int n)
{
    for (int i = 1; i <= n; i++)
    {
        bool fizz = i % 3 == 0;
        bool buzz = i % 5 == 0;

        if (fizz && buzz) yield return "FizzBuzz";
        else if (fizz) yield return "Fizz";
        else if (buzz) yield return "Buzz";
        else yield return i.ToString();
    }
}

// Usage
Console.WriteLine(string.Join(", ", FizzBuzz(15)));
// 1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz
```

**Sample:** `FizzBuzz(15)` ends with `..., 14, FizzBuzz`
