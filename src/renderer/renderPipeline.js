import { promises as fs } from "node:fs";
import path from "node:path";
import { analyzeContent } from "../utils/contentAnalyzer.js";
import { loadContentFile } from "../utils/contentLoader.js";
import { ensureDir, resetDir, writeJson } from "../utils/fileSystem.js";
import { logger } from "../utils/logger.js";
import { planScenes } from "../utils/scenePlanner.js";
import { sceneDebugSummary, validateScenes } from "../utils/sceneValidator.js";
import { writeClipHtml } from "./htmlRenderer.js";
import { captureFrames, captureSceneScreenshots } from "./frameRenderer.js";
import { assertFfmpeg, combineMp4Clips, exportGif, exportGifFromVideo, exportMp4 } from "./videoExporter.js";
import { downloadSnapSound, generateTTS, measureAudioDuration, mixSnapAndVoiceover, transcodeIntroVideo } from "../utils/audioProcessor.js";

export async function renderContentFile(contentPath, config, mode = "both") {
  const content = await loadContentFile(contentPath);
  const analysis = analyzeContent(content.raw, content.path);
  const plannedScenes = planScenes(analysis, config);
  const { validScenes: scenes, errors, allScenes } = validateScenes(plannedScenes, config, logger);
  const outputDir = path.join(config.outputDir, content.name);
  await resetDir(outputDir);

  await writeJson(path.join(outputDir, "analysis.json"), analysis);
  await writeJson(path.join(outputDir, "scenes.json"), scenes);
  await writeJson(path.join(outputDir, "validation.json"), { errors, scenes: sceneDebugSummary(allScenes) });

  logger.info(`Planned ${scenes.length} clips`, { source: content.name });

  const htmlPaths = [];
  const mp4Paths = [];
  const gifPaths = [];
  const shouldExportMp4 = mode === "both" || mode === "mp4";
  const shouldExportGif = mode === "both" || mode === "gif";
  const shouldExportMp4Clips = shouldExportMp4 || shouldExportGif;
  const shouldCapture = shouldExportMp4 || shouldExportGif;
  const shouldExportClipGifs = mode === "gif" && config.output?.exportClipGifs === true;
  const maxGifClips = config.output.maxGifClips ?? scenes.length;

  if (shouldCapture) {
    await assertFfmpeg();
  }

  await ensureDir(path.join(outputDir, "mp4"));
  await ensureDir(path.join(outputDir, "gif"));

  const tempAudioDir = path.join(outputDir, "audio");
  await ensureDir(tempAudioDir);

  for (const scene of scenes) {
    let sceneAudioPath = null;
    const isVoEnabled = config.features?.voiceover?.enabled ?? false;

    if (isVoEnabled && scene.voiceoverText) {
      try {
        const voPath = path.join(tempAudioDir, `${scene.id}_vo.mp3`);
        await generateTTS(scene.voiceoverText, voPath, config.features?.voiceover?.voice || "Samantha");

        if (scene.type === "hook") {
          const snapPath = path.join(process.cwd(), "assets", "finger-snap.mp3");
          await downloadSnapSound(snapPath);
          const mixedPath = path.join(tempAudioDir, `${scene.id}_mixed.mp3`);
          await mixSnapAndVoiceover(snapPath, voPath, mixedPath, config.features?.voiceover?.delayMs ?? 800);
          sceneAudioPath = mixedPath;
        } else {
          sceneAudioPath = voPath;
        }

        const audioDuration = await measureAudioDuration(sceneAudioPath);
        const currentDuration = scene.duration ?? config.canvas.durationSeconds;
        scene.duration = Math.max(currentDuration, audioDuration + 0.5);
        logger.info(`Adjusted ${scene.id} duration to ${scene.duration}s based on audio length (${audioDuration}s)`);
      } catch (audioError) {
        logger.error(`Failed to process audio for ${scene.id}: ${audioError.message}. Proceeding with default duration.`);
      }
    } else if (scene.type === "hook") {
      try {
        const snapPath = path.join(process.cwd(), "assets", "finger-snap.mp3");
        await downloadSnapSound(snapPath);
        sceneAudioPath = snapPath;
        logger.info(`Using transition snap sound for ${scene.id} (voiceover disabled)`);
      } catch (audioError) {
        logger.error(`Failed to get snap sound for hook slide: ${audioError.message}`);
      }
    }

    logger.info(`Rendering ${scene.id}: ${scene.title}`);
    const htmlPath = await writeClipHtml(scene, config, outputDir);
    htmlPaths.push(htmlPath);

    const shouldCaptureScene = shouldExportMp4Clips || (shouldExportGif && scene.index <= maxGifClips);
    if (!shouldCapture || !shouldCaptureScene) continue;

    const framesDir = path.join(outputDir, "frames", scene.id);
    await captureFrames(htmlPath, framesDir, config, scene);

    if (shouldExportMp4Clips) {
      const mp4Path = path.join(outputDir, "mp4", `${scene.id.replace("clip-", "clip_")}.mp4`);
      await exportMp4(framesDir, mp4Path, config, sceneAudioPath);
      mp4Paths.push(mp4Path);
    }

    if (shouldExportClipGifs && scene.index <= maxGifClips) {
      const gifPath = path.join(outputDir, "gif", `${scene.id.replace("clip-", "gif_")}.gif`);
      await exportGif(framesDir, gifPath, config);
      gifPaths.push(gifPath);
    }

    if (!config.output.keepFrames) {
      await fs.rm(framesDir, { recursive: true, force: true });
    }
  }

  // Clean up temporary audio files if not configured to keep
  if (!config.output.keepFrames) {
    await fs.rm(tempAudioDir, { recursive: true, force: true }).catch(() => {});
  }

  let conformedIntroPath = null;
  const isIntroEnabled = config.features?.introVideo?.enabled ?? false;
  const introSrcPath = config.features?.introVideo?.path;

  if (shouldExportMp4Clips && mp4Paths.length && isIntroEnabled && introSrcPath) {
    try {
      const introFullPath = path.isAbsolute(introSrcPath) ? introSrcPath : path.join(process.cwd(), introSrcPath);
      await fs.access(introFullPath);
      conformedIntroPath = path.join(outputDir, "temp_intro_conformed.mp4");
      await transcodeIntroVideo(introFullPath, conformedIntroPath, config);
      mp4Paths.unshift(conformedIntroPath);
      logger.info(`Prepended conformed intro video to reel: ${conformedIntroPath}`);
    } catch (introError) {
      logger.error(`Could not process intro video: ${introError.message}`);
    }
  }

  let combinedReelPath = null;
  if (shouldExportMp4Clips && mp4Paths.length) {
    combinedReelPath = path.join(outputDir, "combined_reel.mp4");
    await combineMp4Clips(mp4Paths, combinedReelPath);
    if (conformedIntroPath) {
      await fs.rm(conformedIntroPath, { force: true }).catch(() => {});
    }
  }

  let combinedGifPath = null;
  if (shouldExportGif && combinedReelPath) {
    combinedGifPath = path.join(outputDir, "combined_reel.gif");
    await exportGifFromVideo(combinedReelPath, combinedGifPath, config);
    gifPaths.push(combinedGifPath);
  }

  if (!config.output.keepHtml && shouldCapture) {
    await fs.rm(path.join(outputDir, "html"), { recursive: true, force: true });
  }

  logger.success(`Finished ${content.name}`);

  return {
    source: content.path,
    outputDir,
    htmlPaths,
    mp4Paths,
    gifPaths,
    combinedReelPath,
    combinedGifPath,
    scenes
  };
}

