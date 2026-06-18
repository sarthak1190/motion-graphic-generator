# DAY 16 - Introduction to Object-Oriented Programming (OOP)

## Hook

Stop writing **messy code** with **variables scattered everywhere...**

---

# Introduction to OOP in Java

The Foundation of Real-World Java Development

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

---

# Why Do We Need OOP?

Imagine building an application for:

🏦 Banking

🛒 E-Commerce

🚕 Ride Booking

🏥 Hospital Management

Thousands of users.

Millions of records.

Managing everything with only variables and methods becomes difficult.

We need a better way to organize code.

That's where OOP comes in.

---

# What Is OOP?

### Definition

Object-Oriented Programming (OOP) is a programming approach that organizes software using Objects and Classes.

### Goal

Represent real-world entities in code.

### Examples

```text
Car
Employee
Student
Customer
Bank Account
```

Everything can be represented as objects.

---

# Real World Analogy

Think about a Car.

A car has:

### Properties

```text
Color
Brand
Speed
Model
```

### Behaviors

```text
Start()
Stop()
Accelerate()
Brake()
```

In OOP:

Properties → Variables

Behaviors → Methods

---

# What Is A Class?

### Definition

A Class is a blueprint for creating objects.

### Example

Blueprint:

```text
Car
```

Contains:

```text
Brand
Color
Speed
```

and

```text
Start()
Stop()
```

A class defines what an object should look like.

---

# What Is An Object?

### Definition

An Object is an instance of a class.

### Example

Class:

```text
Car
```

Objects:

```text
BMW Car
Audi Car
Tesla Car
```

All are different objects created from the same blueprint.

---

# First OOP Example

### Class

```java
class Car {

   String brand;

   void start() {
      System.out.println("Car Started");
   }
}
```

### Object

```java
Car c = new Car();
```

Now the object can use everything defined in the class.

---

# Object Interaction

### Example

```java
Car c = new Car();

c.brand = "BMW";

c.start();
```

### Output

```text
Car Started
```

Objects use:

✔ Variables

✔ Methods

defined inside the class.

---

# Four Pillars Of OOP

Java OOP is built on:

### 1. Encapsulation

Protect data.

### 2. Inheritance

Reuse code.

### 3. Polymorphism

Multiple forms.

### 4. Abstraction

Hide complexity.

These four concepts make Java powerful.

---

# Real World Example

Bank Account

### Properties

```text
Account Number
Balance
Customer Name
```

### Behaviors

```text
Deposit()
Withdraw()
CheckBalance()
```

This is exactly how enterprise applications are designed.

---

# Key Takeaways

Today you learned:

* Why OOP Exists
* What OOP Is
* Class
* Object
* Real World Mapping
* First OOP Example
* Four Pillars Of OOP

OOP is the backbone of Java development.

Almost every Spring Boot application, enterprise system, and microservice uses OOP principles.

Tomorrow we'll dive deeper into Classes and Objects.
