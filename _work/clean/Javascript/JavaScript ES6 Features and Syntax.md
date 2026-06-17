# JavaScript ES6 Features and Syntax

## Questions Covered

1. What is ES6? What are some new features introduced by it?
2. What is the difference between let, var, and const?
3. What are Template Literals in ES6, and how do they differ from regular strings?
4. What are Default Parameters in ES6? How do they work?
5. What are Arrow Functions in ES6? What are their benefits and limitations?
6. What is the difference between a regular function and an arrow function in JavaScript?
7. What is the class syntax in ES6? How does it compare to constructor functions in earlier versions of JavaScript?
8. How does inheritance work in ES6 classes?
9. What is the super keyword in ES6 classes, and how does it work with inheritance?
10. What are getters and setters in ES6 classes?
11. What are modules in ES6?
12. What is the role of the import and export keywords in ES6 modules?
13. What is the difference between named exports and default exports?
14. What is the difference between static and dynamic imports in ES6?
15. What is the purpose of the Object.assign() method in ES6, and how is it used?
16. What is Object.is() in ES6, and how does it differ from ===?

## What is ES6? What are some new features introduced by it?

ES6, also known as ECMAScript 2015, is a major update to the JavaScript language specification. It introduced several new features and enhancements that make JavaScript more powerful and easier to work with. Here are some of the key features introduced by ES6:

1.  **Arrow Functions**: Provides a shorter syntax for writing functions and retains the this context from the surrounding lexical scope.

```javascript
// Traditional function
function add(a, b) {
  return a + b;
}
// Arrow function
const add = (a, b) => a + b;
```

