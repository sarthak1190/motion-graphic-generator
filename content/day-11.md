# Day 11: Switch Statement in Java

## Learning Journey Recap

* Day 1: Why Learn Java
* Day 2: What is Java
* Day 3: JVM vs JRE vs JDK
* Day 4: First Java Program
* Day 5: Variables
* Day 6: Data Types
* Day 7: Operators
* Day 8: User Input with Scanner
* Day 9: Type Casting
* Day 10: Conditional Statements

## Today's Topic

Switch Statement in Java

A cleaner alternative to multiple if-else conditions.

## Definition

A switch statement evaluates one value and compares it against multiple possible cases.

It is useful when one variable can match one value from a fixed set of options.

## Why Switch Exists

Multiple if-else conditions can become difficult to read.

```java
if(day == 1) {
    System.out.println("Monday");
} else if(day == 2) {
    System.out.println("Tuesday");
} else if(day == 3) {
    System.out.println("Wednesday");
} else if(day == 4) {
    System.out.println("Thursday");
}
```

Switch makes this type of logic cleaner and easier to maintain.

## Core Concept

```text
Input Value
↓
switch
↓
case 1
↓
case 2
↓
case 3
↓
default
```

Each case represents one possible value.

## Basic Syntax

```java
switch(variable) {
    case value1:
        // code
        break;

    case value2:
        // code
        break;

    default:
        // code
}
```

## Java Example

```java
int day = 3;
switch(day) {
    case 1: System.out.println("Monday"); break;
    case 2: System.out.println("Tuesday"); break;
    case 3: System.out.println("Wednesday"); break;
    default: System.out.println("Invalid Day");
}
```

Output:

```text
Wednesday
```

## Break Statement

The break keyword stops execution after a matching case is completed.

Without break, Java continues executing the next cases. This is called fall-through.

```java
int day = 1;

switch(day) {
    case 1:
        System.out.println("Monday");

    case 2:
        System.out.println("Tuesday");

    case 3:
        System.out.println("Wednesday");
}
```

Output:

```text
Monday
Tuesday
Wednesday
```

## Default Case

The default case runs when no case value matches.

```java
int day = 10;
switch(day) {
    case 1: System.out.println("Monday"); break;
    case 2: System.out.println("Tuesday"); break;
    default: System.out.println("Invalid Day");
}
```

Output:

```text
Invalid Day
```

The default case works like the else block in if-else logic.

## Real World Example

ATM menus are a common example of switch statements.

```text
1: Check Balance
2: Withdraw Cash
3: Deposit Money
4: Exit
```

## ATM Switch Example

If the user selects option 2, the switch statement directly runs the withdraw cash logic.

```java
int option = 2;
switch(option) {
    case 1: System.out.println("Check Balance"); break;
    case 2: System.out.println("Withdraw Cash"); break;
    case 3: System.out.println("Deposit Money"); break;
    case 4: System.out.println("Exit"); break;
    default: System.out.println("Invalid Option");
}
```

Output:

```text
Withdraw Cash
```

## Best Practices

* Use switch when checking one variable against many fixed values
* Use break after each case unless fall-through is intentional
* Always add a default case
* Keep each case small and readable
* Use meaningful case values

## Common Mistakes

* Forgetting the break statement
* Writing duplicate case values
* Missing the default case
* Writing too much logic inside one case
* Using switch where simple if-else would be clearer

## Interview Questions

* What is a switch statement?
* Why do we use switch in Java?
* What is the purpose of the case keyword?
* What is the purpose of break?
* What is fall-through in switch?
* What is the default case?
* When should switch be preferred over if-else?

## Key Takeaways

* Switch is used for multi-condition decision-making
* Each case represents one possible value
* Break prevents fall-through
* Default handles unmatched values
* Switch improves readability when many fixed options exist
* Switch is useful in menu-driven applications
