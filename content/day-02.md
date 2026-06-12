# Kafka Consumer Group Basics

Kafka consumer groups let multiple app instances process records from the same topic in parallel.

## Kafka vs Queue

| Feature | Kafka | Traditional Queue |
| --- | --- | --- |
| Message retention | Time or size based | Usually removed after consume |
| Scaling model | Partition ownership | Competing consumers |
| Replay | Supported by offsets | Usually limited |

## Architecture

Producer -> Topic -> Partition 0 -> Consumer A
Producer -> Topic -> Partition 1 -> Consumer B
Producer -> Topic -> Partition 2 -> Consumer C

## Best Practices

- Keep partitions greater than or equal to expected parallelism
- Commit offsets after successful processing
- Use idempotent consumers for retry safety
- Monitor consumer lag

## Common Mistakes

- Creating more consumers than partitions and expecting more throughput
- Committing offsets before the work is complete
- Ignoring poison-pill messages

## Summary

Consumer groups are how Kafka turns a topic into a scalable processing pipeline.
