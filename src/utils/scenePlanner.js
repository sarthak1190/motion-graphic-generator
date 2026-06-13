import { compactWhitespace, uniqueByText } from "./text.js";
import { classifySection, hasFlowSignal } from "./sceneClassifier.js";

const baseDurations = {
  hero: 3,
  code: 4.5,
  flow: 4.5,
  comparison: 5,
  cta: 3.6,
  generic: 3.4
};

const priorities = {
  hero: 100,
  code: 92,
  flow: 90,
  comparison: 88,
  cta: 70,
  generic: 80
};

export function planScenes(analysis, config) {
  const slideSections = collectSlideSections(analysis);
  const scenes = slideSections.map((sectionItem, index) =>
    buildSlideLockedScene(sectionItem, index, analysis, config, slideSections.length)
  );

  // Fallback CTA Scene Auto-generation
  const hasCta = scenes.some((s) => s.type === "cta");
  if (!hasCta) {
    scenes.push(buildSyntheticCtaScene(analysis, config));
  }

  // Ensure metadata slide counts and indices match the planned output
  const finalCount = scenes.length;
  for (let index = 0; index < finalCount; index += 1) {
    const s = scenes[index];
    if (s.metadata) {
      s.metadata.markdownSlideCount = finalCount;
      s.metadata.slideIndex = index + 1;
      s.metadata.slideNumber = index + 1;
    }
  }

  const timedScenes = fitDurationsToBudget(scenes, config);

  return timedScenes.map((planned, index) => ({
    ...planned,
    id: `clip-${String(index + 1).padStart(2, "0")}`,
    index: index + 1,
    total: timedScenes.length,
    dayNumber: analysis.dayNumber,
    topicName: analysis.topicName
  }));
}

function buildSyntheticCtaScene(analysis, config) {
  const brandHandle = config.brand?.handle || "@java_learning_hub_";
  const bullets = [
    "Save this post for revision ☕",
    `Follow ${brandHandle}`,
    "Like & share this post! ❤️",
    "Learn Java daily 🚀"
  ];
  
  const content = {
    blocks: [
      {
        type: "bulletList",
        items: bullets,
        label: ""
      }
    ],
    paragraphs: [],
    bullets: bullets,
    numbered: [],
    quotes: [],
    nodes: [],
    codes: [],
    code: null,
    outputs: [],
    comparison: null,
    cta: []
  };

  const title = "Today's Topic Complete";

  return scene(
    "cta",
    priorities.cta || 70,
    title,
    "",
    content,
    5.0,
    null,
    {
      strictContentMode: true,
      slideIndex: null
    }
  );
}

export function hasVisibleContent(scene) {
  if (!scene?.title?.trim()) return false;
  const content = scene.content ?? {};

  return (
    [content.paragraphs, content.bullets, content.numbered, content.nodes, content.cta, content.badges, content.quotes].some(
      hasTextArray
    ) ||
    [content.kicker, content.subtitle, content.brandHandle].some(hasTextValue) ||
    hasSectionGroups(content.sections) ||
    hasCode(content.code) ||
    hasCodes(content.codes) ||
    hasComparison(content.comparison) ||
    hasOutput(content.outputs) ||
    hasRenderableBlocks(content.blocks)
  );
}

function collectSlideSections(analysis) {
  const slides = analysis.slides ?? [];

  if (!slides.length) {
    throw new Error('No markdown slides found. Add H2 headings (## Heading) to define scenes.');
  }

  return slides;
}

function buildSlideLockedScene(sectionItem, index, analysis, config, markdownSlideCount) {
  const normalized = normalizeBlocks(sectionItem.blocks ?? []);
  const title = compactWhitespace(sectionItem.title || firstTextFromBlocks(normalized) || "Untitled");
  const bodyBlocks = normalized;
  const groupedBlocks = groupParagraphRuns(mergeHeadingLabels(bodyBlocks));
  const visibleBlocks = selectVisibleBlocks(groupedBlocks, config);
  const type = inferSceneType(visibleBlocks, sectionItem, index);
  const content = contentFromBlocks(visibleBlocks);

  // Brand handle is rendered via footer only, never injected into scene content

  return scene(
    type,
    priorities[type] ?? priorities.generic,
    title,
    "",
    content,
    durationFor(type, content, config),
    sectionItem,
    {
      strictContentMode: true,
      markdownSlideCount,
      slideTitle: title,
      originalBlockCount: groupedBlocks.length,
      visibleBlockCount: visibleBlocks.length,
      hiddenBlockCount: Math.max(0, groupedBlocks.length - visibleBlocks.length),
      codeBlockCount: content.codes.length,
      slideIndex: index + 1
    }
  );
}

