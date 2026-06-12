# Day 01: Spring Boot Request Lifecycle

Spring Boot hides a lot of plumbing, but every HTTP request still follows a predictable path.

## Definition

The request lifecycle is the sequence of components that receive, transform, route, execute, and return a response for an incoming HTTP call.

## Core Flow

Client
↓
DispatcherServlet
↓
Handler Mapping
↓
Controller
↓
Service
↓
Repository
↓
Database

## Code Example

```java
@RestController
@RequestMapping("/orders")
class OrderController {
  private final OrderService service;

  @GetMapping("/{id}")
  OrderResponse findById(@PathVariable Long id) {
    return service.findById(id);
  }
}
```

## Best Practices

- Keep controllers thin
- Move business rules into services
- Validate input before calling the service layer
- Return clear HTTP status codes
- Log correlation IDs for production debugging

## Common Mistakes

- Putting database calls directly in controllers
- Returning entities from REST APIs
- Ignoring validation errors

## Interview Questions

- What role does DispatcherServlet play?
- How does Spring choose the correct controller method?
- Where should transaction boundaries live?

## Key Takeaways

- DispatcherServlet is the front controller
- Handler mappings choose the endpoint
- Controllers coordinate, services own business logic
- Repositories isolate persistence
