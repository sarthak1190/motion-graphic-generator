import { compactWhitespace } from "./text.js";
import { hasVisibleContent } from "./scenePlanner.js";

const maxContentHeight = 1720;
const forbiddenGeneratedText = [
  "Start with the mental model",
  "Key line highlighted for fast mobile scanning",
  "Follow the sequence from input to outcome",
  "Let's understand this visually",
  "Here's what happens internally",
  "Think about it this way",
  "Learning journey recap",
  "Previously we learned",
  "The pain it removes from real code",
  "Keep the shape simple and predictable",
  "Trace the matching case and its output",
  "Save it, share it, and follow for the next concept",
  "Use the pattern cleanly and avoid the traps",
  "Save the durable points before you practice",
  "Benefits",
  "Mental Model",
  "Pro Tip",
  "Developer Tip",
  "Quick Revision",
  "Roadmap",
  "Save This Post",
  "Follow For More",
  "Share With A Friend",
  "Learn Java Daily"
];

export function validateScenes(scenes, config, logger) {
  const errors = [];
  const seen = new Set();
  const annotatedScenes = [];

  scenes.forEach((scene, index) => {
    const duplicateKey = sceneKey(scene);
    const sceneErrors = validateScene(scene, config, { duplicate: seen.has(duplicateKey) });
    seen.add(duplicateKey);

    const estimatedHeight = estimateSceneHeight(scene);
    const validationStatus = sceneErrors.length ? "invalid" : "valid";
    const annotated = {
      ...scene,
      metadata: {
        ...(scene.metadata ?? {}),
        estimatedHeight,
        estimatedFinalHoldSeconds: estimateFinalHoldSeconds(scene),
        minimumFinalTextOpacity: minimumFinalTextOpacity(scene),
        validationStatus,
        validationReasons: sceneErrors
      }
    };

    annotatedScenes.push(annotated);

    for (const reason of sceneErrors) {
      const message = `Scene ${index + 1} (${scene.title || "Untitled"}) failed validation: ${reason}`;
      errors.push(message);
      logger?.warn(message);
    }
  });

  const reelErrors = validateReel(annotatedScenes, config);
  for (const reason of reelErrors) {
    const message = `Reel failed validation: ${reason}`;
    errors.push(message);
    logger?.warn(message);
  }

  if (errors.length) {
    throw new Error(`Scene validation failed:\n${errors.join("\n")}`);
  }

  return {
    validScenes: reindexScenes(annotatedScenes),
    errors,
    allScenes: annotatedScenes
  };
}

export function validateScene(scene, config, context = {}) {
  const errors = [];

  if (!scene?.title?.trim()) errors.push("scene.title is missing");
  if (!["hero", "cta"].includes(scene?.type) && !hasVisibleContent(scene)) errors.push("scene.content has no visible element");
  if (!["hero", "cta"].includes(scene?.type) && !hasBodyContent(scene)) errors.push("scene body is missing");
  if (hasEmptyCards(scene)) errors.push("scene contains empty cards/list items");
  if (!scene?.metadata?.strictContentMode) errors.push("strict content mode metadata is missing");
  if ((scene?.metadata?.sourceKeys ?? []).length !== 1) errors.push("slide lock failed: scene must map to exactly one markdown slide");
  if ((scene?.content?.blocks?.length ?? 0) > (config.output?.maxVisibleBlocksPerScene ?? 5)) {
    errors.push(`scene has ${scene.content.blocks.length} visible text blocks, maximum is ${config.output?.maxVisibleBlocksPerScene ?? 5}`);
  }
  if (!scene?.metadata?.animationTemplate) {
    errors.push("animation template metadata is missing");
  }
  if (!isValidDuration(scene, config)) {
    errors.push(`scene duration ${scene?.duration ?? "missing"}s is outside the configured export range`);
  }
  if (estimateFinalHoldSeconds(scene) < (config.output?.finalHoldSeconds ?? 1.5)) {
    errors.push(`estimated final hold ${estimateFinalHoldSeconds(scene).toFixed(2)}s is shorter than ${(config.output?.finalHoldSeconds ?? 1.5)}s`);
  }
  if (minimumFinalTextOpacity(scene) < (config.output?.minFinalTextOpacity ?? 0.85)) {
    errors.push(`main text final opacity ${minimumFinalTextOpacity(scene)} is below ${(config.output?.minFinalTextOpacity ?? 0.85)}`);
  }
  if (scene?.content?.code && !isReadableCode(scene.content.code)) errors.push("code block is not readable within the mobile safe area");
  if (scene?.content?.code) {
    const lines = scene.content.code.code.split("\n").filter(Boolean).length;
    if (lines > 14) {
      errors.push(`code block has ${lines} lines, which exceeds the maximum of 14 lines allowed to prevent scrolling/clipping within the 900px card limit`);
    }
    if (scene.content.code.code.includes("overflow") || scene.content.code.code.includes("scroll")) {
      errors.push("code block text must not contain inline overflow/scroll properties");
    }
  }

  if (scene?.content?.code && scene?.content?.outputs?.length > 0) {
    for (const output of scene.content.outputs) {
      const codeLines = scene.content.code.code.split("\n").map(l => l.trim().toLowerCase());
      const lastLine = codeLines[codeLines.length - 1] || "";
      const secondLastLine = codeLines.length > 1 ? codeLines[codeLines.length - 2] : "";
      
      const isMerged = (lastLine.includes("output") && lastLine.includes(output.text.toLowerCase())) ||
                       (secondLastLine.includes("output") && lastLine.includes(output.text.toLowerCase()));
      if (isMerged) {
        errors.push("output must be separated from the code card, not embedded within code block content");
      }
    }
  }

  if (scene.type !== "cta" && hasForbiddenGeneratedText(scene)) errors.push("scene contains generated helper text that is not allowed in strict content mode");
  if (scene.type !== "cta" && !sourceContains(scene, scene.title)) errors.push("scene title is not present in the markdown source");
  if (scene.type !== "cta" && hasNonSourceBodyText(scene)) errors.push("scene contains body text that is not present in the markdown source");

  const estimatedHeight = estimateSceneHeight(scene);
  if (estimatedHeight > maxContentHeight) {
    errors.push(`estimated content height ${estimatedHeight}px exceeds safe area ${maxContentHeight}px`);
  }

  if (config.canvas.width !== 1080 || config.canvas.height !== 1920) {
    errors.push(`canvas must be 1080x1920, received ${config.canvas.width}x${config.canvas.height}`);
  }

  return errors;
}