function inferSceneType(blocks, sectionItem, index) {
  if (index === 0) return "hero";
  if (isCtaSlide(sectionItem, blocks)) return "cta";
  if (blocks.some((block) => block.type === "table")) return "comparison";
  if (blocks.some((block) => block.type === "flow")) return "flow";
  if (blocks.some((block) => block.type === "code")) return "code";
  return "generic";
}

function isCtaSlide(sectionItem, _blocks) {
  const classification = classifySection(sectionItem);
  return classification.type === "cta";
}

function normalizeBlocks(blocks) {
  return blocks
    .map((block) => {
      if (block.type === "heading") {
        return {
          type: "heading",
          level: block.level ?? 3,
          text: block.text
        };
      }

      if (block.type === "code" && hasFlowSignal(block.text)) {
        return {
          type: "flow",
          text: block.text,
          language: block.language,
          items: block.text
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
        };
      }

      if (block.type === "code") {
        return {
          type: "code",
          language: block.language || "text",
          text: block.text
        };
      }

      if (block.type === "output") {
        return {
          type: "output",
          language: block.language || "text",
          text: block.text
        };
      }

      if (block.type === "bulletList" || block.type === "numberedList") {
        return {
          type: block.type,
          items: [...block.items]
        };
      }

      if (block.type === "table") {
        return {
          type: "table",
          headers: [...block.headers],
          rows: block.rows.map((row) => [...row])
        };
      }

      return {
        type: block.type,
        text: block.text
      };
    })
    .filter(isRenderableBlock);
}

function mergeHeadingLabels(blocks) {
  const merged = [];
  let pendingLabel = "";

  for (const block of blocks) {
    if (block.type === "heading") {
      pendingLabel = block.text;
      continue;
    }

    if (pendingLabel) {
      merged.push({ ...block, label: pendingLabel });
      pendingLabel = "";
      continue;
    }

    merged.push(block);
  }

  if (pendingLabel) merged.push({ type: "paragraph", text: pendingLabel });
  return merged;
}

function groupParagraphRuns(blocks) {
  const grouped = [];
  let run = [];

  const flushRun = () => {
    if (!run.length) return;

    if (run.length >= 3 && run.every((block) => compactWhitespace(block.text).length <= 90)) {
      grouped.push({
        type: "paragraphGroup",
        label: run[0].label ?? "",
        items: run.map((block) => block.text)
      });
    } else {
      grouped.push(...run);
    }

    run = [];
  };

  for (const block of blocks) {
    if (block.type === "paragraph") {
      if (block.label && run.length && run[0].label !== block.label) flushRun();
      if (!block.label && run.length && run[0].label && run.length === 1) {
        run.push(block);
        continue;
      }
      run.push(block);
      continue;
    }

    flushRun();
    grouped.push(block);
  }

  flushRun();
  return grouped;
}