2.  **Classes**: Introduces a class syntax to create objects, providing a more traditional object-oriented approach.

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    console.log(`Hello, my name is ${this.name}`);
  }
}
const person = new Person('John');
person.greet(); // Output: Hello, my name is John
```

3.  **Template Literals**: Allows for embedded expressions and multi-line strings.

```javascript
const name = 'John';
const message = `Hello, ${name}!`;
console.log(message); // Output: Hello, John!
```

4.  **Destructuring Assignment**: Allows unpacking values from arrays or properties from objects into distinct variables.

```javascript
// Array destructuring
const [a, b] = [1, 2];
// Object destructuring
const {name, age} = {name: 'John', age: 30};
```

5.  **Default Parameters**: Allows function parameters to have default values.

```javascript
function greet(name = 'Guest') {
  console.log(`Hello, ${name}`);
}
greet(); // Output: Hello, Guest
greet('John'); // Output: Hello, John
```

6.  **Rest and Spread Operators**: Provides a way to handle variable numbers of arguments and to spread elements from an array or object.

```javascript
// Rest operator
function sum(...numbers) {
  return numbers.reduce((acc, num) => acc + num, 0);
}
// Spread operator
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];
```

7.  **Promises**: Introduces a native way to handle asynchronous operations and avoid callback hell.

```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve('Done!'), 1000);
});
promise.then(result => console.log(result)); // Output: Done!
```

8.  **Modules**: Provides a way to import and export code between files, supporting modular programming.

```javascript
// module.js
export const PI = 3.14;
// main.js
import { PI } from './module.js';
console.log(PI); // Output: 3.14
```

9.  **Enhanced Object Literals**: Simplifies the syntax for defining objects.

```javascript
const name = 'John';
const person = {
  name,
  greet() {
    console.log('Hello');
  }
};
```

10. **Map and Set Collections**: Introduces new data structures for handling collections of unique values and key-value pairs.

```javascript
// Set
const set = new Set([1, 2, 3, 3]);
console.log(set); // Output: Set { 1, 2, 3 }
// Map
const map = new Map([['key1', 'value1'], ['key2', 'value2']]);
console.log(map.get('key1')); // Output: value1
```

These features greatly enhance the expressiveness, readability, and maintainability of JavaScript code.

4o mini

## 2. What is the difference between let, var, and const?

In JavaScript, let, var, and const are used for declaring variables, but they have different behaviors and scopes:

1.  **var**:

    - **Scope**: Function scope (or global if declared outside a function). It is not block-scoped, so a variable declared with var is accessible throughout the function or globally, regardless of block structure.

    - **Hoisting**: var declarations are hoisted to the top of their containing function or global context, but the initialization is not hoisted. This means you can reference a var variable before its declaration, but it will be undefined until the initialization is reached.

    - **Re-declaration**: Variables declared with var can be re-declared within the same scope without causing an error.

```javascript
function example() {
  console.log(x); // Output: undefined
  var x = 10;
  console.log(x); // Output: 10
}
```

2.  **let**:

    - **Scope**: Block scope. A variable declared with let is only accessible within the block it is defined, such as within an if statement or a loop.

    - **Hoisting**: let declarations are hoisted to the top of their block, but they are not initialized. Accessing a let variable before its declaration results in a ReferenceError due to the "temporal dead zone" (the time between the start of the block and the declaration of the variable).

    - **Re-declaration**: Variables declared with let cannot be re-declared within the same scope, which helps avoid accidental overwrites.

```javascript
function example() {
  console.log(x); // ReferenceError: Cannot access 'x' before initialization
  let x = 10;
  console.log(x); // Output: 10
}
```

3.  **const**:

    - **Scope**: Block scope, similar to let. A variable declared with const is only accessible within the block it is defined.

    - **Hoisting**: const declarations are hoisted to the top of their block but are not initialized. Like let, accessing a const variable before its declaration results in a ReferenceError.

    - **Re-declaration**: Variables declared with const cannot be re-declared or reassigned within the same scope. However, if the const variable holds an object or array, the contents of that object or array can still be modified.

```javascript
function example() {
  const x = 10;
  x = 20; // TypeError: Assignment to constant variable
}
const arr = [1, 2, 3];
arr.push(4); // Works fine, arr is now [1, 2, 3, 4]
```

### Summary

- Use var for function-scoped variables where block scope isn't needed (though var is generally discouraged in modern JavaScript due to its quirks).

- Use let for block-scoped variables when the value needs to change.

- Use const for block-scoped variables that should not be reassigned.

## 3. What are Template Literals in ES6, and how do they differ from regular strings?

Template literals are a feature introduced in ES6 (ECMAScript 2015) that provide a more powerful and flexible way to work with strings in JavaScript. Here’s how they differ from regular strings:

### Template Literals

1.  **Syntax**: Template literals use backticks (`) instead of single (') or double (") quotes.

```javascript
const name = 'John';
const greeting = `Hello, ${name}!`;
```

2.  **Interpolation**: They support embedded expressions using ${} syntax. This allows for easier and more readable string concatenation and expression evaluation.

```javascript
const a = 5;
const b = 10;
const result = `The sum of ${a} and ${b} is ${a + b}.`;
// result: "The sum of 5 and 10 is 15."
```

3.  **Multi-line Strings**: Template literals can span multiple lines without the need for escape sequences or concatenation.

```javascript
const multiLineString = `This is a string
that spans multiple lines
without needing escape characters.`;
```

4.  **Tagged Templates**: You can define custom functions (tag functions) to process template literals. This is useful for advanced string manipulation and formatting.

```javascript
function tag(strings, ...values) {
  console.log(strings); // Array of string literals
  console.log(values); // Array of values
  return strings.raw[0] + values.join(''); // Custom processing
}
const name = 'John';
const age = 30;
const message = tag`My name is ${name} and I am ${age} years old.`;
// Output: ["My name is ", " and I am ", " years old."] ["John", 30]
```

### Regular Strings

1.  **Syntax**: Regular strings use single (') or double (") quotes.

```javascript
const name = 'John';
const greeting = 'Hello, ' + name + '!';
```

2.  **Concatenation**: To include variables or expressions in regular strings, you use the + operator to concatenate strings.

```javascript
const a = 5;
const b = 10;
const result = 'The sum of ' + a + ' and ' + b + ' is ' + (a + b) + '.';
```

3.  **Multi-line Strings**: Regular strings do not natively support multi-line text. To create multi-line strings, you need to use escape characters (\n) or string concatenation.

```javascript
const multiLineString = 'This is a string\n' +
'that spans multiple lines\n' +
'using escape characters.';
```

4.  **No Tag Functions**: Regular strings cannot use tag functions for custom processing or formatting.

### Summary

- **Template Literals**: Provide easier syntax for string interpolation, multi-line strings, and custom processing with tag functions.

- **Regular Strings**: Use simple concatenation and require escape characters for multi-line text, lacking the advanced features of template literals.

## 4. What are Default Parameters in ES6? How do they work?

Default parameters in ES6 (ECMAScript 2015) allow you to specify default values for function parameters. If no argument is provided for a parameter, or if the argument is undefined, the default value is used. This feature makes functions more flexible and simplifies handling cases where arguments might be missing.

### How Default Parameters Work

1.  **Syntax**: You define default parameters by assigning a default value directly in the function definition.

```javascript
function greet(name = 'Guest') {
  console.log(`Hello, ${name}!`);
}
```

2.  **Using Default Parameters**:

    - If you call the function without providing a value for the parameter, or if you pass undefined, the default value is used.

    - If you provide a value (other than undefined), the provided value is used instead of the default.

```javascript
greet(); // Output: Hello, Guest!
greet('John'); // Output: Hello, John!
greet(undefined); // Output: Hello, Guest!
greet(null); // Output: Hello, null!
```

3.  **Default Parameters with Expressions**: Default values can be expressions, including function calls or more complex computations.

```javascript
function multiply(a, b = a) {
  return a * b;
}
console.log(multiply(5)); // Output: 25 (5 * 5)
console.log(multiply(5, 3)); // Output: 15 (5 * 3)
```

4.  **Default Parameters and Destructuring**: Default values can be used with destructured objects and arrays.

```javascript
function display({ name = 'Anonymous', age = 0 } = {}) {
  console.log(`Name: ${name}, Age: ${age}`);
}
display(); // Output: Name: Anonymous, Age: 0
display({ name: 'Alice' }); // Output: Name: Alice, Age: 0
```

5.  **Order of Evaluation**: Default parameters are evaluated in the order they appear in the function signature, and a parameter’s default value can depend on previous parameters.

```javascript
function createUser(name = 'Guest', age = 30) {
  return { name, age };
}
console.log(createUser()); // Output: { name: 'Guest', age: 30 }
```

### Summary

- **Default Parameters** provide a way to specify default values for function arguments, simplifying function calls and handling cases where some arguments might be omitted.

- They are evaluated when the function is called, and if the argument is undefined or not provided, the default value is used.

- They can be combined with destructuring, and default values can be expressions or functions.

Default parameters enhance the readability and robustness of code by reducing the need for explicit checks for undefined values or multiple function overloads.

## 5. What are Arrow Functions in ES6? What are their benefits and limitations?

Arrow functions, introduced in ES6 (ECMAScript 2015), provide a shorter syntax for writing functions and come with some notable features and limitations. Here’s a breakdown of what they are, their benefits, and their limitations:

### Syntax

```javascript
Arrow functions use a more concise syntax compared to traditional function expressions. They are defined using the => syntax.
```

**Basic Syntax**:

```javascript
const add = (a, b) => a + b;
**Single Expression**: If the function body contains only a single expression, the braces {} and the return keyword are omitted.
```

**Multiple Statements**: If the function body has multiple statements, you need to use braces and explicitly include the return statement.

```javascript
const multiply = (a, b) => {
  const result = a * b;
  return result;
};
```

**Single Parameter**: For a single parameter, parentheses are optional.

```javascript
const square = x => x * x;
```

**No Parameters**: When there are no parameters, use empty parentheses.

```javascript
const greet = () => 'Hello, World!';
```

### Benefits

1.  **Concise Syntax**: Arrow functions provide a shorter syntax for function expressions, reducing boilerplate code.

```javascript
// Traditional function
var square = function(x) {
  return x * x;
};
// Arrow function
const square = x => x * x;
```

2.  **Lexical this Binding**: Arrow functions do not have their own this context. Instead, they inherit this from the surrounding lexical scope. This is particularly useful in scenarios where you need to maintain the context of this, such as in callback functions.

```javascript
function Counter() {
  this.value = 0;
  setInterval(() => {
    this.value++;
    console.log(this.value);
  }, 1000);
}
new Counter(); // `this` refers to the Counter instance
```

3.  **No arguments Object**: Arrow functions do not have their own arguments object, which can help avoid confusion when working with parameters.

```javascript
function showArgs() {
  console.log(arguments);
}
const showArgsArrow = () => {
  console.log(arguments); // ReferenceError: arguments is not defined
};
```

### Limitations

1.  **No this Binding**: While lexical this binding can be advantageous, it also means that arrow functions cannot be used as methods in objects if you need a separate this context.

```javascript
const obj = {
  value: 10,
  method: () => {
    console.log(this.value); // `this` does not refer to `obj`
  }
};
obj.method(); // Output: undefined
```

2.  **No new Keyword**: Arrow functions cannot be used as constructors. They do not have a [[Construct]] method and will throw an error if used with the new keyword.

```javascript
const Person = (name) => {
  this.name = name; // `this` is lexically bound
};
const john = new Person('John'); // TypeError: Person is not a constructor
```

3.  **No super Keyword**: Arrow functions do not support the super keyword, so they cannot be used as methods in classes that need to call methods from the parent class.

4.  **No arguments Object**: As mentioned, arrow functions lack their own arguments object, which means they cannot be used to work with variable numbers of arguments in the traditional way.

### Summary

- **Arrow Functions** provide a shorter syntax for functions and have lexical this binding, making them useful for callbacks and functions that don’t require their own this context.

- **Benefits** include concise syntax and easier handling of this in nested functions.

- **Limitations** include the inability to use them as constructors, lack of their own arguments object, and their unsuitability as methods in objects or classes requiring this or super.

Understanding these features helps in leveraging arrow functions effectively in modern JavaScript development.

## 6. What is the difference between a regular function and an arrow function in JavaScript?

The key differences between regular functions and arrow functions in JavaScript revolve around their syntax, behavior of this, and their capabilities. Here's a detailed comparison:

### Syntax

- **Regular Function**:

```javascript
function add(a, b) {
  return a + b;
}
```

- **Arrow Function**:

```javascript
const add = (a, b) => a + b;
```

### this Binding

- **Regular Function**:

  - **Dynamic this**: The value of this is determined by how the function is called. It can refer to different contexts depending on the invocation (e.g., as a method, a constructor, or in a global context).

  - **Example**:

```javascript
const obj = {
  value: 10,
  method: function() {
    console.log(this.value);
  }
};
obj.method(); // Output: 10 (this refers to obj)
```

- **Arrow Function**:

  - **Lexical this**: Arrow functions do not have their own this context. Instead, they inherit this from the surrounding lexical scope where the arrow function is defined. This can be useful for preserving the context in callbacks or asynchronous functions.

  - **Example**:

```javascript
function Counter() {
  this.value = 0;
  setInterval(() => {
    this.value++;
    console.log(this.value);
  }, 1000);
}
new Counter(); // Output: 1, 2, 3, ... (this refers to the Counter instance)
```

### Constructor Behavior

- **Regular Function**:

  - **Can be used as a constructor**: Regular functions can be used with the new keyword to create instances.

  - **Example**:

```javascript
function Person(name) {
  this.name = name;
}
const john = new Person('John');
console.log(john.name); // Output: John
```

- **Arrow Function**:

  - **Cannot be used as a constructor**: Arrow functions do not have a [[Construct]] method, and using them with the new keyword will throw an error.

  - **Example**:

```javascript
const Person = (name) => {
  this.name = name; // `this` is lexically bound
};
const john = new Person('John'); // TypeError: Person is not a constructor
```

### arguments Object

- **Regular Function**:

  - **Has arguments object**: Regular functions have their own arguments object, which is an array-like object containing all the arguments passed to the function.

  - **Example**:

```javascript
function showArgs() {
  console.log(arguments);
}
showArgs(1, 2, 3); // Output: [1, 2, 3]
```

- **Arrow Function**:

  - **No arguments object**: Arrow functions do not have their own arguments object. You cannot use arguments in arrow functions; instead, you must rely on rest parameters if you need to handle variable numbers of arguments.

  - **Example**:

```javascript
const showArgs = () => {
  console.log(arguments); // ReferenceError: arguments is not defined
};
showArgs(1, 2, 3);
```

### Method and super Keyword

- **Regular Function**:

  - **Can be used as object methods**: Regular functions can be used as methods in objects and classes. They can also use the super keyword to call methods from a parent class.

  - **Example**:

```javascript
class Animal {
  speak() {
    console.log('Animal speaks');
  }
}
class Dog extends Animal {
  speak() {
    super.speak(); // Calls the speak method from Animal
    console.log('Dog barks');
  }
}
const dog = new Dog();
dog.speak(); // Output: Animal speaks \n Dog barks
```

- **Arrow Function**:

  - **Not suited for methods requiring this or super**: Arrow functions cannot be used as methods in objects or classes requiring this or super. They do not have their own this context and do not support super.

  - **Example**:

```javascript
class Animal {
  speak() {
    console.log('Animal speaks');
  }
}
class Dog extends Animal {
  speak = () => {
    super.speak(); // SyntaxError: Unexpected super
    console.log('Dog barks');
  }
}
```

### Summary

- **Regular Functions**: Have their own this, can be used as constructors, have an arguments object, and can be methods in classes with access to super.

- **Arrow Functions**: Have a concise syntax, inherit this from the surrounding lexical scope, cannot be used as constructors, lack their own arguments object, and are not suitable for methods requiring this or super.

Understanding these differences helps you choose the right function type based on the context and requirements of your code.

## 7. What is the class syntax in ES6? How does it compare to constructor functions in earlier versions of JavaScript?

The class syntax in ES6 (ECMAScript 2015) provides a more structured and readable way to create and manage objects using object-oriented programming principles. It is a syntactic sugar over the existing prototype-based inheritance but offers a more familiar class-based syntax for those coming from other object-oriented languages. Here’s a comparison between ES6 classes and constructor functions in earlier versions of JavaScript:

### ES6 Class Syntax

**Defining a Class**: Classes are defined using the class keyword, and the class body contains methods and a constructor.

```javascript
class Person {
  // Constructor method
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  // Method
  greet() {
    console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
  }
  // Static method
  static species() {
    console.log('Homo sapiens');
  }
}
const john = new Person('John', 30);
john.greet(); // Output: Hello, my name is John and I am 30 years old.
Person.species(); // Output: Homo sapiens
```

### Constructor Functions (Pre-ES6)

**Defining a Constructor Function**: Constructor functions were used to create objects and manage inheritance before ES6 classes. They are regular functions with a naming convention of starting with a capital letter and are used with the new keyword.

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}
// Prototype method
Person.prototype.greet = function() {
  console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
};
// Static method (requires manual addition)
Person.species = function() {
  console.log('Homo sapiens');
};
const john = new Person('John', 30);
john.greet(); // Output: Hello, my name is John and I am 30 years old.
Person.species(); // Output: Homo sapiens
```

### Comparison

1.  **Syntax and Readability**:

    - **Class Syntax**: Provides a more concise and readable syntax. It is closer to the syntax used in other object-oriented languages, making it easier to understand and use for developers familiar with classes.

    - **Constructor Functions**: Uses prototype-based inheritance which can be less intuitive and requires more boilerplate code, especially when defining methods or adding static methods.

2.  **Inheritance**:

    - **Class Syntax**: Simplifies inheritance using the extends keyword and super keyword for calling methods from the parent class.

```javascript
class Employee extends Person {
  constructor(name, age, position) {
    super(name, age); // Calls the parent class constructor
    this.position = position;
  }
  greet() {
    super.greet(); // Calls the greet method from Person
    console.log(`I am a ${this.position}.`);
  }
}
const emp = new Employee('Alice', 28, 'Engineer');
emp.greet(); // Output: Hello, my name is Alice and I am 28 years old. I am a Engineer.
```

- **Constructor Functions**: Inheritance is handled through the prototype chain and requires manual setup using Object.create or manually setting prototype properties.

```javascript
function Employee(name, age, position) {
  Person.call(this, name, age); // Call the parent constructor
  this.position = position;
}
Employee.prototype = Object.create(Person.prototype);
Employee.prototype.constructor = Employee;
Employee.prototype.greet = function() {
  Person.prototype.greet.call(this); // Call the parent greet method
  console.log(`I am a ${this.position}.`);
};
const emp = new Employee('Alice', 28, 'Engineer');
emp.greet(); // Output: Hello, my name is Alice and I am 28 years old. I am a Engineer.
```

3.  **Static Methods**:

    - **Class Syntax**: Allows defining static methods directly within the class.

    - **Constructor Functions**: Static methods are added manually to the constructor function.

4.  **Method Definitions**:

    - **Class Syntax**: Methods are defined directly within the class body without needing to use prototype.

    - **Constructor Functions**: Methods are added to the prototype property of the constructor function.

5.  **this Binding**:

    - **Class Syntax**: The this keyword behaves consistently with the instance of the class.

    - **Constructor Functions**: this is bound to the instance when using the new keyword.

### Summary

- **ES6 Classes**: Offer a more intuitive and structured approach to object-oriented programming with simpler syntax for defining methods, constructors, and inheritance.

- **Constructor Functions**: Use a more verbose prototype-based approach that requires manual setup for methods and inheritance.

ES6 classes provide a cleaner, more familiar syntax for those accustomed to class-based programming, while still being fundamentally based on JavaScript’s prototypal inheritance.

## 8. How does inheritance work in ES6 classes?

Inheritance in ES6 classes allows you to create a new class based on an existing class, enabling the reuse of code and the extension of functionality. It simplifies and formalizes the concept of inheritance by using the extends keyword and super keyword. Here’s a detailed look at how inheritance works in ES6 classes:

### Basic Inheritance

1.  **Defining a Base Class**: You start by defining a base class (also called a parent class) with properties and methods that you want to share with other classes.

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(`${this.name} makes a noise.`);
  }
}
```

2.  **Defining a Derived Class**: A derived class (or child class) is created using the extends keyword to inherit from the base class. It can have its own properties and methods in addition to those inherited from the base class.

In the example above, Dog extends Animal, so it inherits the name property and the speak method from Animal.

```javascript
class Dog extends Animal {
  constructor(name, breed) {
    super(name); // Call the parent class constructor
    this.breed = breed;
  }
  speak() {
    super.speak(); // Call the parent class method
    console.log(`${this.name} barks.`);
  }
}
```

3.  **Using the Derived Class**: You can create instances of the derived class and use both the inherited and newly defined methods.

```javascript
const myDog = new Dog('Rex', 'Labrador');
myDog.speak(); // Output: Rex makes a noise. \n Rex barks.
```

### Key Concepts

1.  **Calling the Parent Constructor**: In a derived class, you must call super() in the constructor to execute the parent class's constructor and initialize its properties. This is necessary because the parent class's constructor must be executed before you can use this in the derived class's constructor.

```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}
class Employee extends Person {
  constructor(name, age, position) {
    super(name, age); // Call the parent class constructor
    this.position = position;
  }
}
```

2.  **Calling Parent Methods**: You can call methods from the parent class using super.methodName(). This is useful when you want to extend or modify the behavior of a parent method.

```javascript
class Bird extends Animal {
  speak() {
    super.speak(); // Call the parent class method
    console.log(`${this.name} chirps.`);
  }
}
```

3.  **Static Methods and Inheritance**: Static methods are not inherited in the same way as instance methods. They need to be explicitly called from the class itself, not instances.

```javascript
class Vehicle {
  static description() {
    console.log('A vehicle transports people or goods.');
  }
}
class Car extends Vehicle {
  static description() {
    super.description(); // Call static method from parent class
    console.log('A car is a type of vehicle.');
  }
}
Car.description(); // Output: A vehicle transports people or goods. \n A car is a type of vehicle.
```

### Summary

- **Base Class**: Define common properties and methods in the base class.

- **Derived Class**: Use extends to create a new class based on the base class, inheriting its properties and methods.

- **Constructor**: Call super() in the derived class constructor to initialize the base class properties.

- **Method Calls**: Use super.methodName() to call methods from the base class.

- **Static Methods**: Static methods need to be explicitly called and are not inherited in the same way as instance methods.

## 9. What is the super keyword in ES6 classes, and how does it work with inheritance?

The super keyword in ES6 classes is used to refer to the parent class, enabling you to call the parent class's constructor and methods. It plays a crucial role in the inheritance mechanism of ES6 classes, allowing a derived (child) class to access and extend the functionality of a base (parent) class.

Here’s a detailed explanation of how super works:

### 1. Calling the Parent Class Constructor

When a class inherits from another class using the extends keyword, you use super() in the constructor of the child class to call the parent class's constructor. This is necessary to initialize the parent class's properties in the child class before you can use this in the child class's constructor.

**Example**:

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
}
class Dog extends Animal {
  constructor(name, breed) {
    super(name); // Call the parent class constructor
    this.breed = breed; // Now we can use `this`
  }
}
const myDog = new Dog('Rex', 'Labrador');
console.log(myDog.name); // Output: Rex
console.log(myDog.breed); // Output: Labrador
```

- super(name) in the Dog class constructor calls the constructor of Animal and passes the name argument, allowing the name property to be initialized in the Animal class.

- This must happen **before** accessing or assigning any properties to this in the derived class.

### 2. Calling Parent Class Methods

You can also use super.methodName() to call a method from the parent class within a method of the child class. This is useful when you want to extend or modify the behavior of a parent class method without completely overriding it.

**Example**:

```javascript
class Animal {
  speak() {
    console.log('Animal makes a sound');
  }
}
class Dog extends Animal {
  speak() {
    super.speak(); // Call the parent class's speak method
    console.log('Dog barks');
  }
}
const myDog = new Dog();
myDog.speak();
// Output:
// Animal makes a sound
// Dog barks
```

- super.speak() calls the speak method of the Animal class, and then the Dog class's speak method adds additional functionality (Dog barks).

- This allows the child class to build upon the functionality of the parent class, rather than completely overriding it.

### 3. Using super with Static Methods

The super keyword can also be used to call static methods from the parent class. Static methods belong to the class itself rather than instances of the class.

**Example**:

```javascript
class Vehicle {
  static type() {
    console.log('This is a vehicle');
  }
}
class Car extends Vehicle {
  static type() {
    super.type(); // Call the parent class's static method
    console.log('This is a car');
  }
}
Car.type();
// Output:
// This is a vehicle
// This is a car
```

- super.type() calls the type static method from the Vehicle class, followed by the additional functionality in the Car class's static method.

### 4. Restrictions on Using super

- In a derived class, the use of this is only allowed **after** calling super(). If you try to use this before calling super(), JavaScript will throw a ReferenceError.

- super() must be called in the constructor of a derived class; otherwise, you’ll get an error indicating that the constructor must first call super() if it’s a derived class.

**Example**:

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
}
class Dog extends Animal {
  constructor(name, breed) {
    // If you try to use `this` before calling `super()`, it will throw an error
    // this.breed = breed; // ReferenceError
    super(name); // You must call `super()` first
    this.breed = breed; // Now you can use `this`
  }
}
```

