# DAY 14 - Arrays in Java

## Hook

Stop creating **10 different variables** for **10 related values...**

VO: Stop creating ten different variables for ten related values. Let me show you why this is bad, and what you should be doing instead.

---

# Arrays in Java

Store Multiple Values Efficiently

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

---

# Why Do We Need Arrays?

Imagine storing marks of 5 students.

### Without Array

```java
int mark1 = 85;
int mark2 = 90;
int mark3 = 78;
int mark4 = 88;
int mark5 = 95;
```

### Problem

Too many variables become difficult to manage.

Arrays solve this by storing multiple values in a single variable.

---

# What Is An Array?

### Definition

An Array is a collection of similar data types stored in contiguous memory locations.

### Benefit

Store multiple values using a single variable name.

### Example

```java
int[] marks = {85, 90, 78, 88, 95};
```

Simple. Organized. Efficient.

---

# Array Structure

### Visual Representation

```text
Index:   0    1    2    3    4

Value:  85   90   78   88   95
```

### Important

Array indexing always starts from 0.

---

# Creating An Array

### Syntax

```java
dataType[] arrayName = new dataType[size];
```

### Example

```java
int[] numbers = new int[5];
```

This creates an array capable of storing 5 integers.

---

# Initializing An Array

### Example

```java
int[] numbers = {10, 20, 30, 40, 50};
```

### Accessing Values

```java
System.out.println(numbers[0]);
```

### Output

```text
10
```

Arrays use indexes to access values.

---

# Traversing An Array

Loops and arrays are commonly used together.

### Example

```java
int[] numbers = {10, 20, 30, 40, 50};

for (int i = 0; i < numbers.length; i++) {
   System.out.println(numbers[i]);
}
```

### Output

```text
10
20
30
40
50
```

---

# Common Array Operations

### Operations

✔ Access Elements

✔ Update Elements

✔ Traverse Elements

✔ Find Length

### Example

```java
System.out.println(numbers.length);
```

### Output

```text
5
```

The length property tells how many elements are present.

---

# Real World Example

Student Marks Management System

### Array

```java
int[] marks = {85, 90, 78, 88, 95};
```

### Usage

Store marks of multiple students.

Calculate:

✔ Total Marks

✔ Average Marks

✔ Highest Marks

✔ Lowest Marks

Arrays are heavily used in real applications.

---

# Common Beginner Mistakes

Avoid these problems.

### Mistakes

* Accessing invalid index

```java
numbers[5]
```

when array size is 5.

* Forgetting index starts at 0

* Using wrong loop condition

* Array index out of bounds

### Result

Runtime errors.

---

# Key Takeaways

Today you learned:

* What Arrays Are
* Why Arrays Exist
* Array Structure
* Creating Arrays
* Initializing Arrays
* Traversing Arrays
* Common Operations
* Real World Usage

Arrays help store and manage multiple values efficiently.

Master arrays and you'll be ready for many important Data Structures concepts.
