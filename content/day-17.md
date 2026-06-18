# DAY 17 - Classes and Objects Deep Dive

## Hook

Stop thinking **Classes** and **Objects** are the **same thing...**

---

# Classes and Objects in Java

The Building Blocks of OOP

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

---

# Why Classes and Objects?

Yesterday we learned:

```text
OOP = Classes + Objects
```

But what exactly are they?

Think about:

🚗 Cars

👨 Employees

🎓 Students

🏦 Bank Accounts

Every real-world thing has:

✔ Properties

✔ Behaviors

Classes and Objects help us model them in code.

---

# Understanding a Class

### Definition

A Class is a blueprint or template for creating objects.

### Example

Car Blueprint

```text
Properties:
Brand
Color
Speed

Behaviors:
Start()
Stop()
Brake()
```

A class only defines the structure.

It does not create a real object.

---

# Understanding an Object

### Definition

An Object is a real instance created from a class.

### Example

Class:

```text
Car
```

Objects:

```text
BMW
Audi
Tesla
```

All are different objects of the same class.

---

# Class vs Object

### Class

```text
Blueprint
Design
Template
```

### Object

```text
Real Thing
Actual Instance
Created From Class
```

### Real World Example

```text
Building Plan → Class

Actual House → Object
```

---

# Creating a Class

### Example

```java
class Student {

   String name;

   int age;
}
```

This class defines:

✔ Name

✔ Age

Every Student object will have these properties.

---

# Creating an Object

### Example

```java
Student s1 =
new Student();
```

Here:

```text
Student
```

is the class.

and

```text
s1
```

is the object.

The new keyword creates memory for the object.

---

# Accessing Object Data

### Example

```java
Student s1 =
new Student();

s1.name = "Sarthak";

s1.age = 28;

System.out.println(s1.name);

System.out.println(s1.age);
```

### Output

```text
Sarthak

28
```

Objects store and manage data.

---

# Objects Have Their Own Data

### Example

```java
Student s1 =
new Student();

Student s2 =
new Student();

s1.name = "Sarthak";

s2.name = "Rahul";
```

### Result

```text
s1 → Sarthak

s2 → Rahul
```

Both objects are independent.

---

# Real World Example

Bank Account Class

### Properties

```text
Account Number

Balance

Customer Name
```

### Objects

```text
Account 1

Account 2

Account 3
```

Every account is a separate object with its own data.

This is how banking applications work internally.

---

# Key Takeaways

Today you learned:

* What a Class Is
* What an Object Is
* Class vs Object
* Creating Classes
* Creating Objects
* Accessing Object Data
* Independent Objects
* Real World Usage

Classes define the blueprint.

Objects bring the blueprint to life.

Classes and Objects are the foundation of Object-Oriented Programming and are used in almost every Java application.
