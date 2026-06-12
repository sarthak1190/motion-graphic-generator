import path from "node:path";
import { renderClipHtml } from "../templates/reelTemplate.js";
import { writeText } from "../utils/fileSystem.js";

export async function writeClipHtml(scene, config, outputDir) {
  const html = renderClipHtml(scene, config);
  const htmlPath = path.join(outputDir, "html", `${scene.id}.html`);
  await writeText(htmlPath, html);
  return htmlPath;
}