### 5. Summary of super

- **super() in Constructor**: Calls the parent class’s constructor and must be called before accessing this in a derived class.

- **super.methodName()**: Calls a method from the parent class, allowing you to reuse or extend its functionality.

- **Static Methods**: super can also be used to call static methods from the parent class.

## 10. What are getters and setters in ES6 classes?

In ES6, **getters** and **setters** are special methods in classes that allow you to control the access and modification of class properties. They enable you to define custom logic when retrieving or updating a property, rather than directly interacting with the property itself. This is useful for encapsulating logic, performing validation, or handling computed properties.

### Getters

A **getter** is a method that gets the value of a property. It allows you to define a method that will be executed when you try to access a property.

- **Syntax**:

```javascript
get propertyName() {
  // custom logic
  return value;
}
```

- **Example**:

```javascript
class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  // Getter for the area of the rectangle
  get area() {
    return this.width * this.height;
  }
}
const rect = new Rectangle(10, 5);
console.log(rect.area); // Output: 50
```

- The area property is a getter method. Although you access it like a property (rect.area), it runs the method behind the scenes to calculate the area based on the width and height properties.

### Setters

A **setter** is a method that allows you to define custom logic when setting the value of a property. This is useful for validation or transforming the value before setting it.

- **Syntax**:

```javascript
set propertyName(value) {
  // custom logic
  this._property = value;
}
```

