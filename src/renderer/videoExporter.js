import { promises as fs } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { writeText } from "../utils/fileSystem.js";

export async function assertFfmpeg() {
  await run("ffmpeg", ["-version"], { quiet: true });
}

export async function exportMp4(framesDir, outputPath, config, audioPath = null) {
  const { fps, width, height } = config.canvas;
  const args = [
    "-y",
    "-framerate",
    String(fps),
    "-i",
    path.join(framesDir, "frame_%05d.png")
  ];

  if (audioPath) {
    args.push("-i", audioPath);
  } else {
    args.push("-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100");
  }

  args.push(
    "-vf",
    `scale=${width}:${height}:flags=lanczos,format=yuv420p`,
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "18",
    "-profile:v",
    "high",
    "-level:v",
    "4.0",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-ar",
    "44100",
    "-ac",
    "2",
    "-shortest",
    "-movflags",
    "+faststart",
    outputPath
  );

  await run("ffmpeg", args);
  return outputPath;
}

export async function exportGif(framesDir, outputPath, config) {
  const palettePath = path.join(path.dirname(outputPath), `${path.basename(outputPath, ".gif")}_palette.png`);
  const gifFps = config.output.gifFps;
  const gifWidth = config.output.gifWidth;

  await run("ffmpeg", [
    "-y",
    "-framerate",
    String(config.canvas.fps),
    "-i",
    path.join(framesDir, "frame_%05d.png"),
    "-vf",
    `fps=${gifFps},scale=${gifWidth}:-1:flags=lanczos,palettegen=max_colors=192`,
    palettePath
  ]);

  await run("ffmpeg", [
    "-y",
    "-framerate",
    String(config.canvas.fps),
    "-i",
    path.join(framesDir, "frame_%05d.png"),
    "-i",
    palettePath,
    "-lavfi",
    `fps=${gifFps},scale=${gifWidth}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3`,
    outputPath
  ]);

  await fs.rm(palettePath, { force: true });
  return outputPath;
}

export async function exportGifFromVideo(inputPath, outputPath, config) {
  const palettePath = path.join(path.dirname(outputPath), `${path.basename(outputPath, ".gif")}_palette.png`);
  const gifFps = config.output.gifFps;
  const gifWidth = config.output.gifWidth;

  await run("ffmpeg", [
    "-y",
    "-i",
    inputPath,
    "-vf",
    `fps=${gifFps},scale=${gifWidth}:-1:flags=lanczos,palettegen=max_colors=192`,
    palettePath
  ]);

  await run("ffmpeg", [
    "-y",
    "-i",
    inputPath,
    "-i",
    palettePath,
    "-lavfi",
    `fps=${gifFps},scale=${gifWidth}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3`,
    outputPath
  ]);

  await fs.rm(palettePath, { force: true });
  return outputPath;
}

export async function combineMp4Clips(clipPaths, outputPath) {
  if (clipPaths.length === 0) return null;

  const concatFile = path.join(path.dirname(outputPath), "concat.txt");
  const body = clipPaths.map((clipPath) => `file '${clipPath.replace(/'/g, "'\\''")}'`).join("\n");
  await writeText(concatFile, `${body}\n`);

  await run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", concatFile, "-c", "copy", outputPath]);
  await fs.rm(concatFile, { force: true });
  return outputPath;
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: options.quiet ? "ignore" : ["ignore", "inherit", "inherit"] });

    child.on("error", (error) => {
      reject(new Error(`${command} failed to start. Is it installed and available in PATH? ${error.message}`));
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code}`));
    });
  });
}
