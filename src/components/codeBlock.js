import { delay, escapeHtml } from "./html.js";

const languageTokens = {
  java: [
    "class",
    "interface",
    "record",
    "public",
    "private",
    "protected",
    "final",
    "return",
    "new",
    "void",
    "static",
    "extends",
    "implements",
    "import",
    "package"
  ],
  javascript: ["const", "let", "var", "function", "return", "await", "async", "import", "from", "export", "new", "class"],
  sql: ["select", "from", "where", "join", "left", "right", "inner", "insert", "update", "delete", "group", "order", "by"],
  yaml: ["true", "false", "null"],
  json: ["true", "false", "null"],
  xml: [],
  bash: ["npm", "node", "docker", "kubectl", "aws", "az", "curl", "echo", "export"]
};

export function renderCodeBlock(snippet, outputs = []) {
  const lines = snippet.code.split("\n").filter(Boolean);
  const importantLine = findImportantLine(lines, outputs);
  
  // Dynamic typing duration between 0.3s and 1.0s depending on code length
  const totalTypingDuration = 0.3 + Math.min(1.0, Math.max(0, lines.length - 1) / 9) * 0.7;
  const lineBaseDelay = 0.45;
  const lineStepDelay = lines.length > 1 ? totalTypingDuration / (lines.length - 1) : 0;
  const highlightDelay = lineBaseDelay + totalTypingDuration + 0.2;

  return `
    <div class="code-shell glass-card animated visible-element" style="--delay: 0.45s; --line-count: ${lines.length}" data-visible="code" data-line-count="${lines.length}">
      <div class="window-bar">
        <span></span><span></span><span></span>
        <strong>${escapeHtml(snippet.title || snippet.language)}</strong>
      </div>
      <pre class="code-pre">${lines
        .map((line, index) => {
          const highlighted = highlightLine(line, snippet.language);
          const importantClass = index === importantLine ? " important-line" : "";
          const lineDelay = lineBaseDelay + index * lineStepDelay;
          return `<code class="code-line${importantClass}" style="--delay: ${lineDelay.toFixed(2)}s; --highlight-delay: ${highlightDelay.toFixed(2)}s">${highlighted}</code>`;
        })
        .join("")}<span class="code-cursor" style="--delay: ${(lineBaseDelay + totalTypingDuration).toFixed(2)}s"></span></pre>
    </div>
  `;
}

function findImportantLine(lines, outputs) {
  const outputText = outputs
    .map((output) => output?.text ?? "")
    .join("\n")
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  if (outputText) {
    const normalizedOutput = outputText.toLowerCase();
    const outputLineIndex = lines.findIndex((line) => line.toLowerCase().includes(normalizedOutput));
    if (outputLineIndex >= 0) return outputLineIndex;
  }

  const defaultIndex = lines.findIndex((line) => /\bdefault\b|\bbreak\b|\breturn\b/.test(line));
  return defaultIndex >= 0 ? defaultIndex : Math.min(lines.length - 1, 2);
}

function highlightLine(line, language) {
  let html = escapeHtml(line);

  const tokens = languageTokens[language] ?? [];
  for (const token of tokens) {
    html = html.replace(new RegExp(`\\b(${escapeRegExp(token)})\\b`, "gi"), '<span class="tok-keyword">$1</span>');
  }

  html = html.replace(/(&quot;.*?&quot;|'.*?')/g, '<span class="tok-string">$1</span>');
  html = html.replace(/\b(\d+)\b/g, '<span class="tok-number">$1</span>');
  html = html.replace(/(@[A-Za-z0-9_]+)/g, '<span class="tok-annotation">$1</span>');
  html = html.replace(/(\/\/.*)$/g, '<span class="tok-comment">$1</span>');
  html = html.replace(/(#.*)$/g, '<span class="tok-comment">$1</span>');

  return html || "&nbsp;";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
