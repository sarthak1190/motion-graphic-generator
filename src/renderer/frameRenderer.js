import path from "node:path";
import { pathToFileURL } from "node:url";
import { ensureDir } from "../utils/fileSystem.js";

export async function captureFrames(htmlPath, framesDir, config, scene = null) {
  const puppeteer = await loadPuppeteer();
  const { width, height, fps, durationSeconds } = config.canvas;
  const sceneDuration = scene?.duration ?? durationSeconds;
  const totalFrames = Math.max(1, Math.ceil(fps * sceneDuration));
  await ensureDir(framesDir);

  const browser = await puppeteer.launch({
    headless: "new",
    args: config.render.puppeteerLaunchArgs
  });

  try {
    const page = await browser.newPage();
    await preparePage(page, htmlPath, config, sceneDuration);

    for (let frame = 0; frame < totalFrames; frame += 1) {
      const seconds = (config.render.captureStartSeconds ?? 0.25) + frame / fps;
      await prepareCaptureFrame(page, seconds);

      await page.screenshot({
        path: path.join(framesDir, `frame_${String(frame + 1).padStart(5, "0")}.png`),
        type: "png",
        clip: { x: 0, y: 0, width, height },
        omitBackground: false
      });
    }

    return totalFrames;
  } finally {
    await browser.close();
  }
}

export async function captureSceneScreenshot(htmlPath, outputPath, config) {
  return captureSceneScreenshotAtTime(htmlPath, outputPath, config, config.render.captureStartSeconds ?? 1.2);
}

export async function captureSceneScreenshots(htmlPath, captures, config) {
  const puppeteer = await loadPuppeteer();
  const { width, height } = config.canvas;

  const browser = await puppeteer.launch({
    headless: "new",
    args: config.render.puppeteerLaunchArgs
  });

  try {
    const page = await browser.newPage();
    const readyAtSeconds = Math.max(...captures.map((capture) => capture.seconds), config.canvas.durationSeconds);
    await preparePage(page, htmlPath, config, readyAtSeconds);
    for (const capture of captures) {
      await prepareCaptureFrame(page, capture.seconds);
      await page.screenshot({
        path: capture.outputPath,
        type: "png",
        clip: { x: 0, y: 0, width, height },
        omitBackground: false
      });
    }
    return captures.map((capture) => capture.outputPath);
  } finally {
    await browser.close();
  }
}

async function captureSceneScreenshotAtTime(htmlPath, outputPath, config, seconds) {
  const paths = await captureSceneScreenshots(htmlPath, [{ outputPath, seconds }], config);
  return paths[0];
}

async function preparePage(page, htmlPath, config, readyAtSeconds = config.canvas.durationSeconds) {
  const { width, height } = config.canvas;
  const readyTime = Math.max(readyAtSeconds, config.render.captureStartSeconds ?? 0.25);
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  await page.waitForSelector("#stage, .stage-slide");
  await page.evaluate(async (mountDelayMs, captureTime) => {
    document.body.classList.add("capture");
    document.documentElement.style.setProperty("--capture-time", `${captureTime}s`);
    void document.body.offsetHeight;
    if (document.fonts?.ready) await document.fonts.ready;
    if (typeof window.__sceneReady === "function") await window.__sceneReady();
    await new Promise((resolve) => setTimeout(resolve, mountDelayMs));
  }, config.render.mountDelayMs ?? 500, readyTime);
  await prepareCaptureFrame(page, readyTime);
  await page.waitForFunction(() => {
    const elements = [...document.querySelectorAll("[data-visible], .animated, .code-line, .output-card")];
    if (!elements.length) return false;
    return elements.every((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && Number(style.opacity) > 0;
    });
  }, { timeout: 5000 });
}

async function prepareCaptureFrame(page, seconds) {
  await page.evaluate((time) => {
    document.documentElement.style.setProperty("--capture-time", `${time}s`);
    document.body.classList.add("capture");
    void document.body.offsetHeight;
  }, seconds);
}

async function loadPuppeteer() {
  try {
    return await import("puppeteer");
  } catch (error) {
    throw new Error(
      `Puppeteer is required for rendering. Run "npm install" first. Original error: ${error.message}`
    );
  }
}

export async function captureCarouselPdf(htmlPath, outputPath, config) {
  const puppeteer = await loadPuppeteer();
  const { width, height } = config.canvas;

  const browser = await puppeteer.launch({
    headless: "new",
    args: config.render.puppeteerLaunchArgs
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
    await page.waitForSelector(".stage-slide");

    await page.evaluate(async (mountDelayMs) => {
      if (document.fonts?.ready) await document.fonts.ready;
      if (typeof window.__carouselReady === "function") {
        await window.__carouselReady();
      }
      await new Promise((resolve) => setTimeout(resolve, mountDelayMs));
    }, config.render.mountDelayMs ?? 500);

    await page.pdf({
      path: outputPath,
      width: `${width}px`,
      height: `${height}px`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    return outputPath;
  } finally {
    await browser.close();
  }
}
