import path from "node:path";
import { promises as fs } from "node:fs";
import { listFiles, readJson } from "./fileSystem.js";

export async function loadConfig(projectRoot) {
  const configPath = path.join(projectRoot, "config", "default.json");
  const config = await readJson(configPath);

  return {
    ...config,
    projectRoot,
    outputDir: path.resolve(projectRoot, config.output.dir)
  };
}

export async function loadContentFile(filePath) {
  const absolutePath = path.resolve(filePath);
  const raw = await fs.readFile(absolutePath, "utf8");

  return {
    path: absolutePath,
    name: path.basename(absolutePath, path.extname(absolutePath)),
    raw
  };
}

export async function listContentFiles(projectRoot) {
  const contentDir = path.join(projectRoot, "content");
  return listFiles(contentDir, [".md", ".markdown", ".txt"]);
}