function validateReel(scenes, config) {
  const errors = [];
  const totalSeconds = scenes.reduce((total, scene) => total + (scene.duration ?? 0), 0);
  const minTotalSeconds = config.output?.minTotalSeconds ?? 15;
  const maxTotalSeconds = config.output?.maxTotalSeconds ?? 180;
  const minScenes = config.output?.minClips ?? 1;
  const maxScenes = config.output?.maxClips ?? 60;
  const markdownSlideCount = scenes[0]?.metadata?.markdownSlideCount;

  if (Number.isFinite(markdownSlideCount) && scenes.length !== markdownSlideCount) {
    errors.push(`scene count ${scenes.length} does not match markdown H2 heading count ${markdownSlideCount}`);
  }
  if (scenes.length < minScenes) errors.push(`scene count ${scenes.length} is below minClips ${minScenes}`);
  if (scenes.length > maxScenes) errors.push(`scene count ${scenes.length} exceeds maxClips ${maxScenes}`);
  if (totalSeconds < minTotalSeconds) errors.push(`total duration ${totalSeconds.toFixed(2)}s is below ${minTotalSeconds}s`);
  if (totalSeconds > maxTotalSeconds) errors.push(`total duration ${totalSeconds.toFixed(2)}s exceeds ${maxTotalSeconds}s`);

  const lastScene = scenes[scenes.length - 1];
  if (!lastScene || lastScene.type !== "cta") {
    errors.push("the final scene must be a CTA scene");
  }
  if (lastScene && lastScene.type === "cta" && (lastScene.duration ?? 0) < 4.0) {
    errors.push(`final CTA scene duration is ${(lastScene.duration ?? 0)}s, which is below the minimum required duration of 4.0s`);
  }

  // Check for any AI-generated text across all scenes
  const allText = collectSceneText(scenes);
  for (const forbidden of forbiddenGeneratedText) {
    const matchingScene = scenes.find((scene) => {
      if (scene.type === "cta") return false;
      const sourceText = normalizeSourceText(`${scene.metadata?.sourceHeading ?? ""}\n${scene.metadata?.sourceText ?? ""}`);
      const normalized = normalizeSourceText(forbidden);
      const sceneText = collectSceneText([scene]).join("\n");
      return sceneText.toLowerCase().includes(forbidden.toLowerCase()) && !sourceText.includes(normalized);
    });
    if (matchingScene) {
      errors.push(`AI-generated text detected: "${forbidden}" in scene "${matchingScene.title}"`);
    }
  }

  return errors;
}