export async function previewContentFile(contentPath, config) {
  return renderContentFile(contentPath, config, "html");
}

export async function debugContentFile(contentPath, config) {
  const content = await loadContentFile(contentPath);
  const analysis = analyzeContent(content.raw, content.path);
  const plannedScenes = planScenes(analysis, config);
  const { validScenes: scenes, errors, allScenes } = validateScenes(plannedScenes, config, logger);
  const outputDir = path.join(config.outputDir, "debug");
  await resetDir(outputDir);

  await writeJson(path.join(outputDir, "analysis.json"), analysis);
  await writeJson(path.join(outputDir, "scenes.json"), sceneDebugSummary(allScenes));
  await writeJson(path.join(outputDir, "validation.json"), { errors });
  await ensureDir(path.join(outputDir, "html"));

  for (const scene of scenes) {
    logger.info(`Debug screenshot ${scene.id}: ${scene.title}`);
    const htmlPath = await writeClipHtml(scene, config, outputDir);
    const debugTimes = debugCaptureTimes(scene, config);
    const scenePrefix = `scene_${String(scene.index).padStart(2, "0")}`;
    await captureSceneScreenshots(
      htmlPath,
      [
        {
          seconds: Math.max(0, (scene.duration ?? config.canvas.durationSeconds) - 0.05),
          outputPath: path.join(outputDir, `${scenePrefix}.png`)
        },
        ...debugTimes.map(({ label, seconds }) => ({
        seconds,
        outputPath: path.join(outputDir, `${scenePrefix}_${label}.png`)
      }))
      ],
      config
    );
  }

  logger.success(`Debug screenshots generated in ${outputDir}`);

  return {
    source: content.path,
    outputDir,
    scenes
  };
}

function debugCaptureTimes(scene, config) {
  const duration = scene.duration ?? config.canvas.durationSeconds;
  const captures = [0, 1, 2, 4, 6]
    .filter((seconds) => seconds < duration)
    .map((seconds) => ({
      label: `t${seconds}`,
      seconds: Math.max(0, Math.min(seconds, duration - 0.05))
    }));
  const finalLabel = `t${String(duration).replace(".", "_")}`;
  if (!captures.some((capture) => capture.label === finalLabel)) {
    captures.push({
      label: finalLabel,
      seconds: Math.max(0, duration - 0.05)
    });
  }
  return captures;
}

export async function analyzeContentFile(contentPath) {
  const content = await loadContentFile(contentPath);
  return analyzeContent(content.raw, content.path);
}
