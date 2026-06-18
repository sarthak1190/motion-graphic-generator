# DAY 19 - The this Keyword in Java

## Hook

Stop getting **confused** between **parameters and object variables...**

---

# The this Keyword in Java

Refer to the Current Object

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

---

# Why Do We Need this?

Consider this constructor:

```java
class Student {

   String name;

   Student(String name) {
      name = name;
   }
}
```

Looks correct?

Actually, it isn't.

The value never gets assigned to the object's variable.

Why?

Because Java gets confused between:

```text
Parameter name

and

Instance variable name
```

This keyword solves this problem.

---

# What Is this?

### Definition

The `this` keyword refers to the current object.

Whenever we use:

```java
this
```

Java understands:

```text
Current Object
```

### Example

```java
this.name
```

means:

```text
Current object's name variable
```

---

# The Problem Without this

### Example

```java
class Student {

   String name;

   Student(String name) {

      name = name;
   }
}
```

### What Happens?

```text
Parameter name
=
Parameter name
```

The object's variable remains unchanged.

Result:

```text
name = null
```

---

# Solving With this

### Correct Example

```java
class Student {

   String name;

   Student(String name) {

      this.name = name;
   }
}
```

### Meaning

```text
this.name
↓
Object Variable

name
↓
Parameter
```

Now the value is assigned correctly.

---

# Visual Understanding

### Flow

```text
new Student("Sarthak")
            ↓
Parameter name = Sarthak
            ↓
this.name = name
            ↓
Object Variable Updated
```

Result:

```text
name = Sarthak
```

---

# Using this Inside Methods

The this keyword can also be used inside methods.

### Example

```java
class Student {

   String name = "Sarthak";

   void display() {

      System.out.println(
      this.name
      );
   }
}
```

### Output

```text
Sarthak
```

---

# Calling Another Constructor

The this keyword can call another constructor within the same class.

### Example

```java
class Student {

   Student() {

      this("Sarthak");
   }

   Student(String name) {

      System.out.println(name);
   }
}
```

### Output

```text
Sarthak
```

This is called Constructor Chaining.

---

# Common Uses Of this

### Most Common Uses

✔ Access current object variables

✔ Resolve variable ambiguity

✔ Call another constructor

✔ Pass current object

✔ Return current object

In real-world applications, the first two are used most often.

---

# Real World Example

Bank Account

### Class

```java
class BankAccount {

   String customerName;

   BankAccount(
      String customerName
   ) {

      this.customerName =
      customerName;
   }
}
```

### Object

```java
new BankAccount(
"Sarthak"
);
```

Result:

```text
customerName = Sarthak
```

---

# Common Beginner Mistakes

Avoid these problems.

### Mistakes

* Forgetting this when variable names are same

* Using this in static methods

```java
static void test() {

   this.name = "Java";
}
```

❌ Invalid

* Confusing object variable and parameter variable

### Result

Incorrect values or compilation errors.

---

# Key Takeaways

Today you learned:

* What this Keyword Is
* Why this Exists
* Resolving Variable Ambiguity
* Using this Inside Methods
* Constructor Chaining
* Real World Usage
* Common Mistakes

The this keyword helps Java identify the current object and is one of the most commonly used keywords in Object-Oriented Programming.

Mastering this will make constructors and object handling much easier.
