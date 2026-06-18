# DAY 20 - Static Keyword in Java

## Hook

Stop wasting **valuable memory** by duplicating **shared values...**

---

# Static Keyword in Java

Belongs To The Class, Not The Object

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

Day 13 - Methods

Day 14 - Arrays

Day 15 - Strings

Day 16 - Introduction to OOP

Day 17 - Classes and Objects

Day 18 - Constructors

Day 19 - this Keyword

---

# Why Do We Need Static?

Imagine a company application.

Every employee object contains:

```text
Employee ID
Name
Salary
```

But all employees belong to the same company:

```text
Google
```

Should every object store:

```text
Google
Google
Google
Google
Google
```

❌ Waste of memory.

We need one shared value.

That's where static comes in.

---

# What Is Static?

### Definition

The static keyword makes a variable or method belong to the class rather than individual objects.

### Without Static

```text
Object 1 → Own Copy

Object 2 → Own Copy

Object 3 → Own Copy
```

### With Static

```text
One Shared Copy
```

for all objects.

---

# Static Variable

### Example

```java
class Employee {

   static String company =
   "Google";
}
```

### Objects

```java
Employee e1 =
new Employee();

Employee e2 =
new Employee();
```

Both objects share the same company variable.

---

# Memory Visualization

### Non Static Variable

```text
e1.name

e2.name

e3.name
```

Separate memory for each object.

### Static Variable

```text
company
```

Single shared memory.

### Result

✔ Less Memory

✔ Better Efficiency

---

# Accessing Static Variables

Static members should be accessed using the class name.

### Example

```java
System.out.println(
Employee.company
);
```

### Output

```text
Google
```

No object required.

---

# Static Method

### Example

```java
class Calculator {

   static int add(
      int a,
      int b
   ) {

      return a + b;
   }
}
```

### Call

```java
Calculator.add(10,20);
```

### Output

```text
30
```

---

# Why Main Method Is Static?

Every Java program starts with:

```java
public static void main(
String[] args
)
```

### Reason

Java must execute main() before creating any object.

If main() were not static:

```text
Object Required
```

But no object exists yet.

That's why main() is static.

---

# Static vs Non Static

### Static

```text
Belongs To Class

Shared By Objects

Access Using Class Name
```

### Non Static

```text
Belongs To Object

Separate Copy

Access Using Object
```

This is one of the most important Java interview topics.

---

# Real World Example

Bank Application

### Static Variable

```java
static String bankName =
"State Bank";
```

Every account shares:

```text
State Bank
```

### Non Static Variables

```java
accountNumber

balance

customerName
```

Every account has its own values.

---

# Common Beginner Mistakes

Avoid these problems.

### Mistakes

* Accessing instance variables inside static methods

```java
static void test() {

   System.out.println(name);
}
```

❌ Invalid

* Treating static variables as object variables

* Creating unnecessary objects

### Result

Compilation errors or poor design.

---

# Key Takeaways

Today you learned:

* What Static Is
* Why Static Exists
* Static Variables
* Static Methods
* Why main() Is Static
* Static vs Non Static
* Real World Usage
* Common Mistakes

The static keyword helps share data and functionality across all objects of a class.

It improves memory efficiency and is widely used in enterprise Java applications.
