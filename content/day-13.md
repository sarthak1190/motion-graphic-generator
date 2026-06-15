# DAY 13 - Methods in Java

## Hook

Most **Java devs** write this **same line** **100 times...**

---

# Methods in Java

Write Once. Reuse Anywhere.

---

# Learning Journey Recap

A quick timeline before today's topic.

### Previous Topics

Day 1 - Why Learn Java

Day 2 - What is Java

Day 3 - JVM vs JRE vs JDK

Day 4 - First Java Program

Day 5 - Variables

Day 6 - Data Types

Day 7 - Operators

Day 8 - Scanner Class

Day 9 - Type Casting

Day 10 - Conditional Statements

Day 11 - Switch Statement

Day 12 - Loops

---

# Why Do We Need Methods?

Imagine writing the same code again and again.

### Without Methods

```java
System.out.println("Welcome");
System.out.println("Welcome");
System.out.println("Welcome");
```

### Problem

Repeated code increases maintenance effort.

Methods solve this by allowing code reuse.

---

# What Is A Method?

### Definition

A method is a block of code that performs a specific task.

### Benefit

Write code once and call it whenever needed.

### Example

```java
greet();
```

Reusable. Clean. Organized.

---

# Method Execution Flow

### Flow

```text
Program Starts
↓
Method Called
↓
Method Executes
↓
Control Returns
↓
Program Continues
```

Methods execute only when they are called.

---

# Creating A Method

### Syntax

```java
returnType methodName()
{
   // code
}
```

### Example

```java
public static void greet()
{
   System.out.println("Hello");
}
```

This method prints Hello.

---

# Calling A Method

After creating a method, it must be called.

### Example

```java
public static void greet()
{
   System.out.println("Hello");
}

public static void main(String[] args)
{
   greet();
}
```

### Output

```text
Hello
```

---

# Methods With Parameters

Parameters allow methods to accept input values.

### Example

```java
public static void greet(String name)
{
   System.out.println("Hello " + name);
}
```

### Method Call

```java
greet("Sarthak");
```

### Output

```text
Hello Sarthak
```

---

# Methods With Return Values

Methods can return data back to the caller.

### Example

```java
public static int add(int a, int b)
{
   return a + b;
}
```

### Method Call

```java
int result = add(10, 20);
```

### Output

```text
30
```

---

# Real World Example

Bank Account Balance Check

### Method

```java
public static double getBalance()
{
   return 25000;
}
```

### Usage

```java
double balance = getBalance();
```

### Output

```text
25000
```

This is how real applications organize reusable logic.

---

# Common Beginner Mistakes

Avoid these problems.

### Mistakes

* Forgetting to call the method
* Missing return statement
* Wrong return type
* Incorrect parameter order
* Typing method name incorrectly

### Result

Compilation errors or unexpected output.

---

# Key Takeaways

Today you learned:

* What Methods Are
* Why Methods Exist
* Method Syntax
* Method Calling
* Parameters
* Return Values
* Real World Usage

Methods help write reusable and maintainable code.

Master methods and your programs become cleaner, modular and easier to manage.
