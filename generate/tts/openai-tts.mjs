import OpenAI from "openai";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path, { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", ".env") });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAudioWithOpenAI(script) {
  console.log("Generating audio with OpenAI");

  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "echo",
      input: script,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const audioPath = "public/voice/voice.mp3";

    await fs.promises.writeFile(audioPath, buffer);

    console.log("Audio file saved as voice.mp3");
  } catch (error) {
    console.error("Failed while generating audio with OpenAI", error);
  }
}
