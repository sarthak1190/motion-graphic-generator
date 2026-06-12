import { compactWhitespace, normalizeText } from "./text.js";

const outputLanguages = new Set(["output", "stdout", "console", "result", "results"]);

export function parseMarkdownDocument(rawContent) {
  const lines = normalizeText(rawContent).split("\n");
  const sections = [];
  let current = createSection("Overview", 0);
  let paragraph = [];
  let list = null;
  let blockquote = [];
  let table = [];
  let code = null;
  let headingStack = [];
  let nextFenceIsOutput = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = compactWhitespace(paragraph.join(" "));
    if (text) current.blocks.push({ type: "paragraph", text: cleanInlineMarkdown(text) });
    paragraph = [];
  };

  const flushList = () => {
    if (!list?.items.length) {
      list = null;
      return;
    }
    current.blocks.push({ type: list.ordered ? "numberedList" : "bulletList", items: list.items });
    list = null;
  };

  const flushBlockquote = () => {
    if (!blockquote.length) return;
    const text = compactWhitespace(blockquote.join(" "));
    if (text) current.blocks.push({ type: "blockquote", text: cleanInlineMarkdown(text) });
    blockquote = [];
  };

  const flushTable = () => {
    if (table.length >= 3 && /^\s*\|?\s*:?-{3,}:?\s*\|/.test(table[1])) {
      const headers = splitTableRow(table[0]);
      const rows = table.slice(2).map(splitTableRow).filter((row) => row.length === headers.length);
      if (headers.length && rows.length) current.blocks.push({ type: "table", headers, rows });
    }
    table = [];
  };

  const flushTextBlocks = () => {
    flushParagraph();
    flushList();
    flushBlockquote();
    flushTable();
  };

  const pushCurrent = () => {
    flushTextBlocks();
    hydrateSection(current);
    if (current.title !== "Overview" || current.blocks.length) sections.push(current);
  };

  for (const line of lines) {
    const fence = line.match(/^```\s*([a-zA-Z0-9_+#.-]*)\s*$/);
    if (fence && !code) {
      flushTextBlocks();
      const language = normalizeLanguage(fence[1]);
      code = { language, lines: [], forceOutput: nextFenceIsOutput };
      nextFenceIsOutput = false;
      continue;
    }

    if (fence && code) {
      const text = code.lines.join("\n").trimEnd();
      if (text.trim()) {
        current.blocks.push({
          type: code.forceOutput || outputLanguages.has(code.language) ? "output" : "code",
          language: code.language,
          text
        });
      }
      code = null;
      continue;
    }

    if (code) {
      code.lines.push(line);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      pushCurrent();
      const title = compactWhitespace(cleanInlineMarkdown(heading[2]));
      const level = heading[1].length;
      headingStack = headingStack.filter((item) => item.level < level);
      const parentTitle = headingStack.at(-1)?.title ?? "";
      headingStack.push({ level, title });
      current = createSection(title, level, parentTitle);
      continue;
    }

    if (!line.trim()) {
      flushTextBlocks();
      continue;
    }

    if (/^\s*(?:output|result|console output|stdout)\s*:\s*$/i.test(line)) {
      flushTextBlocks();
      nextFenceIsOutput = true;
      continue;
    }

    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      flushList();
      flushTable();
      blockquote.push(quote[1].trim());
      continue;
    }

    const listItem = line.match(/^\s*(?:([-*+])|(\d+)[.)])\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      flushBlockquote();
      flushTable();
      const ordered = Boolean(listItem[2]);
      if (!list || list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push(compactWhitespace(cleanInlineMarkdown(listItem[3])));
      continue;
    }

    if (/^\s*\|.+\|\s*$/.test(line)) {
      flushParagraph();
      flushList();
      flushBlockquote();
      table.push(line.trim());
      continue;
    }

    flushBlockquote();
    flushTable();
    flushList();
    paragraph.push(line.trim());
  }

  if (code?.lines.length) {
    const text = code.lines.join("\n").trimEnd();
    current.blocks.push({
      type: code.forceOutput || outputLanguages.has(code.language) ? "output" : "code",
      language: code.language,
      text
    });
  }

  pushCurrent();

  if (sections.length === 1 && sections[0].body.length > 900) {
    return splitPlainTextIntoSections(sections[0].body);
  }

  return sections;
}

export function parseMarkdownSlides(rawContent) {
  const lines = normalizeText(rawContent).split("\n");
  const slides = [];
  let current = null;
  let preamble = null;
  let paragraph = [];
  let list = null;
  let blockquote = [];
  let table = [];
  let code = null;
  let nextFenceIsOutput = false;
  let h2Count = 0;

  const flushParagraph = () => {
    const target = current ?? preamble;
    if (!target || !paragraph.length) return;
    const text = compactWhitespace(paragraph.join(" "));
    if (text) target.blocks.push({ type: "paragraph", text: cleanInlineMarkdown(text) });
    paragraph = [];
  };

  const flushList = () => {
    const target = current ?? preamble;
    if (!target || !list?.items.length) {
      list = null;
      return;
    }
    target.blocks.push({ type: list.ordered ? "numberedList" : "bulletList", items: list.items });
    list = null;
  };

  const flushBlockquote = () => {
    const target = current ?? preamble;
    if (!target || !blockquote.length) return;
    const text = compactWhitespace(blockquote.join(" "));
    if (text) target.blocks.push({ type: "blockquote", text: cleanInlineMarkdown(text) });
    blockquote = [];
  };

  const flushTable = () => {
    const target = current ?? preamble;
    if (!target) {
      table = [];
      return;
    }
    if (table.length >= 3 && /^\s*\|?\s*:?-{3,}:?\s*\|/.test(table[1])) {
      const headers = splitTableRow(table[0]);
      const rows = table.slice(2).map(splitTableRow).filter((row) => row.length === headers.length);
      if (headers.length && rows.length) target.blocks.push({ type: "table", headers, rows });
    }
    table = [];
  };

  const flushTextBlocks = () => {
    flushParagraph();
    flushList();
    flushBlockquote();
    flushTable();
  };

  const pushCurrent = () => {
    if (!current) return;
    flushTextBlocks();
    hydrateSection(current);
    slides.push(current);
    current = null;
  };

  const pushPreamble = () => {
    if (!preamble) return;
    flushTextBlocks();
    hydrateSection(preamble);
    if (preamble.blocks.length || preamble.title !== "Overview") {
      slides.unshift(preamble);
    }
    preamble = null;
  };

  for (const line of lines) {
    const fence = line.match(/^```\s*([a-zA-Z0-9_+#.-]*)\s*$/);

    if (fence && !code) {
      flushTextBlocks();
      const language = normalizeLanguage(fence[1]);
      code = { language, lines: [], forceOutput: nextFenceIsOutput };
      nextFenceIsOutput = false;
      continue;
    }

    if (fence && code) {
      const text = code.lines.join("\n").trimEnd();
      const target = current ?? preamble;
      if (text.trim() && target) {
        target.blocks.push({
          type: code.forceOutput || outputLanguages.has(code.language) ? "output" : "code",
          language: code.language,
          text
        });
      }
      code = null;
      continue;
    }

    if (code) {
      code.lines.push(line);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = compactWhitespace(cleanInlineMarkdown(heading[2]));

      if (level === 1 && h2Count === 0) {
        // H1 before any H2: create preamble/hero slide
        flushTextBlocks();
        pushCurrent();
        if (!preamble) {
          preamble = createSection(text, 1);
          preamble.slideNumber = 0;
          preamble.slideLabel = text;
        }
        continue;
      }

      if (level === 1 && h2Count > 0) {
        // H1 after H2s: treat as in-slide heading, not a new preamble
        flushTextBlocks();
        const target = current ?? preamble;
        if (target) {
          target.blocks.push({ type: "heading", level: 1, text });
        }
        continue;
      }

      if (level === 2) {
        pushCurrent();
        h2Count += 1;
        current = createSection(text, 2);
        current.slideNumber = h2Count;
        current.slideLabel = text;
        continue;
      }

      // H3–H6: treat as in-slide block-level heading
      flushTextBlocks();
      const target = current ?? preamble;
      if (target) {
        if (/^(?:output|result|console output|stdout)$/i.test(text)) nextFenceIsOutput = true;
        target.blocks.push({ type: "heading", level, text });
      }
      continue;
    }

    if (/^\s*-{3,}\s*$/.test(line)) {
      flushTextBlocks();
      continue;
    }

    if (!line.trim()) {
      flushTextBlocks();
      continue;
    }

    // Lazily initialize preamble for content before any heading
    if (!current && !preamble) {
      preamble = createSection("Overview", 0);
      preamble.slideNumber = 0;
      preamble.slideLabel = "Overview";
    }

    if (/^\s*(?:output|result|console output|stdout)\s*:\s*$/i.test(line)) {
      flushTextBlocks();
      nextFenceIsOutput = true;
      const target = current ?? preamble;
      if (target) {
        target.blocks.push({ type: "heading", level: 3, text: cleanInlineMarkdown(line.replace(/:\s*$/, "")) });
      }
      continue;
    }

    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      flushList();
      flushTable();
      blockquote.push(quote[1].trim());
      continue;
    }

    const listItem = line.match(/^\s*(?:([-*+])|(\d+)[.)])\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      flushBlockquote();
      flushTable();
      const ordered = Boolean(listItem[2]);
      if (!list || list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push(compactWhitespace(cleanInlineMarkdown(listItem[3])));
      continue;
    }

    if (/^\s*\|.+\|\s*$/.test(line)) {
      flushParagraph();
      flushList();
      flushBlockquote();
      table.push(line.trim());
      continue;
    }

    flushBlockquote();
    flushTable();
    flushList();
    paragraph.push(line.trim());
  }

  if (code?.lines.length) {
    const text = code.lines.join("\n").trimEnd();
    const target = current ?? preamble;
    if (text.trim() && target) {
      target.blocks.push({
        type: code.forceOutput || outputLanguages.has(code.language) ? "output" : "code",
        language: code.language,
        text
      });
    }
  }

  pushCurrent();
  pushPreamble();

  return slides.sort((a, b) => (a.slideNumber ?? 0) - (b.slideNumber ?? 0));
}

export function flattenBlocks(sections, type) {
  return sections.flatMap((section) =>
    section.blocks
      .filter((block) => block.type === type)
      .map((block) => ({ ...block, sectionTitle: section.title, sectionLevel: section.level }))
  );
}

function createSection(title, level, parentTitle = "") {
  return {
    title,
    level,
    parentTitle,
    blocks: [],
    body: "",
    lines: []
  };
}

function hydrateSection(section) {
  const lines = [];

  for (const block of section.blocks) {
    if (block.type === "heading") lines.push(`${"#".repeat(block.level ?? 3)} ${block.text}`);
    if (block.type === "paragraph") lines.push(block.text);
    if (block.type === "blockquote") lines.push(`> ${block.text}`);
    if (block.type === "bulletList") lines.push(...block.items.map((item) => `- ${item}`));
    if (block.type === "numberedList") lines.push(...block.items.map((item, index) => `${index + 1}. ${item}`));
    if (block.type === "table") {
      lines.push(`| ${block.headers.join(" | ")} |`);
      lines.push(`| ${block.headers.map(() => "---").join(" | ")} |`);
      lines.push(...block.rows.map((row) => `| ${row.join(" | ")} |`));
    }
    if (block.type === "code") lines.push(`\`\`\`${block.language}\n${block.text}\n\`\`\``);
    if (block.type === "output") lines.push(`Output:\n${block.text}`);
  }

  section.lines = lines.filter(Boolean);
  section.body = lines.join("\n").trim();
  return section;
}

function splitPlainTextIntoSections(body) {
  return body
    .split(/\n{2,}/)
    .map((paragraph, index) => {
      const section = createSection(index === 0 ? "Overview" : `Section ${index + 1}`, 0);
      section.blocks.push({ type: "paragraph", text: cleanInlineMarkdown(paragraph.trim()) });
      return hydrateSection(section);
    })
    .filter((section) => section.body);
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => compactWhitespace(cleanInlineMarkdown(cell)));
}

function normalizeLanguage(language) {
  const normalized = String(language || "text").trim().toLowerCase();
  const aliases = {
    js: "javascript",
    shell: "bash",
    sh: "bash",
    yml: "yaml"
  };
  return aliases[normalized] ?? normalized;
}

function cleanInlineMarkdown(value) {
  return String(value ?? "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .trim();
}
