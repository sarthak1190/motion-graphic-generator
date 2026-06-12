import { animationCss } from "../animations/animationPresets.js";
import { renderBrandFooter, renderProgress, renderSceneBody } from "../components/sceneBlocks.js";
import { cssVars } from "../components/html.js";

export function renderClipHtml(scene, config) {
  const { width, height, durationSeconds } = config.canvas;
  const sceneDuration = scene.duration ?? durationSeconds;
  const logicalWidth = 1080;
  const logicalHeight = 1920;
  const renderScale = width / logicalWidth;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=${width}, initial-scale=1">
    <title>${scene.id} - ${scene.title}</title>
    <style>
      :root {
        ${cssVars(config.theme)}
        --output-width: ${width}px;
        --output-height: ${height}px;
        --stage-width: ${logicalWidth}px;
        --stage-height: ${logicalHeight}px;
        --render-scale: ${renderScale};
        --duration: ${sceneDuration}s;
        --capture-time: 0s;
        --safe-x: 60px;
        --content-max: 960px;
        --content-bottom: 1650px;
        --premium-ease: cubic-bezier(0.22, 1, 0.36, 1);
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        width: var(--output-width);
        height: var(--output-height);
        margin: 0;
        overflow: hidden;
        background: var(--background);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        text-rendering: geometricPrecision;
      }

      body.capture * {
        animation-play-state: paused !important;
      }

      #stage {
        position: relative;
        width: var(--stage-width);
        height: var(--stage-height);
        transform: scale(var(--render-scale));
        transform-origin: top left;
        overflow: hidden;
        color: var(--text);
        background: linear-gradient(180deg, #FAFAFA 0%, #F4F8FB 58%, #FAFAFA 100%);
      }

      #stage::before,
      #stage::after {
        content: "";
        position: absolute;
        pointer-events: none;
      }

      #stage::before {
        z-index: 1;
        inset: -6%;
        background:
          radial-gradient(circle at 18% 12%, rgba(248, 152, 32, 0.16), transparent 26%),
          radial-gradient(circle at 86% 16%, rgba(83, 130, 161, 0.18), transparent 24%),
          radial-gradient(circle at 72% 74%, rgba(248, 152, 32, 0.10), transparent 26%),
          linear-gradient(rgba(83,130,161,0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(83,130,161,0.08) 1px, transparent 1px);
        background-size: auto, auto, auto, 64px 64px, 64px 64px;
        opacity: 0.82;
        animation: backgroundPan 7s ease-in-out infinite alternate;
        animation-delay: calc(0s - var(--capture-time));
      }

      #stage::after {
        z-index: 2;
        inset: 0;
        background: linear-gradient(110deg, transparent 8%, rgba(255,255,255,0.60), transparent 24%);
        transform: translateX(-120%);
        animation: glowSweep 4.4s ease-in-out infinite;
        animation-delay: calc(1.4s - var(--capture-time));
      }

      .bg-decor {
        position: absolute;
        z-index: 3;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
      }

      .particle,
      .thin-line {
        position: absolute;
        opacity: 0.24;
        animation-delay: calc(var(--delay, 0s) - var(--capture-time));
        animation-fill-mode: both;
      }

      .particle {
        width: 12px;
        height: 12px;
        border-radius: 999px;
        background: var(--primary);
        box-shadow: 0 0 26px rgba(248,152,32,0.34);
        animation-name: particleFloat;
        animation-duration: 4.8s;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
      }

      .particle:nth-child(1) { left: 866px; top: 430px; }
      .particle:nth-child(2) { left: 62px; top: 1370px; background: var(--secondary); }
      .particle:nth-child(3) { right: 82px; bottom: 260px; }

      .thin-line {
        width: 180px;
        height: 2px;
        border-radius: 99px;
        background: linear-gradient(90deg, transparent, rgba(83,130,161,0.32), transparent);
        animation-name: lineSweep;
        animation-duration: 5.2s;
        animation-iteration-count: infinite;
      }

      .thin-line:nth-child(4) { left: 90px; top: 1520px; }
      .thin-line:nth-child(5) { right: 126px; top: 330px; }

      .animated,
      .visible-element,
      .cta-hero-card,
      .cta-eyebrow,
      .cta-title,
      .cta-share-card,
      .cta-save,
      .cta-follow,
      .cta-subtitle,
      .next-topic,
      .brand-glow,
      .slide-stack,
      .list-panel,
      .list-item-card,
      .metric,
      .definition-card,
      .timeline-card,
      .recap-card,
      .generic-card,
      .problem-card,
      .concept-card,
      .example-card,
      .syntax-card,
      .list-card,
      .numbered-card,
      .takeaway-card,
      .split-card,
      .quote-card,
      .flow-row,
      .comparison-row,
      .check-item,
      .code-line,
      .output-card,
      .output-only-card {
        opacity: 1;
        transform: none;
        visibility: visible;
        animation-fill-mode: both;
        animation-delay: calc(var(--delay, 0s) - var(--capture-time));
      }

      .animated,
      .cta-hero-card,
      .cta-eyebrow,
      .cta-title,
      .cta-share-card,
      .cta-save,
      .cta-follow,
      .cta-subtitle,
      .next-topic,
      .brand-glow,
      .slide-stack,
      .list-panel,
      .list-item-card,
      .metric,
      .definition-card,
      .timeline-card,
      .recap-card,
      .generic-card,
      .problem-card,
      .concept-card,
      .example-card,
      .syntax-card,
      .list-card,
      .numbered-card,
      .takeaway-card,
      .split-card,
      .quote-card,
      .comparison-row,
      .check-item,
      .output-card,
      .output-only-card {
        animation-name: fadeRise;
        animation-duration: 0.46s;
        animation-timing-function: var(--premium-ease);
      }

      .hero-title {
        animation-name: heroPop;
        animation-duration: 0.55s;
      }

      .timeline-card {
        animation-name: slideLeft;
        animation-duration: 0.46s;
      }

      .definition-card,
      .concept-card {
        animation-name: scaleIn;
      }

      .body-stack > .animated:nth-child(1),
      .definition-stack > .animated:nth-child(1),
      .takeaway-stack > .animated:nth-child(1) {
        animation-name: fadeRise;
      }

      .body-stack > .animated:nth-child(2),
      .definition-stack > .animated:nth-child(2),
      .takeaway-stack > .animated:nth-child(2) {
        animation-name: slideLeft;
      }

      .body-stack > .animated:nth-child(3),
      .definition-stack > .animated:nth-child(3),
      .takeaway-stack > .animated:nth-child(3) {
        animation-name: scaleIn;
      }

      .problem-card:nth-child(odd) {
        animation-name: slideLeft;
      }

      .takeaway-card:last-child {
        animation-name: takeawayGlow;
        animation-duration: 1.25s;
      }

      .code-shell,
      .flow-board,
      .comparison-table {
        animation-name: scaleIn;
        animation-duration: 0.5s;
      }

      .flow-board {
        animation: scaleIn 0.5s var(--premium-ease) both, flowPulse 3.6s ease-in-out infinite;
        animation-delay: calc(var(--delay, 0s) - var(--capture-time)), calc(1.5s - var(--capture-time));
      }

      .cta-hero-card {
        animation-name: ctaRise;
        animation-duration: 0.55s;
      }

      .glass-card {
        background: var(--card);
        color: var(--ink);
        border: 1px solid rgba(83, 130, 161, 0.18);
        border-radius: 24px;
        box-shadow: 0 18px 48px rgba(11, 31, 77, 0.12);
      }

      .clip-progress {
        position: absolute;
        z-index: 30;
        left: var(--safe-x);
        right: var(--safe-x);
        top: 38px;
        height: 8px;
        border-radius: 99px;
        background: rgba(83,130,161,0.15);
        overflow: hidden;
      }

      .clip-progress span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, var(--primary), #FFD39B);
        animation: progressGrow 0.45s var(--premium-ease) both;
        animation-delay: calc(0.08s - var(--capture-time));
      }

      .clip-count {
        position: absolute;
        z-index: 31;
        top: 62px;
        right: var(--safe-x);
        color: var(--secondary);
        font-weight: 800;
        letter-spacing: 2px;
        font-size: 24px;
      }

      .brand-footer {
        position: absolute;
        z-index: 31;
        left: var(--safe-x);
        right: var(--safe-x);
        bottom: 54px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        color: var(--ink);
        font-size: 32px;
        line-height: 1.2;
        opacity: 0.75;
      }

      .brand-footer div {
        display: flex;
        min-width: 0;
        gap: 8px;
      }

      .brand-footer span,
      .brand-footer strong {
        padding: 10px 16px;
        border-radius: 999px;
        background: rgba(255,255,255,0.72);
        border: 1px solid rgba(83,130,161,0.18);
        box-shadow: 0 8px 22px rgba(11,31,77,0.06);
        white-space: nowrap;
      }

      .brand-footer strong {
        font-size: 34px;
      }

      .scene {
        position: relative;
        z-index: 10;
        width: 100%;
        height: 100%;
        padding: 80px var(--safe-x) 120px;
        display: flex;
        flex-direction: column;
        gap: 22px;
      }

      .scene > * {
        max-width: var(--content-max);
      }

      .scene-hero {
        justify-content: flex-start;
        padding-top: 280px;
        padding-bottom: 120px;
      }

      .badge,
      .scene-kicker {
        width: max-content;
        max-width: var(--content-max);
        padding: 12px 18px;
        border-radius: 999px;
        color: var(--ink);
        background: linear-gradient(90deg, var(--primary), #FFD39B);
        font-size: 32px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 1.5px;
      }

      .hero-title {
        margin: 24px 0 0;
        max-width: var(--content-max);
        font-size: 96px;
        line-height: 1.02;
        letter-spacing: 0;
        color: var(--ink);
      }

      .hero-subtitle {
        max-width: var(--content-max);
        margin: 10px 0 0;
        color: #334155;
        opacity: 0.92;
        font-size: 56px;
        line-height: 1.34;
        font-weight: 760;
      }

      .hero-code-chip {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        width: 560px;
        margin-top: 34px;
        padding: 18px;
        border-radius: 26px;
        color: #DCEBFF;
        background: linear-gradient(135deg, rgba(11,31,77,0.96), rgba(20,56,105,0.94));
        border: 1px solid rgba(83,130,161,0.26);
        box-shadow: 0 24px 70px rgba(11,31,77,0.16);
      }

      .hero-code-chip code {
        display: block;
        padding: 14px 16px;
        border-radius: 16px;
        background: rgba(255,255,255,0.08);
        color: #EAF3FF;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        font-size: 44px;
        font-weight: 850;
      }

      .hero-copy p,
      .paragraph-card p,
      .definition-card p,
      .timeline-card p,
      .recap-card p,
      .generic-card p,
      .problem-card p,
      .concept-card p,
      .example-card p,
      .syntax-card p,
      .list-card p,
      .numbered-card p,
      .takeaway-card p,
      .split-card p,
      .quote-card p {
        margin: 0;
        font-size: 46px;
        line-height: 1.36;
        font-weight: 780;
      }

      .metric-row {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        margin-top: 18px;
      }

      .metric {
        padding: 20px 18px;
        font-size: 25px;
        line-height: 1.2;
        font-weight: 900;
        text-align: center;
      }

      .brand-chip {
        margin-top: 14px;
        width: max-content;
        padding: 14px 20px;
        border-radius: 999px;
        color: var(--ink);
        background: rgba(255,255,255,0.92);
        border: 1px solid rgba(83,130,161,0.18);
        box-shadow: 0 14px 34px rgba(11,31,77,0.10);
        font-size: 38px;
        font-weight: 900;
      }

      .scene-sparse {
        justify-content: center;
        padding-top: 120px;
        padding-bottom: 120px;
      }

      .scene-sparse .scene-header {
        margin-bottom: 12px;
      }

      .scene-sparse .body-stack,
      .scene-sparse .definition-stack,
      .scene-sparse .takeaway-stack {
        gap: 22px;
      }

      .scene-sparse .paragraph-card,
      .scene-sparse .definition-card,
      .scene-sparse .generic-card,
      .scene-sparse .problem-card,
      .scene-sparse .concept-card,
      .scene-sparse .list-card,
      .scene-sparse .takeaway-card {
        padding: 34px;
      }

      .support-code-chip {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        width: max-content;
        max-width: var(--content-max);
        margin-top: 4px;
        padding: 14px 18px;
        border-radius: 999px;
        color: #EAF3FF;
        background: rgba(11,31,77,0.92);
        box-shadow: 0 16px 38px rgba(11,31,77,0.12);
      }

      .support-code-chip span {
        color: var(--primary);
        font-weight: 1000;
      }

      .support-code-chip code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        font-size: 24px;
        font-weight: 900;
      }

      .scene-header {
        margin-bottom: 4px;
      }

      .scene-title {
        margin: 18px 0 12px;
        max-width: var(--content-max);
        font-size: 84px;
        line-height: 1.06;
        letter-spacing: 0;
        color: var(--ink);
      }

      .scene-subtitle {
        margin: 0;
        max-width: var(--content-max);
        color: #334155;
        opacity: 0.92;
        font-size: 56px;
        line-height: 1.32;
        font-weight: 720;
      }

      .body-stack,
      .slide-stack,
      .definition-stack,
      .takeaway-stack,
      .output-stack {
        display: grid;
        gap: 16px;
        max-width: var(--content-max);
      }

      .slide-stack {
        width: 100%;
        gap: 12px;
      }

      .timeline-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        max-width: var(--content-max);
      }

      .paragraph-card,
      .definition-card,
      .timeline-card,
      .recap-card,
      .generic-card,
      .problem-card,
      .concept-card,
      .example-card,
      .syntax-card,
      .list-card,
      .list-panel,
      .cta-list,
      .numbered-card,
      .takeaway-card,
      .split-card,
      .quote-card {
        position: relative;
        overflow: hidden;
        width: 100%;
        padding: 24px 26px;
        background: #FFFFFF;
      }

      .recap-card,
      .timeline-card,
      .generic-card,
      .problem-card,
      .concept-card,
      .example-card,
      .syntax-card,
      .list-card,
      .numbered-card,
      .takeaway-card,
      .split-card {
        display: grid;
        grid-template-columns: 58px 1fr;
        align-items: start;
        gap: 18px;
      }

      .list-panel,
      .cta-list {
        display: grid;
        gap: 14px;
        width: 100%;
      }

      .list-item-card {
        display: grid;
        grid-template-columns: 54px 1fr;
        gap: 18px;
        align-items: start;
        padding: 12px 0;
        border-bottom: 1px solid rgba(17,24,39,0.12);
      }

      .list-item-card:last-child {
        border-bottom: 0;
      }

      .list-item-card span {
        display: grid;
        place-items: center;
        width: 48px;
        height: 48px;
        border-radius: 16px;
        color: #111827;
        background: var(--primary);
        font-size: 20px;
        font-weight: 1000;
      }

      .list-item-card span:empty::after {
        content: "";
        width: 14px;
        height: 14px;
        border-radius: 999px;
        background: currentColor;
      }

      .list-item-card p {
        margin: 0;
        font-size: 44px;
        line-height: 1.34;
        font-weight: 820;
      }

      .block-label {
        display: inline-block;
        width: max-content;
        max-width: 100%;
        margin-bottom: 14px;
        padding: 8px 14px;
        border-radius: 999px;
        color: #07183D;
        background: rgba(248,152,32,0.18);
        font-size: 32px;
        line-height: 1.1;
        font-weight: 1000;
      }

      .cta-list {
        padding: 28px;
        border-radius: 28px;
        background: linear-gradient(135deg, rgba(248,152,32,0.96), rgba(255,211,155,0.96));
        box-shadow: 0 28px 70px rgba(248,152,32,0.22);
      }

      .cta-list .list-item-card {
        padding: 22px;
        border: 0;
        border-radius: 22px;
        background: rgba(255,255,255,0.88);
        box-shadow: 0 16px 34px rgba(17,24,39,0.10);
      }

      .definition-card span,
      .timeline-card span,
      .recap-card span,
      .generic-card span,
      .problem-card span,
      .concept-card span,
      .example-card span,
      .syntax-card span,
      .list-card span,
      .numbered-card span,
      .takeaway-card span,
      .split-card span,
      .quote-card span {
        display: grid;
        place-items: center;
        width: 54px;
        height: 54px;
        border-radius: 18px;
        color: #07183D;
        background: var(--primary);
        font-size: 22px;
        font-weight: 1000;
      }

      .definition-card span {
        width: max-content;
        height: auto;
        margin-bottom: 16px;
        padding: 9px 14px;
        border-radius: 999px;
        font-size: 18px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .quote-card {
        border-color: rgba(248, 152, 32, 0.46);
      }

      .quote-card span {
        width: max-content;
        height: auto;
        margin-bottom: 16px;
        padding: 9px 14px;
        border-radius: 999px;
        font-size: 18px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .flow-board {
        width: 100%;
        max-width: var(--content-max);
        padding: 20px;
        background: #FFFFFF;
      }

      .flow-row {
        display: grid;
        gap: 6px;
      }

      .flow-arrow {
        display: grid;
        place-items: center;
        min-height: 28px;
        color: var(--primary);
        font-size: 32px;
        line-height: 1;
        font-weight: 1000;
      }

      .flow-node {
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 12px 16px;
        border-radius: 22px;
        background: linear-gradient(90deg, rgba(83,130,161,0.10), rgba(255,255,255,0.96));
        color: var(--ink);
      }

      .flow-node span {
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        width: 52px;
        height: 52px;
        border-radius: 16px;
        color: #07183D;
        background: var(--primary);
        font-size: 22px;
        font-weight: 1000;
      }

      .flow-node strong {
        font-size: 44px;
        line-height: 1.2;
      }

      .flow-board.is-dense-flow {
        padding: 16px;
      }

      .flow-board.is-dense-flow .flow-node {
        padding: 9px 14px;
      }

      .flow-board.is-dense-flow .flow-node strong {
        font-size: 40px;
      }

      .flow-board.is-dense-flow .flow-arrow {
        min-height: 20px;
        font-size: 28px;
      }

      .flow-connector {
        width: 5px;
        height: 34px;
        margin-left: 42px;
        background: linear-gradient(180deg, var(--primary), var(--secondary));
        transform-origin: top;
        animation: drawConnector 0.55s ease both;
        animation-delay: calc(var(--delay, 0.2s) - var(--capture-time));
      }

      .flow-connector i {
        display: block;
        width: 18px;
        height: 18px;
        margin-left: -7px;
        margin-top: 20px;
        border-right: 5px solid var(--secondary);
        border-bottom: 5px solid var(--secondary);
        transform: rotate(45deg);
      }

      .comparison-table {
        overflow: hidden;
        width: 100%;
        max-width: var(--content-max);
      }

      .comparison-header,
      .comparison-row {
        display: grid;
        grid-template-columns: repeat(var(--columns, 3), minmax(0, 1fr));
        gap: 1px;
      }

      .comparison-header strong,
      .comparison-row span {
        padding: 18px;
        font-size: 40px;
        line-height: 1.28;
        background: rgba(255,255,255,0.70);
        color: var(--ink);
        overflow-wrap: anywhere;
      }

      .comparison-header strong {
        color: #07183D;
        background: linear-gradient(90deg, rgba(248,152,32,0.96), rgba(255,211,155,0.96));
        font-size: 42px;
      }

      .split-comparison {
        display: grid;
        gap: 16px;
        width: 100%;
        max-width: var(--content-max);
      }

      .code-shell {
        position: relative;
        overflow: hidden;
        width: 100%;
        max-width: var(--content-max);
        background: #0B1F4D;
        border: 1px solid rgba(83,130,161,0.22);
        display: flex;
        flex-direction: column;
        min-height: 500px;
        max-height: 900px;
        height: auto;
      }

      .window-bar {
        display: flex;
        align-items: center;
        gap: 10px;
        height: 48px;
        padding: 0 18px;
        background: linear-gradient(90deg, #0B1F4D, #143869);
        color: rgba(255,255,255,0.84);
      }

      .window-bar span {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--primary);
      }

      .window-bar span:nth-child(2) {
        background: #FFD39B;
      }

      .window-bar span:nth-child(3) {
        background: var(--secondary);
      }

      .window-bar strong {
        margin-left: auto;
        font-size: 28px;
        letter-spacing: 2px;
      }

      .code-pre {
        margin: 0;
        padding: 18px 22px 22px;
        overflow: visible;
        background: #0B1F4D;
        color: #EAF3FF;
        font-size: 42px;
        line-height: 1.30;
        flex: 1;
      }

      .code-line {
        display: block;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        animation-name: lineReveal;
        animation-duration: 0.32s;
        animation-timing-function: var(--premium-ease);
        opacity: 1;
      }

      .code-line.important-line {
        margin: 4px -8px;
        padding: 4px 8px;
        border-radius: 12px;
        color: #FFFFFF;
        background: rgba(248,152,32,0.24);
        box-shadow: inset 4px 0 0 var(--primary), 0 0 24px rgba(248,152,32,0.18);
        animation-name: lineReveal, importantLineGlow;
        animation-duration: 0.32s, 1.2s;
        animation-delay: calc(var(--delay, 0s) - var(--capture-time)), calc(var(--highlight-delay, 3.4s) - var(--capture-time));
        animation-iteration-count: 1, 1;
      }

      .line-no {
        display: none;
        width: 0;
        color: rgba(255,255,255,0.36);
      }

      .tok-keyword,
      .tok-annotation {
        color: var(--primary);
        font-weight: 900;
        animation: keywordGlow 2.4s ease-in-out infinite;
        animation-delay: calc(0s - var(--capture-time));
      }

      .tok-string {
        color: #9DE8C8;
      }

      .tok-number {
        color: #FFD39B;
      }

      .tok-comment {
        color: #87A4C5;
      }

      .code-cursor {
        display: inline-block;
        width: 9px;
        height: 30px;
        margin-left: 0;
        background: var(--primary);
        animation: blink 0.9s steps(2) infinite;
        animation-delay: calc(0s - var(--capture-time));
      }

      .output-connector {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 44px;
        color: var(--success);
        margin: 4px 0;
        font-weight: 900;
      }

      .output-label {
        font-size: 34px;
        font-weight: 1000;
        color: var(--success);
        letter-spacing: 2px;
        text-transform: uppercase;
        margin: 2px 0;
        text-align: center;
      }

      .output-only-card,
      .output-separate-card {
        width: 100%;
        max-width: var(--content-max);
        padding: 24px 28px;
        border-radius: 24px;
        background: #022010;
        border: 2px solid var(--success);
        box-shadow: 0 20px 45px rgba(22, 163, 74, 0.22);
        color: #9DE8C8;
        font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
      }

      .output-only-card strong,
      .output-separate-card strong {
        display: inline-block;
        margin-bottom: 14px;
        padding: 8px 12px;
        border-radius: 999px;
        background: var(--success);
        color: #FFFFFF;
        font-size: 30px;
        letter-spacing: 1px;
      }

      .output-only-card pre,
      .output-separate-card pre {
        margin: 0;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        font-size: 42px;
        line-height: 1.36;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        font-weight: 850;
      }

      .checklist,
      .mistake-list,
      .question-list {
        width: 100%;
        max-width: var(--content-max);
        padding: 24px 28px;
      }

      .checklist-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 22px;
        width: 100%;
        max-width: var(--content-max);
        align-items: stretch;
      }

      .checklist-column {
        padding: 28px;
        min-height: 520px;
      }

      .checklist-column > strong {
        display: inline-block;
        margin-bottom: 12px;
        padding: 9px 13px;
        border-radius: 999px;
        color: var(--ink);
        background: rgba(83,130,161,0.12);
        font-size: 20px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .checklist-column.accent-success > strong {
        background: rgba(22,163,74,0.14);
        color: #166534;
      }

      .checklist-column.accent-danger > strong {
        background: rgba(248,152,32,0.18);
        color: #9A3412;
      }

      .checklist-column.accent-success {
        border-color: rgba(22,163,74,0.28);
        box-shadow: 0 20px 54px rgba(22,163,74,0.10);
      }

      .checklist-column.accent-danger {
        border-color: rgba(248,152,32,0.34);
        box-shadow: 0 20px 54px rgba(248,152,32,0.12);
      }

      .check-item {
        display: flex;
        align-items: flex-start;
        gap: 18px;
        padding: 19px 0;
        border-bottom: 1px solid rgba(16,32,51,0.14);
      }

      .check-item:last-child {
        border-bottom: 0;
      }

      .check-mark {
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        width: 48px;
        height: 48px;
        margin-top: 2px;
        border-radius: 16px;
        background: var(--primary);
        animation: checkPop 0.58s var(--premium-ease) both;
        animation-delay: calc(var(--delay, 0s) - var(--capture-time));
      }

      .accent-success .check-mark {
        background: var(--success);
      }

      .accent-danger .check-mark {
        background: var(--danger);
      }

      .check-mark::after {
        content: "";
        width: 22px;
        height: 12px;
        border-left: 5px solid #07183D;
        border-bottom: 5px solid #07183D;
        transform: rotate(-45deg) translateY(-2px);
      }

      .question-list .check-mark::after {
        content: "?";
        width: auto;
        height: auto;
        border: 0;
        transform: none;
        color: #07183D;
        font-size: 30px;
        font-weight: 1000;
      }

      .checklist-column.accent-danger .check-mark::after,
      .accent-danger .check-mark::after {
        content: "!";
        width: auto;
        height: auto;
        border: 0;
        transform: none;
        color: #FFFFFF;
        font-size: 30px;
        font-weight: 1000;
      }

      .check-item p {
        margin: 0;
        color: var(--ink);
        font-size: 42px;
        line-height: 1.32;
        font-weight: 850;
      }

      .cta-panel {
        margin-top: 8px;
        padding: 22px;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        width: 100%;
        max-width: var(--content-max);
        border-radius: 28px;
        background: rgba(248, 152, 32, 0.95);
        color: #07183D;
        box-shadow: 0 18px 46px rgba(248,152,32,0.24);
      }

      .cta-panel strong {
        display: block;
        padding: 16px 12px;
        border-radius: 18px;
        background: rgba(255,255,255,0.38);
        font-size: 26px;
        line-height: 1.18;
        text-align: center;
        animation: ctaPulse 2.2s ease-in-out infinite;
        animation-delay: calc(var(--delay, 0s) - var(--capture-time));
      }

      .cta-panel em {
        grid-column: 1 / -1;
        font-size: 28px;
        font-style: normal;
        font-weight: 1000;
        text-align: center;
      }

      .scene-cta {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 28px;
        padding: 96px var(--safe-x);
        text-align: center;
        height: 100%;
        width: 100%;
      }

      .success-icon-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 130px;
        height: 130px;
        border-radius: 50%;
        background: rgba(22, 163, 74, 0.14);
        border: 4px solid var(--success);
        box-shadow: 0 0 34px rgba(22, 163, 74, 0.28);
        animation: scaleIn 0.65s var(--premium-ease) both, flowPulse 3.2s ease-in-out infinite;
      }

      .success-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 90px;
        height: 90px;
        border-radius: 50%;
        background: var(--success);
        color: #FFFFFF;
        box-shadow: 0 8px 20px rgba(22, 163, 74, 0.45);
      }

      .success-icon svg {
        width: 48px;
        height: 48px;
        stroke: currentColor;
      }

      .cta-subtitle {
        margin: 0;
        font-size: 54px;
        font-weight: 1000;
        color: var(--ink);
        letter-spacing: -1px;
        animation: fadeRise 0.72s var(--premium-ease) both;
      }

      .cta-hero-card {
        position: relative;
        overflow: hidden;
        width: 100%;
        max-width: var(--content-max);
        padding: 46px;
        border-radius: 34px;
        color: var(--ink);
        background:
          radial-gradient(circle at 18% 0%, rgba(255,255,255,0.66), transparent 34%),
          linear-gradient(135deg, #F89820 0%, #FFC46D 55%, #FFE6BC 100%);
        border: 1px solid rgba(248,152,32,0.42);
        box-shadow: 0 36px 90px rgba(248,152,32,0.28), 0 18px 44px rgba(11,31,77,0.12);
      }

      .cta-hero-card::before {
        content: "";
        position: absolute;
        inset: -20%;
        background: linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.36), transparent 42%);
        transform: translateX(-80%);
        animation: glowSweep 3.2s ease-in-out infinite;
        animation-delay: calc(0.8s - var(--capture-time));
      }

      .cta-hero-card > * {
        position: relative;
        z-index: 1;
      }

      .cta-eyebrow {
        display: inline-flex;
        width: max-content;
        padding: 10px 16px;
        border-radius: 999px;
        background: rgba(255,255,255,0.56);
        color: var(--ink);
        font-size: 22px;
        font-weight: 1000;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .cta-title {
        margin: 18px 0 28px;
        font-size: 66px;
        line-height: 1.04;
        color: var(--ink);
      }

      .cta-share-card {
        display: grid;
        place-items: center;
        min-height: 176px;
        width: 100%;
        padding: 28px;
        border-radius: 28px;
        color: var(--ink);
        background: rgba(255,255,255,0.92);
        border: 1px solid rgba(255,255,255,0.76);
        box-shadow: 0 24px 50px rgba(11,31,77,0.16);
        font-size: 44px;
        line-height: 1.08;
        text-align: center;
        animation-name: scaleIn;
        animation-duration: 0.9s;
      }

      .cta-action-row {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
        margin-top: 22px;
      }

      .cta-save,
      .cta-follow {
        display: grid;
        place-items: center;
        min-height: 96px;
        padding: 20px 16px;
        border-radius: 22px;
        color: var(--ink);
        background: rgba(255,255,255,0.80);
        border: 1px solid rgba(255,255,255,0.72);
        box-shadow: 0 18px 34px rgba(11,31,77,0.10);
        font-size: 30px;
        line-height: 1.12;
        text-align: center;
        animation-name: slideLeft;
        animation-duration: 0.82s;
        animation-timing-function: var(--premium-ease);
      }

      .cta-follow {
        background: #0B1F4D;
        color: #FFFFFF;
        animation-name: slideRightShake;
      }

      .follow-pulse {
        animation-name: slideRightShake, ctaPulse;
        animation-duration: 0.82s, 2.4s;
        animation-delay: calc(var(--delay, 0s) - var(--capture-time)), calc(3.2s - var(--capture-time));
        animation-iteration-count: 1, infinite;
      }

      .next-topic {
        margin-top: 18px;
        padding: 16px 18px;
        border-radius: 20px;
        background: rgba(255,255,255,0.32);
        font-size: 30px;
        color: rgba(11,31,77,0.86);
        line-height: 1.3;
        font-weight: 820;
      }

      .brand-glow {
        display: block;
        margin-top: 24px;
        font-size: 34px;
        font-style: normal;
        font-weight: 1000;
        text-align: center;
        color: var(--ink);
        animation: fadeRise 0.82s var(--premium-ease) both, brandGlow 2.8s ease-in-out infinite;
        animation-delay: calc(var(--delay, 0s) - var(--capture-time)), calc(3.6s - var(--capture-time));
      }

      .visible-element {
        visibility: visible;
      }

      ${animationCss()}
    </style>
  </head>
  <body>
    <main id="stage">
      ${renderBackgroundDecor()}
      ${renderProgress(scene)}
      ${renderSceneBody(scene, config)}
      ${renderBrandFooter(scene, config)}
    </main>
    <script>
      const fitText = (selector, min, max) => {
        for (const element of document.querySelectorAll(selector)) {
          element.style.fontSize = max + "px";
          let size = max;
          while (size > min && (element.scrollHeight > element.clientHeight + 2 || element.scrollWidth > element.clientWidth + 2)) {
            size -= 2;
            element.style.fontSize = size + "px";
          }
        }
      };

      const fitScene = () => {
        fitText(".fit-heading", 64, 96);
        fitText(".fit-body, .scene-subtitle, .cta-share-card, .cta-save, .cta-follow, .next-topic, .paragraph-card p, .definition-card p, .timeline-card p, .generic-card p, .problem-card p, .concept-card p, .example-card p, .syntax-card p, .list-card p, .list-item-card p, .numbered-card p, .takeaway-card p, .split-card p, .quote-card p, .flow-node strong", 36, 50);
        fitText(".check-item p", 36, 50);
        fitText(".code-pre", 42, 52);
        fitText(".output-only-card pre, .output-separate-card pre", 36, 52);
        document.querySelectorAll(".visible-element").forEach((element) => {
          element.style.visibility = "visible";
        });
      };

      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      window.__sceneReady = async () => {
        if (document.fonts?.ready) await document.fonts.ready;
        fitScene();
        await wait(500);
        fitScene();
        const elements = [...document.querySelectorAll("[data-visible], .animated, .code-line, .output-separate-card, .output-connector, .output-label, .output-only-card")];
        return elements.length > 0 && elements.every((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && Number(style.opacity) > 0;
        });
      };
    </script>
  </body>
</html>`;
}

function renderBackgroundDecor() {
  return `
    <div class="bg-decor" aria-hidden="true">
      <span class="particle" style="--delay: 0.4s"></span>
      <span class="particle" style="--delay: 0.9s"></span>
      <span class="particle" style="--delay: 1.3s"></span>
      <span class="thin-line" style="--delay: 0.5s"></span>
      <span class="thin-line" style="--delay: 1.0s"></span>
    </div>
  `;
}