export function estimateSceneHeight(scene) {
  const content = scene.content ?? {};
  const header = scene.type === "hero" ? 300 : 280;
  const footerGap = scene.type === "takeaway" || scene.type === "cta" ? 190 : 50;

  if (scene.type === "hero") return 620;
  if (content.blocks?.length) return estimateBlockSceneHeight(scene, header, footerGap);
  if (["code", "syntax", "example"].includes(scene.type) && content.code) {
    return header + estimateCodeHeight(content.code) + (content.outputs?.length ?? 0) * 110 + footerGap;
  }
  if (scene.type === "output") return header + (content.outputs?.length ?? 0) * 220 + footerGap;
  if (scene.type === "flow" || scene.type === "architecture") return header + (content.nodes?.length ?? 0) * 102 + footerGap;
  if (scene.type === "comparison") return header + estimateComparisonHeight(content.comparison) + footerGap;
  if (scene.type === "definition") {
    return header + (content.paragraphs?.length ?? 0) * 190 + (content.bullets?.length ?? 0) * 142 + (content.quotes?.length ?? 0) * 178 + footerGap;
  }
  if (["checklist", "mistakes", "interview", "takeaway", "recap"].includes(scene.type)) {
    if (content.sections?.length) {
      const maxItems = Math.max(...content.sections.map((group) => group.items.length), 1);
      return header + 78 + maxItems * 96 + footerGap;
    }
    const itemHeight = scene.type === "recap" ? 126 : 92;
    const rows = scene.type === "recap" ? Math.ceil(((content.bullets?.length ?? 0) + (content.numbered?.length ?? 0)) / 2) : (content.bullets?.length ?? 0);
    return header + rows * itemHeight + (scene.type === "takeaway" ? 180 : 70) + footerGap;
  }
  if (scene.type === "cta") return header + 360 + footerGap;

  return (
    header +
    (content.paragraphs?.length ?? 0) * 155 +
    (content.bullets?.length ?? 0) * 132 +
    (content.numbered?.length ?? 0) * 132 +
    (content.quotes?.length ?? 0) * 178 +
    footerGap
  );
}

export function sceneDebugSummary(scenes) {
  return scenes.map((scene, index) => ({
    scene: index + 1,
    type: scene.type,
    title: scene.title,
    sourceHeading: scene.metadata?.sourceHeading ?? "",
    sourceHeadings: scene.metadata?.sourceHeadings ?? [],
    contentUsed: summarizeContent(scene.content),
    duration: scene.duration ?? null,
    animationTemplate: scene.metadata?.animationTemplate ?? "",
    cardCount: scene.metadata?.cardCount ?? countCards(scene.content),
    codeBlockCount: scene.metadata?.codeBlockCount ?? (scene.content?.code ? 1 : 0),
    estimatedHeight: scene.metadata?.estimatedHeight ?? estimateSceneHeight(scene),
    estimatedFinalHoldSeconds: scene.metadata?.estimatedFinalHoldSeconds ?? estimateFinalHoldSeconds(scene),
    minimumFinalTextOpacity: scene.metadata?.minimumFinalTextOpacity ?? minimumFinalTextOpacity(scene),
    validationStatus: scene.metadata?.validationStatus ?? "pending",
    validationReasons: scene.metadata?.validationReasons ?? []
  }));
}

function reindexScenes(scenes) {
  return scenes.map((scene, index) => ({
    ...scene,
    id: `clip-${String(index + 1).padStart(2, "0")}`,
    index: index + 1,
    total: scenes.length
  }));
}

function hasBodyContent(scene) {
  const content = scene.content ?? {};
  return (
    hasTextArray(content.paragraphs) ||
    hasTextArray(content.bullets) ||
    hasTextArray(content.numbered) ||
    hasTextArray(content.nodes) ||
    hasTextArray(content.quotes) ||
    hasTextArray(content.cta) ||
    hasSectionGroups(content.sections) ||
    Boolean(content.code?.code?.trim()) ||
    Boolean(content.comparison?.rows?.length || content.comparison?.points?.length) ||
    Boolean(content.outputs?.some((output) => output?.text?.trim())) ||
    Boolean(content.blocks?.some((block) => blockHasText(block)))
  );
}

function hasEmptyCards(scene) {
  const content = scene.content ?? {};
  const arrays = [content.paragraphs, content.bullets, content.numbered, content.nodes, content.cta, content.badges, content.quotes];
  if (arrays.some((items) => Array.isArray(items) && items.some((item) => !String(item ?? "").trim()))) return true;

  const comparison = content.comparison;
  if (comparison?.headers?.some((cell) => !String(cell ?? "").trim())) return true;
  if (comparison?.rows?.some((row) => row.some((cell) => !String(cell ?? "").trim()))) return true;
  if (comparison?.points?.some((point) => !String(point ?? "").trim())) return true;
  if (content.code && !content.code.code?.trim()) return true;
  if (content.outputs?.some((output) => !output?.text?.trim())) return true;
  if (content.sections?.some((group) => !group.label?.trim() || !group.items?.length || group.items.some((item) => !String(item ?? "").trim()))) return true;
  if (content.blocks?.some((block) => !blockHasText(block))) return true;

  return false;
}

