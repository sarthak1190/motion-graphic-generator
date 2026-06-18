# DAY 18 - Constructors in Java

## Hook

Stop manually **assigning values** to every **new object...**

---

# Constructors in Java

Automatically Initialize Objects

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

---

# Why Do We Need Constructors?

Suppose we create a Student object.

```java
Student s1 = new Student();

s1.name = "Sarthak";
s1.age = 28;
```

For every object, we must manually assign values.

This becomes repetitive.

Constructors solve this problem.

---

# What Is A Constructor?

### Definition

A Constructor is a special method that is automatically executed when an object is created.

### Purpose

Initialize object data.

### Example

```java
Student s1 =
new Student();
```

When the object is created, the constructor runs automatically.

---

# Constructor Characteristics

### Important Rules

✔ Constructor name must be same as class name

✔ Constructor has no return type

✔ Constructor runs automatically

✔ Used for initialization

### Example

```java
class Student {

   Student() {

   }
}
```

---

# Default Constructor

If we don't create a constructor, Java provides one automatically.

### Example

```java
class Student {

   String name;

   int age;
}
```

Object Creation:

```java
Student s1 =
new Student();
```

Java internally creates a default constructor.

---

# User Defined Constructor

We can create our own constructor.

### Example

```java
class Student {

   Student() {
      System.out.println(
      "Student Created");
   }
}
```

### Output

```text
Student Created
```

The constructor executes automatically.

---

# Parameterized Constructor

Constructors can receive values.

### Example

```java
class Student {

   String name;

   Student(String n) {
      name = n;
   }
}
```

Object Creation:

```java
Student s1 =
new Student("Sarthak");
```

Now every object can be initialized directly.

---

# Multiple Constructors

Java supports Constructor Overloading.

### Example

```java
class Student {

   Student() {

   }

   Student(String name) {

   }

   Student(String name,
           int age) {

   }
}
```

Same constructor name.

Different parameters.

---

# Constructor Execution Flow

### Flow

```text
new Student()
↓
Memory Allocated
↓
Constructor Executes
↓
Object Initialized
↓
Object Ready To Use
```

This happens every time an object is created.

---

# Real World Example

Bank Account Creation

### Without Constructor

```java
account.name = "Sarthak";

account.balance = 5000;
```

### With Constructor

```java
BankAccount account =
new BankAccount(
"Sarthak",
5000
);
```

Cleaner.

Safer.

Professional.

---

# Common Beginner Mistakes

Avoid these problems.

### Mistakes

* Adding return type

```java
void Student()
```

❌ Not a constructor

* Constructor name different from class name

* Forgetting parameters

* Confusing constructors with methods

### Result

Initialization issues and compilation errors.

---

# Key Takeaways

Today you learned:

* What Constructors Are
* Why Constructors Exist
* Default Constructor
* User Defined Constructor
* Parameterized Constructor
* Constructor Overloading
* Constructor Execution Flow
* Real World Usage

Constructors automatically initialize objects and make object creation cleaner and more efficient.

They are one of the most important concepts in Object-Oriented Programming.
