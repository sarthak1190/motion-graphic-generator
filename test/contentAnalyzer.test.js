import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { analyzeContent } from "../src/utils/contentAnalyzer.js";
import { parseMarkdownDocument, parseMarkdownSlides } from "../src/utils/markdownParser.js";
import { classifySection } from "../src/utils/sceneClassifier.js";
import { planScenes } from "../src/utils/scenePlanner.js";

const config = {
  brand: {
    handle: "@java_learning_hub_",
    challengeBadge: "Developer Learning Sprint",
    cta: ["Save This Post", "Follow For More"]
  },
  canvas: {
    width: 1080,
    height: 1920,
    durationSeconds: 3
  },
  output: {
    minClips: 1,
    maxClips: 60,
    minTotalSeconds: 30,
    maxTotalSeconds: 90,
    minSceneSeconds: 2,
    maxSceneSeconds: 12,
    finalHoldSeconds: 0.6,
    minFinalTextOpacity: 0.85,
    maxGifClips: 60,
    maxVisibleBlocksPerScene: 5
  }
};

test("parses structured markdown blocks without flattening lists", () => {
  const sections = parseMarkdownDocument(`# Runtime Notes

## Request Lifecycle
The request moves through layers.

> Keep controllers thin.

### Handler Step
1. Validate input
2. Call service

| Layer | Role |
| --- | --- |
| Controller | HTTP boundary |
`);

  const lifecycle = sections.find((section) => section.title === "Request Lifecycle");
  const handler = sections.find((section) => section.title === "Handler Step");

  assert.equal(lifecycle.blocks[0].type, "paragraph");
  assert.equal(lifecycle.blocks[1].type, "blockquote");
  assert.equal(handler.parentTitle, "Request Lifecycle");
  assert.equal(handler.blocks[0].type, "numberedList");
  assert.equal(handler.blocks[1].type, "table");
});

test("parses slide markers as the only scene boundaries", () => {
  const slides = parseMarkdownSlides(`# Day 40

## Slide 1

# Cover Topic

Intro copy.

## Slide 2

# Code Slide

### Syntax

\`\`\`java
for(int i=0; i<3; i++) {}
\`\`\`

### Output

\`\`\`text
done
\`\`\`
`);

  assert.equal(slides.length, 2);
  assert.equal(slides[0].slideLabel, "Slide 1");
  assert.equal(slides[0].blocks[0].type, "heading");
  assert.equal(slides[1].blocks[1].type, "heading");
  assert.equal(slides[1].blocks[2].type, "code");
  assert.equal(slides[1].blocks[4].type, "output");
});

test("classifies sections using heading and content signals", () => {
  const [section] = parseMarkdownDocument(`## Request Lifecycle
Client -> API -> Service -> Database
`);

  const classification = classifySection(section);
  assert.equal(classification.type, "flow");
  assert.ok(classification.reasons.some((reason) => reason.includes("arrow-flow")));
});

test("analyzes educational content without manual scene JSON", () => {
  const analysis = analyzeContent(
    `# Day 25: SLF4J vs Logback

SLF4J is a facade. Logback is an implementation.

## Architecture
Controller -> Service -> Repository -> Database

## Code Example
\`\`\`java
logger.info("Order created {}", id);
\`\`\`

## Best Practices
- Use parameterized logs
- Keep logs searchable

## Interview Questions
- Why use a logging facade?
`,
    "content/day-25.md"
  );

  assert.equal(analysis.dayNumber, 25);
  assert.equal(analysis.topicName, "SLF4J vs Logback");
  assert.equal(analysis.codeSnippets[0].language, "java");
  assert.ok(analysis.flows[0].nodes.includes("Controller"));
  assert.ok(analysis.checklists.bestPractices.includes("Use parameterized logs"));
  assert.ok(analysis.checklists.interviewQuestions.includes("Why use a logging facade?"));
});

test("plans visible generic scenes for unknown headings", () => {
  const analysis = analyzeContent(
    `# Cache Warmup Strategy

## Slide 1

# Production Story

Warm hot keys during deploys so the first user request does not pay the cold-cache penalty.

## Slide 2

# Strange But Useful Rule

- Warm only stable keys
- Keep the warmup idempotent
`,
    "content/cache.md"
  );

  const scenes = planScenes(analysis, config);
  const generic = scenes.find((scene) => scene.title === "Strange But Useful Rule");

  assert.ok(generic);
  assert.equal(generic.type, "generic");
  assert.ok(generic.content.bullets.length > 0);
  assert.ok(scenes.every((scene) => scene.title && scene.content));
  assert.equal(scenes.length, analysis.slides.length);
});

test("preserves slide-locked lists and attaches output blocks to code scenes", () => {
  const analysis = analyzeContent(
    `# Switch Notes

## Slide 1

# Best Practices

- Use switch for fixed values
- Add break
- Add default
- Keep cases tiny
- Avoid duplicates
- Prefer enum constants

## Slide 2

# Java Example

\`\`\`java
System.out.println("Wednesday");
\`\`\`

Output:

\`\`\`text
Wednesday
\`\`\`
`,
    "content/day-11.md"
  );

  const scenes = planScenes(analysis, config);
  const checklistScene = scenes.find((scene) => scene.title === "Best Practices");
  const codeScene = scenes.find((scene) => scene.type === "code" && scene.content.code);

  assert.equal(scenes.length, 2);
  assert.ok(checklistScene);
  assert.equal(checklistScene.title, "Best Practices");
  assert.equal(checklistScene.content.bullets.length, 6);
  assert.equal(codeScene.content.outputs[0].text, "Wednesday");
  assert.notEqual(scenes.at(-1).type, "cta");
  assert.ok(scenes.every((scene) => scene.metadata.strictContentMode));
  assert.ok(scenes.every((scene) => scene.metadata.sourceKeys.length === 1));
});

test("plans day 12 as a slide-locked strict-content reel", () => {
  const raw = readFileSync(new URL("../content/day-12.md", import.meta.url), "utf8");
  const analysis = analyzeContent(raw, "content/day-12.md");
  const scenes = planScenes(analysis, config);

  assert.equal(scenes.length, analysis.slides.length);
  assert.deepEqual(
    scenes.map((scene) => scene.title),
    [
      "Loops in Java",
      "Learning Journey Recap",
      "Why Do We Need Loops?",
      "What Is A Loop?",
      "Loop Execution Flow",
      "The For Loop",
      "Understanding The For Loop",
      "The While Loop",
      "The Do While Loop",
      "Real World Example",
      "Common Beginner Mistakes",
      "Key Takeaways"
    ]
  );
  assert.equal(scenes[0].title, "Loops in Java");
  assert.equal(scenes[0].content.paragraphs[0], "Make Java repeat tasks automatically.");
  assert.equal(scenes[1].content.blocks.length, 2);
  assert.equal(scenes[5].content.codes.length, 2);
  assert.equal(scenes[10].content.bullets.length, 3);
  assert.ok(scenes.every((scene) => scene.type !== "cta"));
  assert.ok(scenes.every((scene) => scene.duration >= 2 && scene.duration <= 12));
  assert.ok(scenes.every((scene) => scene.metadata.sourceKeys.length === 1));
  assert.ok(scenes.reduce((total, scene) => total + scene.duration, 0) >= 30);
  assert.ok(scenes.reduce((total, scene) => total + scene.duration, 0) <= 90);
});