function isReadableCode(code) {
  if (!code?.code?.trim()) return false;
  if (code.code.split("\n").some((line) => line.length > 140)) return false;
  return code.code.length <= 2400;
}

function estimateBlockSceneHeight(scene, header, footerGap) {
  const blocks = scene.content.blocks ?? [];
  const blockHeight = blocks.reduce((total, block) => {
    if (block.type === "paragraph" || block.type === "blockquote") return total + 160 + (block.label ? 46 : 0);
    if (block.type === "paragraphGroup") return total + 72 + block.items.length * 56 + (block.label ? 46 : 0);
    if (block.type === "bulletList" || block.type === "numberedList") return total + 72 + block.items.length * 64 + (block.label ? 46 : 0);
    if (block.type === "flow") return total + 70 + block.items.length * (block.items.length > 7 ? 38 : 50) + (block.label ? 46 : 0);
    if (block.type === "code") return total + estimateCodeHeight({ lines: block.text.split("\n").filter(Boolean).length });
    if (block.type === "output") return total + 280; // Includes connector arrow and label spacing
    if (block.type === "table") return total + 90 + block.rows.length * 112 + (block.label ? 46 : 0);
    return total;
  }, 0);

  return header + blockHeight + footerGap;
}

function estimateCodeHeight(code) {
  const lines = code?.lines ?? 0;
  return 100 + lines * 54 + 70;
}

function estimateComparisonHeight(comparison) {
  if (comparison?.rows?.length) return 90 + Math.min(comparison.rows.length, 4) * 112;
  return Math.min(comparison?.points?.length ?? 0, 6) * 132;
}

function estimateFinalHoldSeconds(scene) {
  const duration = scene?.duration ?? 0;
  return Math.max(0, duration - estimateLastContentMotionEnd(scene));
}

function estimateLastContentMotionEnd(scene) {
  const content = scene.content ?? {};

  if (scene.type === "hero") return 1.31;
  if (scene.type === "cta") return 1.45;

  if (content.blocks?.length) {
    const cardCount = countCards(content);
    const codeCount = content.blocks.filter((block) => block.type === "code").length;
    const staggerEnd = lastStaggerEnd(cardCount, 0.55, 0.14, 0.46);
    return Math.max(staggerEnd, codeCount ? 1.85 : 0);
  }

  if (scene.type === "recap") {
    const items = (content.bullets?.length ?? 0) + (content.numbered?.length ?? 0);
    return lastStaggerEnd(items, 1.8, 0.22, 0.82);
  }

  if (scene.type === "flow" || scene.type === "architecture") {
    return lastStaggerEnd(content.nodes?.length ?? 0, 1.8, 0.3, 0.9);
  }

  if (content.sections?.length) {
    const itemCount = content.sections.reduce((total, group) => total + Math.min(group.items?.length ?? 0, 4), 0);
    return Math.max(2.1, lastStaggerEnd(itemCount, 1.8, 0.22, 0.82));
  }

  const cardCount = countCards(content);
  return lastStaggerEnd(cardCount, 1.8, 0.45, 0.82);
}

function lastStaggerEnd(count, base, step, duration) {
  if (!count) return base + duration;
  return base + Math.max(0, count - 1) * step + duration;
}

function minimumFinalTextOpacity(scene) {
  if (!scene?.title?.trim()) return 0;
  return scene.subtitle ? 0.92 : 1;
}

function sceneKey(scene) {
  return normalizeForCompare(`${scene.type}:${scene.title}:${scene.metadata?.sourceHeading ?? ""}`);
}

function collectSceneText(scenes) {
  return scenes.flatMap((scene) => {
    const content = scene.content ?? {};
    return [
      content.paragraphs ?? [],
      content.bullets ?? [],
      content.numbered ?? [],
      content.nodes ?? [],
      content.quotes ?? [],
      content.cta ?? [],
      content.comparison?.points ?? [],
      collectBlockText(content.blocks ?? [])
    ].flat();
  });
}