- **Example**:

```javascript
class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  // Getter for the area
  get area() {
    return this.width * this.height;
  }
  // Setter to update the width
  set width(value) {
    if (value <= 0) {
      console.log('Width must be positive.');
      return;
    }
    this._width = value; // Use a private property (_width)
  }
  get width() {
    return this._width;
  }
}
const rect = new Rectangle(10, 5);
rect.width = -3; // Output: Width must be positive.
rect.width = 7; // Updates the width
console.log(rect.area); // Output: 35
```

- The width setter checks that the value is positive before setting it.

- The get width() method is used to access the private _width property.

### Key Concepts

1.  **Encapsulation**: Getters and setters allow you to hide the actual data behind methods and control access to it. This helps in encapsulating the logic for reading and updating properties.

2.  **Custom Logic**: You can perform validation, data transformation, or trigger actions when setting a value. Similarly, you can calculate a property dynamically using a getter.

3.  **Private Properties**: Often, a property managed by a setter is stored in a "private" property (commonly prefixed with an underscore, like _property), while the public property name is used in the getter and setter.

4.  **Using Getters and Setters Like Properties**: You don’t call getter and setter methods explicitly. Instead, you access them as if they are regular properties.

```javascript
class User {
  constructor(name) {
    this._name = name;
  }
  get name() {
    return this._name.toUpperCase();
  }
  set name(value) {
    if (value.length < 3) {
      console.log('Name is too short.');
      return;
    }
    this._name = value;
  }
}
const user = new User('John');
console.log(user.name); // Output: JOHN (getter modifies output)
user.name = 'Jo'; // Output: Name is too short. (setter validation)
user.name = 'Alex'; // Sets the name to 'Alex'
console.log(user.name); // Output: ALEX
```

