import { renderCodeBlock } from "./codeBlock.js";
import { delay, escapeHtml, textBlock } from "./html.js";

export function renderSceneBody(scene, config) {
  if (scene.type === "hook") return renderHook(scene, config);
  if (scene.type === "hero") return renderHero(scene, config);
  if (scene.type === "engage") return renderEngage(scene, config);
  if (scene.type === "cta") return renderCta(scene, config);
  return renderSlideScene(scene);
}

export function renderBrandFooter(scene, config) {
  if (config.output?.showFooterChips === false) return "";
  if (scene.type === "hook" || scene.type === "engage" || scene.type === "hero") return "";

  const day = scene.dayNumber ? `<span>${escapeHtml(`Day ${scene.dayNumber}`)}</span>` : "";

  return `
    <footer class="brand-footer visible-element" data-visible="footer">
      <div>${day}</div>
      <strong>${escapeHtml(config.brand.handle)}</strong>
    </footer>
  `;
}

export function renderProgress(scene) {
  if (scene.type === "hook") return "";
  return `
    <div class="clip-progress" aria-hidden="true">
      <span style="--progress: ${(scene.index / scene.total) * 100}%"></span>
    </div>
    <div class="clip-count visible-element" data-visible="count">${String(scene.index).padStart(2, "0")} / ${String(scene.total).padStart(2, "0")}</div>
  `;
}

function formatHookText(text) {
  let wordIndex = 0;
  const parts = text.split(/(\*\*.*?\*\*|\s+)/);
  return parts.map(part => {
    if (!part) return "";
    if (!part.trim()) return part; // Keep whitespace as-is
    if (part.startsWith('**') && part.endsWith('**')) {
      const innerText = part.slice(2, -2);
      return innerText.split(/\s+/).filter(Boolean).map(word => {
        const html = `<span class="hook-word hook-word-accent" style="--word-index: ${wordIndex}">${escapeHtml(word)}</span>`;
        wordIndex += 1;
        return html;
      }).join(" ");
    }
    return part.split(/\s+/).filter(Boolean).map(word => {
      const html = `<span class="hook-word" style="--word-index: ${wordIndex}">${escapeHtml(word)}</span>`;
      wordIndex += 1;
      return html;
    }).join(" ");
  }).join("");
}

function renderHook(scene, config) {
  const hookText = scene.content?.paragraphs?.[0] || scene.title || "Wait for it...";
  const hasCode = scene.content?.code || scene.content?.codes?.length > 0;
  const codeBlockHtml = hasCode ? renderCodeBlock(scene.content.code || scene.content.codes[0], scene.content.outputs || []) : "";

  return `
    <section class="scene scene-hook" data-scene-type="hook">
      <div class="hook-flash" aria-hidden="true"></div>
      <div class="hook-glow-orb hook-glow-orb-1" aria-hidden="true"></div>
      <div class="hook-glow-orb hook-glow-orb-2" aria-hidden="true"></div>
      <div class="hook-content">
        <h1 class="hook-text animated visible-element" style="--delay: 0s" data-visible="title">${formatHookText(hookText)}</h1>
        <div class="hook-accent-line animated visible-element" style="--delay: 0.35s"></div>
        ${codeBlockHtml ? `<div class="hook-code-preview animated visible-element" style="--delay: 0.55s; width: 100%; transform: scale(0.88); transform-origin: top center; margin-top: -12px;">${codeBlockHtml}</div>` : ""}
        <div class="hook-brand animated visible-element" style="--delay: ${codeBlockHtml ? "0.95s" : "0.65s"}" data-visible="brand">${escapeHtml(config.brand?.handle || "@java_learning_hub_")}</div>
      </div>
    </section>
  `;
}

function renderEngage(scene, config) {
  const emoji = scene.content?.engageEmoji || "💾";
  const text = scene.content?.engageText || scene.title || "Save this for later";
  return `
    <section class="scene scene-engage" data-scene-type="engage">
      <div class="engage-pulse-ring" aria-hidden="true"></div>
      <div class="engage-pulse-ring engage-pulse-ring-2" aria-hidden="true"></div>
      <div class="engage-emoji animated visible-element" style="--delay: 0s" data-visible="emoji">${escapeHtml(emoji)}</div>
      <p class="engage-text animated visible-element" style="--delay: 0.25s" data-visible="text">${textBlock(text)}</p>
      <div class="engage-hint animated visible-element" style="--delay: 0.55s" data-visible="hint">Double tap ❤️</div>
    </section>
  `;
}

function renderHero(scene, config) {
  const kickerText = scene.content.kicker || (scene.dayNumber ? `Day ${scene.dayNumber}` : "");
  return `
    <section class="scene scene-hero" data-scene-type="hero">
      ${kickerText ? `<div class="badge animated visible-element" ${delay(0, 0.05)} data-visible="badge">${escapeHtml(kickerText)}</div>` : ""}
      <h1 class="hero-title animated visible-element fit-heading" ${delay(0, 0.08)} data-visible="title">${textBlock(scene.title)}</h1>
      ${renderBlocks(scene, 0.35)}
      <div class="brand-chip animated visible-element" ${delay(0, 0.50)} data-visible="brand">${escapeHtml(scene.content.brandHandle || config.brand.handle)}</div>
    </section>
  `;
}

