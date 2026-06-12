export function normalizeText(value) {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .trim();
}

export function compactWhitespace(value) {
  return String(value ?? "").replace(/[ \t]+/g, " ").trim();
}

export function stripMarkdown(value) {
  return String(value ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[*_~>#]/g, "")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function toTitleCase(value) {
  return compactWhitespace(value)
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

export function splitSentences(value, limit = 8) {
  const plain = stripMarkdown(value);
  if (!plain) return [];

  return plain
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 12)
    .slice(0, limit);
}

export function uniqueByText(items, limit = Number.POSITIVE_INFINITY) {
  const seen = new Set();
  const output = [];

  for (const item of items.flat().filter(Boolean)) {
    const text = typeof item === "string" ? item : item.text ?? item.title ?? JSON.stringify(item);
    const key = compactWhitespace(text).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(item);
    if (output.length >= limit) break;
  }

  return output;
}

export function takeWords(value, maxWords = 18) {
  const words = compactWhitespace(stripMarkdown(value)).split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}...`;
}

export function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

export function scoreKeyword(value, keywords) {
  const haystack = String(value ?? "").toLowerCase();
  return keywords.reduce((score, keyword) => score + (haystack.includes(keyword) ? 1 : 0), 0);
}