function collectBlockText(blocks) {
  return blocks.flatMap((block) => {
    const label = block.label ? [block.label] : [];
    if (block.type === "paragraph" || block.type === "blockquote" || block.type === "code" || block.type === "output" || block.type === "flow") {
      return [...label, block.text ?? ""];
    }
    if (block.type === "bulletList" || block.type === "numberedList" || block.type === "paragraphGroup") return [...label, ...(block.items ?? [])];
    if (block.type === "table") return [...label, block.headers ?? [], block.rows ?? []].flat(2);
    return [];
  });
}

function countCards(content = {}) {
  if (Array.isArray(content.blocks) && content.blocks.length) return content.blocks.length;

  return (
    (content.paragraphs?.length ?? 0) +
    (content.bullets?.length ?? 0) +
    (content.numbered?.length ?? 0) +
    (content.quotes?.length ?? 0) +
    (content.nodes?.length ?? 0) +
    (content.cta?.length ?? 0) +
    (content.sections ?? []).reduce((total, group) => total + (group.items?.length ?? 0), 0) +
    (content.comparison?.rows?.length ?? 0) +
    (content.comparison?.points?.length ?? 0) +
    (content.code ? 1 : 0) +
    (content.outputs?.length ?? 0)
  );
}

function hasTextArray(value) {
  return Array.isArray(value) && value.some((item) => String(item ?? "").trim().length > 0);
}

function hasSectionGroups(value) {
  return Array.isArray(value) && value.some((group) => group?.items?.some((item) => String(item ?? "").trim()));
}

function blockHasText(block) {
  if (!block) return false;
  if (block.type === "bulletList" || block.type === "numberedList" || block.type === "flow" || block.type === "paragraphGroup") {
    return block.items?.some((item) => String(item ?? "").trim());
  }
  if (block.type === "table") return block.headers?.length && block.rows?.length;
  return Boolean(block.text?.trim());
}

function summarizeContent(content = {}) {
  const used = {};
  if (content.kicker) used.kicker = content.kicker;
  if (content.subtitle) used.subtitle = content.subtitle;
  if (content.dayComplete) used.dayComplete = content.dayComplete;
  if (content.brandHandle) used.brandHandle = content.brandHandle;
  if (content.nextTopic) used.nextTopic = content.nextTopic;
  if (content.blocks?.length) used.blocks = content.blocks;
  if (content.paragraphs?.length) used.paragraphs = content.paragraphs;
  if (content.bullets?.length) used.bullets = content.bullets;
  if (content.numbered?.length) used.numbered = content.numbered;
  if (content.nodes?.length) used.nodes = content.nodes;
  if (content.sections?.length) used.sections = content.sections;
  if (content.code?.code) {
    used.code = {
      language: content.code.language,
      lines: content.code.lines,
      totalLines: content.code.totalLines,
      preview: content.code.code
    };
  }
  if (content.outputs?.length) used.outputs = content.outputs;
  if (content.cta?.length) used.cta = content.cta;
  return used;
}

function hasForbiddenGeneratedText(scene) {
  const sourceText = normalizeSourceText(`${scene.metadata?.sourceHeading ?? ""}\n${scene.metadata?.sourceText ?? ""}`);
  const text = collectSceneText([scene]).join("\n");
  return forbiddenGeneratedText.some((forbidden) => {
    const normalized = normalizeSourceText(forbidden);
    return text.toLowerCase().includes(forbidden.toLowerCase()) && !sourceText.includes(normalized);
  });
}

function hasNonSourceBodyText(scene) {
  const sourceText = normalizeSourceText(`${scene.metadata?.sourceHeading ?? ""}\n${scene.metadata?.sourceText ?? ""}`);
  if (!sourceText) return false;

  return collectBlockText(scene.content?.blocks ?? []).some((item) => {
    const normalized = normalizeSourceText(item);
    if (!normalized) return false;
    return !sourceText.includes(normalized);
  });
}

function sourceContains(scene, text) {
  const sourceText = normalizeSourceText(`${scene.metadata?.sourceHeading ?? ""}\n${scene.metadata?.sourceText ?? ""}`);
  const normalized = normalizeSourceText(text);
  return !normalized || sourceText.includes(normalized);
}

function normalizeSourceText(value) {
  return compactWhitespace(String(value ?? "").toLowerCase()).replace(/[^\w@#.+:/\s-]/g, "");
}

function normalizeForCompare(value) {
  return compactWhitespace(String(value ?? "").toLowerCase()).replace(/[^\w\s]/g, "");
}

function isValidDuration(scene, config) {
  const duration = scene?.duration;
  if (!Number.isFinite(duration)) return false;
  const min = config.output?.minSceneSeconds ?? 3;
  const max = config.output?.maxSceneSeconds ?? 8;
  return duration >= min && duration <= max;
}
