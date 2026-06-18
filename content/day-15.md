# DAY 15 - Strings in Java

## Hook

Stop using **==** to compare **Strings** in Java



---

# Strings in Java

Working With Text Data

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

---

# Why Do We Need Strings?

Programs don't only work with numbers.

They also work with text.

Examples:

```text
Name
Email
Address
Password
City
Country
```

Java uses Strings to store textual data.

---

# What Is A String?

### Definition

A String is a sequence of characters enclosed inside double quotes.

### Examples

```java
String name = "Sarthak";

String city = "Agra";

String company = "Google";
```

### Benefit

Strings help programs store and process text data.

---

# Creating Strings

### Method 1

Using String Literal

```java
String name = "Sarthak";
```

### Method 2

Using new Keyword

```java
String name = new String("Sarthak");
```

Both create Strings, but String Literals are preferred in most cases.

---

# Common String Operations

### Length

```java
String name = "Java";

System.out.println(name.length());
```

Output:

```text
4
```

### Convert To Uppercase

```java
System.out.println(name.toUpperCase());
```

Output:

```text
JAVA
```

---

# String Concatenation

Concatenation means joining Strings.

### Example

```java
String firstName = "Sarthak";
String lastName = "Mehta";

String fullName =
firstName + " " + lastName;

System.out.println(fullName);
```

Output:

```text
Sarthak Mehta
```

---

# Accessing Characters

Every character has an index.

### Example

```java
String language = "JAVA";

System.out.println(
language.charAt(0)
);
```

Output:

```text
J
```

### Index View

```text
J  A  V  A
0  1  2  3
```

---

# Comparing Strings

### Example

```java
String a = "Java";
String b = "Java";

System.out.println(a.equals(b)); // true
```

### Important

Always use `.equals()` for String comparison.

Avoid using `==` for checking String values.

---

# Real World Example

Login Verification System

### Code

```java
// Verify username
if (username.equals("admin")) {
   System.out.println("Login Successful");
} else {
   System.out.println("Invalid Username");
}
```

Strings are heavily used in authentication systems.

---

# Common Beginner Mistakes

Avoid these problems.

### Mistakes

* Using == instead of equals()
* Forgetting String indexes start at 0
* Accessing invalid index
* Ignoring case sensitivity

### Example

```java
"Java".equals("java")
```

Output:

```text
false
```

Because Strings are case-sensitive.

### Result

Logical errors or runtime exceptions.

---

# Key Takeaways

Today you learned:

* What Strings Are
* Creating Strings
* String Length
* Uppercase Conversion
* String Concatenation
* Accessing Characters
* Comparing Strings
* Real World Usage

Strings are one of the most commonly used data types in Java.

Master Strings and you'll be able to build real-world applications that work with user data, forms, authentication and much more.
