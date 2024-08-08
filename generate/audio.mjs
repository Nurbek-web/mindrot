import dotenv from "dotenv";
import transcriptFunction from "./transcript.mjs";
import { writeFile } from "fs/promises";
import { existsSync } from "fs";
import { generateAudioUnrealSpeech } from "./tts/unrealspeech.mjs";
import { updateStatusVideo } from "./firebase.mjs";
import { generateAudioWithOpenAI } from "./tts/openai-tts.mjs";
import { generateAudioNeets } from "./tts/neets-tts.mjs";

dotenv.config();

export async function generateTranscriptAudio(
  topic,
  character,
  fps,
  duration,
  background,
  music,
  local,
  videoId,
  showImages
) {
  if (!local) {
    updateStatusVideo(videoId, "Generating transcript ...", 11);
  }

  let transcript = await transcriptFunction(topic, duration);
  console.log("Generated transcript:", transcript);

  if (!local) {
    updateStatusVideo(videoId, "Generating audio ...", 25);
  }

  // Generating audio
  console.log("Generating audio");
  // await generateAudioUnrealSpeech(transcript);
  // await generateAudioWithOpenAI(transcript);
  await generateAudioNeets(character, transcript);

  let videoFileName;
  do {
    const randomNum = Math.round(Math.random());
    videoFileName = `/background/${background}-${randomNum}.mp4`;
  } while (existsSync(videoFileName));

  const contextContent = `
import { fps, music, videoFileName } from './context';
export const music = ${
    music === "NONE" || music == undefined ? `'NONE'` : `'/music/${music}.MP3'`
  };
export const fps = ${fps};
export const videoFileName = '${videoFileName}';
export const showImages = ${showImages};
  `;

  console.log("Writing context file");
  await writeFile("src/tmp/context.tsx", contextContent, "utf-8");
  return transcript;
}