function selectVisibleBlocks(blocks, config) {
  const maxBlocks = config.output?.maxVisibleBlocksPerScene ?? 5;
  if (blocks.length <= maxBlocks) return blocks;

  const selected = new Set();

  for (let index = 0; index < blocks.length && selected.size < Math.min(2, maxBlocks); index += 1) {
    selected.add(index);
  }

  blocks
    .map((block, index) => ({ block, index, score: blockPriority(block) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .forEach(({ index }) => {
      if (selected.size < maxBlocks) selected.add(index);
    });

  return [...selected]
    .sort((a, b) => a - b)
    .map((index) => blocks[index]);
}

function blockPriority(block) {
  const prioritiesByType = {
    code: 100,
    output: 96,
    flow: 94,
    table: 92,
    bulletList: 84,
    numberedList: 84,
    paragraphGroup: 82,
    blockquote: 72,
    paragraph: 70
  };

  return (prioritiesByType[block.type] ?? 50) + (block.items?.length ?? 0) * 0.2;
}

function contentFromBlocks(blocks) {
  const codes = blocks
    .filter((block) => block.type === "code")
    .map((block, index) => ({
      language: block.language || "text",
      code: block.text,
      fullCode: block.text,
      lines: block.text.split("\n").filter(Boolean).length,
      totalLines: block.text.split("\n").filter(Boolean).length,
      title: block.label ?? "",
      blockIndex: index + 1
    }));
  const outputs = blocks
    .filter((block) => block.type === "output")
    .map((block) => ({
      language: block.language || "text",
      text: block.text,
      title: block.label ?? ""
    }));
  const comparisonBlocks = blocks.filter((block) => block.type === "table");
  const flowItems = blocks.filter((block) => block.type === "flow").flatMap((block) => block.items);

  return {
    blocks,
    paragraphs: blocks.filter((block) => block.type === "paragraph").map((block) => block.text),
    bullets: blocks.filter((block) => block.type === "bulletList").flatMap((block) => block.items),
    numbered: blocks.filter((block) => block.type === "numberedList").flatMap((block) => block.items),
    quotes: blocks.filter((block) => block.type === "blockquote").map((block) => block.text),
    nodes: flowItems,
    codes,
    code: codes[0] ?? null,
    outputs,
    comparison: comparisonBlocks[0]
      ? {
          headers: comparisonBlocks[0].headers,
          rows: comparisonBlocks[0].rows,
          title: comparisonBlocks[0].label ?? ""
        }
      : null,
    cta: []
  };
}

function durationFor(type, content, config) {
  const blocks = content.blocks ?? [];
  const wordCount = countWords(blocksToText(blocks));
  const hasCode = blocks.some((block) => block.type === "code");
  const hasFlow = blocks.some((block) => block.type === "flow");
  const hasTable = blocks.some((block) => block.type === "table");
  const hasOutput = blocks.some((block) => block.type === "output");
  const bulletCount = blocks
    .filter((block) => block.type === "bulletList" || block.type === "numberedList" || block.type === "paragraphGroup")
    .reduce((total, block) => total + (block.items?.length ?? 0), 0);

  // Content-based dynamic timing:
  //   heading only:           1.2 sec base
  //   short explanation:     +1.0 sec (if wordCount > 0)
  //   code block:            +1.2 sec
  //   flowchart/diagram:     +1.0 sec
  //   table:                 +1.0 sec
  //   output/example:        +1.0 sec
  //   per bullet item:       +0.3 sec
  // Total clamped to config limits or 2.0-5.0 seconds

  let duration = 1.2;

  if (wordCount > 0) duration += 1.0;
  if (hasCode) duration += 1.2;
  if (hasFlow) duration += 1.0;
  if (hasTable) duration += 1.0;
  if (hasOutput) duration += 1.0;
  duration += bulletCount * 0.3;

  const min = config?.output?.minSceneSeconds ?? 2.0;
  const max = config?.output?.maxSceneSeconds ?? 5.0;

  return Number(clamp(duration, min, max).toFixed(2));
}

function fitDurationsToBudget(scenes, config) {
  const minTotal = config.output?.minTotalSeconds ?? 30;
  const maxTotal = config.output?.maxTotalSeconds ?? 90;
  const minScene = config.output?.minSceneSeconds ?? 2;
  const maxScene = config.output?.maxSceneSeconds ?? 12;

  const timed = scenes.map((sceneItem, index) => {
    let minD = minScene;
    let maxD = maxScene;
    if (index === scenes.length - 1 && sceneItem.type === "cta") {
      minD = 4.0;
      maxD = 6.0;
    }
    return {
      ...sceneItem,
      duration: Number(
        clamp(sceneItem.duration, minD, maxD).toFixed(2)
      )
    };
  });
  const total = totalDuration(timed);

  if (total >= minTotal && total <= maxTotal) return timed;

  const target = clamp(total, minTotal, maxTotal);
  const scale = total > 0 ? target / total : 1;
  const scaled = timed.map((sceneItem, index) => {
    let minD = minScene;
    let maxD = maxScene;
    if (index === timed.length - 1 && sceneItem.type === "cta") {
      minD = 4.0;
      maxD = 6.0;
    }
    return {
      ...sceneItem,
      duration: Number(clamp(sceneItem.duration * scale, minD, maxD).toFixed(2))
    };
  });

  const scaledTotal = totalDuration(scaled);
  if (scaledTotal >= minTotal || scaled.length === 0) return scaled;

  const deficit = minTotal - scaledTotal;
  const addPerScene = deficit / scaled.length;
  return scaled.map((sceneItem, index) => {
    let minD = minScene;
    let maxD = maxScene;
    if (index === scaled.length - 1 && sceneItem.type === "cta") {
      minD = 4.0;
      maxD = 6.0;
    }
    return {
      ...sceneItem,
      duration: Number(clamp(sceneItem.duration + addPerScene, minD, maxD).toFixed(2))
    };
  });
}

function scene(type, priority, title, subtitle, content, duration, sectionItem, extra = {}) {
  const cleanedContent = cleanContent(content);
  const sourceHeading = sectionItem?.slideLabel || sectionItem?.title || title;

  return {
    type,
    priority,
    title: compactWhitespace(title || sourceHeading || type),
    subtitle: compactWhitespace(subtitle || ""),
    content: cleanedContent,
    duration,
    metadata: {
      sourceHeading,
      sourceHeadings: [sourceHeading],
      sourceKeys: [sectionKey(sectionItem)],
      sourceLevel: sectionItem?.level ?? 0,
      parentHeading: sectionItem?.parentTitle ?? "",
      sourceText: sectionItem?.body ?? sectionItem?.title ?? "",
      strictContentMode: extra.strictContentMode === true,
      slideIndex: extra.slideIndex ?? sectionItem?.slideNumber ?? null,
      slideNumber: sectionItem?.slideNumber ?? extra.slideIndex ?? null,
      markdownSlideCount: extra.markdownSlideCount ?? null,
      slideTitle: extra.slideTitle ?? title,
      originalBlockCount: extra.originalBlockCount ?? cleanedContent.blocks?.length ?? 0,
      visibleBlockCount: extra.visibleBlockCount ?? cleanedContent.blocks?.length ?? 0,
      hiddenBlockCount: extra.hiddenBlockCount ?? 0,
      classifier: null,
      animationTemplate: animationTemplateFor(type),
      cardCount: countCards(cleanedContent),
      codeBlockCount: extra.codeBlockCount ?? cleanedContent.codes?.length ?? 0,
      estimatedHeight: null,
      validationStatus: "pending"
    }
  };
}

function animationTemplateFor(type) {
  const templates = {
    hero: "heroZoomFade",
    flow: "flowSequential",
    comparison: "comparisonSlide",
    code: "codeTypewriter",
    cta: "ctaCardReveal",
    generic: "premiumCardReveal"
  };
  return templates[type] ?? templates.generic;
}

function cleanContent(content) {
  return {
    ...content,
    paragraphs: cleanArray(content.paragraphs),
    bullets: cleanArray(content.bullets),
    numbered: cleanArray(content.numbered),
    nodes: cleanArray(content.nodes),
    cta: cleanArray(content.cta),
    badges: cleanArray(content.badges),
    quotes: cleanArray(content.quotes),
    sections: cleanSections(content.sections),
    nextTopic: "",
    brandHandle: compactWhitespace(content.brandHandle ?? ""),
    dayComplete: "",
    blocks: cleanBlocks(content.blocks),
    codes: Array.isArray(content.codes) ? content.codes.filter((code) => code?.code?.trim()) : [],
    code: content.code?.code?.trim() ? content.code : null,
    outputs: Array.isArray(content.outputs) ? content.outputs.filter((output) => output?.text?.trim()) : [],
    comparison: content.comparison?.rows?.length ? content.comparison : null
  };
}

function cleanBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];
  return blocks.filter(isRenderableBlock).map((block) => ({
    ...block,
    label: compactWhitespace(block.label ?? "")
  }));
}

function cleanSections(sections) {
  if (!Array.isArray(sections)) return [];
  return sections
    .map((group) => ({
      label: compactWhitespace(group.label ?? ""),
      accent: group.accent ?? "primary",
      items: cleanArray(group.items)
    }))
    .filter((group) => group.label && group.items.length);
}

function cleanArray(value) {
  if (!Array.isArray(value)) return [];
  return uniqueByText(value.map((item) => compactWhitespace(item)).filter(Boolean), 120);
}

function isRenderableBlock(block) {
  if (!block) return false;
  if (block.type === "bulletList" || block.type === "numberedList" || block.type === "flow" || block.type === "paragraphGroup") {
    return block.items?.some((item) => String(item ?? "").trim());
  }
  if (block.type === "table") return block.headers?.length && block.rows?.length;
  return Boolean(block.text?.trim());
}

function firstTextFromBlocks(blocks) {
  for (const block of blocks) {
    if (block.type === "heading" || block.type === "paragraph" || block.type === "blockquote") return block.text;
    if (block.type === "bulletList" || block.type === "numberedList" || block.type === "paragraphGroup") return block.items?.[0];
    if (block.type === "code" || block.type === "output" || block.type === "flow") return block.text;
    if (block.type === "table") return block.headers?.[0];
  }
  return "";
}

function blocksToText(blocks) {
  return compactWhitespace(
    blocks
      .flatMap((block) => {
        const label = block.label ? [block.label] : [];
        if (block.type === "paragraph" || block.type === "blockquote" || block.type === "code" || block.type === "output" || block.type === "flow") {
          return [...label, block.text ?? ""];
        }
        if (block.type === "bulletList" || block.type === "numberedList" || block.type === "paragraphGroup") return [...label, ...(block.items ?? [])];
        if (block.type === "table") return [...label, block.headers ?? [], block.rows ?? []].flat(2);
        return label;
      })
      .flat()
      .join(" ")
  );
}

function totalDuration(scenes) {
  return Number(scenes.reduce((total, sceneItem) => total + (sceneItem.duration ?? 0), 0).toFixed(2));
}

function countCards(content = {}) {
  const comparisonRows = content.comparison?.rows?.length ? 1 : 0;
  const sectionItems = (content.sections ?? []).reduce((total, group) => total + group.items.length, 0);
  const blockCards = Array.isArray(content.blocks) ? content.blocks.length : 0;

  return (
    blockCards ||
    (content.paragraphs?.length ?? 0) +
      (content.bullets?.length ?? 0) +
      (content.numbered?.length ?? 0) +
      (content.quotes?.length ?? 0) +
      (content.nodes?.length ? 1 : 0) +
      (content.cta?.length ?? 0) +
      sectionItems +
      comparisonRows +
      (content.codes?.length ?? 0) +
      (content.outputs?.length ?? 0)
  );
}

function countWords(value) {
  return compactWhitespace(value).split(/\s+/).filter(Boolean).length;
}

function hasTextArray(value) {
  return Array.isArray(value) && value.some((item) => String(item ?? "").trim().length > 0);
}

function hasTextValue(value) {
  return Boolean(String(value ?? "").trim());
}

function hasSectionGroups(value) {
  return Array.isArray(value) && value.some((group) => group?.items?.some((item) => String(item ?? "").trim()));
}

function hasCode(value) {
  return Boolean(value?.code?.trim());
}

function hasCodes(value) {
  return Array.isArray(value) && value.some((code) => code?.code?.trim());
}

function hasComparison(value) {
  if (!value) return false;
  if (Array.isArray(value.rows) && value.rows.some((row) => row.some((cell) => String(cell ?? "").trim()))) return true;
  return Array.isArray(value.points) && value.points.some((point) => String(point ?? "").trim());
}

function hasOutput(value) {
  return Array.isArray(value) && value.some((output) => output?.text?.trim());
}

function hasRenderableBlocks(value) {
  return Array.isArray(value) && value.some(isRenderableBlock);
}

function sectionKey(sectionItem) {
  if (!sectionItem) return "";
  return `${sectionItem.slideNumber ?? ""}:${sectionItem.slideLabel ?? sectionItem.title ?? ""}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
