# DAY 12 - Loops in Java


# Loops in Java

Make Java repeat tasks automatically.

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

---

# Why Do We Need Loops?

Repeating code manually becomes difficult.

### Without Loop

```java
System.out.println("Hello");
System.out.println("Hello");
System.out.println("Hello");
System.out.println("Hello");
System.out.println("Hello");
```

### Problem

What if we need to print it 1000 times?

Loops solve this automatically.

---


# What Is A Loop?

### Definition

A loop repeats a block of code multiple times.

### Benefit

Write code once and let Java execute it repeatedly.

### Example

```java
for(...)
{
   // repeated code
}
```

Smart. Simple. Efficient.

---

# Loop Execution Flow

Understand how every loop works internally.

### Flow

```text
Start
->
Check Condition
->
Execute Code
->
Update Value
->
Repeat
```

Every loop follows this cycle.

---

# The For Loop

Best when the number of iterations is known.

### Syntax

```java
for(initialization; condition; update)
{
   // code
}
```

### Example

```java
for(int i=1; i<=5; i++)
{
   System.out.println(i);
}
```

### Output

```text
1
2
3
4
5
```

---


# Understanding The For Loop

Break the statement into parts.

### Breakdown

```java
Initialization -> i = 1
Condition      -> i <= 5
Update         -> i++
```

### Meaning

Initialization starts the loop.

Condition decides whether it should continue.

Update changes the value after each iteration.

---


# The While Loop

Runs while a condition remains true.

### Syntax

```java
while(condition) {
   // code
}
```

### Example

```java
int i = 1;
while(i <= 5) {
   System.out.println(i);
   i++;
}
```

### Output

```text
1
2
3
4
5
```

---

# The Do While Loop

Executes before checking the condition.

### Syntax

```java
do {
   // code
} while(condition);
```

### Example

```java
int i = 1;
do {
   System.out.println(i);
   i++;
} while(i <= 5);
```

### Key Point

Runs at least once.

---


# Real World Example

ATM PIN Validation

### Flow

```text
Enter PIN
->
Wrong PIN
->
Try Again
->
Wrong PIN
->
Try Again
->
Correct PIN
->
Access Granted
```

### Logic

```java
while(pinIncorrect)
{
   AskPinAgain();
}
```

This is how real systems use loops.

---

# Common Beginner Mistakes

Avoid these problems.

### Infinite Loop

```java
while(true)
{
   System.out.println("Oops");
}
```

### Other Mistakes

* Forgetting i++
* Wrong loop condition
* Updating the wrong variable

### Result

Program never stops.

---

# Key Takeaways

Today you learned:

* For Loop
* While Loop
* Do While Loop
* Loop Execution Flow
* ATM Validation Example
* Common Loop Mistakes

Loops are one of the most important concepts in programming.

Master loops and you unlock automation in code.
