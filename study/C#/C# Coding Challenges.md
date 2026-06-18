# C# Coding Challenges

## Questions Covered

1. Write a program in C# Sharp to reverse a string?
2. Write a program in C# Sharp to reverse the order of the given words?
3. Write a program in C# Sharp to find if a given string is palindrome or not?
4. Write a C# program to find the substring from a given string
5. Write a C# program to find if a positive integer is prime or not?

## Write a program in C# Sharp to reverse a string?

Reverse without built-in methods: copy chars end-to-start into `char[]`, return `new string(charArray)`.

```csharp
using System;

class Program
{
    static void Main()
    {
        Console.Write("Enter a string: ");
        string originalString = Console.ReadLine();

        string reversedString = ReverseString(originalString);
        Console.WriteLine("Reversed string: " + reversedString);
    }

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
}
```

**Sample:** `OpenAI` → `IAnepO`

## Write a program in C# Sharp to reverse the order of the given words?

Manual space-split (`SplitWords`), then reverse-concatenate.

```csharp
using System;

class Program
{
    static void Main()
    {
        Console.Write("Enter a sentence: ");
        string sentence = Console.ReadLine();

        string reversedSentence = ReverseWords(sentence);
        Console.WriteLine("Reversed sentence: " + reversedSentence);
    }

    static string ReverseWords(string sentence)
    {
        string[] words = SplitWords(sentence);
        string reversedSentence = "";

        for (int i = words.Length - 1; i >= 0; i--)
        {
            reversedSentence += words[i];
            if (i > 0)
                reversedSentence += " ";
        }
        return reversedSentence;
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

        for (int i = 0; i < sentence.Length; i++)
        {
            if (sentence[i] == ' ')
            {
                words[index] = word;
                word = "";
                index++;
            }
            else
            {
                word += sentence[i];
            }
        }
        words[index] = word;
        return words;
    }
}
```

**Sample:** `C# is fun` → `fun is C#`

## Write a program in C# Sharp to find if a given string is palindrome or not?

Compare `str[i]` vs `str[length - i - 1]` from both ends; mismatch → `false`.

```csharp
using System;

class Program
{
    static void Main()
    {
        Console.Write("Enter a string: ");
        string inputString = Console.ReadLine();

        bool isPalindrome = IsPalindrome(inputString);

        if (isPalindrome)
            Console.WriteLine("The string is a palindrome.");
        else
            Console.WriteLine("The string is not a palindrome.");
    }

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
}
```

**Sample:** `madam` → palindrome; `hello` → not

## Write a C# program to find the substring from a given string

Validate bounds, copy `length` chars from `startIndex` into `char[]`.

```csharp
using System;

class Program
{
    static void Main()
    {
        Console.Write("Enter the main string: ");
        string mainString = Console.ReadLine();

        Console.Write("Enter the start index of the substring: ");
        int startIndex = int.Parse(Console.ReadLine());

        Console.Write("Enter the length of the substring: ");
        int length = int.Parse(Console.ReadLine());

        if (startIndex < 0 || startIndex >= mainString.Length)
        {
            Console.WriteLine("Invalid start index.");
            return;
        }
        if (length < 0 || startIndex + length > mainString.Length)
        {
            Console.WriteLine("Invalid length.");
            return;
        }

        string substring = GetSubstring(mainString, startIndex, length);
        Console.WriteLine("Substring: " + substring);
    }

    static string GetSubstring(string str, int startIndex, int length)
    {
        char[] charArray = new char[length];
        int index = 0;

        for (int i = startIndex; i < startIndex + length; i++)
        {
            charArray[index] = str[i];
            index++;
        }
        return new string(charArray);
    }
}
```

**Sample:** `"Hello, World!"` start `7`, len `5` → `World`

## Write a C# program to find if a positive integer is prime or not?

**Prime:** natural number **> 1**, divisible only by **1** and itself. **1** not prime; **2** only even prime. Examples: 2,3,5,7 vs composite 4,6,8.

```csharp
using System;

class Program
{
    static void Main()
    {
        Console.Write("Enter a positive integer: ");
        int number;

        if (int.TryParse(Console.ReadLine(), out number) && number > 0)
        {
            bool isPrime = IsPrime(number);

            if (isPrime)
                Console.WriteLine($"{number} is a prime number.");
            else
                Console.WriteLine($"{number} is not a prime number.");
        }
        else
        {
            Console.WriteLine("Invalid input. Please enter a positive integer.");
        }
    }

    static bool IsPrime(int num)
    {
        if (num <= 1)
            return false;
        if (num == 2)
            return true;
        if (num % 2 == 0)
            return false;

        for (int i = 3; i * i <= num; i += 2)
        {
            if (num % i == 0)
                return false;
        }
        return true;
    }
}
```

**IsPrime:** `≤1` false → `2` true → even false → test odd `i` where `i*i ≤ num`. **Sample:** `29` prime, `30` not.
