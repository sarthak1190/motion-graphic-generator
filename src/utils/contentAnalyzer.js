import path from "node:path";
import {
  compactWhitespace,
  normalizeText,
  scoreKeyword,
  splitSentences,
  stripMarkdown,
  takeWords,
  toTitleCase,
  uniqueByText
} from "./text.js";
import { flattenBlocks, parseMarkdownDocument, parseMarkdownSlides } from "./markdownParser.js";

const sectionGroups = {
  definition: ["definition", "what is", "overview", "introduction", "intro"],
  takeaways: ["takeaway", "summary", "recap", "remember", "important", "tldr", "tl;dr"],
  example: ["example", "real world", "use case", "scenario"],
  architecture: ["architecture", "flow", "pipeline", "lifecycle", "sequence", "request", "data flow"],
  bestPractices: ["best practice", "good practice", "recommendation", "rules"],
  mistakes: ["mistake", "pitfall", "anti pattern", "anti-pattern", "avoid"],
  questions: ["interview", "question", "quiz"],
  comparison: [" vs ", " versus ", "compare", "comparison", "difference", "pros", "cons"]
};

const languageAliases = {
  js: "javascript",
  shell: "bash",
  sh: "bash",
  yml: "yaml"
};

export function analyzeContent(rawContent, sourcePath = "") {
  const raw = normalizeText(rawContent);
  const filename = sourcePath ? path.basename(sourcePath) : "";
  const sections = parseMarkdownDocument(raw);
  const slides = parseMarkdownSlides(raw);
  const codeSnippets = extractCodeBlocksFromSections(sections);
  const outputBlocks = extractOutputBlocksFromSections(sections);
  const contentWithoutCode = sections
    .map((section) =>
      section.blocks
        .filter((block) => !["code", "output"].includes(block.type))
        .map(blockToText)
        .join("\n")
    )
    .join("\n\n");
  const title = detectTitle(raw, sections, filename);
  const dayNumber = detectDayNumber(raw, filename);
  const topicName = detectTopicName(title, filename);
  const subtitle = detectSubtitle(contentWithoutCode, title);
  const bulletItems = extractListItems(sections);
  const tables = flattenBlocks(sections, "table");
  const definitions = extractDefinitions(sections);
  const concepts = extractConcepts(sections, title);
  const keyTakeaways = extractSectionItems(sections, sectionGroups.takeaways, bulletItems, 8);
  const examples = extractSectionItems(sections, sectionGroups.example, [], 6);
  const flows = extractFlows(sections, contentWithoutCode);
  const comparisons = extractComparisons(sections, tables);
  const bestPractices = extractSectionItems(sections, sectionGroups.bestPractices, [], 8);
  const mistakes = extractSectionItems(sections, sectionGroups.mistakes, [], 8);
  const interviewQuestions = extractQuestions(sections, contentWithoutCode);

  return {
    sourcePath,
    filename,
    raw,
    title,
    subtitle,
    dayNumber,
    topicName,
    sections,
    slides,
    bulletItems,
    codeSnippets,
    outputBlocks,
    definitions,
    concepts,
    keyTakeaways,
    examples,
    flows,
    comparisons,
    checklists: {
      bestPractices,
      mistakes,
      interviewQuestions
    },
    stats: {
      words: stripMarkdown(contentWithoutCode).split(/\s+/).filter(Boolean).length,
      sections: sections.length,
      slides: slides.length,
      codeBlocks: codeSnippets.length,
      outputBlocks: outputBlocks.length,
      tables: tables.length
    }
  };
}

function extractCodeBlocksFromSections(sections) {
  return flattenBlocks(sections, "code").map((block, index) => {
    const language = normalizeLanguage(block.language);
    return {
      id: `code-${index + 1}`,
      language,
      code: block.text,
      lines: block.text.split("\n").length,
      title: `${toTitleCase(language)} Example`,
      sectionTitle: block.sectionTitle
    };
  });
}