### Summary

- **Getters**: Used to retrieve and compute a property’s value when accessed.

- **Setters**: Used to define custom logic for updating a property’s value.

- They are **accessed like properties** but function as methods behind the scenes.

- Useful for encapsulating logic, validation, or controlling how data is retrieved or modified in a class.

## 11. What are modules in ES6?

ES6 (ECMAScript 2015) introduced a native module system that allows developers to break up code into smaller, reusable pieces (modules) and manage dependencies between these pieces. Modules are self-contained units of functionality that can export and import values, objects, functions, and classes. This makes code more maintainable, reusable, and easier to understand.

### Key Concepts of ES6 Modules

1.  **Exporting**: Modules can expose certain parts of their code (like variables, functions, or classes) to be used by other modules. This is done using the export keyword.

2.  **Importing**: Modules can import functionality from other modules using the import keyword. This makes it easy to reuse code across different files.

### 1. **Exporting in ES6 Modules**

There are two main types of exports: **named exports** and **default exports**.

#### a. **Named Exports**:

You can export multiple items from a module using named exports. Each item must be imported using its exact name.

- **Example**:

// math.js

```javascript
export const PI = 3.1416;
export function add(a, b) {
  return a + b;
}
export class Calculator {
  multiply(a, b) {
    return a * b;
  }
}
```

