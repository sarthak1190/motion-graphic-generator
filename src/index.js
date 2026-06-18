#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeContentFile, debugContentFile, previewContentFile, renderContentFile, renderCarouselFile } from "./renderer/renderPipeline.js";
import { listContentFiles, loadConfig } from "./utils/contentLoader.js";
import { logger } from "./utils/logger.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const command = process.argv[2] ?? "render";
const contentArg = process.argv[3];

try {
  await main();
} catch (error) {
  logger.error(error.message);
  process.exitCode = 1;
}

async function main() {
  const config = await loadConfig(projectRoot);

  switch (command) {
    case "render":
    case "render:all":
      await renderAll(config, "both");
      break;
    case "render:single":
      await renderSingle(config, "both");
      break;
    case "export:carousel":
      await exportCarousel(config);
      break;
    case "export:gifs":
      if (contentArg) await renderSingle(config, "gif");
      else await renderAll(config, "gif");
      break;
    case "export:mp4":
      if (contentArg) await renderSingle(config, "mp4");
      else await renderAll(config, "mp4");
      break;
    case "preview":
      await previewSingle(config);
      break;
    case "debug":
      await debugSingle(config);
      break;
    case "analyze":
      await analyzeSingle();
      break;
    case "help":
    case "--help":
    case "-h":
      printHelp();
      break;
    default:
      throw new Error(`Unknown command "${command}". Run "node src/index.js help".`);
  }
}

async function renderAll(config, mode) {
  const files = await listContentFiles(projectRoot);
  if (!files.length) throw new Error("No content files found in ./content.");

  for (const file of files) {
    await renderContentFile(file, config, mode);
  }
}

async function renderSingle(config, mode) {
  if (!contentArg) throw new Error("Provide a content file path, for example: npm run render:single ./content/day-01.md");
  await renderContentFile(resolveInputPath(contentArg), config, mode);
}

async function exportCarousel(config) {
  if (!contentArg) throw new Error("Provide a content file path, for example: npm run export:carousel ./content/day-16.md");
  await renderCarouselFile(resolveInputPath(contentArg), config);
}

async function previewSingle(config) {
  if (!contentArg) throw new Error("Provide a content file path, for example: npm run preview ./content/day-01.md");
  const result = await previewContentFile(resolveInputPath(contentArg), config);
  logger.success(`HTML previews generated in ${result.outputDir}`);
}

async function debugSingle(config) {
  if (!contentArg) throw new Error("Provide a content file path, for example: npm run debug ./content/day-11.md");
  await debugContentFile(resolveInputPath(contentArg), config);
}

async function analyzeSingle() {
  if (!contentArg) throw new Error("Provide a content file path, for example: npm run analyze ./content/day-01.md");
  const analysis = await analyzeContentFile(resolveInputPath(contentArg));
  console.log(JSON.stringify(analysis, null, 2));
}

function resolveInputPath(inputPath) {
  return path.isAbsolute(inputPath) ? inputPath : path.resolve(process.cwd(), inputPath);
}

function printHelp() {
  console.log(`
Motion Infographic Reel Generator

Commands:
  npm run render
  npm run render:all
  npm run render:single ./content/day-01.md
  npm run export:gifs ./content/day-01.md
  npm run export:mp4 ./content/day-01.md
  npm run preview ./content/day-01.md
  npm run debug ./content/day-11.md
  npm run analyze ./content/day-01.md
`);
}