function extractOutputBlocksFromSections(sections) {
  return flattenBlocks(sections, "output").map((block, index) => ({
    id: `output-${index + 1}`,
    language: block.language,
    text: block.text,
    sectionTitle: block.sectionTitle
  }));
}

function normalizeLanguage(language) {
  const normalized = String(language || "text").trim().toLowerCase();
  return languageAliases[normalized] ?? normalized;
}

function blockToText(block) {
  if (block.type === "heading") return block.text;
  if (block.type === "paragraph") return block.text;
  if (block.type === "blockquote") return block.text;
  if (block.type === "bulletList") return block.items.map((item) => `- ${item}`).join("\n");
  if (block.type === "numberedList") return block.items.map((item, index) => `${index + 1}. ${item}`).join("\n");
  if (block.type === "table") return [`| ${block.headers.join(" | ")} |`, ...block.rows.map((row) => `| ${row.join(" | ")} |`)].join("\n");
  return "";
}

function extractListItems(sections) {
  return uniqueByText(
    sections.flatMap((section) =>
      section.blocks
        .filter((block) => block.type === "bulletList" || block.type === "numberedList")
        .flatMap((block) => block.items)
    ),
    80
  );
}

function parseSections(content) {
  const lines = normalizeText(content).split("\n");
  const sections = [];
  let current = { title: "Overview", level: 0, lines: [] };

  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      pushSection(sections, current);
      current = {
        title: compactWhitespace(heading[2]),
        level: heading[1].length,
        lines: []
      };
      continue;
    }

    current.lines.push(line);
  }

  pushSection(sections, current);

  if (sections.length === 1 && sections[0].body.length > 900) {
    return splitPlainTextIntoSections(sections[0].body);
  }

  return sections;
}

function pushSection(sections, section) {
  const body = section.lines.join("\n").trim();
  if (!body && section.title === "Overview") return;
  sections.push({
    title: section.title,
    level: section.level,
    body,
    lines: section.lines.map((line) => line.trim()).filter(Boolean)
  });
}

function splitPlainTextIntoSections(body) {
  return body
    .split(/\n{2,}/)
    .map((paragraph, index) => ({
      title: index === 0 ? "Overview" : `Section ${index + 1}`,
      level: 0,
      body: paragraph.trim(),
      lines: paragraph.split("\n").map((line) => line.trim()).filter(Boolean)
    }))
    .filter((section) => section.body);
}