function renderSlideScene(scene) {
  return `
    <section class="scene scene-${escapeHtml(scene.type)}" data-scene-type="${escapeHtml(scene.type)}">
      ${renderSceneHeader(scene)}
      ${renderBlocks(scene, 0.55)}
    </section>
  `;
}

function renderBlocks(scene, baseDelay = 0.55) {
  const blocks = scene.content.blocks ?? [];
  if (!blocks.length) return "";

  const pieces = [];
  let visualIndex = 0;

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];

    if (block.type === "code") {
      const outputs = [];
      let cursor = index + 1;
      while (blocks[cursor]?.type === "output") {
        outputs.push({ language: blocks[cursor].language, text: blocks[cursor].text, title: blocks[cursor].label ?? "" });
        cursor += 1;
      }

      const codeLinesCount = block.text.split("\n").filter(Boolean).length;
      pieces.push(renderCodeBlock({
        language: block.language || "text",
        code: block.text,
        fullCode: block.text,
        lines: codeLinesCount,
        totalLines: codeLinesCount,
        title: block.label ?? "",
        blockIndex: visualIndex + 1
      }, outputs));
      visualIndex += 1;

      if (outputs.length > 0) {
        pieces.push(renderSeparateOutputs(outputs, codeLinesCount, visualIndex, baseDelay));
        visualIndex += outputs.length * 4;
      }

      index = cursor - 1;
      continue;
    }

    if (block.type === "output") {
      pieces.push(renderOutputCard(block, visualIndex, baseDelay));
      visualIndex += 1;
      continue;
    }

    if (block.type === "flow") {
      pieces.push(renderFlowBlock(block, visualIndex, baseDelay));
      visualIndex += 1;
      continue;
    }

    if (block.type === "bulletList" || block.type === "numberedList" || block.type === "paragraphGroup") {
      pieces.push(renderListBlock(block, scene, visualIndex, baseDelay));
      visualIndex += 1;
      continue;
    }

    if (block.type === "table") {
      pieces.push(renderTableBlock(block, visualIndex, baseDelay));
      visualIndex += 1;
      continue;
    }

    if (block.type === "blockquote") {
      pieces.push(renderTextCard(block.text, "quote-card", visualIndex, baseDelay, block.label));
      visualIndex += 1;
      continue;
    }

    pieces.push(renderTextCard(block.text, "paragraph-card", visualIndex, baseDelay, block.label));
    visualIndex += 1;
  }

  return `<div class="slide-stack">${pieces.join("")}</div>`;
}

function renderSceneHeader(scene) {
  return `
    <header class="scene-header">
      ${scene.dayNumber ? `<p class="scene-kicker animated visible-element" ${delay(0, 0.15)} data-visible="kicker">${escapeHtml(`Day ${scene.dayNumber}`)}</p>` : ""}
      <h2 class="scene-title animated visible-element fit-heading" ${delay(0, 0.25)} data-visible="title">${textBlock(scene.title)}</h2>
    </header>
  `;
}

function renderTextCard(text, className, index, baseDelay, label = "") {
  return `
    <article class="${className} glass-card animated visible-element" ${delay(index, baseDelay, 0.14)} data-visible="paragraph">
      ${renderBlockLabel(label)}
      <p class="fit-body">${textBlock(text)}</p>
    </article>
  `;
}

function renderListBlock(block, scene, index, baseDelay) {
  const isOrdered = block.type === "numberedList";
  const isGroupedParagraphs = block.type === "paragraphGroup";
  const isCta = scene.type === "cta";
  const className = isCta ? "cta-list" : "list-panel glass-card";

  return `
    <div class="${className} animated visible-element" ${delay(index, baseDelay, 0.14)} data-visible="list">
      ${renderBlockLabel(block.label)}
      ${block.items
        .map((item, itemIndex) => `
          <div class="list-item-card animated visible-element" ${delay(itemIndex, baseDelay + 0.12, 0.10)} data-visible="list-item">
            <span>${isOrdered ? itemIndex + 1 : isGroupedParagraphs ? "" : ""}</span>
            <p class="fit-body">${textBlock(item)}</p>
          </div>
        `)
        .join("")}
    </div>
  `;
}

