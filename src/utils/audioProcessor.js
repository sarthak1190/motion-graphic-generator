import { promises as fs } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { ensureDir } from "./fileSystem.js";
import { logger } from "./logger.js";

// Ensure snap sound is available, download if missing
export async function downloadSnapSound(destPath) {
  await ensureDir(path.dirname(destPath));
  try {
    await fs.access(destPath);
    return destPath;
  } catch {
    logger.info("Snap sound effect not found. Downloading CC-BY 4.0 transition snap...");
    const snapUrl = "https://www.freesoundslibrary.com/wp-content/uploads/2022/02/sound-of-finger-snap.mp3";
    const response = await fetch(snapUrl);
    if (!response.ok) {
      throw new Error(`Failed to download snap sound effect: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    await fs.writeFile(destPath, Buffer.from(buffer));
    logger.success("Transition snap sound downloaded successfully.");
    return destPath;
  }
}

// Generate TTS audio clip using macOS say command
export async function generateTTS(text, outputPath, voice = "Samantha") {
  await ensureDir(path.dirname(outputPath));
  const tempAiff = outputPath.replace(/\.[a-zA-Z0-9]+$/, ".aiff");
  
  // Clean raw markdown bold formatting tags before speech
  const cleanText = text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\n/g, " ").trim();

  logger.info(`Generating voiceover: "${cleanText.substring(0, 50)}..."`);
  
  // 1. Speak to uncompressed AIFF using macOS native TTS engine
  await runCommand("say", ["-v", voice, "-o", tempAiff, cleanText]);
  
  // 2. Compress AIFF to standard MP3 using FFmpeg
  await runCommand("ffmpeg", ["-y", "-i", tempAiff, "-c:a", "libmp3lame", "-q:a", "2", outputPath]);
  
  // 3. Clean up temp aiff
  await fs.rm(tempAiff, { force: true });
  return outputPath;
}

// Query audio clip duration using ffprobe
export async function measureAudioDuration(audioPath) {
  const output = await runCommandWithOutput("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    audioPath
  ]);
  const duration = parseFloat(output.trim());
  if (Number.isNaN(duration)) {
    throw new Error(`Failed to parse duration from ffprobe output: "${output}"`);
  }
  return duration;
}

// Mix transition snap and delayed voiceover track using FFmpeg filters
export async function mixSnapAndVoiceover(snapPath, voPath, outputPath, delayMs = 800) {
  await ensureDir(path.dirname(outputPath));
  logger.info(`Mixing transition snap with voiceover (delayed by ${delayMs}ms)...`);
  
  // Delay the voiceover channel(s) and mix them with the snap sound
  await runCommand("ffmpeg", [
    "-y",
    "-i", snapPath,
    "-i", voPath,
    "-filter_complex", `[1:a]adelay=${delayMs}|${delayMs}[vo];[0:a][vo]amix=inputs=2:duration=longest[a]`,
    "-map", "[a]",
    outputPath
  ]);
  
  return outputPath;
}

// Transcode intro video to matching H.264 baseline for safe concatenation
export async function transcodeIntroVideo(srcPath, destPath, config) {
  await ensureDir(path.dirname(destPath));
  const { fps, width, height } = config.canvas;
  
  logger.info(`Transcoding intro video ${srcPath} to match reel format...`);
  
  await runCommand("ffmpeg", [
    "-y",
    "-i", srcPath,
    "-vf", `scale=${width}:${height}:flags=lanczos,format=yuv420p`,
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "22",
    "-r", String(fps),
    "-c:a", "aac",
    "-ar", "44100",
    "-ac", "2",
    destPath
  ]);
  
  return destPath;
}

// Helper to spawn processes safely
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "ignore" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} failed with exit code ${code}`));
    });
  });
}

// Helper to spawn processes and capture stdout
function runCommandWithOutput(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    let stdout = "";
    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`${command} failed with exit code ${code}`));
    });
  });
}
