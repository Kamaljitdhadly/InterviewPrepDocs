# C# Coding Challenges

## Questions Covered

1. Write a program in C# Sharp to reverse a string?
2. Write a program in C# Sharp to reverse the order of the given words?
3. Write a program in C# Sharp to find if a given string is palindrome or not?
4. Write a C# program to find the substring from a given string
5. Write a C# program to find if a positive integer is prime or not?

## Write a program in C# Sharp to reverse a string?

```csharp
using System;
class Program
{
  static void Main()
  {
    // Input string
    Console.Write("Enter a string: ");
    string originalString = Console.ReadLine();
    // Reverse the string
    string reversedString = ReverseString(originalString);
    // Output the reversed string
    Console.WriteLine("Reversed string: " + reversedString);
  }
  // Method to reverse a string without using built-in methods
  static string ReverseString(string str)
  {
    char[] charArray = new char[str.Length];
    int index = 0;
    // Manually reverse the string
    for (int i = str.Length - 1; i >= 0; i--)
    {
      charArray[index] = str[i];
      index++;
    }
    return new string(charArray);
  }
}
```

### Explanation

- **char[] charArray = new char[str.Length];**: Initializes a character array with the same length as the input string.

- **for (int i = str.Length - 1; i >= 0; i--)**: Loops through the string from the end to the beginning.

- **charArray[index] = str[i];**: Manually assigns each character from the original string to the reversed position in the array.

- **new string(charArray);**: Converts the character array back into a string.

### Sample Output

Enter a string: OpenAI

Reversed string: IAnepO

This version of the program manually iterates through the string and reverses it without relying on any built-in methods.

## Write a program in C# Sharp to reverse the order of the given words?

```csharp
using System;
class Program
{
  static void Main()
  {
    // Input sentence
    Console.Write("Enter a sentence: ");
    string sentence = Console.ReadLine();
    // Reverse the order of words
    string reversedSentence = ReverseWords(sentence);
    // Output the reversed sentence
    Console.WriteLine("Reversed sentence: " + reversedSentence);
  }
  // Method to reverse the order of words in a sentence
  static string ReverseWords(string sentence)
  {
    string[] words = SplitWords(sentence);
    string reversedSentence = "";
    // Manually reverse the order of words
    for (int i = words.Length - 1; i >= 0; i--)
    {
      reversedSentence += words[i];
      if (i > 0)
      {
        reversedSentence += " ";
      }
    }
    return reversedSentence;
  }
  // Method to split the sentence into words without using built-in methods
  static string[] SplitWords(string sentence)
  {
    int wordCount = 0;
    for (int i = 0; i < sentence.Length; i++)
    {
      if (sentence[i] == ' ')
      {
        wordCount++;
      }
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

### Explanation

1.  **Console.ReadLine()**: Reads the input sentence from the console.

2.  **ReverseWords Method**:

    - Splits the sentence into words manually.

    - Reverses the order of words by iterating from the last word to the first.

    - Concatenates the words back into a single sentence.

3.  **SplitWords Method**:

    - Manually splits the sentence into words by detecting spaces between them.

    - Counts the number of spaces to determine how many words there are.

    - Iterates through the sentence, extracting each word and storing it in an array.

### Sample Output

Enter a sentence: C# is fun

Reversed sentence: fun is C#

This program takes a sentence, reverses the order of the words, and outputs the result without using any built-in methods for splitting or reversing.

## Write a program in C# Sharp to find if a given string is palindrome or not?

```csharp
using System;
class Program
{
  static void Main()
  {
    // Input string
    Console.Write("Enter a string: ");
    string inputString = Console.ReadLine();
    // Check if the string is a palindrome
    bool isPalindrome = IsPalindrome(inputString);
    // Output the result
    if (isPalindrome)
    {
      Console.WriteLine("The string is a palindrome.");
    }
    else
    {
      Console.WriteLine("The string is not a palindrome.");
    }
  }
  // Method to check if a string is a palindrome without using built-in methods
  static bool IsPalindrome(string str)
  {
    int length = str.Length;
    for (int i = 0; i < length / 2; i++)
    {
      if (str[i] != str[length - i - 1])
      {
        return false;
      }
    }
    return true;
  }
}
```

### Explanation

1.  **Input**: The program reads a string input from the user using Console.ReadLine().

2.  **Palindrome Check**:

    - The IsPalindrome method checks whether the string reads the same forwards and backwards.

    - It compares characters from the beginning and end of the string, moving towards the center.

    - If any pair of characters does not match, the string is not a palindrome.

    - If all pairs match, the string is a palindrome.

3.  **Output**: The program prints whether the string is a palindrome.

### Sample Output

Enter a string: madam

```csharp
The string is a palindrome.
```

Enter a string: hello

The string is not a palindrome.

This program checks if the given string is a palindrome by comparing characters from both ends toward the center without using any built-in methods for reversing or comparing the string.

## Write a C# program to find the substring from a given string

```csharp
using System;
class Program
{
  static void Main()
  {
    // Input the main string
    Console.Write("Enter the main string: ");
    string mainString = Console.ReadLine();
    // Input the start index and length of the substring
    Console.Write("Enter the start index of the substring: ");
    int startIndex = int.Parse(Console.ReadLine());
    Console.Write("Enter the length of the substring: ");
    int length = int.Parse(Console.ReadLine());
    // Validate inputs
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
    // Extract and print the substring
    string substring = GetSubstring(mainString, startIndex, length);
    Console.WriteLine("Substring: " + substring);
  }
  // Method to get a substring from a given string
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

### Explanation

1.  **Input**:

    - Reads the main string from the user.

    - Reads the start index and length of the substring to extract.

2.  **Validation**:

    - Checks if the start index is valid (i.e., within the bounds of the main string).

    - Checks if the length is valid and if the substring does not exceed the main string's length.

3.  **Extracting Substring**:

    - The GetSubstring method manually extracts the substring.

    - Initializes a character array with the specified length.

    - Copies characters from the main string starting from the startIndex for the specified length.

4.  **Output**:

    - Prints the extracted substring.

### Sample Output

Enter the main string: Hello, World!

Enter the start index of the substring: 7

Enter the length of the substring: 5

Substring: World

This program demonstrates how to extract a substring from a given string by specifying the start index and length without using built-in substring methods.

## Write a C# program to find if a positive integer is prime or not?

A **prime number** is a natural number greater than 1 that has no positive divisors other than 1 and itself. In other words, a prime number is only divisible by 1 and itself without leaving any remainder.

### Characteristics of Prime Numbers

1.  **Greater Than 1**: The smallest prime number is 2. Prime numbers must be greater than 1.

2.  **Divisibility**: A prime number has exactly two distinct positive divisors: 1 and itself.

3.  **Not Divisible by Other Numbers**: Apart from 1 and the number itself, it cannot be divided evenly by any other numbers.

### Examples of Prime Numbers

- **2**: Divisible by 1 and 2.

- **3**: Divisible by 1 and 3.

- **5**: Divisible by 1 and 5.

- **7**: Divisible by 1 and 7.

- **11**: Divisible by 1 and 11.

- **13**: Divisible by 1 and 13.

### Non-Prime Numbers (Composite Numbers)

- **4**: Divisible by 1, 2, and 4.

- **6**: Divisible by 1, 2, 3, and 6.

- **8**: Divisible by 1, 2, 4, and 8.

### Special Cases

- **1** is **not** considered a prime number because it only has one positive divisor (itself).

- **2** is the only even prime number because all other even numbers are divisible by 2, making them composite.

```csharp
using System;
class Program
{
  static void Main()
  {
    // Input positive integer
    Console.Write("Enter a positive integer: ");
    int number;
    if (int.TryParse(Console.ReadLine(), out number) && number > 0)
    {
      // Check if the number is prime
      bool isPrime = IsPrime(number);
      // Output the result
      if (isPrime)
      {
        Console.WriteLine($"{number} is a prime number.");
      }
      else
      {
        Console.WriteLine($"{number} is not a prime number.");
      }
    }
    else
    {
      Console.WriteLine("Invalid input. Please enter a positive integer.");
    }
  }
  // Method to check if a number is prime
  static bool IsPrime(int num)
  {
    if (num <= 1)
    {
      return false; // 0 and 1 are not prime numbers
    }
    if (num == 2)
    {
      return true; // 2 is the only even prime number
    }
    if (num % 2 == 0)
    {
      return false; // Other even numbers are not prime
    }
    // Check for factors from 3 to √num
    for (int i = 3; i * i <= num; i += 2)
    {
      if (num % i == 0)
      {
        return false; // Found a factor, not a prime number
      }
    }
    return true; // No factors found, it's a prime number
  }
}
```

### Explanation

1.  **Input**:

    - Reads a positive integer from the user.

    - Uses int.TryParse to ensure the input is a valid integer and greater than zero.

2.  **Prime Check** (IsPrime method):

    - **Edge Cases**:

      - Numbers less than or equal to 1 are not prime.

      - The number 2 is the only even prime number.

    - **Even Numbers**: Any other even number is not prime.

    - **Odd Numbers**: For odd numbers, checks for factors from 3 up to the square root of the number (i.e., i * i <= num), incrementing by 2 (to skip even numbers).

    - If a factor is found, the number is not prime.

3.  **Output**:

    - Displays whether the number is a prime or not based on the result from the IsPrime method.

### Sample Output

Enter a positive integer: 29

29 is a prime number.

Enter a positive integer: 30

30 is not a prime number.

-------------------------------------------------------------------------------------------------------------------------------