function detectTitle(raw, sections, filename) {
  const h1 = raw.match(/^#\s+(.+)$/m);
  if (h1) return compactWhitespace(h1[1]);

  const firstHeading = sections.find((section) => section.level > 0);
  if (firstHeading) return compactWhitespace(firstHeading.title);

  const firstLine = normalizeText(raw)
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("```"));

  if (firstLine) return takeWords(firstLine, 12);

  return toTitleCase(filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
}

function detectSubtitle(content, title) {
  const titleText = compactWhitespace(stripMarkdown(title)).toLowerCase();

  return (
    normalizeText(content)
      .split(/\n{2,}/)
      .map((paragraph) => stripMarkdown(paragraph))
      .map(compactWhitespace)
      .find((paragraph) => {
        if (!paragraph || paragraph.length < 30) return false;
        if (paragraph.toLowerCase() === titleText) return false;
        if (paragraph.startsWith(title)) return false;
        return !paragraph.includes("| ---");
      }) ?? ""
  );
}

function detectDayNumber(raw, filename) {
  const match = `${raw}\n${filename}`.match(/\bday\s*[-:#]?\s*(\d{1,4})\b/i);
  return match ? Number(match[1]) : null;
}

function detectTopicName(title, filename) {
  const cleanedTitle = compactWhitespace(title.replace(/\bday\s*[-:#]?\s*\d{1,4}\b/i, "").replace(/^[:\-|]+/, ""));
  if (cleanedTitle) return cleanedTitle;

  return toTitleCase(filename.replace(/\.[^.]+$/, "").replace(/day[-_ ]?\d+/i, "").replace(/[-_]/g, " "));
}

function extractBullets(content) {
  return normalizeText(content)
    .split("\n")
    .map((line) => line.match(/^\s*(?:[-*+]|\d+[.)])\s+(.+)$/)?.[1])
    .filter(Boolean)
    .map((line) => compactWhitespace(stripMarkdown(line)));
}

function extractMarkdownTables(content) {
  const lines = normalizeText(content).split("\n");
  const tables = [];
  let buffer = [];

  for (const line of lines) {
    if (/^\s*\|.+\|\s*$/.test(line)) {
      buffer.push(line.trim());
      continue;
    }

    pushTable(tables, buffer);
    buffer = [];
  }

  pushTable(tables, buffer);
  return tables;
}

function pushTable(tables, buffer) {
  if (buffer.length < 3) return;
  const [headerLine, dividerLine, ...rowLines] = buffer;
  if (!/^\s*\|?\s*:?-{3,}:?\s*\|/.test(dividerLine)) return;

  const headers = splitTableRow(headerLine);
  const rows = rowLines.map(splitTableRow).filter((row) => row.length === headers.length);

  if (headers.length && rows.length) {
    tables.push({ headers, rows });
  }
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => compactWhitespace(stripMarkdown(cell)));
}

function extractDefinitions(sections) {
  const candidates = [];

  for (const section of sections) {
    const textBlocks = section.blocks?.filter((block) => ["paragraph", "bulletList", "numberedList"].includes(block.type)) ?? [];
    const sectionText = textBlocks.map(blockToText).join("\n");

    if (scoreKeyword(section.title, sectionGroups.definition)) {
      candidates.push(...splitSentences(sectionText, 4));
    }

    for (const line of sectionText.split("\n").filter(Boolean)) {
      const plain = compactWhitespace(stripMarkdown(line));
      if (/^[A-Z][A-Za-z0-9 +/#.-]{2,50}\s+(is|are|means|refers to)\s+/i.test(plain)) {
        candidates.push(plain);
      }
      if (/^[A-Z][A-Za-z0-9 +/#.-]{2,50}:\s+.{12,}/.test(plain)) {
        candidates.push(plain);
      }
    }
  }

  return uniqueByText(candidates, 6);
}

function extractConcepts(sections, title) {
  const headingConcepts = sections
    .map((section) => section.title)
    .filter((heading) => !/^overview$/i.test(heading))
    .filter((heading) => !scoreKeyword(heading, [...sectionGroups.bestPractices, ...sectionGroups.mistakes, ...sectionGroups.questions]));

  const boldTerms = sections
    .flatMap((section) => [...section.body.matchAll(/\*\*([^*]+)\*\*/g)].map((match) => match[1]))
    .map(compactWhitespace);

  return uniqueByText([title, ...headingConcepts, ...boldTerms], 8).map((concept) => ({
    title: concept,
    detail: findSectionByTitle(sections, concept)?.body ? takeWords(findSectionByTitle(sections, concept).body, 22) : ""
  }));
}

function findSectionByTitle(sections, title) {
  const normalized = compactWhitespace(title).toLowerCase();
  return sections.find((section) => compactWhitespace(section.title).toLowerCase() === normalized);
}

function extractSectionItems(sections, keywords, fallbackItems = [], limit = 6) {
  const items = [];

  for (const section of sections) {
    if (!scoreKeyword(section.title, keywords)) continue;

    const sectionBullets = extractBullets(section.body);
    if (sectionBullets.length) {
      items.push(...sectionBullets);
    } else {
      items.push(...splitSentences(section.body, limit));
    }
  }

  if (!items.length && fallbackItems.length && keywords === sectionGroups.takeaways) {
    items.push(...fallbackItems);
  }

  return uniqueByText(items, limit);
}

function extractFlows(sections, content) {
  const flows = [];

  for (const section of sections) {
    if (section.blocks?.some((block) => ["code", "output"].includes(block.type))) continue;
    const titleScore = scoreKeyword(section.title, sectionGroups.architecture);
    const hasArrows = /(?:->|=>|→|↓|➡|-->|⇢)/.test(section.body);
    if (!titleScore && !hasArrows) continue;

    const nodes = extractFlowNodes(section.body);
    if (nodes.length >= 3) {
      flows.push({
        title: section.title,
        nodes: uniqueByText(nodes, 8),
        description: takeWords(section.body, 20)
      });
    }
  }

  if (!flows.length && /(?:->|=>|→|↓|➡|-->|⇢)/.test(content)) {
    const nodes = extractFlowNodes(content);
    if (nodes.length >= 3) {
      flows.push({
        title: "Architecture Flow",
        nodes: uniqueByText(nodes, 8),
        description: "Detected from arrow-based flow notation."
      });
    }
  }

  return flows.slice(0, 3);
}

function extractFlowNodes(body) {
  const lines = normalizeText(body)
    .split("\n")
    .map(cleanFlowLine)
    .filter(Boolean)
    .filter((line) => !/^\|/.test(line))
    .filter((line) => !/^[-*+]\s+/.test(line));

  const arrowJoined = lines.join(" -> ");
  const nodes = arrowJoined
    .split(/\s*(?:->|=>|→|↓|➡|-->|⇢)\s*/g)
    .map((node) => node.replace(/^\d+[.)]\s+/, ""))
    .map(compactWhitespace)
    .filter((node) => node.length >= 2 && node.length <= 48)
    .filter((node) => !/^(and|then|next)$/i.test(node));

  return nodes;
}

function cleanFlowLine(line) {
  return compactWhitespace(
    String(line ?? "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
      .replace(/[*_~#]/g, "")
  );
}

function extractComparisons(sections, tables) {
  const comparisons = [];

  for (const section of sections) {
    if (!isComparisonTitle(section.title)) continue;
    const points = extractBullets(section.body);
    if (!points.length && section.body.includes("|")) continue;
    const fallbackPoints = points.length ? points : splitSentences(section.body, 6);
    if (!fallbackPoints.length) continue;

    comparisons.push({
      title: section.title,
      points: fallbackPoints.slice(0, 6),
      description: takeWords(section.body, 24)
    });
  }

  for (const table of tables) {
    const [left = "Option A", right = "Option B"] = table.headers.slice(1);
    comparisons.push({
      title: `${left} vs ${right}`,
      headers: table.headers,
      rows: table.rows.slice(0, 5),
      description: "Detected from comparison table."
    });
  }

  return comparisons.slice(0, 3);
}

function isComparisonTitle(title) {
  const normalized = ` ${String(title ?? "").toLowerCase()} `;
  return /\bvs\.?\b|\bversus\b|\bcompare\b|\bcomparison\b|\bdifference\b|\bpros\b|\bcons\b/.test(normalized);
}

function extractQuestions(sections, content) {
  const sectionQuestions = [];

  for (const section of sections) {
    if (scoreKeyword(section.title, sectionGroups.questions)) {
      sectionQuestions.push(...extractBullets(section.body));
      sectionQuestions.push(
        ...section.lines
          .map((line) => line.replace(/^\s*(?:[-*+]|\d+[.)])\s+/, ""))
          .map((line) => compactWhitespace(stripMarkdown(line)))
          .filter((line) => line.endsWith("?"))
      );
    }
  }

  const globalQuestions = normalizeText(content)
    .split("\n")
    .map((line) => compactWhitespace(stripMarkdown(line.replace(/^\s*(?:[-*+]|\d+[.)])\s+/, ""))))
    .filter((line) => line.endsWith("?"));

  return uniqueByText([...sectionQuestions, ...globalQuestions], 8);
}
