import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

async function run() {
  const scratchDir = "/Users/sarthakmehta/Documents/content creation project/motion-infographic-generator/scratch";
  await fs.mkdir(scratchDir, { recursive: true });

  const snapUrl = "https://www.freesoundslibrary.com/wp-content/uploads/2022/02/sound-of-finger-snap.mp3";
  const snapPath = path.join(scratchDir, "snap.mp3");
  const voicePath = path.join(scratchDir, "voice.mp3");
  const tempAiff = path.join(scratchDir, "voice.aiff");
  const mixedPath = path.join(scratchDir, "mixed.mp3");

  console.log("1. Downloading snap sound...");
  const response = await fetch(snapUrl);
  if (!response.ok) throw new Error("Failed to download snap sound");
  const buffer = await response.arrayBuffer();
  await fs.writeFile(snapPath, Buffer.from(buffer));
  console.log("Snap sound downloaded successfully.");

  console.log("2. Generating voiceover...");
  const text = "Stop creating 10 different variables for 10 related values...";
  await runCommand("say", ["-v", "Samantha", "-o", tempAiff, text]);
  await runCommand("ffmpeg", ["-y", "-i", tempAiff, "-c:a", "libmp3lame", "-q:a", "2", voicePath]);
  await fs.rm(tempAiff, { force: true });
  console.log("Voiceover generated.");

  console.log("3. Getting durations...");
  const snapDur = await getAudioDuration(snapPath);
  const voiceDur = await getAudioDuration(voicePath);
  console.log(`Snap Duration: ${snapDur}s, Voice Duration: ${voiceDur}s`);

  console.log("4. Mixing snap and voiceover...");
  // Mix snap starting at 0s, delay voiceover by 0.8s
  await runCommand("ffmpeg", [
    "-y",
    "-i", snapPath,
    "-i", voicePath,
    "-filter_complex", "[1:a]adelay=800|800[vo];[0:a][vo]amix=inputs=2:duration=longest[a]",
    "-map", "[a]",
    mixedPath
  ]);
  console.log("Mixed audio successfully generated at:", mixedPath);
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

function getAudioDuration(audioPath) {
  return new Promise((resolve, reject) => {
    const child = spawn("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      audioPath
    ]);
    let output = "";
    child.stdout.on("data", (data) => { output += data.toString(); });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(parseFloat(output.trim()));
      else reject(new Error(`ffprobe exited with code ${code}`));
    });
  });
}

run().catch(console.error);