Here, we are exporting a constant PI, a function add, and a class Calculator.

#### b. **Default Export**:

Each module can have a single default export. The default export does not need a specific name, and when imported, it can be given any name.

- **Example**:

// utils.js

```javascript
export default function subtract(a, b) {
  return a - b;
}
```

Here, the subtract function is the default export of the module.

### 2. **Importing in ES6 Modules**

When importing from a module, you use the import keyword. You can import named exports or default exports, and the syntax differs slightly depending on the type of export.

#### a. **Importing Named Exports**:

```javascript
When importing named exports, you must use curly braces {} and import them by their exact names.
```

- **Example**:

// main.js

```javascript
import { PI, add, Calculator } from './math.js';
console.log(PI); // Output: 3.1416
console.log(add(2, 3)); // Output: 5
const calc = new Calculator();
console.log(calc.multiply(3, 4)); // Output: 12
```

In this example, we are importing PI, add, and Calculator from the math.js module using their names inside curly braces.

#### b. **Importing Default Exports**:

When importing a default export, you don’t need to use curly braces. You can also give the imported value any name.

- **Example**:

// main.js

```javascript
import subtract from './utils.js';
console.log(subtract(10, 5)); // Output: 5
```

Here, the default export from utils.js is imported, and you can name it anything you want (e.g., subtract).

### 3. **Combining Named and Default Imports**

You can import both named exports and the default export from a module in a single statement.

- **Example**:

```javascript
import subtract, { add, PI } from './math.js';
console.log(PI); // Output: 3.1416
console.log(add(2, 3)); // Output: 5
console.log(subtract(10, 5)); // Output: 5
```

### 4. **Re-exporting (Aggregation)**

ES6 modules allow re-exporting, meaning you can import something from one module and immediately export it without having to define it in the current module.

- **Example**:

Now, mathOperations.js exports the add and subtract functions directly from math.js, without modifying or defining them in mathOperations.js.

```javascript
// mathOperations.js
export { add, subtract } from './math.js';
```

### 5. **Dynamic Imports**

ES6 also supports dynamic imports, which allow you to load modules at runtime. This is useful for situations where you want to load code conditionally or lazily, rather than all at once.

- **Example**:

In this example, the module is loaded asynchronously, and its exports are used only when the import is complete.

```javascript
import('./math.js').then(module => {
  console.log(module.add(2, 3)); // Output: 5
});
```

### Key Features of ES6 Modules

- **Strict Mode**: ES6 modules are always in strict mode (use strict), which helps avoid common JavaScript pitfalls (e.g., accidentally creating global variables).

- **Scope**: Variables and functions inside a module are scoped to that module and are not accessible from outside unless explicitly exported.

- **Live Bindings**: Imported values reflect changes in the exported values in real-time. This means if the value of an exported variable changes in the module, the imported value will also update.

### Example of Full ES6 Module Workflow

1.  **math.js** (module file):

```javascript
export const PI = 3.1416;
export function add(a, b) {
  return a + b;
}
export default function subtract(a, b) {
  return a - b;
}
```

2.  **main.js** (importing module):

```javascript
import subtract, { PI, add } from './math.js';
console.log(PI); // Output: 3.1416
console.log(add(2, 3)); // Output: 5
console.log(subtract(10, 5)); // Output: 5
```

### Summary

- **Modules**: Enable better organization and reusability of code by splitting functionality into independent, reusable pieces.

- **Named Exports**: Allow multiple items to be exported from a module by name.

- **Default Exports**: Each module can have one default export, which can be imported without using curly braces.

- **Import**: Allows you to bring in exported values from other modules using import.

- **Re-exporting**: You can re-export items from other modules to consolidate exports.

ES6 modules greatly enhance code organization and maintainability, making them a fundamental feature for modern JavaScript development.

## 12. What is the role of the import and export keywords in ES6 modules?

In ES6 modules, the import and export keywords are fundamental for managing dependencies and enabling modular code. They allow you to **export** parts of a module (variables, functions, objects, classes) and **import** them into other modules, facilitating code reuse, organization, and encapsulation.

### **1. The** export **Keyword**

The export keyword is used to make certain elements (like variables, functions, or classes) available for use in other modules. ES6 provides two types of exports:

#### a. **Named Exports**

With **named exports**, you explicitly specify what part of the module you want to export. Multiple named exports are allowed in a module.

- **Syntax**:

```javascript
export { value1, value2, ... };
```

- **Example**:

```javascript
// math.js
export const PI = 3.1416;
export function add(a, b) {
  return a + b;
}
export class Calculator {
  multiply(a, b) {
    return a * b;
  }
}
```

Here, the PI constant, add function, and Calculator class are **named exports** and can be imported by other modules.

#### b. **Default Export**

A **default export** allows you to export a single value from a module. It doesn’t need to have a name, and each module can only have one default export.

- **Syntax**:

```javascript
export default value;
```

- **Example**:

```javascript
// utils.js
export default function subtract(a, b) {
  return a - b;
}
```

In this case, the subtract function is the **default export**, and when imported, it can be given any name in the importing module.

### **2. The** import **Keyword**

The import keyword is used to bring in values from other modules. You can import **named exports**, **default exports**, or both.

#### a. **Importing Named Exports**

```javascript
When importing named exports, you must use curly braces {} to import them by their exact names.
```

- **Syntax**:

```javascript
import { value1, value2 } from './module.js';
```

- **Example**:

```javascript
// main.js
import { PI, add, Calculator } from './math.js';
console.log(PI); // Output: 3.1416
console.log(add(2, 3)); // Output: 5
const calc = new Calculator();
console.log(calc.multiply(3, 4)); // Output: 12
```

In this example, the PI, add, and Calculator values are imported as named exports from the math.js module.

#### b. **Importing Default Exports**

When importing a default export, you don’t use curly braces, and you can assign it any name.

- **Syntax**:

```javascript
import defaultValue from './module.js';
```

- **Example**:

```javascript
// main.js
import subtract from './utils.js';
console.log(subtract(10, 5)); // Output: 5
```

Here, the subtract function (the default export from utils.js) is imported without using curly braces, and it can be renamed to anything.

#### c. **Importing Both Named and Default Exports**

You can combine named and default imports in a single statement.

- **Syntax**:

```javascript
import defaultValue, { namedValue1, namedValue2 } from './module.js';
```

- **Example**:

```javascript
// main.js
import subtract, { add, PI } from './math.js';
console.log(PI); // Output: 3.1416
console.log(add(2, 3)); // Output: 5
console.log(subtract(10, 5)); // Output: 5
```

In this case, the default export (subtract) is imported alongside the named exports (add and PI).

### **3. Importing All Exports (Namespace Import)**

You can import all of the named exports from a module into a single object using the * syntax. This is often referred to as a **namespace import**.

- **Syntax**:

```javascript
import * as moduleName from './module.js';
```

- **Example**:

```javascript
// main.js
import * as math from './math.js';
console.log(math.PI); // Output: 3.1416
console.log(math.add(2, 3)); // Output: 5
const calc = new math.Calculator();
console.log(calc.multiply(3, 4)); // Output: 12
```

In this example, all exports from math.js are imported into a single math object, allowing you to access them using math.PI, math.add(), etc.

### **4. Dynamic Imports**

Dynamic imports allow you to load a module asynchronously, at runtime, using the import() function. This is useful for code-splitting and lazy loading modules.

- **Syntax**:

```javascript
import('./module.js').then(module => {
  // Use the module
});
```

- **Example**:

```javascript
// main.js
import('./math.js').then(math => {
  console.log(math.add(2, 3)); // Output: 5
});
```

This imports the module dynamically and allows you to access its exports after the promise resolves.

### **5. Summary of** import **and** export

- **export**:

  - Used to expose parts of a module (functions, variables, classes) so that they can be imported in other files.

  - Can be either **named exports** (multiple exports) or a **default export** (single export).

- **import**:

  - Used to bring in functionality from other modules.

  - You can import **named exports**, a **default export**, or **both**.

  - You can also dynamically import modules.

## 13. What is the difference between named exports and default exports?

In ES6, both named exports and default exports allow you to export functionality from one module and import it into another. However, they have key differences in syntax, use cases, and how they are imported.

### 1. Named Exports

- **Definition**: Named exports allow you to export multiple values (variables, functions, classes, etc.) from a module, and they must be imported using their exact names.

- **Usage**:

  - You can have multiple named exports in a module.

  - When importing, you must use curly braces {} and match the names exactly.

- **Syntax**:

```javascript
// Exporting named items
export const PI = 3.1416;
export function add(a, b) {
  return a + b;
}
// Importing named exports
import { PI, add } from './math.js';
```

- **Example**:

```javascript
// math.js
export const PI = 3.1416;
export function add(a, b) {
  return a + b;
}
// main.js
import { PI, add } from './math.js';
console.log(PI); // Output: 3.1416
console.log(add(2, 3)); // Output: 5
```

- **Characteristics**:

  - You must import the exported items by their exact names.

  - Multiple named exports can exist in a single module.

  - You can rename imports using the as keyword:

```javascript
import { add as sum } from './math.js';
```

### 2. Default Exports

- **Definition**: A default export allows you to export a single value (function, class, object, or any value) as the default export of a module. When importing a default export, you can give it any name, and it does not require curly braces.

- **Usage**:

  - A module can have only one default export.

  - The default export can be imported without specifying the exact name.

- **Syntax**:

```javascript
// Exporting a default item
export default function subtract(a, b) {
  return a - b;
}
// Importing a default export
import subtract from './math.js';
```

- **Example**:

```javascript
// math.js
export default function subtract(a, b) {
  return a - b;
}
// main.js
import subtract from './math.js';
console.log(subtract(10, 5)); // Output: 5
```

- **Characteristics**:

  - There can be only one default export per module.

  - When importing, you can give the default export any name.

  - Default exports are commonly used when a module primarily exports one piece of functionality (e.g., a single function or class).

### 3. Key Differences

| **Aspect** | **Named Export** | **Default Export** |
|----|----|----|
| **Number of Exports** | Can have multiple named exports in a module. | A module can have only one default export. |
| **Syntax** | export { item1, item2 } | export default item |
| **Import Syntax** | Requires curly braces: import { item } | No curly braces: import item |
| **Name Matching** | Must import using the exact exported name. | Can import with any name. |
| **Use Case** | When a module exports multiple items. | When a module primarily exports one item. |
| **Renaming** | Can rename using as: import { item as x } | Import with any name directly. |

### 4. Combining Named and Default Exports

You can mix named and default exports in the same module.

- **Example**:

```javascript
// math.js
export const PI = 3.1416;
export function add(a, b) {
  return a + b;
}
export default function subtract(a, b) {
  return a - b;
}
// main.js
import subtract, { PI, add } from './math.js';
console.log(subtract(10, 5)); // Output: 5
console.log(add(2, 3)); // Output: 5
console.log(PI); // Output: 3.1416
```

### Summary

- **Named Exports**: Export multiple items by name. Import using curly braces and the exact names.

- **Default Exports**: Export a single default value. Import without curly braces, and you can name it anything.

## 14. What is the difference between static and dynamic imports in ES6?

In ES6 (ECMAScript 2015), imports can be classified into **static** and **dynamic** based on when and how the modules are imported into the code.

### 1. Static Imports

Static imports are used when the module to be imported is known at compile-time, and the imports are resolved before the code executes. These imports are defined at the top level of the code and cannot be conditional or dynamically generated.

### Key characteristics

- Syntax: import { moduleName } from './module.js';