function renderFlowBlock(block, index, baseDelay) {
  const items = block.items ?? [];
  const denseClass = items.length > 7 ? " is-dense-flow" : "";
  return `
    <div class="flow-board glass-card animated visible-element${denseClass}" ${delay(index, baseDelay, 0.14)} data-visible="flow">
      ${renderBlockLabel(block.label)}
      ${items
        .map((item, itemIndex) => {
          const isArrow = /^(?:↓|→|->|=>|➡|-->|⇢)$/.test(item.trim());
          return `
            <div class="${isArrow ? "flow-arrow" : "flow-row"} animated visible-element" ${delay(itemIndex, baseDelay + 0.14, 0.12)} data-visible="flow-row">
              ${isArrow ? `<span>${escapeHtml(item)}</span>` : `<div class="flow-node"><strong class="fit-body">${textBlock(item)}</strong></div>`}
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderTableBlock(block, index, baseDelay) {
  const columnCount = Math.max(1, block.headers.length);

  return `
    <div class="comparison-table glass-card animated visible-element" style="--columns: ${columnCount}; --delay: ${(baseDelay + index * 0.14).toFixed(2)}s" data-visible="comparison">
      ${renderBlockLabel(block.label)}
      <div class="comparison-header">
        ${block.headers.map((header) => `<strong>${escapeHtml(header)}</strong>`).join("")}
      </div>
      ${block.rows
        .map((row, rowIndex) => `
          <div class="comparison-row animated visible-element" ${delay(rowIndex, baseDelay + 0.14, 0.10)} data-visible="comparison-row">
            ${row.map((cell) => `<span class="fit-body">${textBlock(cell)}</span>`).join("")}
          </div>
        `)
        .join("")}
    </div>
  `;
}

function renderOutputCard(output, index, baseDelay) {
  return `
    <article class="output-only-card glass-card animated visible-element" ${delay(index, baseDelay, 0.14)} data-visible="output">
      ${renderBlockLabel(output.label)}
      <pre>${escapeHtml(output.text)}</pre>
    </article>
  `;
}

function renderBlockLabel(label) {
  const text = String(label ?? "").trim();
  if (!text) return "";
  return `<strong class="block-label">${escapeHtml(text)}</strong>`;
}

function renderSeparateOutputs(outputs, codeBlockLinesCount, visualIndexStart, baseDelay) {
  const totalTypingDuration = 0.3 + Math.min(1.0, Math.max(0, codeBlockLinesCount - 1) / 9) * 0.7;
  const codeFinishDelay = 0.45 + totalTypingDuration;

  return outputs.map((output, index) => {
    const outDelay = codeFinishDelay + 0.2 + index * 0.4;
    const arrow1Delay = outDelay;
    const labelDelay = outDelay + 0.1;
    const arrow2Delay = outDelay + 0.2;
    const cardDelay = outDelay + 0.3;

    return `
      <div class="output-connector animated visible-element" style="--delay: ${arrow1Delay.toFixed(2)}s">↓</div>
      <div class="output-label animated visible-element" style="--delay: ${labelDelay.toFixed(2)}s">Output</div>
      <div class="output-connector animated visible-element" style="--delay: ${arrow2Delay.toFixed(2)}s">↓</div>
      <article class="output-separate-card glass-card animated visible-element" style="--delay: ${cardDelay.toFixed(2)}s" data-visible="output">
        ${output.title ? `<strong class="block-label">${escapeHtml(output.title)}</strong>` : ""}
        <pre>${escapeHtml(output.text)}</pre>
      </article>
    `;
  }).join("");
}

function renderCta(scene, config) {
  const nextDayNumber = scene.content?.nextDayNumber;
  const items = scene.content.bullets && scene.content.bullets.length > 0
    ? scene.content.bullets
    : [
        "💾 Save this for revision",
        `Follow ${config.brand?.handle || "@java_learning_hub_"} for daily content`,
        "❤️ Like & Share with friends",
        "🔥 More coming tomorrow!"
      ];

  return `
    <section class="scene scene-cta" data-scene-type="cta">
      <div class="cta-confetti" aria-hidden="true">
        <span class="confetti-piece" style="--x: 15%; --hue: 32; --delay: 0.8s"></span>
        <span class="confetti-piece" style="--x: 35%; --hue: 200; --delay: 1.1s"></span>
        <span class="confetti-piece" style="--x: 55%; --hue: 120; --delay: 0.9s"></span>
        <span class="confetti-piece" style="--x: 75%; --hue: 280; --delay: 1.3s"></span>
        <span class="confetti-piece" style="--x: 90%; --hue: 50; --delay: 1.0s"></span>
      </div>
      <div class="success-icon-wrapper animated visible-element" style="--delay: 0.25s">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>
      <h2 class="cta-subtitle animated visible-element" style="--delay: 0.45s">Today's Topic Complete 🎉</h2>
      
      <div class="cta-list animated visible-element" style="--delay: 0.65s" data-visible="list">
        ${items.map((item, index) => `
          <div class="list-item-card animated visible-element" style="--delay: ${(0.80 + index * 0.15).toFixed(2)}s" data-visible="list-item">
            <span></span>
            <p class="fit-body">${escapeHtml(item)}</p>
          </div>
        `).join("")}
      </div>
      ${nextDayNumber ? `
        <div class="next-topic-teaser animated visible-element" style="--delay: ${(0.80 + items.length * 0.15 + 0.2).toFixed(2)}s" data-visible="teaser">
          <span class="teaser-badge">COMING NEXT</span>
          <strong>Day ${nextDayNumber}</strong>
          <p>Follow to get notified 🔔</p>
        </div>
      ` : ""}
    </section>
  `;
}
