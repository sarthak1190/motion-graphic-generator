import { compactWhitespace, scoreKeyword, stripMarkdown } from "./text.js";

export const sceneTypes = [
  "hook",
  "hero",
  "recap",
  "definition",
  "problem",
  "concept",
  "flow",
  "architecture",
  "comparison",
  "syntax",
  "code",
  "example",
  "output",
  "checklist",
  "mistakes",
  "interview",
  "takeaway",
  "engage",
  "cta",
  "generic"
];

const keywordMap = {
  hook: ["hook", "scroll stopper", "attention", "did you know", "most developers", "stop doing"],
  recap: ["recap", "previously covered", "before this", "journey", "review", "earlier", "last time"],
  definition: ["definition", "what is", "meaning", "means", "refers to", "introduced as"],
  problem: ["why", "problem", "need", "exists", "pain", "challenge", "motivation", "limitation"],
  concept: ["concept", "mental model", "idea", "principle", "core", "foundation", "how it works"],
  flow: ["flow", "lifecycle", "pipeline", "sequence", "steps", "process", "path"],
  architecture: ["architecture", "request flow", "system design", "component", "components", "layer", "layers"],
  comparison: [" vs ", " versus ", "compare", "comparison", "difference", "pros", "cons", "tradeoff"],
  syntax: ["syntax", "structure", "format", "pattern", "grammar", "shape"],
  example: ["example", "demo", "real world", "real-world", "use case", "scenario", "sample"],
  output: ["output", "result", "console", "stdout", "prints"],
  checklist: ["best practice", "best practices", "recommendation", "recommendations", "rules", "checklist", "guideline"],
  mistakes: ["mistake", "mistakes", "avoid", "pitfall", "pitfalls", "error", "errors", "wrong", "anti pattern", "anti-pattern"],
  interview: ["interview", "question", "questions", "quiz", "asked"],
  takeaway: ["takeaway", "takeaways", "summary", "conclusion", "remember", "key points", "tldr", "tl;dr"],
  cta: ["cta", "call to action", "next step", "follow", "save this"]
};

const priorityOrder = [
  "hook",
  "recap",
  "takeaway",
  "interview",
  "mistakes",
  "checklist",
  "comparison",
  "architecture",
  "flow",
  "syntax",
  "example",
  "definition",
  "problem",
  "concept",
  "output",
  "code",
  "generic"
];

export function classifySection(section) {
  const heading = compactWhitespace(section?.title ?? "");
  const headingText = ` ${heading.toLowerCase()} `;
  const body = sectionToText(section);
  const bodyText = ` ${body.toLowerCase()} `;
  const blocks = section?.blocks ?? [];
  const scores = new Map();
  const reasons = [];

  for (const type of Object.keys(keywordMap)) {
    const headingScore = scoreKeyword(headingText, keywordMap[type]) * 4;
    const bodyScore = scoreKeyword(bodyText, keywordMap[type]);
    const score = headingScore + bodyScore;
    if (score > 0) {
      scores.set(type, score);
      reasons.push(`${type}:${score}`);
    }
  }

  if (blocks.some((block) => block.type === "table")) bump(scores, "comparison", 5, reasons, "table");
  if (blocks.some((block) => block.type === "output")) bump(scores, "output", 4, reasons, "output-block");
  if (blocks.some((block) => block.type === "code")) bump(scores, "code", 3, reasons, "code-block");
  if (hasFlowSignal(body)) bump(scores, headingText.includes("architecture") ? "architecture" : "flow", 5, reasons, "arrow-flow");
  if (hasQuestionList(blocks)) bump(scores, "interview", 5, reasons, "question-list");
  if (hasDefinitionShape(body)) bump(scores, "definition", 3, reasons, "definition-shape");
  if (hasComparisonShape(headingText, bodyText)) bump(scores, "comparison", 3, reasons, "comparison-shape");

  const codeBlocks = blocks.filter((block) => block.type === "code");
  if (codeBlocks.length) {
    if (scores.get("syntax") > 0) bump(scores, "syntax", 4, reasons, "syntax-code");
    if (scores.get("example") > 0) bump(scores, "example", 4, reasons, "example-code");
  }

  const type =
    priorityOrder
      .map((candidate) => ({ type: candidate, score: scores.get(candidate) ?? 0 }))
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score || priorityOrder.indexOf(a.type) - priorityOrder.indexOf(b.type))[0]?.type ??
    "generic";

  return {
    type,
    score: scores.get(type) ?? 0,
    reasons: reasons.length ? reasons : ["fallback:generic"]
  };
}

export function sectionToText(section) {
  return compactWhitespace(
    (section?.blocks ?? [])
      .map((block) => {
        if (block.type === "paragraph" || block.type === "blockquote") return block.text;
        if (block.type === "heading") return block.text;
        if (block.type === "bulletList" || block.type === "numberedList") return block.items.join(" ");
        if (block.type === "code" || block.type === "output") return block.text;
        if (block.type === "table") return [block.headers, ...block.rows].flat().join(" ");
        return "";
      })
      .join(" ")
  );
}

export function hasFlowSignal(value) {
  return /(?:->|=>|→|↓|➡|-->|⇢)/.test(String(value ?? ""));
}

export function extractFlowNodes(value) {
  return String(value ?? "")
    .split(/\s*(?:->|=>|→|↓|➡|-->|⇢)\s*/g)
    .map((node) =>
      compactWhitespace(
        stripMarkdown(node)
          .replace(/^\d+[.)]\s+/, "")
          .replace(/^[-*+]\s+/, "")
      )
    )
    .filter((node) => node.length >= 2 && node.length <= 54)
    .filter((node) => !/^(and|then|next|concept flow|flow)$/i.test(node));
}

function bump(scores, type, amount, reasons, reason) {
  scores.set(type, (scores.get(type) ?? 0) + amount);
  reasons.push(`${type}+${amount}:${reason}`);
}

function hasQuestionList(blocks) {
  return blocks
    .filter((block) => block.type === "bulletList" || block.type === "numberedList")
    .flatMap((block) => block.items)
    .some((item) => /\?\s*$/.test(item));
}

function hasDefinitionShape(body) {
  return /(^|\s)[A-Z][A-Za-z0-9 +/#.-]{2,50}\s+(is|are|means|refers to)\s+/m.test(body);
}

function hasComparisonShape(headingText, bodyText) {
  return /\bvs\.?\b|\bversus\b|\bcompare\b|\bcomparison\b|\bdifference\b/.test(`${headingText} ${bodyText}`);
}