- Imported at the start of the file and cannot be changed during runtime.

- Modules are loaded eagerly (i.e., immediately when the script is evaluated).

- Allows for tree-shaking (dead code elimination), helping in reducing bundle size.

### Example

```javascript
import { add, subtract } from './math.js';
console.log(add(5, 3)); // Output: 8
```

### Advantages

- Supports static analysis and optimizations.

- Easier to reason about since all dependencies are listed at the top.

### 2. Dynamic Imports

Dynamic imports are used to import modules during runtime based on specific conditions, user interactions, or any other dynamic logic. They return a promise, which is resolved when the module is loaded.

### Key characteristics

- Syntax: import('./module.js').then(module => { /* use module */ });

- Can be used conditionally or within functions.

- Modules are loaded lazily (i.e., when they are needed).

- Ideal for code splitting, reducing the initial load time by only loading certain parts of the application on demand.

### Example

```javascript
function loadMathModule() {
  import('./math.js').then(math => {
    console.log(math.add(5, 3)); // Output: 8
  });
}
// Module is only loaded when the function is called
loadMathModule();
```

### Advantages

- Useful for code splitting and optimizing performance.

- Modules are only loaded when necessary.

### Summary of Differences

| **Feature** | **Static Imports** | **Dynamic Imports** |
|----|----|----|
| Timing of Loading | At compile time (eager loading) | At runtime (lazy loading) |
| Syntax | import { module } from 'module.js'; | import('module.js').then(module => {}) |
| Conditional Loading | No | Yes, can be loaded conditionally |
| Return Value | Exports are available immediately | Returns a promise |
| Code Splitting | No | Yes, better for lazy loading and splitting |

Each type serves different use cases, with static imports being ideal for known dependencies and dynamic imports being great for loading on-demand modules.

## 15. What is the purpose of the Object.assign() method in ES6, and how is it used?

The Object.assign() method in ES6 is used to copy the properties and values from one or more source objects to a target object. It allows you to merge objects and create shallow copies of objects.

### **Purpose of** Object.assign()

- **Merging Objects**: You can combine multiple objects into a single object by copying their properties.

- **Cloning Objects**: You can create a shallow copy of an object.

- **Overriding Properties**: When multiple source objects have properties with the same key, the last object's property overwrites the previous ones.

### **Syntax**

```javascript
Object.assign(target, ...sources);
```

- **target**: The object to which properties will be assigned (modified).

- **sources**: One or more source objects whose properties will be copied to the target.

### **Examples**

#### 1. **Merging Objects**

```javascript
const obj1 = { a: 1, b: 2 };
const obj2 = { b: 3, c: 4 };
const result = Object.assign({}, obj1, obj2);
console.log(result); // Output: { a: 1, b: 3, c: 4 }
```

- obj1 and obj2 are merged into a new object.

- The property b from obj2 overwrites b from obj1.

#### 2. **Cloning an Object**

```javascript
const original = { a: 1, b: 2 };
const copy = Object.assign({}, original);
console.log(copy); // Output: { a: 1, b: 2 }
```

- copy is a shallow copy of original. The objects are not the same in memory, but their contents are identical.

#### 3. **Shallow Copy**

Object.assign() creates a shallow copy, meaning it only copies references for nested objects.

```javascript
const obj = { a: 1, b: { c: 2 } };
const shallowCopy = Object.assign({}, obj);
shallowCopy.b.c = 3;
console.log(obj.b.c); // Output: 3 (since it's a shallow copy)
```

- The change in the nested object b.c reflects in both obj and shallowCopy because only the reference to the nested object was copied.

### **Use Cases**

- **Merging configuration objects**: Combining default and user-specified settings in applications.

- **Creating shallow copies**: Useful when you need a quick clone of an object, though not for deeply nested structures.

- **Overriding properties**: Helps in overriding properties when you have multiple objects with shared keys.

### **Limitations**

- **Shallow copy**: Only copies top-level properties. Deeply nested objects are not cloned, just referenced.

- **Enumerability**: Only copies enumerable properties, so non-enumerable properties are skipped.

### Example of Overriding Properties

```javascript
const defaultSettings = { theme: 'light', layout: 'grid' };
const userSettings = { theme: 'dark' };
const finalSettings = Object.assign({}, defaultSettings, userSettings);
console.log(finalSettings); // Output: { theme: 'dark', layout: 'grid' }
```

In this case, the theme property from userSettings overrides the theme from defaultSettings, while other properties remain the same.

## 16. What is Object.is() in ES6, and how does it differ from ===?

In ES6, Object.is() is a method used to compare two values for equality, similar to the strict equality operator (===), but with some key differences in how they handle special cases.

### Purpose of Object.is()

Object.is() determines whether two values are the same, with behavior slightly different from the strict equality (===) operator for certain edge cases, particularly involving NaN and -0.

### Syntax

```javascript
Object.is(value1, value2);
```

- **value1** and **value2** are the values you want to compare.

### Key Differences Between Object.is() and ===

1.  **NaN Comparison**:

    - === considers NaN to be unequal to itself.

    - Object.is() treats NaN as equal to NaN.

**Example:**

```javascript
NaN === NaN; // false
Object.is(NaN, NaN); // true
```

2.  **+0 and -0**:

    - === considers +0 and -0 to be the same.

    - Object.is() treats +0 and -0 as different values.

**Example:**

```javascript
+0 === -0; // true
Object.is(+0, -0); // false
```

3.  **Normal Cases**: For most other cases, Object.is() behaves the same as ===. Both check for strict equality (same value and type).

**Example:**

```javascript
5 === 5; // true
Object.is(5, 5); // true
'foo' === 'foo'; // true
Object.is('foo', 'foo'); // true
```

### Summary of Differences

| **Case** | **Object.is()** | **===** |
|----|----|----|
| NaN === NaN | true | false |
| +0 === -0 | false | true |
| Other values | Same behavior as === | Exact equality check (same value and type) |

### Use Cases for Object.is()

- When you need to handle edge cases like NaN and distinguish between +0 and -0.

- Useful in scenarios where special handling of NaN or -0 is required, such as in numerical calculations or precise comparisons.

For most everyday comparisons, === is sufficient, but Object.is() is helpful when you need to account for these specific edge cases.
