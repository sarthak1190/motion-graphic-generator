export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function cssVars(theme) {
  return Object.entries(theme)
    .map(([key, value]) => `--${toKebab(key)}: ${value};`)
    .join("\n");
}

export function delay(index, base = 0.28, step = 0.14) {
  return `style="--delay: ${(base + index * step).toFixed(2)}s"`;
}

export function textBlock(value) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function toKebab(value) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
